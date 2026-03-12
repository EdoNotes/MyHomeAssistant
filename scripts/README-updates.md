# Home Assistant updates (Docker)

You run Home Assistant in **Docker** (container), not Home Assistant OS. In this setup:

- **The in-app "Update" button for the core does not work.** The UI may show an update available, but clicking Install fails with something like "This version requires Home Assistant 2026.3.0 or newer". That path is for OS/Supervised installs only.
- **Your automation** that calls `update.install` will also fail for the **Home Assistant core** entity; it can still work for other update entities (e.g. HACS integrations) if they support it.

## How to update Home Assistant (core)

From the project directory, run:

```bash
./scripts/update-homeassistant.sh
```

Or manually:

```bash
cd /home/edo-notes/homeassistant
docker compose pull homeassistant
docker compose up -d homeassistant
```

Your `config/` is mounted into the container, so your configuration is kept. After the new container starts, the version in **Settings → System** (or `config/.HA_VERSION`) will reflect the new release.

## Other updates (HACS, integrations)

Integrations and frontend updates from HACS or the UI can still be installed from the UI as usual; only the **core** update must be done via Docker.
