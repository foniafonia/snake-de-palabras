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
  /* Cuánta gente lo abre (José, 13/10: «muy importante»). Solo sumas anónimas, sin cuentas ni
     cookies: aperturas, aparatos distintos (una marca en este aparato dice si ya vino), partidas
     y tandas, y lo mismo por día. Con ?yo=1 este aparato deja de contar (para José y las pruebas);
     ?yo=0 lo vuelve a contar. Se ve todo en estadisticas.html. */
  var MIO = false;
  try {
    if (QS.get('yo') === '1') localStorage.setItem('snake-no-contar', '1');
    if (QS.get('yo') === '0') localStorage.removeItem('snake-no-contar');
    MIO = localStorage.getItem('snake-no-contar') === '1';
  } catch (e) { }
  function hoy() { var d = new Date(); return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); }
  function suma(k) { if (MIO) return; try { if (window.fetch) fetch(CONTADOR + k, { keepalive: true }).catch(function () { }); } catch (e) { } }
  suma('snake_aperturas'); suma('snake_aperturas_' + hoy());
  try {
    if (!MIO && !localStorage.getItem('snake-visto')) { localStorage.setItem('snake-visto', hoy()); suma('snake_personas'); suma('snake_personas_' + hoy()); }
  } catch (e) { }
  if (document.body.className.indexOf('fijado') >= 0) suma('snake_aperturas_enlace_familia');
  /* una partida empieza cuando el juego enseña la cruceta (vale igual con dedo que con ratón) */
  (function () {
    var cruz = document.getElementById('dpad'), puesta = false;
    function mira() { var on = cruz.className === 'on'; if (on && !puesta) { suma('snake_partidas'); suma('snake_partidas_' + hoy()); } puesta = on; }
    if (window.MutationObserver) new MutationObserver(mira).observe(cruz, { attributes: true, attributeFilter: ['class'] }); else setInterval(mira, 700);
  })();

  /* Ir a la comunidad. 13/10: entró una persona desde Telegram y el toque no quedó contado.
     El navegador de dentro de Telegram (y otros parecidos) cambia de página en la misma
     pestaña y corta el aviso antes de que salga. Ahora el aviso sale como una imagen (esos
     navegadores no la cortan con tanta facilidad) y la salida espera un momento:
     si se puede abrir pestaña nueva, se abre al instante y esta página sigue viva; si no,
     se sale a los 350 ms, con el aviso ya enviado. */
  var enl = document.querySelectorAll('a[data-skool]');
  for (var i = 0; i < enl.length; i++) enl[i].addEventListener('click', (function (a) { return function (ev) {
    var d = a.getAttribute('data-skool'), destino = a.href;
    /* un solo recuento por toque, por el camino seguro; la imagen de respaldo NO se usa a la vez
       que la petición para no contar doble: va sola */
    if (!MIO) {
      try { var im = new Image(); im.src = CONTADOR + 'snake_skool_' + d; } catch (e) { }
      try { var im2 = new Image(); im2.src = CONTADOR + 'snake_skool_dia_' + hoy(); } catch (e) { }
      try { if (!localStorage.getItem('snake-fue-a-skool')) { localStorage.setItem('snake-fue-a-skool', hoy()); var im3 = new Image(); im3.src = CONTADOR + 'snake_skool_personas'; } } catch (e) { }
    }
    if (ev && ev.preventDefault) ev.preventDefault();
    var w = null;
    try { w = window.open(destino, '_blank'); if (w) { try { w.opener = null; } catch (e) { } } } catch (e) { w = null; }
    if (!w) setTimeout(function () { location.href = destino; }, 350);
  }; })(enl[i]));

  /* ---------- antes de irse ---------- */
  /* No se puede enseñar nada al cerrar la pestaña (el navegador no deja, y en el móvil ni avisa).
     Sí se pueden pillar los momentos en que se van: en el ordenador, cuando el ratón sube hacia
     las pestañas; en el móvil, cuando vuelven tras haber salido un rato; y al parar la partida.
     Una sola vez por visita, nunca en mitad de una partida y nunca en los enlaces de familia
     (ahí juega un niño). */
  (function () {
    var hoja = $('vDespedida'); if (!hoja) return;
    var FAM = document.body.className.indexOf('fijado') >= 0, visto = false, fuera = 0;
    function jugando() { return $('dpad').className === 'on' && $('vPausa').className.indexOf(' on') < 0 && $('vFin').className.indexOf(' on') < 0; }
    function muestra(por) {
      if (visto || FAM || jugando()) return;
      try { if (localStorage.getItem('snake-fue-a-skool')) return; } catch (e) { }
      visto = true; hoja.className = 'despedida on'; suma('snake_despedida_vista'); suma('snake_despedida_' + por);
    }
    $('dCerrar').onclick = function () { hoja.className = 'despedida'; };
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) muestra('raton'); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) fuera = Date.now();
      else if (fuera && Date.now() - fuera > 8000) setTimeout(function () { muestra('vuelta'); }, 600);
    });
    /* al parar la partida (pausa) también es un buen momento: la tarjeta va dentro de la pausa */
  })();

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
    var ya = {}; G.BANCO.forEach(function (p) { p.suya = false; ya[p.w] = p; });
    PROPIAS = lista.slice();
    lista.forEach(function (w) { if (!ya[w]) G.BANCO.push({ w: w, n: silabas(w), k: norm(w), propia: true }); else ya[w].suya = true; });
  }
  ponPropias(limpiaLista(QS.get('extra')));

  /* ---------- portada ---------- */
  var FIJADO = document.body.className.indexOf('fijado') >= 0;
  if (!FIJADO) { velo('vInicio', false); velo('vPortada', true); }
  $('pJugar').onclick = function () { velo('vPortada', false); G.muestraInicio(); };
  $('pPrepara').onclick = function () { abrePrepara(); };
  $('pOido').onclick = function () { E.audio = true; E.regla = 'empieza'; E.letra = 'b'; abrePrepara(); };
  (function () { var op = document.createElement('option'); op.value = 'conocidas'; op.textContent = 'Solo con las letras que conoce'; $('aRegla').appendChild(op); })();

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
    ['conoce', 'Las letras que ya conoce', 'tú eliges cuáles: a, m, e, o, s, p, n…', 'conocidas', ''],
    ['oido', 'A oído: b/d, p/t, s/z…', 'la serpiente busca audios, no palabras', 'empieza', 'b', 0, 'audio'],
    ['larga', 'Palabras largas', '3 o más sílabas', 'larga', ''],
    ['trabada', 'Sílabas trabadas', 'pla, tre, bra…', 'trabada', ''],
    ['parecida', 'Palabras que se parecen', 'solo vale la que se pide', 'parecida', ''],
    ['espejo', 'Espejo dentro de la palabra', 'b/d y p/q, solo vale la pedida', 'espejo', ''],
    ['real', '¿Existe o es inventada?', 'palabra real frente a inventada', 'real', ''],
    ['ortografia', '¿Bien escrita?', 'b/v, ll/y, h, s/z', 'ortografia', ''],
    ['todas', 'Leer y comer todas', 'solo lectura, sin intrusas', 'todas', '']
  ];
  var SIMBOLOS = 'a b c ch d e f g h i j k l ll m n ñ o p q r rr s t u v w x y z'.split(' ');
  var GENERADAS = ['parecida', 'espejo', 'real', 'ortografia'], OIDO_OK = ['empieza', 'contiene', 'termina', 'silabas', 'todas', 'larga', 'trabada'];
  var LETRAS = 'a b c d e f g h j l m n ñ p q r rr s t v z ch ll'.split(' ');
  var E = { regla: O.regla, letra: O.letra, silabas: O.silabas, meta: O.meta, nivel: O.nivel || 0, velocidad: O.velocidad === 'lenta' ? 'lenta' : '',
    conoce: O.conoce.slice(), directas: !!O.directas, soloPropias: !!O.soloPropias, audio: !!O.audio };
  function reglaDe(e) {
    var L = String(e.letra).toUpperCase();
    var r;
    if (e.regla === 'empieza') r = 'las que EMPIEZAN por ' + L;
    else if (e.regla === 'contiene') r = 'las que CONTIENEN ' + L;
    else if (e.regla === 'termina') r = 'las que TERMINAN en ' + L;
    else if (e.regla === 'silabas') r = e.silabas >= 4 ? 'las de 4 o más sílabas' : 'las de ' + e.silabas + ' sílaba' + (e.silabas === 1 ? '' : 's');
    else if (e.regla === 'conocidas') r = 'las que se leen con ' + e.conoce.join(' ');
    else if (e.regla === 'larga') r = 'las de 3 o más sílabas';
    else if (e.regla === 'trabada') r = 'las que tienen sílaba trabada (pla, tre, bra…)';
    else if (e.regla === 'parecida') r = 'la palabra que se pide entre otras que se le parecen';
    else if (e.regla === 'espejo') r = 'la palabra que se pide entre otras con b/d o p/q cambiadas';
    else if (e.regla === 'real') r = 'las que existen (no las inventadas)';
    else if (e.regla === 'ortografia') r = 'las bien escritas';
    else r = 'todas las palabras';
    if (e.directas && GENERADAS.indexOf(e.regla) < 0) r += ', solo con sílabas directas';
    if (e.soloPropias && GENERADAS.indexOf(e.regla) < 0) r += ', solo de tus palabras';
    if (e.audio && OIDO_OK.indexOf(e.regla) >= 0) r += ', escuchando (a oído)';
    return r;
  }
  function cuantasHay(e) { return G.cuenta(e); }
  function pintaConoce() {
    var c = $('prConoce'); c.innerHTML = '';
    SIMBOLOS.forEach(function (l) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = l; var on = E.conoce.indexOf(l) >= 0; b.className = on ? 'on' : ''; b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.onclick = function () { var k = E.conoce.indexOf(l); if (k >= 0) E.conoce.splice(k, 1); else E.conoce.push(l); pintaPrepara(); };
      c.appendChild(b);
    });
  }
  function pintaPrepara() {
    var c = $('prObjs'); c.innerHTML = '';
    if (GENERADAS.indexOf(E.regla) >= 0 || OIDO_OK.indexOf(E.regla) < 0) E.audio = E.audio && OIDO_OK.indexOf(E.regla) >= 0;
    OBJ.forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button';
      var on = o[3] === E.regla && (o[3] === 'silabas' ? o[5] === E.silabas : (['todas', 'conocidas', 'larga', 'trabada', 'parecida', 'espejo', 'real', 'ortografia'].indexOf(o[3]) >= 0 || o[4] === E.letra)) && !!o[6] === !!E.audio;
      b.className = on ? 'on' : '';
      b.appendChild(document.createTextNode(o[1]));
      var s = document.createElement('small'); s.textContent = o[2]; b.appendChild(s);
      b.onclick = function () { E.regla = o[3]; if (o[4]) E.letra = o[4]; if (o[5]) E.silabas = o[5]; E.audio = !!o[6]; pintaPrepara(); };
      c.appendChild(b);
    });
    $('prRegla').value = E.regla; $('prSil').value = String(E.silabas); $('prMeta').value = String(E.meta);
    $('prNivel').value = E.nivel ? String(E.nivel) : 'auto'; $('prVel').value = E.velocidad;
    var sl = $('prLetra'); if (!sl.options.length) LETRAS.forEach(function (l) { var op = document.createElement('option'); op.value = l; op.textContent = l.toUpperCase(); sl.appendChild(op); });
    sl.value = E.letra;
    var conLetra = ['empieza', 'contiene', 'termina'].indexOf(E.regla) >= 0;
    $('prCLetra').style.display = conLetra ? '' : 'none';
    $('prCSil').style.display = E.regla === 'silabas' ? '' : 'none';
    $('prCConoce').style.display = E.regla === 'conocidas' ? '' : 'none';
    if (E.regla === 'conocidas') pintaConoce();
    var generada = GENERADAS.indexOf(E.regla) >= 0, oidoPosible = OIDO_OK.indexOf(E.regla) >= 0;
    $('prDirectas').checked = !!E.directas; $('prDirectas').disabled = generada;
    $('prSolo').checked = !!E.soloPropias; $('prSolo').disabled = generada;
    $('prAudio').checked = !!E.audio && oidoPosible; $('prAudio').disabled = !oidoPosible;
    $('prAudioNota').textContent = oidoPosible ? '' : 'El modo oído no vale con esta regla: se juzga mirando cómo está escrita la palabra.';
    var n = generada ? -1 : cuantasHay(E), ent = reglaDe(E);
    var texto = (E.regla === 'todas' ? 'La serpiente come todas las palabras' : 'La serpiente come solo ' + ent) + ' · tandas de ' + E.meta;
    if (E.regla === 'todas' && (E.directas || E.soloPropias || E.audio)) texto = 'La serpiente come todas las palabras que cumplen: ' + ent.replace(/^todas las palabras, ?/, '') + ' · tandas de ' + E.meta;
    if (generada) texto += ' · el juego fabrica las palabras que se parecen, no hace falta nada más';
    else if (E.regla !== 'todas' || E.directas || E.soloPropias || E.audio) texto += ' · ' + n + ' palabra' + (n === 1 ? '' : 's') + ' que valen' + (n < 4 ? ' (pocas: añade palabras tuyas o cambia la regla)' : '');
    if (E.soloPropias && !PROPIAS.length) texto += ' · escribe tus palabras en el paso 3';
    if (E.audio && oidoPosible) texto += ' · solo suenan las que tienen voz (las tuyas no)';
    $('prResumen').textContent = texto;
    $('prEnlace').className = 'enlace';
  }
  function leeFormulario() {
    E.regla = $('prRegla').value; E.letra = $('prLetra').value; E.silabas = parseInt($('prSil').value, 10);
    E.meta = parseInt($('prMeta').value, 10); E.nivel = $('prNivel').value === 'auto' ? 0 : parseInt($('prNivel').value, 10); E.velocidad = $('prVel').value;
    E.directas = $('prDirectas').checked; E.soloPropias = $('prSolo').checked; E.audio = $('prAudio').checked;
  }
  ['prRegla', 'prLetra', 'prSil', 'prMeta', 'prNivel', 'prVel', 'prDirectas', 'prSolo', 'prAudio'].forEach(function (id) { $(id).onchange = function () { leeFormulario(); pintaPrepara(); }; });
  $('prPropias').onchange = function () { ponPropias(limpiaLista($('prPropias').value)); pintaPrepara(); };
  function abrePrepara() {
    velo('vPortada', false); velo('vInicio', false); velo('vFin', false);
    $('prPropias').value = PROPIAS.join(', ');
    pintaPrepara(); velo('vPrepara', true);
  }
  function aplica() {
    leeFormulario(); ponPropias(limpiaLista($('prPropias').value));
    O.regla = E.regla; O.letra = E.letra; O.silabas = E.silabas; O.meta = E.meta; O.nivel = E.nivel; O.velocidad = E.velocidad || null;
    O.conoce = E.conoce.length ? E.conoce.slice() : ['a', 'm', 'e', 'o', 's', 'p', 'n']; O.directas = !!E.directas && GENERADAS.indexOf(E.regla) < 0; O.soloPropias = !!E.soloPropias && GENERADAS.indexOf(E.regla) < 0; O.audio = !!E.audio && OIDO_OK.indexOf(E.regla) >= 0;
    G.sinMundos();
    try { if (['conocidas', 'parecida', 'espejo', 'real', 'ortografia'].indexOf(O.regla) < 0) localStorage.setItem('fonia-snake-opc', JSON.stringify({ regla: O.regla, letra: O.letra, silabas: O.silabas, meta: O.meta, nivel: O.nivel })); } catch (e) { }
  }
  $('prJugar').onclick = function () {
    aplica(); velo('vPrepara', false); G.hud(); G.muestraInicio(); suma('snake_partida_preparada');
    if (O.audio && G.OPC.regla !== 'parecida') suma('snake_modo_oido');
    if (O.regla === 'conocidas') suma('snake_modo_conocidas');
    if (O.directas) suma('snake_modo_directas');
    if (O.soloPropias) suma('snake_modo_solo_propias');
  };
  $('prVolver').onclick = function () { velo('vPrepara', false); velo('vPortada', true); };
  function enlaceFamilia() {
    var p = ['filtro=' + E.regla];
    if (['empieza', 'contiene', 'termina'].indexOf(E.regla) >= 0) p.push('letra=' + encodeURIComponent(E.letra));
    if (E.regla === 'silabas') p.push('silabas=' + E.silabas);
    if (E.regla === 'conocidas') p.push('conoce=' + encodeURIComponent(E.conoce.join(',')));
    if (E.directas && GENERADAS.indexOf(E.regla) < 0) p.push('directas=1');
    if (E.soloPropias && GENERADAS.indexOf(E.regla) < 0) p.push('solo=1');
    if (E.audio && OIDO_OK.indexOf(E.regla) >= 0) p.push('modo=audio');
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
    suma('snake_tandas_terminadas'); suma('snake_tandas_terminadas_' + hoy());
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

/* ---------- de qué canal llega la gente (28/10/2026) ----------
   Si el enlace trae ?c=sk (Skool), ?c=wa (WhatsApp)…, se suma de forma anónima cuántas aperturas, aparatos distintos y partidas
   vienen de ese canal. Sin cuentas ni nombres. Respeta «No contar este aparato» y ?yo=1. */
(function () {
  try {
    var p = new URLSearchParams(location.search), c = (p.get('c') || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 3);
    if (c) localStorage.setItem('snake-canal', c);
    var canal = localStorage.getItem('snake-canal') || '';
    if (!canal || localStorage.getItem('snake-no-contar') === '1' || p.get('yo') === '1') return;
    var U = 'https://abacus.jasoncameron.dev/hit/foniafonia-juegos/';
    function hit(k) { try { fetch(U + k, { keepalive: true }).catch(function () { }); } catch (e) { } }
    if (c) { hit('snake_c_' + c + '_aperturas'); if (!localStorage.getItem('snake-visto-' + c)) { localStorage.setItem('snake-visto-' + c, '1'); hit('snake_c_' + c + '_personas'); } }
    var cruz = document.getElementById('dpad'), puesta = false;
    function mira() { var on = !!cruz && cruz.className === 'on'; if (on && !puesta) hit('snake_c_' + canal + '_partidas'); puesta = on; }
    if (cruz && window.MutationObserver) new MutationObserver(mira).observe(cruz, { attributes: true, attributeFilter: ['class'] });
  } catch (e) { }
})();
