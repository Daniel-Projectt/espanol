const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let fails = 0, checks = 0;
function ok(cond, label, detail) { checks++; if (!cond) { fails++; console.log('  FAIL  ' + label + (detail !== undefined ? '  -> ' + detail : '')); } }
function head(t) { console.log('\n== ' + t + ' =='); }

const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('NO SCRIPT'); process.exit(1); }
const src = m[1];
try { new vm.Script(src); } catch (e) { console.log('JS PARSE ERROR: ' + e.message); process.exit(1); }
const sandbox = { module: { exports: {} }, console, Date };
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const A = sandbox.module.exports;
console.log('script parsed and loaded, exports: ' + Object.keys(A).length);
const V = inf => A.verbByInf(inf);
const C = (inf, t) => A.conjugate(V(inf), t);
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const reset = () => { for (const k of Object.keys(A.memory)) delete A.memory[k]; };

// ---------- words ----------
head('words');
ok(A.WORDS.length === 270 && A.WORD_SETS.length * 10 === A.WORDS.length, '270 words in 27 days of ten', A.WORDS.length + ' / ' + A.WORD_SETS.length);
A.WORDS.forEach((w, i) => {
  ok(w.length === 4 && w.every(x => typeof x === 'string' && x.trim()), 'word ' + i + ' has four parts', JSON.stringify(w));
  ok(/[.!?…]$/.test(w[2]) && /[.!?…”]$/.test(w[3]), 'word ' + i + ' example is a full sentence', w[2] + ' | ' + w[3]);
});
const heads = A.WORDS.map(w => A.fold(w[0]));
const exact = A.WORDS.map(w => w[0].toLowerCase());
ok(new Set(exact).size === exact.length, 'no word taught twice (sí/si and qué/que are different words)', exact.filter((h, i) => exact.indexOf(h) !== i).join(', '));
A.WORDS.forEach((w, i) => {
  const mm = w[0].match(/^(el|la|los|las) (.+)$/);
  if (mm && !/\//.test(w[0])) ok(A.fold(w[2]).includes(A.fold(mm[2]).slice(0, Math.max(3, mm[2].length - 1))), 'noun “' + w[0] + '” appears in its own example', w[2]);
});
['que', 'por', 'su', 'hay', 'este', 'otro', 'también', 'hasta', 'ser', 'estar', 'ir', 'tener'].forEach(x =>
  ok(heads.includes(A.fold(x)), 'top-frequency word “' + x + '” is taught'));
ok(heads.indexOf('que') < 60 && heads.indexOf('hay') < 60, 'the most frequent words come in the first six days');

// ---------- verbs: the reference forms (Essential Grammar ch. 10 tables) ----------
head('conjugations against the grammar tables');
const REF = {
  'ser pres': 'soy eres es somos son', 'ser pret': 'fui fuiste fue fuimos fueron', 'ser impf': 'era eras era éramos eran', 'ser subj': 'sea seas sea seamos sean',
  'estar pres': 'estoy estás está estamos están', 'estar pret': 'estuve estuviste estuvo estuvimos estuvieron', 'estar subj': 'esté estés esté estemos estén',
  'ir pres': 'voy vas va vamos van', 'ir pret': 'fui fuiste fue fuimos fueron', 'ir impf': 'iba ibas iba íbamos iban', 'ir fut': 'iré irás irá iremos irán', 'ir subj': 'vaya vayas vaya vayamos vayan', 'ir cond': 'iría irías iría iríamos irían',
  'tener pres': 'tengo tienes tiene tenemos tienen', 'tener pret': 'tuve tuviste tuvo tuvimos tuvieron', 'tener fut': 'tendré tendrás tendrá tendremos tendrán', 'tener subj': 'tenga tengas tenga tengamos tengan',
  'hacer pres': 'hago haces hace hacemos hacen', 'hacer pret': 'hice hiciste hizo hicimos hicieron', 'hacer fut': 'haré harás hará haremos harán',
  'poder pres': 'puedo puedes puede podemos pueden', 'poder pret': 'pude pudiste pudo pudimos pudieron', 'poder cond': 'podría podrías podría podríamos podrían', 'poder subj': 'pueda puedas pueda podamos puedan',
  'querer pres': 'quiero quieres quiere queremos quieren', 'querer pret': 'quise quisiste quiso quisimos quisieron', 'querer fut': 'querré querrás querrá querremos querrán',
  'decir pres': 'digo dices dice decimos dicen', 'decir pret': 'dije dijiste dijo dijimos dijeron', 'decir fut': 'diré dirás dirá diremos dirán',
  'venir pres': 'vengo vienes viene venimos vienen', 'venir pret': 'vine viniste vino vinimos vinieron',
  'saber pres': 'sé sabes sabe sabemos saben', 'saber pret': 'supe supiste supo supimos supieron', 'saber subj': 'sepa sepas sepa sepamos sepan',
  'dar pres': 'doy das da damos dan', 'dar pret': 'di diste dio dimos dieron', 'dar subj': 'dé des dé demos den',
  'ver pres': 'veo ves ve vemos ven', 'ver pret': 'vi viste vio vimos vieron', 'ver impf': 'veía veías veía veíamos veían',
  'poner pret': 'puse pusiste puso pusimos pusieron', 'salir fut': 'saldré saldrás saldrá saldremos saldrán', 'traer pret': 'traje trajiste trajo trajimos trajeron',
  'oír pres': 'oigo oyes oye oímos oyen', 'oír pret': 'oí oíste oyó oímos oyeron', 'oír fut': 'oiré oirás oirá oiremos oirán',
  'conocer pres': 'conozco conoces conoce conocemos conocen', 'conocer subj': 'conozca conozcas conozca conozcamos conozcan',
  'pensar pres': 'pienso piensas piensa pensamos piensan', 'pensar subj': 'piense pienses piense pensemos piensen',
  'volver pres': 'vuelvo vuelves vuelve volvemos vuelven', 'volver subj': 'vuelva vuelvas vuelva volvamos vuelvan',
  'dormir pret': 'dormí dormiste durmió dormimos durmieron', 'dormir subj': 'duerma duermas duerma durmamos duerman',
  'pedir pres': 'pido pides pide pedimos piden', 'pedir pret': 'pedí pediste pidió pedimos pidieron', 'pedir subj': 'pida pidas pida pidamos pidan',
  'sentir pret': 'sentí sentiste sintió sentimos sintieron', 'seguir pres': 'sigo sigues sigue seguimos siguen',
  'jugar pres': 'juego juegas juega jugamos juegan', 'jugar pret': 'jugué jugaste jugó jugamos jugaron', 'jugar subj': 'juegue juegues juegue juguemos jueguen',
  'empezar pret': 'empecé empezaste empezó empezamos empezaron', 'empezar subj': 'empiece empieces empiece empecemos empiecen',
  'buscar pret': 'busqué buscaste buscó buscamos buscaron', 'llegar subj': 'llegue llegues llegue lleguemos lleguen',
  'leer pret': 'leí leíste leyó leímos leyeron', 'creer pret': 'creí creíste creyó creímos creyeron',
  'hablar pres': 'hablo hablas habla hablamos hablan', 'hablar pret': 'hablé hablaste habló hablamos hablaron', 'hablar impf': 'hablaba hablabas hablaba hablábamos hablaban', 'hablar subj': 'hable hables hable hablemos hablen',
  'comer pres': 'como comes come comemos comen', 'comer pret': 'comí comiste comió comimos comieron', 'comer impf': 'comía comías comía comíamos comían',
  'vivir pres': 'vivo vives vive vivimos viven', 'vivir pret': 'viví viviste vivió vivimos vivieron', 'vivir fut': 'viviré vivirás vivirá viviremos vivirán',
  'haber pres': 'he has ha hemos han', 'haber impf': 'había habías había habíamos habían',
  'levantarse pres': 'me levanto te levantas se levanta nos levantamos se levantan'.replace(/(\w+) (\w+)/g, '$1_$2'),
  'hablar perf': 'he_hablado has_hablado ha_hablado hemos_hablado han_hablado', 'hacer perf': 'he_hecho has_hecho ha_hecho hemos_hecho han_hecho',
  'dormir prog': 'estoy_durmiendo estás_durmiendo está_durmiendo estamos_durmiendo están_durmiendo', 'ir prog': 'estoy_yendo estás_yendo está_yendo estamos_yendo están_yendo',
  'decir prog': 'estoy_diciendo estás_diciendo está_diciendo estamos_diciendo están_diciendo', 'leer prog': 'estoy_leyendo estás_leyendo está_leyendo estamos_leyendo están_leyendo'
};
Object.keys(REF).forEach(k => {
  const [inf, t] = k.split(' '), want = REF[k].split(' ').map(x => x.replace(/_/g, ' ')), got = C(inf, t);
  ok(JSON.stringify(got) === JSON.stringify(want), k, (got || []).join(', '));
});
const CMD = {decir:'di', hacer:'haz', ir:'ve', poner:'pon', salir:'sal', ser:'sé', tener:'ten', venir:'ven', hablar:'habla', comer:'come', pensar:'piensa', volver:'vuelve', dormir:'duerme', pedir:'pide', seguir:'sigue', jugar:'juega', oír:'oye', estar:'está', levantarse:'levántate'};
Object.keys(CMD).forEach(inf => ok(C(inf, 'cmd') === CMD[inf], 'tú command of ' + inf, C(inf, 'cmd')));
ok(C('poder', 'cmd') === null && C('haber', 'cmd') === null, 'no everyday command for poder or haber');
const PART = {hacer:'hecho', decir:'dicho', ver:'visto', poner:'puesto', volver:'vuelto', escribir:'escrito', abrir:'abierto', ir:'ido', ser:'sido', leer:'leído', oír:'oído', traer:'traído', comer:'comido', hablar:'hablado'};
Object.keys(PART).forEach(inf => ok(C(inf, 'perf')[0] === 'he ' + PART[inf], 'participle of ' + inf, C(inf, 'perf')[0]));

head('every verb in every tense');
A.VERBS.forEach(v => A.TENSES.forEach(t => {
  const f = A.conjugate(v, t.k);
  if (t.k === 'cmd') { ok(f === null || (typeof f === 'string' && f.length > 1), v.inf + ' command is a word or none', f); return; }
  ok(Array.isArray(f) && f.length === 5 && f.every(x => typeof x === 'string' && x.length > 1 && !/undefined|null/.test(x)), v.inf + ' ' + t.k + ' has five forms', f && f.join(','));
  ok(f.every(x => /^[a-záéíóúüñ ]+$/.test(x)), v.inf + ' ' + t.k + ' uses only Spanish letters', f.join(','));
}));
ok(A.VERBS.length >= 40, 'at least 40 verbs', A.VERBS.length);
ok(A.VERBS.slice(0, 5).map(v => v.inf).join() === 'ser,estar,ir,tener,hacer', 'the big five irregulars come first');
ok(A.VERB_GROUPS.every(g => A.VERBS.some(v => v.group === g.k)), 'every family has verbs');
ok(A.VERBS.every(v => v.why && v.why.length > 20 && v.e.length === 5), 'every verb says why it is (ir)regular and has its English');

head('the irregular markers');
ok(A.irregularMask(V('ir'), 'pres').every(Boolean), 'every present form of ir is marked');
ok(A.TENSES.every(t => !A.isIrregularIn(V('hablar'), t.k)), 'hablar is regular everywhere');
ok(A.TENSES.every(t => !A.isIrregularIn(V('comer'), t.k) && !A.isIrregularIn(V('vivir'), t.k)), 'comer and vivir are regular everywhere');
ok(JSON.stringify(A.irregularMask(V('pensar'), 'pres')) === '[true,true,true,false,true]', 'the boot: pensamos is the only regular present form of pensar');
ok(A.isIrregularIn(V('ser'), 'impf') && A.isIrregularIn(V('ir'), 'impf') && A.isIrregularIn(V('ver'), 'impf') && !A.isIrregularIn(V('tener'), 'impf'), 'only ser, ir and ver are irregular in the imperfect');
ok(A.isIrregularIn(V('tener'), 'fut') && !A.isIrregularIn(V('ir'), 'fut'), 'future: tener irregular, ir regular');
ok(!A.isIrregularIn(V('conocer'), 'pret') && A.irregularMask(V('conocer'), 'pres')[0] && !A.irregularMask(V('conocer'), 'pres')[1], 'conocer: only yo is odd');

head('English for the drills');
const EN = [['conocer','pret',0,'I met'],['saber','pret',0,'I found out'],['conocer','impf',0,'I used to know'],['ir','pret',3,'we went'],['ir','pres',2,'he / she goes'],['ser','pres',0,'I am'],['estar','pret',1,'you were'],['tener','fut',4,'they will have'],
  ['poder','pres',0,'I can'],['hacer','perf',2,'he / she has done'],['comer','prog',0,'I am eating'],['ir','subj',1,'…that you go'],['venir','cmd',1,'Come!'],['volver','pret',0,'I came back'],['hablar','impf',3,'we used to speak']];
EN.forEach(([inf, t, p, want]) => ok(A.englishFor(V(inf), t, p) === want, 'English: ' + inf + ' ' + t + ' ' + p, A.englishFor(V(inf), t, p)));
A.VERBS.forEach(v => A.TENSES.forEach(t => { for (let p = 0; p < 5; p++) { const e = A.englishFor(v, t.k, p); ok(e && !/undefined/.test(e), 'English exists: ' + v.inf + ' ' + t.k, e); } }));

// ---------- comparing speech and typing ----------
head('the learner’s own endings');
ok(A.genderize('Estoy cansad{o|a}.', 'm') === 'Estoy cansado.' && A.genderize('Estoy cansad{o|a}.', 'f') === 'Estoy cansada.', 'cansado for a man, cansada for a woman');
ok(A.genderize('a {boy|girl}', 'm') === 'a boy', 'the English follows too');
ok(!/\{[^{}"]*\|[^{}"]*\}/.test(JSON.stringify([A.WORDS, A.CONNECTORS, A.DIALOGUES])), 'no {o|a} marker is left in the data');
ok(A.WORDS.some(w => w[2] === 'Estoy cansada hoy.'), 'the default is a woman (the original learner)');

head('checking what was said');
ok(A.speechScore('hola como estas', 'Hola, ¿cómo estás?').ratio === 1, 'accents and punctuation don’t matter to the ear');
ok(A.speechScore('ano', 'año').ratio === 0, 'but ñ is its own letter (año ≠ ano)');
const part = A.speechScore('quiero aprender', 'Quiero aprender español.');
ok(Math.abs(part.ratio - 2 / 3) < 1e-9 && JSON.stringify(part.marks) === '[true,true,false]', 'a missing word is found and marked', JSON.stringify(part));
ok(A.speechScore('', 'hola').ratio === 0 && A.speechScore('algo', '').ratio === 0, 'empty input is safe');
ok(A.speechScore('estoy en la en casa', 'Estoy en casa.').ratio === 1, 'an extra word doesn’t cost');
const best = A.bestScore(['Hola como está', 'hola cómo estás'], '¿Cómo estás?');
ok(best.ratio === 1 && best.heard === 'hola cómo estás', 'the best of the recognizer’s guesses is used', JSON.stringify(best));
ok(A.bestScore([], 'hola').ratio <= 0, 'no guesses scores nothing');
ok(A.checkTyped('fuimos', 'fuimos') === 'right' && A.checkTyped(' Fuimos ', 'fuimos') === 'right', 'typed: right, ignoring case and spaces');
ok(A.checkTyped('esta', 'está') === 'accent' && A.checkTyped('dejo', 'dejó') === 'accent', 'typed: right but for the accent');
ok(A.checkTyped('ano', 'año') === 'wrong' && A.checkTyped('manana', 'mañana') === 'wrong', 'ñ is a letter, not an accent (año ≠ ano)');
ok(A.checkTyped('fue', 'fuimos') === 'wrong' && A.checkTyped('', 'fui') === 'empty', 'typed: wrong and empty');
ok(A.checkTyped('me levanto', 'me levanto') === 'right' && A.checkTyped('me  levanto', 'me levanto') === 'right', 'two-word forms');

// ---------- spaced repetition and the day ----------
head('spaced repetition');
reset();
let c = A.srsGrade('w0', 1, 100); ok(c.i === 1 && c.d === 101 && c.r === 1, 'first “got it”: back tomorrow', JSON.stringify(c));
c = A.srsGrade('w0', 1, 101); ok(c.i === 3 && c.d === 104, 'second: in three days', JSON.stringify(c));
c = A.srsGrade('w0', 1, 104); ok(c.i >= 7 && c.i <= 9, 'third: about a week', JSON.stringify(c));
c = A.srsGrade('w0', 0, 112); ok(c.i === 0 && c.d === 112 && c.r === 0 && c.e < 2.5, '“again” resets it to today and lowers the ease', JSON.stringify(c));
c = A.srsGrade('w1', 2, 100); ok(c.i === 3 && c.e > 2.5, '“easy” jumps further', JSON.stringify(c));
A.srsGrade('w2', 1, 100);
ok(JSON.stringify(A.srsDue(101)) === '["w2"]', 'due today, oldest first', JSON.stringify(A.srsDue(101)));
ok(A.srsDue(112).includes('w0') && A.srsDue(112).includes('w1'), 'later days bring the rest back');
c = A.srsIntroduce('w9', 100); ok(c.r === 0 && c.d === 101 && A.cardDirection(c) === 'recognize', 'a word just met comes back tomorrow, to recognize first', JSON.stringify(c));
ok(A.srsIntroduce('w9', 105).d === 101, 'meeting it again doesn’t reset it');
ok(A.cardDirection({r:1}) === 'produce' && A.cardDirection({r:2}) === 'recognize', 'reviews alternate: say it, then recognize it');

head('the daily plan');
reset();
A.save('start', 200);
let t1 = A.todaysNew(200);
ok(t1.length === 5 && t1.join() === '0,1,2,3,4', 'day one: the first five words', t1.join());
ok(A.todaysNew(200).join() === t1.join(), 'reopening the app the same day gives the same words');
t1.forEach(i => A.srsGrade('w' + i, 1, 200));
ok(A.todaysNew(201).join() === '5,6,7,8,9', 'next day: the next five', A.todaysNew(201).join());
A.save('newPerDay', 8); A.save('newToday', null);
ok(A.todaysNew(201).length === 8, 'the daily number can change');
ok(A.learnedIndexes().join() === '0,1,2,3,4', 'words met are tracked');
reset();
A.markDone('review', 300); A.markDone('new', 299); A.markDone('speak', 298);
ok(A.streak(300) === 3, 'streak counts back from today', A.streak(300));
ok(A.streak(301) === 3, 'streak survives until the day is done', A.streak(301));
ok(A.streak(302) === 0, 'a missed day ends it');
ok(A.dayLog(300).review === true && !A.dayLog(300).verb, 'the day log');
reset(); A.save('start', 500);
const vods = []; for (let d = 500; d < 540; d++) vods.push(A.verbOfDay(d));
ok(vods[0].verb.inf === 'ser' && vods[0].tense === 'pres', 'day one: ser in the present', vods[0].verb.inf + ' ' + vods[0].tense);
ok(vods[2].verb.inf === 'ir', 'day three: ir (“to go”)');
ok(vods.slice(0, 5).every(x => ['pres'].includes(x.tense) || x.tense === 'pret'), 'the first days stay in the present and preterite', vods.slice(0, 5).map(x => x.tense).join());
ok(vods.every(x => !x.verb.noDrill && A.conjugate(x.verb, x.tense)), 'never haber, never an empty command');
ok(vods.every(x => !(x.verb.skip || []).includes(x.tense)), 'never “estoy estando”');
ok(A.TENSE_LADDER.indexOf('subj') > A.TENSE_LADDER.indexOf('perf') && A.TENSE_LADDER.indexOf('subj') === A.TENSE_LADDER.length - 1, 'the subjunctive comes last (Cervantes: not A1–A2)');
ok(new Set(vods.map(x => x.tense)).size >= 5, 'the tenses open up over the weeks', [...new Set(vods.map(x => x.tense))].join());

head('verb drills');
seed = 11;
const ds = A.drillSet([V('ir'), V('hablar')], ['pres', 'pret'], 10, rnd, true);
ok(ds.length === 10 && ds.every(d => d.answer && d.en && d.v), 'ten items with answers and English');
ok(ds.slice(0, 5).every(d => d.v.inf === 'ir'), 'irregular forms first: ir before hablar', ds.map(d => d.v.inf).join());
ok(A.drillSet(A.DRILL_VERBS, A.TENSES.map(t => t.k), 5000, rnd).every(d => d.answer), 'every drillable form has an answer');
ok(A.DRILL_VERBS.every(v => v.inf !== 'haber'), 'haber is not drilled');
const di = A.drillItem(V('ir'), 'pret', 3); ok(di.answer === 'fuimos' && di.en === 'we went', 'ir, preterite, nosotros = fuimos (we went)');

// ---------- speaking material ----------
head('speaking material');
ok(A.SURVIVAL.length >= 40 && A.SURVIVAL_GROUPS.every(g => A.SURVIVAL.filter(s => s[0] === g.k).length >= 5), 'survival phrases in every group');
ok(A.SURVIVAL.every(s => s[1] && s[2] && A.SURVIVAL_GROUPS.some(g => g.k === s[0])), 'every phrase has a group, Spanish and English');
ok(A.BUILDERS.length >= 15 && A.BUILDERS.every(b => b.ex.length === 3), 'sentence starters, three examples each');
A.BUILDERS.forEach(b => {
  const first = A.words(b.es)[0].slice(0, 3);
  ok(b.ex.filter(x => A.words(x[0]).some(w => w.startsWith(first))).length >= 2, 'starter “' + b.es + '” shows up in its examples');
});
ok(A.DIALOGUES.length === 10, 'ten conversations');
A.DIALOGUES.forEach(d => {
  ok(d.lines.length >= 8 && d.lines.some(l => l[0] === 'a') && d.lines.some(l => l[0] === 'b'), d.title + ': two speakers, eight lines');
  ok(d.lines.every(l => l[1] && l[2] && /[.!?…]$/.test(l[1])), d.title + ': every line has Spanish and English');
});
ok(A.speakPool().length > 400, 'hundreds of say-it prompts', A.speakPool().length);
['survival', 'builders', 'words', 'dialogues'].forEach(k => ok(A.speakPool(k).length >= 10 && A.speakPool(k).every(x => x.src === k), 'prompt pool: ' + k));
reset(); ok(A.todaysSpeaking(5, rnd).length === 5, 'today’s speaking works before any word is learned');
A.srsGrade('w10', 1, 1); A.srsGrade('w11', 1, 1);
seed = 3; const tsp = []; for (let k = 0; k < 40; k++) tsp.push(...A.todaysSpeaking(5, rnd));
ok(tsp.some(x => x.wi === 10) && tsp.every(x => x.src === 'survival' || [10, 11].includes(x.wi)), 'today’s speaking uses only words already met (plus phrases)');
const bp = A.buildPrompts(30, rnd);
ok(bp.length === 30 && bp.every(p => /^[A-ZÁÉÍÓÚ]/.test(p.es) && /\.$/.test(p.es) && /\.$/.test(p.en) && !/\bse\.$/.test(p.es)), 'starter + verb prompts are clean sentences', bp.slice(0, 3).map(p => p.es + ' / ' + p.en).join(' · '));
ok(bp.every(p => !/querer|poder|saber|poner|dar|traer|buscar|pedir|encontrar|decir|hacer\./.test(p.es)), 'only verbs that make a whole sentence alone');

// ---------- connectors ----------
head('connecting words');
ok(A.CONNECTORS.length >= 30 && A.CONNECTOR_GROUPS.every(g => A.CONNECTORS.some(c => c[0] === g.k)), 'connectors in every group');
const usable = A.CONNECTORS.filter(c => A.findWhole(c[3], c[1]) >= 0);
ok(usable.length >= A.CONNECTORS.length - 1, 'each connector appears in its own example', A.CONNECTORS.filter(c => A.findWhole(c[3], c[1]) < 0).map(c => c[1]).join());
ok(A.findWhole('Es muy caro y malo.', 'y') === 12, '“y” is never found inside “muy”');
seed = 5; const cq = A.connectorQuiz(10, rnd);
ok(cq.length === 10 && cq.every(q => q.opts.length === 4 && new Set(q.opts).size === 4 && q.opts[q.ans] && /_____/.test(q.q)), 'connector quiz: a gap and four options');
ok(cq.every(q => !q.q.replace(/<[^>]+>/g, ' ').split('_____').join(' ').toLowerCase().includes(' ' + q.opts[q.ans].toLowerCase() + ' ') || q.opts[q.ans].length < 3), 'the answer is not left in the sentence');

// ---------- quizzes ----------
head('quizzes');
seed = 9; const wq = A.wordQuiz(null, 30, rnd);
ok(wq.length === 30 && wq.every(q => q.opts.length === 4 && new Set(q.opts.map(A.fold)).size === 4 && q.ans >= 0), 'word quiz: four different options');
ok(wq.some(q => /Listen/.test(q.q)) && wq.some(q => /mean/.test(q.q)), 'meaning and listening questions');
ok(A.wordQuiz([1, 2], 5, rnd).length === 5, 'too few words met: falls back to the whole list');
const mc = A.mcq('q', 'sí', ['si', 'sí', 'no', 'ya', 'yo'], rnd);
ok(mc.opts.length === 4 && mc.opts.filter(o => A.fold(o) === 'si').length === 1, 'options never repeat, even up to accents');

head('grammar lessons');
ok(A.LESSONS.length === 22, 'twenty-two lessons', A.LESSONS.length);
ok(new Set(A.LESSONS.map(l => l.k)).size === 22, 'unique keys');
ok(A.lessonByKey('personala') && A.lessonByKey('saberconocer'), 'the personal a and saber/conocer are taught');
A.LESSONS.forEach(l => {
  ok(l.point && l.able && l.body && /EG|MSG/.test(l.src), l.title + ': point, able, notes and a source chapter');
  ok(l.ex.length >= 3 && l.ex.every(x => x[0] && x[1]), l.title + ': at least three examples to hear');
  ok(l.q.length >= 5, l.title + ': at least five questions');
  l.q.forEach(q => {
    ok(q.w.length === 3 && new Set([q.a].concat(q.w)).size === 4 && q.e, l.title + ': “' + q.q + '” has 3 distinct wrong answers and a reason');
    const longest = Math.max(...q.w.map(w => w.length));
    ok(q.a.length <= Math.max(longest * 1.35, longest + 8), l.title + ': the right answer isn’t given away by its length', q.a + ' (' + q.a.length + ' vs ' + longest + ')');
  });
});
ok(A.lessonByKey('subjunctive').later === true, 'the subjunctive lesson is marked for later');
const allq = A.lessonQuiz(A.LESSONS, 0, rnd);
ok(allq.length === A.LESSONS.reduce((n, l) => n + l.q.length, 0), 'the mixed quiz can draw from every question');
const ansPos = [0, 0, 0, 0]; for (let k = 0; k < 20; k++) A.lessonQuiz(A.LESSONS, 0, rnd).forEach(q => ansPos[q.ans]++);
ok(Math.min(...ansPos) > Math.max(...ansPos) * 0.8, 'the right answer lands in every position', ansPos.join());

// ---------- tone ----------
head('tone');
const allText = JSON.stringify([A.WORDS, A.SURVIVAL, A.BUILDERS, A.CONNECTORS, A.DIALOGUES, A.LESSONS, A.PATTERNS, A.VERBS]);
ok(!/\b(bruh|lol|GOAT|cheeks|dude|lmao)\b/i.test(allText), 'no slang anywhere');
ok(!/Wrong!|Nope|Oops/i.test(html), 'wrong answers are met with “Not this one.”');
ok(/Not this one\./.test(html), '…which is there');
ok(!/vosotros/.test(JSON.stringify(A.VERBS.map(v => A.TENSES.map(t => A.conjugate(v, t.k))))), 'Latin-American forms (no vosotros)');

// ---------- page ----------
head('the page');
ok(/<title>Español/.test(html) && /manifest\.webmanifest/.test(html) && /apple-touch-icon/.test(html), 'title, manifest and home-screen icon');
['today', 'speak', 'words', 'verbs', 'connect', 'grammar'].forEach(t => ok(html.includes('data-topic="' + t + '"') && html.includes('id="topic-' + t + '"'), 'tab ' + t));
ok((html.match(/id="emblem"/g) || []).length === 1 && /i-mic/.test(html) && /i-say/.test(html), 'the sun seal and the icons');
ok(/--gold:#a0522d/.test(html) && /\.orn,\.rail\{color:#c6a469\}/.test(html), 'terracotta accent, gold ornaments');
ok(/Essential Grammar/.test(html) && /Modern Spanish Grammar/.test(html) && /Cervantes/.test(html), 'the sources are credited');
ok(!/<!--(?![\s\S]*?-->)/.test(html), 'comments are closed');

console.log('\n' + (fails === 0 ? 'ALL ' + checks + ' CHECKS PASSED' : fails + ' FAILURES out of ' + checks + ' checks'));
process.exit(fails ? 1 : 0);
