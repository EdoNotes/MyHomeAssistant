/* Focus map dashboard — builds a day timeline (stays + trips) from device-tracker history. */
(function (MF) {
  const MIN = 60000;
  const STOP_R = 150, STOP_MIN = 10 * MIN;      // an unnamed stop: within 150 m for 10+ minutes
  const hv = MF.haversine;

  MF.dayRange = function (offset) {            // offset 0 = today, 1 = yesterday …
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - offset);
    const e = new Date(d); e.setDate(e.getDate() + 1);
    return [d.getTime(), Math.min(e.getTime(), Date.now())];
  };

  MF.fetchDay = function (p, offset) {
    const h = MF.hass(), r = MF.dayRange(offset);
    const ps = h.states[p.person];
    const tracker = (ps && ps.attributes.source) || null;
    if (!tracker) return Promise.resolve({ segs: [], range: r });
    const ids = [tracker, p.geo].concat(p.act ? [p.act] : []);
    return h.callWS({ type: 'history/history_during_period', start_time: new Date(r[0]).toISOString(),
      end_time: new Date(r[1]).toISOString(), entity_ids: ids, minimal_response: false, no_attributes: false,
      significant_changes_only: false }).then(function (res) {
      const segs = MF.buildDay(res[tracker] || [], res[p.act] || [], res[p.geo] || [], r);
      return { segs: segs, range: r, totals: MF.totals(segs) };
    });
  };

  function points(rows, r) {
    const out = [];
    rows.forEach(function (x) {
      const a = x.a || {}, t = Math.max(r[0], Math.round(x.lu * 1000));
      if (x.s === 'unavailable' || x.s === 'unknown') return;
      if (typeof a.latitude !== 'number' || typeof a.longitude !== 'number') return;
      if (a.gps_accuracy > 250 && x.s === 'not_home') return;
      out.push({ t: t, lat: a.latitude, lon: a.longitude, z: x.s });
    });
    // single-sample zone flips (GPS jitter on a zone edge) take the neighbours' zone
    for (let i = 1; i < out.length - 1; i++) {
      if (out[i].z !== out[i - 1].z && out[i - 1].z === out[i + 1].z && out[i + 1].t - out[i - 1].t < 20 * MIN) out[i].z = out[i - 1].z;
    }
    return out;
  }

  function pathLen(pts) {
    let d = 0;
    for (let i = 1; i < pts.length; i++) d += hv(pts[i - 1].lat, pts[i - 1].lon, pts[i].lat, pts[i].lon);
    return d;
  }
  function stay(z, t0, t1, pts) {
    let la = 0, lo = 0;
    pts.forEach(function (p) { la += p.lat; lo += p.lon; });
    return { type: 'stay', zone: z, t0: t0, t1: t1, lat: la / pts.length, lon: lo / pts.length };
  }
  function move(t0, t1, pts) { return { type: 'move', t0: t0, t1: t1, pts: pts, dist: pathLen(pts) }; }

  // split one not_home run into unnamed stops and trips.
  // prev / next = the samples just before / after the run (inside a zone), used to close the trip geometry.
  function splitAway(pts, tEnd, prev, next) {
    const all = pts.concat(next ? [next] : []), stops = [];
    let i = 0;
    while (i < pts.length) {
      let j = i, la = pts[i].lat, lo = pts[i].lon, n = 1;
      while (j + 1 < pts.length && hv(la / n, lo / n, pts[j + 1].lat, pts[j + 1].lon) < STOP_R) { j++; la += pts[j].lat; lo += pts[j].lon; n++; }
      let end = tEnd;
      const nx = all[j + 1];
      if (nx) {   // a quiet gap counts as standing still only if the next sample is not a drive away
        const gap = nx.t - pts[j].t;
        const slow = gap > 0 && hv(pts[j].lat, pts[j].lon, nx.lat, nx.lon) / (gap / 1000) < 1.5;
        end = slow ? nx.t : pts[j].t;
      }
      if (end - pts[i].t >= STOP_MIN) { stops.push({ i: i, j: j, t0: pts[i].t, t1: end }); i = j + 1; } else i++;
    }
    const out = [];
    let from = 0, t = pts[0].t, lead = prev ? [prev] : [];
    stops.forEach(function (st) {
      out.push(move(t, st.t0, lead.concat(pts.slice(from, st.i + 1))));
      out.push(stay(null, st.t0, st.t1, pts.slice(st.i, st.j + 1)));
      from = st.j + 1; t = st.t1; lead = [pts[st.j]];
    });
    out.push(move(t, tEnd, lead.concat(all.slice(from))));
    return out;
  }

  function merge(segs) {
    for (let pass = 0; pass < 8; pass++) {
      let changed = false;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i], a = segs[i - 1], b = segs[i + 1], d = s.t1 - s.t0;
        let kill = false;
        if (s.type === 'move') {
          const tiny = (s.dist < 300 && d < 5 * MIN) || (s.dist < 2000 && d < MIN);
          const loop = a && b && a.type === 'stay' && b.type === 'stay' && a.zone && a.zone === b.zone && s.dist < 1500 && d < 20 * MIN;
          const still = a && b && a.type === 'stay' && b.type === 'stay' && !a.zone && !b.zone && hv(a.lat, a.lon, b.lat, b.lon) < STOP_R;
          if (a && a.type === 'move') { a.t1 = s.t1; a.pts = a.pts.concat(s.pts); a.dist += s.dist; kill = true; }
          else if ((tiny || loop || still) && (a || b)) { if (a) a.t1 = s.t1; else b.t0 = s.t0; kill = true; }
        } else {
          const same = a && a.type === 'stay' && (a.zone ? a.zone === s.zone : !s.zone && hv(a.lat, a.lon, s.lat, s.lon) < STOP_R);
          const pass3 = s.zone && d < 3 * MIN && a && b && a.type === 'move' && b.type === 'move';
          if (same) { a.t1 = s.t1; kill = true; }
          else if (pass3) { a.t1 = s.t1; kill = true; }
        }
        if (kill) { segs.splice(i, 1); i--; changed = true; }
      }
      if (!changed) break;
    }
    return segs;
  }

  function modeOf(s, act) {
    const kmh = s.t1 > s.t0 ? (s.dist / 1000) / ((s.t1 - s.t0) / 3600000) : 0;
    const tally = {};
    for (let i = 0; i < act.length; i++) {
      const t0 = act[i].lu * 1000, t1 = i + 1 < act.length ? act[i + 1].lu * 1000 : Date.now();
      const ov = Math.min(t1, s.t1) - Math.max(t0, s.t0);
      if (ov > 0) tally[act[i].s] = (tally[act[i].s] || 0) + ov;
    }
    const car = tally.in_vehicle || 0, bike = tally.on_bicycle || 0;
    const foot = (tally.walking || 0) + (tally.on_foot || 0) + (tally.running || 0);
    if (kmh > 14 || (car > foot && car > bike && kmh > 6)) return 'car';
    if (bike > foot && bike > car) return 'bike';
    return kmh > 9 ? 'car' : 'walk';
  }
  function addrAt(geo, s) {
    let best = null;
    geo.forEach(function (g) {
      if (!g.s || g.s === 'unknown' || g.s === 'unavailable') return;
      const t = g.lu * 1000;
      if (t >= s.t0 - 2 * MIN && t <= s.t1 + 2 * MIN) best = g.s;
    });
    return best;
  }

  MF.buildDay = function (rows, act, geo, r) {
    const pts = points(rows, r), segs = [];
    if (!pts.length) return segs;
    let i = 0;
    while (i < pts.length) {
      let j = i;
      while (j + 1 < pts.length && pts[j + 1].z === pts[i].z) j++;
      const tEnd = j + 1 < pts.length ? pts[j + 1].t : r[1], run = pts.slice(i, j + 1);
      if (pts[i].z === 'not_home') Array.prototype.push.apply(segs, splitAway(run, tEnd, pts[i - 1], pts[j + 1]));
      else segs.push(stay(pts[i].z, pts[i].t, tEnd, run));
      i = j + 1;
    }
    // a "stop" hugging a zone the person was just in / is about to enter is that zone (edge jitter)
    segs.forEach(function (s, k) {
      if (s.type !== 'stay' || s.zone) return;
      for (let d = -2; d <= 2; d++) {
        const n = segs[k + d];
        if (n && n.type === 'stay' && n.zone && !n.fold && hv(s.lat, s.lon, n.lat, n.lon) < 250) { s.zone = n.zone; s.fold = true; return; }
      }
    });
    merge(segs);
    segs.forEach(function (s) {
      if (s.type === 'move') s.mode = modeOf(s, act);
      else if (!s.zone) s.addr = addrAt(geo, s);
    });
    const isToday = r[1] >= Date.now() - MIN;
    if (isToday && segs.length) segs[segs.length - 1].now = true;
    return segs;
  };

  MF.totals = function (segs) {
    let dist = 0, time = 0;
    const places = {};
    segs.forEach(function (s, i) {
      if (s.type === 'move') { dist += s.dist; time += s.t1 - s.t0; }
      else places[s.zone || 'u' + i] = 1;
    });
    return { dist: dist, time: time, places: Object.keys(places).length };
  };
})(window.MF);
