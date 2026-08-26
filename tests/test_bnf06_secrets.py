"""BNF-06 — Secrets are not committed; placeholders/env vars are used."""

from __future__ import annotations

import unittest

from helpers import read


class TestBnf06Secrets(unittest.TestCase):
    def test_catalog_has_no_pagerduty_integration_key(self) -> None:
        catalog = read("apps/crm/catalog-info.yaml")
        self.assertNotIn("integration-key", catalog)
        self.assertNotRegex(catalog, r"R[A-Z0-9]{20,}")

    def test_backstage_tokens_come_from_env(self) -> None:
        config = read("backstage/app-config.yaml")
        self.assertIn("${GITHUB_TOKEN", config)
        self.assertIn("${K8S_SA_TOKEN", config)
        self.assertIn("${PAGERDUTY_TOKEN", config)

    def test_argocd_install_does_not_embed_github_pat(self) -> None:
        install = read("infra/argocd/install.sh")
        self.assertNotIn("ghp_", install)


if __name__ == "__main__":
    unittest.main()
