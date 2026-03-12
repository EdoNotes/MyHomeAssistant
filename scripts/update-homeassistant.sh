#!/bin/bash
# Update Home Assistant when running in Docker.
# The in-app "Update" button does not work for the core on Docker; use this instead.
# Run from repo root: ./scripts/update-homeassistant.sh

set -e
cd "$(dirname "$0")/.."
echo "Pulling latest home-assistant:stable..."
docker compose pull homeassistant
echo "Recreating container..."
docker compose up -d homeassistant
echo "Done. Check config/.HA_VERSION or the UI for the new version."
