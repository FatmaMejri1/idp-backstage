"""BF-03 — CI builds, tests, and publishes images to GHCR."""

from __future__ import annotations

import unittest

from helpers import read


class TestBf03Ci(unittest.TestCase):
    def test_backend_ci_push_to_ghcr_after_tests(self) -> None:
        workflow = read(".github/workflows/backend-ci.yml")
        self.assertIn("mvn test", workflow)
        self.assertIn("ghcr.io/fatmamejri1/crm-backend", workflow)
        self.assertIn("packages: write", workflow)
        self.assertIn("Push image", workflow)

    def test_frontend_ci_push_to_ghcr_after_tests(self) -> None:
        workflow = read(".github/workflows/frontend-ci.yml")
        self.assertIn("npx ng test", workflow)
        self.assertIn("ghcr.io/fatmamejri1/crm-frontend", workflow)
        self.assertIn("Push image", workflow)


if __name__ == "__main__":
    unittest.main()
