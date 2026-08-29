# Runbook

## CRMBackendDown fires

1. Check pod status: `kubectl get pods -n default -l app=crm-backend`
2. Check logs: `kubectl logs -n default deploy/crm-backend --tail 50`
3. Check recent deployments: `kubectl rollout history deployment/crm-backend -n default`

## CRMPostgreSQLHighConnections fires

Check active connections and slow queries:
```bash
kubectl exec -n default deploy/crm-backend -- true  # confirm backend reachable
```
Review `hikaricp_connections_active` in the CRM Backend Grafana dashboard.

## Backend restarting frequently (CRMPodRestarting)

Check for OOMKilled or crash loops:
```bash
kubectl describe pod -n default -l app=crm-backend | grep -A5 "Last State"
```
