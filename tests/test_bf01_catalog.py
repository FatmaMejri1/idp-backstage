"""BF-01 — Service catalog via catalog-info.yaml."""

from __future__ import annotations

import unittest

from helpers import ROOT, read


class TestBf01Catalog(unittest.TestCase):
    def test_catalog_info_declares_crm_component(self) -> None:
        text = read("apps/crm/catalog-info.yaml")
        self.assertIn("apiVersion: backstage.io/v1alpha1", text)
        self.assertIn("kind: Component", text)
        self.assertIn("name: crm", text)
        self.assertIn("description:", text)
        self.assertIn("owner: user:guest", text)
        self.assertIn("lifecycle: production", text)

    def test_catalog_location_is_portable_not_absolute_home_path(self) -> None:
        config = read("backstage/app-config.yaml")
        self.assertNotIn("/home/fatma/", config)
        self.assertIn("target: ../../../apps/crm/catalog-info.yaml", config)

    def test_catalog_file_exists_from_backend_relative_path(self) -> None:
        catalog = (
            ROOT
            / "backstage"
            / "packages"
            / "backend"
            / "../../../apps/crm/catalog-info.yaml"
        ).resolve()
        self.assertTrue(catalog.is_file(), catalog)


if __name__ == "__main__":
    unittest.main()
