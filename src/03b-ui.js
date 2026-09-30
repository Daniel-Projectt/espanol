/* ---- the pure parts can be tested outside a browser ---- */
if(typeof window === "undefined"){
  module.exports = {WORDS:WORDS, WORD_SETS:WORD_SETS, VERBS:VERBS, TENSES:TENSES, VERB_GROUPS:VERB_GROUPS, PATTERNS:PATTERNS,
    SURVIVAL:SURVIVAL, SURVIVAL_GROUPS:SURVIVAL_GROUPS, BUILDERS:BUILDERS, CONNECTORS:CONNECTORS, CONNECTOR_GROUPS:CONNECTOR_GROUPS,
    DIALOGUES:DIALOGUES, LESSONS:LESSONS, DRILL_VERBS:DRILL_VERBS, TENSE_LADDER:TENSE_LADDER,
    conjugate:conjugate, irregularMask:irregularMask, isIrregularIn:isIrregularIn, verbByInf:verbByInf, englishFor:englishFor,
    fold:fold, words:words, checkTyped:checkTyped, speechText:speechText, audioKey:audioKey, spokenLines:spokenLines,
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
   Every Spanish line is recorded once with a natural ElevenLabs voice (tools/record.py) and
   shipped as a small mp3 in audio/, named by audioKey(text). Nothing is generated while she
   uses the app, so it costs nothing and works offline. A line without a recording falls
   back to the phone's own voice. No microphone anywhere: she speaks, then checks herself. */
var AUDIO_SET = {}, VOICES = typeof AUDIO_VOICES === "object" && AUDIO_VOICES ? AUDIO_VOICES : [];
(typeof AUDIO_KEYS === "string" ? AUDIO_KEYS : "").split(" ").forEach(function(k){ if(k) AUDIO_SET[k] = 1; });
var Speech = {
  rate: +load("rate", 0.9),
  voice: load("voice", VOICES.length ? VOICES[0].id : "phone-mx"),
  lang: "es-MX",
  voices: [],
  playing: null,
  pickVoice: function(){
    var vs = Speech.voices, lang = Speech.lang.toLowerCase(), fam = lang.slice(0, 2);
    var exact = vs.filter(function(v){ return v.lang.toLowerCase().replace("_", "-") === lang; });
    var region = lang === "es-mx" ? vs.filter(function(v){ return /^es[-_](us|419|mx|co|ar|cl|pe)/i.test(v.lang); }) : [];
    var any = vs.filter(function(v){ return v.lang.toLowerCase().indexOf(fam) === 0; });
    var list = exact.length ? exact : region.length ? region : any;
    list.sort(function(a, b){ return (/google|premium|enhanced|natural|paulina|m[oó]nica|sabina|jorge/i.test(b.name) ? 1 : 0) - (/google|premium|enhanced|natural|paulina|m[oó]nica|sabina|jorge/i.test(a.name) ? 1 : 0); });
    return list[0] || null;
  },
  canSpeak: function(){ return "speechSynthesis" in window; },
  recorded: function(){ return VOICES.some(function(v){ return v.id === Speech.voice; }); },
  setVoice: function(id){
    var v = VOICES.filter(function(x){ return x.id === id; })[0];
    if(!v && !/^phone-(mx|es)$/.test(id)) id = VOICES.length ? VOICES[0].id : "phone-mx";
    Speech.voice = id;
    Speech.lang = v ? v.lang : id === "phone-es" ? "es-ES" : "es-MX";
  },
  hasRecording: function(text){ return !!AUDIO_SET[audioKey(speechText(text))]; },
  stop: function(){
    if(Speech.playing){ try{ Speech.playing.pause(); }catch(e){} Speech.playing = null; }
    if(Speech.canSpeak()) try{ window.speechSynthesis.cancel(); }catch(e){}
  },
  say: function(text, slow){
    var t = speechText(text), k = audioKey(t);
    Speech.stop();
    if(AUDIO_SET[k] && Speech.recorded() && typeof window.Audio === "function"){
      try{
        var a = new window.Audio("audio/" + Speech.voice + "/" + k + ".mp3");
        a.playbackRate = (Speech.rate / 0.9) * (slow ? 0.75 : 1);
        a.preservesPitch = true;
        Speech.playing = a;
        var p = a.play();
        if(p && p.catch) p.catch(function(){ Speech.device(t, slow); });   /* offline and not cached yet */
        return;
      }catch(e){}
    }
    Speech.device(t, slow);
  },
  device: function(t, slow){
    if(!Speech.canSpeak()) return;
    try{
      var u = new window.SpeechSynthesisUtterance(t);
      var v = Speech.pickVoice();
      u.lang = v ? v.lang : Speech.lang;
      if(v) u.voice = v;
      u.rate = Speech.rate * (slow ? 0.72 : 1);
      window.speechSynthesis.speak(u);
    }catch(e){}
  }
};
Speech.setVoice(Speech.voice);
function loadVoices(){
  if(!Speech.canSpeak()) return;
  Speech.voices = window.speechSynthesis.getVoices() || [];
  var note = $("#voiceNote");
  if(note){
    var recorded = Speech.recorded() && Object.keys(AUDIO_SET).length > 0;
    if(!recorded && Speech.voices.length && !Speech.voices.some(function(v){ return /^es/i.test(v.lang); }))
      note.textContent = "This device has no Spanish voice installed yet. Add one in your phone’s settings (Accessibility → Spoken Content → Voices on iPhone; Text-to-speech on Android) and the app will use it.";
    else note.textContent = "";
  }
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
      '<div class="reveal-area" hidden><div class="answer-es">' + esc(it.es) + ' ' + sayBtn(it.es) + ' ' + sayBtn(it.es, "Hear it slowly").replace('data-say=', 'data-slow="1" data-say=') + '</div></div>' +
      '<div class="toolbar tight"><button class="btn show" type="button">Show the Spanish</button>' +
      '<button class="btn miss" type="button" hidden>Not yet</button><button class="btn primary gotit" type="button" hidden>I said it</button></div></div>';
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
