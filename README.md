# Snake de palabras · Versión 2

Juego de lectura. La serpiente solo debe comer las palabras que cumplen la regla
(empiezan por R, contienen una letra, terminan en…, tienen dos sílabas). Si come una que no la
cumple, el juego dice por qué y se sigue jugando: no hay vidas ni muertes.

**Jugar:** https://foniafonia.github.io/snake-de-palabras/

- La regla se cambia con el botón ⚙️ o desde el enlace:
  `?filtro=empieza|contiene|termina|silabas|larga|trabada|conocidas|parecida|espejo|real|ortografia|todas&letra=r&silabas=2&meta=10&nivel=1..6`
- Pedido por la comunidad (25/10/2026): `&conoce=a,m,e,o,s,p,n` (con `filtro=conocidas`: solo palabras que se leen con esas letras),
  `&directas=1` (solo sílabas directas: ma, pe, si…), `&solo=1` (solo las palabras de `&extra=`) y
  `&modo=audio` (la serpiente busca audios en vez de palabras escritas; solo con las 241 palabras con voz).
  Ajustes del modo a oído (pedido por una logopeda, 28/10/2026): pausa entre audios (normal, larga, muy larga) y volumen de la voz (normal, alto, más alto); se eligen en el panel al marcar «A oído» y se guardan solo en el aparato.
- Funciona en móvil, tableta y ordenador. Sin registro; los resultados no salen del aparato.
- Privacidad, en claro: `privacidad.html`. Cuánta gente lo usa: `estadisticas.html`.
- Es material de apoyo: no sustituye a la logopeda.

**Laboratorio:** Gabinete Fönia · **Lo entrega:** ColmenIA ·
[Comunidad de logopedas](https://www.skool.com/logopedia-7339/about)

## Créditos

- Idea y diseño: José Aserraf. Código, dibujos y banco de 317 palabras (241 con voz): propios.
- Voz: Piper (Open Home Foundation), modelo `es_ES-sharvard-medium`, licencia CC BY 3.0.
- Letras: Atkinson Hyperlegible (Braille Institute) y Jost (Owen Earl), SIL Open Font License 1.1, guardadas en `fuentes/`.
- Ilustración de portada y botón: generados con Codex por encargo.
- Solo cuenta, de forma anónima, cuántas veces se abre el juego y cuántas se pulsa el botón de
  la comunidad (sin cuentas ni cookies).

`index.html` se genera con `construir.py` a partir del material de Fönia; no se edita a mano.
