#!/usr/bin/env python3
"""Check that every delivered Codex asset is either used by the game or listed,
with a reason, in docs/art-usage.md.

    python3 scripts/art-usage.py path/to/art-codex

Reads art-codex/assets.json for the asset list, keeps the ones whose file
exists, and compares them with the files scripts/import-codex-art.py brings in.
Exits 1 if any delivered asset is unaccounted for.
"""
import fnmatch
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    codex = Path(sys.argv[1])
    spec = importlib.util.spec_from_file_location("importer", ROOT / "scripts" / "import-codex-art.py")
    importer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(importer)
    imported = set(importer.sources())

    doc = (ROOT / "docs" / "art-usage.md").read_text()
    # Every `id` or `pattern` in the first column of the table.
    patterns = [p for row in re.findall(r"^\| (.+?) \|", doc, re.M) for p in re.findall(r"`([^`]+)`", row)]

    unaccounted = []
    for a in json.loads((codex / "assets.json").read_text())["assets"]:
        path = a["path"].removeprefix("art-codex/out/")
        if not (codex / "out" / path).exists() or path in imported:
            continue
        if not any(fnmatch.fnmatch(a["id"], p) for p in patterns):
            unaccounted.append(f"{a['id']} ({path})")
    for u in unaccounted:
        print(f"not used and not in docs/art-usage.md: {u}")
    print(f"{len(unaccounted)} unaccounted")
    sys.exit(1 if unaccounted else 0)


if __name__ == "__main__":
    main()
