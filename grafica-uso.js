/* Gráfica de uso por días (18/10/2026, encargo del Orquestador con el visto bueno de José).
   La misma pieza en Suena igual y en Snake de palabras: si se cambia aquí, se copia tal cual al otro.
   Barras por día: aparatos nuevos y partidas terminadas. Línea: pulsaciones a Skool. Un solo eje (todo son recuentos).
   No pide nada al contador: dibuja los números que ya ha leído la página.
   Uso:  GraficaUso(caja, [{d: Date, personas: n, terminadas: n|null, skool: n}, …])   (del más antiguo al más nuevo)
   ES5, sin librerías: SVG a mano. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var C = { personas: '#2a78d6', terminadas: '#eb6834', skool: '#1baf7a', texto: '#10231A', suave: '#52514e', rejilla: '#e3e8e4', fondo: '#ffffff' };
  var CSS = '.gu{background:#fff;border:1px solid #DCE6DE;border-radius:16px;padding:12px 10px 8px;margin:10px 0 6px}' +
    '.gu-ley{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:14px;color:' + C.texto + ';margin:0 4px 6px}' +
    '.gu-ley span{display:inline-flex;align-items:center;gap:6px}' +
    '.gu-ley i{display:inline-block;width:12px;height:12px;border-radius:3px}' +
    '.gu-ley i.l{height:3px;border-radius:2px;width:16px}' +
    '.gu svg{display:block;width:100%;height:auto;overflow:visible}' +
    '.gu-info{min-height:22px;font-size:14px;color:' + C.texto + ';text-align:center;margin-top:4px}' +
    '.gu-info b{font-weight:700}';
  function css() { if (document.getElementById('gu-css')) return; var s = document.createElement('style'); s.id = 'gu-css'; s.textContent = CSS; document.head.appendChild(s); }
  function n(v) { return typeof v === 'number' && v > 0 ? v : 0; }
  function sv(t, a) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
  /* barra con las esquinas de arriba redondeadas (4px) y la base plana sobre el eje */
  function barra(x, y, w, h, color) {
    var r = Math.min(4, w / 2, h);
    if (h <= 0) return null;
    var d = 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
    return sv('path', { d: d, fill: color });
  }
  function techo(m) { if (m <= 4) return 4; var p = Math.pow(10, Math.floor(Math.log(m) / Math.LN10)), s = [1, 2, 2.5, 5, 10]; for (var i = 0; i < s.length; i++) if (s[i] * p * 4 >= m) return s[i] * p * 4; return Math.ceil(m / p) * p; }

  window.GraficaUso = function (caja, datos) {
    css(); caja.innerHTML = ''; caja.className = 'gu';
    var conTerm = datos.some(function (x) { return x.terminadas !== null && x.terminadas !== undefined; });
    var ley = document.createElement('div'); ley.className = 'gu-ley';
    [['personas', 'Aparatos nuevos', ''], ['terminadas', 'Partidas terminadas', ''], ['skool', 'Pulsaciones a Skool', 'l']].forEach(function (p) {
      if (p[0] === 'terminadas' && !conTerm) return;
      var s = document.createElement('span'), i = document.createElement('i'); i.className = p[2]; i.style.background = C[p[0]]; s.appendChild(i); s.appendChild(document.createTextNode(p[1])); ley.appendChild(s);
    });
    caja.appendChild(ley);
    var W = 340, H = 200, L = 26, R = 6, T = 10, B = 26, aw = W - L - R, ah = H - T - B, N = datos.length || 1;
    var max = 0; datos.forEach(function (x) { max = Math.max(max, n(x.personas), n(x.terminadas), n(x.skool)); });
    var top = techo(max), y = function (v) { return T + ah - ah * v / top; }, paso = aw / N;
    var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Uso por días: aparatos nuevos, partidas terminadas y pulsaciones a Skool. Los números exactos están en la tabla de abajo.' });
    for (var g = 0; g <= 4; g++) {
      var v = top * g / 4, yy = Math.round(y(v)) + 0.5;
      svg.appendChild(sv('line', { x1: L, x2: W - R, y1: yy, y2: yy, stroke: g ? C.rejilla : '#b9c4bc', 'stroke-width': 1 }));
      var tx = sv('text', { x: L - 5, y: yy + 3.5, 'text-anchor': 'end', 'font-size': 10, fill: C.suave }); tx.textContent = String(Math.round(v)); svg.appendChild(tx);
    }
    var nb = conTerm ? 2 : 1, hueco = 2, bw = Math.max(3, Math.min(14, (paso * 0.7 - hueco * (nb - 1)) / nb)), grupo = bw * nb + hueco * (nb - 1);
    var cada = N > 10 ? 2 : 1, puntos = [];
    datos.forEach(function (x, i) {
      var cx = L + paso * i + paso / 2, x0 = cx - grupo / 2;
      var b1 = barra(x0, y(n(x.personas)), bw, ah - (y(n(x.personas)) - T), C.personas); if (b1) svg.appendChild(b1);
      if (conTerm) { var b2 = barra(x0 + bw + hueco, y(n(x.terminadas)), bw, ah - (y(n(x.terminadas)) - T), C.terminadas); if (b2) svg.appendChild(b2); }
      puntos.push([cx, y(n(x.skool))]);
      if ((N - 1 - i) % cada === 0) { var et = sv('text', { x: cx, y: H - 8, 'text-anchor': 'middle', 'font-size': 10, fill: C.suave }); et.textContent = x.d.getDate() + '/' + (x.d.getMonth() + 1); svg.appendChild(et); }
    });
    svg.appendChild(sv('polyline', { points: puntos.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: 'none', stroke: C.skool, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    puntos.forEach(function (p) { svg.appendChild(sv('circle', { cx: p[0], cy: p[1], r: 4, fill: C.skool, stroke: C.fondo, 'stroke-width': 2 })); });
    /* el último día con su número al lado (solo ese: los demás, al tocar) */
    var ul = datos[N - 1];
    if (ul) { var lt = sv('text', { x: Math.min(W - R, puntos[N - 1][0] + 2), y: Math.max(T + 8, y(Math.max(n(ul.personas), n(ul.terminadas), n(ul.skool))) - 5), 'text-anchor': 'end', 'font-size': 10, 'font-weight': 700, fill: C.texto }); lt.textContent = 'hoy ' + n(ul.personas); svg.appendChild(lt); }
    /* tocar o pasar por encima de un día: su columna se marca y abajo salen los tres números */
    var marca = sv('rect', { x: 0, y: T, width: paso, height: ah, fill: '#10231A', 'fill-opacity': 0, 'pointer-events': 'none' }); svg.insertBefore(marca, svg.firstChild);
    var info = document.createElement('div'); info.className = 'gu-info'; info.textContent = 'Toca un día para ver sus números.';
    function enseña(i) {
      var x = datos[i]; marca.setAttribute('x', L + paso * i); marca.setAttribute('fill-opacity', 0.06);
      info.innerHTML = ''; var b = document.createElement('b'); b.textContent = x.d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) + ': '; info.appendChild(b);
      info.appendChild(document.createTextNode(n(x.personas) + ' aparatos nuevos' + (conTerm ? ' · ' + (x.terminadas === null || x.terminadas === undefined ? '—' : n(x.terminadas)) + ' partidas terminadas' : '') + ' · ' + n(x.skool) + ' a Skool'));
    }
    datos.forEach(function (x, i) {
      var z = sv('rect', { x: L + paso * i, y: 0, width: paso, height: H, fill: 'transparent', style: 'cursor:pointer' });
      z.addEventListener('mouseenter', function () { enseña(i); }); z.addEventListener('click', function () { enseña(i); });
      svg.appendChild(z);
    });
    caja.appendChild(svg); caja.appendChild(info);
  };
})();
