"""BF-02 — Demo services are containerized."""

from __future__ import annotations

import unittest

from helpers import ROOT, read


class TestBf02Containerization(unittest.TestCase):
    def test_backend_dockerfile_is_multistage(self) -> None:
        text = read("apps/crm/crm-backend/Dockerfile")
        self.assertIn("FROM maven:3.9-eclipse-temurin-17 AS build", text)
        self.assertIn("FROM eclipse-temurin:17-jre-alpine", text)
        self.assertTrue((ROOT / "apps/crm/crm-backend/Dockerfile").is_file())

    def test_frontend_dockerfile_is_multistage(self) -> None:
        text = read("apps/crm/crm-frontend/Dockerfile")
        self.assertIn("FROM node:20-alpine AS build", text)
        self.assertIn("FROM nginx:1.27-alpine", text)


if __name__ == "__main__":
    unittest.main()
