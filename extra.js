/* Snake de palabras · lo que añade la versión pública (ColmenIA) al juego de Fönia.
   No toca el juego: usa lo que este deja a mano en window.__snake.
   Portada, «Prepara la partida» (objetivos, palabras propias y enlace para la familia),
   informe al acabar la tanda y avisos a la comunidad. Sin sintaxis nueva: iPad antiguos. */
(function () {
  var G = window.__snake; if (!G) return;
  var O = G.OPC, QS;
  try { QS = new URLSearchParams(location.search); } catch (e) { QS = { get: function () { return null; } }; }
  function $(i) { return document.getElementById(i); }
  function velo(id, on) { $(id).className = 'velo' + (on ? ' on' : ''); }
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var CONTADOR = 'https://abacus.jasoncameron.dev/hit/foniafonia-juegos/';
  function suma(k) { try { if (window.fetch) fetch(CONTADOR + k, { keepalive: true }).catch(function () { }); } catch (e) { } }
  suma('snake_aperturas');
  var enl = document.querySelectorAll('a[data-skool]');
  for (var i = 0; i < enl.length; i++) enl[i].addEventListener('click', (function (d) { return function () { suma('snake_skool_' + d); }; })(enl[i].getAttribute('data-skool')));

  /* ---------- palabras propias ---------- */
  /* Cuenta sílabas en castellano de forma aproximada: cada grupo de vocales es una sílaba,
     salvo que se junten dos fuertes (a, e, o) o haya una débil con tilde (í, ú), que se separan.
     La u de «que, qui, gue, gui» no cuenta. Vale para palabras corrientes; no es infalible. */
  function silabas(w) {
    var s = w.toLowerCase().replace(/qu/g, 'q').replace(/gu([eiéí])/g, 'g$1'), n = 0, ant = '';
    for (var k = 0; k < s.length; k++) {
      var c = s.charAt(k), fuerte = 'aeoáéó'.indexOf(c) >= 0, rota = 'íú'.indexOf(c) >= 0, debil = 'iuü'.indexOf(c) >= 0;
      if (!(fuerte || rota || debil) && !(c === 'y' && k === s.length - 1 && ant)) { ant = ''; continue; }
      if (c === 'y') { continue; }
      if (!ant) n++;
      else if (rota || ant === 'R' || (fuerte && ant === 'F')) n++;
      ant = rota ? 'R' : (fuerte ? 'F' : 'D');
    }
    return Math.max(1, n);
  }
  function limpiaLista(txt) {
    var vistos = {}, sal = [];
    String(txt || '').split(/[\s,;]+/).forEach(function (w) {
      w = w.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
      if (w.length < 2 || w.length > 12 || vistos[w] || sal.length >= 30) return;
      vistos[w] = 1; sal.push(w);
    });
    return sal;
  }
  var PROPIAS = [];
  function ponPropias(lista) {
    /* fuera las de antes, dentro las nuevas (las que el banco ya tiene no se repiten) */
    for (var k = G.BANCO.length - 1; k >= 0; k--) if (G.BANCO[k].propia) G.BANCO.splice(k, 1);
    var ya = {}; G.BANCO.forEach(function (p) { ya[p.w] = 1; });
    PROPIAS = lista.slice();
    lista.forEach(function (w) { if (!ya[w]) G.BANCO.push({ w: w, n: silabas(w), k: norm(w), propia: true }); });
  }
  ponPropias(limpiaLista(QS.get('extra')));

  /* ---------- portada ---------- */
  var FIJADO = document.body.className.indexOf('fijado') >= 0;
  if (!FIJADO) { velo('vInicio', false); velo('vPortada', true); }
  $('pJugar').onclick = function () { velo('vPortada', false); G.muestraInicio(); };
  $('pPrepara').onclick = function () { abrePrepara(); };

  /* ---------- prepara la partida ---------- */
  var OBJ = [
    ['r-ini', 'Erre al principio', 'rana, rosa, reloj…', 'empieza', 'r'],
    ['rr', 'Erre doble', 'perro, carro, torre…', 'contiene', 'rr'],
    ['r', 'Erre en cualquier sitio', 'cara, árbol, tren…', 'contiene', 'r'],
    ['b', 'Letras espejo: B', 'apunta si se va a la D', 'empieza', 'b'],
    ['d', 'Letras espejo: D', 'apunta si se va a la B', 'empieza', 'd'],
    ['p', 'Letras espejo: P', 'apunta si se va a la Q', 'empieza', 'p'],
    ['s', 'Ese', 'sol, silla, sopa…', 'empieza', 's'],
    ['z', 'Zeta', 'zapato, zumo, zorro…', 'empieza', 'z'],
    ['l', 'Ele', 'luna, leche, libro…', 'empieza', 'l'],
    ['s2', 'Palabras de 2 sílabas', 'contar golpes de voz', 'silabas', '', 2],
    ['s3', 'Palabras de 3 sílabas', 'contar golpes de voz', 'silabas', '', 3],
    ['todas', 'Leer y comer todas', 'solo lectura, sin intrusas', 'todas', '']
  ];
  var LETRAS = 'a b c d e f g h j l m n ñ p q r rr s t v z ch ll'.split(' ');
  var E = { regla: O.regla, letra: O.letra, silabas: O.silabas, meta: O.meta, nivel: O.nivel || 0, velocidad: O.velocidad === 'lenta' ? 'lenta' : '' };
  function reglaDe(e) {
    var L = String(e.letra).toUpperCase();
    if (e.regla === 'empieza') return 'las que EMPIEZAN por ' + L;
    if (e.regla === 'contiene') return 'las que CONTIENEN ' + L;
    if (e.regla === 'termina') return 'las que TERMINAN en ' + L;
    if (e.regla === 'silabas') return e.silabas >= 4 ? 'las de 4 o más sílabas' : 'las de ' + e.silabas + ' sílaba' + (e.silabas === 1 ? '' : 's');
    return 'todas las palabras';
  }
  function cuantasHay(e) {
    var l = norm(e.letra), n = 0;
    G.BANCO.forEach(function (p) {
      var k = p.k, v = e.regla === 'empieza' ? k.indexOf(l) === 0 : e.regla === 'contiene' ? k.indexOf(l) >= 0 :
        e.regla === 'termina' ? (k.length >= l.length && k.lastIndexOf(l) === k.length - l.length) :
          e.regla === 'silabas' ? (e.silabas >= 4 ? p.n >= 4 : p.n === e.silabas) : true;
      if (v) n++;
    });
    return n;
  }
  function pintaPrepara() {
    var c = $('prObjs'); c.innerHTML = '';
    OBJ.forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button';
      var on = o[3] === E.regla && (o[3] === 'silabas' ? o[5] === E.silabas : (o[3] === 'todas' || o[4] === E.letra));
      b.className = on ? 'on' : '';
      b.appendChild(document.createTextNode(o[1]));
      var s = document.createElement('small'); s.textContent = o[2]; b.appendChild(s);
      b.onclick = function () { E.regla = o[3]; if (o[4]) E.letra = o[4]; if (o[5]) E.silabas = o[5]; pintaPrepara(); };
      c.appendChild(b);
    });
    $('prRegla').value = E.regla; $('prSil').value = String(E.silabas); $('prMeta').value = String(E.meta);
    $('prNivel').value = E.nivel ? String(E.nivel) : 'auto'; $('prVel').value = E.velocidad;
    var sl = $('prLetra'); if (!sl.options.length) LETRAS.forEach(function (l) { var op = document.createElement('option'); op.value = l; op.textContent = l.toUpperCase(); sl.appendChild(op); });
    sl.value = E.letra;
    $('prCLetra').style.display = (E.regla === 'silabas' || E.regla === 'todas') ? 'none' : '';
    $('prCSil').style.display = E.regla === 'silabas' ? '' : 'none';
    var n = cuantasHay(E);
    $('prResumen').textContent = (E.regla === 'todas' ? 'La serpiente come todas las palabras' : 'La serpiente come solo ' + reglaDe(E)) + ' · tandas de ' + E.meta +
      (E.regla === 'todas' ? '' : ' · ' + n + ' palabra' + (n === 1 ? '' : 's') + ' que valen' + (n < 4 ? ' (pocas: añade palabras tuyas o cambia la regla)' : ''));
    $('prEnlace').className = 'enlace';
  }
  function leeFormulario() {
    E.regla = $('prRegla').value; E.letra = $('prLetra').value; E.silabas = parseInt($('prSil').value, 10);
    E.meta = parseInt($('prMeta').value, 10); E.nivel = $('prNivel').value === 'auto' ? 0 : parseInt($('prNivel').value, 10); E.velocidad = $('prVel').value;
  }
  ['prRegla', 'prLetra', 'prSil', 'prMeta', 'prNivel', 'prVel'].forEach(function (id) { $(id).onchange = function () { leeFormulario(); pintaPrepara(); }; });
  $('prPropias').onchange = function () { ponPropias(limpiaLista($('prPropias').value)); pintaPrepara(); };
  function abrePrepara() {
    velo('vPortada', false); velo('vInicio', false); velo('vFin', false);
    $('prPropias').value = PROPIAS.join(', ');
    pintaPrepara(); velo('vPrepara', true);
  }
  function aplica() {
    leeFormulario(); ponPropias(limpiaLista($('prPropias').value));
    O.regla = E.regla; O.letra = E.letra; O.silabas = E.silabas; O.meta = E.meta; O.nivel = E.nivel; O.velocidad = E.velocidad || null;
    try { localStorage.setItem('fonia-snake-opc', JSON.stringify({ regla: O.regla, letra: O.letra, silabas: O.silabas, meta: O.meta, nivel: O.nivel })); } catch (e) { }
  }
  $('prJugar').onclick = function () { aplica(); velo('vPrepara', false); G.hud(); G.muestraInicio(); suma('snake_partida_preparada'); };
  $('prVolver').onclick = function () { velo('vPrepara', false); velo('vPortada', true); };
  function enlaceFamilia() {
    var p = ['filtro=' + E.regla];
    if (E.regla !== 'silabas' && E.regla !== 'todas') p.push('letra=' + encodeURIComponent(E.letra));
    if (E.regla === 'silabas') p.push('silabas=' + E.silabas);
    p.push('meta=' + E.meta);
    if (E.nivel) p.push('nivel=' + E.nivel);
    if (E.velocidad) p.push('velocidad=' + E.velocidad);
    if (PROPIAS.length) p.push('extra=' + encodeURIComponent(PROPIAS.join(',')));
    return location.protocol + '//' + location.host + location.pathname + '?' + p.join('&');
  }
  function copia(texto, donde) {
    function dicho(ok) { donde.textContent = ok ? '✔ Copiado. Pégalo donde quieras.' : 'No se ha podido copiar: mantén pulsado el texto y cópialo a mano.'; }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texto).then(function () { dicho(true); }, function () { dicho(false); }); return; }
    } catch (e) { }
    try {
      var t = document.createElement('textarea'); t.value = texto; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.top = '-999px';
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, texto.length); var ok = document.execCommand('copy'); document.body.removeChild(t); dicho(ok);
    } catch (e) { dicho(false); }
  }
  function comparte(texto, url, donde) {
    try { if (navigator.share) { navigator.share(url ? { text: texto, url: url } : { text: texto }).catch(function () { }); return; } } catch (e) { }
    window.open('https://wa.me/?text=' + encodeURIComponent(texto + (url ? ' ' + url : '')), '_blank');
  }
  $('prCrear').onclick = function () {
    leeFormulario(); ponPropias(limpiaLista($('prPropias').value));
    $('prUrl').value = enlaceFamilia(); $('prEnlace').className = 'enlace on'; $('prCopiado').textContent = ''; suma('snake_enlace_familia');
  };
  $('prCopiar').onclick = function () { copia($('prUrl').value, $('prCopiado')); };
  $('prCompartir').onclick = function () {
    comparte('🐍 Snake de palabras. La serpiente come solo ' + reglaDe(E) + '. Una tanda al día, 5 minutos:', $('prUrl').value, $('prCopiado'));
  };
  $('prUrl').onclick = function () { try { this.select(); } catch (e) { } };

  /* ---------- informe al acabar la tanda ---------- */
  var NOMBRES = { 'Fönia · Cómo va': 'Cómo va', 'Fönia · Qué le cuesta': 'Qué le cuesta', 'Fönia · Qué toca ahora': 'Qué toca ahora' };
  var CLAVES = { 'Acierto al elegir': 1, 'Letras que confunde': 1, 'Cómo va': 1 };
  var textoInforme = '';
  function pintaInforme() {
    var filas; try { filas = G.filas(false); } catch (e) { return; }
    var dl = $('infFilas'); dl.innerHTML = ''; var lineas = ['🐍 Snake de palabras · informe de la tanda'];
    filas.forEach(function (f) {
      if (f[0] === 'Medido por' || f[0] === 'Se mordió la cola') return;
      var n = NOMBRES[f[0]] || f[0], v = String(f[1]).replace(' (fijado por la logopeda)', ' (fijado)');
      var dt = document.createElement('dt'); dt.textContent = n; var dd = document.createElement('dd'); dd.textContent = v; if (CLAVES[n]) dd.className = 'clave';
      dl.appendChild(dt); dl.appendChild(dd); lineas.push(n + ': ' + v);
    });
    lineas.push('Lo mide el juego con lo que toca la serpiente: orienta, no diagnostica.');
    textoInforme = lineas.join('\n'); $('infDicho').textContent = '';
  }
  $('infCompartir').onclick = function () { comparte(textoInforme, '', $('infDicho')); suma('snake_informe_compartido'); };
  $('infCopiar').onclick = function () { copia(textoInforme, $('infDicho')); };
  $('finPrepara').onclick = function () { abrePrepara(); };
  var fin = $('vFin'), abierto = false;
  function mira() { var on = fin.className.indexOf(' on') >= 0; if (on && !abierto) pintaInforme(); abierto = on; }
  if (window.MutationObserver) new MutationObserver(mira).observe(fin, { attributes: true, attributeFilter: ['class'] });
  else setInterval(mira, 500);
  if (FIJADO) $('finPrepara').style.display = 'none';
})();
