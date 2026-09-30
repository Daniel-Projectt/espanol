/* ================================================================ VERBS
   The conjugator follows the way both grammars explain Spanish verbs: a stem plus an ending,
   with the irregular ones sorted into families (Essential Grammar ch. 10; MSG ch. 16):
   stem-changing ("radical-changing") verbs, verbs with an irregular yo form (tengo, conozco),
   strong preterites (tuve, hice, dije), irregular future stems (tendré, haré) and a handful of
   verbs that are simply their own thing (ser, ir, estar, dar, haber).
   Latin-American usage: ustedes for "you all"; vosotros is left out (EG ch. 30).            */

var PERSONS = ["yo", "tú", "él / ella / usted", "nosotros", "ellos / ellas / ustedes"];
var PERSONS_SHORT = ["yo", "tú", "él", "nosotros", "ellos"];
var PERSONS_EN = ["I", "you", "he / she", "we", "they"];

var TENSES = [
  {k:"pres", name:"Present",          es:"presente",       en:"I go · I am going",   use:"What happens now, what usually happens, and the near future: “Voy mañana.”"},
  {k:"pret", name:"Past (preterite)", es:"pretérito",      en:"I went",              use:"A finished action at a point in the past: “Ayer fui al mercado.”"},
  {k:"impf", name:"Past (imperfect)", es:"imperfecto",     en:"I used to go · I was going", use:"Background, habits and descriptions in the past: “De niña, iba a la playa.”"},
  {k:"fut",  name:"Future",           es:"futuro",         en:"I will go",           use:"What will happen. In speech “voy a + infinitive” is even more common."},
  {k:"cond", name:"Conditional",      es:"condicional",    en:"I would go",          use:"What would happen, and polite requests: “¿Podría ayudarme?”"},
  {k:"subj", name:"Subjunctive",      es:"subjuntivo",     en:"…that I go",          use:"After wishing, hoping, asking and feeling: “Quiero que vengas.” (EG ch. 12)"},
  {k:"perf", name:"Present perfect",  es:"pretérito perfecto", en:"I have gone",     use:"haber + participle: “He comido.” Never split the two parts."},
  {k:"prog", name:"Right now (-ing)", es:"estar + gerundio", en:"I am going",        use:"estar + -ando/-iendo for what is happening this very moment."},
  {k:"cmd",  name:"Command (tú)",     es:"imperativo",     en:"Go!",                 use:"Telling a friend to do something: “¡Ven!” “¡Dime!”"}
];

/* e: English [base, 3rd-singular, past, participle, -ing]
   group: "big" (the heavy irregulars), "go" (irregular yo form), "stem" (stem-changing),
          "spell" (spelling changes only), "reg" (regular models)                          */
var VERBS = [
 {inf:"ser", en:"to be (who or what)", e:["be","is","was","been","being"], group:"big",
  why:"Completely its own verb: soy, eres, es… fui in the past, era in the imperfect.",
  pres:["soy","eres","es","somos","son"], pret:["fui","fuiste","fue","fuimos","fueron"],
  impf:["era","eras","era","éramos","eran"], subj:["sea","seas","sea","seamos","sean"], cmd:"sé", part:"sido", ger:"siendo"},
 {inf:"estar", en:"to be (how or where)", e:["be","is","was","been","being"], group:"big",
  why:"Yo estoy, then accents on the -á- forms. Past: estuve (a u-stem).",
  pres:["estoy","estás","está","estamos","están"], pretStem:"estuv",
  subj:["esté","estés","esté","estemos","estén"], cmd:"está", skip:["prog"]},
 {inf:"ir", en:"to go", e:["go","goes","went","gone","going"], group:"big",
  why:"Looks like nothing else: voy, vas, va… The past fui is the same as ser’s. Imperfect iba.",
  pres:["voy","vas","va","vamos","van"], pret:["fui","fuiste","fue","fuimos","fueron"],
  impf:["iba","ibas","iba","íbamos","iban"], subj:["vaya","vayas","vaya","vayamos","vayan"], cmd:"ve", ger:"yendo"},
 {inf:"tener", en:"to have", e:["have","has","had","had","having"], group:"big",
  why:"Yo tengo; e → ie (tienes); past tuve; future tendré.",
  yo:"tengo", stem:"ie", pretStem:"tuv", futStem:"tendr", cmd:"ten"},
 {inf:"hacer", en:"to do, to make", e:["do","does","did","done","doing"], group:"big",
  why:"Yo hago; past hice / hizo; future haré; participle hecho.",
  yo:"hago", pret:["hice","hiciste","hizo","hicimos","hicieron"], futStem:"har", cmd:"haz", part:"hecho"},
 {inf:"poder", en:"can, to be able", e:["be able","is able","was able","been able","being able"], group:"big",
  why:"o → ue (puedo); past pude; future podré.",
  stem:"ue", pretStem:"pud", futStem:"podr", ger:"pudiendo", cmd:null},
 {inf:"querer", en:"to want, to love", e:["want","wants","wanted","wanted","wanting"], group:"big",
  why:"e → ie (quiero); past quise; future querré.",
  stem:"ie", pretStem:"quis", futStem:"querr"},
 {inf:"decir", en:"to say, to tell", e:["say","says","said","said","saying"], group:"big",
  why:"Yo digo; e → i (dices); past dije (a j-stem); future diré; participle dicho.",
  yo:"digo", stem:"i", pretStem:"dij", futStem:"dir", cmd:"di", part:"dicho"},
 {inf:"venir", en:"to come", e:["come","comes","came","come","coming"], group:"big",
  why:"Yo vengo; e → ie (vienes); past vine; future vendré.",
  yo:"vengo", stem:"ie", pretStem:"vin", futStem:"vendr", cmd:"ven"},
 {inf:"saber", en:"to know (facts, how to)", e:["know","knows","knew","known","knowing"], group:"big",
  why:"Yo sé; past supe; future sabré; subjunctive sepa.",
  yo:"sé", pretStem:"sup", futStem:"sabr", subj:["sepa","sepas","sepa","sepamos","sepan"]},
 {inf:"dar", en:"to give", e:["give","gives","gave","given","giving"], group:"big",
  why:"Yo doy; the past takes -er endings with no accents: di, dio.",
  yo:"doy", pret:["di","diste","dio","dimos","dieron"], subj:["dé","des","dé","demos","den"]},
 {inf:"ver", en:"to see, to watch", e:["see","sees","saw","seen","seeing"], group:"big",
  why:"Yo veo; past vi, vio (no accents); imperfect veía; participle visto.",
  yo:"veo", pret:["vi","viste","vio","vimos","vieron"], impf:["veía","veías","veía","veíamos","veían"], part:"visto"},
 {inf:"haber", en:"to have (helper) · hay = there is", e:["have","has","had","had","having"], group:"big", noDrill:true,
  why:"Only a helper: he comido, has visto. Its own special form: hay (there is / are), había, habrá.",
  pres:["he","has","ha","hemos","han"], pretStem:"hub", futStem:"habr", subj:["haya","hayas","haya","hayamos","hayan"], cmd:null},

 {inf:"poner", en:"to put", e:["put","puts","put","put","putting"], group:"go",
  why:"Yo pongo; past puse; future pondré; participle puesto.",
  yo:"pongo", pretStem:"pus", futStem:"pondr", cmd:"pon", part:"puesto"},
 {inf:"salir", en:"to leave, to go out", e:["leave","leaves","left","left","leaving"], group:"go",
  why:"Yo salgo; future saldré; command sal. Everything else is regular.",
  yo:"salgo", futStem:"saldr", cmd:"sal"},
 {inf:"traer", en:"to bring", e:["bring","brings","brought","brought","bringing"], group:"go",
  why:"Yo traigo; past traje / trajeron; gerund trayendo.",
  yo:"traigo", pretStem:"traj", ger:"trayendo", part:"traído"},
 {inf:"oír", en:"to hear", e:["hear","hears","heard","heard","hearing"], group:"go",
  why:"Yo oigo, and a y between vowels: oyes, oyó, oyendo.",
  pres:["oigo","oyes","oye","oímos","oyen"], pret:["oí","oíste","oyó","oímos","oyeron"], futStem:"oir", ger:"oyendo", part:"oído", subj:["oiga","oigas","oiga","oigamos","oigan"]},
 {inf:"conocer", en:"to know (people, places)", e:["know","knows","knew","known","knowing"], group:"go",
  why:"Only yo is odd: conozco (and so conozca). Know a person or place, not a fact.",
  yo:"conozco"},

 {inf:"pensar", en:"to think", e:["think","thinks","thought","thought","thinking"], group:"stem",
  why:"e → ie when the stress lands on the stem: pienso, but pensamos.", stem:"ie"},
 {inf:"entender", en:"to understand", e:["understand","understands","understood","understood","understanding"], group:"stem",
  why:"e → ie: entiendo, but entendemos.", stem:"ie"},
 {inf:"empezar", en:"to begin", e:["begin","begins","began","begun","beginning"], group:"stem",
  why:"e → ie (empiezo) and z → c before e (empecé, empiece).", stem:"ie"},
 {inf:"volver", en:"to come back", e:["come back","comes back","came back","come back","coming back"], group:"stem",
  why:"o → ue: vuelvo, but volvemos. Participle vuelto.", stem:"ue", part:"vuelto"},
 {inf:"encontrar", en:"to find", e:["find","finds","found","found","finding"], group:"stem",
  why:"o → ue: encuentro, but encontramos.", stem:"ue"},
 {inf:"dormir", en:"to sleep", e:["sleep","sleeps","slept","slept","sleeping"], group:"stem",
  why:"o → ue (duermo), and o → u in durmió, durmieron, durmiendo.", stem:"ue"},
 {inf:"jugar", en:"to play", e:["play","plays","played","played","playing"], group:"stem",
  why:"The only u → ue verb: juego. And g → gu before e: jugué.", stem:"u"},
 {inf:"pedir", en:"to ask for, to order", e:["ask for","asks for","asked for","asked for","asking for"], group:"stem",
  why:"e → i: pido, pidió, pidiendo.", stem:"i"},
 {inf:"sentir", en:"to feel, to be sorry", e:["feel","feels","felt","felt","feeling"], group:"stem",
  why:"e → ie (siento), and e → i in sintió, sintiendo. “Lo siento” = I’m sorry.", stem:"ie"},
 {inf:"seguir", en:"to follow, to keep on", e:["follow","follows","followed","followed","following"], group:"stem",
  why:"e → i (sigues) and yo sigo drops the u.", stem:"i", yo:"sigo"},

 {inf:"buscar", en:"to look for", e:["look for","looks for","looked for","looked for","looking for"], group:"spell",
  why:"Regular in sound. On paper c → qu before e: busqué, busque.", },
 {inf:"llegar", en:"to arrive", e:["arrive","arrives","arrived","arrived","arriving"], group:"spell",
  why:"Regular in sound. On paper g → gu before e: llegué, llegue."},
 {inf:"leer", en:"to read", e:["read","reads","read","read","reading"], group:"spell",
  why:"A y between vowels: leyó, leyeron, leyendo; accents on leíste, leído.",
  pret:["leí","leíste","leyó","leímos","leyeron"], ger:"leyendo", part:"leído"},
 {inf:"creer", en:"to believe", e:["believe","believes","believed","believed","believing"], group:"spell",
  why:"Like leer: creyó, creyendo, creído.",
  pret:["creí","creíste","creyó","creímos","creyeron"], ger:"creyendo", part:"creído"},

 {inf:"hablar", en:"to speak", e:["speak","speaks","spoke","spoken","speaking"], group:"reg", why:"The model -ar verb. Learn its endings and every regular -ar verb follows."},
 {inf:"comer", en:"to eat", e:["eat","eats","ate","eaten","eating"], group:"reg", why:"The model -er verb: como, comes, come, comemos, comen. Past: comí, comió."},
 {inf:"vivir", en:"to live", e:["live","lives","lived","lived","living"], group:"reg", why:"The model -ir verb. Only nosotros differs from -er: vivimos."},
 {inf:"trabajar", en:"to work", e:["work","works","worked","worked","working"], group:"reg", why:"Regular -ar: trabajo, trabajas… Past: trabajé, trabajó. It copies hablar exactly."},
 {inf:"necesitar", en:"to need", e:["need","needs","needed","needed","needing"], group:"reg", why:"Regular -ar. “Necesito + infinitive” = I need to…"},
 {inf:"escribir", en:"to write", e:["write","writes","wrote","written","writing"], group:"reg", why:"Regular except the participle: escrito.", part:"escrito"},
 {inf:"abrir", en:"to open", e:["open","opens","opened","opened","opening"], group:"reg", why:"Regular except the participle: abierto.", part:"abierto"},
 {inf:"llamarse", en:"to be called (my name is)", e:["be called","is called","was called","been called","being called"], group:"reg",
  why:"Reflexive: me llamo, te llamas, se llama. Literally “I call myself”.", cmd:null},
 {inf:"levantarse", en:"to get up", e:["get up","gets up","got up","got up","getting up"], group:"reg",
  why:"Reflexive: me levanto, te levantas… The pronoun comes first.", cmd:"levántate"}
];

var VERB_GROUPS = [
  {k:"big",   name:"The big irregulars", note:"The verbs you use every day are the least regular. Learn these as whole words."},
  {k:"go",    name:"Odd “yo” verbs",      note:"Normal except the yo form: tengo, pongo, salgo, traigo, conozco (EG 10.1.2)."},
  {k:"stem",  name:"Stem changers",       note:"The stem vowel changes when it carries the stress: e → ie, o → ue, e → i (EG 10.1.2.1)."},
  {k:"spell", name:"Spelling changes",    note:"They sound regular; only the spelling shifts to keep the sound (c → qu, g → gu, i → y)."},
  {k:"reg",   name:"Regular models",      note:"The patterns every regular verb copies."}
];

var PATTERNS = [
  {t:"The 8 short tú commands", l:"di · haz · ve · pon · sal · sé · ten · ven",
   x:"decir, hacer, ir, poner, salir, ser, tener, venir. Every other tú command is just the él form: habla, come, escribe."},
  {t:"Stem changers: the “boot”", l:"pienso · piensas · piensa · pensamos · piensan",
   x:"The change happens only where the stress falls on the stem, so nosotros keeps the plain vowel. Draw the forms in a table and the changed ones make a boot."},
  {t:"Irregular yo forms", l:"tengo · vengo · digo · hago · pongo · salgo · traigo · oigo · conozco",
   x:"The whole present subjunctive is built on this yo form: tenga, venga, diga, haga, ponga, conozca."},
  {t:"Strong preterites", l:"tuve · estuve · pude · puse · supe · quise · vine · hice · dije · traje",
   x:"One set of endings for all of them, with no accents: -e, -iste, -o, -imos, -ieron. After j it is -eron: dijeron, trajeron."},
  {t:"ser and ir share a past", l:"fui · fuiste · fue · fuimos · fueron",
   x:"“Fui a Madrid” = I went; “Fui estudiante” = I was. The sentence tells you which."},
  {t:"Only three irregular imperfects", l:"era (ser) · iba (ir) · veía (ver)",
   x:"Every other verb is regular in the imperfect: hablaba, comía, tenía, hacía."},
  {t:"Irregular future stems", l:"tendr- · vendr- · pondr- · saldr- · podr- · sabr- · habr- · querr- · har- · dir-",
   x:"The endings never change (-é, -ás, -á, -emos, -án), and the conditional uses the same stems: tendría, haría."},
  {t:"Irregular participles", l:"hecho · dicho · visto · puesto · vuelto · escrito · abierto",
   x:"Used after haber: he hecho, has dicho, hemos visto."},
  {t:"-ir stem changers in the past", l:"pidió · pidieron · durmió · durmieron · sintió",
   x:"Only -ir stem changers do this, and only in the él and ellos forms of the preterite (plus the gerund: pidiendo, durmiendo)."}
];

/* ---------------------------------------------------------------- conjugator */
var END = {
  pres:{ar:["o","as","a","amos","an"], er:["o","es","e","emos","en"], ir:["o","es","e","imos","en"]},
  pret:{ar:["é","aste","ó","amos","aron"], er:["í","iste","ió","imos","ieron"], ir:["í","iste","ió","imos","ieron"]},
  impf:{ar:["aba","abas","aba","ábamos","aban"], er:["ía","ías","ía","íamos","ían"], ir:["ía","ías","ía","íamos","ían"]},
  subj:{ar:["e","es","e","emos","en"], er:["a","as","a","amos","an"], ir:["a","as","a","amos","an"]},
  fut:["é","ás","á","emos","án"],
  cond:["ía","ías","ía","íamos","ían"],
  strong:["e","iste","o","imos","ieron"]
};
var HABER = ["he","has","ha","hemos","han"], ESTAR = ["estoy","estás","está","estamos","están"];
var REFL = ["me","te","se","nos","se"];

function verbBase(v){ return v.inf.replace(/se$/, ""); }
function verbClass(v){ var b = verbBase(v); return b.slice(-2) === "ír" ? "ir" : b.slice(-2); }
function verbStem(v){ return verbBase(v).slice(0, -2); }
function lastVowelSwap(stem, from, to){
  var i = stem.lastIndexOf(from); return i < 0 ? stem : stem.slice(0, i) + to + stem.slice(i + from.length);
}
function changedStem(v){
  var s = verbStem(v);
  if(v.stem === "ie") return lastVowelSwap(s, "e", "ie");
  if(v.stem === "ue") return lastVowelSwap(s, "o", "ue");
  if(v.stem === "i")  return lastVowelSwap(s, "e", "i");
  if(v.stem === "u")  return lastVowelSwap(s, "u", "ue");
  return s;
}
/* -ir stem changers: e → i, o → u in the preterite él/ellos, the gerund and nosotros subjunctive */
function narrowStem(v){
  var s = verbStem(v);
  if(verbClass(v) !== "ir" || !v.stem) return s;
  if(v.stem === "ie" || v.stem === "i") return lastVowelSwap(s, "e", "i");
  if(v.stem === "ue") return lastVowelSwap(s, "o", "u");
  return s;
}
/* keep the sound: c → qu, g → gu, z → c before e */
function softE(stem){
  if(/c$/.test(stem)) return stem.slice(0, -1) + "qu";
  if(/g$/.test(stem)) return stem.slice(0, -1) + "gu";
  if(/z$/.test(stem)) return stem.slice(0, -1) + "c";
  return stem;
}
function presentForms(v, regularOnly){
  if(v.pres && !regularOnly) return v.pres.slice();
  var c = verbClass(v), s = verbStem(v), cs = regularOnly ? s : changedStem(v), e = END.pres[c];
  var out = e.map(function(x, p){ return (p === 3 ? s : cs) + x; });
  if(v.yo && !regularOnly) out[0] = v.yo;
  return out;
}
function preteriteForms(v, regularOnly){
  if(!regularOnly){
    if(v.pret) return v.pret.slice();
    if(v.pretStem){
      var st = v.pretStem;
      return END.strong.map(function(x, p){ return st + (p === 4 && /j$/.test(st) ? "eron" : x); });
    }
  }
  var c = verbClass(v), s = verbStem(v), e = END.pret[c];
  return e.map(function(x, p){
    if(regularOnly) return s + x;
    if(p === 0 && c === "ar") return softE(s) + x;
    if((p === 2 || p === 4) && c === "ir") return narrowStem(v) + x;
    return s + x;
  });
}
function imperfectForms(v, regularOnly){
  if(v.impf && !regularOnly) return v.impf.slice();
  var s = verbStem(v); return END.impf[verbClass(v)].map(function(x){ return s + x; });
}
function futureStem(v, regularOnly){ return (!regularOnly && v.futStem) || verbBase(v); }
function futureForms(v, r){ var s = futureStem(v, r); return END.fut.map(function(x){ return s + x; }); }
function conditionalForms(v, r){ var s = futureStem(v, r); return END.cond.map(function(x){ return s + x; }); }
function subjunctiveForms(v, regularOnly){
  if(v.subj && !regularOnly) return v.subj.slice();
  var c = verbClass(v), e = END.subj[c];
  if(regularOnly){ var rs = verbStem(v); return e.map(function(x){ return rs + x; }); }
  if(v.yo){ var ys = v.yo.replace(/o$/, ""); return e.map(function(x){ return (c === "ar" ? softE(ys) : ys) + x; }); }
  var cs = changedStem(v), ns = c === "ir" ? narrowStem(v) : verbStem(v);
  return e.map(function(x, p){ var st = p === 3 ? ns : cs; return (c === "ar" ? softE(st) : st) + x; });
}
function participle(v, regularOnly){
  if(v.part && !regularOnly) return v.part;
  return verbStem(v) + (verbClass(v) === "ar" ? "ado" : "ido");
}
function gerund(v, regularOnly){
  if(v.ger && !regularOnly) return v.ger;
  var c = verbClass(v);
  if(c === "ar") return verbStem(v) + "ando";
  return (regularOnly ? verbStem(v) : narrowStem(v)) + "iendo";
}
function commandForm(v, regularOnly){
  if(!regularOnly && v.cmd !== undefined) return v.cmd;
  return presentForms(v, regularOnly)[2];
}
/* all five persons of one tense (or one string for the tú command) */
function conjugate(v, tense, regularOnly){
  var refl = /se$/.test(v.inf), f;
  switch(tense){
    case "pres": f = presentForms(v, regularOnly); break;
    case "pret": f = preteriteForms(v, regularOnly); break;
    case "impf": f = imperfectForms(v, regularOnly); break;
    case "fut":  f = futureForms(v, regularOnly); break;
    case "cond": f = conditionalForms(v, regularOnly); break;
    case "subj": f = subjunctiveForms(v, regularOnly); break;
    case "perf": f = HABER.map(function(h){ return h + " " + participle(v, regularOnly); }); break;
    case "prog": f = ESTAR.map(function(h){ return h + " " + gerund(v, regularOnly); }); break;
    case "cmd":  var cm = commandForm(v, regularOnly); return cm;
    default: return null;
  }
  if(refl) f = f.map(function(x, p){ return REFL[p] + " " + x; });
  return f;
}
/* which forms break the regular pattern: the ones to learn by heart */
function irregularMask(v, tense){
  var real = conjugate(v, tense, false), reg = conjugate(v, tense, true);
  if(tense === "cmd") return real !== null && real !== reg && !/se$/.test(v.inf);
  return real.map(function(x, p){ return x !== reg[p]; });
}
function isIrregularIn(v, tense){
  var m = irregularMask(v, tense); return Array.isArray(m) ? m.some(Boolean) : m;
}
function verbByInf(inf){ for(var i = 0; i < VERBS.length; i++) if(VERBS[i].inf === inf) return VERBS[i]; return null; }

/* English for a drill prompt: "we went", "they will come", "…that I go" */
function englishFor(v, tense, p){
  var e = v.e, subj = PERSONS_EN[p], be = e[0] === "be";
  var third = p === 2;
  switch(tense){
    case "pres":
      if(be) return subj + " " + (p === 0 ? "am" : third ? "is" : "are");
      if(e[0] === "be able") return subj + " can";
      if(e[0] === "be called") return subj + " " + (p === 0 ? "am" : third ? "is" : "are") + " called";
      return subj + " " + (third ? e[1] : e[0]);
    case "pret":
      if(be) return subj + " " + (p === 0 || third ? "was" : "were");
      if(e[0] === "be able") return subj + " managed to (could)";
      if(e[0] === "be called") return subj + " " + (p === 0 || third ? "was" : "were") + " called";
      return subj + " " + e[2];
    case "impf":
      if(be) return subj + " " + (p === 0 || third ? "was" : "were") + " (back then)";
      if(e[0] === "be able") return subj + " could (back then)";
      return subj + " used to " + e[0];
    case "fut":  return subj + " will " + e[0];
    case "cond": return subj + " would " + e[0];
    case "subj": return "…that " + subj + " " + (be ? "be" : e[0]);
    case "perf": return subj + " " + (third ? "has" : "have") + " " + e[3];
    case "prog":
      if(be) return subj + " " + (p === 0 ? "am" : third ? "is" : "are") + " being";
      return subj + " " + (p === 0 ? "am" : third ? "is" : "are") + " " + e[4];
    case "cmd":  return (e[0].charAt(0).toUpperCase() + e[0].slice(1)) + "!";
  }
  return "";
}
