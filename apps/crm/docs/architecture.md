# System Architecture

The CRM platform runs in a local multi-node **Kubernetes (Kind)** cluster managed via **ArgoCD GitOps** and integrated into the **Backstage Internal Developer Portal**.

```mermaid
flowchart TD
    subgraph Development
        Dev([Developer]) -->|git push| Repo[(GitHub Repo: idp-backstage)]
    end

    subgraph CI ["GitHub Actions (CI/CD)"]
        Repo --> Gitleaks[1. Secret Scan: Gitleaks]
        Gitleaks --> SAST[2. SAST: Semgrep]
        SAST --> Test[3. Unit & Integration Tests]
        Test --> Trivy[4. Container Build & Trivy Scan]
        Trivy --> GHCR[5. Publish: GitHub Container Registry]
    end

    subgraph GitOps ["GitOps Reconciliation"]
        Repo -.->|Watch Helm Chart| ArgoCD[ArgoCD Controller]
        GHCR -.->|Deploy Image| ArgoCD
        ArgoCD -->|Sync State| K8s[Kind Kubernetes Cluster]
    end

    subgraph IngressLayer ["Ingress & Routing"]
        K8s --> NginxIngress[Ingress Nginx Controller]
    end

    subgraph Services ["Application Pods"]
        NginxIngress -->|/| FrontendPod[crm-frontend:80]
        NginxIngress -->|/api| BackendPod[crm-backend:8080]
        NginxIngress -->|/ai| AIPod[crm-ai-advisor:8001]
        BackendPod --> PostgresPod[(crm-postgres:5432)]
        AIPod --> GeminiCloud[[Google Gemini AI API]]
    end

    subgraph Observability ["Observability Stack"]
        Prometheus[Prometheus] -->|Scrape /metrics| FrontendPod
        Prometheus -->|Scrape /actuator/prometheus| BackendPod
        Prometheus -->|Scrape /metrics| AIPod
        Prometheus -->|Scrape /metrics| PostgresPod
        Prometheus --> Grafana[Grafana Dashboards :30300]
        Promtail[Promtail] --> Loki[Loki Log Aggregator]
    end
```

## Network Paths & Ingress Rules

The cluster ingress is managed by `ingress-nginx` listening on host port 80:

- `http://crm.local/` → Routes to `crm-frontend` Service (port 80)
- `http://crm.local/api/*` → Routes to `crm-backend` Service (port 8080)
- `http://crm.local/ai/*` → Routes to `crm-ai-advisor` Service (port 8001)
- `http://crm.local/ai/docs` → FastAPI Swagger interactive documentation
