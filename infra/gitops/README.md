# Phase 6 — GitOps Deployment with ArgoCD

This document covers every step, command, and configuration file introduced in Phase 6 of the IDP project. The goal of this phase is to implement a **GitOps workflow** using [ArgoCD](https://argo-cd.readthedocs.io/), satisfying requirement **BF-05** of the project specification.

---

## 📖 What is GitOps?

GitOps is a deployment practice where **Git is the single source of truth** for the desired state of your infrastructure. Instead of running `kubectl apply` or `helm install` manually, you:
1. Push a change to a Git repository.
2. A GitOps operator (ArgoCD) **automatically detects** the change.
3. ArgoCD **reconciles** the cluster to match the desired state in Git.

This gives you full traceability: every deployment is tied to a Git commit (requirement **BNF-03**).

---

## 🗂 Files Created

```
infra/
├── argocd/
│   └── install.sh               # Script to install ArgoCD on the cluster
└── gitops/
    └── crm-application.yaml     # ArgoCD Application manifest for the CRM app

.github/
└── workflows/
    └── deploy.yml               # GitHub Actions workflow (Backstage trigger)
```

---

## Step 1 — Create the Directory Structure

```bash
mkdir -p /home/fatma/projects/idp-backstage/infra/argocd
mkdir -p /home/fatma/projects/idp-backstage/infra/gitops
```

**Why:** We organize GitOps infrastructure separately from the Kind infrastructure for clarity and maintainability.

---

## Step 2 — Install ArgoCD (`infra/argocd/install.sh`)

```bash
#!/bin/bash

# Create the dedicated ArgoCD namespace
kubectl create namespace argocd

# Apply the official stable ArgoCD manifests from the official GitHub repository.
# This installs all required CRDs, deployments, services, RBAC rules, and network policies.
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "ArgoCD installation initiated."
echo "Wait for the pods to be ready: kubectl get pods -n argocd"
echo "To access the UI, run: kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "The default password is the name of the argocd-initial-admin-secret server pod, or you can retrieve it with:"
echo "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath=\"{.data.password}\" | base64 -d; echo"
```

**To execute:**
```bash
chmod +x infra/argocd/install.sh
./infra/argocd/install.sh
```

**What this does:**
- Creates the `argocd` Kubernetes namespace.
- Installs all ArgoCD components: the application controller, repo server, API server, Redis cache, Dex (SSO), and the ApplicationSet controller.
- Sets up all required RBAC permissions and network policies.

---

## Step 3 — Create the ArgoCD Application Manifest (`infra/gitops/crm-application.yaml`)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: crm-app
  namespace: argocd
spec:
  project: default
  source:
    # The remote Git repository ArgoCD will watch
    repoURL: 'https://github.com/FatmaMejri1/idp-backstage.git'
    # The branch to track
    targetRevision: main
    # The relative path inside the repo containing the Helm chart
    path: apps/crm/crm-chart
  destination:
    # The cluster to deploy to (in-cluster means the same cluster ArgoCD runs in)
    server: 'https://kubernetes.default.svc'
    # The target Kubernetes namespace for the CRM app
    namespace: default
  syncPolicy:
    automated:
      # Automatically delete resources that exist in the cluster but not in Git
      prune: true
      # Automatically revert any manual changes made directly to the cluster
      selfHeal: true
    syncOptions:
      # Create the destination namespace if it doesn't exist
      - CreateNamespace=true
```

**To apply:**
```bash
kubectl apply -f infra/gitops/crm-application.yaml
```

**What this does:**
- Registers the CRM application with ArgoCD.
- Tells ArgoCD to monitor the `apps/crm/crm-chart` Helm chart in the `main` branch.
- Enables **automated sync** with pruning and self-healing, which means the cluster state always stays in sync with Git — no manual `helm upgrade` needed.

---

## Step 4 — Create the GitHub Actions Deploy Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy CRM via GitOps

on:
  workflow_dispatch:
    inputs:
      serviceName:
        description: 'Name of the service to deploy (e.g. crm-backend, crm-frontend)'
        required: true
        default: 'crm-backend'
      imageTag:
        description: 'Tag of the image to deploy (e.g. latest, v1.0.1)'
        required: true
        default: 'latest'

permissions:
  contents: write

jobs:
  gitops-sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Update Helm image tag
        run: |
          python3 scripts/update_helm_image_tag.py \
            apps/crm/crm-chart/values.yaml \
            "${{ github.event.inputs.serviceName }}" \
            "${{ github.event.inputs.imageTag }}"

      - name: Commit and push GitOps change
        run: |
          git config user.name 'github-actions[bot]'
          git config user.email 'github-actions[bot]@users.noreply.github.com'
          git add apps/crm/crm-chart/values.yaml
          if git diff --staged --quiet; then
            echo "No Helm values change to commit"
            exit 0
          fi
          git commit -m "gitops: set ${{ github.event.inputs.serviceName }} tag to ${{ github.event.inputs.imageTag }} [skip ci]"
          git push
```

**What this does:**
- Provides a `workflow_dispatch` trigger, meaning this pipeline can be launched **on-demand** from the GitHub Actions UI, or from Backstage.
- The workflow accepts two parameters: `serviceName` and `imageTag`.
- `scripts/update_helm_image_tag.py` writes the new tag under `backend.image.tag` or `frontend.image.tag` in `values.yaml`, then pushes the commit.
- ArgoCD detects this new commit and automatically deploys the new image to the cluster — **no manual intervention needed**.

Run the contract tests for this flow:

```bash
python3 -m unittest discover -s tests -v
```

---

## Step 5 — Fix: ArgoCD repo-server Liveness Probe Timeout

On resource-constrained `kind` clusters, the `argocd-repo-server` pod is killed repeatedly because its health check times out before the pod is ready.

**Diagnosis command:**
```bash
kubectl describe pod argocd-repo-server-<pod-id> -n argocd | tail -30
```

**Output showing the problem:**
```
Warning  Unhealthy  35s (x18 over 11m)  kubelet  spec.containers{argocd-repo-server}: Liveness probe failed: Get "http://...": context deadline exceeded
```

**Fix — Patch the liveness probe to be more tolerant:**
```bash
kubectl patch deployment argocd-repo-server -n argocd --type='json' -p='[
  {"op": "replace", "path": "/spec/template/spec/containers/0/livenessProbe/initialDelaySeconds", "value": 120},
  {"op": "replace", "path": "/spec/template/spec/containers/0/livenessProbe/timeoutSeconds", "value": 10},
  {"op": "replace", "path": "/spec/template/spec/containers/0/livenessProbe/failureThreshold", "value": 10}
]'

# Wait for the rollout to complete
kubectl rollout status deployment argocd-repo-server -n argocd --timeout=120s
```

**What each parameter does:**
| Parameter | Original | Patched | Explanation |
|---|---|---|---|
| `initialDelaySeconds` | 10s | 120s | Wait 2 minutes before first health check |
| `timeoutSeconds` | 1s | 10s | Allow up to 10 seconds per health check |
| `failureThreshold` | 3 | 10 | Allow 10 failures before restarting the pod |

---

## Step 6 — Fix: Enable ArgoCD HTTP Mode (Insecure)

By default, ArgoCD serves its UI over HTTPS with a self-signed certificate, which browsers often block for local development. We switched it to plain HTTP.

```bash
# Patch the ArgoCD config to enable insecure (HTTP) mode
kubectl patch configmap argocd-cmd-params-cm -n argocd \
  --type merge \
  -p '{"data":{"server.insecure":"true"}}'

# Restart the server to pick up the new configuration
kubectl rollout restart deployment argocd-server -n argocd

# Wait for the rollout to complete
kubectl rollout status deployment argocd-server -n argocd --timeout=90s
```

**Port-forward command (for HTTP):**
```bash
# Map local port 8080 to the service's HTTP port (80)
kubectl port-forward svc/argocd-server -n argocd 8080:80
```

Then open the UI in your browser: **http://localhost:8080**

**Retrieve the admin password:**
```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo
```

---

## Step 7 — Fix: Add GitHub Repository Credentials

Since the repository `FatmaMejri1/idp-backstage` is **private**, ArgoCD needs a GitHub Personal Access Token (PAT) to clone it.

**Step 7a — Create a Kubernetes Secret with your PAT:**
```bash
kubectl create secret generic argocd-repo-creds \
  --from-literal=type=git \
  --from-literal=url=https://github.com/FatmaMejri1/idp-backstage.git \
  --from-literal=username=FatmaMejri1 \
  --from-literal=password=<YOUR_GITHUB_PAT> \
  -n argocd
```

> ⚠️ Replace `<YOUR_GITHUB_PAT>` with a token that has the `repo` scope.

**Step 7b — Label the secret so ArgoCD recognizes it:**
```bash
kubectl label secret argocd-repo-creds \
  argocd.argoproj.io/secret-type=repository \
  -n argocd
```

**What this does:**
- The `argocd.argoproj.io/secret-type=repository` label tells ArgoCD to treat this Kubernetes Secret as a repository credential.
- ArgoCD automatically picks up this secret and uses the PAT when cloning the repository.
- The token is stored only as a Kubernetes Secret — it is **never committed to Git**.

---

## Step 8 — Force Refresh and Verify

After adding the credentials, force ArgoCD to retry the sync:

```bash
kubectl annotate application crm-app \
  -n argocd \
  argocd.argoproj.io/refresh=hard \
  --overwrite
```

**Verify the final application status:**
```bash
kubectl get application crm-app -n argocd -o wide
```

**Expected output:**
```
NAME      SYNC STATUS   HEALTH STATUS   REVISION   PROJECT
crm-app   Synced        Healthy         eed7117...  default
```

---

## ✅ Final Result

After completing all steps, the `crm-app` ArgoCD application is:
- **Synced** — The cluster state matches the Git repository exactly.
- **Healthy** — All pods (crm-backend, crm-frontend, crm-postgres, alertmanager-discord-relay) are Running.
- **Auto-sync enabled** — Any push to the `main` branch will automatically be applied to the cluster.

The full deployed resource tree includes:
- Deployments: `crm-backend`, `crm-frontend`, `crm-postgres`, `alertmanager-discord-relay`
- Services, Ingress, PersistentVolumeClaim
- Grafana dashboard ConfigMaps
- PrometheusRule, ServiceMonitors, AlertmanagerConfig

---

## 🔄 GitOps Flow Summary

```
Developer pushes commit to main branch
           │
           ▼
   GitHub repository updated
           │
           ▼
 ArgoCD detects new revision (polls every 3 min or webhook)
           │
           ▼
ArgoCD applies the Helm chart diff to the kind cluster
           │
           ▼
  Pods are updated / rolled out automatically
           │
           ▼
   Backstage shows new pod status (via Kubernetes plugin)
```
