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
        self.assertIn("prometheusDataSource: prometheus", config)
        self.assertIn("GRAFANA_AUTH_HEADER", config)
        self.assertIn("entity-card:grafana/alerts: false", config)
        self.assertIn("entity-content:grafana/alerts: false", config)

    def test_catalog_grafana_annotations_and_links(self) -> None:
        catalog = read("apps/crm/catalog-info.yaml")
        self.assertIn("grafana/dashboard-selector:", catalog)
        self.assertIn("grafana/alert-label-selector: 'app=crm'", catalog)
        self.assertIn("http://localhost:3300/dashboards", catalog)

    def test_prometheus_rules_carry_app_crm_label(self) -> None:
        rules = read("apps/crm/crm-chart/templates/crm-alert-rules.yaml")
        self.assertIn("app: crm", rules)
        self.assertGreaterEqual(rules.count("app: crm"), 8)

    def test_alertmanager_forwards_to_backstage(self) -> None:
        alerts = read("apps/crm/crm-chart/templates/alertmanager-config.yaml")
        values = read("apps/crm/crm-chart/values.yaml")
        backend = read("backstage/packages/backend/src/index.ts")
        webhook = read("backstage/packages/backend/src/plugins/alertmanagerWebhook.ts")
        app = read("backstage/packages/app/src/App.tsx")
        self.assertIn("receiver: 'backstage'", alerts)
        self.assertIn("backstage.alertsWebhook.url", alerts)
        self.assertIn("^CRM.+", alerts)
        self.assertIn("/api/alertmanager/webhook", values)
        self.assertIn("alertmanagerWebhookPlugin", backend)
        self.assertIn("notificationService", webhook)
        self.assertIn("platformAlertsPlugin", app)

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
