/* ================================================================ GRAMMAR
   Twenty short lessons, ordered by how soon you need them to speak.  Each one names the
   chapters it comes from: EG = Bradley & Mackenzie, Spanish: An Essential Grammar (2004);
   MSG = Kattán-Ibarra & Pountain, Modern Spanish Grammar, 2nd ed. (2003).
   Each lesson: point (the one idea), body (short notes), ex (examples to hear and repeat),
   able (what you should be able to do), q (questions: q, a, w[3] wrong answers, e why).  */
var LESSONS = [
{k:"sounds", title:"Sounds and stress", src:"EG ch. 1 · MSG ch. 1",
 point:"Spanish is spelled the way it sounds. Five pure vowels, every letter spoken (except h), and a simple rule for which syllable to stress.",
 body:'<table class="tbl"><tr><th>Letter</th><th>Sounds like</th><th>Example</th></tr>'+
  '<tr><td>a e i o u</td><td>ah, eh, ee, oh, oo: short and pure, never “ay-ee”</td><td>mesa, libro</td></tr>'+
  '<tr><td>h</td><td>silent</td><td>hola, hablar</td></tr>'+
  '<tr><td>j · ge, gi</td><td>a breathy h</td><td>jugo, gente</td></tr>'+
  '<tr><td>ll · y</td><td>y as in “yes”</td><td>llamo, yo</td></tr>'+
  '<tr><td>ñ</td><td>ny as in “canyon”</td><td>mañana</td></tr>'+
  '<tr><td>r</td><td>a single tap, like the tt in “butter”</td><td>pero, caro</td></tr>'+
  '<tr><td>rr · r at the start</td><td>a trill</td><td>perro, rojo</td></tr>'+
  '<tr><td>qu</td><td>k (the u is silent)</td><td>queso, quiero</td></tr>'+
  '<tr><td>z · ce, ci</td><td>s in Latin America</td><td>zapato, cena</td></tr></table>'+
  '<p><mark>The stress rule:</mark> a word ending in a vowel, n or s is stressed on the second-to-last syllable (<i>ha-bla, ha-blan</i>). Any other ending is stressed on the last syllable (<i>ha-blar, ciu-dad</i>). A written accent marks every exception: <i>café, árbol, teléfono</i>.</p>'+
  '<p>An accent can also tell two words apart: <i>si</i> (if) / <i>sí</i> (yes), <i>el</i> (the) / <i>él</i> (he), <i>tu</i> (your) / <i>tú</i> (you).</p>',
 ex:[["pero · perro","but · dog"],["Hola, ¿qué tal?","Hi, how’s it going?"],["mañana","tomorrow"],["El café está caliente.","The coffee is hot."]],
 able:"read any Spanish word aloud and put the stress in the right place.",
 q:[
  {q:"How is the h in “hablar” pronounced?", a:"It is silent", w:["Like the English h","Like the Spanish j","Like a k"], e:"H is always silent in Spanish: “ablar”."},
  {q:"Where does the stress fall in “ciudad”?", a:"On the last syllable, -dad", w:["On the first syllable, ciu-","It depends on the speaker","On both syllables equally"], e:"It ends in d (not a vowel, n or s), so the last syllable is stressed."},
  {q:"Why does “café” have a written accent?", a:"It breaks the stress rule", w:["All nouns ending in e have one","It shows the word is masculine","It shows the word is borrowed"], e:"Ending in a vowel, it would normally stress ca-. The accent moves the stress to -fé."},
  {q:"Which pair is told apart only by rr versus r?", a:"perro and pero", w:["perro and pera","caro and cara","para and pera"], e:"Perro (dog) and pero (but): a single r is a tap, rr is a trill. Mixing them changes the word."},
  {q:"“Sí” with an accent means…", a:"yes", w:["if","himself","so"], e:"Sí = yes; si = if."}
 ]},
{k:"gender", title:"Nouns: masculine, feminine, plural", src:"EG ch. 2 · MSG ch. 2–3",
 point:"Every noun is masculine or feminine, and everything around it (the, a, adjectives) has to match. So learn each noun with its article.",
 body:'<ul><li>Most nouns in <b>-o</b> are masculine: <i>el libro</i>. Most in <b>-a</b> are feminine: <i>la casa</i>.</li>'+
  '<li>Also feminine: <b>-ción, -sión, -dad, -tad, -tud</b>: <i>la canción, la ciudad</i>.</li>'+
  '<li><mark>Common exceptions:</mark> <i>el día, el mapa, el problema, el idioma, el sistema</i>; <i>la mano, la foto, la radio</i>.</li>'+
  '<li>Feminine nouns starting with a stressed a- take <i>el</i> in the singular: <i>el agua fría</i>, but <i>las aguas</i>.</li>'+
  '<li><b>Plural:</b> add <b>-s</b> after a vowel (<i>casas</i>), <b>-es</b> after a consonant (<i>ciudades</i>); z becomes c (<i>la luz → las luces</i>).</li>'+
  '<li>A mixed group is masculine: <i>los padres</i> = the parents, <i>los hermanos</i> = brothers and sisters.</li></ul>',
 ex:[["el problema","the problem"],["la canción","the song"],["las ciudades","the cities"],["los hermanos","the brothers and sisters"]],
 able:"say the right “the” for a noun and make it plural.",
 q:[
  {q:"Which is correct?", a:"el problema", w:["la problema","los problema","la problemo"], e:"Problema ends in -a but is masculine, one of the common exceptions."},
  {q:"The plural of “la ciudad” is…", a:"las ciudades", w:["las ciudads","los ciudades","la ciudades"], e:"A consonant ending takes -es, and the article becomes las."},
  {q:"Your friend says “los padres”. She means…", a:"her mother and father", w:["only her two fathers","her priests","her grandparents"], e:"A mixed group takes the masculine: los padres = parents."},
  {q:"Which noun is feminine?", a:"la mano", w:["el día","el mapa","el idioma"], e:"Mano ends in -o but is feminine; the others end in -a but are masculine."},
  {q:"The plural of “la luz” (the light) is…", a:"las luces", w:["las luzes","las luzs","los luces"], e:"-es after a consonant, and z changes to c before e."}
 ]},
{k:"articles", title:"The, a, some", src:"EG ch. 3 · MSG ch. 4",
 point:"el, la, los, las = the; un, una = a; unos, unas = some. Spanish uses “the” in places English doesn’t, and drops “a” before jobs.",
 body:'<table class="tbl"><tr><th></th><th>masculine</th><th>feminine</th></tr><tr><td>the</td><td>el · los</td><td>la · las</td></tr><tr><td>a · some</td><td>un · unos</td><td>una · unas</td></tr></table>'+
  '<ul><li><b>a + el = al</b>, <b>de + el = del</b>: <i>Voy al parque. Vengo del trabajo.</i></li>'+
  '<li><mark>Spanish adds “the”</mark> for things in general and with titles: <i>Me gusta <b>el</b> café. <b>La</b> señora López.</i></li>'+
  '<li>Days take el/los for “on”: <i><b>el</b> lunes</i> = on Monday; <i><b>los</b> lunes</i> = on Mondays.</li>'+
  '<li><mark>Spanish drops “a”</mark> before a job or religion with ser: <i>Soy enfermera.</i> (I’m a nurse.)</li></ul>',
 ex:[["Voy al mercado.","I’m going to the market."],["Me gusta el chocolate.","I like chocolate."],["Soy estudiante.","I’m a student."],["El sábado voy a la playa.","On Saturday I’m going to the beach."]],
 able:"use al/del, “the” for things in general, and no “a” before jobs.",
 q:[
  {q:"“I like coffee” in Spanish:", a:"Me gusta el café.", w:["Me gusta café.","Me gusta un café.","Me gusta al café."], e:"Things in general take the article: el café."},
  {q:"“She is a doctor”:", a:"Es doctora.", w:["Es una doctora.","Está doctora.","Es la doctora."], e:"No article before a job after ser (unless you add an adjective: una doctora excelente)."},
  {q:"Fill in: “Vamos ___ parque.”", a:"al", w:["a el","el","del"], e:"a + el always contracts to al."},
  {q:"“On Mondays I work” is…", a:"Los lunes trabajo.", w:["En lunes trabajo.","El lunes trabajo.","Lunes trabajo."], e:"Los lunes = on Mondays (every Monday). El lunes = this coming Monday."},
  {q:"“I’m coming from work”:", a:"Vengo del trabajo.", w:["Vengo de el trabajo.","Vengo al trabajo.","Vengo el trabajo."], e:"de + el = del."}
 ]},
{k:"adjectives", title:"Describing: adjectives agree", src:"EG ch. 6 · MSG ch. 5",
 point:"Adjectives usually come after the noun and match it in gender and number: una casa blanca, unos zapatos negros.",
 body:'<ul><li>-o adjectives have four forms: <i>alto, alta, altos, altas</i>.</li>'+
  '<li>-e and most consonant endings have two: <i>grande, grandes; fácil, fáciles</i>.</li>'+
  '<li>Nationalities add -a even after a consonant: <i>español → española</i>.</li>'+
  '<li><mark>Before the noun</mark> some shorten: <i>un buen amigo, un mal día, el primer día, gran</i> (great): <i>una gran mujer</i>.</li>'+
  '<li>Position can change the meaning: <i>un viejo amigo</i> (a long-time friend) vs <i>un amigo viejo</i> (an elderly friend).</li></ul>',
 ex:[["una casa blanca","a white house"],["Los niños están cansados.","The children are tired."],["Es un buen amigo.","He’s a good friend."],["Mi mamá es muy alta.","My mom is very tall."]],
 able:"put an adjective after the noun and make it agree.",
 q:[
  {q:"“The red flowers” is…", a:"las flores rojas", w:["las rojas flores","las flores rojos","la flores roja"], e:"After the noun, feminine plural to match flores."},
  {q:"“A good day” is…", a:"un buen día", w:["un bueno día","un día buen","una buena día"], e:"Bueno shortens to buen before a masculine singular noun."},
  {q:"Your friend is a woman from Spain. She is…", a:"española", w:["español","españolo","españala"], e:"Nationalities in a consonant add -a for the feminine."},
  {q:"“Un viejo amigo” means…", a:"a friend of many years", w:["an elderly friend","an ex-friend","an old enemy"], e:"Before the noun, viejo means long-standing; after it, elderly."},
  {q:"Which is correct?", a:"Las preguntas son fáciles.", w:["Las preguntas son fácil.","Las preguntas son fácilas.","Las preguntas es fáciles."], e:"Fácil has one form per number: fácil, fáciles."}
 ]},
{k:"pronouns", title:"I, you, we: and tú or usted", src:"EG ch. 8 · MSG ch. 8.1, 30",
 point:"The verb ending already says who: hablo = I speak. So Spanish usually drops yo, tú, él. And choose: tú for friends and kids, usted for strangers and elders.",
 body:'<table class="tbl"><tr><th>person</th><th>pronoun</th></tr><tr><td>I</td><td>yo</td></tr><tr><td>you (friend)</td><td>tú</td></tr><tr><td>you (polite)</td><td>usted: uses the él/ella verb form</td></tr><tr><td>he · she</td><td>él · ella</td></tr><tr><td>we</td><td>nosotros · nosotras (all women)</td></tr><tr><td>you all</td><td>ustedes: uses the ellos form (Latin America)</td></tr><tr><td>they</td><td>ellos · ellas (all women)</td></tr></table>'+
  '<p><mark>Use the pronoun only for emphasis or contrast:</mark> <i>Yo pago.</i> (I’ll pay, not you.) <i>Él es de Perú, pero ella es de Chile.</i></p>'+
  '<p>Spain also uses <i>vosotros</i> for “you all” among friends; Latin America uses <i>ustedes</i> for everyone (EG ch. 30).</p>',
 ex:[["¿Hablas inglés?","Do you speak English?"],["¿Usted habla inglés?","Do you speak English? (polite)"],["Yo pago.","I’ll pay."],["Somos de Ohio.","We’re from Ohio."]],
 able:"drop the pronoun, and pick tú or usted.",
 q:[
  {q:"Talking to your friend’s grandmother for the first time, you’d say…", a:"¿Cómo está usted?", w:["¿Cómo estás tú?","¿Cómo están?","¿Cómo estoy?"], e:"Usted is polite and uses the él/ella form: está."},
  {q:"Why is “Yo hablo español” usually just “Hablo español”?", a:"The -o ending already means I", w:["Yo is rude in Spanish","Yo is only for writing","Yo only goes after the verb"], e:"The ending carries the person, so yo is kept for emphasis."},
  {q:"Talking to a group of friends in Mexico, “you all” is…", a:"ustedes", w:["vosotros","tú","usted"], e:"Latin America uses ustedes for any group."},
  {q:"Which verb form goes with usted?", a:"The same as él/ella", w:["The same as tú","The same as yo","Its own special form"], e:"Usted habla, usted tiene: third-person forms."},
  {q:"“Nosotras” means we, when…", a:"the whole group is women", w:["one person is a woman","the group is formal","the group is mixed"], e:"Any man in the group makes it nosotros."}
 ]},
{k:"present", title:"The present tense", src:"EG ch. 10.1, 11 · MSG ch. 16–17, 71",
 point:"Drop -ar, -er, -ir and add the ending for the person. The present covers “I speak”, “I am speaking” and even “I’ll speak (soon)”.",
 body:'<table class="tbl"><tr><th></th><th>hablar</th><th>comer</th><th>vivir</th></tr>'+
  '<tr><td>yo</td><td>habl<b>o</b></td><td>com<b>o</b></td><td>viv<b>o</b></td></tr>'+
  '<tr><td>tú</td><td>habl<b>as</b></td><td>com<b>es</b></td><td>viv<b>es</b></td></tr>'+
  '<tr><td>él · usted</td><td>habl<b>a</b></td><td>com<b>e</b></td><td>viv<b>e</b></td></tr>'+
  '<tr><td>nosotros</td><td>habl<b>amos</b></td><td>com<b>emos</b></td><td>viv<b>imos</b></td></tr>'+
  '<tr><td>ellos · ustedes</td><td>habl<b>an</b></td><td>com<b>en</b></td><td>viv<b>en</b></td></tr></table>'+
  '<p><mark>The irregular ones are the common ones</mark>: soy, estoy, voy, tengo, hago, puedo, quiero, digo. They have their own practice in the Verbs tab.</p>'+
  '<p>Mañana and similar words make the present a future: <i>Te llamo mañana.</i> (I’ll call you tomorrow.)</p>',
 ex:[["Trabajo en un hospital.","I work in a hospital."],["¿Qué comes?","What are you eating?"],["Vivimos cerca.","We live nearby."],["Te llamo mañana.","I’ll call you tomorrow."]],
 able:"conjugate any regular verb in the present and use it for now, habits and plans.",
 q:[
  {q:"“We live” is…", a:"vivimos", w:["vivemos","viven","vivamos"], e:"-ir verbs take -imos for nosotros."},
  {q:"“¿Qué comes?” can mean…", a:"What are you eating?", w:["What did you eat?","What will you cook?","What should I eat?"], e:"The present covers what is happening right now too."},
  {q:"“Ellos hablan” is the same form as…", a:"ustedes hablan", w:["usted habla","nosotros hablamos","tú hablas"], e:"Ustedes always uses the ellos form."},
  {q:"“Te llamo mañana” means…", a:"I’ll call you tomorrow", w:["I called you yesterday","Call me tomorrow","I call you every day"], e:"With mañana, the present tense talks about the near future."},
  {q:"Which form is wrong?", a:"yo habla", w:["tú comes","él vive","nosotros comemos"], e:"Yo takes -o: hablo."}
 ]},
{k:"serestar", title:"Ser or estar", src:"EG ch. 20 · MSG ch. 22, 36",
 point:"Both mean “to be”. Ser tells what something is (identity, origin, time, what it’s like). Estar tells how or where it is (condition, location, result).",
 body:'<table class="tbl"><tr><th>ser</th><th>estar</th></tr>'+
  '<tr><td>who or what: <i>Soy maestra.</i></td><td>where: <i>Estoy en casa.</i></td></tr>'+
  '<tr><td>where from: <i>Es de Perú.</i></td><td>how you feel: <i>Está cansada.</i></td></tr>'+
  '<tr><td>what it’s like: <i>Es simpática.</i></td><td>a change or state: <i>La sopa está fría.</i></td></tr>'+
  '<tr><td>time and dates: <i>Son las tres.</i></td><td>with -ando/-iendo: <i>Estoy comiendo.</i></td></tr>'+
  '<tr><td>where an event happens: <i>La fiesta es en mi casa.</i></td><td>result of an action: <i>La puerta está abierta.</i></td></tr></table>'+
  '<p><mark>Same adjective, new meaning:</mark> <i>es aburrido</i> (he’s boring) / <i>está aburrido</i> (he’s bored); <i>es listo</i> (clever) / <i>está listo</i> (ready); <i>es rico</i> (rich) / <i>está rico</i> (tasty).</p>',
 ex:[["Soy de Ohio, pero estoy en México.","I’m from Ohio, but I’m in Mexico."],["Mi hermana es alta.","My sister is tall."],["Estoy muy cansada.","I’m very tired."],["La fiesta es en mi casa.","The party is at my house."]],
 able:"choose ser or estar and explain why.",
 q:[
  {q:"“I’m in the kitchen” is…", a:"Estoy en la cocina.", w:["Soy en la cocina.","Es en la cocina.","Hay en la cocina."], e:"Location of a person or thing takes estar."},
  {q:"Your friend says the soup “está rica”. She means…", a:"it tastes good", w:["it is expensive","it is always rich","it is from a rich place"], e:"With estar, rico means delicious; with ser, wealthy."},
  {q:"“The party is at my house” is…", a:"La fiesta es en mi casa.", w:["La fiesta está en mi casa.","La fiesta hay en mi casa.","La fiesta estás en mi casa."], e:"Where an event takes place uses ser, an exception to the location rule."},
  {q:"“He’s bored” is…", a:"Está aburrido.", w:["Es aburrido.","Son aburrido.","Está aburrida."], e:"Estar describes a feeling; es aburrido would mean he’s boring."},
  {q:"“It’s three o’clock” is…", a:"Son las tres.", w:["Están las tres.","Es tres.","Hay las tres."], e:"Time uses ser, plural after one o’clock."},
  {q:"Which sentence uses ser because of origin?", a:"Mi padre es de Colombia.", w:["Mi padre está en Colombia.","Mi padre está contento.","Mi padre está trabajando."], e:"Where someone is from is part of who they are: ser."}
 ]},
{k:"haytener", title:"Hay, and the tener phrases", src:"MSG ch. 38, 34.4, 46 · EG ch. 16",
 point:"Hay = there is / there are, for one thing or many. And Spanish “has” hunger, age and fear where English “is” hungry, old and afraid.",
 body:'<ul><li><b>hay</b> (there is/are), <b>había</b> (there was/were), <b>va a haber</b> (there’s going to be): <i>Hay un problema. Hay muchas personas.</i></li>'+
  '<li><mark>hay vs estar:</mark> hay introduces something new (<i>Hay un banco cerca</i>); estar locates something known (<i>El banco está cerca</i>).</li>'+
  '<li><b>tener</b> phrases: <i>tener … años</i> (be … years old), <i>tener hambre</i> (be hungry), <i>tener sed</i> (thirsty), <i>tener frío / calor</i> (cold / hot), <i>tener miedo</i> (afraid), <i>tener sueño</i> (sleepy), <i>tener razón</i> (be right), <i>tener prisa</i> (be in a hurry).</li>'+
  '<li><b>tener que</b> + infinitive = have to: <i>Tengo que irme.</i></li>'+
  '<li>Weather uses <b>hacer</b>: <i>Hace frío. Hace sol. Hace buen tiempo.</i></li></ul>',
 ex:[["Hay un banco en la esquina.","There’s a bank on the corner."],["Tengo veinte años.","I’m twenty years old."],["Tengo mucha hambre.","I’m very hungry."],["Hace mucho frío hoy.","It’s very cold today."]],
 able:"say how old you are, how you feel with tener, what there is with hay, and the weather with hace.",
 q:[
  {q:"“I’m twenty years old” is…", a:"Tengo veinte años.", w:["Soy veinte años.","Estoy veinte años.","Hay veinte años."], e:"Age uses tener: you “have” years."},
  {q:"“There are many people” is…", a:"Hay muchas personas.", w:["Son muchas personas.","Están muchas personas.","Tienen muchas personas."], e:"Hay works for one thing or many."},
  {q:"You’re cold. You say…", a:"Tengo frío.", w:["Estoy frío.","Soy frío.","Hace frío yo."], e:"A person feeling cold uses tener. Hace frío is the weather."},
  {q:"Which is right for a place you already mentioned?", a:"El banco está en la esquina.", w:["Hay el banco en la esquina.","El banco es en la esquina.","El banco hay en la esquina."], e:"Hay presents something new; estar locates something known."},
  {q:"“You’re right” is…", a:"Tienes razón.", w:["Eres razón.","Estás razón.","Hay razón."], e:"Tener razón = to be right."}
 ]},
{k:"questions", title:"Asking questions, and saying no", src:"EG ch. 24, 27 · MSG ch. 12, 15, 31–32",
 point:"A yes/no question is a statement with a rising voice. Question words carry an accent. “No” goes right before the verb, and double negatives are correct.",
 body:'<ul><li><i>¿Tienes tiempo?</i> Same words as a statement, voice goes up. Written with ¿ at the start.</li>'+
  '<li>Question words: <i>¿qué? ¿quién? ¿dónde? ¿adónde? ¿cuándo? ¿cómo? ¿por qué? ¿cuánto/a/os/as? ¿cuál?</i> The verb usually follows: <i>¿Dónde vive tu hermano?</i></li>'+
  '<li><mark>¿Qué or ¿cuál?</mark> Before ser, “what is your…?” is <i>¿Cuál es tu nombre?</i> ¿Qué es…? asks for a definition.</li>'+
  '<li><b>No</b> goes before the verb (and before any object pronoun): <i>No lo sé.</i></li>'+
  '<li><mark>Double negatives are normal</mark>: <i>No veo nada. No viene nadie. No voy nunca.</i> Or put the negative word first with no “no”: <i>Nunca voy.</i></li></ul>',
 ex:[["¿Adónde vas?","Where are you going?"],["¿Cuál es tu número?","What’s your number?"],["No tengo nada.","I don’t have anything."],["Nunca llego tarde.","I’m never late."]],
 able:"ask the main question-word questions and make any sentence negative.",
 q:[
  {q:"“I don’t see anything” is…", a:"No veo nada.", w:["Veo nada.","No veo algo.","Nada no veo."], e:"Spanish needs both: no + nada."},
  {q:"“What is your address?” begins…", a:"¿Cuál es…?", w:["¿Qué es…?","¿Cómo es…?","¿Quién es…?"], e:"“What is your…” uses cuál with ser. ¿Qué es? asks for a definition."},
  {q:"“Where are you going?” is…", a:"¿Adónde vas?", w:["¿Dónde estás?","¿Dónde vienes?","¿Cuándo vas?"], e:"Adónde = to where, used with verbs of motion."},
  {q:"How do you make “¿Tienes tiempo?” from “Tienes tiempo”?", a:"Only the voice rises", w:["Put the verb last","Add “do” at the start","Change to the usted form"], e:"No word changes; intonation (and ¿?) makes the question."},
  {q:"Which also means “I never go”?", a:"Nunca voy.", w:["No nunca voy.","Voy nunca.","Nunca no voy."], e:"Put the negative first and drop no, or say No voy nunca."}
 ]},
{k:"gustar", title:"Gustar: how Spanish “likes”", src:"MSG ch. 58 · EG ch. 8",
 point:"Me gusta el café = coffee pleases me. The thing you like is the subject, so the verb is gusta for one thing and gustan for more.",
 body:'<table class="tbl"><tr><th>to me</th><td>me gusta(n)</td></tr><tr><th>to you</th><td>te gusta(n)</td></tr><tr><th>to him, her, you (polite)</th><td>le gusta(n)</td></tr><tr><th>to us</th><td>nos gusta(n)</td></tr><tr><th>to them, you all</th><td>les gusta(n)</td></tr></table>'+
  '<ul><li><i>Me gusta el libro. Me gust<b>an</b> los libros. Me gusta leer.</i> (An activity is singular.)</li>'+
  '<li>To name the person, add <b>a</b>: <i>A María le gusta bailar. A mí me gusta, ¿y a ti?</i></li>'+
  '<li><mark>Same pattern:</mark> <i>encantar</i> (love it), <i>interesar</i>, <i>importar</i> (matter), <i>doler</i> (hurt: <i>me duelen los pies</i>), <i>faltar</i> (be missing), <i>quedar</i> (fit, be left).</li></ul>',
 ex:[["Me gustan los perros.","I like dogs."],["¿Te gusta cocinar?","Do you like to cook?"],["A mi mamá le encanta el café.","My mom loves coffee."],["Me duelen los pies.","My feet hurt."]],
 able:"say what you and others like, love and what hurts, with gusta or gustan.",
 q:[
  {q:"“I like the flowers” is…", a:"Me gustan las flores.", w:["Me gusta las flores.","Yo gusto las flores.","Me gusto las flores."], e:"The flowers are plural and are the subject, so gustan."},
  {q:"“Do you like to dance?” (friend) is…", a:"¿Te gusta bailar?", w:["¿Te gustan bailar?","¿Tú gustas bailar?","¿Le gusta bailar?"], e:"An activity is singular: gusta. Te for a friend."},
  {q:"“My feet hurt” is…", a:"Me duelen los pies.", w:["Me duele los pies.","Mis pies duelen a mí.","Tengo duelen los pies."], e:"Doler works like gustar; the feet are plural."},
  {q:"“Juan likes coffee” is…", a:"A Juan le gusta el café.", w:["Juan gusta el café.","A Juan les gusta el café.","Juan le gustan el café."], e:"a + person + le + gusta."},
  {q:"In “me gusta el café”, the grammatical subject is…", a:"el café", w:["me","gusta","yo, left unsaid"], e:"Literally: coffee is pleasing to me."}
 ]},
{k:"objects", title:"Him, her, it: object pronouns", src:"EG ch. 8 · MSG ch. 8.2–8.3",
 point:"Object pronouns go before a conjugated verb (Lo veo) or attach to an infinitive, a gerund or a yes-command (Voy a verlo; ¡Hazlo!).",
 body:'<table class="tbl"><tr><th></th><th>direct (it, him)</th><th>indirect (to him)</th></tr>'+
  '<tr><td>me</td><td>me</td><td>me</td></tr><tr><td>you</td><td>te</td><td>te</td></tr>'+
  '<tr><td>him, it, you (polite)</td><td>lo</td><td>le</td></tr><tr><td>her, it, you (polite)</td><td>la</td><td>le</td></tr>'+
  '<tr><td>us</td><td>nos</td><td>nos</td></tr><tr><td>them, you all</td><td>los · las</td><td>les</td></tr></table>'+
  '<ul><li><i>¿El libro? Lo tengo.</i> · <i>Le doy el libro a Ana.</i></li>'+
  '<li>Both together: indirect first, and <mark>le/les become se</mark> before lo/la: <i>Se lo doy.</i> (I give it to her.)</li>'+
  '<li>With two verbs, either spot works: <i>Lo quiero ver = Quiero verlo.</i></li></ul>',
 ex:[["¿La llave? No la encuentro.","The key? I can’t find it."],["Te quiero.","I love you."],["Se lo digo mañana.","I’ll tell him tomorrow."],["Voy a llamarla.","I’m going to call her."]],
 able:"replace a noun with lo/la/le and place the pronoun correctly.",
 q:[
  {q:"“The book? I have it.” is…", a:"¿El libro? Lo tengo.", w:["¿El libro? Tengo lo.","¿El libro? Le tengo.","¿El libro? La tengo."], e:"Lo replaces a masculine thing and goes before the verb."},
  {q:"“I give it to her” is…", a:"Se lo doy.", w:["Le lo doy.","Lo le doy.","Se la doy a lo."], e:"le becomes se before lo."},
  {q:"Which is also correct for “Lo quiero ver”?", a:"Quiero verlo.", w:["Quiero lo ver.","Quiero ver lo.","Lo quiero verlo."], e:"A pronoun may attach to the infinitive."},
  {q:"“Call me!” (to a friend) is…", a:"¡Llámame!", w:["¡Me llama!","¡Llama me!","¡Me llámame!"], e:"Pronouns attach to yes-commands; the accent keeps the stress."},
  {q:"“Te quiero” means…", a:"I love you", w:["You love me","I want tea","Do you want?"], e:"Te = you (object). Quiero = I want / I love."}
 ]},
{k:"reflexive", title:"Reflexive verbs: me levanto", src:"EG ch. 14 · MSG ch. 23",
 point:"When you do something to yourself, the verb takes a matching pronoun: me levanto, te levantas, se levanta. Daily routine is full of them.",
 body:'<ul><li>Pronouns: <b>me, te, se, nos, se</b>, before the verb: <i>Me ducho a las siete.</i></li>'+
  '<li>Routine: <i>despertarse</i> (wake up), <i>levantarse</i> (get up), <i>ducharse</i>, <i>vestirse</i> (get dressed), <i>acostarse</i> (go to bed), <i>llamarse</i> (be called).</li>'+
  '<li><mark>Changes the meaning</mark>: <i>ir</i> (go) / <i>irse</i> (leave); <i>dormir</i> (sleep) / <i>dormirse</i> (fall asleep); <i>quedar</i> (arrange to meet) / <i>quedarse</i> (stay).</li>'+
  '<li>“Each other”: <i>Nos vemos mañana.</i> (We’ll see each other.)</li>'+
  '<li>Body parts take “the”, not “my”: <i>Me lavo las manos.</i></li></ul>',
 ex:[["Me levanto a las seis.","I get up at six."],["¿A qué hora te acuestas?","What time do you go to bed?"],["Me voy.","I’m leaving."],["Nos vemos mañana.","See you tomorrow."]],
 able:"describe your daily routine with reflexive verbs.",
 q:[
  {q:"“I get up at seven” is…", a:"Me levanto a las siete.", w:["Levanto a las siete.","Se levanto a las siete.","Me levanta a las siete."], e:"Yo → me + levanto."},
  {q:"“I wash my hands” is…", a:"Me lavo las manos.", w:["Lavo mis manos a mí.","Me lavo mis manos.","Se lava las manos."], e:"The reflexive already says whose; body parts take the article."},
  {q:"“Me voy” means…", a:"I’m leaving", w:["I go myself","I see myself","I’m coming"], e:"Irse = to leave, go away."},
  {q:"“Nos vemos” means…", a:"we’ll see each other", w:["we see ourselves in a mirror","they see us","we saw you"], e:"The plural reflexive can mean each other."},
  {q:"Which pronoun goes with ellos?", a:"se", w:["les","los","nos"], e:"me, te, se, nos, se."}
 ]},
{k:"future", title:"Talking about the future", src:"EG ch. 11 · MSG ch. 72",
 point:"In speech, ir a + infinitive is the everyday future: Voy a comer. The future tense (comeré) sounds more formal or certain, and also means “probably”.",
 body:'<ul><li><b>ir a + infinitive</b>: <i>voy a estudiar, vas a ver, vamos a comer</i>. <i>¡Vamos a…!</i> also means “Let’s…!”</li>'+
  '<li><b>Future tense</b>: the whole infinitive + <b>-é, -ás, -á, -emos, -án</b>: <i>hablaré, comerás, vivirá</i>.</li>'+
  '<li><mark>Irregular stems</mark>, same endings: <i>tendr-, vendr-, pondr-, saldr-, podr-, sabr-, habr-, querr-, har-, dir-</i>.</li>'+
  '<li>Guessing: <i>¿Dónde estará Juan?</i> (Where can Juan be?) <i>Serán las diez.</i> (It must be about ten.)</li>'+
  '<li>The present with a time word works too: <i>Mañana trabajo.</i></li></ul>',
 ex:[["Voy a llamar a mi mamá.","I’m going to call my mom."],["¿Qué vas a hacer mañana?","What are you going to do tomorrow?"],["Tendré tiempo el lunes.","I’ll have time on Monday."],["¿Qué hora será?","I wonder what time it is."]],
 able:"talk about plans with ir a and recognize the future tense.",
 q:[
  {q:"“I’m going to study” is…", a:"Voy a estudiar.", w:["Voy estudiar.","Voy a estudio.","Estoy a estudiar."], e:"ir + a + infinitive."},
  {q:"“I will have” (future of tener) is…", a:"tendré", w:["teneré","tengaré","tenré"], e:"Tener uses the stem tendr-."},
  {q:"“¿Dónde estará mi llave?” means…", a:"Where could my key be?", w:["Where was my key?","Where will I put my key?","Where is my key right now?"], e:"The future can express a guess about the present."},
  {q:"“We will do it” is…", a:"Lo haremos.", w:["Lo haceremos.","Lo hacemos mañana.","Lo hacíamos."], e:"Hacer’s future stem is har-: haremos."},
  {q:"“¡Vamos a comer!” can mean…", a:"Let’s eat!", w:["We ate!","Go eat!","We were eating!"], e:"Vamos a + infinitive also makes a suggestion."}
 ]},
{k:"past", title:"The past: preterite or imperfect", src:"EG ch. 11 · MSG ch. 17, 73",
 point:"Preterite = a completed event, a snapshot (fui, comí). Imperfect = the background, what used to happen or was going on (iba, comía). A story needs both.",
 body:'<table class="tbl"><tr><th>preterite: what happened</th><th>imperfect: how things were</th></tr>'+
  '<tr><td>one finished event: <i>Ayer comí pizza.</i></td><td>a habit: <i>De niña comía pizza los viernes.</i></td></tr>'+
  '<tr><td>a sequence: <i>Llegué, cené y me acosté.</i></td><td>description, time, age: <i>Eran las diez. Tenía diez años.</i></td></tr>'+
  '<tr><td>a set length: <i>Viví allí dos años.</i></td><td>what was going on: <i>Llovía.</i></td></tr>'+
  '<tr><td>interrupts: <i>…cuando sonó el teléfono.</i></td><td>was in progress: <i>Dormía cuando…</i></td></tr></table>'+
  '<p><mark>Clue words</mark>: ayer, anoche, el año pasado, de repente → preterite. Siempre, todos los días, de niño, mientras → imperfect.</p>'+
  '<p>Regular preterite: <i>hablé, hablaste, habló, hablamos, hablaron · comí, comiste, comió, comimos, comieron</i>. Imperfect: <i>hablaba… · comía…</i>. Only ser, ir, ver are irregular in the imperfect.</p>',
 ex:[["Ayer fui al mercado.","Yesterday I went to the market."],["Cuando era niña, vivía en Texas.","When I was a girl, I lived in Texas."],["Estaba en casa cuando llamaste.","I was home when you called."],["Llegué, cené y me acosté.","I got home, had dinner and went to bed."]],
 able:"tell a short story with the preterite for events and the imperfect for background.",
 q:[
  {q:"“When I was little I played soccer every Saturday” uses…", a:"the imperfect (jugaba)", w:["the preterite (jugué)","the future (jugaré)","the present (juego)"], e:"A past habit: imperfect."},
  {q:"“Yesterday I went to the doctor” is…", a:"Ayer fui al médico.", w:["Ayer iba al médico.","Ayer voy al médico.","Ayer he ido al médico."], e:"One finished event with ayer: preterite."},
  {q:"“I was sleeping when the phone rang” is…", a:"Dormía cuando sonó el teléfono.", w:["Dormí cuando sonaba el teléfono.","Dormía cuando sonaba el teléfono.","Dormí cuando sonó el teléfono."], e:"Background in progress (imperfect) interrupted by an event (preterite)."},
  {q:"“It was ten o’clock” is…", a:"Eran las diez.", w:["Fueron las diez.","Estaban las diez.","Estuvieron las diez."], e:"Time in the past is always imperfect."},
  {q:"Which clue points to the imperfect?", a:"todos los días", w:["ayer","de repente","el año pasado"], e:"Every day = a repeated habit."},
  {q:"“I lived there for two years (and then left)” is…", a:"Viví allí dos años.", w:["Vivía allí dos años.","Vivo allí dos años.","Viviré allí dos años."], e:"A closed, counted period takes the preterite."}
 ]},
{k:"perfect", title:"He comido · estoy comiendo", src:"EG ch. 11, 18 · MSG ch. 16–17, 20",
 point:"haber + participle = have done (He comido). estar + gerund = be doing right now (Estoy comiendo).",
 body:'<ul><li><b>Present perfect</b>: <i>he, has, ha, hemos, han</i> + <i>-ado / -ido</i>: <i>He terminado. ¿Has comido?</i></li>'+
  '<li>Nothing goes between the two parts: <i>Ya lo he hecho.</i> (never “he lo hecho”).</li>'+
  '<li><mark>Irregular participles</mark>: <i>hecho, dicho, visto, puesto, vuelto, escrito, abierto, roto, muerto</i>.</li>'+
  '<li>Latin America often uses the preterite where Spain uses the perfect: <i>¿Ya comiste?</i> (EG ch. 30).</li>'+
  '<li><b>Progressive</b>: <i>estoy, estás, está…</i> + <i>-ando / -iendo</i> (<i>leyendo, durmiendo, pidiendo</i>). Only for what is in progress now, not plans.</li></ul>',
 ex:[["¿Has comido?","Have you eaten?"],["Nunca he visto el mar.","I’ve never seen the sea."],["Estoy leyendo un libro.","I’m reading a book."],["¿Qué estás haciendo?","What are you doing?"]],
 able:"say what you have done and what you are doing right now.",
 q:[
  {q:"“I have seen” is…", a:"he visto", w:["he veído","ha visto","he vido"], e:"Ver has the irregular participle visto."},
  {q:"“What are you doing (right now)?” is…", a:"¿Qué estás haciendo?", w:["¿Qué eres haciendo?","¿Qué has hacer?","¿Qué estás hacer?"], e:"estar + gerund."},
  {q:"“I have already done it” is…", a:"Ya lo he hecho.", w:["Ya he lo hecho.","Ya lo he hacido.","Ya lo ha hecho."], e:"The pronoun goes before haber; the parts never split."},
  {q:"The gerund of “dormir” is…", a:"durmiendo", w:["dormiendo","duermiendo","dormando"], e:"-ir stem changers go o → u in the gerund."},
  {q:"“We have written” is…", a:"hemos escrito", w:["hemos escribido","habemos escrito","han escrito"], e:"Escribir → escrito, and nosotros → hemos."}
 ]},
{k:"porpara", title:"Por or para", src:"EG ch. 22 · MSG ch. 25, 43",
 point:"Para looks ahead to a goal: a purpose, a destination, a deadline, a recipient. Por looks back at a cause or goes through: reason, exchange, duration, route, “per”.",
 body:'<table class="tbl"><tr><th>para: toward a goal</th><th>por: cause, exchange, through</th></tr>'+
  '<tr><td>purpose: <i>Estudio para aprender.</i></td><td>reason: <i>Gracias por todo.</i></td></tr>'+
  '<tr><td>destination: <i>Salgo para Miami.</i></td><td>through, along: <i>Caminamos por el parque.</i></td></tr>'+
  '<tr><td>recipient: <i>Es para ti.</i></td><td>exchange: <i>Lo compré por diez dólares.</i></td></tr>'+
  '<tr><td>deadline: <i>para el lunes</i></td><td>duration, time of day: <i>por dos horas, por la mañana</i></td></tr>'+
  '<tr><td>opinion: <i>Para mí, es fácil.</i></td><td>means: <i>por teléfono</i>; per: <i>dos veces por semana</i></td></tr></table>'+
  '<p><mark>Set phrases with por</mark>: <i>por favor, por eso, por fin, por ejemplo, por supuesto</i>.</p>',
 ex:[["Este regalo es para ti.","This gift is for you."],["Gracias por tu ayuda.","Thanks for your help."],["Hablamos por teléfono.","We talked on the phone."],["Tengo que terminarlo para el viernes.","I have to finish it by Friday."]],
 able:"pick por or para by asking: goal ahead, or cause and exchange?",
 q:[
  {q:"“Thanks for everything” is…", a:"Gracias por todo.", w:["Gracias para todo.","Gracias de todo.","Gracias a todo."], e:"Thanking for a reason uses por."},
  {q:"“This is for you” is…", a:"Esto es para ti.", w:["Esto es por ti.","Esto es a ti.","Esto es de ti."], e:"A recipient takes para."},
  {q:"“I paid 20 dollars for it” is…", a:"Pagué veinte dólares por él.", w:["Pagué veinte dólares para él.","Pagué veinte dólares a él.","Pagué para veinte dólares."], e:"An exchange uses por."},
  {q:"“I study in order to learn” is…", a:"Estudio para aprender.", w:["Estudio por aprender.","Estudio a aprender.","Estudio de aprender."], e:"Purpose (in order to) uses para."},
  {q:"“Twice a week” is…", a:"dos veces por semana", w:["dos veces para semana","dos veces de semana","dos veces en semana"], e:"“Per” is por."}
 ]},
{k:"commands", title:"Telling someone to do something", src:"EG ch. 19 · MSG ch. 67–69",
 point:"To a friend, the yes-command is the él form: ¡Habla! ¡Come! Eight are short (di, haz, ve, pon, sal, sé, ten, ven). No-commands and usted commands use the subjunctive.",
 body:'<table class="tbl"><tr><th></th><th>tú: yes</th><th>tú: no</th><th>usted</th></tr>'+
  '<tr><td>hablar</td><td>habla</td><td>no hables</td><td>hable</td></tr>'+
  '<tr><td>comer</td><td>come</td><td>no comas</td><td>coma</td></tr>'+
  '<tr><td>venir</td><td>ven</td><td>no vengas</td><td>venga</td></tr>'+
  '<tr><td>hacer</td><td>haz</td><td>no hagas</td><td>haga</td></tr>'+
  '<tr><td>ir</td><td>ve</td><td>no vayas</td><td>vaya</td></tr></table>'+
  '<ul><li>Pronouns attach to yes-commands and go before no-commands: <i>¡Dímelo! · ¡No me lo digas!</i></li>'+
  '<li><mark>Softer requests</mark> are often questions: <i>¿Me pasas la sal? ¿Podría ayudarme?</i> (MSG ch. 68).</li></ul>',
 ex:[["¡Ven aquí!","Come here!"],["Dime la verdad.","Tell me the truth."],["No te preocupes.","Don’t worry."],["Siga derecho, por favor.","Go straight ahead, please."]],
 able:"give a friend a yes and a no command, and make a polite request.",
 q:[
  {q:"“Come here!” (to a friend) is…", a:"¡Ven aquí!", w:["¡Viene aquí!","¡Venga tú aquí!","¡Vienes aquí!"], e:"Venir has the short command ven."},
  {q:"“Don’t worry” (to a friend) is…", a:"No te preocupes.", w:["No te preocupa.","No preocúpate.","No te preocupas."], e:"No-commands use the subjunctive: preocupes."},
  {q:"“Tell me!” (friend) is…", a:"¡Dime!", w:["¡Me di!","¡Dices me!","¡Dígame tú!"], e:"di + me attached."},
  {q:"Politely asking a stranger to wait, you say…", a:"Espere un momento, por favor.", w:["Espera un momento, por favor.","Esperas un momento, por favor.","Esperar un momento, por favor."], e:"Usted commands use the subjunctive: espere."},
  {q:"“Don’t go!” (friend) is…", a:"¡No te vayas!", w:["¡No ve!","¡No vas!","¡No vete!"], e:"irse → no te vayas (subjunctive)."}
 ]},
{k:"subjunctive", title:"The subjunctive: the basics", later:true, src:"EG ch. 12 · MSG ch. 18, 57, 62 · Cervantes: B1",
 point:"After “que”, when the first part wishes, asks, hopes, doubts or feels something about someone else’s action, the second verb goes into the subjunctive: Quiero que vengas.",
 body:'<ul><li><b>Form</b>: take the yo present, drop -o, swap the vowel: -ar → -e, -er/-ir → -a. <i>hablo → hable; tengo → tenga; digo → diga.</i></li>'+
  '<li>Six to memorize: <i>sea, esté, vaya, haya, dé, sepa</i>.</li>'+
  '<li><mark>Triggers</mark> (think “WEDDING”): wishes <i>quiero que</i>, emotions <i>me alegra que</i>, doubt <i>no creo que</i>, requests <i>te pido que</i>, hope <i>ojalá, espero que</i>.</li>'+
  '<li>Same subject? Use the infinitive: <i>Quiero ir.</i> Different subjects: <i>Quiero que tú vayas.</i></li>'+
  '<li><i>cuando</i> about the future: <i>Cuando llegues, llámame.</i> · <i>para que</i> always: <i>para que lo sepas</i>.</li></ul>',
 ex:[["Quiero que vengas.","I want you to come."],["Espero que estés bien.","I hope you’re well."],["Ojalá que no llueva.","I hope it doesn’t rain."],["Cuando llegues, llámame.","When you arrive, call me."]],
 able:"use quiero que, espero que, ojalá and cuando + subjunctive.",
 q:[
  {q:"“I want you to come” is…", a:"Quiero que vengas.", w:["Quiero que vienes.","Quiero tú venir.","Quiero que venir."], e:"Wish + que + different subject → subjunctive."},
  {q:"“I hope you are well” is…", a:"Espero que estés bien.", w:["Espero que estás bien.","Espero que eres bien.","Espero estar bien tú."], e:"Hope triggers the subjunctive: estés."},
  {q:"“I want to go” (you yourself) is…", a:"Quiero ir.", w:["Quiero que vaya.","Quiero que voy.","Quiero que ir."], e:"Same subject → infinitive, no que."},
  {q:"The subjunctive of “tener” (yo) is…", a:"tenga", w:["tena","tiene","tenie"], e:"From the yo form tengo → teng + a."},
  {q:"“When you get home, call me” is…", a:"Cuando llegues a casa, llámame.", w:["Cuando llegas a casa, llámame.","Cuando llegarás a casa, llámame.","Cuando llegaste a casa, llámame."], e:"Cuando about the future takes the subjunctive."}
 ]},
{k:"compare", title:"Comparing: more, less, as… as", src:"EG ch. 26 · MSG ch. 6, 37",
 point:"más … que (more … than), menos … que (less … than), tan … como (as … as). And four short forms: mejor, peor, mayor, menor.",
 body:'<ul><li><i>Mi hermana es más alta que yo. Este es menos caro que ese.</i></li>'+
  '<li><i>tan … como</i> with adjectives: <i>Es tan alto como su padre.</i> <i>tanto/a/os/as … como</i> with nouns: <i>Tengo tantos libros como tú.</i></li>'+
  '<li><mark>Irregular</mark>: <i>mejor</i> (better), <i>peor</i> (worse), <i>mayor</i> (older), <i>menor</i> (younger): never “más bueno” for better.</li>'+
  '<li>The most: <i>el/la más …</i>: <i>Es la ciudad más bonita del país.</i> (Note: <b>de</b> for “in”.)</li>'+
  '<li>With numbers use <b>de</b>: <i>más de cien personas</i>.</li></ul>',
 ex:[["Mi hermano es mayor que yo.","My brother is older than me."],["Este café es mejor.","This coffee is better."],["Es tan bonita como su mamá.","She’s as pretty as her mom."],["Es el mejor día del año.","It’s the best day of the year."]],
 able:"compare two people or things and say “the most … in”.",
 q:[
  {q:"“Better than” is…", a:"mejor que", w:["más bueno que","más mejor que","bien que"], e:"Bueno → mejor."},
  {q:"“As tall as” is…", a:"tan alto como", w:["tan alto que","tanto alto como","más alto como"], e:"tan + adjective + como."},
  {q:"“My younger sister” is…", a:"mi hermana menor", w:["mi hermana más joven que","mi hermana menos","mi hermana pequeña que"], e:"Menor = younger (for siblings)."},
  {q:"“The biggest city in the country” is…", a:"la ciudad más grande del país", w:["la ciudad más grande en el país","la más ciudad grande del país","la ciudad mayor que el país"], e:"The most … uses el/la más …, and “in” is de."},
  {q:"“More than a hundred people” is…", a:"más de cien personas", w:["más que cien personas","más cien personas","tan cien personas"], e:"With numbers, de replaces que."}
 ]},
{k:"possess", title:"My, your; this, that", src:"EG ch. 4–5 · MSG ch. 9–10",
 point:"mi, tu, su (my, your, his/her/their) go before the noun and add -s in the plural. este / ese / aquel = this / that / that over there.",
 body:'<ul><li><i>mi casa, mis casas · tu amigo, tus amigos · su libro</i> (his, her, your-polite, their) · <i>nuestro/a/os/as</i> (our).</li>'+
  '<li><mark>Su is ambiguous</mark>: make it clear with de: <i>el libro de ella</i>.</li>'+
  '<li>After ser or a noun, the long forms: <i>Es mío. Es tuyo. Un amigo mío</i> (a friend of mine).</li>'+
  '<li><b>este, esta, estos, estas</b> (this, near me) · <b>ese, esa</b> (that, near you) · <b>aquel, aquella</b> (that, over there). <b>esto, eso</b> for an idea or unknown thing: <i>¿Qué es eso?</i></li></ul>',
 ex:[["Mi hermana y sus hijos.","My sister and her children."],["¿Es tuyo este libro?","Is this book yours?"],["Esa casa es nuestra.","That house is ours."],["¿Qué es eso?","What is that?"]],
 able:"say whose something is and point to this, that and that over there.",
 q:[
  {q:"“My friends” is…", a:"mis amigos", w:["mi amigos","mío amigos","mis amigo"], e:"mi adds -s with a plural noun."},
  {q:"“Is it yours?” (friend) is…", a:"¿Es tuyo?", w:["¿Es tu?","¿Es tú?","¿Es tuya tú?"], e:"After ser, the long form: tuyo."},
  {q:"“That house over there” is…", a:"aquella casa", w:["esa casa allí","esta casa","aquel casa"], e:"Aquel/aquella = far from both speakers; feminine for casa."},
  {q:"“What is this?” (an unknown thing) is…", a:"¿Qué es esto?", w:["¿Qué es este?","¿Qué es esta?","¿Qué es aquel?"], e:"Esto (neuter) for something unidentified."},
  {q:"“Su casa” could mean all of these EXCEPT…", a:"my house", w:["his house","their house","your (polite) house"], e:"Su = his, her, its, their, your (usted/ustedes)."}
 ]}
];
