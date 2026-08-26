"""BF-07 — GitHub Actions history is wired into Backstage."""

from __future__ import annotations

import unittest

from helpers import read


class TestBf07GithubActions(unittest.TestCase):
    def test_catalog_has_github_project_slug(self) -> None:
        catalog = read("apps/crm/catalog-info.yaml")
        self.assertIn("github.com/project-slug: FatmaMejri1/idp-backstage", catalog)

    def test_frontend_loads_github_actions_plugin(self) -> None:
        app = read("backstage/packages/app/src/App.tsx")
        self.assertIn("githubActionsWithProxy", app)
        self.assertIn("./modules/github-actions", app)

    def test_github_actions_uses_backend_proxy_not_oauth(self) -> None:
        config = read("backstage/app-config.yaml")
        client = read(
            "backstage/packages/app/src/modules/github-actions/GithubActionsProxyClient.ts"
        )
        self.assertIn("'/github/api'", config)
        self.assertIn("target: 'https://api.github.com'", config)
        self.assertIn("getBaseUrl('proxy')", client)
        self.assertIn("/github/api", client)
        self.assertNotIn("scmAuthApi", client)

    def test_github_token_is_not_hardcoded(self) -> None:
        config = read("backstage/app-config.yaml")
        self.assertIn("token: ${GITHUB_TOKEN", config)
        self.assertNotRegex(config, r"token:\s*ghp_")

    def test_ci_workflows_exist(self) -> None:
        backend = read(".github/workflows/backend-ci.yml")
        frontend = read(".github/workflows/frontend-ci.yml")
        self.assertIn("ghcr.io/fatmamejri1/crm-backend", backend)
        self.assertIn("ghcr.io/fatmamejri1/crm-frontend", frontend)
        self.assertIn("mvn test", backend)
        self.assertIn("npx ng test", frontend)


if __name__ == "__main__":
    unittest.main()
