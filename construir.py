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
       '<title>Snake de palabras · ColmenIA</title>\n'
       '<meta name="description" content="Juego gratis de lectura: la serpiente solo come las palabras que cumplen la regla (empiezan por R, tienen dos sílabas…). Hecho en el laboratorio de Gabinete Fönia, lo entrega ColmenIA.">\n'
       '<meta property="og:title" content="Snake de palabras · juego gratis de lectura">\n'
       '<meta property="og:description" content="La serpiente solo come las palabras que cumplen la regla. Tú eliges la regla.">\n'
       '<meta property="og:image" content="https://foniafonia.github.io/snake-de-palabras/portada/portada-ancha.jpg">\n'
       '<meta property="og:type" content="website">\n<meta name="twitter:card" content="summary_large_image">')
cambia('<link rel="icon" href="../equipo/icono-192.png">',
       '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🐍%3C/text%3E%3C/svg%3E">')

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
cambia("window.__snake = { OPC: OPC,", "window.__snake = { filas: filasPartida, hud: hud, muestraInicio: muestraInicio, OPC: OPC,")

# --- estilos de lo añadido ---
cambia('</style>', (AQUI / 'extra.css').read_text(encoding='utf-8') + '</style>')

def boton(donde, titulo, sub):
    """La tarjeta que lleva a la comunidad. Lo que promete es lo que hay: la comunidad es
    gratuita y tenía 171 miembros el 13/10/2026 (mirado en su página de Skool)."""
    return ('<a class="cta" data-skool="%s" href="%s" target="_blank" rel="noopener">'
            '<span class="cta-abeja" aria-hidden="true">🐝</span>'
            '<span class="cta-txt"><b>%s</b><span>%s</span>'
            '<span class="cta-lista"><i>🏎️ FonoKart</i><i>🏃 FonoDash</i><i>🐍 y los que van saliendo</i></span></span>'
            '<span class="cta-ir">Entrar gratis <span aria-hidden="true">→</span></span></a>' % (donde, SKOOL, titulo, sub))
def idea(donde):
    return ('<a class="idea" data-skool="%s" href="%s" target="_blank" rel="noopener">💡 ¿Echas algo en falta o has visto un fallo? Cuéntalo en la comunidad</a>' % (donde, SKOOL))

PORTADA = """    <div class="velo" id="vPortada"><div class="tarjeta conportada">
      <img class="heroe" src="portada/portada-ancha.jpg" width="1280" height="720" alt="Una serpiente verde va hacia la palabra RANA y deja a un lado luna, mesa y pato">
      <h1>Snake de palabras</h1>
      <p class="lema">La serpiente solo come las palabras que cumplen <b>tu regla</b>. Y al acabar te dice qué letras confunde.</p>
      <button class="btnimg" id="pJugar" type="button" aria-label="Jugar ya"><img class="normal" src="portada/boton-jugar.png" width="720" height="280" alt=""><img class="pulsado" src="portada/boton-jugar-pulsado.png" width="720" height="280" alt=""></button>
      <button class="btn s ancho" id="pPrepara" type="button">🧑‍⚕️ Preparar una partida<small>Elige el objetivo y manda el enlace a la familia</small></button>
      <ul class="trabaja"><li>Lectura de palabras</li><li>Conciencia fonológica</li><li>Letras que se confunden</li><li>Sílabas</li><li>Atención</li></ul>
      <p style="font-size:15px;margin:0 0 10px">De 5 a 12 años · móvil, tableta u ordenador · 241 palabras con voz · sin registro</p>
      """ + boton('portada', '¿Te ha gustado? Hay más juegos como este', 'En ColmenIA, la comunidad de más de 170 logopedas y maestras que usan la IA en su trabajo.') + """
      """ + idea('idea_portada') + """
      <p class="firma">Laboratorio: Gabinete Fönia · Lo entrega: ColmenIA</p>
      <p class="nota">Voz: Piper (Open Home Foundation), licencia CC BY 3.0. Material de apoyo: no sustituye a la logopeda. No guarda ni envía datos.</p>
    </div></div>

    <div class="velo" id="vPrepara"><div class="tarjeta prep">
      <h1>🧑‍⚕️ Prepara la partida</h1>
      <h2>1 · ¿Qué quieres trabajar?</h2>
      <div class="objs" id="prObjs"></div>
      <h2>2 · Ajusta, si quieres</h2>
      <div class="fila2">
        <div class="campo"><label for="prRegla">Regla</label><select id="prRegla"><option value="empieza">Empiezan por…</option><option value="contiene">Contienen…</option><option value="termina">Terminan en…</option><option value="silabas">Número de sílabas</option><option value="todas">Todas (solo leer)</option></select></div>
        <div class="campo" id="prCLetra"><label for="prLetra">Letra o grupo</label><select id="prLetra"></select></div>
        <div class="campo" id="prCSil"><label for="prSil">Sílabas</label><select id="prSil"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4 o más</option></select></div>
      </div>
      <div class="fila2">
        <div class="campo"><label for="prMeta">Palabras por tanda</label><select id="prMeta"><option>5</option><option>10</option><option>15</option><option>20</option></select></div>
        <div class="campo"><label for="prNivel">Dificultad</label><select id="prNivel"><option value="auto">Se adapta sola</option><option value="1">1 · muy tranquila</option><option value="2">2</option><option value="3">3</option><option value="4">4 · rápida</option></select></div>
        <div class="campo"><label for="prVel">Ritmo</label><select id="prVel"><option value="">Normal</option><option value="lenta">Más lento</option></select></div>
      </div>
      <h2>3 · Palabras de tu paciente (opcional)</h2>
      <textarea id="prPropias" placeholder="Escribe las tuyas separadas por comas: rueda, ratón, arroz…" aria-label="Palabras propias"></textarea>
      <p class="nota" style="text-align:left">Se suman a las 241 del juego y siguen la misma regla. Sin nombres de personas. Estas no tienen voz y sus sílabas se cuentan de forma aproximada.</p>
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
       '      <p class="nota">Voz: Piper (Open Home Foundation), licencia CC BY 3.0. Material de apoyo: no sustituye a la logopeda.</p>')
cambia('      <p class="nota" id="finEnvio"></p>\n      <button class="btn" id="bOtra" type="button">▶ Otra tanda</button>',
       '      <div class="informe"><h2>📋 Informe de la tanda</h2><dl id="infFilas"></dl>\n'
       '        <div class="minis"><button class="btn mini" id="infCompartir" type="button">📤 Enviar a mi logopeda</button><button class="btn s mini" id="infCopiar" type="button">📋 Copiar</button></div>\n'
       '        <p class="ok-copia" id="infDicho" role="status"></p></div>\n'
       '      <p class="nota" id="finEnvio"></p>\n      <button class="btn" id="bOtra" type="button">▶ Otra tanda</button>\n'
       '      <button class="btn s" id="finPrepara" type="button">🧑‍⚕️ Cambiar la partida</button>\n'
       '      ' + boton('final', '¡Tanda hecha! ¿Quieres más juegos así?', 'Están en ColmenIA, la comunidad de más de 170 logopedas y maestras.') + '\n'
       '      ' + idea('idea_final'))
cambia("$('finEnvio').textContent = CASO ? 'Enviando el resultado al gabinete…' : 'Resultado guardado solo en este aparato.';",
       "$('finEnvio').textContent = 'Nada sale de este aparato si no lo compartes tú.';")
cambia("envia(false).then(function (r) { $('finEnvio').textContent = r === 'ok' ? '✔ Resultado enviado al gabinete.' : (r === 'cola' ? 'Guardado: se enviará cuando haya conexión.' : 'Resultado guardado solo en este aparato.'); });",
       "envia(false);")

# --- la hoja «antes de irte» y la tarjeta dentro de la pausa ---
DESPEDIDA = ('<div class="despedida" id="vDespedida" role="dialog" aria-label="Antes de irte">'
             '<div class="despedida-caja"><button type="button" id="dCerrar" class="despedida-x" aria-label="Cerrar">✕</button>'
             '<p class="despedida-t">Antes de irte…</p>'
             + boton('despedida', 'Llévate más juegos como este', 'Están en ColmenIA, la comunidad de más de 170 logopedas y maestras. Es gratis.')
             + '</div></div>\n')
cambia('<script src="snake-voz/indice.js"></script>', DESPEDIDA + '<script src="snake-voz/indice.js"></script>')
cambia('<button class="btn s" id="bAcabar" type="button">Terminar la tanda</button></div></div>',
       '<button class="btn s" id="bAcabar" type="button">Terminar la tanda</button>'
       + boton('pausa', '¿Te vas? Llévate más juegos', 'En ColmenIA, la comunidad de logopedas y maestras. Es gratis.') + '</div></div>')

# --- el guion de lo añadido, dentro de la página ---
cambia('</body>', '<script>\n' + (AQUI / 'extra.js').read_text(encoding='utf-8') + '</script>\n</body>')

(AQUI / 'index.html').write_text(s, encoding='utf-8')
voz = AQUI / 'snake-voz'
if voz.exists(): shutil.rmtree(voz)
shutil.copytree(ORIGEN / 'lectoescritura/snake-voz', voz, ignore=shutil.ignore_patterns('generar.py', '__pycache__'))
print('index.html:', len(s) // 1024, 'KB ·', len(list(voz.glob('*.mp3'))), 'audios')
