# CI/CD DevSecOps Pipelines

All microservices are validated and built using automated **GitHub Actions** workflows with identical 5-stage DevSecOps standards.

```text
GitHub Push
   │
   ├── 1. SECURITY — SECRET SCANNING (Gitleaks)
   │
   ├── 2. SECURITY — SAST (Semgrep)
   │
   ├── 3. QUALITY — BUILD & TEST (Maven / Angular / PyTest)
   │
   ├── 4. CONTAINER — BUILD & SECURITY SCAN (Trivy)
   │
   └── 5. PUBLISH — GHCR (Push image to ghcr.io)
             │
             ▼
        ArgoCD GitOps Sync to Kubernetes
```

## Pipeline Stages

1. **Secret Scanning (Gitleaks)**: Scans every commit for leaked credentials, API tokens, and private keys. SARIF report uploaded to GitHub Security tab.
2. **SAST Analysis (Semgrep)**: Static application security testing for OWASP Top 10 vulnerabilities.
3. **Build & Automated Testing**:
   - Backend: Maven test execution against a live PostgreSQL 16 container service.
   - Frontend: Headless Chrome unit testing via Karma / Angular CLI.
   - AI Advisor: Python dependency and compilation validation.
4. **Container Build & Trivy Scan**: Builds local image and executes vulnerability scanning. CRITICAL CVEs fail the pipeline.
5. **Publish to GHCR**: Authenticates to GitHub Container Registry and publishes verified image tags (`sha-<commit>` and `latest`).
