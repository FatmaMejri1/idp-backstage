"""BF-04 — Helm chart is parametrized (image, replicas, env)."""

from __future__ import annotations

import unittest

from helpers import read


class TestBf04Helm(unittest.TestCase):
    def test_values_use_repository_and_tag(self) -> None:
        values = read("apps/crm/crm-chart/values.yaml")
        self.assertIn("repository: ghcr.io/fatmamejri1/crm-backend", values)
        self.assertIn("repository: ghcr.io/fatmamejri1/crm-frontend", values)
        self.assertIn("tag: latest", values)
        self.assertIn("replicas: 1", values)

    def test_backend_template_renders_repo_and_tag(self) -> None:
        template = read("apps/crm/crm-chart/templates/backend-deployment.yaml")
        self.assertIn(
            'image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"',
            template,
        )
        self.assertIn("replicas: {{ .Values.backend.replicas }}", template)
        self.assertIn("SPRING_DATASOURCE_URL", template)

    def test_frontend_template_renders_repo_and_tag(self) -> None:
        template = read("apps/crm/crm-chart/templates/frontend-deployment.yaml")
        self.assertIn(
            'image: "{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}"',
            template,
        )

    def test_kind_local_overlay_does_not_use_ghcr(self) -> None:
        overlay = read("apps/crm/crm-chart/values-kind-local.yaml")
        self.assertIn("repository: crm-backend", overlay)
        self.assertIn("tag: local", overlay)
        self.assertNotIn("ghcr.io", overlay)


if __name__ == "__main__":
    unittest.main()
