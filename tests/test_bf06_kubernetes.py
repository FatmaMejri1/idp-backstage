"""BF-06 — Kubernetes plugin is configured for Backstage."""

from __future__ import annotations

import unittest

from helpers import read


class TestBf06Kubernetes(unittest.TestCase):
    def test_app_config_defines_cluster_locator(self) -> None:
        config = read("backstage/app-config.yaml")
        self.assertIn("serviceLocatorMethod:", config)
        self.assertIn("type: 'multiTenant'", config)
        self.assertIn("clusterLocatorMethods:", config)
        self.assertIn("name: kind-idp-backstage", config)
        self.assertIn("url: ${K8S_CLUSTER_URL", config)
        self.assertIn("serviceAccountToken: ${K8S_SA_TOKEN", config)

    def test_crm_entity_has_kubernetes_annotations(self) -> None:
        catalog = read("apps/crm/catalog-info.yaml")
        self.assertIn("backstage.io/kubernetes-label-selector:", catalog)
        self.assertIn("app.kubernetes.io/name=crm", catalog)
        self.assertIn("backstage.io/kubernetes-namespace: default", catalog)

    def test_backend_loads_kubernetes_plugin(self) -> None:
        backend = read("backstage/packages/backend/src/index.ts")
        self.assertIn("@backstage/plugin-kubernetes-backend", backend)

    def test_frontend_loads_kubernetes_plugin(self) -> None:
        app = read("backstage/packages/app/src/App.tsx")
        self.assertIn("@backstage/plugin-kubernetes/alpha", app)
        self.assertIn("kubernetesPlugin", app)


if __name__ == "__main__":
    unittest.main()
