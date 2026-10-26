/* ====================== ColmenIA · lo que han pedido en la comunidad (25/10/2026) ======================
   1 · «Letras que ya conoce»: la serpiente come solo palabras que se leen con las letras que el niño sabe
       (petición de Mai: a, m, e, o, s, p, n). Regla nueva: conocidas.
   2 · «Solo sílabas directas» (ma, pe, si, so, mu…, sin trabadas ni sílabas cerradas): filtro que vale
       para cualquier regla. Responde a «conoce la m y la a pero no dice ma».
   3 · «Solo mis palabras»: el banco se reduce a las que ha escrito la logopeda.
   4 · Modo oído: la serpiente busca audios, no palabras escritas (Raquel: discriminación auditiva, b/d).
       Cada ficha es un altavoz; suena por turnos y cuando la cabeza se acerca; 🎧 la repite.
       Solo con palabras que tienen voz y con reglas que se juzgan por el sonido. */
function simbolosDe(w) {
  var s = String(w).toLowerCase().replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u'), sal = [], i = 0, d;
  while (i < s.length) {
    d = s.substr(i, 2);
    if (d === 'ch' || d === 'll' || d === 'rr') { sal.push(d); i += 2; } else { sal.push(s.charAt(i)); i++; }
  }
  return sal;
}
var CONOCE_CLAVE = '', CONOCE_MAPA = {};
function conoceMapa() {
  var k = OPC.conoce.join(',');
  if (k !== CONOCE_CLAVE) { CONOCE_CLAVE = k; CONOCE_MAPA = {}; OPC.conoce.forEach(function (x) { CONOCE_MAPA[x] = 1; }); }
  return CONOCE_MAPA;
}
function primeraDesconocida(w) {
  var m = conoceMapa(), s = simbolosDe(w);
  for (var i = 0; i < s.length; i++) if (!m[s[i]]) return s[i];
  return '';
}
function todasConocidas(w) { return primeraDesconocida(w) === ''; }
function directa(w) {
  var s = String(w).toLowerCase().replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u')
    .replace(/ch|ll|rr|qu/g, 'x').replace(/gu(?=[ei])/g, 'x');
  return /^(?:[bcdfghjklmnñpqrstvwxyz]?[aeiou])+$/.test(s) && !/[aeiou]{2}/.test(s);
}
function conVoz(w) { return !!(window.VOZ_SNAKE && window.VOZ_SNAKE[w]); }
function audioOn() { return !!OPC.audio && ['empieza', 'contiene', 'termina', 'silabas', 'todas', 'larga', 'trabada'].indexOf(OPC.regla) >= 0; }
function BANCO_JUEGO(estricto) {
  var oido = audioOn();
  var l = BANCO.filter(function (p) {
    if (oido && !conVoz(p.w)) return false;
    if (oido && ['empieza', 'contiene', 'termina'].indexOf(OPC.regla) >= 0 && dudosaPorSonido(p)) return false;
    if (OPC.soloPropias && !(p.propia || p.suya)) return false;
    if (OPC.directas && !directa(p.w)) return false;
    return true;
  });
  return (l.length || estricto) ? l : BANCO;
}
function sufijoRegla() {
  var s = '';
  if (OPC.directas) s += ' · solo <b>sílabas directas</b>';
  if (OPC.soloPropias) s += ' · tus palabras';
  if (audioOn()) s += ' · 🎧 <b>a oído</b>';
  return s;
}
function cuenta(e) {
  var g = { regla: OPC.regla, letra: OPC.letra, silabas: OPC.silabas, conoce: OPC.conoce, directas: OPC.directas, soloPropias: OPC.soloPropias, audio: OPC.audio };
  var n = -1;
  try {
    OPC.regla = e.regla; OPC.letra = e.letra || OPC.letra; OPC.silabas = e.silabas || OPC.silabas; OPC.conoce = e.conoce && e.conoce.length ? e.conoce : OPC.conoce;
    OPC.directas = !!e.directas; OPC.soloPropias = !!e.soloPropias; OPC.audio = !!e.audio;
    if (!GENERADA[OPC.regla]) n = BANCO_JUEGO(true).filter(cumple).length;
  } catch (x) { }
  OPC.regla = g.regla; OPC.letra = g.letra; OPC.silabas = g.silabas; OPC.conoce = g.conoce; OPC.directas = g.directas; OPC.soloPropias = g.soloPropias; OPC.audio = g.audio;
  return n;
}

/* ---------- la voz, por el motor de audio ----------
   Los móviles (sobre todo Safari) dejan sonar un audio nuevo solo si lo arranca un toque; los sonidos que
   salen de un temporizador, como los del modo oído, se rechazan tras los primeros (el dibujo seguía, sin voz).
   El juego ya desbloquea el motor de audio (actx) al tocar: la voz se decodifica una vez y suena por ahí.
   Si el motor no está listo, se usa el elemento de audio de siempre. */
var VOCES = {}, fuenteVoz = null, finVoz = null, vozN = 0;
function sueltaVoz() { var f = finVoz; finVoz = null; if (f) { try { f(); } catch (e) { } } }
function vozHtml(url) {
  try { if (audioPalabra) audioPalabra.pause(); audioPalabra = new Audio(url); audioPalabra.onended = sueltaVoz; var p = audioPalabra.play(); if (p && p.catch) p.catch(function () { }); } catch (e) { }
}
function vozUrl(w) { return 'snake-voz/' + window.VOZ_SNAKE[w] + '.mp3'; }
function motorListo() { return !!(actx && actx.state === 'running' && window.fetch && actx.decodeAudioData); }
function cargaVoz(w, alTener, alFallar) {
  if (VOCES[w]) { alTener(VOCES[w]); return; }
  try {
    fetch(vozUrl(w)).then(function (r) { return r.arrayBuffer(); }).then(function (ab) {
      actx.decodeAudioData(ab, function (b) { VOCES[w] = b; alTener(b); }, function () { if (alFallar) alFallar(); });
    }).catch(function () { if (alFallar) alFallar(); });
  } catch (e) { if (alFallar) alFallar(); }
}
function precargaVoz(w) { if (window.VOZ_SNAKE && window.VOZ_SNAKE[w] && !VOCES[w] && motorListo()) cargaVoz(w, function () { }, null); }
function dicePalabra(w) {
  if (!sonido || !window.VOZ_SNAKE || !window.VOZ_SNAKE[w]) return;
  audioListo();
  if (!motorListo()) { vozHtml(vozUrl(w)); return; }
  var mi = ++vozN;
  cargaVoz(w, function (buf) {
    if (mi !== vozN) return;
    try {
      if (fuenteVoz) { fuenteVoz.onended = null; try { fuenteVoz.stop(); } catch (e) { } }
      if (audioPalabra) { try { audioPalabra.pause(); } catch (e) { } }
      var f = actx.createBufferSource(); f.buffer = buf; f.connect(actx.destination);
      f.onended = function () { if (fuenteVoz === f) { fuenteVoz = null; sueltaVoz(); } };
      fuenteVoz = f; f.start(0);
    } catch (e) { vozHtml(vozUrl(w)); }
  }, function () { if (mi === vozN) vozHtml(vozUrl(w)); });
}

/* ---------- cómo suena (modo oído) ----------
   Por el oído, «queso» empieza igual que «casa» (k) y «hielo» no empieza por h: eso vale para todos los hablantes.
   Otros pares no suenan igual en todas partes: b/v (hay quien los distingue), s/z/ce/ci (con o sin seseo) y ll/y
   (con o sin yeísmo). Con esos pares el juego NO decide: las palabras dudosas salen del tablero, ni suman ni
   restan, para no decirle a nadie que se equivoca por algo que depende de cómo habla. */
function limpiaFon(s) {
  return String(s).toLowerCase().replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u')
    .replace(/ch/g, '#').replace(/rr/g, 'r').replace(/qu/g, 'k').replace(/gu(?=[ei])/g, 'G').replace(/g(?=[ei])/g, 'j')
    .replace(/G/g, 'g').replace(/[cq]/g, function () { return 'c'; }).replace(/h/g, '').replace(/w/g, 'v');
}
/* estricto: cada letra de los pares dudosos cuenta por separado; suave: se juntan */
function fonEstricta(s) { return limpiaFon(s).replace(/ll/g, 'L').replace(/c(?=[ei])/g, 'z').replace(/c/g, 'k'); }
function fonSuave(s) { return fonEstricta(s).replace(/v/g, 'b').replace(/z/g, 's').replace(/L/g, 'y'); }
function coincide(f, lf, regla) {
  if (!lf) return false;
  if (regla === 'empieza') return f.indexOf(lf) === 0;
  if (regla === 'contiene') return f.indexOf(lf) >= 0;
  return f.length >= lf.length && f.lastIndexOf(lf) === f.length - lf.length;
}
function cumplePorSonido(p) {
  var fe = p.fe || (p.fe = fonEstricta(p.w));
  return coincide(fe, fonEstricta(OPC.letra), OPC.regla);
}
function dudosaPorSonido(p) {
  var fe = p.fe || (p.fe = fonEstricta(p.w)), fs = p.fs || (p.fs = fonSuave(p.w));
  return coincide(fs, fonSuave(OPC.letra), OPC.regla) !== coincide(fe, fonEstricta(OPC.letra), OPC.regla);
}

/* ---------- modo oído ---------- */
var oyendo = null, ultSuena = 0;
function distToro(a, b) { var dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y); return Math.min(dx, COLS - dx) + Math.min(dy, ROWS - dy); }
function suenaFicha(t) {
  if (!t) return;
  t.suena = Date.now(); t.oido = t.suena; ultSuena = t.suena; oyendo = t;
  var libera = function () { if (oyendo === t) { oyendo = null; ultSuena = Date.now(); } };
  finVoz = libera;
  dicePalabra(t.p.w);
  setTimeout(libera, 2200);
}
function fichaCercana() {
  var h = S.snake[0], mejor = null, dm = 99, k, t, d;
  for (k = 0; k < S.tokens.length; k++) {
    t = S.tokens[k];
    d = Math.min(distToro(h, t.cells[0]), distToro(h, t.cells[t.cells.length - 1]));
    if (d < dm) { dm = d; mejor = t; }
  }
  return { t: mejor, d: dm };
}
function turnoOido() {
  if (!S || !jugando || pausado || !S.tokens.length || !audioOn() || oyendo) return;
  var ahora = Date.now(), c = fichaCercana(), k, t, nueva = null;
  if (ahora - ultSuena < 700) return;
  /* la cabeza se acerca a una ficha: suena otra vez, para decidir (solo si ya pasó un rato desde que sonó) */
  if (c.t && c.d <= 2 && ahora - (c.t.oido || 0) > 3500) { suenaFicha(c.t); return; }
  /* cada ficha nueva suena una vez, de una en una; después se queda en silencio hasta que la cabeza se acerque o se pulse 🎧 */
  for (k = 0; k < S.tokens.length; k++) { t = S.tokens[k]; if (!t.oido && (!nueva || t.nace < nueva.nace)) nueva = t; }
  if (nueva) suenaFicha(nueva);
}
$('bOir').onclick = function () { if (S && S.tokens.length && audioOn()) { var c = fichaCercana(); if (c.t) { if (!sonido) { sonido = true; $('bSonido').textContent = '🔊'; } suenaFicha(c.t); } } };

