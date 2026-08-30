# ${{ values.name }}

${{ values.description }}

## Overview

This service was generated from the **Golden Path** template and follows platform engineering best practices.

## Architecture

| Component | Technology |
|-----------|------------|
| Backend   | Spring Boot (Java) |
| Frontend  | Angular |
| Database  | PostgreSQL |
| Container | Docker |
| Deploy    | Helm + ArgoCD |
| Observability | Prometheus + Grafana |

## Getting Started

### Local Development

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install && npm start
```

### Kubernetes Deployment

The service is deployed automatically via GitOps (ArgoCD) when changes are merged to `main`.

```bash
kubectl get pods -l app.kubernetes.io/name=${{ values.name }}
```

## Monitoring

- **Grafana Dashboard**: Available via the Backstage portal
- **Prometheus Alerts**: Configured via `PrometheusRule` CRD
- **Logs**: Available in Loki via Grafana Explore

## On-Call

This service is registered in PagerDuty. Update the `pagerduty.com/service-id` annotation in `catalog-info.yaml` with the real service ID.

## Ownership

- **Owner**: ${{ values.owner }}
- **System**: ${{ values.name }}-system
