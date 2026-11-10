/* Focus map dashboard — full-page day timeline for one person. */
(function (MF) {
  const el = MF.el;
  const WD = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  const MODE = { car: ['car', 'נסיעה'], walk: ['walk', 'הליכה'], bike: ['bike', 'רכיבה'] };

  function chipLabel(off) {
    if (off === 0) return 'היום';
    if (off === 1) return 'אתמול';
    const d = new Date(MF.dayRange(off)[0]);
    return WD[d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1);
  }
  function title(s) { return s.zone === 'home' ? 'בית' : s.zone ? s.zone : (s.addr || 'עצירה'); }

  MF.renderDay = function (app, p) {
    let off = 0, token = 0;
    app.classList.add('scroll');
    const chips = el('div', { class: 'chips', role: 'tablist', 'aria-label': 'יום' });
    const tot = el('div', { class: 'tot' }), list = el('div', { class: 'tline' });
    app.replaceChildren(el('div', { class: 'day' }, [chips, tot, list]));

    function paintChips() {
      chips.replaceChildren.apply(chips, [0, 1, 2, 3, 4].map(function (o) {
        return el('button', { class: 'chip', type: 'button', 'aria-current': o === off ? 'true' : null, text: chipLabel(o),
          onclick: function () { if (o !== off) { off = o; paintChips(); load(); } } });
      }));
    }
    function totCell(html, label) { return el('div', {}, [el('b', { html: html }), el('span', { text: label })]); }
    function paintTotals(t) {
      const k = MF.km(t ? t.dist : 0), m = t ? Math.round(t.time / 60000) : 0;
      const time = m < 60 ? m + "<small>דק'</small>" : Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2) + "<small>שע'</small>";
      tot.replaceChildren(totCell(t ? k[0] + '<small>' + k[1] + '</small>' : '—', 'מרחק'), totCell(t ? time : '—', 'בדרכים'),
        totCell(t ? String(t.places) : '—', 'מקומות'));
    }
    function saveForm(s, card, btn) {
      const input = el('input', { type: 'text', placeholder: 'שם המקום', 'aria-label': 'שם המקום', maxlength: 40 });
      const ok = el('button', { type: 'button', text: 'שמור' });
      const form = el('div', { class: 'savef', onclick: function (e) { e.stopPropagation(); } }, [input, ok]);
      function go() {
        const name = input.value.trim();
        if (!name) return input.focus();
        ok.disabled = true; ok.textContent = 'שומר…';
        MF.hass().callWS({ type: 'zone/create', name: name, latitude: s.lat, longitude: s.lon, radius: 100, passive: false, icon: 'mdi:map-marker' })
          .then(function () { s.zone = name; s.saved = true; load(); })
          .catch(function (e) { ok.disabled = false; ok.textContent = 'שמור'; input.value = ''; input.placeholder = 'השמירה נכשלה'; });
      }
      ok.addEventListener('click', go);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      btn.replaceWith(form); input.focus();
    }
    function row(s, first, last, range) {
      const time = el('div', { class: 'tt', text: MF.hm(s.t0) });
      if (s.type === 'move') {
        const m = MODE[s.mode] || MODE.car;
        return el('button', { class: 'trow mv' + (first ? ' first' : '') + (last ? ' last' : ''), type: 'button', onclick: function () { overlay(s); } }, [
          el('div', { class: 'tt', style: 'padding-top:8px', text: '' }), el('div', { class: 'rail' }),
          el('div', { class: 'mvt', html: MF.icon(m[0], 16) + '<span></span>' })]);
      }
      const dot = el('i', { class: s.now ? 'h now' : s.zone === 'home' ? 'h' : s.zone ? '' : 'u' });
      const until = s.now ? 'מאז ' + MF.hm(s.t0) : (s.t1 >= range[1] - 1000 ? 'עד סוף היום' : 'עד ' + MF.hm(s.t1));
      const card = el('div', { class: 'tc' + (s.now ? ' now' : '') }, [
        el('div', { class: 'tch' }, [el('b', { text: title(s) }), s.now ? el('span', { class: 'npill', text: 'עכשיו' }) : null]),
        el('div', { class: 'tcs', text: until + ' · ' + MF.dur(s.t1 - s.t0) })]);
      if (!s.zone) {
        const btn = el('button', { class: 'save', type: 'button', text: 'שמור כמקום' });
        btn.addEventListener('click', function (e) { e.stopPropagation(); saveForm(s, card, btn); });
        card.append(btn);
      }
      return el('div', { class: 'trow' + (first ? ' first' : '') + (last ? ' last' : ''), role: 'button', tabindex: 0,
        onclick: function () { overlay(s); } }, [time, el('div', { class: 'rail' }, dot), card]);
    }
    function paintList(d) {
      if (!d.segs.length) return list.replaceChildren(el('div', { class: 'empty', text: 'אין נתוני מיקום ליום הזה.' }));
      const segs = d.segs.slice().reverse();
      list.replaceChildren.apply(list, segs.map(function (s, i) {
        const r = row(s, i === 0, i === segs.length - 1, d.range);
        if (s.type === 'move') r.querySelector('.mvt span').textContent = (MODE[s.mode] || MODE.car)[1] + ' · ' + MF.kmText(s.dist) + ' · ' + MF.dur(s.t1 - s.t0);
        return r;
      }));
    }
    function load(quiet) {
      const my = ++token;
      if (!quiet) { paintTotals(null); list.replaceChildren(el('div', { class: 'empty', text: 'טוען…' })); }
      MF.fetchDay(p, off).then(function (d) { if (my !== token) return; paintTotals(d.totals); paintList(d); })
        .catch(function () { if (my === token) list.replaceChildren(el('div', { class: 'empty', text: 'טעינת ההיסטוריה נכשלה.' })); });
    }

    /* tap a row: show that stay / trip on a map */
    function overlay(s) {
      const mapNode = el('div', { class: 'map' });
      const cap = s.type === 'move' ? (MODE[s.mode] || MODE.car)[1] + ' · ' + MF.kmText(s.dist) : title(s);
      const ov = el('div', { class: 'ov', role: 'dialog', 'aria-label': cap }, [mapNode,
        el('div', { class: 'ovbar' }, [
          el('span', { class: 'ltxt' }, [el('b', { text: cap }), el('span', { text: MF.hm(s.t0) + '–' + MF.hm(s.t1) + ' · ' + MF.dur(s.t1 - s.t0) })]),
          el('button', { class: 'ovx', type: 'button', 'aria-label': 'סגור', html: MF.icon('x', 18, 2.2), onclick: function () { map.remove(); ov.remove(); } })])]);
      document.body.append(ov);
      const map = MF.makeMap(mapNode);
      const dotIcon = L.divIcon({ className: '', html: '<div class="dot"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
      const ll = s.type === 'move' ? s.pts.map(function (q) { return [q.lat, q.lon]; }) : [[s.lat, s.lon]];
      if (!ll.length) return;
      // the view must be set before vector layers are added
      if (ll.length > 1) map.fitBounds(L.latLngBounds(ll), { paddingTopLeft: [40, 96], paddingBottomRight: [40, 40], maxZoom: 17, animate: false });
      else map.setView(ll[0], 16, { animate: false });
      MF.drawZones(map, false);
      if (ll.length > 1) L.polyline(ll, { color: '#0A6FD1', weight: 5, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(map);
      [ll[0], ll[ll.length - 1]].forEach(function (c) { L.marker(c, { icon: dotIcon, interactive: false }).addTo(map); });
    }

    paintChips(); load();
    setInterval(function () { if (off === 0 && !document.querySelector('.ov, .savef')) load(true); }, 5 * 60000);
  };
})(window.MF);
