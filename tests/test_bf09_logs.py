"""BF-09 — Centralized logs via Loki/Grafana."""

from __future__ import annotations

import unittest

from helpers import read


class TestBf09Logs(unittest.TestCase):
    def test_catalog_exposes_loki_explorer_on_kind_host_port(self) -> None:
        catalog = read("apps/crm/catalog-info.yaml")
        self.assertIn("title: Loki Log Explorer", catalog)
        self.assertIn("http://localhost:3300/explore", catalog)
        self.assertIn("namespace", catalog)

    def test_log_url_matches_kind_grafana_mapping(self) -> None:
        kind = read("infra/kind/kind-config.yaml")
        catalog = read("apps/crm/catalog-info.yaml")
        self.assertIn("hostPort: 3300", kind)
        self.assertNotIn("localhost:30300", catalog)


if __name__ == "__main__":
    unittest.main()
