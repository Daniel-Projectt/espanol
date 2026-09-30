/* Clicks through the real page in a simulated browser (jsdom), with a fake voice and a fake
   microphone.  Usage: node test-dom.js <path-to-node_modules-containing-jsdom>             */
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const NM = process.argv[2];
const { JSDOM, VirtualConsole } = require(path.join(NM, 'jsdom'));
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

/* the data, straight from the sources, to know the right answers */
const D = {};
vm.createContext(D);
['02a-words.js', '02b-verbs.js', '02c-speak.js', '02d-grammar.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), D));
vm.runInContext('this.WORDS=WORDS;this.LESSONS=LESSONS;this.VERBS=VERBS;this.DIALOGUES=DIALOGUES;this.CONNECTORS=CONNECTORS;this.conjugate=conjugate;this.verbByInf=verbByInf;this.PERSONS=PERSONS;', D);

let fails = 0, checks = 0;
function ok(c, label, d) { checks++; if (!c) { fails++; console.log('  FAIL  ' + label + (d !== undefined ? '  -> ' + d : '')); } }
function head(t) { console.log('\n== ' + t + ' =='); }

function makePage(opts) {
  const errors = [], spoken = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message + (e.detail ? ' | ' + e.detail : '')));
  vc.on('error', e => errors.push(String(e)));
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/', virtualConsole: vc,
    beforeParse(w) {
      w.scrollTo = () => {};
      w.Element.prototype.scrollIntoView = function () {};
      w.addEventListener('error', e => errors.push('window.onerror: ' + e.message));
      w.SpeechSynthesisUtterance = function (t) { this.text = t; };
      w.speechSynthesis = { speak: u => spoken.push(u), cancel: () => {}, getVoices: () => opts.voices || [{ lang: 'es-ES', name: 'Monica' }, { lang: 'es-MX', name: 'Paulina' }, { lang: 'en-US', name: 'Samantha' }] };
      if (opts.mic) {
        w.webkitSpeechRecognition = function () {
          const r = this;
          r.start = () => { r.startedWith = r.lang; const h = w.__heard; if (h === 'deny') { r.onerror({ error: 'not-allowed' }); r.onend(); return; } if (!h) { r.onend(); return; }
            const res = h.map(t => ({ transcript: t })); r.onresult({ results: [res] }); r.onend(); };
          r.abort = () => {};
          w.__rec = r;
        };
      }
    } });
  return { dom, w: dom.window, d: dom.window.document, errors, spoken };
}

let P = makePage({ mic: true });
let w = P.w, d = P.d;
const $ = (s, r) => (r || d).querySelector(s), $$ = (s, r) => Array.from((r || d).querySelectorAll(s));
const visible = el => { for (let n = el; n && n !== d; n = n.parentNode) if (n.hidden) return false; return true; };
const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const key = k => d.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true }));
const topic = t => click($('.topic-btn[data-topic="' + t + '"]'));
const mode = (t, m) => click($('.seg[data-modes="' + t + '"] button[data-mode="' + m + '"]'));
const lastSaid = () => P.spoken.length ? P.spoken[P.spoken.length - 1].text : '';
const store = k => JSON.parse(w.localStorage.getItem('es.' + k));
const fold = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/* answer a quiz using the real answer (from the explanation after a first try when unknown) */
function playQuiz(root, pickRight, label) {
  let n = 0, right = 0;
  while (n++ < 60) {
    const opts = $$('.opt', root);
    if (!opts.length) break;
    let k = 0;
    if (pickRight) { const want = pickRight(root); const i = opts.findIndex(o => o.textContent.slice(1) === want); if (i >= 0) k = i; }
    click(opts[k]);
    ok($$('.opt.correct', root).length === 1, label + ': the right answer is shown');
    if (opts[k].classList.contains('correct')) right++;
    ok($('.feedback', root).textContent.length > 8, label + ': the feedback explains', $('.feedback', root).textContent);
    const nb = $('.next', root); ok(nb && !nb.hidden, label + ': next appears');
    click(nb);
  }
  return right;
}

head('first open');
ok(P.errors.length === 0, 'no errors on load', P.errors.join(' | '));
ok(visible($('#topic-today')) && !visible($('#topic-speak')), 'opens on Today');
ok(P.spoken.length === 0, 'nothing speaks by itself on load', P.spoken.map(u => u.text).join(' | '));
ok($$('.step').length === 4, 'four steps');
ok(/Día 1/.test($('.dayhead').textContent) && /Start your streak/.test($('.dayhead').textContent), 'day one, no streak yet');
ok($('[data-step="review"]').disabled && /Starts tomorrow/.test($$('.step')[0].textContent), 'nothing to review on day one');
ok(/hola · adiós · sí · no · por favor/.test($$('.step')[1].textContent), 'the first five words are listed', $$('.step')[1].textContent);
ok(/ser/.test($$('.step')[3].textContent) && /Present/.test($$('.step')[3].textContent), 'verb of the day: ser, present');
ok(/Latin America/.test($('#setLang').selectedOptions[0].textContent), 'Latin-American accent by default');

head('new words');
click($('[data-step="new"]'));
ok(/hola/.test($('#stepRoot .prompt').textContent) && /hello/.test($('#stepRoot .meaning').textContent), 'the first word, with its meaning');
ok(lastSaid() === 'hola', 'and it is spoken', lastSaid());
ok(P.spoken[P.spoken.length - 1].voice && P.spoken[P.spoken.length - 1].voice.lang === 'es-MX', 'in a Latin-American voice');
w.__heard = ['hola cómo estás'];
click($('#stepRoot .mic'));
ok(/Muy bien/.test($('#stepRoot .heard').textContent), 'saying the sentence right: “Muy bien.”', $('#stepRoot .heard').textContent);
ok(w.__rec.startedWith === 'es-MX', 'the microphone listens for Spanish');
w.__heard = ['hola'];
click($('#stepRoot .mic'));
ok(/Close|Not this one/.test($('#stepRoot .heard').textContent) && $$('#stepRoot .gap').length >= 1, 'half a sentence: the missing words are marked', $('#stepRoot .heard').textContent);
w.__heard = 'deny';
click($('#stepRoot .mic'));
ok(/blocked/.test($('#stepRoot .heard').textContent), 'a blocked microphone says so');
w.__heard = null;
click($('#stepRoot .mic'));
ok(/didn’t catch/.test($('#stepRoot .heard').textContent), 'silence: try again');
click($('#stepRoot .next'));
ok(/adiós/.test($('#stepRoot .prompt').textContent), 'next word');
click($('#stepRoot .back'));
ok(/hola/.test($('#stepRoot .prompt').textContent), 'back works');
for (let k = 0; k < 5; k++) click($('#stepRoot .next'));
ok(/5 new words/.test($('#stepRoot').textContent), 'all five met');
ok(Object.keys(store('srs')).join() === 'w0,w1,w2,w3,w4', 'they join the review', Object.keys(store('srs')).join());
ok($$('.step.done').length === 1 && $$('.step')[1].classList.contains('done'), 'the step is ticked');
ok($('#stepRoot .result'), 'and its result stays on screen');

head('speak step');
click($('#stepRoot [data-step2="speak"]'));
ok(/Say in Spanish/.test($('#stepRoot').textContent) && /1 of 5/.test($('#stepRoot .qnum').textContent), 'five sentences to say');
const firstPrompt = $('#stepRoot .prompt').textContent;
click($('#stepRoot .show'));
ok(visible($('#stepRoot .reveal-area')) && $('#stepRoot .answer-es').textContent.length > 2, 'show reveals the Spanish');
ok(lastSaid().length > 2, 'and speaks it');
click($('#stepRoot .miss'));
ok(/1 of 6|2 of 6/.test($('#stepRoot .qnum').textContent), '“not yet” puts it back in the round', $('#stepRoot .qnum').textContent);
for (let k = 0; k < 6; k++) { if (!$('#stepRoot .show')) break; click($('#stepRoot .show')); click($('#stepRoot .gotit')); }
ok(/¡Listo!/.test($('#stepRoot').textContent), 'round finished');
ok($$('.step')[2].classList.contains('done'), 'speak step ticked');

head('verb of the day');
click($('[data-step="verb"]'));
ok($$('#stepRoot .tbl.conj tr').length === 5 && /soy/.test($('#stepRoot .tbl.conj').textContent), 'the table for ser comes first');
ok($$('#stepRoot td.irr').length === 5, 'all five forms marked as irregular');
click($('#stepRoot .go'));
const serMap = { 'yo': 'soy', 'tú': 'eres', 'él / ella / usted': 'es', 'nosotros': 'somos', 'ellos / ellas / ustedes': 'son' };
let firstWrong = true;
for (let k = 0; k < 5; k++) {
  const who = $('#stepRoot .dv b').textContent, inp = $('#stepRoot .answer');
  ok(serMap[who], 'the person is shown: ' + who);
  if (firstWrong) {
    inp.value = 'fui'; click($('#stepRoot .check'));
    ok(/Not this one/.test($('#stepRoot .feedback').textContent) && $('#stepRoot .feedback').textContent.includes(serMap[who]), 'a wrong form shows the right one and why');
    firstWrong = false;
  } else {
    inp.value = serMap[who]; click($('#stepRoot .check'));
    ok(/Right/.test($('#stepRoot .feedback').textContent), 'right form accepted: ' + serMap[who]);
  }
  ok(lastSaid() === serMap[who], 'the answer is spoken', lastSaid());
  click($('#stepRoot .next'));
}
ok(/4 \/ 5/.test($('#stepRoot .result').textContent) && $$('#stepRoot .misslist > div').length === 1, 'score and the missed form');
ok($$('.step.done').length === 3, 'three of four steps done');
ok(/1-day streak/.test($('.dayhead').textContent), 'the streak starts');

head('review, the next day');
const srs = store('srs'); Object.keys(srs).forEach(k => { srs[k].d = 0; }); w.localStorage.setItem('es.srs', JSON.stringify(srs));
topic('words'); topic('today');
ok(!$('[data-step="review"]').disabled && /5 cards waiting/.test($$('.step')[0].textContent), 'five cards waiting', $$('.step')[0].textContent);
click($('[data-step="review"]'));
ok(/Say in Spanish/.test($('#stepRoot').textContent) && /hello/.test($('#stepRoot .prompt').textContent), 'after meeting a word, you are asked to SAY it', $('#stepRoot .prompt').textContent);
w.__heard = ['hola'];
click($('#stepRoot .mic'));
ok(visible($('#stepRoot .reveal-area')) && !$('#stepRoot .grades').hidden, 'saying it right reveals the answer');
click($('#stepRoot .g0'));
ok(/2 of 6/.test($('#stepRoot .qnum').textContent), '“again” brings it back at the end', $('#stepRoot .qnum').textContent);
let guard = 0;
while ($('#stepRoot .grades') && guard++ < 10) { click($('#stepRoot .show')); click($('#stepRoot .g1')); }
ok(/review/.test($('#stepRoot .result').textContent), 'review finished', $('#stepRoot').textContent);
ok(Object.values(store('srs')).every(c => c.d > 0), 'every card scheduled ahead');
ok($$('.step')[0].classList.contains('done'), 'review ticked');
ok(/Día completo/.test($('#topic-today').textContent), 'the day is complete');

head('speak tab');
topic('speak');
ok(visible($('[data-panel="speak/say"]')) && /Say in Spanish/.test($('#sayRoot').textContent), 'say it: my words');
click($('#sayFrom [data-from="builders"]'));
ok(/Start with/.test($('#sayRoot').textContent), 'builders give a starter hint');
click($('#sayFrom [data-from="survival"]'));
ok(/10$/.test($('#sayRoot .qnum').textContent), 'ten phrases');
key(' '); ok(visible($('#sayRoot .reveal-area')), 'space reveals');
key('Enter'); ok(/2 of 10/.test($('#sayRoot .qnum').textContent), 'enter moves on');
click($('#sayRoot [data-slow]'));
ok(P.spoken[P.spoken.length - 1].rate < 0.8, 'the slow button slows the voice', P.spoken[P.spoken.length - 1].rate);
mode('speak', 'shadow');
ok(visible($('#shadowRoot')) && $('#shBox .echo'), 'echo drill');
const echoText = $('#shBox .echo').textContent;
ok(lastSaid() === echoText, 'the sentence is played at once');
click($('#shBox .slow')); ok(lastSaid() === echoText && P.spoken[P.spoken.length - 1].rate < 0.8, 'slower');
click($('#shHide'));
$('#shHide').checked = true; $('#shHide').dispatchEvent(new w.Event('change'));
ok($('#shBox .echo').classList.contains('veiled') && $('#shBox .peek'), 'the text can be hidden');
w.__heard = [echoText];
click($('#shBox .mic'));
ok(!$('#shBox .echo').classList.contains('veiled') && /Muy bien/.test($('#shBox').textContent), 'echoing it right uncovers it');
$('#shHide').checked = false; $('#shHide').dispatchEvent(new w.Event('change'));
mode('speak', 'talk');
ok($$('.scene').length === 10, 'ten conversations to choose');
click($('.scene[data-d="cafe"]'));
ok(/Them/.test($('#talkBox').textContent) && lastSaid() === '¿Qué le sirvo?'.replace(/.*/, D.DIALOGUES[1].lines[0][1]), 'the café opens with their line, spoken', lastSaid());
click($('#talkBox .next'));
ok(/Say: Good morning\. I’d like a coffee/.test($('#talkBox').textContent), 'your turn: the English cue');
w.__heard = ['buenos días quisiera un café con leche por favor'];
click($('#talkBox .mic'));
ok(/Quisiera un café con leche/.test($('#talkBox .ln.me:last-of-type, #talkBox .ln.me').textContent) || /Quisiera/.test($('#talkBox').textContent), 'saying it reveals your line');
guard = 0;
while ($('#talkBox .next') && guard++ < 30) { const s = $('#talkBox .show'); if (s && !s.hidden) click(s); click($('#talkBox .next')); }
ok($('#talkBox .swap') && $$('#talkBox .ln').length === 8, 'the whole scene, eight lines', $$('#talkBox .ln').length);
click($('#talkBox .swap'));
ok(/Say:/.test($('#talkBox').textContent) && $$('#talkBox .ln').length === 1, 'swapped: now you open the conversation');
mode('speak', 'survive');
ok($$('#surviveRoot .pl').length >= 40 && $$('#surviveRoot .gsec').length === 5, 'survival phrases in five groups');
click($('#surviveRoot .pl')); ok(lastSaid() === 'Buenos días.', 'tap a phrase to hear it', lastSaid());

head('words tab');
topic('words');
ok($$('details.wset').length === 27, 'twenty-seven days of words');
ok($$('tr.known').length === 5, 'the five met words are marked');
ok($$('details.wset')[0].open, 'the current day is open');
mode('words', 'cards');
ok(/1 of 5/.test($('#wordCards .counter').textContent), 'flashcards start with my words');
$('#cardSet').value = '2'; $('#cardSet').dispatchEvent(new w.Event('change'));
ok(/1 of 10/.test($('#wordCards .counter').textContent) && /qué/.test($('#wordCards .face.front').textContent), 'day three cards', $('#wordCards .face.front').textContent);
key('ArrowRight'); ok(/2 of 10/.test($('#wordCards .counter').textContent), 'arrow moves');
key(' '); ok($('#wordCards .flash').classList.contains('flipped'), 'space flips');
mode('words', 'quiz');
click($('#wqFrom [data-from="all"]'));
const wr = playQuiz($('#wordQuiz'), root => {
  const q = $('.qtext', root).textContent; const m = q.match(/What does (.+) mean\?/);
  if (m) { const x = D.WORDS.find(x => x[0] === m[1]); return x && x[1]; }
  return lastSaid();
}, 'word quiz');
ok(wr === 10, 'answering right scores ten', wr);
ok(/10 \/ 10/.test($('#wordQuiz .result').textContent), 'result 10 / 10');

head('verbs tab');
topic('verbs');
ok($('#vtVerb').value === 'ir' && /voy/.test($('#vtOut').textContent), 'tables open on ir (to go)');
ok($$('#vtVerb optgroup').length === 5, 'verbs grouped in five families');
$('#vtVerb').value = 'tener'; $('#vtVerb').dispatchEvent(new w.Event('change'));
click($('#vtTense [data-t="fut"]'));
ok(/tendré/.test($('#vtOut').textContent) && $$('#vtOut td.irr').length === 5, 'tener, future: tendré, all marked');
ok(/they will have/.test($('#vtOut').textContent), 'with the English');
click($('#vtTense [data-t="cmd"]')); ok(/¡ten!/.test($('#vtOut').textContent), 'command: ¡ten!');
ok($$('#vtAll .glance-t tr').length === 9 && /tuvieron/.test($('#vtAll').textContent), 'all tenses at a glance');
ok(store('vt.verb') === 'tener', 'the chosen verb is remembered');
mode('verbs', 'drill');
click($('#vdG [data-g="stem"]'));
click($('#vdGo'));
ok(/1 of 10/.test($('#vdBox .qnum').textContent), 'ten forms');
let vr = 0;
for (let k = 0; k < 10; k++) {
  const inf = $('#vdBox .dv .es').textContent, tname = $('#vdBox .dv').textContent;
  const v = D.verbByInf(inf); ok(v && v.group === 'stem', 'a stem-changing verb: ' + inf);
  const t = /preterite/.test(tname) ? 'pret' : 'pres', who = $('#vdBox .dv b').textContent, p = D.PERSONS.indexOf(who);
  const ans = D.conjugate(v, t)[p];
  $('#vdBox .answer').value = k === 0 ? ans.normalize('NFD').replace(/[̀-ͯ]/g, '') : ans;
  click($('#vdBox .check'));
  if (/Right/.test($('#vdBox .feedback').textContent)) vr++;
  if (k === 0 && ans !== ans.normalize('NFD').replace(/[̀-ͯ]/g, '')) ok(/Watch the accent/.test($('#vdBox .feedback').textContent), 'missing accent accepted with a reminder');
  click($('#vdBox .next'));
}
ok(vr === 10 && /10 \/ 10/.test($('#vdBox .result').textContent), 'ten right', vr);
click($('#vdGo'));
click($$('#vdBox .ins').find(b => b.textContent === 'ñ'));
ok($('#vdBox .answer').value === 'ñ', 'the accent keys type');
mode('verbs', 'patterns');
ok($$('#verbPatterns .rule').length === 9, 'nine patterns');
click($('#verbPatterns .vlink[data-v="dormir"]'));
ok(visible($('#verbTables')) && $('#vtVerb').value === 'dormir', 'a verb chip opens its table');

head('connect tab');
topic('connect');
ok($$('#buildRoot .rule').length >= 15, 'sentence starters');
mode('connect', 'links');
ok($$('#linkRoot .gsec').length === 5 && $$('#linkRoot tr').length >= 30, 'connecting words in five groups');
mode('connect', 'quiz');
const cr = playQuiz($('#linkQuiz'), root => { const say = D.CONNECTORS.find(c => $('.qen', root) && c[4] === $('.qen', root).textContent); return say && say[1]; }, 'connector quiz');
ok(cr === 10, 'every gap answered right', cr);
mode('connect', 'builders');
click($('#buildRoot [data-go="speak/say"]'));
ok(visible($('#sayRoot')) && $('#sayFrom [data-from="builders"]').getAttribute('aria-pressed') === 'true' && /Start with/.test($('#sayRoot').textContent), '“say your own” jumps to the builder drill');

head('grammar tab');
topic('grammar');
ok($$('details.lesson').length === 20, 'twenty lessons');
ok(/later/.test($('#lesson-subjunctive summary').textContent), 'the subjunctive is marked “later”');
const ls = $('#lesson-serestar'); ls.open = true;
ok(/The point/.test(ls.textContent) && /Be able to/.test(ls.textContent) && $$('.pl', ls).length >= 3, 'point, able to, examples');
click($('.pl', ls)); ok(/^Soy de Ohio/.test(lastSaid()), 'examples are spoken');
click($('.lq', ls));
const lesson = D.LESSONS.find(l => l.k === 'serestar');
const gr = playQuiz($('.lqbox', ls), root => { const q = $('.qtext', root).textContent; const x = lesson.q.find(z => z.q === q); return x && x.a; }, 'ser/estar quiz');
ok(gr === lesson.q.length, 'all right', gr);
ok(ls.classList.contains('ok') && store('lessons').serestar === true, 'the lesson is ticked when passed');
click($('#gMixed'));
ok(/Question 1 of 10/.test($('#gMixedBox').textContent), 'mixed quiz of ten');
key('1'); ok($$('#gMixedBox .opt:disabled').length === 4, 'key 1 answers');
key('Enter'); ok(/Question 2 of 10/.test($('#gMixedBox').textContent), 'enter moves on');

head('settings');
$('#setRate').value = '0.75'; $('#setRate').dispatchEvent(new w.Event('change'));
ok(store('rate') === 0.75 && P.spoken[P.spoken.length - 1].rate === 0.75, 'slower voice saved and heard');
$('#setLang').value = 'es-ES'; $('#setLang').dispatchEvent(new w.Event('change'));
ok(P.spoken[P.spoken.length - 1].voice.lang === 'es-ES', 'Spain accent switches voice');
$('#setNew').value = '8'; $('#setNew').dispatchEvent(new w.Event('change'));
ok(store('newPerDay') === 8, 'new words a day saved');
ok(P.errors.length === 0, 'no errors all the way through', P.errors.join(' | '));

head('no microphone, no Spanish voice');
P = makePage({ mic: false, voices: [{ lang: 'en-US', name: 'Samantha' }] }); w = P.w; d = P.d;
ok(P.errors.length === 0, 'loads', P.errors.join(' | '));
click($('[data-step="new"]'));
ok(!$('#stepRoot .mic') && $('#stepRoot .next'), 'no microphone button, lessons still work');
topic('speak');
ok(!$('#sayRoot .mic') && $('#sayRoot .show'), 'say it falls back to “show the Spanish”');
ok(/no Spanish voice/.test($('#voiceNote').textContent), 'the page explains how to add a Spanish voice');
ok(P.errors.length === 0, 'no errors without the microphone', P.errors.join(' | '));

console.log('\n' + (fails === 0 ? 'ALL ' + checks + ' DOM CHECKS PASSED' : fails + ' FAILURES out of ' + checks + ' DOM checks'));
process.exit(fails ? 1 : 0);
