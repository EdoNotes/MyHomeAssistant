#!/usr/bin/env python3
"""Generate the "Focus" config for the map dashboard (dashboard-map).

usage: map_focus_gen.py <backup.json> <dashboard url_path> <out.json>

Every view is a panel view holding one iframe of /local/map_focus.html, which reads all
of its data from the Home Assistant frontend that embeds it (no token in the page).
The per-view `visible` list is copied from the backup, so the dashboard stays visible
to exactly the same user(s) as before.
"""
import json
import sys

VER = "20261110b"          # bump to bust the browser cache of the page

CARD_STYLE = (
    "ha-card{border:none!important;border-radius:0!important;box-shadow:none!important;"
    "background:#181825!important;overflow:hidden!important}"
)


def main():
    backup, base, out = sys.argv[1:4]
    old = json.load(open(backup, encoding="utf-8"))
    visible = old["views"][0]["visible"]
    assert visible and all(v["visible"] == visible for v in old["views"]), "unexpected visibility in backup"

    def view(path, title, icon, back=None):
        v = {
            "title": title,
            "path": path,
            "icon": icon,
            "type": "panel",
            "visible": visible,
            "cards": [{
                "type": "iframe",
                "url": f"/local/map_focus.html?v={VER}&p={path}",
                "aspect_ratio": "100%",
                "card_mod": {"style": CARD_STYLE},
            }],
        }
        if back:
            v["subview"] = True
            v["back_path"] = f"/{base}/{back}"
        return v

    cfg = dict(old)
    cfg["views"] = [
        view("both", "מפה", "mdi:map"),
        view("edo", "עידו", "mdi:account", back="both"),
        view("hen", "חן", "mdi:account-outline", back="both"),
        view("edo-day", "ציר היום · עידו", "mdi:timeline-clock-outline", back="edo"),
        view("hen-day", "ציר היום · חן", "mdi:timeline-clock-outline", back="hen"),
    ]
    json.dump(cfg, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
