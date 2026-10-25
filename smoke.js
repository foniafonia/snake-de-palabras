const { ctx } = require('./prueba.js');
const d = ctx.document, E = (i) => d.getElementById(i), G = ctx.__snake;
['prDirectas', 'prSolo', 'prAudio'].forEach(i => { E(i).checked = false; });
const log = [];
try {
  E('pOido').onclick();                       // portada: jugar escuchando
  log.push('prAudio.checked=' + E('prAudio').checked + ' regla=' + E('prRegla').value + ' resumen=' + E('prResumen').textContent);
  E('prCrear').onclick();
  log.push('enlace oído: ' + E('prUrl').value);
  E('prJugar').onclick();
  log.push('tras Jugar: regla=' + G.OPC.regla + ' audio=' + G.OPC.audio + ' mundos=' + (typeof G.sinMundos));
  // conocidas
  E('pPrepara').onclick();
  E('prRegla').value = 'conocidas'; E('prRegla').onchange();
  log.push('conocidas resumen=' + E('prResumen').textContent);
  E('prCrear').onclick(); log.push('enlace conocidas: ' + E('prUrl').value);
  // directas + solo propias
  E('prRegla').value = 'empieza'; E('prLetra').value = 'm'; E('prDirectas').checked = true; E('prRegla').onchange();
  log.push('directas resumen=' + E('prResumen').textContent);
  E('prCrear').onclick(); log.push('enlace directas: ' + E('prUrl').value);
  // generada con audio marcado
  E('prAudio').checked = true; E('prRegla').value = 'espejo'; E('prRegla').onchange();
  log.push('espejo resumen=' + E('prResumen').textContent + ' | nota=' + E('prAudioNota').textContent);
  E('prCrear').onclick(); log.push('enlace espejo: ' + E('prUrl').value);
} catch (e) { log.push('ERROR ' + e.stack.split('\n').slice(0, 3).join(' / ')); process.exitCode = 1; }
console.log(log.join('\n'));
