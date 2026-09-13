# ${{ values.name }}

${{ values.description }}

## Overview

This application was generated from the **Golden Path** template and follows platform engineering best practices.

## Architecture

| Component    | Technology               |
|--------------|--------------------------|
| Frontend     | Angular (Nginx container)|
| Backend      | Spring Boot (Java 17)    |
| AI Service   | FastAPI + Gemini         |
| Database     | PostgreSQL 16            |
| Container    | Docker / GHCR            |
| Deploy       | Helm + ArgoCD            |
| Observability| Prometheus + Grafana     |
| On-Call      | PagerDuty                |

## Getting Started

### Local Development

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install && npm start

# AI Service
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### AI Service Environment Variables

| Variable         | Description                     | Default                                           |
|------------------|---------------------------------|---------------------------------------------------|
| `AI_API_KEY`     | Gemini API key                  | *(required)*                                      |
| `AI_API_BASE_URL`| Base URL for Gemini OpenAI compat | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| `AI_MODEL`       | Model name                      | `gemini-flash-lite-latest`                        |

### Kubernetes Deployment

The application is deployed automatically via GitOps (ArgoCD) when changes are merged to `main`.

```bash
kubectl get pods -l app.kubernetes.io/name=${{ values.name }}
```

## CI/CD Pipelines

| Workflow              | Trigger                        |
|-----------------------|--------------------------------|
| `frontend-ci.yml`     | Changes in `frontend/`         |
| `backend-ci.yml`      | Changes in `backend/`          |
| `ai-service-ci.yml`   | Changes in `ai-service/`       |

Each pipeline runs: Secret Scan → SAST → Build/Test → Container Build → Trivy Scan → GHCR Publish.

## Monitoring

- **Grafana Dashboard**: Available via the Backstage portal
- **Prometheus Alerts**: Configured via `PrometheusRule` CRD
- **AI Metrics**: `/metrics` endpoint on the AI service

## On-Call

This service is registered in PagerDuty. The `pagerduty.com/service-id` annotation in `catalog-info.yaml` is set automatically by the Golden Path template.
