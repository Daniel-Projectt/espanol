/* ---- the pure parts can be tested outside a browser ---- */
if(typeof window === "undefined"){
  module.exports = {WORDS:WORDS, WORD_SETS:WORD_SETS, VERBS:VERBS, TENSES:TENSES, VERB_GROUPS:VERB_GROUPS, PATTERNS:PATTERNS,
    SURVIVAL:SURVIVAL, SURVIVAL_GROUPS:SURVIVAL_GROUPS, BUILDERS:BUILDERS, CONNECTORS:CONNECTORS, CONNECTOR_GROUPS:CONNECTOR_GROUPS,
    DIALOGUES:DIALOGUES, LESSONS:LESSONS, DRILL_VERBS:DRILL_VERBS, TENSE_LADDER:TENSE_LADDER,
    conjugate:conjugate, irregularMask:irregularMask, isIrregularIn:isIrregularIn, verbByInf:verbByInf, englishFor:englishFor,
    fold:fold, words:words, speechScore:speechScore, bestScore:bestScore, checkTyped:checkTyped, PASS:PASS,
    srsGrade:srsGrade, srsIntroduce:srsIntroduce, genderize:genderize, srsDue:srsDue, srsAll:srsAll, learnedIndexes:learnedIndexes, cardDirection:cardDirection,
    todaysNew:todaysNew, markDone:markDone, dayLog:dayLog, streak:streak, verbOfDay:verbOfDay, startDay:startDay, save:save, load:load,
    drillItem:drillItem, drillSet:drillSet, speakPool:speakPool, todaysSpeaking:todaysSpeaking, buildPrompts:buildPrompts,
    mcq:mcq, wordQuiz:wordQuiz, connectorQuiz:connectorQuiz, lessonQuiz:lessonQuiz, findWhole:findWhole, lessonByKey:lessonByKey,
    memory:memory};
  return;
}

/* ================================================================ DOM helpers */
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
var CORNERS = '<svg class="c tl"><use href="#corner"/></svg><svg class="c tr"><use href="#corner"/></svg><svg class="c bl"><use href="#corner"/></svg><svg class="c br"><use href="#corner"/></svg>';
function divider(){ return '<div class="divider"><span>&#9670;</span></div>'; }
function sayBtn(text, label){
  return '<button class="spk" type="button" data-say="' + esc(text) + '" aria-label="' + (label || "Hear it") + '"><svg width="20" height="20"><use href="#i-say"/></svg></button>';
}
function es(text){ return '<span class="es">' + esc(text) + '</span>'; }

/* ================================================================ SPEECH
   Text-to-speech and speech recognition are built into phones: no server, no key.
   Recognition works in Chrome (Android, desktop) and Safari (iPhone); where it doesn't,
   every exercise falls back to "say it, then check yourself".                            */
var Speech = {
  rate: +load("rate", 0.9),
  lang: load("lang", "es-MX"),
  voices: [],
  pickVoice: function(){
    var vs = Speech.voices, lang = Speech.lang.toLowerCase(), fam = lang.slice(0, 2);
    var exact = vs.filter(function(v){ return v.lang.toLowerCase().replace("_", "-") === lang; });
    var region = lang === "es-mx" ? vs.filter(function(v){ return /^es[-_](us|419|mx|co|ar|cl|pe)/i.test(v.lang); }) : [];
    var any = vs.filter(function(v){ return v.lang.toLowerCase().indexOf(fam) === 0; });
    var list = exact.length ? exact : region.length ? region : any;
    /* prefer the nicer voices when a device has several */
    list.sort(function(a, b){ return (/google|premium|enhanced|natural|paulina|m[oó]nica|sabina|jorge/i.test(b.name) ? 1 : 0) - (/google|premium|enhanced|natural|paulina|m[oó]nica|sabina|jorge/i.test(a.name) ? 1 : 0); });
    return list[0] || null;
  },
  canSpeak: function(){ return "speechSynthesis" in window; },
  canListen: function(){ return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },
  clean: function(t){ return String(t).replace(/—/g, " ").replace(/…-ando/g, "…").replace(/\s\/\s/g, ", ").replace(/[“”]/g, ""); },
  say: function(text, slow){
    if(!Speech.canSpeak()) return;
    try{
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(Speech.clean(text));
      var v = Speech.pickVoice();
      u.lang = v ? v.lang : Speech.lang;
      if(v) u.voice = v;
      u.rate = Speech.rate * (slow ? 0.72 : 1);
      window.speechSynthesis.speak(u);
    }catch(e){}
  },
  listening: null,
  listen: function(done){
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ done(null, "unsupported"); return; }
    if(Speech.listening){ try{ Speech.listening.abort(); }catch(e){} }
    var r = new SR(), got = false;
    r.lang = Speech.lang; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
    r.onresult = function(ev){
      got = true;
      var res = ev.results[0], alts = [];
      for(var i = 0; i < res.length; i++) alts.push(res[i].transcript);
      done(alts);
    };
    r.onerror = function(ev){ if(!got){ got = true; done(null, ev.error || "error"); } };
    r.onend = function(){ Speech.listening = null; if(!got){ got = true; done([], "nothing"); } };
    Speech.listening = r;
    try{ if(Speech.canSpeak()) window.speechSynthesis.cancel(); r.start(); }catch(e){ got = true; done(null, "error"); }
  }
};
function loadVoices(){
  if(!Speech.canSpeak()) return;
  Speech.voices = window.speechSynthesis.getVoices() || [];
  var note = $("#voiceNote");
  if(note){
    if(!Speech.voices.length) note.textContent = "";
    else if(!Speech.voices.some(function(v){ return /^es/i.test(v.lang); }))
      note.textContent = "This device has no Spanish voice installed yet. Add one in your phone’s settings (Accessibility → Spoken Content → Voices on iPhone; Text-to-speech on Android) and the app will use it.";
    else note.textContent = "";
  }
}

/* the microphone check: say it, see which words came through */
function micCheck(box, target, onPass){
  if(!Speech.canListen()){ box.innerHTML = ""; return; }
  box.innerHTML = '<button class="btn mic" type="button"><svg width="16" height="16"><use href="#i-mic"/></svg> Say it</button><div class="heard" aria-live="polite"></div>';
  var btn = $(".mic", box), out = $(".heard", box);
  btn.addEventListener("click", function(){
    btn.classList.add("on"); btn.disabled = true; out.innerHTML = '<span class="listening">Listening…</span>';
    Speech.listen(function(alts, err){
      btn.classList.remove("on"); btn.disabled = false;
      if(!alts){
        out.innerHTML = '<span class="miss">' + (err === "not-allowed" || err === "service-not-allowed" ? "The microphone is blocked. Allow it for this site, or say it aloud and check yourself." : "The microphone isn’t working here. Say it aloud and check yourself.") + '</span>';
        return;
      }
      if(!alts.length){ out.innerHTML = '<span class="miss">I didn’t catch that. Tap and try again.</span>'; return; }
      var s = bestScore(alts, target), tw = target.replace(/[¿¡]/g, "").split(/\s+/).filter(function(w){ return words(w).length; });
      var marked = tw.map(function(w, i){ return '<span class="' + (s.marks[i] ? "hit" : "gap") + '">' + esc(w) + '</span>'; }).join(" ");
      var pass = s.ratio >= PASS;
      out.innerHTML = '<div class="hv ' + (pass ? "ok" : "no") + '">' + (pass ? "Muy bien." : s.ratio >= 0.5 ? "Close. The faded words didn’t come through." : "Not this one. Listen and try again.") + '</div>' +
        '<div class="marked">' + marked + '</div><div class="said">I heard: “' + esc(s.heard) + '”</div>';
      if(pass && onPass) onPass();
    });
  });
}

/* ================================================================ widgets */
/* a multiple-choice quiz; getQs() returns [{q, opts, ans, e, say?, tag?}] */
function makeQuiz(root, getQs, onFinish){
  var qs = [], i = 0, score = 0, answered = false, missed = [];
  function start(){ qs = getQs(); i = 0; score = 0; missed = []; show(); }
  function show(){
    answered = false;
    if(i >= qs.length){ finish(); return; }
    var q = qs[i];
    root.innerHTML = '<div class="quizWrap"><div class="qcard card-corners">' + CORNERS +
      '<div class="qnum">Question ' + (i + 1) + ' of ' + qs.length + (q.tag ? ' · <span class="qtag">' + esc(q.tag) + '</span>' : '') + '</div>' +
      '<div class="qtext">' + q.q + (q.say && /Listen/.test(q.q) ? ' ' + sayBtn(q.say) : '') + '</div>' +
      '<div class="opts">' + q.opts.map(function(o, k){ return '<button class="opt" type="button" data-k="' + k + '"><span class="k">' + (k + 1) + '</span>' + esc(o) + '</button>'; }).join("") + '</div>' +
      '<div class="feedback" aria-live="polite"></div>' +
      '<div class="qfoot"><button class="btn primary next" type="button" hidden>Next &rsaquo;</button></div></div></div>';
    if(q.say && /Listen/.test(q.q)) Speech.say(q.say);
    $$(".opt", root).forEach(function(b){ b.addEventListener("click", function(){ choose(+b.getAttribute("data-k")); }); });
    $(".next", root).addEventListener("click", function(){ i++; show(); });
  }
  function choose(k){
    if(answered) return; answered = true;
    var q = qs[i], ok = k === q.ans, opts = $$(".opt", root);
    opts.forEach(function(b, n){ b.disabled = true; if(n === q.ans) b.classList.add("correct"); if(n === k && !ok) b.classList.add("wrong"); });
    if(ok) score++; else missed.push(q);
    $(".feedback", root).innerHTML = (ok ? "<b>Right.</b> " : "<b>Not this one.</b> ") + esc(q.e || "") + (q.say ? " " + sayBtn(q.say) : "");
    $(".next", root).hidden = false; $(".next", root).focus();
  }
  function finish(){
    var pct = Math.round(score / Math.max(1, qs.length) * 100);
    root.innerHTML = '<div class="result card-corners">' + CORNERS + '<div class="big">' + score + ' / ' + qs.length + '</div>' +
      '<div class="rsub">' + (pct >= 90 ? "Excelente." : pct >= 70 ? "Muy bien. Look over the ones you missed." : "Keep going: each round sticks a little more.") + '</div>' +
      (missed.length ? '<div class="misslist">' + missed.map(function(q){ return '<div><span class="g">' + q.q.replace(/<span class="qen">.*<\/span>/, "") + '</span><span class="t"><b>' + esc(q.opts[q.ans]) + '</b>: ' + esc(q.e || "") + '</span></div>'; }).join("") + '</div>' : '') +
      '<div class="toolbar"><button class="btn primary again" type="button">New round</button></div></div>';
    $(".again", root).addEventListener("click", start);
    if(onFinish) onFinish(score, qs.length);
  }
  return {start:start, keys:function(e){
    if(!qs.length || i >= qs.length) return false;
    if(!answered && /^[1-4]$/.test(e.key)){ choose(+e.key - 1); return true; }
    if(answered && e.key === "Enter"){ i++; show(); return true; }
    return false;
  }};
}

/* "say it": English in, Spanish out loud, then check */
function makeSayRunner(root, getItems, onFinish){
  var items = [], i = 0, got = 0, revealed = false;
  function start(){ items = getItems(); i = 0; got = 0; show(); }
  function show(){
    revealed = false;
    if(!items.length){ root.innerHTML = '<p class="empty">Nothing here yet. Learn a few words on the Today tab first.</p>'; return; }
    if(i >= items.length){ finish(); return; }
    var it = items[i];
    root.innerHTML = '<div class="say card-corners">' + CORNERS +
      '<div class="qnum">' + (i + 1) + ' of ' + items.length + '</div>' +
      '<p class="prompt-lab">Say in Spanish</p><div class="prompt">' + esc(it.en) + '</div>' +
      (it.hint ? '<div class="phint">Start with: <i>' + esc(it.hint) + '</i></div>' : '') +
      '<div class="micbox"></div>' +
      '<div class="reveal-area" hidden><div class="answer-es">' + esc(it.es) + ' ' + sayBtn(it.es) + ' ' + sayBtn(it.es, "Hear it slowly").replace('data-say=', 'data-slow="1" data-say=') + '</div></div>' +
      '<div class="toolbar tight"><button class="btn show" type="button">Show the Spanish</button>' +
      '<button class="btn miss" type="button" hidden>Not yet</button><button class="btn primary gotit" type="button" hidden>I said it</button></div></div>';
    micCheck($(".micbox", root), it.es, function(){ reveal(); });
    $(".show", root).addEventListener("click", reveal);
    $(".gotit", root).addEventListener("click", function(){ got++; i++; show(); });
    $(".miss", root).addEventListener("click", function(){ items.push(items[i]); i++; show(); });
  }
  function reveal(){
    if(revealed) return; revealed = true;
    $(".reveal-area", root).hidden = false; $(".show", root).hidden = true;
    $(".gotit", root).hidden = false; $(".miss", root).hidden = false;
    Speech.say(items[i].es);
  }
  function finish(){
    root.innerHTML = '<div class="result card-corners">' + CORNERS + '<div class="big">¡Listo!</div><div class="rsub">You said ' + got + ' sentence' + (got === 1 ? "" : "s") + ' out loud.</div>' +
      '<div class="toolbar"><button class="btn primary again" type="button">Another round</button></div></div>';
    $(".again", root).addEventListener("click", start);
    if(onFinish) onFinish();
  }
  return {start:start, keys:function(e){
    if(i >= items.length) return false;
    if(e.key === " " && !revealed){ reveal(); return true; }
    if(e.key === "Enter" && revealed){ got++; i++; show(); return true; }
    return false;
  }};
}

/* flashcards (the Greek sheet's flip card) */
function makeCards(root){
  root.innerHTML = '<div class="flashWrap"><div class="flash"><div class="flashInner">' +
    '<div class="face front card-corners">' + CORNERS + '<div class="fc"></div></div>' +
    '<div class="face back card-corners">' + CORNERS + '<div class="fc"></div></div>' +
    '</div></div><div class="progress"><i style="width:0"></i></div><p class="counter"></p>' +
    '<div class="toolbar tight"><button class="btn prev" type="button">&lsaquo; Prev</button><button class="btn primary flip" type="button">Flip</button><button class="btn next" type="button">Next &rsaquo;</button></div></div>';
  var deck = [], idx = 0, flash = $(".flash", root);
  function render(){
    if(!deck.length) return;
    var d = deck[idx];
    $(".face.front .fc", root).innerHTML = d.front; $(".face.back .fc", root).innerHTML = d.back;
    $(".counter", root).textContent = (idx + 1) + " of " + deck.length;
    $(".progress i", root).style.width = ((idx + 1) / deck.length * 100) + "%";
  }
  function unflip(){ if(!flash.classList.contains("flipped")) return; flash.classList.add("noanim"); flash.classList.remove("flipped"); void flash.offsetWidth; flash.classList.remove("noanim"); }
  function go(s){ unflip(); idx = (idx + s + deck.length) % deck.length; render(); }
  flash.addEventListener("click", function(e){ if(e.target.closest("[data-say]")) return; flash.classList.toggle("flipped"); });
  $(".flip", root).addEventListener("click", function(){ flash.classList.toggle("flipped"); });
  $(".next", root).addEventListener("click", function(){ go(1); });
  $(".prev", root).addEventListener("click", function(){ go(-1); });
  return {load:function(d){ deck = d; idx = 0; unflip(); render(); }, keys:function(e){
    if(e.key === "ArrowRight"){ go(1); return true; }
    if(e.key === "ArrowLeft"){ go(-1); return true; }
    if(e.key === " "){ flash.classList.toggle("flipped"); return true; }
    return false;
  }};
}
function wordCard(i){
  var w = WORDS[i];
  return {front:'<div class="big es">' + esc(w[0]) + '</div>' + sayBtn(w[0]) + '<div class="hint">Day ' + (Math.floor(i / 10) + 1) + '</div>',
          back:'<div class="mid">' + esc(w[1]) + '</div><div class="bsound"><span class="es">' + esc(w[2]) + '</span> ' + sayBtn(w[2]) + '<br><i>' + esc(w[3]) + '</i></div>'};
}
