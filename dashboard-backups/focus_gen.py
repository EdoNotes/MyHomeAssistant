"""Build the Focus-style config for the main dashboard.

usage: gen.py <backup.json> <url_base> <out.json>
Keeps every non-view key of the existing config and reuses the existing
actions / templates; only layout and styling change (no theme).
"""
import os
import re
import copy
import json
import sys

OLD = json.load(open(sys.argv[1], encoding="utf-8"))
BASE = sys.argv[2]
OUT = sys.argv[3]
V = {v["path"]: v for v in OLD["views"]}

ACC = "#0A6FD1"
SOFT = f"color-mix(in srgb, {ACC} 24%, var(--card-background-color))"
INK = f"color-mix(in srgb, {ACC} 45%, var(--primary-text-color))"
MUTED = "var(--secondary-text-color)"
TRACK = "color-mix(in srgb, var(--secondary-text-color) 32%, var(--card-background-color))"
FULL = {"columns": "full", "rows": "auto"}

CARD = "ha-card { border-radius: 24px !important; box-shadow: none !important; direction: rtl; }\n"
TILE = CARD + f"ha-card {{ --tile-color: {ACC} !important; --feature-border-radius: 14px; }}\n"


def mod(card, style):
    card = dict(card)
    card["card_mod"] = {"style": style}
    card.setdefault("grid_options", FULL)
    return card


def svc(service, entity=None, data=None, **extra):
    a = {"action": "call-service", "service": service}
    if entity:
        a["target"] = {"entity_id": entity}
    if data:
        a["data"] = data
    a.update(extra)
    return a


def nav_to(path):
    return {"action": "navigate", "navigation_path": f"/{BASE}/{path}"}


# ---------------------------------------------------------------- header
def header(title, subtitle):
    return mod(
        {"type": "custom:mushroom-title-card", "title": title, "subtitle": subtitle,
         "title_tap_action": {"action": "none"}, "subtitle_tap_action": {"action": "none"}},
        "ha-card { --title-font-size: 22px; --title-font-weight: 700; --title-line-height: 1.2;"
        " --subtitle-font-size: 13px; --subtitle-line-height: 1.4; --title-padding: 8px 4px 0;"
        f" --subtitle-color: {MUTED}; --title-spacing: 0px; direction: rtl; }}\n",
    )


# ---------------------------------------------------------------- icon rail
RAIL = [
    ("home", "אקלים", "mdi:snowflake"),
    ("boiler", "דוד מים", "mdi:water-boiler"),
    ("vacuum", "שואב", "mdi:robot-vacuum"),
    ("tv", "טלוויזיה", "mdi:television"),
    ("oven", "תנור", "mdi:stove"),
]


CHIP = (":host { display: block; width: 100%; }\n.content { gap: 6px; }\n.content > * { margin: 0 !important; }\n"
        "ha-card { width: 100%; box-sizing: border-box; justify-content: center;")


def rail(active):
    chips, flex = [], ""
    for i, (path, label, icon) in enumerate(RAIL, 1):
        on = path == active
        flex += (f".chip-container > :nth-child({i}) {{ flex: {'1 1 auto' if on else '0 0 48px'};"
                 " min-width: 0; }\n")
        if on:
            style = CHIP + (f" --chip-background: {ACC}; --text-color: #fff; --primary-text-color: #fff;"
                            " --color: #fff; font-weight: 600; }\n")
        else:
            style = CHIP + " --chip-padding: 0; }\n"
        chips.append({
            "type": "template", "icon": icon, "content": label if on else "",
            "icon_color": "white" if on else "disabled",
            "tap_action": nav_to(path), "hold_action": {"action": "none"},
            "double_tap_action": {"action": "none"},
            "card_mod": {"style": style},
        })
    return mod(
        {"type": "custom:mushroom-chips-card", "alignment": "justify", "chips": chips},
        "ha-card { direction: rtl; --chip-height: 48px; --chip-border-radius: 24px; --chip-icon-size: 22px;"
        " --chip-font-size: 15px; --chip-font-weight: 600; --chip-spacing: 8px;"
        " --chip-background: var(--card-background-color); --chip-box-shadow: none;"
        " --chip-border-width: 0; padding: 4px 0 6px; }\n"
        ".chip-container { flex-wrap: nowrap !important; gap: 8px; }\n" + flex,
    )


# ---------------------------------------------------------------- segmented control
def segmented(options):
    """options: list of (label, icon, active_jinja_condition, tap_action)"""
    chips = []
    for label, icon, cond, tap in options:
        chips.append({
            "type": "template", "content": label, "icon": icon,
            "icon_color": "{{ 'blue' if " + cond + " else 'disabled' }}",
            "tap_action": tap, "hold_action": {"action": "none"},
            "double_tap_action": {"action": "none"},
            "card_mod": {"style": (
                CHIP +
                " --chip-background: {{ '" + SOFT + "' if " + cond + " else 'transparent' }};"
                " --text-color: {{ '" + INK + "' if " + cond + " else '" + MUTED + "' }};"
                " --primary-text-color: {{ '" + INK + "' if " + cond + " else '" + MUTED + "' }};"
                " font-weight: {{ 600 if " + cond + " else 500 }}; }\n"
            )},
        })
    return mod(
        {"type": "custom:mushroom-chips-card", "alignment": "justify", "chips": chips},
        "ha-card { direction: rtl; --chip-height: 44px; --chip-border-radius: 14px; --chip-font-size: 14px;"
        " --chip-spacing: 4px; --chip-box-shadow: none; --chip-border-width: 0;"
        " --chip-icon-size: 18px;"
        " background: var(--card-background-color) !important; border-radius: 18px !important;"
        " padding: 4px !important; border: var(--ha-card-border-width, 1px) solid"
        " var(--ha-card-border-color, var(--divider-color)) !important; }\n"
        ".chip-container { flex-wrap: nowrap !important; gap: 4px; }\n"
        ".chip-container > * { flex: 1 1 0; min-width: 0; }\n",
    )


# ---------------------------------------------------------------- list rows
ROW = (
    "ha-card { background: none !important; border: none !important; box-shadow: none !important;"
    " border-radius: 0 !important; position: relative; padding-inline-end: 56px; direction: rtl; }\n"
)
SEP = "ha-card { border-bottom: 1px solid var(--divider-color) !important; }\n"


def row(card, kind=None, on=None, last=False):
    """Turn a mushroom template card into a list row. kind: 'switch' | 'nav' | None"""
    card = copy.deepcopy(card)
    for k in ("card_mod", "fill_container", "features_position", "grid_options"):
        card.pop(k, None)
    style = ROW + ("" if last else SEP)
    if kind == "switch":
        style += (
            "ha-card::after { content: ''; position: absolute; inset-inline-end: 4px; top: 50%;"
            " width: 48px; height: 28px; margin-top: -14px; border-radius: 14px;"
            " pointer-events: none; transition: background .2s;"
            " background: radial-gradient(circle at {{ '14px' if " + on + " else '34px' }} 50%,"
            " #fff 0 10.5px, transparent 11.5px),"
            " {{ '" + ACC + "' if " + on + " else '" + TRACK + "' }}; }\n"
        )
    elif kind == "nav":
        style += (
            "ha-card::after { content: ''; position: absolute; inset-inline-end: 12px; top: 50%;"
            " width: 9px; height: 9px; margin-top: -5px; pointer-events: none;"
            f" border-top: 2px solid {MUTED}; border-left: 2px solid {MUTED};"
            " transform: rotate(-45deg); }\n"
        )
    else:
        style = style.replace(" padding-inline-end: 56px;", "")
    card["card_mod"] = {"style": style}
    return card


def listcard(rows):
    return mod(
        {"type": "entities", "show_header_toggle": False, "entities": rows},
        CARD + ".card-content { padding: 4px 12px !important; }\n"
        "#states > * { margin: 0 !important; }\n",
    )


BOILER_ON = "is_state('switch.notes_boiler', 'on')"
BOILER_LEFT = (
    "{% set t = states('sensor.notes_boiler_remaining_time') %}"
    "{% if t.count(':') == 2 %}{% set p = t.split(':') %}"
    "{{ p[0] | int(0) * 60 + p[1] | int(0) }} דק'{% else %}{{ t }}{% endif %}"
)
VAC_STATUS = {
    "charging": "בטעינה", "charging_complete": "טעינה הושלמה", "cleaning": "מנקה",
    "returning_home": "חוזר לעגינה", "docking": "עוגן", "paused": "מושהה", "idle": "ממתין",
    "error": "שגיאה", "emptying_the_bin": "מרוקן מיכל", "washing_the_mop": "שוטף מגב",
    "going_to_wash_the_mop": "בדרך לשטיפת מגב", "segment_cleaning": "מנקה חדר",
    "zoned_cleaning": "מנקה אזור", "spot_cleaning": "ניקוי נקודתי",
    "charger_disconnected": "מטען מנותק", "attaching_the_mop": "מחבר מגב",
    "detaching_the_mop": "מנתק מגב", "device_offline": "לא מחובר", "starting": "מתחיל",
    "robot_status_mopping": "שוטף", "updating": "מתעדכן", "mapping": "ממפה",
}
VAC_TXT = (
    "{% set m = " + json.dumps(VAC_STATUS, ensure_ascii=False) + " %}"
    "{% set s = states('sensor.saros_20_complete_status') %}{{ m.get(s, s) }}"
)
OVEN_ON = "states('sensor.tnvr_machine_state') in ['run', 'running']"
OVEN_STATES = ["run", "running"]


def fmt_time(entity):
    return (
        "{% set t = states('" + entity + "') | as_datetime %}"
        "{{ (t | as_local).strftime('%H:%M') if t else '—' }}"
    )


# ---------------------------------------------------------------- views
def view(path, cards):
    old = V[path]
    v = {"type": "sections", "title": old["title"], "path": path, "icon": old["icon"],
         "max_columns": 1, "sections": [{"type": "grid", "cards": cards}]}
    if path != "home":
        v["subview"] = True
        v["back_path"] = f"/{BASE}/home"
    return v


# ---- home ---------------------------------------------------------------
HVAC_HE = {"off": "כבוי", "cool": "קירור", "heat": "חימום", "dry": "ייבוש", "fan_only": "אוורור",
           "heat_cool": "אוטומטי", "auto": "אוטומטי", "unavailable": "לא זמין"}
# mode -> (label, icon, colour); colours are the theme's own climate state colours, same as the dial uses
HVAC_UI = {
    "off": ("כבוי", "mdi:power", "var(--state-climate-off-color, var(--secondary-text-color))"),
    "cool": ("קירור", "mdi:snowflake", "var(--state-climate-cool-color, #2b9af9)"),
    "heat": ("חימום", "mdi:fire", "var(--state-climate-heat-color, #ff8100)"),
    "auto": ("אוטו", "mdi:thermostat-auto", "var(--state-climate-auto-color, #43a047)"),
    "heat_cool": ("אוטו", "mdi:sun-snowflake-variant", "var(--state-climate-heat_cool-color, #f1c447)"),
    "dry": ("ייבוש", "mdi:water-percent", "var(--state-climate-dry-color, #efbd07)"),
    "fan_only": ("אוורור", "mdi:fan", "var(--state-climate-fan_only-color, #8fbac0)"),
}
HVAC_ORDER = ["off", "cool", "heat", "auto", "heat_cool", "dry", "fan_only"]
FAN_UI = {"auto": ("אוטו", "mdi:fan-auto"), "low": ("נמוך", "mdi:fan-speed-1"),
          "medium": ("בינוני", "mdi:fan-speed-2"), "high": ("גבוה", "mdi:fan-speed-3")}
FAN_ORDER = ["auto", "low", "medium", "high"]
RING = "color-mix(in srgb, var(--secondary-text-color) 22%, var(--card-background-color))"
FAKE = os.environ.get("FAKE_MODE")  # preview only: draw the chips as if this mode were active


def imp(css):
    """card-mod's <style> sits before the component's own adopted stylesheet, so equal-specificity
    rules lose unless they are !important."""
    return re.sub(r"(?<!important)\s*;", " !important;", css)


def pills(options, vertical=False):
    """Row of separate rounded buttons. options: (label, icon, active_jinja_condition, colour, tap_action)"""
    chips = []
    for label, icon, cond, color, tap in options:
        tint = f"color-mix(in srgb, {color} 24%, var(--card-background-color))"
        ink = f"color-mix(in srgb, {color} 72%, var(--primary-text-color))"
        pick = lambda on, off: "{{ '" + on + "' if " + cond + " else '" + off + "' }}"
        chips.append({
            "type": "template", "content": label, "icon": icon,
            "tap_action": tap, "hold_action": {"action": "none"}, "double_tap_action": {"action": "none"},
            "card_mod": {"style": imp(
                ":host { display: block; width: 100%; }\n"
                ".content { gap: " + ("5px" if vertical else "7px") + "; padding: 0 2px !important;"
                + (" flex-direction: column;" if vertical else "") + " }\n"
                "::slotted(*) { margin: 0 !important; }\n"
                "::slotted(ha-state-icon) { color: " + pick(ink, MUTED) + " !important; }\n"
                "ha-card { width: 100%; min-width: 0; box-sizing: border-box; justify-content: center;"
                " transition: background .25s; --chip-background: " + pick(tint, "var(--card-background-color)") + ";"
                " --text-color: " + pick(ink, MUTED) + "; --chip-font-weight: " + pick("600", "500") + "; }\n"
                "ha-card:active { transform: scale(.96); }\n"
            )},
        })
    return mod(
        {"type": "custom:mushroom-chips-card", "alignment": "justify", "chips": chips},
        "ha-card { direction: rtl; background: none !important; border: none !important; box-shadow: none !important;"
        f" --chip-height: {'64px' if vertical else '46px'}; --chip-border-radius: {'20px' if vertical else '16px'};"
        f" --chip-font-size: {'11.5px' if vertical else '13.5px'}; --chip-icon-size: {'24px' if vertical else '19px'};"
        " --chip-spacing: 0px; --chip-padding: 0; --chip-box-shadow: none; --chip-border-width: 0; }\n"
        ".chip-container { flex-wrap: nowrap !important; gap: 8px !important; margin: 0 !important; }\n"
        ".chip-container > * { flex: 1 1 0; min-width: 0; margin: 0 !important; }\n",
    )


def mode_pills(entity, modes):
    opts = []
    for m in sorted(modes, key=HVAC_ORDER.index):
        label, icon, color = HVAC_UI[m]
        cond = f"is_state('{entity}', '{m}')" if not FAKE else ("true" if m == FAKE else "false")
        opts.append((label, icon, cond, color, svc("climate.set_hvac_mode", entity, {"hvac_mode": m})))
    return pills(opts, vertical=True)


def fan_pills(entity, modes):
    opts = []
    for m in sorted(modes, key=FAN_ORDER.index):
        label, icon = FAN_UI[m]
        opts.append((label, icon, f"is_state_attr('{entity}', 'fan_mode', '{m}')", ACC,
                     svc("climate.set_fan_mode", entity, {"fan_mode": m})))
    return pills(opts)


def dial_style(entity):
    """Restyle the built-in thermostat card (its own drag / +- / more-info stay as they are):
    hairline ring with a glowing arc and a bead for the setpoint, a ring of ticks, light oversized number."""
    label = ("{% set s = states('" + entity + "') %}{{ "
             + json.dumps(HVAC_HE, ensure_ascii=False).replace('"', "'") + ".get(s, s) }}")
    if FAKE:
        label = HVAC_HE[FAKE]
    return {
        ".": imp(
            "ha-card { direction: ltr; background: none; border: none;"
            " box-shadow: none; overflow: visible; }\n"
            ".title { display: none; }\n"
            ".container { overflow: visible; }\n"
            ".container > * { padding: 2px 8px 0; }\n"
            f".more-info {{ color: {MUTED}; opacity: .7; }}\n"
            "hui-card-features { display: none; }\n"
        ),
        "ha-state-control-climate-temperature $": imp(
            ".info { gap: 0; padding-bottom: 34px; }\n"
            ".info > .label:not(.secondary) { display: none; }\n"
            ".info::before { content: \"" + label + "\"; font-size: 12.5px; font-weight: 600; line-height: 1;"
            " padding: 6px 12px; border-radius: 99px; margin-bottom: 6px;"
            " color: color-mix(in srgb, var(--state-color) 72%, var(--primary-text-color));"
            " background: color-mix(in srgb, var(--state-color) 20%, transparent); }\n"
            "ha-big-number { font-size: 92px; font-weight: 300; letter-spacing: -4px; line-height: 1; }\n"
            ".label.secondary { display: block; direction: rtl; width: auto; min-height: 0; margin-top: 4px;"
            f" font-size: 13px; font-weight: 400; color: {MUTED}; }}\n"
            ".label.secondary ha-svg-icon { display: none; }\n"
            ".label.secondary::before { content: 'בחדר עכשיו \\2066'; }\n"
            ".buttons { bottom: 6px; gap: 20px; }\n"
            ".buttons ha-outlined-icon-button { --ha-icon-button-size: 46px;"
            " --ha-outlined-icon-button-outline-color: transparent;"
            " background: var(--card-background-color); border-radius: 50%; color: var(--primary-text-color); }\n"
            f"ha-control-circular-slider {{ position: relative; --control-circular-slider-background: {RING};"
            " --control-circular-slider-background-opacity: 1; }\n"
            # ring of ticks just inside the track, over the same 270 degrees
            "ha-control-circular-slider::before { content: ''; position: absolute; inset: 9.5%; border-radius: 50%;"
            " pointer-events: none; opacity: .38;"
            " background: repeating-conic-gradient(from 224.6deg, var(--secondary-text-color) 0 .8deg,"
            " transparent .8deg 7.5deg);"
            " -webkit-mask: radial-gradient(closest-side, transparent calc(100% - 7px), #000 calc(100% - 6px)),"
            " conic-gradient(from 224deg, #000 0 272deg, transparent 272deg);"
            " -webkit-mask-composite: source-in; mask-composite: intersect; }\n"
            "ha-control-circular-slider::after { inset: 0; opacity: .24;"
            " background: radial-gradient(closest-side, var(--action-color, transparent) 0%, transparent 84%); }\n"
        ),
        "ha-state-control-climate-temperature $ ha-big-number $": imp(
            ".addon { width: 0; overflow: visible; padding: 0; align-self: flex-start; }\n"
            ".unit { font-size: 0; }\n"
            f".unit::before {{ content: '°'; font-size: 44px; font-weight: 300; letter-spacing: 0; color: {MUTED}; }}\n"
        ),
        "ha-state-control-climate-temperature $ ha-control-circular-slider $": imp(
            ".background, .arc { stroke-width: 6px; }\n"
            ".arc-colored { opacity: 1; filter: drop-shadow(0 0 5px var(--control-circular-slider-color)); }\n"
            ".inactive .arc-colored { opacity: 0; filter: none; }\n"
            ".target-border { stroke-width: 24px; }\n"
            ".target { stroke-width: 13px; }\n"
            ".current { stroke-width: 11px; opacity: .9; }\n"
        ),
    }


def home():
    old = V["home"]["cards"]
    room_chips = old[1]["cards"][0]["chips"]
    climates = ["climate.khdr_shynh_hvrym", "climate.mzgn_khdr_yldym", "climate.myny_mrkzy_tvrndv"]
    cards = [
        header("הבית", (
            "{% set n = [" + ", ".join(f"'{c}'" for c in climates) + "]"
            " | reject('is_state', 'off') | reject('is_state', 'unavailable') | list | count %}"
            "{{ 'כל המזגנים כבויים' if n == 0 else ('מזגן אחד פועל' if n == 1 else n ~ ' מזגנים פועלים') }}"
        )),
        rail("home"),
        segmented([
            (c["content"], c["icon"],
             "is_state('input_select.thermostat_tab', '" + c["tap_action"]["data"]["option"] + "')",
             c["tap_action"])
            for c in room_chips
        ]),
    ]
    for cond in old[1]["cards"][1:]:
        tile = cond["card"]["cards"][0]
        fan = [c["tap_action"]["data"]["fan_mode"] for c in cond["card"]["cards"][1]["chips"]]
        hvac = next(f for f in tile["features"] if f["type"] == "climate-hvac-modes")["hvac_modes"]
        cards.append({
            "type": "conditional", "conditions": cond["conditions"], "grid_options": FULL,
            "card": mod({
                "type": "thermostat", "entity": tile["entity"], "name": tile["name"],
                "show_current_as_primary": False,
            }, dial_style(tile["entity"])),
        })
        for extra in (mode_pills(tile["entity"], hvac), fan_pills(tile["entity"], fan)):
            cards.append({"type": "conditional", "conditions": cond["conditions"], "grid_options": FULL,
                          "card": extra})
    return view("home", cards)


# ---- boiler -------------------------------------------------------------
def hero(card, on, color=ACC, size=216):
    """Big round hero button from a mushroom template card."""
    card = copy.deepcopy(card)
    for k in ("card_mod", "fill_container", "features_position", "layout"):
        card.pop(k, None)
    card["vertical"] = True
    card["multiline_secondary"] = True
    soft = f"color-mix(in srgb, {color} 24%, var(--card-background-color))"
    return mod(card, (
        f":host {{ display: block; }}\n"
        f"ha-card {{ width: {size}px !important; height: {size}px !important; margin: 14px auto 10px;"
        " direction: rtl; box-sizing: border-box;"
        " border-radius: 50% !important; display: flex; flex-direction: column;"
        " justify-content: center; align-items: center; text-align: center;"
        " box-shadow: none !important; transition: background .3s, border-color .3s;"
        " background: {{ '" + soft + "' if " + on + " else 'var(--card-background-color)' }} !important;"
        " border: 6px solid {{ '" + color + "' if " + on + " else 'var(--divider-color)' }} !important;"
        " --ha-tile-info-primary-font-size: 22px; --ha-tile-info-primary-font-weight: 600;"
        " --ha-tile-info-primary-line-height: 30px;"
        " --ha-tile-info-secondary-font-size: 13px; }\n"
        "ha-tile-icon { --tile-icon-size: 64px; --mdc-icon-size: 36px; }\n"
    ))


def boiler():
    old = V["boiler"]["cards"]
    main, timer, start = old
    h = dict(main)
    h["primary"] = "{{ 'פועל' if " + BOILER_ON + " else 'כבוי' }}"
    h["secondary"] = "{% if " + BOILER_ON + " %}נותרו " + BOILER_LEFT + "{% else %}הקש להפעלה{% endif %}"
    h["color"] = "{{ 'blue' if " + BOILER_ON + " else 'grey' }}"
    h.pop("icon_color", None)
    h["hold_action"] = {"action": "more-info", "entity": "switch.notes_boiler"}
    t = {k: v for k, v in timer.items() if k != "card_mod"}
    t["features_position"] = "bottom"
    s = {k: v for k, v in start.items() if k not in ("card_mod", "fill_container", "icon_color")}
    s["primary"] = "הפעל דוד · {{ states('input_number.boiler_timer_minutes') | int(0) }} דקות"
    s.pop("secondary", None)
    s["color"] = "white"
    return view("boiler", [
        header("דוד מים", "{% if " + BOILER_ON + " %}פועל · נותרו " + BOILER_LEFT + "{% else %}כבוי{% endif %}"
               "{% if is_state('binary_sensor.boiler_daily_schedule', 'on') %} · תזמון יומי פעיל{% endif %}"),
        rail("boiler"),
        hero(h, BOILER_ON),
        mod(t, TILE),
        mod(s, (
            f"ha-card {{ background: {ACC} !important; border: none !important;"
            " border-radius: 24px !important; box-shadow: none !important; min-height: 56px;"
            " --primary-text-color: #fff; --secondary-text-color: rgba(255,255,255,.8);"
            " --ha-tile-info-primary-font-size: 16px; --ha-tile-info-primary-font-weight: 600; direction: rtl; }\n"
            "ha-card:active { transform: scale(.98); }\n"
        )),
    ])


# ---- oven ---------------------------------------------------------------
def oven():
    old = V["oven"]["cards"]
    main, end1, end2, buttons = old
    stop, light = buttons["cards"]
    h = dict(main)
    h["primary"] = "{% if " + OVEN_ON + " %}{{ states('sensor.tnvr_temperature') }}°C{% else %}כבוי{% endif %}"
    h["secondary"] = (
        "{% if " + OVEN_ON + " %}{{ state_translated('sensor.tnvr_oven_mode') }}\n"
        "יעד {{ states('sensor.tnvr_setpoint') }}°C{% else %}תא ראשי{% endif %}"
    )
    h["color"] = "{{ 'orange' if " + OVEN_ON + " else 'grey' }}"
    h.pop("icon_color", None)
    e1 = copy.deepcopy(end1)
    e1["conditions"] = [{"condition": "state", "entity": "sensor.tnvr_machine_state", "state": OVEN_STATES}]
    e1["card"] = {"type": "custom:mushroom-template-card", "primary": "זמן סיום",
                  "secondary": fmt_time("sensor.tnvr_completion_time"), "icon": "mdi:timer-sand",
                  "color": "purple",
                  "tap_action": {"action": "more-info", "entity": "sensor.tnvr_completion_time"}}
    e2 = copy.deepcopy(end2)
    e2["card"] = {"type": "custom:mushroom-template-card", "primary": "זמן סיום · תא שני",
                  "secondary": fmt_time("sensor.tnvr_second_cavity_completion_time"),
                  "icon": "mdi:timer-sand", "color": "purple",
                  "tap_action": {"action": "more-info", "entity": "sensor.tnvr_second_cavity_completion_time"}}
    for e in (e1, e2):
        e["grid_options"] = FULL
        e["card"] = mod(e["card"], CARD)
    st = {k: v for k, v in stop.items() if k not in ("card_mod", "icon_color")}
    st["color"] = "red"
    li = {k: v for k, v in light.items() if k not in ("card_mod", "icon_color")}
    li["color"] = "{{ 'amber' if is_state('light.tnvr_light', 'on') else 'grey' }}"
    li["secondary"] = "{{ 'דולקת' if is_state('light.tnvr_light', 'on') else 'כבויה' }}"
    li["hold_action"] = {"action": "more-info", "entity": "light.tnvr_light"}
    half = {"columns": 6, "rows": "auto"}
    st["grid_options"] = half
    li["grid_options"] = half
    return view("oven", [
        header("תנור", "{% if " + OVEN_ON + " %}פועל · {{ state_translated('sensor.tnvr_oven_mode') }} · "
               "{{ states('sensor.tnvr_temperature') }}°C ← {{ states('sensor.tnvr_setpoint') }}°C"
               "{% else %}כבוי{% endif %}"),
        rail("oven"),
        hero(h, OVEN_ON, color="#E8710A"),
        e1, e2,
        mod(st, CARD + "ha-card:active { transform: scale(.97); }\n"),
        mod(li, CARD + "ha-card { background: {{ '" + "color-mix(in srgb, #F2B705 22%, var(--card-background-color))"
            + "' if is_state('light.tnvr_light', 'on') else 'var(--card-background-color)' }} !important; }\n"
            "ha-card:active { transform: scale(.97); }\n"),
    ])


# ---- vacuum -------------------------------------------------------------
def vacuum():
    old = V["vacuum"]["cards"]
    status, vc_clean, vc_idle, selects, sel_map, f25 = old
    cards = [
        header("שואב", "Saros 20 · " + VAC_TXT + " · {{ states('sensor.saros_20_complete_battery') }}%"),
        rail("vacuum"),
    ]
    for c in (vc_clean, vc_idle):
        c = copy.deepcopy(c)
        c["grid_options"] = FULL
        for s in c["card"]["stats"].values():
            for x in s:
                if x.get("attribute") == "battery_level":  # attribute no longer exists on the entity
                    x.pop("attribute")
                    x.update(entity_id="sensor.saros_20_complete_battery", subtitle="סוללה")
                if "entity" in x:  # vacuum-card reads entity_id, so these stats never rendered
                    x["entity_id"] = x.pop("entity")
        c["card"] = mod(c["card"], CARD + "ha-card { overflow: hidden; }\n")
        cards.append(c)
    half = {"columns": 6, "rows": "auto"}
    for t in selects["cards"]:
        cards.append(mod({**t, "grid_options": half}, TILE))
    cards.append(mod(dict(sel_map), TILE))
    s = dict(status)
    s["primary"] = "Saros 20 · " + VAC_TXT
    f = dict(f25)
    cards.append(listcard([row(s, "nav"), row(f, "nav", last=True)]))
    return view("vacuum", cards)


# ---- tv -----------------------------------------------------------------
WELL = "var(--primary-background-color)"
URC_STYLE = f"""
ha-card {{ border-radius: 24px !important; box-shadow: none !important; padding: 18px 14px 20px !important;
  gap: 8px; --lovelace-background: {WELL}; }}
.row {{ width: 100%; box-sizing: border-box; padding: 6px 4px; gap: 10px; }}
remote-button {{ width: 56px; height: 56px; flex: 0 0 56px; --icon-size: 26px; }}
remote-button::part(button) {{ background: {WELL}; border-radius: 50%; }}
.empty-button {{ width: 56px; height: 56px; flex: 0 0 56px; }}
#power {{ --icon-color: var(--error-color); }}
#power::part(button) {{ background: color-mix(in srgb, var(--error-color) 18%, var(--card-background-color)); }}
remote-slider {{ flex: 1 1 auto; --color: {ACC}; --height: 44px; }}
remote-circlepad {{ width: 264px; --black-color: transparent; --icon-size: 30px;
  --icon-color: var(--secondary-text-color); }}
remote-circlepad::part(center) {{ --icon-color: {ACC}; }}
"""


def tv():
    old = V["tv"]["cards"]
    dev, navm = old[0]["cards"], old[1]["cards"]
    cards = [
        header("טלוויזיה", (
            "{% if is_state('input_boolean.tv_device_mode', 'off') %}Samsung TV · "
            "{{ 'פועלת' if is_state('media_player.samsung_cu7100_65_tv_3', 'on') else 'כבויה' }}"
            "{% else %}Android TV · "
            "{{ 'כבוי' if states('media_player.partnertv_box') in ['off', 'unavailable', 'unknown', 'standby'] else 'פועל' }}"
            "{% endif %}"
        )),
        rail("tv"),
        segmented([
            ("Samsung TV", "mdi:television", "is_state('input_boolean.tv_device_mode', 'off')", dev[0]["tap_action"]),
            ("Android TV", "mdi:android", "is_state('input_boolean.tv_device_mode', 'on')", dev[1]["tap_action"]),
        ]),
        segmented([
            ("חיצים", "mdi:arrow-all", "is_state('input_boolean.tv_navigation_mode', 'on')", navm[1]["tap_action"]),
            ("משטח מגע", "mdi:gesture-swipe", "is_state('input_boolean.tv_navigation_mode', 'off')", navm[0]["tap_action"]),
        ]),
    ]
    for cond in old[2:]:
        c = copy.deepcopy(cond)
        r = c["card"]
        rows = r["rows"]
        pad = ["touchpad"] if ["touchpad"] in rows else ["circlepad"]
        rest = [x for x in rows if x not in (["touchpad"], [None, "up", None], ["left", "center", "right"],
                                             [None, "down", None], ["back", "power", "home"])]
        if r["platform"] == "Samsung TV":  # previous / next are not Samsung keys (rendered empty)
            rest = [[{"previous": "rewind", "next": "fast_forward"}.get(k, k) for k in x] for x in rest]
        r["rows"] = [pad, ["back", "power", "home"]] + rest
        r["styles"] = URC_STYLE
        r["grid_options"] = FULL
        c["grid_options"] = FULL
        cards.append(c)
    return view("tv", cards)


cfg = {k: v for k, v in OLD.items() if k != "views"}
cfg["views"] = [home(), vacuum(), tv(), boiler(), oven()]
json.dump(cfg, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("views:", [(v["path"], len(v["sections"][0]["cards"])) for v in cfg["views"]])
