#!/bin/bash
# Run once with: sudo ./install-wifi-watchdog.sh
# Installs: systemd timer, NM drop-in, dispatcher, and nmcli tuning for WiFi recovery.

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Installing systemd units..."
cp "$REPO_ROOT/scripts/systemd/wifi-watchdog.service" /etc/systemd/system/
cp "$REPO_ROOT/scripts/systemd/wifi-watchdog.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now wifi-watchdog.timer
echo "Timer installed and enabled (every 60s)."

echo "Installing NetworkManager dispatcher (immediate reconnect on WiFi down)..."
mkdir -p /etc/NetworkManager/dispatcher.d
cp "$REPO_ROOT/scripts/networkmanager/dispatcher-wifi-reconnect" /etc/NetworkManager/dispatcher.d/10-wifi-reconnect
chmod +x /etc/NetworkManager/dispatcher.d/10-wifi-reconnect
echo "Dispatcher installed."

echo "Installing NetworkManager WiFi powersave off..."
mkdir -p /etc/NetworkManager/conf.d
cp "$REPO_ROOT/scripts/networkmanager/wifi-powersave-off.conf" /etc/NetworkManager/conf.d/
systemctl reload NetworkManager 2>/dev/null || true
echo "NM drop-in installed."

echo "Tuning connection 'Nots' (priority + retries)..."
nmcli connection modify "Nots" connection.autoconnect-priority 100
nmcli connection modify "Nots" connection.autoconnect-retries 0
echo "Done."

echo ""
echo "Summary:"
echo "  - Watchdog runs every 60s with 4-level escalation (nmcli -> NM restart -> rfkill -> driver reload)"
echo "  - Dispatcher triggers immediate reconnect on WiFi down"
echo "  - NM: WiFi powersave off, autoconnect priority 100, retries forever"
echo ""
systemctl status wifi-watchdog.timer --no-pager || true
