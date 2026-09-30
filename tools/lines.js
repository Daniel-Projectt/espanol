/* Writes audio/lines.json: every line the app can say, with its recording name.
   Usage: node tools/lines.js   (after sh build.sh)                                  */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const src = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const box = { module: { exports: {} }, console, Date };
vm.createContext(box); vm.runInContext(src, box);
const A = box.module.exports;
const lines = A.spokenLines().map(t => ({ key: A.audioKey(t), text: t }));
const keys = new Set(lines.map(l => l.key));
if (keys.size !== lines.length) { console.error('two lines share a recording name'); process.exit(1); }
fs.writeFileSync(path.join(ROOT, 'audio', 'lines.json'), JSON.stringify(lines, null, 0).replace(/},{/g, '},\n{'));
const chars = lines.reduce((n, l) => n + l.text.length, 0);
console.log(lines.length + ' lines, ' + chars + ' characters');
