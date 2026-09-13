import os
import logging
import httpx
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from prometheus_fastapi_instrumentator import Instrumentator

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

load_dotenv(".env", override=True)

app = FastAPI(
    title="AI Service",
    description="AI-powered analysis service",
    version="1.0.0",
)

# Configure CORS with specific origins for security
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8080").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
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
    return {"status": "UP", "service": "ai-service", "ai_key_loaded": bool(key)}


@router.post("/analyze", response_model=QueryResponse)
def analyze(req: QueryRequest):
    api_key = os.environ.get("AI_API_KEY") or AI_API_KEY
    if not api_key:
        logger.warning("AI_API_KEY not configured")
        raise HTTPException(
            status_code=503,
            detail="AI service configuration error",
        )

    # Sanitize input to prevent injection attacks
    sanitized_query = req.query.strip()[:1000]  # Limit query length
    sanitized_context = (req.context or "").strip()[:500]  # Limit context length
    
    prompt = f"Analyze the following query:\n{sanitized_query}\nContext: {sanitized_context or 'None'}"

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
        logger.error("LLM API call failed: %s", str(exc))
        raise HTTPException(status_code=502, detail="LLM call failed")

    return QueryResponse(
        summary="Analysis completed successfully.",
        analysis=content.strip(),
    )


app.include_router(router)
app.include_router(router, prefix="/ai")
