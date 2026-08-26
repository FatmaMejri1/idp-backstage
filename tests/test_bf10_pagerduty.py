"""BF-10 — PagerDuty incidents in Backstage (simulated)."""

from __future__ import annotations

import unittest

from helpers import read


class TestBf10Pagerduty(unittest.TestCase):
    def test_frontend_registers_pagerduty_plugin(self) -> None:
        app = read("backstage/packages/app/src/App.tsx")
        module = read("backstage/packages/app/src/modules/pagerduty/index.ts")
        self.assertIn("pagerDutyPlugin", app)
        self.assertNotIn("pagerDutyApiModule", app)
        self.assertIn("export const pagerDutyPlugin", module)
        self.assertIn("EntityPagerDutyCard", module)

    def test_app_config_uses_env_token(self) -> None:
        config = read("backstage/app-config.yaml")
        self.assertIn("pagerDuty:", config)
        self.assertIn("eventsBaseUrl:", config)
        self.assertIn("target: 'https://api.pagerduty.com'", config)
        self.assertIn("${PAGERDUTY_TOKEN", config)

    def test_frontend_api_factory_includes_fetch_api(self) -> None:
        module = read("backstage/packages/app/src/modules/pagerduty/index.ts")
        self.assertIn("fetchApiRef", module)
        self.assertIn("fetchApi", module)
        self.assertIn("isPagerDutyAvailable", module)

    def test_catalog_uses_service_id_not_routing_key(self) -> None:
        catalog = read("apps/crm/catalog-info.yaml")
        self.assertIn("pagerduty.com/service-id:", catalog)
        self.assertNotIn("pagerduty.com/integration-key:", catalog)

    def test_alertmanager_can_route_to_pagerduty(self) -> None:
        alerts = read("apps/crm/crm-chart/templates/alertmanager-config.yaml")
        self.assertIn("pagerduty-critical", alerts)
        self.assertIn("pagerdutyConfigs:", alerts)


if __name__ == "__main__":
    unittest.main()
