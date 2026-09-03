#!/usr/bin/env python3
"""Update a Helm values.yaml image tag for GitOps (BF-05).

Usage:
  python3 scripts/update_helm_image_tag.py <values.yaml> <serviceName> <imageTag>

serviceName: crm-backend | backend | crm-frontend | frontend | crm-ai-advisor | ai-advisor
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SERVICE_ALIASES = {
    "crm-backend": "backend",
    "backend": "backend",
    "crm-frontend": "frontend",
    "frontend": "frontend",
    "crm-ai-advisor": "aiAdvisor",
    "aiAdvisor": "aiAdvisor",
    "ai-advisor": "aiAdvisor",
}

TAG_PATTERN_TEMPLATE = (
    r"({section}:\n"
    r"(?:  .*\n)*?"
    r"  image:\n"
    r"(?:    .*\n)*?"
    r"    tag:\s*)([^\n]+)"
)


def resolve_section(service_name: str) -> str:
    section = SERVICE_ALIASES.get(service_name)
    if not section:
        allowed = ", ".join(sorted(SERVICE_ALIASES))
        raise ValueError(f"Unknown service '{service_name}'. Expected one of: {allowed}")
    return section


def update_values(content: str, service_name: str, image_tag: str) -> str:
    if not image_tag or any(ch.isspace() for ch in image_tag):
        raise ValueError("imageTag must be a non-empty token without whitespace")

    section = resolve_section(service_name)
    pattern = TAG_PATTERN_TEMPLATE.format(section=re.escape(section))
    updated, count = re.subn(pattern, rf"\g<1>{image_tag}", content, count=1)
    if count != 1:
        raise ValueError(
            f"Could not find '{section}.image.tag' in values file. "
            "Expected nested keys: {section}.image.repository / {section}.image.tag"
        )
    return updated


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("values_file", type=Path)
    parser.add_argument("service_name")
    parser.add_argument("image_tag")
    args = parser.parse_args(argv)

    original = args.values_file.read_text(encoding="utf-8")
    updated = update_values(original, args.service_name, args.image_tag)
    if updated == original:
        print(f"No change: {args.service_name} already at tag {args.image_tag}")
        return 0
    args.values_file.write_text(updated, encoding="utf-8")
    print(f"Updated {args.service_name} image tag to {args.image_tag} in {args.values_file}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001 — CLI surface
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)