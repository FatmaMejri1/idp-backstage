# Observability & Monitoring

The IDP observability stack is based on **kube-prometheus-stack**, **Grafana**, and **Loki**.

## Monitoring Components

| Component | Port | Host Access | Description |
|---|---|---|---|
| **Grafana** | 3000 / 80 | `http://localhost:3300` | Metric visualization and alerting dashboards |
| **Prometheus** | 9090 | `http://localhost:9090` (via port-forward) | Time-series metrics collection and evaluation |
| **Alertmanager** | 9093 | Cluster-internal | Alert routing to Discord and Backstage webhook |
| **Loki** | 3100 | Cluster-internal | Centralized log aggregation |

## ServiceMonitors

All CRM services are automatically scraped by Prometheus via Kubernetes `ServiceMonitor` CRDs:

1. `crm-backend`: Scrapes `/actuator/prometheus` on port `http` (8080) every 15s.
2. `crm-frontend`: Scrapes `/metrics` on port `metrics` (9113) every 15s.
3. `crm-postgres`: Scrapes `/metrics` from `postgres_exporter` (9187) every 15s.
4. `crm-ai-advisor`: Scrapes `/metrics` from FastAPI instrumentator (8001) every 15s.

## Grafana Dashboards

ConfigMaps labeled `grafana_dashboard: "1"` in namespace `monitoring` are auto-imported into Grafana:

- **CRM — Backend**: JVM memory, CPU, HTTP throughput, p95/p99 latency, error rates.
- **CRM — Frontend**: Nginx active connections, requests per second, HTTP response codes.
- **CRM — PostgreSQL**: Active database connections, cache hit ratio, transaction throughput.
- **CRM — AI Advisor**: Overview stats, endpoint latency (p50/p95/p99), 5xx error tracking, advice rate.

## Alerting Rules

Prometheus alert rules are configured in `crm-alert-rules`:

- **Down Alerts**: `CRMFrontendDown`, `CRMBackendDown`, `CRMPostgreSQLDown`, `CRMAIAdvisorDown`
- **Performance Alerts**: `CRMBackendHighLatency` (>1s), `CRMAIAdvisorHighLatency` (>30s)
- **Error Alerts**: `CRMBackendHigh5xxRate` (>5%), `CRMAIAdvisorHigh5xxRate` (>5%)
- **Kubernetes Alerts**: `CRMPodRestarting`, `CRMFrontendPodNotReady`, `CRMBackendPodNotReady`, `CRMAIAdvisorPodNotReady`
