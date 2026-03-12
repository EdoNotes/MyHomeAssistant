# Headless PC: See desktop in NoMachine (like having a screen)

Use a **virtual 1920×1080 display** so the PC behaves as if a monitor is connected. NoMachine will then show the real desktop instead of a black screen.

**Do this on the headless PC** (the one you connect to with NoMachine). You need shell access (SSH, or a one-time physical keyboard/monitor).

---

## Quick install (on this PC)

From this machine, open a terminal and run (you will be prompted for your password):

```bash
cd /home/edo-notes/homeassistant/headless-display
sudo bash install-headless-display.sh
```

Then reboot:

```bash
sudo reboot
```

After reboot, connect with NoMachine and choose the **physical desktop** session.

---

## Manual steps (alternative)

### 1. Install the dummy display driver

```bash
sudo apt update
sudo apt install xserver-xorg-video-dummy
```

### 2. Create the Xorg config directory (if needed)

```bash
sudo mkdir -p /etc/X11/xorg.conf.d
```

### 3. Copy the config file

Copy `10-headless.conf` from this folder to the headless PC, then:

```bash
sudo cp 10-headless.conf /etc/X11/xorg.conf.d/10-headless.conf
```

Or create the file directly on the headless PC:

```bash
sudo nano /etc/X11/xorg.conf.d/10-headless.conf
```

Paste the contents of `10-headless.conf` (the Monitor, Device, and Screen sections), save, and exit.

### 4. Reboot

```bash
sudo reboot
```

### 5. Connect with NoMachine

After reboot, connect with NoMachine and choose the **physical desktop** (or default session). You should see the normal login/desktop at 1920×1080.

---

## If you later add a real monitor

To use a physical screen again, remove the dummy config:

```bash
sudo rm /etc/X11/xorg.conf.d/10-headless.conf
sudo reboot
```

---

## Alternative: HDMI dummy plug

If the virtual display causes issues (e.g. with NVIDIA), use a **headless HDMI dongle** (~$5–15). Plug it into the PC’s HDMI port; the GPU sees a “monitor” and NoMachine will show the desktop without any config.
