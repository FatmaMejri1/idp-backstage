# Observability

## Metrics

- **Backend**: Spring Boot Actuator + Micrometer, scraped via a `ServiceMonitor` at `/actuator/prometheus`
- **Database**: `postgres_exporter` sidecar, port `9187`
- **Frontend**: `nginx-prometheus-exporter` sidecar, port `9113`

Dashboards: Grafana, tagged `crm` — CRM Backend, CRM Database, CRM Frontend.

## Logs

Centralized via Loki + Promtail. Query in Grafana Explore:

```log
{namespace="default", pod=~"crm-backend-.*"}
```

## Alerts

Defined in `crm-alert-rules` (`PrometheusRule`), routed via Alertmanager to:
- **Discord** (`#alerts`) — all `critical`/`warning` alerts
- **PagerDuty** — `critical` alerts only

See [Runbook](runbook.md) for what to do when an alert fires.
