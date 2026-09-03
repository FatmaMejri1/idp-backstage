# Deployment & GitOps

The platform utilizes declarative **GitOps** powered by **ArgoCD**.

## GitOps Principles

1. **Single Source of Truth**: Helm chart located in `apps/crm/crm-chart/` defines all desired Kubernetes states.
2. **Automated Reconciliation**: ArgoCD continuously compares cluster state against `main` branch.
3. **Self-Healing**: Manual changes made directly with `kubectl` are automatically reverted to match Git.

## Helm Chart Structure

```text
apps/crm/crm-chart/
├── Chart.yaml
├── values.yaml
├── dashboards/
│   ├── crm-backend-dashboard.json
│   ├── crm-frontend-dashboard.json
│   ├── crm-postgres-dashboard.json
│   └── crm-ai-advisor-dashboard.json
└── templates/
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── backend-servicemonitor.yaml
    ├── backend-grafana-dashboard.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── frontend-servicemonitor.yaml
    ├── frontend-grafana-dashboard.yaml
    ├── ai-advisor-deployment.yaml
    ├── ai-advisor-service.yaml
    ├── ai-advisor-servicemonitor.yaml
    ├── ai-advisor-grafana-dashboard.yaml
    ├── postgres-deployment.yaml
    ├── postgres-service.yaml
    ├── postgres-servicemonitor.yaml
    ├── postgres-grafana-dashboard.yaml
    ├── ingress.yaml
    └── crm-alert-rules.yaml
```
