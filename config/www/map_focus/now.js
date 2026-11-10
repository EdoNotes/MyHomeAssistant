/* Focus map dashboard — "both" map with bottom sheet, and the per-person "now" screen. */
(function (MF) {
  const el = MF.el, P = MF.PEOPLE;
  const REFRESH = 15000;

  MF.seg = function (cur) {
    const n = el('nav', { class: 'seg', 'aria-label': 'תצוגה' });
    [['both', 'שניהם'], ['edo', P.edo.name], ['hen', P.hen.name]].forEach(function (x) {
      n.append(el('button', { type: 'button', 'aria-current': x[0] === cur ? 'page' : null, text: x[1],
        onclick: function () { if (x[0] !== cur) MF.nav(x[0], true); } }));
    });
    return n;
  };
  function g(p, m, f) { return p.fem ? f : m; }
  function dayWord(ms) {
    const d0 = MF.dayRange(0)[0];
    if (ms >= d0) return '';
    if (ms >= d0 - 86400000) return 'אתמול ';
    const d = new Date(ms);
    return d.getDate() + '.' + (d.getMonth() + 1) + ' ';
  }
  // when the current stay / trip began: today's timeline if it knows, else the person entity
  function since(sn, day) {
    const last = day && day.segs.length ? day.segs[day.segs.length - 1] : null;
    if (last && last.t0 > day.range[0] + 60000) return last.t0;
    if (!day || sn.since < MF.dayRange(0)[0]) return sn.since;
    return null;
  }
  function rowSub(sn, day) {
    if (!sn.known) return 'אין נתוני מיקום';
    const t = since(sn, day), parts = [sn.place];
    if (sn.away) { if (sn.dist != null) parts.push(MF.kmText(sn.dist) + (sn.dir === 'towards' ? '' : ' מהבית')); }
    else parts.push(t ? 'מאז ' + dayWord(t) + MF.hm(t) : 'כל היום');
    return parts.join(' · ');
  }
  function drawTracks(layer, day, color, weight) {
    layer.clearLayers();
    day.segs.forEach(function (s) {
      if (s.type !== 'move' || s.pts.length < 2) return;
      L.polyline(s.pts.map(function (p) { return [p.lat, p.lon]; }), { color: color, weight: weight, opacity: 0.9,
        lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(layer);
    });
  }

  /* ---------- both ---------- */
  MF.renderBoth = function (app) {
    const people = [P.edo, P.hen], days = {}, marks = {}, tracks = {};
    const mapNode = el('div', { class: 'map' }), upd = el('span', { class: 'upd' }), rows = el('div', { class: 'rows' });
    const sheet = el('section', { class: 'sheet' }, [el('div', { class: 'grab' }),
      el('div', { class: 'shead' }, [el('h1', { text: 'איפה כולם' }), upd]), rows]);
    const btns = el('div', { class: 'mbtns' }, [
      el('button', { class: 'mbtn', type: 'button', 'aria-label': 'הצג את שניהם', html: MF.icon('fit', 20), onclick: function () { fit(true); } }),
      el('button', { class: 'mbtn', type: 'button', 'aria-label': 'מרכז על הבית', html: MF.icon('home', 20), onclick: home }),
    ]);
    app.replaceChildren(mapNode, MF.seg('both'), btns, sheet);
    const map = MF.makeMap(mapNode);
    MF.drawZones(map, false);
    people.forEach(function (p) { tracks[p.key] = L.layerGroup().addTo(map); });

    function snaps() { return people.map(MF.snap); }
    function fit(anim) {
      const pts = snaps().filter(function (s) { return s.lat != null; }).map(function (s) { return [s.lat, s.lon]; });
      const hz = MF.zones().filter(function (z) { return z.home; })[0];
      if (!pts.length && hz) pts.push([hz.lat, hz.lon]);
      if (!pts.length) return map.setView([31.8, 35.0], 8);
      map.fitBounds(L.latLngBounds(pts), { paddingTopLeft: [56, 104], paddingBottomRight: [56, sheet.offsetHeight + 56], maxZoom: 15.5, animate: !!anim });
    }
    function home() {
      const hz = MF.zones().filter(function (z) { return z.home; })[0];
      if (!hz) return;
      map.fitBounds(L.latLng(hz.lat, hz.lon).toBounds(900), { paddingTopLeft: [0, 80], paddingBottomRight: [0, sheet.offsetHeight] });
    }
    function paint() {
      const ss = snaps();
      rows.replaceChildren.apply(rows, ss.map(function (sn) {
        const low = sn.bat != null && sn.bat <= 20 && sn.batState !== 'charging';
        return el('button', { class: 'prow', type: 'button', onclick: function () { MF.nav(sn.p.key); } }, [
          el('span', { class: 'av', text: sn.pic ? '' : sn.p.init, style: 'border-color:' + sn.p.ring + (sn.pic ? ';background-image:url("' + sn.pic + '")' : '') }),
          el('span', { class: 'ptxt' }, [el('span', { class: 'pname', text: sn.p.name }), el('span', { class: 'psub', text: rowSub(sn, days[sn.p.key]) })]),
          sn.bat == null ? null : el('span', { class: 'bat' + (low ? ' low' : ''), html: MF.batIcon(sn.bat) + '<span>' + sn.bat + '%</span>' }),
          el('span', { class: 'chev', html: MF.icon('chev', 18, 2) }),
        ]);
      }));
      const newest = Math.max.apply(null, ss.map(function (s) { return s.updated || 0; }));
      upd.textContent = newest ? MF.ago(newest) : '';
      ss.forEach(function (sn) {
        if (sn.lat == null) return;
        if (!marks[sn.p.key]) {
          marks[sn.p.key] = L.marker([sn.lat, sn.lon], { icon: MF.pinIcon(sn, false), title: sn.p.name, zIndexOffset: sn.p.key === 'edo' ? 200 : 100 })
            .on('click', function () { MF.nav(sn.p.key); }).addTo(map);
        } else marks[sn.p.key].setLatLng([sn.lat, sn.lon]);
      });
      btns.style.bottom = (sheet.offsetHeight + 16) + 'px';
    }
    function load() {
      people.forEach(function (p) {
        MF.fetchDay(p, 0).then(function (d) { days[p.key] = d; drawTracks(tracks[p.key], d, p.ring, 4); paint(); }).catch(function () {});
      });
    }
    paint(); fit(false); load();
    setInterval(paint, REFRESH); setInterval(load, 5 * 60000);
    window.addEventListener('resize', function () { map.invalidateSize(); });
  };

  /* ---------- person ---------- */
  const ACT = { in_vehicle: ['car', 'בנסיעה'], on_bicycle: ['bike', 'על אופניים'], on_foot: ['walk', 'בהליכה'], walking: ['walk', 'בהליכה'],
    running: ['walk', 'בריצה'], still: ['pause', 'לא בתנועה'] };
  function activity(sn) {
    if (!sn.known) return null;
    if (sn.act && ACT[sn.act] && !(sn.home && sn.act !== 'still')) return ACT[sn.act];
    if (sn.home) return ['home', 'בבית', 'g'];
    if (sn.dir === 'towards') return ['route', g(sn.p, 'מתקרב הביתה', 'מתקרבת הביתה')];
    if (sn.dir === 'away_from') return ['route', g(sn.p, 'מתרחק מהבית', 'מתרחקת מהבית')];
    if (sn.dir === 'stationary' || sn.dir === 'arrived') return ['pause', 'לא בתנועה'];
    return null;
  }
  function tile(icon, label, body) {
    return el('div', { class: 'tile' }, [el('div', { class: 'tl', html: (typeof icon === 'string' && icon[0] === '<' ? icon : MF.icon(icon, 15)) + '<span>' + label + '</span>' })].concat(body));
  }

  MF.renderPerson = function (app, p) {
    let day = null, mark = null;
    app.classList.add('scroll');
    const mapNode = el('div', { class: 'map' }), panel = el('section', { class: 'panel' });
    app.replaceChildren(el('div', { class: 'hero' }, [mapNode, MF.seg(p.key)]), panel);
    const map = MF.makeMap(mapNode), track = L.layerGroup().addTo(map);
    MF.drawZones(map, false);

    function centre() {
      const sn = MF.snap(p);
      if (sn.lat == null) return;
      const z = 14.5, pt = map.project([sn.lat, sn.lon], z).add([0, -18]);   // keep the pin clear of the panel overlap
      map.setView(map.unproject(pt, z), z, { animate: false });
    }
    function paint() {
      const sn = MF.snap(p), a = activity(sn), t = since(sn, day), kids = [];
      if (sn.lat != null) {
        if (!mark) mark = L.marker([sn.lat, sn.lon], { icon: MF.pinIcon(sn, true), interactive: false, zIndexOffset: 500 }).addTo(map);
        else mark.setLatLng([sn.lat, sn.lon]);
      }
      kids.push(el('div', { class: 'prow1' }, [
        a ? el('span', { class: 'pill' + (a[2] ? ' ' + a[2] : ''), html: MF.icon(a[0], 15, 2) + '<span>' + a[1] + '</span>' }) : el('span'),
        el('span', { class: 'upd', text: sn.updated ? MF.ago(sn.updated) : '' })]));
      const sub = !sn.known ? 'אין נתוני מיקום מהטלפון' : sn.away
        ? (sn.dist != null ? MF.kmText(sn.dist) + ' מהבית' : '') : (t ? 'מאז ' + dayWord(t) + MF.hm(t) : 'כל היום');
      kids.push(el('div', {}, [el('h1', { class: 'hl', text: sn.place }), el('div', { class: 'sub', text: sub })]));

      const d = MF.km(sn.dist), dirTxt = sn.dir === 'towards' ? g(p, 'מתקרב', 'מתקרבת') : sn.dir === 'away_from' ? g(p, 'מתרחק', 'מתרחקת') : '';
      const low = sn.bat != null && sn.bat <= 20 && sn.batState !== 'charging';
      const batNote = sn.batState === 'charging' ? 'בטעינה' : sn.batState === 'full' ? 'מלאה' : low ? 'נמוכה' : '';
      kids.push(el('div', { class: 'grid' }, [
        sn.eta != null
          ? tile('car', 'הגעה הביתה', el('div', { class: 'tv' }, [el('b', { text: MF.hm(Date.now() + sn.eta * 60000) }),
            el('span', { text: MF.dur(sn.eta * 60000) })]))
          : tile('clock', sn.away ? 'בחוץ מאז' : 'כאן מאז', el('div', { class: 'tv' }, [el('b', { text: t ? (dayWord(t).trim() || MF.hm(t)) : '00:00' }),
            el('span', { text: t ? (dayWord(t) ? MF.hm(t) : MF.dur(Date.now() - t)) : 'כל היום' })])),
        tile('home', 'מרחק מהבית', el('div', { class: 'tv' }, [el('b', { text: d[0] }), el('span', { text: [d[1], dirTxt].filter(Boolean).join(' · ') })])),
        tile(MF.batIcon(sn.bat).replace(/"18"/g, '"15"'), 'סוללה', [
          el('div', { class: 'tv' }, [el('b', { text: sn.bat == null ? '—' : sn.bat + '%' }), el('span', { text: batNote })]),
          el('div', { class: 'bar' + (low ? ' low' : '') }, el('i', { style: 'width:' + (sn.bat || 0) + '%' }))]),
        tile('pin', 'כתובת', el('div', { class: 'tv addr', text: sn.addr || '—', title: sn.addr || '' })),
      ]));
      const tot = day && day.totals;
      kids.push(el('button', { class: 'link', type: 'button', onclick: function () { MF.nav(p.key + '-day'); } }, [
        el('span', { class: 'ibox', html: MF.icon('route', 20) }),
        el('span', { class: 'ltxt' }, [el('b', { text: 'ציר היום' }),
          el('span', { text: !tot ? 'טוען…' : MF.kmText(tot.dist) + ' · ' + (tot.places === 1 ? 'מקום אחד' : tot.places + ' מקומות') })]),
        el('span', { class: 'chev', html: MF.icon('chev', 18, 2) })]));
      panel.replaceChildren.apply(panel, kids);
    }
    function load() {
      MF.fetchDay(p, 0).then(function (d) { day = d; drawTracks(track, d, '#0A6FD1', 5); paint(); }).catch(function () {});
    }
    paint(); centre(); load();
    setInterval(paint, REFRESH); setInterval(load, 5 * 60000);
  };

  /* ---------- boot ---------- */
  MF.start = function () {
    const app = document.getElementById('app');
    let tries = 0;
    function msg(t) { app.replaceChildren(el('div', { class: 'msg', text: t })); }
    (function go() {
      const h = MF.hass();
      if (!h || !h.user || !h.states) {
        if (parent === window || ++tries > 60) return msg('הדף הזה נפתח רק מתוך לוח המפה ב-Home Assistant.');
        return setTimeout(go, 250);
      }
      if (!h.user.is_owner) return msg('אין הרשאה לצפות בדף הזה.');
      if (!window.L) return msg('המפה לא נטענה. בדקו את החיבור לאינטרנט.');
      const m = /^(edo|hen)(-day)?$/.exec(MF.page);
      if (!m) MF.renderBoth(app);
      else if (m[2]) MF.renderDay(app, P[m[1]]);
      else MF.renderPerson(app, P[m[1]]);
    })();
  };
})(window.MF);
