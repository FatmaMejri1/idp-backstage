import os
import logging
import httpx
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from prometheus_fastapi_instrumentator import Instrumentator

logger = logging.getLogger("${{ values.name }}")

load_dotenv(".env", override=True)

app = FastAPI(
    title="${{ values.name }}",
    description="${{ values.description }}",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expose Prometheus metrics at /metrics
Instrumentator().instrument(app).expose(app)

AI_API_KEY = os.environ.get("AI_API_KEY", "")
AI_API_BASE_URL = os.environ.get("AI_API_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")
AI_MODEL = os.environ.get("AI_MODEL", "gemini-flash-lite-latest")


class QueryRequest(BaseModel):
    query: str
    context: str | None = None


class QueryResponse(BaseModel):
    summary: str
    analysis: str


router = APIRouter()


@router.get("/health")
def health():
    key = os.environ.get("AI_API_KEY") or AI_API_KEY
    return {"status": "UP", "service": "${{ values.name }}", "ai_key_loaded": bool(key)}


@router.post("/analyze", response_model=QueryResponse)
def analyze(req: QueryRequest):
    api_key = os.environ.get("AI_API_KEY") or AI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI_API_KEY not configured.",
        )

    prompt = f"Analyze the following query:\n{req.query}\nContext: {req.context or 'None'}"

    try:
        response = httpx.post(
            f"{AI_API_BASE_URL}chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": AI_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {exc}")

    return QueryResponse(
        summary="Analysis completed successfully.",
        analysis=content.strip(),
    )


app.include_router(router)
app.include_router(router, prefix="/ai")
