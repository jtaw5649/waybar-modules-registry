# Waybar Modules Registry

> **DEPRECATED**: This repository is deprecated. The module registry has moved to a Cloudflare Workers API with D1 database.
>
> **New API**: https://waybar-registry-api.jtaw.workers.dev
>
> See [waybar-registry-api](https://github.com/jtaw5649/waybar-registry-api) for the new implementation.

---

This repository previously hosted the module registry for [Waybar Manager](https://github.com/jtaw5649/waybar-manager).

## Migration Notice

All module data has been migrated to the new API. The static `index.json` file in this repository is no longer maintained.

### New API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/modules` | List all modules |
| GET | `/api/v1/modules/:uuid` | Get a specific module |
| GET | `/api/v1/modules/search?q=&category=` | Search modules |
| GET | `/api/v1/categories` | List all categories |

### Submitting a Module

To submit a new module to the registry, please open an issue on [waybar-registry-api](https://github.com/jtaw5649/waybar-registry-api/issues).
