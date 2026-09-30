/* ================================================================ VIEWS */
var keyHandler = null;           /* the widget that owns the keyboard right now */
function setKeys(w){ keyHandler = w || null; }
function segWire(seg, attr, fn){
  if(!seg) return;
  seg.addEventListener("click", function(e){
    var b = e.target.closest ? e.target.closest("button[" + attr + "]") : null;
    if(!b) return;
    $$("button", seg).forEach(function(x){ x.setAttribute("aria-pressed", String(x === b)); });
    fn(b.getAttribute(attr));
  });
}
function pressed(seg, attr){ var b = seg && seg.querySelector('button[aria-pressed="true"]'); return b ? b.getAttribute(attr) : null; }

/* ================================================================ TODAY */
var STEPS = [
  {k:"review", n:"Review",          why:"Words come back just before you’d forget them. Some ask you to say the Spanish."},
  {k:"new",    n:"New words",       why:"A few new words, each with a sentence to hear and repeat."},
  {k:"speak",  n:"Speak",           why:"Five sentences from English into Spanish, out loud. This is where words become speech."},
  {k:"verb",   n:"Verb of the day", why:"One important verb in one tense. The irregular ones come first."}
];
function renderToday(){
  var root = $("#todayRoot"), today = dayNumber(), log = dayLog(today), all = srsAll();
  startDay();
  var due = srsDue(today, all).length, fresh = todaysNew(today, all), vod = verbOfDay(today);
  var dayN = today - startDay() + 1, st = streak(today), doneN = STEPS.filter(function(s){ return log[s.k]; }).length;
  var status = {
    review: due ? due + " card" + (due === 1 ? "" : "s") + " waiting" : (learnedIndexes(all).length ? "Nothing due. Well done." : "Starts tomorrow, once you’ve met some words."),
    "new": fresh.length ? fresh.map(function(i){ return WORDS[i][0]; }).join(" · ") : "You’ve met all 270 words.",
    speak: "5 sentences",
    verb: '<span class="es">' + esc(vod.verb.inf) + '</span> · ' + tenseName(vod.tense)
  };
  root.innerHTML =
    '<div class="dayhead card-corners">' + CORNERS +
      '<div class="dn">Día ' + dayN + '</div>' +
      '<div class="dmeta">' + (st ? st + '-day streak' : 'Start your streak today') + ' · ' + learnedIndexes(all).length + ' words met</div>' +
      '<div class="gprog"><div class="bar"><i style="width:' + (doneN / STEPS.length * 100) + '%"></i></div></div>' +
    '</div>' +
    (doneN === STEPS.length ? '<p class="alldone">Día completo. ¡Muy bien! Come back tomorrow; a little each day is what works.</p>' : '') +
    '<ol class="steps">' + STEPS.map(function(s, n){
      var off = (s.k === "review" && !due) || (s.k === "new" && !fresh.length);
      return '<li class="step' + (log[s.k] ? " done" : "") + '"><div class="sn">' + (log[s.k] ? "&#10003;" : n + 1) + '</div>' +
        '<div class="sb"><div class="st">' + s.n + '</div><div class="ss">' + status[s.k] + '</div><div class="sw">' + s.why + '</div></div>' +
        '<button class="btn' + (log[s.k] || off ? "" : " primary") + '" type="button" data-step="' + s.k + '"' + (off ? " disabled" : "") + '>' + (log[s.k] ? "Again" : "Start") + '</button></li>';
    }).join("") + '</ol>' +
    '<div id="stepRoot"></div>' +
    '<p class="more">More time? Try a <a href="#" data-go="speak/talk">conversation</a>, the <a href="#" data-go="speak/shadow">echo drill</a>, or a <a href="#" data-go="grammar">grammar lesson</a>.</p>';
  $$("[data-step]", root).forEach(function(b){ b.addEventListener("click", function(){ runStep(b.getAttribute("data-step")); }); });
}
function tenseName(k){ for(var i = 0; i < TENSES.length; i++) if(TENSES[i].k === k) return TENSES[i].name; return k; }
function stepDone(k){
  markDone(k);
  var box = $("#stepRoot"), y = window.scrollY;
  renderToday();
  if(box) $("#stepRoot").replaceWith(box);
  window.scrollTo(0, y);
}
function runStep(k){
  var box = $("#stepRoot"); box.innerHTML = ""; box.className = "stepbox";
  if(k === "review") reviewRunner(box, function(){ stepDone("review"); });
  if(k === "new") newWordsRunner(box, function(){ stepDone("new"); });
  if(k === "speak"){ var r = makeSayRunner(box, function(){ return todaysSpeaking(5); }, function(){ stepDone("speak"); }); r.start(); setKeys(r); }
  if(k === "verb") verbOfDayRunner(box, function(){ stepDone("verb"); });
  box.scrollIntoView && box.scrollIntoView({behavior:"smooth", block:"start"});
}

/* spaced review: recognize (Spanish → meaning) or produce (English → say the Spanish) */
function reviewRunner(box, done){
  var queue = srsDue(), all = srsAll(), seen = {}, n = 0, total = queue.length;
  function show(){
    if(!queue.length){
      box.innerHTML = '<div class="result card-corners">' + CORNERS + '<div class="big">¡Listo!</div><div class="rsub">' + n + ' review' + (n === 1 ? "" : "s") + ' done.</div></div>';
      setKeys(null); done(); return;
    }
    var id = queue[0], i = +id.slice(1), w = WORDS[i], dir = cardDirection(all[id]);
    box.innerHTML = '<div class="say card-corners">' + CORNERS + '<div class="qnum">' + (total - queue.length + 1) + ' of ' + total + '</div>' +
      (dir === "recognize"
        ? '<p class="prompt-lab">What does it mean?</p><div class="prompt es">' + esc(w[0]) + ' ' + sayBtn(w[0]) + '</div>'
        : '<p class="prompt-lab">Say in Spanish, out loud</p><div class="prompt">' + esc(w[1]) + '</div>') +
      '<div class="reveal-area" hidden><div class="answer-es">' + (dir === "recognize" ? esc(w[1]) : esc(w[0]) + ' ' + sayBtn(w[0])) + '</div>' +
      '<div class="exline"><span class="es">' + esc(w[2]) + '</span> ' + sayBtn(w[2]) + '<br><i>' + esc(w[3]) + '</i></div></div>' +
      '<div class="toolbar tight"><button class="btn primary show" type="button">Show</button>' +
      '<span class="grades" hidden><button class="btn g0" type="button">Again</button><button class="btn primary g1" type="button">Got it</button><button class="btn g2" type="button">Easy</button></span></div></div>';
    if(dir === "recognize") Speech.say(w[0]);
    $(".show", box).addEventListener("click", reveal);
    [0, 1, 2].forEach(function(g){ $(".g" + g, box).addEventListener("click", function(){ grade(g); }); });
  }
  function reveal(){
    $(".reveal-area", box).hidden = false; $(".show", box).hidden = true; $(".grades", box).hidden = false;
    var i = +queue[0].slice(1); if(cardDirection(all[queue[0]]) === "produce") Speech.say(WORDS[i][0]);
  }
  function grade(g){
    var id = queue.shift();
    if(g === 0){ srsGrade(id, 0, undefined, all); seen[id] = 1; queue.push(id); total++; }
    else { srsGrade(id, seen[id] ? 1 : g, undefined, all); n++; }
    show();
  }
  setKeys({keys:function(e){
    var g = $(".grades", box);
    if(!g) return false;
    if(g.hidden && (e.key === " " || e.key === "Enter")){ reveal(); return true; }
    if(!g.hidden && /^[123]$/.test(e.key)){ grade(+e.key - 1); return true; }
    return false;
  }});
  show();
}

/* meet today's words: hear, read, repeat; then they join the review */
function newWordsRunner(box, done){
  var ids = todaysNew(), k = 0;
  function show(){
    if(k >= ids.length){
      var all = srsAll(); ids.forEach(function(i){ srsIntroduce(wordId(i), undefined, all); });
      box.innerHTML = '<div class="result card-corners">' + CORNERS + '<div class="big">' + ids.length + ' new words</div><div class="rsub">They’ll come back tomorrow. Next time, you’ll be asked to say them.</div>' +
        '<div class="toolbar"><button class="btn primary" type="button" data-step2="speak">Now speak with them</button></div></div>';
      $("[data-step2]", box).addEventListener("click", function(){ runStep("speak"); });
      setKeys(null); done(); return;
    }
    var w = WORDS[ids[k]];
    box.innerHTML = '<div class="say meet card-corners">' + CORNERS + '<div class="qnum">' + (k + 1) + ' of ' + ids.length + ' · ' + esc(WORD_SETS[Math.floor(ids[k] / 10)]) + '</div>' +
      '<div class="prompt es">' + esc(w[0]) + ' ' + sayBtn(w[0]) + '</div><div class="meaning">' + esc(w[1]) + '</div>' +
      '<div class="exline"><span class="es">' + esc(w[2]) + '</span> ' + sayBtn(w[2]) + '<br><i>' + esc(w[3]) + '</i></div>' +
      '<p class="prompt-lab">Now say the sentence out loud</p>' +
      '<div class="toolbar tight"><button class="btn back" type="button"' + (k ? "" : " disabled") + '>&lsaquo; Back</button><button class="btn primary next" type="button">Next &rsaquo;</button></div></div>';
    Speech.say(w[0]);
    $(".next", box).addEventListener("click", function(){ k++; show(); });
    $(".back", box).addEventListener("click", function(){ if(k){ k--; show(); } });
  }
  setKeys({keys:function(e){ if(e.key === "Enter" || e.key === "ArrowRight"){ k++; show(); return true; } return false; }});
  show();
}

/* the verb of the day: see the table, then say/type each form */
function verbOfDayRunner(box, done){
  var vod = verbOfDay(), v = vod.verb, t = vod.tense;
  box.innerHTML = '<div class="vod">' + verbTableHTML(v, t) + '<div class="toolbar"><button class="btn primary go" type="button">I’ve read it: drill me</button></div></div>';
  $(".go", box).addEventListener("click", function(){
    var items = t === "cmd" ? [drillItem(v, "cmd", -1)] : [0, 1, 2, 3, 4].map(function(p){ return drillItem(v, t, p); });
    runDrill(box, shuffle(items), done);
  });
}

/* ================================================================ VERB DRILL (shared) */
function runDrill(box, items, done){
  var i = 0, right = 0, checked = false, misses = [];
  function show(){
    checked = false;
    if(i >= items.length){
      box.innerHTML = '<div class="result card-corners">' + CORNERS + '<div class="big">' + right + ' / ' + items.length + '</div>' +
        '<div class="rsub">' + (right === items.length ? "Every form right." : "Look at the ones you missed; they’re the ones to say a few more times.") + '</div>' +
        (misses.length ? '<div class="misslist">' + misses.map(function(m){ return '<div><span class="g">' + esc(m.en) + '</span><span class="t"><b class="es">' + esc(m.answer) + '</b> (' + esc(m.v.inf) + ', ' + esc(tenseName(m.tense)) + ')</span></div>'; }).join("") + '</div>' : '') + '</div>';
      setKeys(null); if(done) done(right, items.length); return;
    }
    var it = items[i];
    box.innerHTML = '<div class="say drill card-corners">' + CORNERS + '<div class="qnum">' + (i + 1) + ' of ' + items.length + '</div>' +
      '<div class="dv"><span class="es">' + esc(it.v.inf) + '</span> · ' + esc(tenseName(it.tense)) + (it.p >= 0 ? ' · <b>' + esc(PERSONS[it.p]) + '</b>' : ' · <b>tú</b>') + '</div>' +
      '<div class="prompt">' + esc(it.en) + '</div>' +
      '<input class="answer" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" lang="es" aria-label="Your answer" placeholder="type the Spanish">' +
      '<div class="keys" aria-label="Accents">' + ["á","é","í","ó","ú","ñ","ü"].map(function(c){ return '<button type="button" class="ins" data-c="' + c + '">' + c + '</button>'; }).join("") + '</div>' +
      '<div class="feedback" aria-live="polite"></div>' +
      '<div class="toolbar tight"><button class="btn primary check" type="button">Check</button><button class="btn primary next" type="button" hidden>Next &rsaquo;</button></div></div>';
    var inp = $(".answer", box);
    $$(".ins", box).forEach(function(b){ b.addEventListener("click", function(){ var s = inp.selectionStart || inp.value.length; inp.value = inp.value.slice(0, s) + b.getAttribute("data-c") + inp.value.slice(inp.selectionEnd || s); inp.focus(); inp.setSelectionRange(s + 1, s + 1); }); });
    $(".check", box).addEventListener("click", check);
    $(".next", box).addEventListener("click", function(){ i++; show(); });
    inp.addEventListener("keydown", function(e){ if(e.key === "Enter"){ e.preventDefault(); e.stopPropagation(); if(checked){ i++; show(); } else check(); } });
    try{ inp.focus({preventScroll:true}); }catch(e){}
  }
  function check(){
    if(checked) return;
    var it = items[i], inp = $(".answer", box), r = checkTyped(inp.value, it.answer), fb = $(".feedback", box);
    if(r === "empty"){ fb.innerHTML = "Type it first."; return; }
    checked = true;
    if(r === "right" || r === "accent"){ right++; inp.classList.add("ok"); fb.innerHTML = "<b>Right.</b> " + (r === "accent" ? "Watch the accent: " : "") + '<span class="es">' + esc(it.answer) + '</span> ' + sayBtn(it.answer); }
    else { misses.push(it); inp.classList.add("bad"); fb.innerHTML = "<b>Not this one.</b> It’s " + '<span class="es">' + esc(it.answer) + '</span> ' + sayBtn(it.answer) + '<span class="why">' + esc(it.v.why) + '</span>'; }
    Speech.say(it.answer);
    $(".check", box).hidden = true; $(".next", box).hidden = false; $(".next", box).focus();
  }
  setKeys({keys:function(e){ if(checked && e.key === "Enter"){ i++; show(); return true; } return false; }});
  show();
}

/* ================================================================ VERBS TAB */
function verbTableHTML(v, t){
  var forms = conjugate(v, t), mask = irregularMask(v, t), T = TENSES.filter(function(x){ return x.k === t; })[0];
  var rows;
  if(t === "cmd") rows = forms ? '<tr><td class="pn">tú</td><td class="' + (mask ? "irr" : "") + '"><span class="es">¡' + esc(forms) + '!</span> ' + sayBtn(forms) + '</td><td class="en">' + esc(englishFor(v, t, 1)) + '</td></tr>'
    : '<tr><td colspan="3" class="en">No command form in everyday use.</td></tr>';
  else rows = forms.map(function(f, p){ return '<tr><td class="pn">' + esc(PERSONS[p]) + '</td><td class="' + (mask[p] ? "irr" : "") + '"><span class="es">' + esc(f) + '</span> ' + sayBtn(f) + '</td><td class="en">' + esc(englishFor(v, t, p)) + '</td></tr>'; }).join("");
  return '<div class="vcard card-corners">' + CORNERS +
    '<div class="vh"><span class="es vinf">' + esc(v.inf) + '</span> ' + sayBtn(v.inf) + '<span class="ven">' + esc(v.en) + '</span></div>' +
    '<p class="vwhy">' + esc(v.why) + '</p>' +
    '<div class="vt">' + esc(T.name) + ' <span class="ves">' + esc(T.es) + '</span></div><p class="vuse">' + esc(T.use) + '</p>' +
    '<div class="tblwrap"><table class="tbl conj">' + rows + '</table></div>' +
    '<p class="vkey"><span class="irr-dot"></span> breaks the regular pattern: learn it as a word</p></div>';
}
function renderVerbTables(){
  var root = $("#verbTables");
  var opts = VERB_GROUPS.map(function(g){ return '<optgroup label="' + esc(g.name) + '">' + VERBS.filter(function(v){ return v.group === g.k; }).map(function(v){ return '<option value="' + esc(v.inf) + '">' + esc(v.inf) + ' · ' + esc(v.en) + '</option>'; }).join("") + '</optgroup>'; }).join("");
  root.innerHTML = '<div class="toolbar"><span class="label">Verb</span><select class="pick" id="vtVerb">' + opts + '</select></div>' +
    '<div class="toolbar"><div class="seg" id="vtTense">' + TENSES.map(function(t, n){ return '<button type="button" data-t="' + t.k + '" aria-pressed="' + (n === 0) + '">' + esc(t.name) + '</button>'; }).join("") + '</div></div>' +
    '<div id="vtOut"></div><div id="vtAll"></div>';
  var sel = $("#vtVerb"), seg = $("#vtTense");
  sel.value = load("vt.verb", "ir");
  var t0 = load("vt.tense", "pres");
  $$("button", seg).forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-t") === t0)); });
  function draw(){
    var v = verbByInf(sel.value), t = pressed(seg, "data-t") || "pres";
    save("vt.verb", v.inf); save("vt.tense", t);
    $("#vtOut").innerHTML = verbTableHTML(v, t);
    $("#vtAll").innerHTML = '<details class="glance"><summary>All tenses of ' + esc(v.inf) + ' at a glance</summary><div class="tblwrap"><table class="tbl glance-t"><tr><th></th>' +
      PERSONS_SHORT.map(function(p){ return '<th>' + p + '</th>'; }).join("") + '</tr>' +
      TENSES.filter(function(t){ return t.k !== "cmd"; }).map(function(t){ var f = conjugate(v, t.k), m = irregularMask(v, t.k); return '<tr><td class="pn">' + esc(t.name) + '</td>' + f.map(function(x, p){ return '<td class="es' + (m[p] ? " irr" : "") + '">' + esc(x) + '</td>'; }).join("") + '</tr>'; }).join("") +
      '</table></div><p class="vkey">Gerund <span class="es">' + esc(gerund(v)) + '</span> · participle <span class="es">' + esc(participle(v)) + '</span>' + (conjugate(v, "cmd") ? ' · tú command <span class="es">' + esc(conjugate(v, "cmd")) + '</span>' : '') + '</p></details>';
  }
  sel.addEventListener("change", draw);
  segWire(seg, "data-t", draw);
  draw();
}
function renderVerbDrill(){
  var root = $("#verbDrill");
  root.innerHTML = '<div class="setup">' +
    '<div class="row"><span class="label">Verbs</span><div class="seg" id="vdG">' +
      '<button type="button" data-g="big" aria-pressed="true">Big irregulars</button><button type="button" data-g="go" aria-pressed="false">Odd yo</button><button type="button" data-g="stem" aria-pressed="false">Stem changers</button><button type="button" data-g="all" aria-pressed="false">All</button></div></div>' +
    '<div class="row"><span class="label">Tenses</span><div class="chips tchips">' + TENSES.map(function(t){ return '<label class="chip"><input type="checkbox" value="' + t.k + '"' + (t.k === "pres" || t.k === "pret" ? " checked" : "") + '> ' + esc(t.name) + '</label>'; }).join("") + '</div></div>' +
    '<div class="row"><label class="chip"><input type="checkbox" id="vdIrr" checked> Irregular forms first</label></div>' +
    '<div class="row"><button class="btn primary" type="button" id="vdGo">Start 10 forms</button></div></div><div id="vdBox"></div>';
  segWire($("#vdG"), "data-g", function(){});
  $("#vdGo").addEventListener("click", function(){
    var g = pressed($("#vdG"), "data-g"), ts = $$(".tchips input:checked", root).map(function(x){ return x.value; });
    if(!ts.length) ts = ["pres"];
    var vs = DRILL_VERBS.filter(function(v){ return g === "all" || v.group === g; });
    runDrill($("#vdBox"), drillSet(vs, ts, 10, null, $("#vdIrr").checked));
  });
}
function renderPatterns(){
  $("#verbPatterns").innerHTML =
    '<div class="rules">' + PATTERNS.map(function(p){ return '<div class="rule"><h4>' + esc(p.t) + '</h4><p class="ex es">' + esc(p.l) + (/-/.test(p.l) ? '' : ' ' + sayBtn(p.l.replace(/ · /g, ", "))) + '</p><p>' + esc(p.x) + '</p></div>'; }).join("") + '</div>' + divider() +
    VERB_GROUPS.map(function(g){ return '<div class="gsec"><h2>' + esc(g.name) + '</h2><p class="note">' + esc(g.note) + '</p><div class="chips">' +
      VERBS.filter(function(v){ return v.group === g.k; }).map(function(v){ return '<button class="chip vlink" type="button" data-v="' + esc(v.inf) + '"><span class="es">' + esc(v.inf) + '</span> <span class="tl">' + esc(v.en) + '</span></button>'; }).join("") + '</div></div>'; }).join("");
  $$(".vlink", $("#verbPatterns")).forEach(function(b){ b.addEventListener("click", function(){ save("vt.verb", b.getAttribute("data-v")); showTopic("verbs"); showMode("verbs", "tables"); renderVerbTables(); }); });
}

/* ================================================================ SPEAK TAB */
var sayRunner = null;
function renderSay(){
  var seg = $("#sayFrom");
  function items(){
    var f = pressed(seg, "data-from") || "mine";
    if(f === "mine") return todaysSpeaking(8).concat([]);
    if(f === "builders") return pick(speakPool("builders"), 5).concat(buildPrompts(5));
    return pick(speakPool(f), 10);
  }
  sayRunner = makeSayRunner($("#sayRoot"), items);
  segWire(seg, "data-from", function(){ sayRunner.start(); setKeys(sayRunner); });
  sayRunner.start();
}
function renderShadow(){
  var root = $("#shadowRoot"), items = [], i = 0, hide = load("echoHide", false);
  root.innerHTML = '<div class="toolbar"><span class="label">From</span><div class="seg" id="shFrom">' +
    '<button type="button" data-from="dialogues" aria-pressed="true">Conversations</button><button type="button" data-from="survival" aria-pressed="false">Phrases</button><button type="button" data-from="words" aria-pressed="false">Word sentences</button></div>' +
    '<label class="chip"><input type="checkbox" id="shHide"' + (hide ? " checked" : "") + '> Hide the text</label></div><div id="shBox"></div>';
  function start(){ items = pick(speakPool(pressed($("#shFrom"), "data-from")), 10); i = 0; show(); }
  function show(){
    var box = $("#shBox");
    if(i >= items.length){ box.innerHTML = '<div class="result card-corners">' + CORNERS + '<div class="big">¡Listo!</div><div class="rsub">Ten sentences echoed.</div><div class="toolbar"><button class="btn primary again" type="button">Ten more</button></div></div>'; $(".again", box).addEventListener("click", start); return; }
    var it = items[i];
    box.innerHTML = '<div class="say card-corners">' + CORNERS + '<div class="qnum">' + (i + 1) + ' of ' + items.length + '</div>' +
      '<div class="prompt es echo' + (hide ? " veiled" : "") + '">' + esc(it.es) + '</div><div class="meaning">' + esc(it.en) + '</div>' +
      '<div class="toolbar tight"><button class="btn play" type="button">Play</button><button class="btn slow" type="button">Slower</button>' + (hide ? '<button class="btn peek" type="button">Show text</button>' : '') + '</div>' +
      '<div class="toolbar tight"><button class="btn primary next" type="button">Next &rsaquo;</button></div></div>';
    Speech.say(it.es);
    $(".play", box).addEventListener("click", function(){ Speech.say(it.es); });
    $(".slow", box).addEventListener("click", function(){ Speech.say(it.es, true); });
    if(hide) $(".peek", box).addEventListener("click", function(){ $(".echo", box).classList.remove("veiled"); });
    $(".next", box).addEventListener("click", function(){ i++; show(); });
  }
  segWire($("#shFrom"), "data-from", start);
  $("#shHide").addEventListener("change", function(){ hide = this.checked; save("echoHide", hide); show(); });
  shadowStart = start;           /* started when the panel is opened, so nothing speaks on load */
}
var shadowStart = null, shadowStarted = false;
function renderTalk(){
  var root = $("#talkRoot");
  root.innerHTML = '<div class="scenes">' + DIALOGUES.map(function(d){ return '<button class="scene card-corners" type="button" data-d="' + d.k + '">' + CORNERS + '<span class="stt">' + esc(d.title) + '</span><span class="swh">' + esc(d.where) + '</span></button>'; }).join("") + '</div><div id="talkBox"></div>';
  $$(".scene", root).forEach(function(b){ b.addEventListener("click", function(){ playDialogue(b.getAttribute("data-d"), "b"); }); });
}
function playDialogue(k, me){
  var d = DIALOGUES.filter(function(x){ return x.k === k; })[0], box = $("#talkBox"), n = 0;
  function line(l, mine, shown){
    return '<div class="ln ' + (mine ? "me" : "them") + '"><span class="who">' + (mine ? "You" : "Them") + '</span>' +
      (shown ? '<span class="es">' + esc(l[1]) + '</span> ' + sayBtn(l[1]) + '<span class="len">' + esc(l[2]) + '</span>' : '<span class="len cue">Say: ' + esc(l[2]) + '</span>') + '</div>';
  }
  function draw(){
    var past = d.lines.slice(0, n).map(function(l){ return line(l, l[0] === me, true); }).join("");
    if(n >= d.lines.length){
      box.innerHTML = '<div class="talk card-corners">' + CORNERS + '<h3>' + esc(d.title) + '</h3>' + past +
        '<div class="toolbar"><button class="btn primary swap" type="button">Swap parts</button><button class="btn again" type="button">Again</button></div></div>';
      $(".swap", box).addEventListener("click", function(){ playDialogue(k, me === "b" ? "a" : "b"); });
      $(".again", box).addEventListener("click", function(){ playDialogue(k, me); });
      return;
    }
    var l = d.lines[n], mine = l[0] === me;
    box.innerHTML = '<div class="talk card-corners">' + CORNERS + '<h3>' + esc(d.title) + ' <span class="swh">' + esc(d.where) + '</span></h3>' + past + line(l, mine, !mine) +
      (mine ? '<div class="toolbar tight"><button class="btn show" type="button">Show my line</button><button class="btn primary next" type="button" hidden>Next &rsaquo;</button></div>'
            : '<div class="toolbar tight"><button class="btn replay" type="button">Hear again</button><button class="btn primary next" type="button">Your turn &rsaquo;</button></div>') + '</div>';
    if(!mine){ Speech.say(l[1]); $(".replay", box).addEventListener("click", function(){ Speech.say(l[1]); }); }
    else {
      var reveal = function(){ var last = $$(".ln", box).pop(); last.outerHTML = line(l, true, true); $(".show", box).hidden = true; $(".next", box).hidden = false; Speech.say(l[1]); };
      $(".show", box).addEventListener("click", reveal);
    }
    $(".next", box).addEventListener("click", function(){ n++; draw(); });
  }
  draw();
  box.scrollIntoView && box.scrollIntoView({behavior:"smooth", block:"start"});
}
function renderSurvive(){
  $("#surviveRoot").innerHTML = SURVIVAL_GROUPS.map(function(g){
    return '<div class="gsec"><h2>' + esc(g.name) + '</h2><p class="src">' + esc(g.src) + '</p><div class="plist">' +
      SURVIVAL.filter(function(s){ return s[0] === g.k; }).map(function(s){ return '<button class="pl" type="button" data-say="' + esc(s[1]) + '"><span class="es">' + esc(s[1]) + '</span><span class="len">' + esc(s[2]) + '</span></button>'; }).join("") + '</div></div>';
  }).join("");
}

/* ================================================================ WORDS TAB */
function renderWordList(){
  var all = srsAll(), root = $("#wordsList"), nextSet = Math.floor((learnedIndexes(all).length) / 10);
  root.innerHTML = WORD_SETS.map(function(name, s){
    var ids = []; for(var i = s * 10; i < s * 10 + 10; i++) ids.push(i);
    var met = ids.filter(function(i){ return all[wordId(i)]; }).length;
    return '<details class="wset"' + (s === nextSet ? " open" : "") + '><summary><span class="dnum">Day ' + (s + 1) + '</span> ' + esc(name) + '<span class="met">' + (met === 10 ? "met" : met ? met + " / 10" : "") + '</span></summary>' +
      '<div class="tblwrap"><table class="tbl vocab">' + ids.map(function(i){ var w = WORDS[i];
        return '<tr' + (all[wordId(i)] ? ' class="known"' : '') + '><td class="kw"><span class="es">' + esc(w[0]) + '</span> ' + sayBtn(w[0]) + '</td><td class="mn">' + esc(w[1]) + '</td><td class="it"><span class="es">' + esc(w[2]) + '</span> ' + sayBtn(w[2]) + '<br><i>' + esc(w[3]) + '</i></td></tr>'; }).join("") +
      '</table></div></details>';
  }).join("");
}
var wordCards = null, cardsTouched = false, dealCards = null;
function renderWordCards(){
  var sel = $("#cardSet");
  sel.innerHTML = '<option value="mine">Words I’ve met</option>' + WORD_SETS.map(function(n, s){ return '<option value="' + s + '">Day ' + (s + 1) + ' · ' + esc(n) + '</option>'; }).join("") + '<option value="all">All 270</option>';
  wordCards = makeCards($("#wordCards"));
  function deal(sh){
    var v = sel.value, ids;
    if(v === "mine") ids = learnedIndexes();
    else if(v === "all") ids = WORDS.map(function(_, i){ return i; });
    else { ids = []; for(var i = +v * 10; i < +v * 10 + 10; i++) ids.push(i); }
    if(!ids.length){ ids = [0,1,2,3,4,5,6,7,8,9]; sel.value = "0"; }
    if(sh) ids = shuffle(ids);
    wordCards.load(ids.map(wordCard));
  }
  sel.value = learnedIndexes().length ? "mine" : "0";
  sel.addEventListener("change", function(){ cardsTouched = true; deal(false); });
  dealCards = function(){ if(!cardsTouched){ sel.value = learnedIndexes().length ? "mine" : "0"; deal(false); } };
  $("#cardShuffle").addEventListener("click", function(){ deal(true); });
  deal(false);
}
var wordQuizW = null;
function renderWordQuiz(){
  var seg = $("#wqFrom");
  wordQuizW = makeQuiz($("#wordQuiz"), function(){ var f = pressed(seg, "data-from"); return wordQuiz(f === "all" ? null : learnedIndexes(), 10); });
  segWire(seg, "data-from", function(){ wordQuizW.start(); setKeys(wordQuizW); });
}
var wordQuizStarted = false;

/* ================================================================ CONNECT TAB */
function renderConnect(){
  $("#buildRoot").innerHTML = '<div class="rules">' + BUILDERS.map(function(b){
    return '<div class="rule"><h4><span class="es">' + esc(b.es) + '</span> <span class="ven">' + esc(b.en) + '</span></h4>' +
      b.ex.map(function(x){ return '<p class="ex"><span class="es">' + esc(x[0]) + '</span> ' + sayBtn(x[0]) + ' <i>' + esc(x[1]) + '</i></p>'; }).join("") + '</div>'; }).join("") + '</div>' +
    '<div class="fifty"><button class="btn primary" type="button" data-go="speak/say" data-from="builders">Practice: say your own</button><p>Starters plus verbs you know, out loud: “I need to sleep” → <span class="es">Necesito dormir.</span></p></div>';
  $("#linkRoot").innerHTML = CONNECTOR_GROUPS.map(function(g){
    return '<div class="gsec"><h2>' + esc(g.name) + '</h2><div class="tblwrap"><table class="tbl links">' + CONNECTORS.filter(function(c){ return c[0] === g.k; }).map(function(c){
      return '<tr><td class="kw"><span class="es">' + esc(c[1]) + '</span></td><td class="mn">' + esc(c[2]) + (c[5] ? '<span class="cnote">' + esc(c[5]) + '</span>' : '') + '</td><td class="it"><span class="es">' + esc(c[3]) + '</span> ' + sayBtn(c[3]) + '<br><i>' + esc(c[4]) + '</i></td></tr>'; }).join("") + '</table></div></div>';
  }).join("");
}
var linkQuizW = null;

/* ================================================================ GRAMMAR TAB */
var lessonQuizW = null;
function renderGrammar(){
  var done = load("lessons", {});
  $("#grammarRoot").innerHTML =
    '<div class="fifty"><button class="btn primary" type="button" id="gMixed">Mixed quiz: 10 questions</button></div><div id="gMixedBox"></div>' +
    LESSONS.map(function(l, n){
      return '<details class="lesson' + (done[l.k] ? " ok" : "") + '" id="lesson-' + l.k + '"><summary><span class="dnum">' + (n + 1) + '</span><span class="lt">' + esc(l.title) + (l.later ? ' <span class="later">later</span>' : '') + '</span><span class="lsrc">' + esc(l.src) + '</span><span class="lp">' + esc(l.point) + '</span></summary>' +
        '<div class="lbody"><div class="point"><b>The point</b><p>' + esc(l.point) + '</p><p class="able"><b>Be able to</b>' + esc(l.able) + '</p></div>' + l.body +
        '<h3>Hear and repeat</h3><div class="plist">' + l.ex.map(function(x){ return '<button class="pl" type="button" data-say="' + esc(x[0]) + '"><span class="es">' + esc(x[0]) + '</span><span class="len">' + esc(x[1]) + '</span></button>'; }).join("") + '</div>' +
        '<div class="toolbar"><button class="btn primary lq" type="button" data-l="' + l.k + '">Quiz this lesson</button></div><div class="lqbox"></div></div></details>';
    }).join("");
  $("#gMixed").addEventListener("click", function(){ var w = makeQuiz($("#gMixedBox"), function(){ return lessonQuiz(LESSONS.filter(function(l){ return !l.later; }), 10); }); w.start(); setKeys(w); });
  $$(".lq").forEach(function(b){ b.addEventListener("click", function(){
    var k = b.getAttribute("data-l"), box = b.parentNode.nextElementSibling;
    var w = makeQuiz(box, function(){ return lessonQuiz([lessonByKey(k)]); }, function(s, t){ if(s / t >= 0.8){ var d = load("lessons", {}); d[k] = true; save("lessons", d); $("#lesson-" + k).classList.add("ok"); } });
    w.start(); setKeys(w);
  }); });
}

/* ================================================================ tabs, modes, settings */
function showTopic(t){
  $$(".topic-btn").forEach(function(b){ b.setAttribute("aria-selected", String(b.getAttribute("data-topic") === t)); });
  $$(".topic").forEach(function(s){ s.hidden = s.id !== "topic-" + t; });
  save("topic", t);
  if(t === "today") renderToday();
  if(t === "words") renderWordList();
  setKeys(null);
  var seg = $('[data-modes="' + t + '"]');
  if(seg) activate(t, pressed(seg, "data-mode"));
}
function showMode(t, m){
  var seg = $('[data-modes="' + t + '"]'); if(!seg) return;
  $$("button", seg).forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === m)); });
  $$('[data-panel^="' + t + '/"]').forEach(function(p){ p.hidden = p.getAttribute("data-panel") !== t + "/" + m; });
  save("mode." + t, m);
  setKeys(null);
  if(!$("#topic-" + t).hidden) activate(t, m);
}
/* what a panel does when it comes into view (never on load, so nothing speaks by itself) */
function activate(t, m){
  if(t === "speak" && m === "say" && sayRunner) setKeys(sayRunner);
  if(t === "speak" && m === "shadow" && shadowStart && !shadowStarted){ shadowStarted = true; shadowStart(); }
  if(t === "words" && m === "cards"){ if(dealCards) dealCards(); setKeys(wordCards); }
  if(t === "words" && m === "quiz"){ if(!wordQuizStarted){ wordQuizStarted = true; wordQuizW.start(); } setKeys(wordQuizW); }
  if(t === "connect" && m === "quiz"){ if(!linkQuizW){ linkQuizW = makeQuiz($("#linkQuiz"), function(){ return connectorQuiz(10); }); linkQuizW.start(); } setKeys(linkQuizW); }
}
function go(target, from){
  var p = target.split("/");
  showTopic(p[0]);
  if(p[1]) showMode(p[0], p[1]);
  if(from && p[0] === "speak" && p[1] === "say"){
    $$("#sayFrom button").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-from") === from)); });
    sayRunner.start(); setKeys(sayRunner);
  }
  window.scrollTo(0, 0);
}
function initSettings(){
  var r = $("#setRate"), n = $("#setNew"), l = $("#setVoice"), gs = $("#setGender");
  l.innerHTML = VOICES.map(function(v){ return '<option value="' + esc(v.id) + '">' + esc(v.label) + '</option>'; }).join("") +
    '<option value="phone-mx">Phone voice · Latin America</option><option value="phone-es">Phone voice · Spain</option>';
  var credit = $("#voiceCredit");
  if(credit) credit.textContent = VOICES.length ? "Voices: " + VOICES.map(function(v){ return v.credit; }).join(", ") + ", open source, recorded once and stored with the app." : "";
  gs.value = GENDER;
  gs.addEventListener("change", function(){ save("gender", gs.value); location.reload(); });
  r.value = String(Speech.rate); n.value = String(newPerDay()); l.value = Speech.voice;
  r.addEventListener("change", function(){ Speech.rate = +r.value; save("rate", Speech.rate); Speech.say("Hola, ¿cómo estás?"); });
  n.addEventListener("change", function(){ save("newPerDay", +n.value); var t = load("newToday", null); if(t && !dayLog()["new"]) save("newToday", null); if(!$("#topic-today").hidden) renderToday(); });
  l.addEventListener("change", function(){ Speech.setVoice(l.value); save("voice", Speech.voice); loadVoices(); Speech.say("Hola, ¿cómo estás?"); });
}

function init(){
  $$(".topic-btn").forEach(function(b){ b.addEventListener("click", function(){ showTopic(b.getAttribute("data-topic")); }); });
  $$("[data-modes]").forEach(function(seg){ segWire(seg, "data-mode", function(m){ showMode(seg.getAttribute("data-modes"), m); }); });
  document.addEventListener("click", function(e){
    var s = e.target.closest ? e.target.closest("[data-say]") : null;
    if(s){ e.preventDefault(); Speech.say(s.getAttribute("data-say"), s.hasAttribute("data-slow")); return; }
    var g = e.target.closest ? e.target.closest("[data-go]") : null;
    if(g){ e.preventDefault(); go(g.getAttribute("data-go"), g.getAttribute("data-from")); }
  });
  document.addEventListener("keydown", function(e){
    if(e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if(e.metaKey || e.ctrlKey || e.altKey) return;
    if(keyHandler && keyHandler.keys && keyHandler.keys(e)) e.preventDefault();
  });
  initSettings();
  loadVoices();
  if(Speech.canSpeak() && "onvoiceschanged" in window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
  renderVerbTables(); renderVerbDrill(); renderPatterns();
  renderSay(); renderShadow(); renderTalk(); renderSurvive();
  renderWordCards(); renderWordQuiz();
  renderConnect(); renderGrammar();
  ["speak", "words", "verbs", "connect"].forEach(function(t){ var m = load("mode." + t, null); if(m) showMode(t, m); });
  showTopic(load("topic", "today"));
  if("serviceWorker" in navigator && /^https?:/.test(location.protocol)){
    window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); });
  }
}
init();
