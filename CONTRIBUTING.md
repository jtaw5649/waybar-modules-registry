# Contributing a Module

## Prerequisites

- Module hosted on GitHub
- Working waybar configuration
- README with installation instructions

## Submission Process

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/waybar-modules-registry.git
cd waybar-modules-registry
```

### 2. Create Module File

Create `modules/{uuid}.json`:

```json
{
  "uuid": "your-module@namespace",
  "name": "Your Module Name",
  "description": "Brief description of what your module does (10-500 characters)",
  "author": "your-github-username",
  "category": "system",
  "version": "1.0.0",
  "repo_url": "https://github.com/you/your-module",
  "icon": null,
  "screenshot": null,
  "license": "MIT",
  "tags": ["keyword1", "keyword2"]
}
```

### 3. Validate Locally

```bash
python3 scripts/validate.py
```

### 4. Submit Pull Request

```bash
git checkout -b add-your-module
git add modules/your-module@namespace.json
git commit -m "Add your-module@namespace"
git push origin add-your-module
```

Open a PR against `master`.

## Field Reference

### Required Fields

| Field | Format | Description |
|-------|--------|-------------|
| `uuid` | `name@namespace` | Unique identifier (lowercase, hyphens allowed) |
| `name` | 3-50 chars | Display name |
| `description` | 10-500 chars | What the module does |
| `author` | string | Your GitHub username |
| `category` | enum | One of the valid categories |
| `version` | semver | e.g., `1.0.0`, `2.1.0-beta` |
| `repo_url` | URL | `https://github.com/owner/repo` |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `icon` | string/null | Icon name |
| `screenshot` | URL/null | Screenshot URL |
| `license` | string/null | License identifier (MIT, GPL-3.0, etc.) |
| `tags` | array | Up to 10 search keywords |

### Valid Categories

- `system` - System monitoring, settings
- `hardware` - CPU, GPU, disk, temperature
- `network` - Connectivity, speed, VPN
- `audio` - Volume, playback
- `power` - Battery, power management
- `time` - Clocks, calendars
- `workspace` - Workspace indicators
- `window` - Window management
- `tray` - System tray items
- `weather` - Weather displays
- `productivity` - Todo, pomodoro, etc.
- `media` - Media players
- `custom` - Other

## Review Criteria

- Module works with standard Waybar
- Repository is accessible
- Description is accurate
- No malicious code
- No duplicate functionality without improvement

## Timeline

| Stage | Duration |
|-------|----------|
| Initial review | 1-3 days |
| Revisions (if needed) | 1-5 days |
| Merge to API | Automatic |
