/* ================================================================ CORE (no DOM: tested in node)
   The method, borrowed from what works:
   - spaced repetition (Anki, SuperMemo): a card comes back just before you'd forget it;
   - a small daily dose of new words (Duolingo, Clozemaster): 5 a day beats 50 once;
   - speak before you see it (Pimsleur): hear or read the English, SAY the Spanish, then check;
   - shadowing: repeat a native sentence right after hearing it;
   - chunks and connectors (Language Transfer, Michel Thomas): starters that turn one verb into
     many sentences, and the little words that join sentences into speech.                  */

var STORE = "es.";
var memory = {};
function load(k, dflt){
  try{ var v = window.localStorage.getItem(STORE + k); return v === null ? dflt : JSON.parse(v); }
  catch(e){ return memory.hasOwnProperty(k) ? memory[k] : dflt; }
}
function save(k, v){
  memory[k] = v;
  try{ window.localStorage.setItem(STORE + k, JSON.stringify(v)); }catch(e){}
}

/* the learner's own endings: "Estoy cansad{o|a}" → cansado (man) / cansada (woman).
   Applied once to the data at start; changing the setting reloads the page. */
function genderize(s, g){ return String(s).replace(/\{([^|{}]*)\|([^|{}]*)\}/g, g === "m" ? "$1" : "$2"); }
var GENDER = load("gender", "f"), GENDER_OTHER = [];   /* the other gender's Spanish lines, so both get recorded */
function other(s){ if(/\{[^{}|]*\|[^{}|]*\}/.test(s)) GENDER_OTHER.push(genderize(s, GENDER === "m" ? "f" : "m")); return s; }
WORDS.forEach(function(w){ other(w[2]); for(var k = 0; k < 4; k++) w[k] = genderize(w[k], GENDER); });
CONNECTORS.forEach(function(c){ other(c[3]); for(var k = 1; k < c.length; k++) c[k] = genderize(c[k], GENDER); });
DIALOGUES.forEach(function(d){ d.lines.forEach(function(l){ other(l[1]); l[1] = genderize(l[1], GENDER); l[2] = genderize(l[2], GENDER); }); });

/* local calendar day as a number, so "today" flips at the user's midnight */
function dayNumber(date){
  var d = date || new Date();
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
}

function shuffle(a, rnd){
  rnd = rnd || Math.random; a = a.slice();
  for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function pick(a, n, rnd){ return shuffle(a, rnd).slice(0, n); }
function esc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

/* ---------------------------------------------------------------- comparing Spanish */
function stripAccents(s){ return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n"); }
/* ñ must survive: n and ñ are different letters (año / ano) */
function fold(s){
  return String(s).toLowerCase()
    .replace(/ñ/g, "\u0001").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0001/g, "ñ");
}
function words(s){
  return fold(s).replace(/[¿?¡!.,;:—–\-“”"'’…()\[\]\/]/g, " ").split(/\s+/).filter(Boolean);
}
/* the exact text that is spoken (and recorded): tidy symbols the voice shouldn't read */
function speechText(t){ return String(t).replace(/—/g, " ").replace(/…-ando/g, "…").replace(/\s\/\s/g, ", ").replace(/[“”]/g, "").replace(/\s+/g, " ").trim(); }
/* the name of a line's recording: FNV-1a over its characters (tools/record.py does the same) */
function audioKey(t){
  var h = 0x811c9dc5;
  for(var i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ("0000000" + h.toString(16)).slice(-8);
}

/* typed answer: exact, right-but-for-accents, or wrong */
function checkTyped(given, answer){
  var norm = function(s){ return String(s).toLowerCase().replace(/[¿?¡!.,]/g, "").replace(/\s+/g, " ").trim(); };
  var g = norm(given), a = norm(answer);
  if(!g) return "empty";
  if(g === a) return "right";
  var soft = function(s){ return s.replace(/ñ/g, "\u0001").normalize("NFD").replace(/[\u0300-\u036f]/g, ""); };
  if(soft(g) === soft(a)) return "accent";       /* á é í ó ú ü forgiven; ñ is a letter of its own */
  return "wrong";
}

/* ---------------------------------------------------------------- spaced repetition */
function wordId(i){ return "w" + i; }
function srsAll(){ return load("srs", {}); }
function srsGrade(id, grade, today, all){
  all = all || srsAll(); today = today === undefined ? dayNumber() : today;
  var c = all[id] || {i:0, e:2.5, r:0, d:today};
  if(grade === 0){ c.r = 0; c.i = 0; c.e = Math.max(1.3, c.e - 0.2); c.d = today; }
  else if(grade === 1){ c.i = c.r === 0 ? 1 : c.r === 1 ? 3 : Math.max(c.i + 1, Math.round(c.i * c.e)); c.r++; c.d = today + c.i; }
  else { c.i = c.r === 0 ? 3 : Math.max(c.i + 2, Math.round(Math.max(c.i, 1) * c.e * 1.3)); c.e = Math.min(3.2, c.e + 0.15); c.r++; c.d = today + c.i; }
  all[id] = c; save("srs", all); return c;
}
function srsDue(today, all){
  all = all || srsAll(); today = today === undefined ? dayNumber() : today;
  return Object.keys(all).filter(function(k){ return all[k].d <= today; })
    .sort(function(a, b){ return all[a].d - all[b].d || (+a.slice(1)) - (+b.slice(1)); });
}
function learnedIndexes(all){
  all = all || srsAll();
  return Object.keys(all).filter(function(k){ return /^w\d+$/.test(k); }).map(function(k){ return +k.slice(1); }).sort(function(a, b){ return a - b; });
}
/* a word just met: first review tomorrow, and it starts with recognizing it */
function srsIntroduce(id, today, all){
  all = all || srsAll(); today = today === undefined ? dayNumber() : today;
  if(!all[id]) all[id] = {i:1, e:2.5, r:0, d:today + 1};
  save("srs", all); return all[id];
}
/* even reviews: hear/read the Spanish, recall the English; odd: see English, SAY the Spanish */
function cardDirection(c){ return c && c.r % 2 === 1 ? "produce" : "recognize"; }

/* ---------------------------------------------------------------- the daily plan */
function newPerDay(){ return load("newPerDay", 5); }
/* today's new words: fixed once chosen, so reopening the app doesn't hand out more */
function todaysNew(today, all){
  today = today === undefined ? dayNumber() : today; all = all || srsAll();
  var t = load("newToday", null);
  if(t && t.day === today) return t.ids;
  var ids = [];
  for(var i = 0; i < WORDS.length && ids.length < newPerDay(); i++) if(!all[wordId(i)]) ids.push(i);
  save("newToday", {day:today, ids:ids});
  return ids;
}
function dayLog(today){ var l = load("log", {}); return l[today === undefined ? dayNumber() : today] || {}; }
function markDone(step, today){
  today = today === undefined ? dayNumber() : today;
  var l = load("log", {}); l[today] = l[today] || {}; l[today][step] = true; save("log", l);
}
/* consecutive days with at least one step done, counting back from today (or yesterday) */
function streak(today){
  today = today === undefined ? dayNumber() : today;
  var l = load("log", {}), n = 0, d = today;
  if(!l[d] || !Object.keys(l[d]).length) d--;
  while(l[d] && Object.keys(l[d]).length){ n++; d--; }
  return n;
}
function startDay(){ var s = load("start", null); if(s === null){ s = dayNumber(); save("start", s); } return s; }

/* verb of the day: the irregulars first, in order; the tense opens up as the days go by */
var DRILL_VERBS = VERBS.filter(function(v){ return !v.noDrill; });
/* the order the Instituto Cervantes curriculum (Plan curricular, A1–A2) brings tenses in; the
   subjunctive is not an A1–A2 item, so it comes last */
var TENSE_LADDER = ["pres", "pres", "pret", "pres", "impf", "pret", "perf", "prog", "cmd", "fut", "cond", "subj"];
function verbOfDay(today){
  today = today === undefined ? dayNumber() : today;
  var n = today - startDay();
  var v = DRILL_VERBS[((n % DRILL_VERBS.length) + DRILL_VERBS.length) % DRILL_VERBS.length];
  var unlocked = Math.min(TENSE_LADDER.length, 2 + Math.floor(Math.max(0, n) / 3));
  var tense = TENSE_LADDER[((n % unlocked) + unlocked) % unlocked];
  if(v.skip && v.skip.indexOf(tense) >= 0) tense = "pres";
  if(tense === "cmd" && !conjugate(v, "cmd")) tense = "pres";
  return {verb:v, tense:tense};
}

/* one verb-drill item: prompt + answer */
function drillItem(v, tense, p){
  var ans = conjugate(v, tense);
  if(tense === "cmd") return ans ? {v:v, tense:tense, p:-1, answer:ans, en:englishFor(v, "cmd", 1)} : null;
  return {v:v, tense:tense, p:p, answer:ans[p], en:englishFor(v, tense, p)};
}
function drillSet(verbs, tenses, n, rnd, irregularFirst){
  var pool = [];
  verbs.forEach(function(v){
    tenses.forEach(function(t){
      if(v.skip && v.skip.indexOf(t) >= 0) return;
      if(t === "cmd"){ var c = drillItem(v, t, -1); if(c) pool.push({it:c, irr:isIrregularIn(v, t)}); return; }
      var mask = irregularMask(v, t);
      for(var p = 0; p < 5; p++) pool.push({it:drillItem(v, t, p), irr:mask[p]});
    });
  });
  pool = shuffle(pool, rnd);
  if(irregularFirst) pool.sort(function(a, b){ return (b.irr ? 1 : 0) - (a.irr ? 1 : 0); });
  return pool.slice(0, n).map(function(x){ return x.it; });
}

/* ---------------------------------------------------------------- speaking prompts */
/* everything with Spanish + English that makes a good "say it" prompt */
function speakPool(which){
  var out = [];
  if(!which || which === "survival") SURVIVAL.forEach(function(s){ out.push({es:s[1], en:s[2], src:"survival"}); });
  if(!which || which === "builders") BUILDERS.forEach(function(b){ b.ex.forEach(function(x){ out.push({es:x[0], en:x[1], src:"builders", hint:b.es}); }); });
  if(!which || which === "words") WORDS.forEach(function(w, i){ out.push({es:w[2], en:w[3], src:"words", wi:i}); });
  if(!which || which === "dialogues") DIALOGUES.forEach(function(d){ d.lines.forEach(function(l){ if(l[0] === "b") out.push({es:l[1], en:l[2], src:"dialogues"}); }); });
  return out;
}
/* today's speaking: sentences built on words already met, plus survival phrases */
function todaysSpeaking(n, rnd, all){
  var learned = learnedIndexes(all), pool = [];
  learned.forEach(function(i){ pool.push({es:WORDS[i][2], en:WORDS[i][3], src:"words", wi:i}); });
  SURVIVAL.forEach(function(s){ pool.push({es:s[1], en:s[2], src:"survival"}); });
  return pick(pool, n || 5, rnd);
}

/* ---------------------------------------------------------------- quizzes */
/* four-option question from a correct answer and a pool of wrong ones */
function mcq(q, answer, wrongPool, rnd, extra){
  var seen = {}; seen[fold(answer)] = 1;
  var wrong = shuffle(wrongPool, rnd).filter(function(w){ var k = fold(w); if(seen[k]) return false; seen[k] = 1; return true; }).slice(0, 3);
  var opts = shuffle([answer].concat(wrong), rnd);
  var o = {q:q, opts:opts, ans:opts.indexOf(answer)};
  if(extra) for(var k in extra) o[k] = extra[k];
  return o;
}
function wordQuiz(indexes, n, rnd){
  indexes = indexes && indexes.length >= 4 ? indexes : WORDS.map(function(_, i){ return i; });
  return pick(indexes, n, rnd).map(function(i, k){
    var w = WORDS[i], set = Math.floor(i / 10);
    var near = WORDS.filter(function(x, j){ return j !== i && Math.floor(j / 10) === set; });
    if((k % 3) === 2){
      return mcq("Listen. Which did you hear?", w[0], near.map(function(x){ return x[0]; }), rnd, {say:w[0], e:w[0] + " = " + w[1]});
    }
    return mcq("What does <b>" + esc(w[0]) + "</b> mean?", w[1], near.map(function(x){ return x[1]; }), rnd, {say:w[0], e:w[2] + " (" + w[3] + ")"});
  });
}
/* find a connector as a whole word inside its example (so "y" never matches inside "muy") */
function findWhole(text, part){
  var L = /[a-záéíóúüñ]/i, low = text.toLowerCase(), p = part.toLowerCase(), i = low.indexOf(p);
  while(i >= 0){
    var before = i === 0 ? "" : low.charAt(i - 1), after = low.charAt(i + p.length);
    if(!L.test(before) && !L.test(after)) return i;
    i = low.indexOf(p, i + 1);
  }
  return -1;
}
function connectorQuiz(n, rnd){
  var usable = CONNECTORS.filter(function(c){ return findWhole(c[3], c[1]) >= 0; });
  return pick(usable, n, rnd).map(function(c){
    var i = findWhole(c[3], c[1]);
    var blank = esc(c[3].slice(0, i)) + "<span class=\"blank\">_____</span>" + esc(c[3].slice(i + c[1].length));
    var others = CONNECTORS.filter(function(x){ return x[0] !== c[0]; }).map(function(x){ return x[1]; });
    return mcq(blank + "<span class=\"qen\">" + esc(c[4]) + "</span>", c[1], others, rnd, {e:c[1] + " = " + c[2] + (c[5] ? ". " + c[5] : ""), say:c[3]});
  });
}
function lessonQuiz(lessons, n, rnd){
  var all = [];
  lessons.forEach(function(l){ l.q.forEach(function(q){ all.push({q:q, l:l}); }); });
  return pick(all, n || all.length, rnd).map(function(x){
    return mcq(esc(x.q.q), x.q.a, x.q.w, rnd, {e:x.q.e, tag:x.l.title});
  });
}
function lessonByKey(k){ for(var i = 0; i < LESSONS.length; i++) if(LESSONS[i].k === k) return LESSONS[i]; return null; }

/* endless speaking prompts: a starter + any verb → "Necesito dormir." (Language Transfer style) */
var BUILD_GEN = [["Quiero","I want to"],["Necesito","I need to"],["Puedo","I can"],["No puedo","I can’t"],["Voy a","I’m going to"],
  ["Tengo que","I have to"],["Me gusta","I like to"],["Me gustaría","I would like to"],["Hay que","You have to"],["Intento","I try to"],["Suelo","I usually"]];
/* only verbs that make a whole sentence on their own ("Necesito dormir.", never "Necesito poner.") */
var BUILD_OK = ["ir", "venir", "salir", "volver", "dormir", "trabajar", "comer", "hablar", "leer", "escribir", "jugar", "empezar", "llegar", "entender", "ver"];
function buildPrompts(n, rnd){
  var vs = VERBS.filter(function(v){ return BUILD_OK.indexOf(v.inf) >= 0; }), out = [];
  for(var k = 0; k < (n || 8); k++){
    var b = BUILD_GEN[Math.floor((rnd || Math.random)() * BUILD_GEN.length)], v = vs[Math.floor((rnd || Math.random)() * vs.length)];
    out.push({es:b[0] + " " + v.inf + ".", en:b[1] + " " + v.e[0] + ".", hint:b[0] + "…"});
  }
  return out;
}

/* every line the app can say aloud, exactly as spoken: the list tools/record.py records */
function spokenLines(){
  var seen = {}, out = [];
  function add(x){ var t = speechText(x); if(t && !seen[t]){ seen[t] = 1; out.push(t); } }
  WORDS.forEach(function(w){ add(w[0]); add(w[2]); });
  SURVIVAL.forEach(function(s){ add(s[1]); });
  BUILDERS.forEach(function(b){ b.ex.forEach(function(x){ add(x[0]); }); });
  BUILD_GEN.forEach(function(b){ VERBS.forEach(function(v){ if(BUILD_OK.indexOf(v.inf) >= 0) add(b[0] + " " + v.inf + "."); }); });
  CONNECTORS.forEach(function(c){ add(c[3]); });
  DIALOGUES.forEach(function(d){ d.lines.forEach(function(l){ add(l[1]); }); });
  LESSONS.forEach(function(l){ l.ex.forEach(function(x){ add(x[0]); }); });
  PATTERNS.forEach(function(p){ if(!/-/.test(p.l)) add(p.l.replace(/ · /g, ", ")); });
  VERBS.forEach(function(v){
    add(v.inf);
    TENSES.forEach(function(t){ var f = conjugate(v, t.k); if(Array.isArray(f)) f.forEach(add); else if(f) add(f); });
  });
  GENDER_OTHER.forEach(add);
  return out;
}
