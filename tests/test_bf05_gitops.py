"""BF-05 — On-demand deploy updates Helm values for Argo CD."""

from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

from helpers import ROOT, read

SCRIPT = ROOT / "scripts" / "update_helm_image_tag.py"


def load_updater():
    spec = importlib.util.spec_from_file_location("update_helm_image_tag", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class TestBf05Gitops(unittest.TestCase):
    def setUp(self) -> None:
        self.updater = load_updater()
        self.values = read("apps/crm/crm-chart/values.yaml")

    def test_updates_backend_tag_only(self) -> None:
        updated = self.updater.update_values(self.values, "crm-backend", "abc123")
        self.assertIn("repository: ghcr.io/fatmamejri1/crm-backend", updated)
        self.assertRegex(
            updated,
            r"backend:\n(?:.*\n)*?  image:\n(?:.*\n)*?    tag: abc123",
        )
        self.assertIn("repository: ghcr.io/fatmamejri1/crm-frontend", updated)
        frontend_tag_count = updated.count("tag: latest")
        self.assertGreaterEqual(frontend_tag_count, 1)

    def test_updates_frontend_via_alias(self) -> None:
        updated = self.updater.update_values(self.values, "frontend", "v9")
        self.assertIn("tag: v9", updated)
        self.assertIn("repository: ghcr.io/fatmamejri1/crm-frontend", updated)

    def test_rejects_unknown_service(self) -> None:
        with self.assertRaises(ValueError):
            self.updater.update_values(self.values, "postgres", "v1")

    def test_rejects_whitespace_tag(self) -> None:
        with self.assertRaises(ValueError):
            self.updater.update_values(self.values, "backend", "bad tag")

    def test_writes_file_via_cli(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "values.yaml"
            path.write_text(self.values, encoding="utf-8")
            rc = self.updater.main([str(path), "crm-frontend", "sha-deadbeef"])
            self.assertEqual(rc, 0)
            text = path.read_text(encoding="utf-8")
            self.assertIn("tag: sha-deadbeef", text)

    def test_deploy_workflow_uses_script_and_workflow_dispatch(self) -> None:
        workflow = read(".github/workflows/deploy.yml")
        self.assertIn("workflow_dispatch:", workflow)
        self.assertIn("scripts/update_helm_image_tag.py", workflow)
        self.assertIn("apps/crm/crm-chart/values.yaml", workflow)
        self.assertNotIn("# sed -i", workflow)

    def test_argocd_watches_helm_chart(self) -> None:
        app = read("infra/gitops/crm-application.yaml")
        self.assertIn("kind: Application", app)
        self.assertIn("path: apps/crm/crm-chart", app)
        self.assertIn("automated:", app)


if __name__ == "__main__":
    unittest.main()
