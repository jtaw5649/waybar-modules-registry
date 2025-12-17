#!/usr/bin/env python3
import json
import sys
import re
from pathlib import Path
from typing import Optional

SCHEMA_PATH = Path(__file__).parent.parent / "schema" / "module.schema.json"
MODULES_DIR = Path(__file__).parent.parent / "modules"

VALID_CATEGORIES = [
    "system", "hardware", "network", "audio", "power", "time",
    "workspace", "window", "tray", "weather", "productivity", "media", "custom"
]

UUID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]*@[a-z0-9][a-z0-9-]*$")
VERSION_PATTERN = re.compile(r"^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$")
REPO_URL_PATTERN = re.compile(r"^https://github\.com/[^/]+/[^/]+$")


class ValidationError(Exception):
    pass


def validate_uuid(uuid: str) -> None:
    if not uuid or len(uuid) < 3 or len(uuid) > 100:
        raise ValidationError(f"UUID must be 3-100 characters: {uuid}")
    if not UUID_PATTERN.match(uuid):
        raise ValidationError(f"Invalid UUID format: {uuid}")


def validate_version(version: str) -> None:
    if not VERSION_PATTERN.match(version):
        raise ValidationError(f"Invalid version format: {version}")


def validate_repo_url(url: str) -> None:
    if not REPO_URL_PATTERN.match(url):
        raise ValidationError(f"Invalid repo_url (must be https://github.com/owner/repo): {url}")


def validate_category(category: str) -> None:
    if category not in VALID_CATEGORIES:
        raise ValidationError(f"Invalid category '{category}'. Valid: {VALID_CATEGORIES}")


def validate_tags(tags: Optional[list]) -> None:
    if tags is None:
        return
    if not isinstance(tags, list):
        raise ValidationError("tags must be an array")
    if len(tags) > 10:
        raise ValidationError("Maximum 10 tags allowed")
    seen = set()
    for tag in tags:
        if not isinstance(tag, str) or len(tag) < 1 or len(tag) > 30:
            raise ValidationError(f"Invalid tag: {tag}")
        if tag in seen:
            raise ValidationError(f"Duplicate tag: {tag}")
        seen.add(tag)


def validate_module(data: dict) -> None:
    required = ["uuid", "name", "description", "author", "category", "version", "repo_url"]
    for field in required:
        if field not in data:
            raise ValidationError(f"Missing required field: {field}")

    validate_uuid(data["uuid"])
    validate_version(data["version"])
    validate_repo_url(data["repo_url"])
    validate_category(data["category"])
    validate_tags(data.get("tags"))

    if len(data.get("name", "")) < 3 or len(data.get("name", "")) > 50:
        raise ValidationError("name must be 3-50 characters")
    if len(data.get("description", "")) < 10 or len(data.get("description", "")) > 500:
        raise ValidationError("description must be 10-500 characters")


def load_module(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_file(path: Path) -> list[str]:
    errors = []
    try:
        data = load_module(path)
        validate_module(data)
        expected_filename = f"{data['uuid']}.json"
        if path.name != expected_filename:
            errors.append(f"Filename mismatch: expected {expected_filename}, got {path.name}")
    except json.JSONDecodeError as e:
        errors.append(f"Invalid JSON: {e}")
    except ValidationError as e:
        errors.append(str(e))
    return errors


def check_duplicates(modules_dir: Path) -> list[str]:
    errors = []
    seen_uuids = {}
    for path in sorted(modules_dir.glob("*.json")):
        try:
            data = load_module(path)
            uuid = data.get("uuid")
            if uuid in seen_uuids:
                errors.append(f"Duplicate UUID '{uuid}' in {path.name} and {seen_uuids[uuid]}")
            else:
                seen_uuids[uuid] = path.name
        except (json.JSONDecodeError, KeyError):
            pass
    return errors


def main() -> int:
    all_errors = []

    if not MODULES_DIR.exists():
        print(f"ERROR: Modules directory not found: {MODULES_DIR}")
        return 1

    module_files = list(MODULES_DIR.glob("*.json"))
    if not module_files:
        print("No module files found")
        return 0

    for path in sorted(module_files):
        errors = validate_file(path)
        for error in errors:
            all_errors.append(f"{path.name}: {error}")

    dup_errors = check_duplicates(MODULES_DIR)
    all_errors.extend(dup_errors)

    if all_errors:
        print("Validation errors:")
        for error in all_errors:
            print(f"  - {error}")
        return 1

    print(f"Validated {len(module_files)} modules successfully")
    return 0


if __name__ == "__main__":
    sys.exit(main())
