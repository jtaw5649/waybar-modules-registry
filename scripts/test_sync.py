#!/usr/bin/env python3
import pytest
from sync_to_d1 import build_upsert_sql, load_modules
from pathlib import Path
import tempfile
import json


class TestBuildUpsertSql:
    def test_basic_module(self):
        module = {
            "uuid": "test@dev",
            "name": "Test Module",
            "description": "A test module",
            "author": "dev",
            "category": "system",
            "version": "1.0.0",
            "repo_url": "https://github.com/test/repo",
        }
        sql, params = build_upsert_sql(module)

        assert "INSERT INTO modules" in sql
        assert "ON CONFLICT(uuid) DO UPDATE" in sql
        assert params[0] == "test@dev"
        assert params[1] == "Test Module"
        assert params[5] == "1.0.0"

    def test_module_with_tags(self):
        module = {
            "uuid": "test@dev",
            "name": "Test Module",
            "description": "A test module",
            "author": "dev",
            "category": "system",
            "version": "1.0.0",
            "repo_url": "https://github.com/test/repo",
            "tags": ["tag1", "tag2"],
        }
        sql, params = build_upsert_sql(module)

        tags_param = params[11]
        assert tags_param == '["tag1", "tag2"]'

    def test_module_with_optional_fields(self):
        module = {
            "uuid": "test@dev",
            "name": "Test Module",
            "description": "A test module",
            "author": "dev",
            "category": "system",
            "version": "1.0.0",
            "repo_url": "https://github.com/test/repo",
            "icon": "icon-name",
            "screenshot": "https://example.com/screenshot.png",
            "license": "MIT",
            "downloads": 100,
        }
        sql, params = build_upsert_sql(module)

        assert params[7] == "icon-name"
        assert params[8] == "https://example.com/screenshot.png"
        assert params[9] == "MIT"
        assert params[10] == 100

    def test_module_preserves_downloads_on_conflict(self):
        module = {
            "uuid": "test@dev",
            "name": "Test Module",
            "description": "A test module",
            "author": "dev",
            "category": "system",
            "version": "1.0.0",
            "repo_url": "https://github.com/test/repo",
        }
        sql, _ = build_upsert_sql(module)

        assert "downloads = excluded.downloads" not in sql


class TestLoadModules:
    def test_load_modules_from_dir(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            modules_dir = Path(tmpdir)

            (modules_dir / "test1@dev.json").write_text(
                json.dumps({"uuid": "test1@dev", "name": "Test 1"})
            )
            (modules_dir / "test2@dev.json").write_text(
                json.dumps({"uuid": "test2@dev", "name": "Test 2"})
            )

            modules = load_modules(modules_dir)

            assert len(modules) == 2
            uuids = {m["uuid"] for m in modules}
            assert uuids == {"test1@dev", "test2@dev"}

    def test_load_modules_sorted(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            modules_dir = Path(tmpdir)

            (modules_dir / "z-module@dev.json").write_text(
                json.dumps({"uuid": "z-module@dev"})
            )
            (modules_dir / "a-module@dev.json").write_text(
                json.dumps({"uuid": "a-module@dev"})
            )

            modules = load_modules(modules_dir)

            assert modules[0]["uuid"] == "a-module@dev"
            assert modules[1]["uuid"] == "z-module@dev"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
