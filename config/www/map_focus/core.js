/* Focus map dashboard — shared helpers. No token, no stored data: reads the parent HA frontend. */
window.MF = (function () {
  const MF = {};
  const q = new URLSearchParams(location.search);
  MF.page = q.get('p') || 'both';

  MF.PEOPLE = {
    edo: { key: 'edo', name: 'עידו', init: 'ע', ring: '#89b4fa', fem: false, person: 'person.edonotes',
      dist: 'sensor.byt_edonotes_distance', dir: 'sensor.byt_edonotes_direction_of_travel',
      bat: 'sensor.sm_s942b_battery_level', batState: 'sensor.sm_s942b_battery_state',
      geo: 'sensor.sm_s942b_geocoded_location', act: 'sensor.sm_s942b_detected_activity', eta: 'sensor.waze_edo_to_home' },
    hen: { key: 'hen', name: 'חן', init: 'ח', ring: '#f38ba8', fem: true, person: 'person.hen',
      dist: 'sensor.byt_hen_s_phone_distance', dir: 'sensor.byt_hen_s_phone_direction_of_travel',
      bat: 'sensor.sm_s918b_battery_level', batState: 'sensor.sm_s918b_battery_state',
      geo: 'sensor.sm_s918b_geocoded_location', act: null, eta: 'sensor.waze_hen_to_home' },
  };

  /* ---------- Home Assistant access ---------- */
  MF.hass = function () {
    try { return parent !== window ? parent.document.querySelector('home-assistant').hass : null; }
    catch (e) { return null; }
  };
  MF.st = function (id) { const h = MF.hass(); return id && h ? h.states[id] : undefined; };
  MF.val = function (id) {
    const s = MF.st(id);
    return s && s.state !== 'unknown' && s.state !== 'unavailable' ? s.state : null;
  };
  MF.nav = function (view, replace) {
    const base = parent.location.pathname.split('/')[1] || 'dashboard-map';
    const path = '/' + base + '/' + view;
    parent.history[replace ? 'replaceState' : 'pushState'](null, '', path);
    parent.dispatchEvent(new parent.CustomEvent('location-changed', { detail: { replace: !!replace } }));
  };

  /* ---------- DOM ---------- */
  MF.el = function (tag, attrs, kids) {
    const e = document.createElement(tag);
    for (const k in (attrs || {})) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    [].concat(kids || []).forEach(function (c) { if (c != null) e.append(c); });
    return e;
  };
  const IC = {
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>',
    fit: '<path d="M4 9V5h4"/><path d="M16 5h4v4"/><path d="M20 15v4h-4"/><path d="M8 19H4v-4"/>',
    chev: '<path d="M15 6l-6 6 6 6"/>',
    x: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.3"/>',
    route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>',
    car: '<path d="M5 16v2"/><path d="M19 16v2"/><path d="M4 16h16v-4l-2-5H6l-2 5z"/><path d="M7.5 13h.01"/><path d="M16.5 13h.01"/>',
    walk: '<circle cx="13" cy="4.5" r="1.6"/><path d="M9 21l2.5-6-2-2.5 1-4.5 3 2.5 3 1"/><path d="M14 21l-1-4"/><path d="M10.5 8l-3 1.5-.5 3"/>',
    bike: '<circle cx="6" cy="16.5" r="3.2"/><circle cx="18" cy="16.5" r="3.2"/><path d="M6 16.5l4-7h5l3 7"/><path d="M10 9.5l2.5 7"/><path d="M14 6.5h2.5"/>',
    pause: '<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6"/><path d="M14 9v6"/>',
    bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
  };
  MF.icon = function (name, size, sw) {
    return '<svg aria-hidden="true" viewBox="0 0 24 24" width="' + (size || 18) + '" height="' + (size || 18) +
      '" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.9) + '" stroke-linecap="round" stroke-linejoin="round">' + IC[name] + '</svg>';
  };
  MF.batIcon = function (pct) {
    const n = pct == null ? 0 : Math.max(1, Math.round(pct / 25));
    let bars = '';
    for (let i = 0; i < n; i++) bars += '<path d="M' + (6.5 + i * 3) + ' 11v3"/>';
    return '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="16" height="9" rx="2"/><path d="M22 11v3"/>' + bars + '</svg>';
  };

  /* ---------- formatting (Hebrew) ---------- */
  const p2 = function (n) { return (n < 10 ? '0' : '') + n; };
  MF.hm = function (ms) { const d = new Date(ms); return p2(d.getHours()) + ':' + p2(d.getMinutes()); };
  MF.dur = function (ms) {
    const m = Math.max(0, Math.round(ms / 60000));
    if (m < 1) return 'פחות מדקה';
    if (m < 60) return m + " דק'";
    const h = Math.floor(m / 60), r = m % 60;
    return r ? h + ':' + p2(r) + " שע'" : h + " שע'";
  };
  MF.km = function (meters) {           // -> [number, unit]
    if (meters == null || isNaN(meters)) return ['—', ''];
    if (meters < 950) return [String(Math.round(meters / 10) * 10), "מ'"];
    const k = meters / 1000;
    return [k < 100 ? k.toFixed(1) : String(Math.round(k)), 'ק"מ'];
  };
  MF.kmText = function (meters) { const a = MF.km(meters); return a[1] ? a[0] + ' ' + a[1] : a[0]; };
  MF.ago = function (ms) {
    const m = Math.round((Date.now() - ms) / 60000);
    if (!isFinite(m)) return '';
    if (m < 1) return 'עודכן עכשיו';
    if (m === 1) return 'עודכן לפני דקה';
    if (m < 60) return 'עודכן לפני ' + m + " דק'";
    const h = Math.round(m / 60);
    return h === 1 ? 'עודכן לפני שעה' : 'עודכן לפני ' + h + " שע'";
  };
  MF.haversine = function (a, b, c, d) {
    const R = 6371000, r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r;
    const s = Math.sin(x / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(y / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  };

  /* ---------- live person snapshot ---------- */
  MF.snap = function (p) {
    const s = MF.st(p.person) || { state: 'unknown', attributes: {} };
    const a = s.attributes || {}, src = MF.st(a.source);
    const distS = MF.st(p.dist), dv = MF.val(p.dist);
    let dist = dv == null ? null : parseFloat(dv);
    if (dist != null && distS && /^km$/i.test(distS.attributes.unit_of_measurement || '')) dist *= 1000;
    const bat = MF.val(p.bat), z = s.state;
    const o = {
      p: p, zone: z, home: z === 'home', away: z === 'not_home', known: z !== 'unknown' && z !== 'unavailable',
      lat: a.latitude, lon: a.longitude, pic: a.entity_picture || null, source: a.source || null,
      since: Date.parse(s.last_changed), updated: Date.parse((src || s).last_updated),
      dist: dist, dir: MF.val(p.dir), bat: bat == null ? null : Math.round(parseFloat(bat)),
      batState: MF.val(p.batState), addr: MF.val(p.geo), act: MF.val(p.act),
    };
    const eta = parseFloat(MF.val(p.eta));          // Waze Travel Time: minutes of driving to home
    o.eta = o.known && !o.home && eta > 0 ? eta : null;
    o.place = !o.known ? 'לא ידוע' : o.home ? 'בבית' : !o.away ? z
      : o.dir === 'towards' ? 'בדרך הביתה' : 'בחוץ';
    return o;
  };

  /* ---------- map ---------- */
  MF.zones = function () {
    const h = MF.hass(), out = [];
    if (!h) return out;
    Object.keys(h.states).forEach(function (id) {
      if (id.indexOf('zone.') !== 0) return;
      const s = h.states[id], a = s.attributes;
      if (a.passive || a.latitude == null) return;
      out.push({ id: id, home: id === 'zone.home', name: a.friendly_name || id, lat: a.latitude, lon: a.longitude,
        radius: a.radius || 100, count: parseInt(s.state, 10) || 0 });
    });
    return out;
  };
  MF.makeMap = function (node, opts) {
    const map = L.map(node, Object.assign({ zoomControl: false, attributionControl: true, zoomSnap: 0.25 }, opts || {}));
    map.attributionControl.setPrefix(false);
    // same tile source the old location pages used; darkened with a CSS filter (.leaflet-tile-pane)
    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&hl=iw&x={x}&y={y}&z={z}', {
      subdomains: '0123', maxZoom: 20, attribution: 'Map data &copy; Google',
    }).addTo(map);
    return map;
  };
  MF.drawZones = function (map, labelAll) {
    const g = L.layerGroup().addTo(map);
    MF.zones().forEach(function (z) {
      const c = z.home ? '#a6e3a1' : '#89b4fa';
      L.circle([z.lat, z.lon], { radius: z.radius, color: c, weight: 1.5, opacity: z.home ? 0.55 : 0.4,
        dashArray: '5 5', fillColor: c, fillOpacity: z.home ? 0.10 : 0.07, interactive: false }).addTo(g);
      if (!z.home && !z.count && !labelAll) return;
      const lab = MF.el('div', { class: 'zlab' + (z.home ? ' home' : ''), html: z.home ? MF.icon('home', 13, 2.2) : '' },
        MF.el('span', { text: z.home ? 'בית' : z.name }));
      L.marker([z.lat, z.lon], { interactive: false, keyboard: false, zIndexOffset: -500,
        icon: L.divIcon({ className: '', html: lab.outerHTML, iconSize: [0, 0], iconAnchor: [0, -30] }) }).addTo(g);
    });
    return g;
  };
  MF.pinIcon = function (sn, me) {
    const d = MF.el('div', { class: 'pin' + (me ? ' me' : ''), style: 'border-color:' + sn.p.ring + (sn.pic ? ';background-image:url("' + sn.pic + '")' : '') });
    if (!sn.pic) d.textContent = sn.p.init;
    return L.divIcon({ className: '', html: d.outerHTML, iconSize: [48, 48], iconAnchor: [24, 24] });
  };

  return MF;
})();
