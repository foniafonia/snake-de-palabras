"""Imágenes para redes del Snake de palabras: capturas REALES del juego (14/10/2026).
Tablero y informe salen de una partida jugada en https://foniafonia.github.io/snake-de-palabras/
con la regla «empiezan por D» (capturas/tablero-d.jpg y capturas/informe-d.jpg). Aquí solo se
encuadran, se pone el título y se marca la fila de «letras que confunde». Uso: python3 redes.py"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
AV = '/System/Library/Fonts/Avenir Next.ttc'
def f(t, i): return ImageFont.truetype(AV, t, index=i)   # 0 negrita, 2 demi, 7 normal (según el .ttc)
NOCHE, CREMA, ORO, VERDE, TINTA = (14, 53, 36), (255, 248, 231), (244, 185, 58), (47, 168, 102), (16, 35, 26)

def movil(img, alto, marca=None):
    """encuadra una captura como pantalla de móvil, con marco y sombra; marca = caja a resaltar (en px de la captura)"""
    w, h = img.size; esc = alto / h; ancho = round(w * esc)
    p = img.resize((ancho, alto), Image.LANCZOS).convert('RGB')
    if marca:
        d = ImageDraw.Draw(p); x0, y0, x1, y1 = [round(v * esc) for v in marca]
        d.rounded_rectangle((x0, y0, x1, y1), radius=16, outline=ORO, width=max(4, round(9 * esc / 0.55)))
    borde = 12; r = 46
    lienzo = Image.new('RGBA', (ancho + 2 * borde, alto + 2 * borde), (0, 0, 0, 0))
    ImageDraw.Draw(lienzo).rounded_rectangle((0, 0, lienzo.width - 1, lienzo.height - 1), radius=r + borde, fill=(8, 22, 15, 255))
    m = Image.new('L', (ancho, alto), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, ancho - 1, alto - 1), radius=r, fill=255)
    lienzo.paste(p, (borde, borde), m)
    return lienzo

def pone(base, cosa, x, y):
    s = Image.new('RGBA', (cosa.width + 60, cosa.height + 60), (0, 0, 0, 0))
    s.paste((0, 0, 0, 150), (30, 38, 30 + cosa.width, 38 + cosa.height), cosa.split()[3])
    s = s.filter(ImageFilter.GaussianBlur(14)); base.alpha_composite(s, (x - 30, y - 30)); base.alpha_composite(cosa, (x, y))

def centro(d, txt, fuente, y, ancho, color):
    w = d.textlength(txt, font=fuente); d.text(((ancho - w) / 2, y), txt, font=fuente, fill=color)

def lamina(W, H, nombre, alto_movil, y_movil, titulo_t, sub_t, pie_y):
    base = Image.new('RGBA', (W, H), NOCHE + (255,))
    d = ImageDraw.Draw(base)
    for i in range(0, W, 90): d.rectangle((i, 0, i + 44, H), fill=(16, 58, 40, 255))   # franjas de césped muy suaves
    centro(d, 'SNAKE DE PALABRAS', f(30, 2), 46 if H > 1100 else 34, W, ORO)
    yt = 92 if H > 1100 else 74
    for k, linea in enumerate(titulo_t): centro(d, linea, f(titulo_t and (60 if H > 1100 else 50), 0), yt + k * (68 if H > 1100 else 56), W, CREMA)
    ys = yt + len(titulo_t) * (68 if H > 1100 else 56) + 8
    centro(d, sub_t, f(30 if H > 1100 else 27, 7), ys, W, (200, 225, 210))
    tab = movil(Image.open('capturas/tablero-d.jpg'), alto_movil)
    inf = movil(Image.open('capturas/informe-d.jpg'), alto_movil, marca=(52, 1050, 698, 1152))
    hueco = 46; total = tab.width + inf.width + hueco; x0 = (W - total) // 2
    pone(base, tab, x0, y_movil); pone(base, inf, x0 + tab.width + hueco, y_movil)
    d = ImageDraw.Draw(base)
    # etiquetas bajo cada móvil
    et = f(26 if H > 1100 else 23, 2)
    for txt, cx in (('1 · Elige la regla y juega', x0 + tab.width / 2), ('2 · El informe dice qué confunde', x0 + tab.width + hueco + inf.width / 2)):
        w = d.textlength(txt, font=et); d.text((cx - w / 2, y_movil + tab.height + 14), txt, font=et, fill=CREMA)
    # pie
    caja_y = pie_y; d.rounded_rectangle((60, caja_y, W - 60, caja_y + (92 if H > 1100 else 78)), radius=24, fill=ORO)
    centro(d, 'Pruébalo · foniafonia.github.io/snake-de-palabras', f(34 if H > 1100 else 29, 0), caja_y + (24 if H > 1100 else 20), W, TINTA)
    centro(d, 'Laboratorio: Gabinete Fönia · Lo entrega: ColmenIA', f(23 if H > 1100 else 21, 7), caja_y + (104 if H > 1100 else 88), W, (200, 225, 210))
    base.convert('RGB').save(nombre, quality=88, optimize=True, progressive=True)
    print(nombre, base.size)

lamina(1080, 1350, 'redes-vertical-1080x1350.jpg', 800, 296, ['Lectura y letras', 'que se confunden'], 'Solo come las que empiezan por D… y te dice si confunde la b o la p', 1206)
lamina(1080, 1080, 'redes-cuadrada-1080x1080.jpg', 600, 228, ['Lectura y letras que se confunden'], 'Solo come las que empiezan por D… y te dice si confunde b o p', 908)
