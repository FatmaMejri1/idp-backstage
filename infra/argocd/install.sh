#!/bin/bash

# Ensure we are in the right context (assuming kind local cluster)
# This installs ArgoCD in the argocd namespace

kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "ArgoCD installation initiated."
echo "Wait for the pods to be ready: kubectl get pods -n argocd"
echo "To access the UI, run: kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "The default password is the name of the argocd-initial-admin-secret server pod, or you can retrieve it with:"
echo "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath=\"{.data.password}\" | base64 -d; echo"
