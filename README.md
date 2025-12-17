# Waybar Modules Registry

This repository hosts the module registry for [Waybar Manager](https://github.com/jtaw5649/waybar-manager).

## Registry URL

```
https://jtaw5649.github.io/waybar-modules-registry/index.json
```

## Adding a Module

To add your module to the registry, submit a PR with an entry in `index.json`:

```json
{
  "uuid": "your-module@author",
  "name": "Your Module Name",
  "description": "Brief description of what your module does",
  "author": "your-username",
  "category": "system|hardware|network|media|weather",
  "version": "1.0.0",
  "icon": null,
  "screenshot": "https://url-to-screenshot.png",
  "repo_url": "https://github.com/user/repo",
  "downloads": 0,
  "tags": ["keyword1", "keyword2"]
}
```

### Required Fields

| Field | Description |
|-------|-------------|
| `uuid` | Unique identifier in format `module-name@namespace` |
| `name` | Human-readable display name |
| `description` | Brief description of functionality |
| `author` | Author username or organization |
| `category` | One of the supported categories below |
| `repo_url` | GitHub repository URL |

### Optional Fields

| Field | Description |
|-------|-------------|
| `version` | Semantic version string (e.g., "1.0.0") |
| `icon` | Icon path or null |
| `screenshot` | Screenshot URL or null |
| `downloads` | Download count (maintained by registry) |
| `tags` | Array of search keywords |

## Categories

- `system` - System monitoring (battery, memory, etc.)
- `hardware` - Hardware info (CPU, GPU, disk, etc.)
- `network` - Network related (speed, VPN, etc.)
- `media` - Media players and controls
- `weather` - Weather displays

