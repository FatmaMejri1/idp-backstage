"""BF-08 — Grafana/Prometheus monitoring is linked from the portal."""

from __future__ import annotations

import unittest

from helpers import read


class TestBf08Monitoring(unittest.TestCase):
    def test_grafana_plugin_and_domain(self) -> None:
        app = read("backstage/packages/app/src/App.tsx")
        config = read("backstage/app-config.yaml")
        self.assertIn("@backstage-community/plugin-grafana/alpha", app)
        self.assertIn("grafana:", config)
        self.assertIn("domain: http://localhost:3300", config)
        self.assertIn("unifiedAlerting: true", config)

    def test_catalog_grafana_annotations_and_links(self) -> None:
        catalog = read("apps/crm/catalog-info.yaml")
        self.assertIn("grafana/dashboard-selector:", catalog)
        self.assertIn("http://localhost:3300/dashboards", catalog)

    def test_kind_maps_grafana_nodeport_to_host_3300(self) -> None:
        kind = read("infra/kind/kind-config.yaml")
        self.assertIn("containerPort: 30300", kind)
        self.assertIn("hostPort: 3300", kind)

    def test_helm_exposes_servicemonitors_and_dashboards(self) -> None:
        self.assertIn("kind: ServiceMonitor", read("apps/crm/crm-chart/templates/backend-servicemonitor.yaml"))
        self.assertIn("kind: ServiceMonitor", read("apps/crm/crm-chart/templates/frontend-servicemonitor.yaml"))
        self.assertIn("grafana_dashboard", read("apps/crm/crm-chart/templates/backend-grafana-dashboard.yaml"))


if __name__ == "__main__":
    unittest.main()
