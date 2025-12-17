#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path
from typing import Any
import urllib.request
import urllib.error

MODULES_DIR = Path(__file__).parent.parent / "modules"

CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4"


def get_env_or_fail(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"ERROR: Missing environment variable: {name}")
        sys.exit(1)
    return value


def load_modules(modules_dir: Path) -> list[dict]:
    modules = []
    for path in sorted(modules_dir.glob("*.json")):
        with open(path, "r", encoding="utf-8") as f:
            modules.append(json.load(f))
    return modules


def build_upsert_sql(module: dict) -> tuple[str, list[Any]]:
    tags_json = json.dumps(module.get("tags", []))

    sql = """
        INSERT INTO modules (uuid, name, description, author, category, version, repo_url, icon, screenshot, license, downloads, tags, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, CURRENT_TIMESTAMP)
        ON CONFLICT(uuid) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            author = excluded.author,
            category = excluded.category,
            version = excluded.version,
            repo_url = excluded.repo_url,
            icon = excluded.icon,
            screenshot = excluded.screenshot,
            license = excluded.license,
            tags = excluded.tags,
            updated_at = CURRENT_TIMESTAMP
    """

    params = [
        module["uuid"],
        module["name"],
        module["description"],
        module["author"],
        module["category"],
        module["version"],
        module["repo_url"],
        module.get("icon"),
        module.get("screenshot"),
        module.get("license"),
        module.get("downloads", 0),
        tags_json,
    ]

    return sql.strip(), params


def execute_d1_query(
    account_id: str, database_id: str, api_token: str, sql: str, params: list[Any]
) -> dict:
    url = f"{CLOUDFLARE_API_BASE}/accounts/{account_id}/d1/database/{database_id}/query"

    data = json.dumps({"sql": sql, "params": params}).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as response:
            return json.load(response)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"HTTP Error {e.code}: {error_body}")
        raise


def sync_modules(
    modules: list[dict], account_id: str, database_id: str, api_token: str, dry_run: bool = False
) -> tuple[int, int]:
    success_count = 0
    error_count = 0

    for module in modules:
        sql, params = build_upsert_sql(module)

        if dry_run:
            print(f"[DRY RUN] Would sync: {module['uuid']}")
            success_count += 1
            continue

        try:
            result = execute_d1_query(account_id, database_id, api_token, sql, params)
            if result.get("success"):
                print(f"Synced: {module['uuid']}")
                success_count += 1
            else:
                print(f"Failed: {module['uuid']} - {result.get('errors', [])}")
                error_count += 1
        except Exception as e:
            print(f"Error syncing {module['uuid']}: {e}")
            error_count += 1

    return success_count, error_count


def main() -> int:
    dry_run = "--dry-run" in sys.argv

    if not dry_run:
        account_id = get_env_or_fail("CLOUDFLARE_ACCOUNT_ID")
        database_id = get_env_or_fail("D1_DATABASE_ID")
        api_token = get_env_or_fail("CLOUDFLARE_API_TOKEN")
    else:
        account_id = database_id = api_token = "dry-run"

    if not MODULES_DIR.exists():
        print(f"ERROR: Modules directory not found: {MODULES_DIR}")
        return 1

    modules = load_modules(MODULES_DIR)
    if not modules:
        print("No modules found to sync")
        return 0

    print(f"Found {len(modules)} modules to sync")

    success, errors = sync_modules(modules, account_id, database_id, api_token, dry_run)

    print(f"\nSync complete: {success} succeeded, {errors} failed")

    return 1 if errors > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
