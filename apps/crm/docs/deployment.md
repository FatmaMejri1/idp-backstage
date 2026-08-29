# Deployment

The CRM is deployed via a Helm chart (`apps/crm/crm-chart`) and managed through ArgoCD's GitOps sync.

## Local development

```bash
kind create cluster --config infra/kind/kind-config.yaml
helm install crm apps/crm/crm-chart
```

## GitOps flow

Any push to `main` touching `apps/crm/crm-chart/**` is automatically picked up by ArgoCD (`crm-app` Application) and synced to the cluster — no manual `helm upgrade` needed.

## Ingress

The app is reachable at `http://crm.local` once `127.0.0.1 crm.local` is added to `/etc/hosts`.
