# ??? Platform Governance with Kyverno Policy Engine

This directory contains declarative Kubernetes Policy-as-Code definitions managed by **Kyverno** to enforce platform engineering guardrails, security standards, and operational reliability across the cluster.

---

## ?? Active ClusterPolicies

| Policy Name | Severity | Category | Action | Description |
|---|:---:|:---:|:---:|---|
| **`disallow-root-user`** | High | Security | `Audit` | Containers must not run as root (`runAsNonRoot: true` or non-zero `runAsUser`). |
| **`disallow-privileged-containers`** | High | Security | `Enforce` | Strictly forbids `privileged: true` containers on worker nodes. |
| **`require-resource-limits`** | Medium | Reliability | `Audit` | Mandates CPU/Memory requests & limits to prevent noisy-neighbor starvation. |
| **`require-probes`** | Medium | Reliability | `Audit` | Requires `readinessProbe` and `livenessProbe` for zero-downtime rollouts. |
| **`require-standard-labels`** | Medium | Governance | `Audit` | Enforces CNCF `app.kubernetes.io/name` metadata for telemetry & cataloging. |

---

## ? Quickstart & Installation

```bash
# 1. Run the automated installation script
chmod +x infra/kyverno/install.sh
./infra/kyverno/install.sh

# 2. Verify installed policies
kubectl get clusterpolicy

# 3. Inspect policy compliance reports
kubectl get policyreports -A
```

---

## ?? GitOps Management with ArgoCD

These policies are continuously reconciled by ArgoCD via [`infra/gitops/kyverno-policies-application.yaml`](../gitops/kyverno-policies-application.yaml). Any updates pushed to `infra/kyverno/policies/` are automatically synchronized across all target clusters.
