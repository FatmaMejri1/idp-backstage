# CI/CD Pipeline

Each of `crm-backend` and `crm-frontend` has its own GitHub Actions workflow with 4 stages:

1. **Secret scan** (Gitleaks) — blocking
2. **SAST** (Semgrep) — blocking
3. **Test** — unit tests, Postgres service container for backend
4. **Build, Scan & Push** — Docker build → Trivy scan (blocking on CRITICAL/HIGH) → push to GHCR only if the scan passes

Images: `ghcr.io/fatmamejri1/crm-backend`, `ghcr.io/fatmamejri1/crm-frontend`, tagged `:latest` and `:<commit-sha>`.
