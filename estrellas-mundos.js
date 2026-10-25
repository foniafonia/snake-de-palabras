/* ======================================================================
   ESTRELLAS Y MUNDOS · pieza común para guardar la partida (Snake, FonoKart…)
   José, 15/10/2026 (vía Revisor de casos): guardar partidas por caso, con
   estrellas (1-3 por tanda) y mundos que se desbloquean. Cada mundo es un
   nivel o una regla clínica: avanzar en el juego es avanzar en lo que trabaja.
   LAS ESTRELLAS NO SON DATO CLÍNICO: el envío sigue con aciertos, errores,
   tiempos y fatiga; las estrellas viajan en una línea aparte («Fönia · partida»).

   Uso (ES5):
     var M = FoniaMundos({ juego:'snake', caso:CASO,
                           mundos:[{id:'empieza', titulo:'…', icono:'🌱', nota:'qué trabaja'}],
                           fijado: 0 });            // 1..n: la ficha fija el mundo (?mundo=N)
     M.actual()                índice del mundo en juego (0..n-1)
     M.mundo()                 el objeto del mundo actual
     M.desbloqueados()         cuántos están abiertos (siempre ≥1)
     M.estrellas(pct)          1-3 para una tanda: ≥90 % → 3, ≥70 % → 2, si no → 1
     M.termina({pct:0-100})    guarda la tanda; devuelve {estrellas, mejor, abre:'titulo'|'' }
     M.elige(i)                cambia de mundo (solo los abiertos; no si está fijado)
     M.pinta(caja,{alElegir})  mapa de mundos: estrellas, candados y el actual
     M.lineaEnvio()            'Fönia · partida: {…}' para añadir al envío
   Regla para abrir el siguiente: 2 estrellas o más en el mundo actual.
   Guardado: localStorage 'fonia-mundos-<juego>-<caso o anon>', con try/catch.
   Cambio de aparato: la familia no puede leer el buzón; la logopeda fija el
   mundo con ?mundo=N y desde ahí se sigue. iPad antiguos: ES5.
   ====================================================================== */
(function () {
  'use strict';
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  var CSS = '' +
    '.fm-mapa{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:8px 0}' +
    '.fm-m{position:relative;min-width:92px;max-width:130px;flex:1 1 92px;border:2px solid #d9cfa8;border-radius:14px;background:#fffdf4;color:#2b2105;padding:8px 6px 6px;text-align:center;font:600 13px/1.25 system-ui,-apple-system,sans-serif;cursor:pointer}' +
    '.fm-m .i{display:block;font-size:24px;line-height:1.1}' +
    '.fm-m .e{display:block;font-size:13px;letter-spacing:1px;margin-top:3px;color:#c9a227}' +
    '.fm-m.act{border-color:#1A7342;box-shadow:0 0 0 3px rgba(26,115,66,.25)}' +
    '.fm-m.cerrado{opacity:.5;cursor:default;background:#f2f2ef}' +
    '.fm-m.cerrado .i{filter:grayscale(1)}';
  function css() { if (document.getElementById('fm-css')) return; var s = document.createElement('style'); s.id = 'fm-css'; s.textContent = CSS; document.head.appendChild(s); }

  window.FoniaMundos = function (def) {
    var N = (def.mundos || []).length || 1;
    var K = 'fonia-mundos-' + def.juego + '-' + (def.caso || 'anon');
    var D = { actual: 0, abiertos: 1, est: [], tandas: 0, ult: '' };
    try { var g = JSON.parse(localStorage.getItem(K) || 'null'); if (g && typeof g.actual === 'number') D = g; } catch (e) {}
    while (D.est.length < N) D.est.push(0);
    var fijado = def.fijado > 0 && def.fijado <= N ? def.fijado : 0;
    if (fijado) { D.actual = fijado - 1; if (D.abiertos < fijado) D.abiertos = fijado; }
    if (D.actual > N - 1) D.actual = N - 1;
    if (D.abiertos > N) D.abiertos = N;
    function guarda() { try { localStorage.setItem(K, JSON.stringify(D)); } catch (e) {} }
    guarda();
    function estrellas(pct) { return pct >= 90 ? 3 : (pct >= 70 ? 2 : 1); }
    return {
      actual: function () { return D.actual; },
      mundo: function () { return def.mundos[D.actual]; },
      desbloqueados: function () { return D.abiertos; },
      fijado: function () { return !!fijado; },
      estrellas: estrellas,
      termina: function (r) {
        var e = estrellas(r && r.pct != null ? r.pct : 0), i = D.actual, abre = '';
        if (e > D.est[i]) D.est[i] = e;
        D.tandas++; var hoy = new Date(); D.ult = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();
        if (e >= 2 && i === D.abiertos - 1 && D.abiertos < N) { D.abiertos++; abre = def.mundos[D.abiertos - 1].titulo; }
        guarda();
        return { estrellas: e, mejor: D.est[i], abre: abre };
      },
      elige: function (i) { if (fijado || i < 0 || i >= D.abiertos) return false; D.actual = i; guarda(); return true; },
      pinta: function (caja, op) {
        css(); op = op || {}; caja.innerHTML = '';
        var m = el('div', 'fm-mapa');
        def.mundos.forEach(function (w, i) {
          var abierto = i < D.abiertos, b = el('button', 'fm-m' + (i === D.actual ? ' act' : '') + (abierto ? '' : ' cerrado'));
          b.type = 'button'; b.title = w.nota || '';
          b.appendChild(el('span', 'i', abierto ? w.icono : '🔒'));
          b.appendChild(el('span', null, (i + 1) + '. ' + w.titulo));
          b.appendChild(el('span', 'e', abierto ? ('★★★'.slice(0, D.est[i]) + '☆☆☆'.slice(0, 3 - D.est[i])) : ''));
          if (!abierto || fijado) b.disabled = !abierto || (fijado && i !== D.actual);
          b.onclick = function () { if (abierto && !fijado && op.alElegir) { D.actual = i; guarda(); op.alElegir(i); } };
          m.appendChild(b);
        });
        caja.appendChild(m);
      },
      lineaEnvio: function () {
        return 'Fönia · partida: ' + JSON.stringify({ juego: def.juego, mundo: D.actual + 1, de: N, abiertos: D.abiertos, estrellas: D.est, tandas: D.tandas, fijado: fijado || 0 });
      }
    };
  };
})();
