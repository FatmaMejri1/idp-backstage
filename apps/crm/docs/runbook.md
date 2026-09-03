# Platform Operations Runbook

## Daily Operations & Useful Commands

### Check Microservice Status
```bash
kubectl get pods -n default -l app.kubernetes.io/name=crm
kubectl get svc -n default -l app.kubernetes.io/name=crm
```

### Inspect Ingress & Routes
```bash
kubectl get ingress -n default
curl -i http://crm.local/ai/health
```

### Check Logs with kubectl or Loki
```bash
# AI Advisor logs
kubectl logs -n default -l app=crm-ai-advisor --tail=50 -f

# Backend logs
kubectl logs -n default -l app=crm-backend --tail=50 -f
```

### Force ArgoCD Manual Sync
```bash
kubectl get application crm-app -n argocd -o yaml
```

### Restart a Service
```bash
kubectl rollout restart deployment crm-ai-advisor -n default
kubectl rollout status deployment crm-ai-advisor -n default
```
