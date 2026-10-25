/* Prueba sin navegador: carga index.html en un «DOM» de mentira y ejercita el juego. Uso: node prueba.js [querystring] */
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = __dirname, qs = process.env.QS_PRUEBA || '';
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

function comodin(nombre) {
  const f = function () { return comodin(nombre + '()'); };
  return new Proxy(f, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return (h) => (h === 'string' ? '' : 40);
      if (k === 'width' || k === 'height' || k === 'clientWidth' || k === 'clientHeight' || k === 'innerWidth' || k === 'length') return 400;
      if (k === 'then') return undefined;
      if (k === 'style') return t.__style || (t.__style = {});
      if (k === 'classList') return { add() { }, remove() { }, contains() { return false; }, toggle() { } };
      if (k === 'options') return [];
      if (k === 'getBoundingClientRect') return () => ({ left: 0, top: 0, width: 400, height: 400 });
      if (k in t) return t[k];
      return comodin(nombre + '.' + String(k));
    },
    set(t, k, v) { t[k] = v; return true; },
    apply() { return comodin(nombre + '()'); }
  });
}
const elementos = {};
const sonidos = [];
const ctx = {
  console, setTimeout, clearTimeout, setInterval, clearInterval, Math, Date, JSON, Object, Array, String, Number, RegExp, parseInt, parseFloat, isNaN, Promise,
  URLSearchParams, encodeURIComponent, decodeURIComponent,
  location: { search: qs ? '?' + qs : '', href: 'http://x/', protocol: 'http:', host: 'x', pathname: '/' },
  localStorage: { _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } },
  navigator: {}, requestAnimationFrame() { }, matchMedia() { return { matches: false, addListener() { }, addEventListener() { } }; },
  Image: function () { }, Audio: function (src) { this.src = src; this.play = function () { sonidos.push(src); return { catch() { } }; }; this.pause = function () { }; },
  MutationObserver: function () { this.observe = function () { }; },
  fetch() { return { catch() { } }; },
  document: {
    hidden: false, body: comodin('body'), documentElement: comodin('html'), addEventListener() { },
    getElementById(i) { return elementos[i] || (elementos[i] = comodin('#' + i)); },
    querySelector() { return comodin('q'); }, querySelectorAll() { return []; }, createElement() { return comodin('el'); }, createTextNode(t) { return comodin('txt'); }
  },
  addEventListener() { }, devicePixelRatio: 1, innerWidth: 800, innerHeight: 600
};
ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);

const re = /<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g;
let m, n = 0;
while ((m = re.exec(html))) {
  let codigo = m[1] ? fs.readFileSync(path.join(dir, m[1]), 'utf8') : m[2];
  if (codigo.indexOf('window.__snake = {') >= 0) {
    codigo = codigo.replace('window.__snake = {', 'window.__snake = { _S: function () { return S; }, _rellena: rellena, _nuevaPartida: nuevaPartida, _paso: paso, _turno: turnoOido, _directa: directa, _conocidas: todasConocidas, _palabraNueva: palabraNueva, _cumple: cumple, _reglaHtml: reglaHtml, _audioOn: audioOn, _juego: BANCO_JUEGO, _setJugando: function (v) { jugando = v; }, _dibujaToken: dibujaToken, _decide: decide, _oyendo: function () { return oyendo; }, _ultSuena: function () { return ultSuena; }, _sonido: function () { return sonido; },');
  }
  try { vm.runInContext(codigo, ctx, { filename: m[1] || ('inline' + n) }); } catch (e) { console.log('ERROR en', m[1] || ('inline' + n), '→', e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n') : e); process.exitCode = 1; }
  n++;
}
module.exports = { ctx, sonidos };
if (require.main === module) {
  const G = ctx.__snake;
  console.log('arranque ok · regla', G.OPC.regla, '· audio', G.OPC.audio, '· banco', G.BANCO.length);
}
