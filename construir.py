"""Saca «Snake de palabras» del SaaS de Fönia a una página suelta y pública.

Parte del material de Fönia (lectoescritura/snake-de-palabras.html) y le quita todo lo del
gabinete: aviso de protección de datos, código de paciente, envío de resultados y bichito de
revisión. Le pone la firma (laboratorio: Gabinete Fönia · lo entrega: ColmenIA) y el botón a
la comunidad. No se edita index.html a mano: se cambia aquí y se vuelve a construir.

Uso:  python3 construir.py /ruta/al/repositorio/de/fonia
"""
import pathlib, shutil, sys

ORIGEN = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else
                      pathlib.Path.home() / 'Developer/simulaciones-interactivas/.claude/worktrees/rotacismo-paquete')
AQUI = pathlib.Path(__file__).resolve().parent
SKOOL = 'https://www.skool.com/logopedia-7339/about'

s = (ORIGEN / 'lectoescritura/snake-de-palabras.html').read_text(encoding='utf-8')

def cambia(viejo, nuevo, veces=1):
    global s
    if s.count(viejo) != veces:
        sys.exit('El material de Fönia ha cambiado; no encuentro (%d veces): %s' % (s.count(viejo), viejo[:70]))
    s = s.replace(viejo, nuevo)

# --- cabecera ---
cambia('<title>Snake de palabras · Gabinete Fönia</title>',
       '<title>Snake de palabras · Versión 2 · ColmenIA</title>\n'
       '<meta name="description" content="Juego de lectura: la serpiente solo come las palabras que cumplen la regla (empiezan por R, tienen dos sílabas…). Hecho en el laboratorio de Gabinete Fönia, lo entrega ColmenIA.">\n'
       '<meta property="og:title" content="Snake de palabras · juego de lectura">\n'
       '<meta property="og:description" content="La serpiente solo come las palabras que cumplen la regla. Tú eliges la regla.">\n'
       '<meta property="og:image" content="https://foniafonia.github.io/snake-de-palabras/portada/portada-ancha.jpg">\n'
       '<meta property="og:type" content="website">\n<meta name="twitter:card" content="summary_large_image">')
cambia('<link rel="icon" href="../equipo/icono-192.png">',
       '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🐍%3C/text%3E%3C/svg%3E">')

# --- que una red lenta o que bloquee las fuentes no deje la página en blanco ---
# (13/10: una logopeda del grupo, «a mí no se me abre»; a otras 55 personas sí. La hoja de
# fuentes de Google frenaba el pintado hasta llegar: ahora se pide sin frenar y, mientras, se
# ve con la letra del aparato.)
cambia('<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Jost:wght@500;600&display=swap" rel="stylesheet">',
       '<script>\n/* si algo falla al arrancar, que quede apuntado (solo la suma) y que se diga en pantalla */\n'
       'window.addEventListener("error", function (e) {\n'
       '  if (window.__snakeFallo) return; window.__snakeFallo = true;\n'
       '  try { if (localStorage.getItem("snake-no-contar") !== "1") new Image().src = "https://abacus.jasoncameron.dev/hit/foniafonia-juegos/snake_fallo"; } catch (x) {}\n'
       '  try { if (e && e.target && e.target.tagName) return; var d = document.createElement("p"); d.setAttribute("role", "alert");\n'
       '    d.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;z-index:99;margin:0;padding:10px 12px;border-radius:12px;background:#FFF8E7;color:#10231A;font:15px/1.4 system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.4)";\n'
       '    d.textContent = "Algo ha fallado al abrir el juego en este navegador. Prueba a abrir el enlace en Chrome o Safari (no dentro de WhatsApp o Telegram).";\n'
       '    (document.body || document.documentElement).appendChild(d); } catch (x) {}\n'
       '});\n</script>')

# --- las letras, dentro del juego: nada se pide a Google ---
cambia('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n', '')
cambia('<style>', '<style>\n' + (AQUI / 'fuentes/fuentes.css').read_text(encoding='utf-8'))

# --- piezas comunes de Fönia que el juego carga desde fuera: se traen al repositorio ---
# (guardan solo en este aparato: localStorage; no envían nada a ningún sitio)
for pieza in ('estrellas-mundos.js', 'graduacion.js'):
    cambia('<script src="../%s"></script>' % pieza, '<script src="%s"></script>' % pieza)
    shutil.copyfile(ORIGEN / pieza, AQUI / pieza)

# --- fuera el gabinete ---
cambia('<script src="../pauta-familia.js"></script>\n', '')
cambia('<script src="/bichito-revision.js"></script>\n', '')
cambia("var CASO = (function () { var v = (QS.get('caso') || '').toLowerCase().trim(); return /^[0a-i]{1,24}$/.test(v) ? v : ''; })();",
       "var CASO = ''; /* versión pública: sin paciente, no se envía nada a ningún sitio */")
import re
m = re.search(r"var FC = \{ panel: '[^']*', registro: '[^']*'", s)
if not m: sys.exit('No encuentro las direcciones de envío')
s = s.replace(m.group(0), "var FC = { panel: '', registro: ''")
cambia("(function () { leeCola().forEach(", "if (false) (function () { leeCola().forEach(")

# --- móvil: la regla se cortaba («las que …»); ahora ocupa su propia línea ---
cambia('@media (max-width:640px){#regla .etq{display:none}',
       '@media (max-width:640px){#hud{flex-wrap:wrap}#regla{flex:1 0 100%;justify-content:center;margin-bottom:6px}#regla .chip{white-space:normal;text-align:center}#regla .etq{display:none}')

# --- el juego deja a mano lo que necesita extra.js ---
cambia("window.__snake = { OPC: OPC,", "window.__snake = { filas: filasPartida, hud: hud, muestraInicio: muestraInicio, OPC: OPC, cuenta: cuenta, voz: conVoz,\n"
       "  sinMundos: function () { MUNDOS = null; $('inicioMundos').innerHTML = ''; },")


# --- peticiones de la comunidad (25/10/2026): letras que conoce, sílabas directas, solo mis palabras y modo oído ---
cambia("var FIJADO = ['empieza', 'contiene', 'termina', 'silabas', 'todas', 'larga', 'trabada', 'parecida', 'espejo', 'real', 'ortografia'].indexOf(QS.get('filtro')) >= 0;",
       "var FIJADO = ['empieza', 'contiene', 'termina', 'silabas', 'todas', 'larga', 'trabada', 'parecida', 'espejo', 'real', 'ortografia', 'conocidas'].indexOf(QS.get('filtro')) >= 0;")
cambia("  velocidad: QS.get('velocidad')\n};",
       "  velocidad: QS.get('velocidad'),\n"
       "  conoce: parseConoce(QS.get('conoce')), directas: QS.get('directas') === '1', soloPropias: QS.get('solo') === '1', audio: QS.get('modo') === 'audio'\n};\n"
       "function parseConoce(txt) {\n"
       "  var ok = 'a b c ch d e f g h i j k l ll m n ñ o p q r rr s t u v w x y z'.split(' '), sal = [], vistos = {};\n"
       "  String(txt || '').toLowerCase().split(/[\\s,;.]+/).forEach(function (x) { if (ok.indexOf(x) >= 0 && !vistos[x]) { vistos[x] = 1; sal.push(x); } });\n"
       "  return sal.length ? sal : ['a', 'm', 'e', 'o', 's', 'p', 'n'];\n}")
cambia("    case 'larga': return p.n >= 3;\n", "    case 'conocidas': return todasConocidas(p.w);\n    case 'larga': return p.n >= 3;\n")
cambia("function reglaHtml() {\n  var L = OPC.letra.toUpperCase(), r = OPC.regla;\n",
       "function reglaHtml() { return reglaHtml0() + sufijoRegla(); }\n"
       "function reglaHtml0() {\n  var L = OPC.letra.toUpperCase(), r = OPC.regla;\n"
       "  if (r === 'conocidas') return 'las que se leen con <b>' + OPC.conoce.slice(0, 8).join(' ') + (OPC.conoce.length > 8 ? '…' : '') + '</b>';\n")
cambia("  if (r === 'larga') return 'tiene ' + p.n + ' sílaba' + (p.n === 1 ? '' : 's');\n",
       "  if (r === 'larga') return 'tiene ' + p.n + ' sílaba' + (p.n === 1 ? '' : 's');\n"
       "  if (r === 'conocidas') return 'lleva la «' + primeraDesconocida(p.w) + '», que aún no conoce';\n")
cambia("  if (r === 'larga') return p.n + ' sílabas';\n", "  if (r === 'larga') return p.n + ' sílabas';\n  if (r === 'conocidas') return 'solo letras que conoce';\n")
cambia("  var n = BANCO.filter(cumple).length;", "  var n = BANCO_JUEGO().filter(cumple).length;")
cambia("  var pool = BANCO.filter(function (p) { return !usados[p.w] && (cumple(p) === ok); });\n"
       "  if (!pool.length) pool = BANCO.filter(function (p) { return cumple(p) === ok && !S.tokens.some(function (t) { return t.p.w === p.w; }); });",
       "  var BJ = BANCO_JUEGO();\n"
       "  var pool = BJ.filter(function (p) { return !usados[p.w] && (cumple(p) === ok); });\n"
       "  if (!pool.length) pool = BJ.filter(function (p) { return cumple(p) === ok && !S.tokens.some(function (t) { return t.p.w === p.w; }); });")
# --- voz por el motor de audio que ya se desbloquea al tocar (móviles que bloquean los audios que arrancan solos) ---
cambia("function dicePalabra(w) {", "function dicePalabraVieja(w) {")
cambia("if (actx.state === 'suspended' && actx.resume) actx.resume(); } catch (e) { actx = null; } }",
       "if ((actx.state === 'suspended' || actx.state === 'interrupted') && actx.resume) actx.resume();\n"
       "    if (!actx.abierto) { actx.abierto = 1; var b0 = actx.createBuffer(1, 1, 22050), z0 = actx.createBufferSource(); z0.buffer = b0; z0.connect(actx.destination); z0.start(0); } } catch (e) { actx = null; } }")
cambia("function cumple(p) {\n  var l = norm(OPC.letra), k = p.k;\n", "function cumple(p) {\n  var l = norm(OPC.letra), k = p.k;\n  if (audioOn() && ['empieza', 'contiene', 'termina'].indexOf(OPC.regla) >= 0) return cumplePorSonido(p);\n")
cambia("/* ====================== mover ====================== */", (AQUI / 'ampliacion-juego.js').read_text(encoding='utf-8') + "/* ====================== mover ====================== */")
cambia("  celdas = Math.min(celdas, COLS - 2);\n", "  celdas = Math.min(celdas, COLS - 2);\n  if (audioOn()) { celdas = 2; precargaVoz(p.w); }\n")
cambia("  cx.save(); cx.translate(x0 + w / 2, y0 + h / 2 + bob); cx.scale(esc, esc);",
       "  var hab = audioOn() && oyendo === t, apag = audioOn() && oyendo && oyendo !== t;\n"
       "  if (hab) esc *= REDUCE ? 1.15 : 1.15 + 0.05 * Math.sin(hora / 110);\n"
       "  cx.save(); if (apag) cx.globalAlpha = 0.35; cx.translate(x0 + w / 2, y0 + h / 2 + bob); cx.scale(esc, esc);")
cambia("  cx.fillText(t.p.w, w / 2, h / 2 + 1);\n  cx.restore();",
       "  if (audioOn()) {\n"
       "    if (hab) {\n"
       "      cx.fillStyle = '#FFE27A'; rr(cx, pad, pad, w - 2 * pad, h - 2 * pad, h * 0.32); cx.fill();\n"
       "      cx.strokeStyle = '#10231A'; cx.lineWidth = Math.max(4, CELL * 0.11); rr(cx, pad, pad, w - 2 * pad, h - 2 * pad, h * 0.32); cx.stroke();\n"
       "      cx.fillStyle = '#10231A'; cx.font = Math.round(CELL * 0.72) + 'px Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,system-ui,sans-serif'; cx.fillText('🔊', w * 0.34, h / 2 + 1);\n"
       "      for (var o = 0; o < 3; o++) { var fase = REDUCE ? 1 : 0.35 + 0.65 * Math.max(0, Math.sin(hora / 160 - o * 0.9)); cx.globalAlpha = fase; cx.beginPath(); cx.arc(w * 0.52, h / 2, CELL * (0.16 + 0.15 * o), -0.7, 0.7); cx.lineWidth = Math.max(3, CELL * 0.08); cx.lineCap = 'round'; cx.stroke(); }\n"
       "      cx.globalAlpha = 1;\n"
       "    } else {\n"
       "      cx.globalAlpha = 0.6; cx.fillStyle = '#10231A'; cx.font = Math.round(CELL * 0.6) + 'px Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,system-ui,sans-serif'; cx.fillText('🔈', w / 2, h / 2 + 1);\n"
       "    }\n"
       "  } else cx.fillText(t.p.w, w / 2, h / 2 + 1);\n  cx.restore();")
cambia("  avanzaEfectos(dt); dibuja(alfa);", "  turnoOido(); avanzaEfectos(dt); dibuja(alfa);")
cambia("    nuevaPartida(); jugando = true; pausado = false;",
       "    if (audioOn() && !sonido) { sonido = true; $('bSonido').textContent = '🔊'; }\n    nuevaPartida(); jugando = true; pausado = false;")
cambia("  $('chipRegla').innerHTML = reglaHtml();", "  $('chipRegla').innerHTML = reglaHtml(); $('bOir').style.display = audioOn() ? '' : 'none';")
cambia('    <button class="bt" id="bSonido" type="button" aria-label="Sonido" title="Sonido">🔊</button>',
       '    <button class="bt" id="bOir" type="button" aria-label="Oír otra vez" title="Oír otra vez" style="display:none">🎧</button>\n'
       '    <button class="bt" id="bSonido" type="button" aria-label="Sonido" title="Sonido">🔊</button>')
cambia('<div><i>🔎</i>Lee las palabras del tablero</div>', '<div><i>🔎</i><span id="pasoLee">Lee las palabras del tablero</span></div>')
cambia("  $('inicioRegla').innerHTML =", "  $('pasoLee').textContent = audioOn() ? 'Escucha las fichas: cada una suena' : 'Lee las palabras del tablero';\n  $('inicioRegla').innerHTML =")
cambia("a.textContent = S && jugando ? 'Lee bien antes de comer' : '';", "a.textContent = S && jugando ? (audioOn() ? 'Escucha bien antes de comer' : 'Lee bien antes de comer') : '';")

# --- estilos de lo añadido ---
cambia('</style>', (AQUI / 'extra.css').read_text(encoding='utf-8') + '</style>')

def boton(donde, titulo, sub):
    """La tarjeta que lleva a la comunidad. Lo que promete es lo que hay: la comunidad es
    gratuita y tenía 171 miembros el 13/10/2026 (mirado en su página de Skool)."""
    return ('<a class="cta" data-skool="%s" href="%s" target="_blank" rel="noopener">'
            '<span class="cta-abeja" aria-hidden="true">🐝</span>'
            '<span class="cta-txt"><b>%s</b><span>%s</span>'
            '<span class="cta-lista"><i>🏎️ FonoKart</i><i>🏃 FonoDash</i><i>🐍 y los que van saliendo</i></span></span>'
            '<span class="cta-ir">Entrar <span aria-hidden="true">→</span></span></a>' % (donde, SKOOL, titulo, sub))
def idea(donde):
    return ('<a class="idea" data-skool="%s" href="%s" target="_blank" rel="noopener">💡 ¿Echas algo en falta o has visto un fallo? Cuéntalo en la comunidad</a>' % (donde, SKOOL))

PORTADA = """    <div class="velo" id="vPortada"><div class="tarjeta conportada">
      <img class="heroe" src="portada/portada-ancha.jpg" width="1280" height="720" alt="Una serpiente verde va hacia la palabra RANA y deja a un lado luna, mesa y pato">
      <h1>Snake de palabras <span class="version">Versión 2</span></h1>
      <p class="lema">La serpiente solo come las palabras que cumplen <b>tu regla</b>. Y al acabar te dice qué letras confunde.</p>
      <button class="btnimg" id="pJugar" type="button" aria-label="Jugar ya"><img class="normal" src="portada/boton-jugar.png" width="720" height="280" alt=""><img class="pulsado" src="portada/boton-jugar-pulsado.png" width="720" height="280" alt=""></button>
      <button class="btn s ancho" id="pPrepara" type="button">🧑‍⚕️ Preparar una partida<small>Elige el objetivo y manda el enlace a la familia</small></button>
      <button class="btn s ancho" id="pOido" type="button">🎧 Jugar escuchando<small>La serpiente busca audios, no palabras escritas</small></button>
      <ul class="trabaja"><li>Lectura de palabras</li><li>Conciencia fonológica</li><li>Letras que se confunden</li><li>Sílabas</li><li>Atención</li></ul>
      <p style="font-size:15px;margin:0 0 10px">De 5 a 12 años · móvil, tableta u ordenador · 317 palabras (241 con voz) · sin registro</p>
      """ + boton('portada', '¿Te ha gustado? Hay más juegos como este', 'En ColmenIA, la comunidad de más de 170 logopedas y maestras que usan la IA en su trabajo.') + """
      """ + idea('idea_portada') + """
      <p class="firma">Laboratorio: Gabinete Fönia · Lo entrega: ColmenIA</p>
      <p class="nota">Voz: Piper (Open Home Foundation), licencia CC BY 3.0. Material de apoyo: no sustituye a la logopeda.</p>
      <p class="nota">Las reglas de palabras parecidas, letras espejo, existe o inventada y bien escrita están en pruebas, sin revisión clínica. El informe orienta: no evalúa ni diagnostica.</p>
      <p class="nota">Sin registro. Los resultados no salen de este aparato si no los compartes tú. Solo se cuenta, de forma anónima, cuánta gente lo usa. <a href="privacidad.html">Privacidad</a></p>
    </div></div>

    <div class="velo" id="vPrepara"><div class="tarjeta prep">
      <h1>🧑‍⚕️ Prepara la partida</h1>
      <h2>1 · ¿Qué quieres trabajar?</h2>
      <div class="objs" id="prObjs"></div>
      <h2>2 · Ajusta, si quieres</h2>
      <div class="fila2">
        <div class="campo"><label for="prRegla">Regla</label><select id="prRegla"><option value="empieza">Empiezan por…</option><option value="contiene">Contienen…</option><option value="termina">Terminan en…</option><option value="silabas">Número de sílabas</option><option value="larga">Palabras largas (3+ sílabas)</option><option value="trabada">Con sílaba trabada</option><option value="conocidas">Solo con las letras que conoce</option><option value="parecida">Palabras parecidas (una sola vale)</option><option value="espejo">Letras espejo dentro de la palabra</option><option value="real">Existe o es inventada</option><option value="ortografia">Bien escrita</option><option value="todas">Todas (solo leer)</option></select></div>
        <div class="campo" id="prCLetra"><label for="prLetra">Letra o grupo</label><select id="prLetra"></select></div>
        <div class="campo" id="prCConoce" style="flex:1 1 100%"><label>Letras que ya conoce (toca las que sabe)</label><div class="letras" id="prConoce"></div></div>
        <div class="campo" id="prCSil"><label for="prSil">Sílabas</label><select id="prSil"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4 o más</option></select></div>
      </div>
      <div class="fila2">
        <div class="campo"><label for="prMeta">Palabras por tanda</label><select id="prMeta"><option>5</option><option>10</option><option>15</option><option>20</option></select></div>
        <div class="campo"><label for="prNivel">Dificultad</label><select id="prNivel"><option value="auto">Se adapta sola</option><option value="1">1 · muy tranquila</option><option value="2">2</option><option value="3">3</option><option value="4">4 · rápida</option><option value="5">5 · más rápida</option><option value="6">6 · la más rápida</option></select></div>
        <div class="campo"><label for="prVel">Ritmo</label><select id="prVel"><option value="">Normal</option><option value="lenta">Más lento</option></select></div>
      </div>
      <div class="opciones">
        <label class="op"><input type="checkbox" id="prDirectas"> <span><b>Solo sílabas directas</b> (ma, pe, si, so, mu…; sin trabadas ni sílabas cerradas)</span></label>
        <label class="op"><input type="checkbox" id="prSolo"> <span><b>Jugar solo con mis palabras</b> (las del paso 3)</span></label>
        <label class="op"><input type="checkbox" id="prAudio"> <span><b>🎧 A oído:</b> la serpiente busca audios, no palabras escritas</span></label>
        <p class="nota" id="prAudioNota" style="text-align:left;margin:2px 0 0"></p>
      </div>
      <h2>3 · Palabras de tu paciente (opcional)</h2>
      <textarea id="prPropias" placeholder="Escribe las tuyas separadas por comas: rueda, ratón, arroz…" aria-label="Palabras propias"></textarea>
      <p class="nota" style="text-align:left">Se suman a las 317 del juego y siguen la misma regla. Sin nombres de personas. Estas no tienen voz y sus sílabas se cuentan de forma aproximada.</p>
      <div class="resumen" id="prResumen"></div>
      <div style="text-align:center">
        <button class="btn" id="prJugar" type="button">▶ Jugar ahora</button>
        <button class="btn s" id="prCrear" type="button">🔗 Enlace para la familia</button>
      </div>
      <div class="enlace" id="prEnlace">
        <label for="prUrl" style="font-weight:700;display:block;margin-bottom:4px">Mándale este enlace. Abre el juego ya preparado, sin ajustes a la vista:</label>
        <input id="prUrl" type="text" readonly>
        <div class="minis"><button class="btn mini" id="prCopiar" type="button">📋 Copiar</button><button class="btn s mini" id="prCompartir" type="button">📤 Compartir</button></div>
        <p class="ok-copia" id="prCopiado" role="status"></p>
      </div>
      <div style="text-align:center"><button class="btn s mini" id="prVolver" type="button">← Volver</button></div>
    </div></div>

"""
cambia('    <div class="velo on" id="vInicio"><div class="tarjeta">', PORTADA + '    <div class="velo on" id="vInicio"><div class="tarjeta">')
cambia('      <p class="nota">Voz: Piper (Open Home Foundation), licencia CC BY 3.0. Pendiente de revisión clínica.</p>',
       '      <p class="firma">Laboratorio: Gabinete Fönia · Lo entrega: ColmenIA</p>\n'
       '      <p class="nota">Voz: Piper (Open Home Foundation), licencia CC BY 3.0. Material de apoyo: no sustituye a la logopeda.</p>\n'
       '      <p class="nota">Las reglas de palabras parecidas, letras espejo, existe o inventada y bien escrita están en pruebas, sin revisión clínica. El informe orienta: no evalúa ni diagnostica.</p>')
cambia('      <p class="nota" id="finEnvio"></p>\n      <button class="btn" id="bOtra" type="button">▶ Otra tanda</button>',
       '      <div class="informe"><h2>📋 Informe de la tanda</h2><dl id="infFilas"></dl>\n'
       '        <div class="minis"><button class="btn mini" id="infCompartir" type="button">📤 Enviar a mi logopeda</button><button class="btn s mini" id="infCopiar" type="button">📋 Copiar</button></div>\n'
       '        <p class="ok-copia" id="infDicho" role="status"></p></div>\n'
       '      <p class="nota" id="finEnvio"></p>\n      <button class="btn" id="bOtra" type="button">▶ Otra tanda</button>\n'
       '      <button class="btn s" id="finPrepara" type="button">🧑‍⚕️ Cambiar la partida</button>\n'
       '      ' + boton('final', '¡Tanda hecha! ¿Quieres más juegos así?', 'Están en ColmenIA, la comunidad de más de 170 logopedas y maestras.') + '\n'
       '      ' + idea('idea_final'))
cambia("$('finEnvio').textContent = CASO ? 'Enviando el resultado al gabinete…' : 'Resultado guardado solo en este aparato.';",
       "$('finEnvio').textContent = 'Este informe no sale de este aparato si no lo compartes tú.';")
cambia("envia(false).then(function (r) { $('finEnvio').textContent = r === 'ok' ? '✔ Resultado enviado al gabinete.' : (r === 'cola' ? 'Guardado: se enviará cuando haya conexión.' : 'Resultado guardado solo en este aparato.'); });",
       "envia(false);")

# --- la hoja «antes de irte» y la tarjeta dentro de la pausa ---
DESPEDIDA = ('<div class="despedida" id="vDespedida" role="dialog" aria-label="Antes de irte">'
             '<div class="despedida-caja"><button type="button" id="dCerrar" class="despedida-x" aria-label="Cerrar">✕</button>'
             '<p class="despedida-t">Antes de irte…</p>'
             + boton('despedida', 'Llévate más juegos como este', 'Están en ColmenIA, la comunidad de más de 170 logopedas y maestras.')
             + '</div></div>\n')
cambia('<script src="snake-voz/indice.js"></script>', DESPEDIDA + '<script src="snake-voz/indice.js"></script>')
cambia('<button class="btn s" id="bAcabar" type="button">Terminar la tanda</button></div></div>',
       '<button class="btn s" id="bAcabar" type="button">Terminar la tanda</button>'
       + boton('pausa', '¿Te vas? Llévate más juegos', 'En ColmenIA, la comunidad de logopedas y maestras.') + '</div></div>')

# --- el guion de lo añadido, dentro de la página ---
cambia('</body>', '<script>\n' + (AQUI / 'extra.js').read_text(encoding='utf-8') + '</script>\n</body>')

(AQUI / 'index.html').write_text(s, encoding='utf-8')
voz = AQUI / 'snake-voz'
if voz.exists(): shutil.rmtree(voz)
shutil.copytree(ORIGEN / 'lectoescritura/snake-voz', voz, ignore=shutil.ignore_patterns('generar.py', '__pycache__'))
print('index.html:', len(s) // 1024, 'KB ·', len(list(voz.glob('*.mp3'))), 'audios')
