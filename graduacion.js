/* ======================================================================
   GRADUACIÓN ENTRE SESIONES (paso 5 del plan Claude + Codex, 13/10/2026)
   Orden de José: «que el sistema vaya graduando la dificultad en base a
   los resultados». Dentro de una partida cada juego ya sube y baja solo;
   esto decide en qué nivel EMPIEZA la siguiente, con cautela:
     · una sola cosa a la vez (un nivel arriba o abajo) y nunca dos cambios el mismo día;
     · hacen falta dos días distintos, al mismo nivel de salida, con muestra suficiente;
     · sube si en los dos días acertó 80 % o más (el «bien» de camino.js);
       baja si en los dos acertó menos del 50 % (el «le cuesta» de camino.js);
       si no, se queda donde estaba;
     · si hay incidencia técnica en la última, no cambia;
     · si la logopeda fija el nivel en el enlace, manda ella (el juego ni consulta esto).
   Se guarda solo en este aparato: localStorage 'fonia-grad-<juego>-<caso>'.
   Umbrales 80/50 = los que ya usa camino.js; muestra mínima 5 = provisional,
   para revisión de José. Sin ?? ni ?. ni spread: iPad antiguos.
   Uso:  var g = FoniaGraduacion.inicio('snake', 1, 4, CASO);  → {nivel, cambio, motivo}
         FoniaGraduacion.registra('snake', CASO, {ini:1, fin:2, pct:0.9, n:12, inc:false});
   ====================================================================== */
(function () {
  var MIN_N = 5, SUBE = 0.8, BAJA = 0.5, GUARDA = 12;
  function clave(juego, caso) { return 'fonia-grad-' + juego + '-' + (caso || 'anon'); }
  function hoy() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function lee(k) { try { var v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function escribe(k, v) { try { localStorage.setItem(k, JSON.stringify(v.slice(-GUARDA))); } catch (e) { } }
  /* la última sesión de cada día (varias el mismo día cuentan como una) */
  function porDias(h) {
    var out = [], i;
    for (i = 0; i < h.length; i++) { if (out.length && out[out.length - 1].dia === h[i].dia) out[out.length - 1] = h[i]; else out.push(h[i]); }
    return out;
  }
  function pc(x) { return Math.round(x * 100) + ' %'; }
  var ultimo = null;
  /* La regla, pura: h = sesiones [{dia, ini, fin, pct 0..1, n, inc}] en orden. opc.hoy = 'AAAA-MM-DD';
     opc.nDesconocidoVale = true cuando el envío no dice cuántos ítems fueron (la sugerencia sale como provisional). */
  function decide(hist, def, max, opc) {
    opc = opc || {}; var h = porDias(hist), r, hoyS = opc.hoy || hoy(), prov = false;
    function fin(x) { x.prov = prov; return x; }
    if (!h.length) return fin({ nivel: def, cambio: 'nuevo', motivo: 'primera vez' });
    var u = h[h.length - 1], base = Math.min(max, Math.max(1, u.ini || def));
    function nOk(x) { if (x.n === null || x.n === undefined) { if (opc.nDesconocidoVale) { prov = true; return true; } return false; } return x.n >= MIN_N; }
    if (u.dia === hoyS) return fin({ nivel: base, cambio: 'igual', motivo: 'ya se ha practicado hoy' });
    if (u.inc || !nOk(u) || h.length < 2) return fin({ nivel: base, cambio: 'igual', motivo: u.inc ? 'hubo una incidencia técnica' : (h.length < 2 ? 'falta otro día para comparar' : 'faltan datos') });
    var p = h[h.length - 2];
    if (p.inc || !nOk(p) || p.ini !== u.ini) return fin({ nivel: base, cambio: 'igual', motivo: 'las dos últimas sesiones no son comparables' });
    if (u.pct >= SUBE && p.pct >= SUBE && (u.fin || u.ini) >= u.ini && base < max) return fin({ nivel: base + 1, cambio: 'sube', motivo: 'las dos últimas veces acertó ' + pc(p.pct) + ' y ' + pc(u.pct) });
    if (u.pct < BAJA && p.pct < BAJA && base > 1) return fin({ nivel: base - 1, cambio: 'baja', motivo: 'las dos últimas veces acertó ' + pc(p.pct) + ' y ' + pc(u.pct) + ': vamos un poco más tranquilos' });
    return fin({ nivel: base, cambio: 'igual', motivo: 'sigue en el mismo nivel' });
  }
  function inicio(juego, def, max, caso) {
    var h = lee(clave(juego, caso)), r;
    r = decide(h, def, max); ultimo = r; return r;
  }
  function registra(juego, caso, s) {
    if (!s || typeof s.pct !== 'number' || typeof s.n !== 'number') return;
    var k = clave(juego, caso), h = lee(k);
    h.push({ dia: hoy(), ini: s.ini, fin: s.fin, pct: Math.round(s.pct * 1000) / 1000, n: s.n, inc: !!s.inc });
    escribe(k, h);
  }
  window.FoniaGraduacion = { decide: decide, inicio: inicio, registra: registra, ultimo: function () { return ultimo; } };
})();
