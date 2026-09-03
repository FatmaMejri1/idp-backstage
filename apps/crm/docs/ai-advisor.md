# CRM AI Advisor Microservice

The **CRM AI Advisor** (`crm-ai-advisor`) is a Python microservice built with **FastAPI** that provides automated sales recommendations for CRM deals using **Google Gemini**.

## Architecture & Responsibilities

- Analyzes commercial opportunities (Client name, Deal amount in DT, Deal status, Notes).
- Crafts structured prompts sent to the Gemini API (`gemini-flash-lite-latest`).
- Parses and formats the response into a concise summary and recommended commercial action.
- Exposes Prometheus instrumentation at `/metrics` for real-time latency and error tracking.

## API Endpoints

### 1. Health Probe (`GET /health` or `GET /ai/health`)
Returns service liveness status and verifies if the AI API key is configured.

```json
{
  "status": "UP",
  "ai_key_loaded": true
}
```

### 2. Prometheus Metrics (`GET /metrics`)
Exposes standard Prometheus metrics instrumented via `prometheus-fastapi-instrumentator`.

### 3. Commercial Advice (`POST /advise-opportunity` or `POST /ai/advise-opportunity`)

**Request Payload:**
```json
{
  "client_name": "Société Tunisienne de Banque",
  "montant": 45000.0,
  "statut": "NEGOCIATION",
  "notes": "Le client hésite sur les conditions de paiement à 60 jours."
}
```

**Response Payload:**
```json
{
  "summary": "Négociation en cours avec STB pour 45 000 DT avec blocage sur les délais de paiement.",
  "recommendation": "Proposer un échéancier en deux tranches (50% comptant, 50% à 60 jours) avec une remise de 2%."
}
```

## Configuration & Secrets

The service is configured via environment variables injected from the Kubernetes secret `crm-ai-advisor-secret`:

| Variable | Description | Default |
|---|---|---|
| `AI_API_KEY` | Google Gemini API Key | Required |
| `AI_API_BASE_URL` | OpenAI-compatible base URL | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| `AI_MODEL` | Gemini model name | `gemini-flash-lite-latest` |
| `PORT` | Listening port | `8001` |
