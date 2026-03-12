# Telegram notification when PC disconnects from network

When the WiFi watchdog detects a disconnection and **successfully reconnects**, it sends a Telegram message so you know the PC had an outage and recovered.

**Note:** The message is sent **after** the PC is back online (we can’t send while disconnected). You’ll get something like:  
`Home Assistant PC: network was disconnected but has reconnected at 2026-03-09T12:34:56+02:00.`

## Setup

1. **Create a Telegram bot and get your chat id**
   - In Telegram, open a chat with **@BotFather**, send `/newbot`, follow the prompts, and copy the **bot token** (e.g. `123456789:ABCdef...`).
   - Send at least one message to your new bot (e.g. “hi”).
   - Get your chat id: open in a browser  
     `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`  
     and look for `"chat":{"id": 123456789}` — that number is your chat id.

2. **Create `telegram.env` in the scripts folder**
   ```bash
   cd /home/edo-notes/homeassistant/scripts
   cp telegram.env.example telegram.env
   # Edit telegram.env and set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
   ```

3. **Optional:** Add `scripts/telegram.env` to `.gitignore` if you use git (already added in repo `.gitignore`).

4. **Test**
   ```bash
   ./telegram-notify.sh "Test from Home Assistant PC"
   ```
   You should receive the message in Telegram.

No need to re-run the watchdog install script; the watchdog already calls `telegram-notify.sh` when it recovers. If `telegram.env` is missing or empty, the script simply does nothing.
