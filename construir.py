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
CONTADOR = 'https://abacus.jasoncameron.dev/hit/foniafonia-juegos/'

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
       '<meta property="og:description" content="La serpiente solo come las palabras que cumplen la regla. Tú eliges la regla.">')
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

# --- firma y comunidad ---
ESTILO = ('.cta{display:block;margin:14px auto 0;padding:13px 16px;border-radius:16px;background:#1d2b22;color:#fff8e7!important;'
          'font-family:var(--titulo);font-weight:600;font-size:18px;line-height:1.25;text-decoration:none;text-align:center;max-width:420px}'
          '.cta small{display:block;font-family:inherit;font-weight:400;font-size:14px;opacity:.85;margin-top:2px}'
          '.firma{font-size:13px!important;color:#4d6457;margin-top:10px!important}\n</style>')
cambia('</style>', ESTILO)
BOTON = ('<a class="cta" data-skool="%s" href="' + SKOOL + '" target="_blank" rel="noopener">%s<small>%s</small></a>')
cambia('      <p class="nota">Voz: Piper (Open Home Foundation), licencia CC BY 3.0. Pendiente de revisión clínica.</p>',
       '      ' + BOTON % ('portada', '🐝 Más juegos como este', 'Gratis, en la comunidad de logopedas de ColmenIA') + '\n'
       '      <p class="firma">Laboratorio: Gabinete Fönia · Lo entrega: ColmenIA. Para cambiar la regla, toca ⚙️.</p>\n'
       '      <p class="nota">Voz: Piper (Open Home Foundation), licencia CC BY 3.0. Material de apoyo: no sustituye a la logopeda.</p>')
cambia('      <p class="nota" id="finEnvio"></p>\n      <button class="btn" id="bOtra" type="button">▶ Otra tanda</button>',
       '      <p class="nota" id="finEnvio"></p>\n      <button class="btn" id="bOtra" type="button">▶ Otra tanda</button>\n'
       '      ' + BOTON % ('final', '🐝 ¿Quieres más juegos como este?', 'Están en la comunidad de logopedas de ColmenIA'))
cambia("$('finEnvio').textContent = CASO ? 'Enviando el resultado al gabinete…' : 'Resultado guardado solo en este aparato.';",
       "$('finEnvio').textContent = 'Nada sale de este aparato: aquí no se guarda ni se envía ningún dato.';")
cambia("envia(false).then(function (r) { $('finEnvio').textContent = r === 'ok' ? '✔ Resultado enviado al gabinete.' : (r === 'cola' ? 'Guardado: se enviará cuando haya conexión.' : 'Resultado guardado solo en este aparato.'); });",
       "envia(false);")

# --- contador anónimo: aperturas y toques al botón de la comunidad (sin cuentas ni cookies) ---
cambia('</body>',
       '<script>\n(function () {\n  function suma(k) { try { if (window.fetch) fetch(' + repr(CONTADOR) + " + k, { keepalive: true }).catch(function () {}); } catch (e) {} }\n"
       "  suma('snake_aperturas');\n"
       "  var b = document.querySelectorAll('a[data-skool]');\n"
       "  for (var i = 0; i < b.length; i++) b[i].addEventListener('click', (function (d) { return function () { suma('snake_skool_' + d); }; })(b[i].getAttribute('data-skool')));\n"
       '})();\n</script>\n</body>')

(AQUI / 'index.html').write_text(s, encoding='utf-8')
voz = AQUI / 'snake-voz'
if voz.exists(): shutil.rmtree(voz)
shutil.copytree(ORIGEN / 'lectoescritura/snake-voz', voz, ignore=shutil.ignore_patterns('generar.py', '__pycache__'))
print('index.html:', len(s) // 1024, 'KB ·', len(list(voz.glob('*.mp3'))), 'audios')
