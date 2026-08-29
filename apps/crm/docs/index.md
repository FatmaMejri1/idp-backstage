# CRM Platform

The CRM is a full-stack demo application (Angular frontend, Spring Boot backend, PostgreSQL database) used as the "golden path" reference implementation for this Internal Developer Platform.

## Architecture

- **Frontend**: Angular, served via nginx, reverse-proxies `/api/*` to the backend
- **Backend**: Spring Boot, exposes REST endpoints and Prometheus metrics via Actuator
- **Database**: PostgreSQL, instrumented with `postgres_exporter`

## Quick links

- [Deployment](deployment.md)
- [Observability](observability.md)
- [CI/CD Pipeline](cicd.md)
- [Runbook](runbook.md)
