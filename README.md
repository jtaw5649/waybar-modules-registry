# Waybar Modules Registry

This repository hosts the module registry for [Waybar Manager](https://github.com/jtaw/waybar-manager).

## Registry URL

```
https://<username>.github.io/waybar-modules-registry/index.json
```

## Adding a Module

To add your module to the registry, submit a PR with an entry in `index.json`:

```json
{
  "uuid": "your-module@author",
  "name": "Your Module Name",
  "description": "Brief description of what your module does",
  "author": "your-username",
  "category": "system|hardware|network|media|weather|custom",
  "icon": null,
  "screenshot": "https://url-to-screenshot.png",
  "repo_url": "https://github.com/user/repo",
  "downloads": 0,
  "waybar_versions": ["0.10", "0.11"]
}
```

## Categories

- `system` - System monitoring (battery, memory, etc.)
- `hardware` - Hardware info (CPU, GPU, disk, etc.)
- `network` - Network related (speed, VPN, etc.)
- `media` - Media players and controls
- `weather` - Weather displays
- `custom` - Other modules

## License

MIT
