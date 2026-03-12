#!/bin/bash
# Run this script with: sudo bash install-headless-display.sh
# Or: sudo ./install-headless-display.sh
# You will be prompted for your password if not already root.
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Installing xserver-xorg-video-dummy..."
apt-get update -qq
apt-get install -y xserver-xorg-video-dummy
echo "Deploying 10-headless.conf to /etc/X11/xorg.conf.d/..."
mkdir -p /etc/X11/xorg.conf.d
cp "$SCRIPT_DIR/10-headless.conf" /etc/X11/xorg.conf.d/10-headless.conf
echo "Done. Reboot the PC for changes to take effect: sudo reboot"
