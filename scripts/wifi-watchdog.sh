#!/bin/bash
# WiFi connectivity watchdog. Runs every 60s via systemd timer.
# Pings gateway; after 2 consecutive failures, escalates through
# progressively more aggressive reconnect strategies.
# State persists in /tmp (survives between oneshot runs, cleared on reboot).

PING_TARGET="${PING_TARGET:-192.168.1.1}"
STATE_FILE="/tmp/wifi-watchdog.failures"
CONNECTION_NAME="${CONNECTION_NAME:-Nots}"
INTERFACE="${INTERFACE:-wlp2s0}"
FAIL_THRESHOLD=2
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

log() { echo "wifi-watchdog: $*" >&2; }

notify_telegram() {
  [ -x "$SCRIPT_DIR/telegram-notify.sh" ] && "$SCRIPT_DIR/telegram-notify.sh" "$@" &
}

count=$(cat "$STATE_FILE" 2>/dev/null || echo "0")

if ping -c 1 -W 5 "$PING_TARGET" &>/dev/null; then
  if [ "$count" -ge "$FAIL_THRESHOLD" ]; then
    log "recovered after $count failures"
    notify_telegram "Home Assistant PC: network recovered after $count failures at $(date '+%Y-%m-%d %H:%M:%S')."
  fi
  echo "0" > "$STATE_FILE"
  exit 0
fi

count=$((count + 1))
echo "$count" > "$STATE_FILE"
log "ping $PING_TARGET failed (failure $count/$FAIL_THRESHOLD)"

if [ "$count" -lt "$FAIL_THRESHOLD" ]; then
  exit 0
fi

# --- Escalating reconnect strategies ---

# Level 1: standard nmcli reconnect
log "level 1: nmcli connection up + device reconnect"
nmcli connection up "$CONNECTION_NAME" 2>&1 | while read -r line; do log "  $line"; done
nmcli device reconnect "$INTERFACE" 2>&1 | while read -r line; do log "  $line"; done
sleep 10
if ping -c 1 -W 5 "$PING_TARGET" &>/dev/null; then
  log "recovered at level 1"
  echo "0" > "$STATE_FILE"
  notify_telegram "Home Assistant PC: network recovered (level 1 reconnect) at $(date '+%Y-%m-%d %H:%M:%S')."
  exit 0
fi

# Level 2: full NetworkManager restart (clears need-auth / failed states)
log "level 2: restarting NetworkManager"
systemctl restart NetworkManager 2>&1 | while read -r line; do log "  $line"; done
sleep 15
if ping -c 1 -W 5 "$PING_TARGET" &>/dev/null; then
  log "recovered at level 2"
  echo "0" > "$STATE_FILE"
  notify_telegram "Home Assistant PC: network recovered (level 2 NM restart) at $(date '+%Y-%m-%d %H:%M:%S')."
  exit 0
fi

# Level 3: rfkill toggle (power-cycle the WiFi radio) + NM restart
log "level 3: rfkill WiFi off/on + NM restart"
rfkill block wifi
sleep 3
rfkill unblock wifi
sleep 3
systemctl restart NetworkManager 2>&1 | while read -r line; do log "  $line"; done
sleep 15
if ping -c 1 -W 5 "$PING_TARGET" &>/dev/null; then
  log "recovered at level 3"
  echo "0" > "$STATE_FILE"
  notify_telegram "Home Assistant PC: network recovered (level 3 rfkill+NM restart) at $(date '+%Y-%m-%d %H:%M:%S')."
  exit 0
fi

# Level 4: reload WiFi kernel driver
log "level 4: reloading WiFi driver"
DRIVER=$(basename "$(readlink /sys/class/net/$INTERFACE/device/driver)" 2>/dev/null || echo "rtw88_8821ce")
modprobe -r "$DRIVER" 2>/dev/null || true
sleep 3
modprobe "$DRIVER" 2>/dev/null || true
sleep 5
systemctl restart NetworkManager 2>&1 | while read -r line; do log "  $line"; done
sleep 15
if ping -c 1 -W 5 "$PING_TARGET" &>/dev/null; then
  log "recovered at level 4"
  echo "0" > "$STATE_FILE"
  notify_telegram "Home Assistant PC: network recovered (level 4 driver reload) at $(date '+%Y-%m-%d %H:%M:%S')."
  exit 0
fi

log "all recovery levels failed, will retry next cycle"
notify_telegram "Home Assistant PC: ALL recovery levels failed at $(date '+%Y-%m-%d %H:%M:%S'). Manual intervention may be needed."
exit 0
