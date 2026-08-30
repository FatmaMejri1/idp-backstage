"""BNF-10 ? Kubernetes Policy Engine (Kyverno) Platform Governance."""

from __future__ import annotations

import unittest
from pathlib import Path

from helpers import ROOT, read


class TestBnf10Kyverno(unittest.TestCase):
    def test_kyverno_policies_directory_structure(self) -> None:
        policy_dir = ROOT / "infra" / "kyverno" / "policies"
        self.assertTrue(policy_dir.is_dir(), "Policies directory should exist")
        expected_files = [
            "disallow-root-user.yaml",
            "disallow-privileged-containers.yaml",
            "require-resource-limits.yaml",
            "require-probes.yaml",
            "require-standard-labels.yaml",
            "kustomization.yaml",
        ]
        for f in expected_files:
            self.assertTrue((policy_dir / f).is_file(), f"{f} should exist")

    def test_disallow_root_user_policy(self) -> None:
        content = read("infra/kyverno/policies/disallow-root-user.yaml")
        self.assertIn("kind: ClusterPolicy", content)
        self.assertIn("disallow-root-user", content)
        self.assertIn("runAsNonRoot", content)

    def test_disallow_privileged_containers_policy(self) -> None:
        content = read("infra/kyverno/policies/disallow-privileged-containers.yaml")
        self.assertIn("kind: ClusterPolicy", content)
        self.assertIn("disallow-privileged-containers", content)
        self.assertIn("privileged", content)
        self.assertIn("Enforce", content)

    def test_require_resource_limits_policy(self) -> None:
        content = read("infra/kyverno/policies/require-resource-limits.yaml")
        self.assertIn("kind: ClusterPolicy", content)
        self.assertIn("require-resource-limits", content)
        self.assertIn("memory:", content)
        self.assertIn("cpu:", content)

    def test_require_probes_policy(self) -> None:
        content = read("infra/kyverno/policies/require-probes.yaml")
        self.assertIn("kind: ClusterPolicy", content)
        self.assertIn("require-probes", content)
        self.assertIn("readinessProbe", content)
        self.assertIn("livenessProbe", content)

    def test_require_standard_labels_policy(self) -> None:
        content = read("infra/kyverno/policies/require-standard-labels.yaml")
        self.assertIn("kind: ClusterPolicy", content)
        self.assertIn("require-standard-labels", content)
        self.assertIn("app.kubernetes.io/name", content)

    def test_argocd_kyverno_application(self) -> None:
        app = read("infra/gitops/kyverno-policies-application.yaml")
        self.assertIn("kind: Application", app)
        self.assertIn("name: kyverno-policies", app)
        self.assertIn("path: infra/kyverno/policies", app)
        self.assertIn("automated:", app)
        self.assertIn("selfHeal: true", app)

    def test_install_script_exists(self) -> None:
        script = read("infra/kyverno/install.sh")
        self.assertIn("helm upgrade --install kyverno", script)
        self.assertIn("kubectl apply -k infra/kyverno/policies", script)


if __name__ == "__main__":
    unittest.main()
