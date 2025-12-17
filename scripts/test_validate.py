#!/usr/bin/env python3
import pytest
from validate import (
    validate_uuid,
    validate_version,
    validate_repo_url,
    validate_category,
    validate_tags,
    validate_module,
    ValidationError,
)


class TestValidateUuid:
    def test_valid_uuid(self):
        validate_uuid("weather-wttr@community")
        validate_uuid("cpu@sys")
        validate_uuid("a@b")

    def test_invalid_uuid_no_at(self):
        with pytest.raises(ValidationError):
            validate_uuid("weather-wttr")

    def test_invalid_uuid_multiple_at(self):
        with pytest.raises(ValidationError):
            validate_uuid("a@b@c")

    def test_invalid_uuid_uppercase(self):
        with pytest.raises(ValidationError):
            validate_uuid("Weather@Community")

    def test_invalid_uuid_spaces(self):
        with pytest.raises(ValidationError):
            validate_uuid("weather wttr@community")

    def test_invalid_uuid_too_short(self):
        with pytest.raises(ValidationError):
            validate_uuid("a@")


class TestValidateVersion:
    def test_valid_versions(self):
        validate_version("1.0.0")
        validate_version("0.1.0")
        validate_version("10.20.30")
        validate_version("1.0.0-beta")
        validate_version("1.0.0-rc.1")

    def test_invalid_version_two_parts(self):
        with pytest.raises(ValidationError):
            validate_version("1.0")

    def test_invalid_version_no_dots(self):
        with pytest.raises(ValidationError):
            validate_version("100")

    def test_invalid_version_letters(self):
        with pytest.raises(ValidationError):
            validate_version("v1.0.0")


class TestValidateRepoUrl:
    def test_valid_urls(self):
        validate_repo_url("https://github.com/owner/repo")
        validate_repo_url("https://github.com/jtaw5649/waybar-manager")

    def test_invalid_url_http(self):
        with pytest.raises(ValidationError):
            validate_repo_url("http://github.com/owner/repo")

    def test_invalid_url_gitlab(self):
        with pytest.raises(ValidationError):
            validate_repo_url("https://gitlab.com/owner/repo")

    def test_invalid_url_trailing_slash(self):
        with pytest.raises(ValidationError):
            validate_repo_url("https://github.com/owner/repo/")

    def test_invalid_url_subpath(self):
        with pytest.raises(ValidationError):
            validate_repo_url("https://github.com/owner/repo/tree/main")


class TestValidateCategory:
    def test_valid_categories(self):
        for cat in ["system", "hardware", "network", "weather", "media", "custom"]:
            validate_category(cat)

    def test_invalid_category(self):
        with pytest.raises(ValidationError):
            validate_category("invalid")

    def test_invalid_category_uppercase(self):
        with pytest.raises(ValidationError):
            validate_category("System")


class TestValidateTags:
    def test_valid_tags(self):
        validate_tags(["tag1", "tag2"])
        validate_tags([])
        validate_tags(None)

    def test_invalid_tags_duplicate(self):
        with pytest.raises(ValidationError):
            validate_tags(["tag1", "tag1"])

    def test_invalid_tags_too_many(self):
        with pytest.raises(ValidationError):
            validate_tags([f"tag{i}" for i in range(11)])

    def test_invalid_tags_empty_string(self):
        with pytest.raises(ValidationError):
            validate_tags([""])


class TestValidateModule:
    def test_valid_module(self):
        module = {
            "uuid": "test@dev",
            "name": "Test Module",
            "description": "A test module for validation purposes",
            "author": "dev",
            "category": "system",
            "version": "1.0.0",
            "repo_url": "https://github.com/test/repo",
            "tags": ["test"],
        }
        validate_module(module)

    def test_missing_required_field(self):
        module = {
            "uuid": "test@dev",
            "name": "Test",
        }
        with pytest.raises(ValidationError, match="Missing required field"):
            validate_module(module)

    def test_name_too_short(self):
        module = {
            "uuid": "test@dev",
            "name": "AB",
            "description": "A test module for validation purposes",
            "author": "dev",
            "category": "system",
            "version": "1.0.0",
            "repo_url": "https://github.com/test/repo",
        }
        with pytest.raises(ValidationError, match="name must be"):
            validate_module(module)

    def test_description_too_short(self):
        module = {
            "uuid": "test@dev",
            "name": "Test Module",
            "description": "Short",
            "author": "dev",
            "category": "system",
            "version": "1.0.0",
            "repo_url": "https://github.com/test/repo",
        }
        with pytest.raises(ValidationError, match="description must be"):
            validate_module(module)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
