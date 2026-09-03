import os
import logging
import httpx
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

logger = logging.getLogger("crm-ai-advisor")

load_dotenv(".env", override=True)

app = FastAPI(title="crm-ai-advisor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AI_API_KEY = os.environ.get("AI_API_KEY", "")
AI_API_BASE_URL = os.environ.get("AI_API_BASE_URL", "https://api.openai.com/v1")
AI_MODEL = os.environ.get("AI_MODEL", "gemini-flash-lite-latest")


class Opportunity(BaseModel):
    client_name: str
    montant: float
    statut: str
    notes: str | None = None


class AdviceResponse(BaseModel):
    summary: str
    recommendation: str


router = APIRouter()


@router.get("/health")
def health():
    key = os.environ.get("AI_API_KEY") or AI_API_KEY
    return {"status": "UP", "ai_key_loaded": bool(key)}


@router.post("/advise-opportunity", response_model=AdviceResponse)
def advise_opportunity(opportunity: Opportunity):
    api_key = os.environ.get("AI_API_KEY") or AI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI_API_KEY non configurée sur ce service (Secret Kubernetes manquant ou vide).",
        )

    base_url = os.environ.get("AI_API_BASE_URL") or AI_API_BASE_URL
    model = os.environ.get("AI_MODEL") or AI_MODEL

    prompt = (
        f"Voici une opportunité commerciale CRM :\n"
        f"- Client : {opportunity.client_name}\n"
        f"- Montant : {opportunity.montant} DT\n"
        f"- Statut : {opportunity.statut}\n"
        f"- Notes : {opportunity.notes or 'aucune'}\n\n"
        f"Réponds exactement avec ce format :\n"
        f"**Résumé :** une seule phrase résumant la situation.\n"
        f"**Action recommandée :** une seule phrase indiquant la prochaine action commerciale.\n"
        f"N'ajoute aucun autre texte."
    )

    try:
        response = httpx.post(
            f"{base_url}chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4,
            },
            timeout=60.0,
        )
        logger.info("OpenAI response status=%s", response.status_code)
        logger.info("AI response body=%s", response.text)

        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Appel à l'API IA échoué : {exc}")

    content = content.strip()

    rec_marker = None
    for marker in [
        "**Action recommandée :**",
        "**Action recommandée:**",
        "**Prochaine action recommandée :**",
        "**Prochaine action recommandée:**",
        "Action recommandée :",
        "Action recommandée:",
    ]:
        if marker in content:
            rec_marker = marker
            break

    if rec_marker:
        summary_part, recommendation_part = content.split(rec_marker, 1)
        summary = (
            summary_part.replace("**Résumé :**", "")
            .replace("**Résumé:**", "")
            .replace("Résumé :", "")
            .replace("Résumé:", "")
            .strip()
        )
        recommendation = recommendation_part.strip()
    else:
        parts = content.split("\n", 1)
        summary = (
            parts[0]
            .replace("**Résumé :**", "")
            .replace("**Résumé:**", "")
            .replace("Résumé :", "")
            .replace("Résumé:", "")
            .strip()
        )
        recommendation = parts[1].strip() if len(parts) > 1 else ""

    return AdviceResponse(summary=summary, recommendation=recommendation)


app.include_router(router)
app.include_router(router, prefix="/ai")