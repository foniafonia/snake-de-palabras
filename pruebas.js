/* Pruebas del Snake sin navegador. Cada caso arranca el juego con una URL distinta. */
const { spawnSync } = require('child_process');
if (process.argv[2] === '--caso') {
  const { ctx, sonidos } = require('./prueba.js');
  const G = ctx.__snake, fallos = [];
  const ok = (c, m) => { if (!c) fallos.push(m); };
  const caso = process.argv[3];
  const pal = (t) => t.p.w;
  const fichas = (S) => S.tokens.map(t => pal(t) + (t.ok ? '✔' : '✘')).join(' ');
  const fin = () => { if (fallos.length) { console.log('  FALLOS:', fallos.join(' | ')); process.exit(1); } console.log('  ok'); process.exit(0); };
  if (caso === 'funciones') {
    const si = ['casa', 'mesa', 'pelota', 'leche', 'queso', 'taxi', 'guitarra', 'perro', 'mono', 'sopa', 'bota', 'araña'];
    const no = ['pan', 'sol', 'hielo', 'plato', 'tren', 'agua', 'tigre', 'reloj', 'huevo', 'flor'];
    si.forEach(w => ok(G._directa(w), 'debería ser directa: ' + w));
    no.forEach(w => ok(!G._directa(w), 'NO debería ser directa: ' + w));
    const dir = G.BANCO.filter(p => G._directa(p.w)).map(p => p.w);
    console.log('  directas en el banco:', dir.length, '·', dir.slice(0, 30).join(' '));
    ok(dir.length > 30, 'muy pocas directas');
    return fin();
  }
  if (caso === 'conocidas') {
    const buenas = G.BANCO.filter(p => G._cumple(p)).map(p => p.w);
    console.log('  conocen:', G.OPC.conoce.join(' '), '→', buenas.length, 'palabras:', buenas.join(' '));
    ok(buenas.length >= 4, 'muy pocas palabras');
    G._nuevaPartida(); G._rellena();
    const S = G._S();
    ok(S.tokens.length >= 2, 'no hay fichas');
    S.tokens.forEach(t => { const sin = !G._conocidas(t.p.w); ok(t.ok ? !sin : sin, 'ficha mal clasificada: ' + t.p.w); });
    console.log('  fichas:', fichas(S), '· chip:', G._reglaHtml().replace(/<[^>]+>/g, ''));
    return fin();
  }
  if (caso === 'directas') {
    G._nuevaPartida(); G._rellena();
    const S = G._S();
    S.tokens.forEach(t => { ok(G._directa(t.p.w), 'ficha no directa: ' + t.p.w); ok(t.ok === (t.p.k.charAt(0) === 'm'), 'regla mal: ' + t.p.w); });
    console.log('  fichas:', fichas(S), '· chip:', G._reglaHtml().replace(/<[^>]+>/g, ''));
    return fin();
  }
  if (caso === 'solo') {
    G._nuevaPartida(); G._rellena();
    const S = G._S(), mias = ['rueda', 'raton', 'arroz', 'pelo', 'mono', 'sopa'];
    S.tokens.forEach(t => ok(mias.indexOf(t.p.w) >= 0, 'ficha que no es mía: ' + t.p.w));
    console.log('  fichas:', S.tokens.map(pal).join(' '), '· banco de juego:', G._juego().length, '· chip:', G._reglaHtml().replace(/<[^>]+>/g, ''));
    return fin();
  }
  if (caso === 'oido') {
    ok(G._audioOn(), 'audio no activo');
    G._nuevaPartida(); G._rellena();
    const S = G._S();
    S.tokens.forEach(t => { ok(!!ctx.VOZ_SNAKE[t.p.w], 'ficha sin voz: ' + t.p.w); ok(t.cells.length === 2, 'ficha no mide 2: ' + t.p.w); });
    console.log('  fichas:', fichas(S), '· chip:', G._reglaHtml().replace(/<[^>]+>/g, ''));
    G._setJugando(true);
    G._turno();
    ok(sonidos.length === 1, 'no ha sonado nada al arrancar (' + sonidos.length + ')');
    const a = Date.now();
    const sigue = () => {
      G._turno();
      if (sonidos.length >= 2 || Date.now() - a > 4500) {
        ok(sonidos.length >= 2, 'el carrusel no pasó a otra ficha');
        console.log('  sonidos:', sonidos.length, '· distintos:', new Set(sonidos).size);
        return fin();
      }
      setTimeout(sigue, 200);
    };
    return setTimeout(sigue, 200);
  }
  if (caso === 'generadas') {
    G._nuevaPartida(); G._rellena();
    const S = G._S();
    ok(S.tokens.length >= 1, 'sin fichas en ' + G.OPC.regla);
    ok(!G._audioOn(), 'el modo oído no debería valer aquí');
    console.log('  ' + G.OPC.regla + ':', fichas(S));
    return fin();
  }
  if (caso === 'normal' || caso === 'mundos') {
    G._nuevaPartida(); G._rellena();
    const S = G._S();
    ok(S.tokens.length >= 2, 'sin fichas');
    ok(!G._audioOn(), 'audio activo sin pedirlo');
    console.log('  regla:', G.OPC.regla, '· fichas:', fichas(S));
    return fin();
  }
  console.log('caso desconocido'); process.exit(2);
} else {
  const casos = [
    ['funciones', ''],
    ['conocidas', 'filtro=conocidas&conoce=a,m,e,o,s,p,n'],
    ['conocidas', 'filtro=conocidas'],
    ['conocidas', 'filtro=conocidas&conoce=a,e,i,o,u,m,s,t,l,p'],
    ['directas', 'filtro=empieza&letra=m&directas=1'],
    ['solo', 'filtro=todas&extra=rueda,raton,arroz,pelo,mono,sopa&solo=1'],
    ['oido', 'filtro=empieza&letra=b&modo=audio'],
    ['oido', 'filtro=silabas&silabas=2&modo=audio&directas=1'],
    ['generadas', 'filtro=parecida'], ['generadas', 'filtro=espejo'], ['generadas', 'filtro=real'], ['generadas', 'filtro=ortografia'],
    ['generadas', 'filtro=parecida&modo=audio'],
    ['normal', 'filtro=empieza&letra=r'], ['normal', 'filtro=larga'], ['normal', 'filtro=trabada'], ['normal', 'filtro=silabas&silabas=3'],
    ['mundos', '']
  ];
  let malos = 0;
  casos.forEach(([c, q]) => {
    console.log('▶', c, q || '(sin parámetros)');
    const r = spawnSync('node', [__filename, '--caso', c], { env: Object.assign({}, process.env, { QS_PRUEBA: q }), encoding: 'utf8' });
    process.stdout.write(r.stdout + (r.stderr || ''));
    if (r.status !== 0) malos++;
  });
  console.log(malos ? '\n' + malos + ' caso(s) con fallos' : '\nTodo en orden');
  process.exit(malos ? 1 : 0);
}
