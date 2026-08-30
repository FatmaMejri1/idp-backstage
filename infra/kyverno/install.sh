#!/bin/bash
set -euo pipefail

echo "==> Adding Kyverno Helm repository..."
helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update

echo "==> Installing Kyverno in namespace kyverno..."
helm upgrade --install kyverno kyverno/kyverno \
  --namespace kyverno --create-namespace \
  --set admissionController.replicas=1 \
  --set backgroundController.replicas=1 \
  --set cleanupController.replicas=1 \
  --set reportsController.replicas=1

echo "==> Waiting for Kyverno Admission Controller to be ready..."
kubectl wait --namespace kyverno \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=admission-controller \
  --timeout=180s

echo "==> Applying Platform Governance ClusterPolicies..."
kubectl apply -k infra/kyverno/policies

echo "==> Kyverno Governance Policies deployed successfully!"
kubectl get clusterpolicy
