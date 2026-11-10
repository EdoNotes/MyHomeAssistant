#!/usr/bin/env python3
"""Generate the "Focus" config for the Pi-hole dashboard and the children dashboard.

usage: pihole_focus_gen.py pihole   <backup.json> <dashboard url_path> <out.json>
       pihole_focus_gen.py children <backup.json> <dashboard url_path> <out.json>

Same visual language as focus_gen.py (main dashboard): no theme, only installed cards
(mushroom, card-mod) plus built-in ones. Entities, actions and the per-view `visible`
list are taken from the backup, so permissions stay exactly as they were.
"""
import json
import sys

KIND, BACKUP, BASE, OUT = sys.argv[1:5]
OLD = json.load(open(BACKUP, encoding="utf-8"))

ACC = "#0A6FD1"
MUTED = "var(--secondary-text-color)"
FULL = {"columns": "full", "rows": "auto"}
HALF = {"columns": 6, "rows": "auto"}
CARD = "ha-card { border-radius: 24px !important; box-shadow: none !important; direction: rtl; }\n"
ROW = ("ha-card { background: none !important; border: none !important; box-shadow: none !important;"
       " border-radius: 0 !important; position: relative; direction: rtl; }\n")
SEP = "ha-card { border-bottom: 1px solid var(--divider-color) !important; }\n"
FRAME = ("ha-card{border:none!important;border-radius:0!important;box-shadow:none!important;"
         "background:#181825!important;overflow:hidden!important}")
NONE = {"action": "none"}

SW = "switch.pi_hole"
ON = f"is_state('{SW}', 'on')"
PCT = "{{ states('sensor.pi_hole_ads_percentage_blocked') | float(0) | round(1) }}%"


def num(entity):
    return "{{ '{:,}'.format(states('" + entity + "') | int(0)) }}"


def mod(card, style, grid=FULL):
    card = dict(card)
    card["card_mod"] = {"style": style}
    card.setdefault("grid_options", grid)
    return card


def header(title, subtitle):
    return mod(
        {"type": "custom:mushroom-title-card", "title": title, "subtitle": subtitle,
         "title_tap_action": NONE, "subtitle_tap_action": NONE},
        "ha-card { --title-font-size: 22px; --title-font-weight: 700; --title-line-height: 1.2;"
        " --subtitle-font-size: 13px; --subtitle-line-height: 1.4; --title-padding: 8px 4px 0;"
        f" --subtitle-color: {MUTED}; --title-spacing: 0px; direction: rtl; }}\n",
    )


def hero():
    soft = f"color-mix(in srgb, {ACC} 24%, var(--card-background-color))"
    return mod({
        "type": "custom:mushroom-template-card",
        "primary": "{% if " + ON + " %}" + PCT + "{% else %}כבויה{% endif %}",
        "secondary": "{{ 'מהשאילתות נחסמו' if " + ON + " else 'הקש להפעלת ההגנה' }}",
        "icon": "{{ 'mdi:shield-check' if " + ON + " else 'mdi:shield-off-outline' }}",
        "color": "{{ 'blue' if " + ON + " else 'grey' }}",
        "vertical": True, "multiline_secondary": True,
        "tap_action": {"action": "call-service", "service": "switch.toggle", "target": {"entity_id": SW},
                       "haptic": "medium",
                       "confirmation": {"text": "להפעיל או לכבות את חסימת הפרסומות של Pi-hole?"}},
        "hold_action": {"action": "more-info", "entity": SW},
    }, (
        ":host { display: block; }\n"
        "ha-card { width: 216px !important; height: 216px !important; margin: 14px auto 10px;"
        " direction: rtl; box-sizing: border-box; border-radius: 50% !important; display: flex;"
        " flex-direction: column; justify-content: center; align-items: center; text-align: center;"
        " box-shadow: none !important; transition: background .3s, border-color .3s;"
        " background: {{ '" + soft + "' if " + ON + " else 'var(--card-background-color)' }} !important;"
        " border: 6px solid {{ '" + ACC + "' if " + ON + " else 'var(--divider-color)' }} !important;"
        " --ha-tile-info-primary-font-size: 30px; --ha-tile-info-primary-font-weight: 600;"
        " --ha-tile-info-primary-line-height: 38px; --ha-tile-info-secondary-font-size: 13px; }\n"
        "ha-tile-icon { --tile-icon-size: 64px; --mdc-icon-size: 36px; }\n"
    ))


def stat(entity, label, icon):
    return mod({
        "type": "custom:mushroom-template-card", "primary": num(entity), "secondary": label, "icon": icon,
        "color": "blue", "tap_action": {"action": "more-info", "entity": entity},
        "hold_action": NONE, "double_tap_action": NONE,
    }, CARD + "ha-card { --ha-tile-info-primary-font-size: 20px; --ha-tile-info-primary-font-weight: 600;"
              " --ha-tile-info-primary-line-height: 26px; --ha-tile-info-secondary-font-size: 12px; }\n", HALF)


def row(primary, secondary, icon, tap, nav=False, last=False, color="blue"):
    style = ROW + ("" if last else SEP)
    if nav:
        style += (
            "ha-card { padding-inline-end: 40px; }\n"
            "ha-card::after { content: ''; position: absolute; inset-inline-end: 12px; top: 50%;"
            " width: 9px; height: 9px; margin-top: -5px; pointer-events: none;"
            f" border-top: 2px solid {MUTED}; border-left: 2px solid {MUTED};"
            " transform: rotate(-45deg); }\n")
    return {"type": "custom:mushroom-template-card", "primary": primary, "secondary": secondary, "icon": icon,
            "color": color, "tap_action": tap, "hold_action": NONE, "double_tap_action": NONE,
            "card_mod": {"style": style}}


def listcard(rows):
    return mod({"type": "entities", "show_header_toggle": False, "entities": rows},
               CARD + ".card-content { padding: 4px 12px !important; }\n#states > * { margin: 0 !important; }\n")


def label(text):
    return mod({"type": "custom:mushroom-title-card", "title": "", "subtitle": text,
                "title_tap_action": NONE, "subtitle_tap_action": NONE},
               "ha-card { --subtitle-font-size: 13px; --subtitle-font-weight: 600; --title-padding: 6px 6px 0;"
               f" --subtitle-color: {MUTED}; --title-spacing: 0px; direction: rtl; }}\n")


def info(entity):
    return {"action": "more-info", "entity": entity}


def frame_view(path, title, icon, url, visible, back=None):
    v = {"title": title, "path": path, "icon": icon, "type": "panel",
         "cards": [{"type": "iframe", "url": url, "aspect_ratio": "100%", "card_mod": {"style": FRAME}}]}
    if visible is not None:
        v["visible"] = visible
    if back:
        v["subview"] = True
        v["back_path"] = f"/{BASE}/{back}"
    return v


def pihole():
    old = OLD["views"][0]
    visible = old["visible"]
    assert visible and all(v.get("visible") == visible for v in OLD["views"]), "unexpected visibility in backup"
    urls = {c["url"].split("/")[-1].split("?")[0]: c["url"].split("?")[0] for c in old["cards"] if c["type"] == "iframe"}

    def upd(entity, name, last=False):
        on = f"is_state('{entity}', 'on')"
        return row(name, "{{ 'יש עדכון · ' ~ state_attr('" + entity + "', 'latest_version') if " + on +
                   " else 'מעודכן · ' ~ (state_attr('" + entity + "', 'installed_version') or '') }}",
                   "{{ 'mdi:arrow-up-circle' if " + on + " else 'mdi:check-circle-outline' }}", info(entity),
                   last=last, color="{{ 'orange' if " + on + " else 'grey' }}")

    cards = [
        header("Pi-hole", "{% if is_state('binary_sensor.pi_hole_status', 'on') %}"
               "{{ 'ההגנה פעילה' if " + ON + " else 'ההגנה כבויה' }}"
               " · " + num("sensor.pi_hole_ads_blocked") + " חסימות היום{% else %}השירות לא זמין{% endif %}"),
        hero(),
        stat("sensor.pi_hole_dns_queries", "שאילתות DNS", "mdi:dns-outline"),
        stat("sensor.pi_hole_ads_blocked", "נחסמו", "mdi:shield-check-outline"),
        stat("sensor.pi_hole_dns_unique_clients", "מכשירים פעילים", "mdi:devices"),
        stat("sensor.pi_hole_dns_unique_domains", "דומיינים", "mdi:web"),
        listcard([
            row("מכשירים מחוברים לרשת", "{{ states('sensor.pi_hole_seen_clients') }} מכשירים נראו ב-Pi-hole",
                "mdi:wifi", {"action": "navigate", "navigation_path": f"/{BASE}/devices"}, nav=True),
            row("אתרים נפוצים לפי מכשיר", "הדומיינים המבוקשים ביותר", "mdi:format-list-numbered-rtl",
                {"action": "navigate", "navigation_path": f"/{BASE}/sites"}, nav=True, last=True),
        ]),
        label("פעילות DNS · 24 שעות"),
        mod({"type": "history-graph", "hours_to_show": 24, "entities": [
            {"entity": "sensor.pi_hole_dns_queries", "name": "שאילתות"},
            {"entity": "sensor.pi_hole_dns_queries_cached", "name": "מהמטמון"},
            {"entity": "sensor.pi_hole_ads_percentage_blocked", "name": "אחוז חסימה"},
        ]}, CARD + "ha-card { direction: ltr; padding-top: 8px; }\n"),
        label("רשת"),
        listcard([
            row(num("sensor.pi_hole_domains_blocked"), "דומיינים ברשימת החסימה", "mdi:playlist-remove",
                info("sensor.pi_hole_domains_blocked")),
            row(num("sensor.pi_hole_dns_queries_cached"), "שאילתות שנענו מהמטמון", "mdi:cached",
                info("sensor.pi_hole_dns_queries_cached")),
            row(num("sensor.pi_hole_dns_queries_forwarded"), "שאילתות שהועברו הלאה", "mdi:arrow-top-left",
                info("sensor.pi_hole_dns_queries_forwarded"), last=True),
        ]),
        label("עדכונים"),
        listcard([
            upd("update.pi_hole_core_update_available", "Core"),
            upd("update.pi_hole_ftl_update_available", "FTL"),
            upd("update.pi_hole_web_update_available", "Web", last=True),
        ]),
    ]
    main = {"type": "sections", "title": old["title"], "path": old["path"], "icon": old["icon"],
            "max_columns": 1, "visible": visible, "sections": [{"type": "grid", "cards": cards}]}
    cfg = {k: v for k, v in OLD.items() if k != "views"}
    cfg["views"] = [
        main,
        frame_view("devices", "מכשירים ברשת", "mdi:wifi", urls["wifi_devices.html"] + "?v=focus1", visible, old["path"]),
        frame_view("sites", "אתרים נפוצים", "mdi:format-list-numbered-rtl",
                   urls["pihole_top_sites.html"] + "?v=focus1", visible, old["path"]),
    ]
    return cfg


def children():
    old = OLD["views"][0]
    (card,) = old["cards"]
    cfg = {k: v for k, v in OLD.items() if k != "views"}
    cfg["views"] = [frame_view(old["path"], old["title"], old["icon"], card["url"], old.get("visible"))]
    return cfg


cfg = {"pihole": pihole, "children": children}[KIND]()
json.dump(cfg, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("views:", [(v["path"], v["type"], v.get("visible")) for v in cfg["views"]])
