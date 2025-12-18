# ⚠️ DEPRECATED

**This registry is deprecated.** Module submissions are now handled directly via the Waybar Manager application.
Please see [Waybar Manager](https://github.com/jtaw5649/waybar-manager) for current instructions.

---

# Waybar Modules Registry

The official module registry for [Waybar Manager](https://github.com/jtaw5649/waybar-manager).

## Submitting a Module

1. Fork this repository
2. Create a JSON file in `modules/` named `{uuid}.json`
3. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## API

Modules are served via Cloudflare Workers API:

```
https://waybar-registry-api.jtaw.workers.dev/api/v1/modules
```

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/modules` | List all modules |
| `GET /api/v1/modules/:uuid` | Get single module |
| `GET /api/v1/modules/search?q=&category=` | Search modules |
| `GET /api/v1/categories` | List categories |

## Module Format

```json
{
  "uuid": "your-module@namespace",
  "name": "Your Module Name",
  "description": "Brief description (10-500 chars)",
  "author": "your-username",
  "category": "system",
  "version": "1.0.0",
  "repo_url": "https://github.com/you/your-module",
  "tags": ["keyword1", "keyword2"]
}
```

### Valid Categories

`system` `hardware` `network` `audio` `power` `time` `workspace` `window` `tray` `weather` `productivity` `media` `custom`

## License

See [LICENSE](LICENSE).
