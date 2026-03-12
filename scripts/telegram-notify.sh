#!/bin/bash
# Send a Telegram message via Bot API. Requires telegram.env with TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.
# Usage: ./telegram-notify.sh "Your message here"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${TELEGRAM_ENV:-$SCRIPT_DIR/telegram.env}"

[ ! -r "$ENV_FILE" ] && exit 0
# shellcheck source=/dev/null
source "$ENV_FILE"
[ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ] && exit 0

MSG="${*:-Network notification}"
curl -sS -m 10 "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_CHAT_ID}" \
  -d "text=${MSG}" \
  -d "disable_web_page_preview=1" >/dev/null 2>&1
exit 0
