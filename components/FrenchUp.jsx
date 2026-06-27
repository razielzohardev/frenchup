"use client";
import React, { useState, useRef, useEffect } from "react";

/* ============================================================
   FrenchUp — Daily Quest  (Next.js)
   B2/C1 quest with local grading, tap-to-translate, -15 XP on
   wrong answers. Audio uses a NEURAL voice via /api/tts
   (ElevenLabs), with automatic fallback to the device voice.
   ============================================================ */

const INK = "#16203A";
const PAPER = "#F6F2E9";
const GOLD = "#C8A23A";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LKEY = "frenchup_level_v1";

const ROUNDS = [
  { id: "gra", he: "דקדוק", fr: "Grammaire", color: "#2563EB", icon: "✍️" },
  { id: "voc", he: "אוצר מילים", fr: "Vocabulaire", color: "#E8503A", icon: "🃏" },
  { id: "com", he: "הבנה", fr: "Compréhension", color: "#0E9F6E", icon: "📖" },
  { id: "exp", he: "דיבור", fr: "Expression", color: "#8B5CF6", icon: "💬" },
];

/* -------------------- EXERCISE BANKS -------------------- */
const BANK_A1 = {
  gra: [
    { instruction_he:"השלם בצורת הפועל הנכונה (être)", prompt_fr:"Je ____ (être) étudiant.", trans_he:"אני סטודנט.", accepted:["suis"], solution_fr:"Je suis étudiant.", explanation_he:"הפועל être בגוף ראשון יחיד: je suis.", tip_he:"être: je suis, tu es, il/elle est, nous sommes, vous êtes, ils sont." },
    { instruction_he:"השלם בצורת הפועל הנכונה (avoir)", prompt_fr:"Elle ____ (avoir) un chat.", trans_he:"יש לה חתול.", accepted:["a"], solution_fr:"Elle a un chat.", explanation_he:"avoir בגוף שלישי יחיד: il/elle a.", tip_he:"avoir: j'ai, tu as, il/elle a, nous avons, vous avez, ils ont." },
    { instruction_he:"השלם בסיומת הנכונה לרבים", prompt_fr:"Les ____ (chat) sont mignons.", trans_he:"החתולים חמודים.", accepted:["chats"], solution_fr:"Les chats sont mignons.", explanation_he:"רוב שמות העצם מקבלים -s ברבים.", tip_he:"chien→chiens, livre→livres, ami→amis." },
    { instruction_he:"הוסף שלילה נכונה (ne...pas)", prompt_fr:"Je ____ mange ____ de viande.", trans_he:"אני לא אוכל בשר.", accepted:["ne...pas","ne / pas"], solution_fr:"Je ne mange pas de viande.", explanation_he:"שלילה: ne + פועל + pas. אחרי שלילה: de במקום du/de la/des.", tip_he:"ne...pas עוטף את הפועל: je ne mange pas." },
    { instruction_he:"השלם בסיומת הנקבה של שם התואר", prompt_fr:"Marie est une étudiante ____. (intelligent→?)", trans_he:"מארי היא סטודנטית חכמה.", accepted:["intelligente"], solution_fr:"Marie est une étudiante intelligente.", explanation_he:"intelligent (זכר) → intelligente (נקבה): מוסיפים -e.", tip_he:"grand→grande, petit→petite, content→contente." },
    { instruction_he:"השלם במאמר הנכון (le / la / les)", prompt_fr:"____ soleil brille aujourd'hui.", trans_he:"השמש זורחת היום.", accepted:["Le"], solution_fr:"Le soleil brille aujourd'hui.", explanation_he:"soleil הוא זכר → le soleil.", tip_he:"le = זכר יחיד · la = נקבה יחיד · les = רבים." },
  ],
  voc: [
    { instruction_he:"תרגם לצרפתית: «שלום / בוקר טוב»", prompt_fr:"____ ! Comment allez-vous ?", trans_he:"שלום! מה שלומכם?", accepted:["Bonjour","bonjour"], solution_fr:"Bonjour", explanation_he:"Bonjour = שלום/בוקר טוב (רשמי). Salut = היי (לא רשמי).", tip_he:"Bonjour (ביום) · Bonsoir (ערב) · Salut (לא רשמי)." },
    { instruction_he:"תרגם לצרפתית: «תודה רבה»", prompt_fr:"____ beaucoup !", trans_he:"תודה רבה!", accepted:["Merci","merci"], solution_fr:"Merci beaucoup !", explanation_he:"Merci = תודה. Merci beaucoup = תודה רבה.", tip_he:"De rien = אין על מה · Avec plaisir = בשמחה." },
    { instruction_he:"תרגם לצרפתית: «אמא»", prompt_fr:"Ma ____ s'appelle Sophie.", trans_he:"אמא שלי נקראת סופי.", accepted:["mère","maman"], solution_fr:"Ma mère / maman", explanation_he:"mère = אמא (רשמי) · maman = אמא (חיבה).", tip_he:"père = אבא · mère = אמא · frère = אח · sœur = אחות." },
    { instruction_he:"תרגם לצרפתית: «כחול»", prompt_fr:"Le ciel est ____.", trans_he:"השמיים כחולים.", accepted:["bleu","bleue"], solution_fr:"bleu", explanation_he:"bleu = כחול. rouge = אדום, vert = ירוק, blanc = לבן, noir = שחור.", tip_he:"צבעים: rouge, bleu, vert, jaune, blanc, noir, gris, orange." },
    { instruction_he:"תרגם לצרפתית: «יום שני»", prompt_fr:"Aujourd'hui c'est ____.", trans_he:"היום יום שני.", accepted:["lundi"], solution_fr:"lundi", explanation_he:"ימי השבוע: lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche.", tip_he:"ימי השבוע מתחילים ב-lundi (שני)." },
    { instruction_he:"תרגם לצרפתית: «אני אוהב»", prompt_fr:"J'____ le chocolat.", trans_he:"אני אוהב שוקולד.", accepted:["aime"], solution_fr:"J'aime", explanation_he:"aimer = לאהוב. J'aime + מאמר: J'aime le chocolat.", tip_he:"J'aime · Je n'aime pas · J'adore (מאוד אוהב)." },
  ],
  com: [
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"— Bonjour ! Vous voulez quelque chose ?\n— Oui, un café, s'il vous plaît.\n— Voilà. C'est deux euros.", trans_he:"— שלום! אתה רוצה משהו?\n— כן, קפה, בבקשה.\n— הנה. זה שני יורו.", question_fr:"Combien coûte le café ?", q_he:"כמה עולה הקפה?", options:["Un euro","Deux euros","Trois euros"], correct:1, explanation_he:"« C'est deux euros » = זה עולה שני יורו." },
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"Je m'appelle Lucas. J'ai dix-huit ans. Je suis français. J'habite à Paris avec ma famille.", trans_he:"שמי לוקאס. אני בן 18. אני צרפתי. אני גר בפריז עם משפחתי.", question_fr:"Où habite Lucas ?", q_he:"איפה לוקאס גר?", options:["À Lyon","À Paris","À Marseille"], correct:1, explanation_he:"« J'habite à Paris » = אני גר בפריז." },
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"Le lundi, Marie va à l'école. Le mercredi, elle fait du sport. Le samedi, elle regarde des films.", trans_he:"ביום שני מארי הולכת לבית ספר. ביום רביעי היא עושה ספורט. בשבת היא צופה בסרטים.", question_fr:"Quand est-ce que Marie fait du sport ?", q_he:"מתי מארי עושה ספורט?", options:["Le lundi","Le mercredi","Le samedi"], correct:1, explanation_he:"« Le mercredi, elle fait du sport » = ביום רביעי היא עושה ספורט." },
  ],
  exp: [
    { instruction_he:"הצג את עצמך בשלוש שורות (תשובה חופשית)", prompt_fr:"Présentez-vous : votre prénom, votre âge et votre ville.", trans_he:"הצג את עצמך: שמך, גילך ועירך.", model_fr:"Je m'appelle David. J'ai vingt ans. J'habite à Tel Aviv.", keys_fr:["Je m'appelle","J'ai ... ans","J'habite à"], tip_he:"Je m'appelle (שמי) · J'ai ... ans (אני בן/בת) · J'habite à (אני גר/ה ב-)." },
    { instruction_he:"תאר את המשפחה שלך (תשובה חופשית)", prompt_fr:"Décris ta famille.", trans_he:"תאר את המשפחה שלך.", model_fr:"Dans ma famille, il y a mon père, ma mère et ma sœur. Mon père s'appelle Ilan et ma mère s'appelle Miriam.", keys_fr:["dans ma famille","il y a","mon père","ma mère","il/elle s'appelle"], tip_he:"il y a = יש · mon père = אבא · ma mère = אמא · mon frère = אחי · ma sœur = אחותי." },
    { instruction_he:"מה אתה אוהב לעשות? (תשובה חופשית)", prompt_fr:"Qu'est-ce que tu aimes faire ? Donne deux exemples.", trans_he:"מה אתה אוהב לעשות? תן שני דוגמאות.", model_fr:"J'aime écouter de la musique et jouer au football. Je n'aime pas faire la cuisine.", keys_fr:["J'aime","Je n'aime pas","et","aussi"], tip_he:"J'aime + infinitif: J'aime jouer, écouter, regarder, lire." },
  ],
};

const BANK_A2 = {
  gra: [
    { instruction_he:"השלם בpassé composé (עם avoir)", prompt_fr:"Hier, j'____ (manger) une pizza.", trans_he:"אתמול אכלתי פיצה.", accepted:["ai mangé"], solution_fr:"Hier, j'ai mangé une pizza.", explanation_he:"passé composé עם avoir: j'ai + participe passé. manger → mangé.", tip_he:"manger→mangé · finir→fini · prendre→pris · faire→fait." },
    { instruction_he:"השלם בpassé composé (עם être)", prompt_fr:"Elle ____ (aller) au cinéma samedi.", trans_he:"היא הלכה לקולנוע בשבת.", accepted:["est allée","est allé"], solution_fr:"Elle est allée au cinéma samedi.", explanation_he:"aller לוקח être. ה-participe מתאים: elle → allée (נקבה).", tip_he:"פעלי תנועה לוקחים être: aller, venir, partir, arriver, sortir, entrer." },
    { instruction_he:"השלם בfutur proche", prompt_fr:"Ce soir, nous ____ (regarder) un film.", trans_he:"הלילה נצפה בסרט.", accepted:["allons regarder"], solution_fr:"Ce soir, nous allons regarder un film.", explanation_he:"futur proche = aller (מוטה) + infinitif.", tip_he:"je vais · tu vas · il/elle va · nous allons · vous allez · ils vont + infinitif." },
    { instruction_he:"השלם בסיומת התואר הנכונה (accord)", prompt_fr:"Ma voisine est très ____. (gentil→?)", trans_he:"השכנה שלי מאוד נחמדה.", accepted:["gentille"], solution_fr:"Ma voisine est très gentille.", explanation_he:"gentil (זכר) → gentille (נקבה): מכפילים -l ומוסיפים -e.", tip_he:"gentil→gentille · nul→nulle · pareil→pareille." },
    { instruction_he:"השלם בתואר הקניין הנכון", prompt_fr:"C'est le sac de Marie. C'est ____ sac.", trans_he:"זה התיק של מארי. זה התיק שלה.", accepted:["son"], solution_fr:"C'est son sac.", explanation_he:"son/sa/ses נקבע לפי המושא, לא הבעלים. sac הוא זכר → son.", tip_he:"son sac (זכר) · sa chambre (נקבה) · ses affaires (רבים)." },
    { instruction_he:"השלם בimparfait להרגל בעבר", prompt_fr:"Quand j'étais petit, j'____ (aimer) jouer dehors.", trans_he:"כשהייתי קטן אהבתי לשחק בחוץ.", accepted:["aimais"], solution_fr:"Quand j'étais petit, j'aimais jouer dehors.", explanation_he:"imparfait מביע הרגל בעבר. aimer → j'aimais.", tip_he:"imparfait = שורש nous בהווה + -ais/-ait/-ions/-aient." },
  ],
  voc: [
    { instruction_he:"תרגם לצרפתית: «יש לי כסף»", prompt_fr:"J'____ de l'argent.", trans_he:"יש לי כסף.", accepted:["ai"], solution_fr:"J'ai de l'argent.", explanation_he:"avoir = לקיים, להחזיק. j'ai de l'argent = יש לי כסף.", tip_he:"J'ai faim = אני רעב · J'ai soif = אני צמא · J'ai chaud = חם לי." },
    { instruction_he:"תרגם לצרפתית: «לעשות קניות»", prompt_fr:"J'aime faire ____ le week-end.", trans_he:"אני אוהב לעשות קניות בסוף השבוע.", accepted:["du shopping","les courses","les magasins"], solution_fr:"faire du shopping / les courses", explanation_he:"faire du shopping = לעשות קניות. faire les courses = לקנות מצרכים.", tip_he:"faire du sport · faire du vélo · faire de la natation · faire les courses." },
    { instruction_he:"תרגם לצרפתית: «מה השעה?»", prompt_fr:"____ est-il ?", trans_he:"מה השעה?", accepted:["Quelle heure","quelle heure"], solution_fr:"Quelle heure est-il ?", explanation_he:"Quelle heure est-il ? = מה השעה? תשובה: Il est trois heures.", tip_he:"Il est midi (12:00) · Il est minuit (00:00) · et demie = וחצי." },
    { instruction_he:"תרגם לצרפתית: «ראש כואב לי»", prompt_fr:"J'ai ____ à la tête.", trans_he:"ראש כואב לי.", accepted:["mal"], solution_fr:"J'ai mal à la tête.", explanation_he:"avoir mal à = לכאוב. J'ai mal à la tête (ראש), au ventre (בטן).", tip_he:"J'ai mal à la gorge (גרון) · J'ai de la fièvre (חום)." },
    { instruction_he:"תרגם לצרפתית: «ישר, ואחר כך שמאל»", prompt_fr:"Allez tout ____, puis à ____.", trans_he:"לכו ישר, ואז שמאלה.", accepted:["droit...gauche","droit / gauche"], solution_fr:"tout droit, puis à gauche", explanation_he:"tout droit = ישר · à gauche = שמאלה · à droite = ימינה.", tip_he:"tournez à gauche/droite · continuez tout droit · prenez la deuxième rue." },
    { instruction_he:"תרגם לצרפתית: «מהר מאוד»", prompt_fr:"Il parle ____.", trans_he:"הוא מדבר מהר מאוד.", accepted:["très vite","trop vite"], solution_fr:"très vite", explanation_he:"vite = מהר. très vite = מהר מאוד. lentement = לאט.", tip_he:"vite (מהר) · lentement (לאט) · bien (טוב) · souvent (לעתים קרובות)." },
  ],
  com: [
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"Sophie a vingt-deux ans. Elle est infirmière. Elle travaille à l'hôpital du lundi au vendredi. Le week-end, elle fait du yoga et elle lit des livres.", trans_he:"סופי בת 22. היא אחות. היא עובדת בבית חולים מ-שני עד שישי. בסוף שבוע היא עושה יוגה וקוראת ספרים.", question_fr:"Que fait Sophie le week-end ?", q_he:"מה סופי עושה בסוף השבוע?", options:["Elle travaille à l'hôpital","Elle fait du yoga et lit des livres","Elle sort avec des amis"], correct:1, explanation_he:"« le week-end, elle fait du yoga et elle lit des livres »." },
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"Demain, il va faire très chaud : 35 degrés. Il est conseillé de boire beaucoup d'eau et d'éviter le soleil entre 12h et 16h.", trans_he:"מחר יהיה חם מאוד: 35 מעלות. מומלץ לשתות הרבה מים ולהימנע מהשמש בין 12 ל-16.", question_fr:"Que faut-il éviter demain ?", q_he:"ממה כדאי להימנע מחר?", options:["Boire de l'eau","Le soleil l'après-midi","Sortir le matin"], correct:1, explanation_he:"« éviter le soleil entre 12h et 16h » = להימנע מהשמש בשעות אלו." },
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"Le musée est ouvert tous les jours sauf le mardi. L'entrée coûte 8 euros pour les adultes et 4 euros pour les enfants.", trans_he:"המוזיאון פתוח כל יום חוץ מיום שלישי. הכניסה עולה 8 יורו למבוגרים ו-4 יורו לילדים.", question_fr:"Quand le musée est-il fermé ?", q_he:"מתי המוזיאון סגור?", options:["Le lundi","Le mardi","Le dimanche"], correct:1, explanation_he:"« ouvert tous les jours sauf le mardi » = פתוח כל יום חוץ מיום שלישי." },
  ],
  exp: [
    { instruction_he:"ספר מה עשית אתמול (תשובה חופשית)", prompt_fr:"Qu'est-ce que tu as fait hier ? Utilise le passé composé.", trans_he:"מה עשית אתמול? השתמש ב-passé composé.", model_fr:"Hier, je me suis levé à sept heures. J'ai mangé des céréales. Ensuite, je suis allé au travail. Le soir, j'ai regardé un film.", keys_fr:["hier","j'ai + participe","je suis allé(e)","ensuite","le soir"], tip_he:"passé composé: j'ai mangé · j'ai regardé · je suis allé(e) · je suis rentré(e)." },
    { instruction_he:"תאר את הבית שלך (תשובה חופשית)", prompt_fr:"Décris ton appartement ou ta maison.", trans_he:"תאר את הדירה או הבית שלך.", model_fr:"J'habite dans un appartement au troisième étage. Il y a trois pièces : un salon, une chambre et une cuisine. C'est assez grand et lumineux.", keys_fr:["j'habite dans","il y a","un salon","une chambre","assez"], tip_he:"un salon (סלון) · une chambre (חדר שינה) · une cuisine (מטבח) · une salle de bains (חדר אמבטיה)." },
    { instruction_he:"תאר את סוף השבוע שלך בדרך כלל (תשובה חופשית)", prompt_fr:"Raconte ce que tu fais normalement le week-end.", trans_he:"ספר מה אתה עושה בדרך כלל בסוף השבוע.", model_fr:"Le samedi matin, je fais les courses au marché. L'après-midi, je retrouve mes amis en ville. Le dimanche, je reste chez moi et je lis.", keys_fr:["le samedi","le dimanche","je fais","l'après-midi","en ville"], tip_he:"présent לתיאור הרגל: je fais, je retrouve, je reste, je lis." },
  ],
};

const BANK_B1 = {
  gra: [
    { instruction_he:"השלם בimparfait או passé composé הנכון", prompt_fr:"Quand le téléphone a sonné, je ____ (dormir).", trans_he:"כשהטלפון צלצל, ישנתי.", accepted:["dormais"], solution_fr:"Quand le téléphone a sonné, je dormais.", explanation_he:"passé composé לפעולה חדה (a sonné), imparfait לרקע מתמשך (dormais).", tip_he:"imparfait = רקע/מצב · passé composé = פעולה חדה." },
    { instruction_he:"השלם בכינוי הזיקה הנכון (qui / que)", prompt_fr:"C'est l'ami ____ j'ai rencontré hier.", trans_he:"זה החבר שפגשתי אתמול.", accepted:["que","qu'"], solution_fr:"C'est l'ami que j'ai rencontré hier.", explanation_he:"que = שאותו (מושא ישיר). l'ami הוא המושא של rencontrer → que.", tip_he:"qui = נושא (qui vient) · que = מושא (que je vois)." },
    { instruction_he:"השלם בכינוי הזיקה הנכון (qui / que)", prompt_fr:"La femme ____ travaille ici est médecin.", trans_he:"האישה שעובדת כאן היא רופאה.", accepted:["qui"], solution_fr:"La femme qui travaille ici est médecin.", explanation_he:"qui = שהיא (נושא). la femme היא הנושא של travaille → qui.", tip_he:"qui = נושא (מה שאחריו הוא פועל)." },
    { instruction_he:"השלם בפועל רפלקסיבי (présent)", prompt_fr:"Chaque matin, je ____ (se lever) à sept heures.", trans_he:"כל בוקר אני קם בשבע.", accepted:["me lève"], solution_fr:"Chaque matin, je me lève à sept heures.", explanation_he:"se lever = לקום. je me lève, tu te lèves, il se lève.", tip_he:"se lever · se coucher · s'habiller · se laver · se réveiller." },
    { instruction_he:"השלם בכינוי מושא ישיר", prompt_fr:"Tu vois Marie ? — Oui, je ____ vois tous les jours.", trans_he:"אתה רואה את מארי? — כן, אני רואה אותה כל יום.", accepted:["la"], solution_fr:"Oui, je la vois tous les jours.", explanation_he:"כינוי מושא ישיר לנקבה יחיד = la. בא לפני הפועל.", tip_he:"le (אותו) · la (אותה) · les (אותם/ן)." },
    { instruction_he:"השלם בכינוי מושא עקיף", prompt_fr:"Tu parles souvent à tes parents ? — Oui, je ____ parle tous les jours.", trans_he:"אתה מדבר עם ההורים שלך? — כן, אני מדבר איתם כל יום.", accepted:["leur"], solution_fr:"Oui, je leur parle tous les jours.", explanation_he:"כינוי מושא עקיף לרבים = leur. parler à qqn → lui/leur.", tip_he:"lui = לו/לה (יחיד) · leur = להם/להן (רבים)." },
  ],
  voc: [
    { instruction_he:"תרגם לצרפתית: «להגיע בזמן»", prompt_fr:"Il est important d'____ à l'heure.", trans_he:"חשוב להגיע בזמן.", accepted:["arriver","arriver à l'heure"], solution_fr:"arriver à l'heure", explanation_he:"arriver à l'heure = להגיע בזמן. être en retard = להיות מאוחר.", tip_he:"à l'heure (בזמן) · en retard (מאוחר) · en avance (מוקדם)." },
    { instruction_he:"תרגם לצרפתית: «לדעתי זה חשוב»", prompt_fr:"____, c'est très important.", trans_he:"לדעתי, זה מאוד חשוב.", accepted:["À mon avis","a mon avis","Selon moi"], solution_fr:"À mon avis, c'est très important.", explanation_he:"À mon avis = לדעתי. Selon moi = לפי דעתי.", tip_he:"À mon avis · Je pense que · Il me semble que · Selon moi." },
    { instruction_he:"תרגם לצרפתית: «לטייל / לנסוע»", prompt_fr:"J'adore ____ en Europe.", trans_he:"אני מאוד אוהב לטייל באירופה.", accepted:["voyager"], solution_fr:"voyager", explanation_he:"voyager = לטייל. un voyage = מסע. partir en vacances = לצאת לחופשה.", tip_he:"voyager · faire un voyage · partir en vacances · explorer." },
    { instruction_he:"תרגם לצרפתית: «ממש עייף»", prompt_fr:"Après le sport, je suis ____.", trans_he:"אחרי ספורט, אני ממש עייף.", accepted:["épuisé","épuisée","très fatigué","très fatiguée","crevé"], solution_fr:"épuisé(e) / crevé(e)", explanation_he:"épuisé = מותש (יותר חזק מ-fatigué). crevé = סלנג לממש מותש.", tip_he:"fatigué (עייף) · épuisé (מותש) · crevé (ממש מותש, סלנג)." },
    { instruction_he:"תרגם לצרפתית: «לשמור על הסביבה»", prompt_fr:"Il faut ____ l'environnement.", trans_he:"צריך לשמור על הסביבה.", accepted:["protéger","respecter","préserver"], solution_fr:"protéger / préserver l'environnement", explanation_he:"protéger = להגן · préserver = לשמר · l'environnement = הסביבה.", tip_he:"le réchauffement climatique · le recyclage · les énergies renouvelables." },
    { instruction_he:"תרגם לצרפתית: «אני מסכים איתך»", prompt_fr:"Je suis ____ avec toi.", trans_he:"אני מסכים איתך.", accepted:["d'accord"], solution_fr:"Je suis d'accord avec toi.", explanation_he:"être d'accord (avec) = להסכים. Je ne suis pas d'accord = אני לא מסכים.", tip_he:"d'accord (מסכים) · au contraire (להיפך) · en revanche (לעומת זאת)." },
  ],
  com: [
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"De plus en plus de consommateurs se tournent vers les produits biologiques, convaincus qu'ils sont meilleurs pour la santé, malgré un prix souvent plus élevé.", trans_he:"יותר ויותר צרכנים פונים למוצרים אורגניים, משוכנעים שהם בריאים יותר, למרות מחיר גבוה יותר.", question_fr:"Qu'est-ce qui peut freiner l'achat de produits bio ?", q_he:"מה עלול להרתיע מקנייה של מוצרים אורגניים?", options:["Leur goût","Leur prix plus élevé","Leur rareté"], correct:1, explanation_he:"« malgré un prix souvent plus élevé » = למרות מחיר גבוה יותר — זה החיסרון." },
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"Apprendre une langue étrangère demande de la patience : les progrès sont parfois lents, mais la régularité finit toujours par payer.", trans_he:"ללמוד שפה זרה דורש סבלנות: ההתקדמות לפעמים איטית, אך ההתמדה תמיד משתלמת בסוף.", question_fr:"Quel facteur est essentiel selon le texte ?", q_he:"איזה גורם חיוני לפי הטקסט?", options:["Le talent inné","La régularité","La rapidité"], correct:1, explanation_he:"« la régularité finit toujours par payer » = ההתמדה תמיד משתלמת." },
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"Les réseaux sociaux permettent de rester en contact avec ses proches, mais une utilisation excessive peut nuire à la concentration et au sommeil.", trans_he:"הרשתות החברתיות מאפשרות להישאר בקשר, אך שימוש מופרז עלול לפגוע בריכוז ובשינה.", question_fr:"Quel risque le texte mentionne-t-il ?", q_he:"איזה סיכון מזכיר הטקסט?", options:["Une meilleure concentration","Des troubles du sommeil","Une perte de contacts"], correct:1, explanation_he:"הטקסט מזכיר ש-« peut nuire à la concentration et au sommeil »." },
  ],
  exp: [
    { instruction_he:"ספר על סוף שבוע שהשאיר רושם (תשובה חופשית)", prompt_fr:"Raconte un week-end qui t'a marqué. Utilise le passé composé et l'imparfait.", trans_he:"ספר על סוף שבוע שהשאיר בך רושם. השתמש ב-passé composé וב-imparfait.", model_fr:"Le week-end dernier, je suis allé à la montagne avec des amis. Il faisait un temps magnifique et nous avons fait une longue randonnée. Le soir, nous étions épuisés mais heureux.", keys_fr:["le week-end dernier","je suis allé","il faisait","nous avons fait","nous étions"], tip_he:"passé composé לפעולות (je suis allé) · imparfait לרקע (il faisait, nous étions)." },
    { instruction_he:"תאר את המנה האהובה עליך (תשובה חופשית)", prompt_fr:"Décris ton plat préféré et explique pourquoi tu l'aimes.", trans_he:"תאר את המנה האהובה עליך והסבר למה אתה אוהב אותה.", model_fr:"Mon plat préféré, c'est sans doute les pâtes à la carbonara. J'apprécie ce plat parce qu'il est à la fois simple et réconfortant. De plus, il me rappelle un voyage en Italie.", keys_fr:["mon plat préféré","j'apprécie parce que","à la fois","de plus","il me rappelle"], tip_he:"קישורים: « à la fois… » · « de plus… » · « parce que… »." },
    { instruction_he:"הבע עמדה על הרשתות החברתיות (תשובה חופשית)", prompt_fr:"Selon toi, les réseaux sociaux rapprochent-ils ou éloignent-ils les gens ?", trans_he:"לדעתך, הרשתות החברתיות מקרבות או מרחיקות בין אנשים?", model_fr:"À mon avis, les réseaux sociaux rapprochent les gens qui sont loin, mais ils peuvent aussi nous éloigner de ceux qui sont à côté de nous. Tout dépend de la manière dont on les utilise.", keys_fr:["à mon avis","rapprocher","éloigner","tout dépend de","la manière dont"], tip_he:"« D'un côté… de l'autre… » או « Tout dépend de… » להבעת עמדה מאוזנת." },
  ],
};

const BANK_C2 = {
  gra: [
    { instruction_he:"השלם במבנה הפאסיף", prompt_fr:"Cette chanson ____ (chanter) par des millions de personnes.", trans_he:"השיר הזה נשר על ידי מיליוני אנשים.", accepted:["est chantée","a été chantée"], solution_fr:"Cette chanson est chantée par des millions de personnes.", explanation_he:"פאסיף = être + participe passé. chanson נקבה → chantée.", tip_he:"פאסיף: sujet + être + participe passé + par + agent." },
    { instruction_he:"השלם בparticipe passé composé (אחרי השלמת הפעולה)", prompt_fr:"____ (finir) son discours, il a quitté la salle.", trans_he:"לאחר שסיים את נאומו, עזב את האולם.", accepted:["Ayant fini"], solution_fr:"Ayant fini son discours, il a quitté la salle.", explanation_he:"participe passé composé = ayant/étant + participe passé. מבטא פעולה שקדמה.", tip_he:"Ayant terminé (לאחר שסיים) · Étant arrivé (לאחר שהגיע)." },
    { instruction_he:"השלם בne explétif אחרי avant que", prompt_fr:"Partons avant qu'il ne ____ (pleuvoir).", trans_he:"נצא לפני שירד גשם.", accepted:["pleuve"], solution_fr:"Partons avant qu'il ne pleuve.", explanation_he:"avant que + subjonctif. ה-ne explétif הוא מנומס/ספרותי — לא שלילה.", tip_he:"ne explétif אחרי avant que, à moins que, de peur que — לא משמעות שלילית." },
    { instruction_he:"השלם בsubjonctif אחרי quoi que", prompt_fr:"Quoi qu'il ____ (faire), il ne réussira pas à nous tromper.", trans_he:"יהיה מה שיהיה, הוא לא יצליח לרמות אותנו.", accepted:["fasse"], solution_fr:"Quoi qu'il fasse, il ne réussira pas à nous tromper.", explanation_he:"quoi que = יהיה מה שיהיה, תמיד עם subjonctif. faire → fasse.", tip_he:"quoi que · qui que · où que — כולם עם subjonctif." },
    { instruction_he:"השלם בhypothèse עבר (si + plus-que-parfait)", prompt_fr:"S'il avait plu, nous ____ (rester) à la maison.", trans_he:"אילו ירד גשם, היינו נשארים בבית.", accepted:["serions restés","serions restées"], solution_fr:"S'il avait plu, nous serions restés à la maison.", explanation_he:"היפוך בעבר: Si + plus-que-parfait → conditionnel passé. rester עם être.", tip_he:"Si + avait/était → conditionnel passé (aurait/serait + participe)." },
    { instruction_he:"השלם בביטוי ספרותי מתאים", prompt_fr:"C'est un phénomène ____ dans la littérature contemporaine. (בולט, ראוי לציון)", trans_he:"זוהי תופעה בולטת בספרות העכשווית.", accepted:["remarquable","notable","saillant","prépondérant"], solution_fr:"remarquable", explanation_he:"remarquable = ראוי לציון, בולט. notable = חשוב. prépondérant = דומיננטי.", tip_he:"remarquable · prépondérant · incontournable · emblématique · paradigmatique." },
  ],
  voc: [
    { instruction_he:"תרגם לצרפתית: «גיוון תרבותי»", prompt_fr:"La ____ des cultures enrichit notre société.", trans_he:"הגיוון של התרבויות מעשיר את החברה שלנו.", accepted:["diversité"], solution_fr:"la diversité", explanation_he:"diversité = גיוון. pluralité = ריבוי. hétérogénéité = הטרוגניות.", tip_he:"diversité · pluralité · singularité · homogénéité." },
    { instruction_he:"תרגם לצרפתית: «משתמע מזה, נובע מזה»", prompt_fr:"Il ____ de cette décision une profonde injustice.", trans_he:"מהחלטה זו משתמעת עוולה עמוקה.", accepted:["ressort","résulte","découle"], solution_fr:"il ressort / il résulte / il découle", explanation_he:"il ressort de = משתמע מ-. il résulte de = נובע מ-. il découle de = נובע (ספרותי).", tip_he:"il s'ensuit que · il en résulte que · il ressort de cela que." },
    { instruction_he:"תרגם לצרפתית: «להתעמק בנושא»", prompt_fr:"Il convient d'____ cette question.", trans_he:"ראוי להתעמק בשאלה זו.", accepted:["approfondir","creuser"], solution_fr:"approfondir", explanation_he:"approfondir = להעמיק. creuser (סלנג) = לחפור, לחקור לעומק.", tip_he:"approfondir · élucider (להבהיר) · décortiquer (לפרק לגורמים)." },
    { instruction_he:"תרגם לצרפתית: «הנחת מוצא»", prompt_fr:"Ce raisonnement repose sur une ____ erronée.", trans_he:"הנימוק מבוסס על הנחת מוצא שגויה.", accepted:["prémisse","présupposition","postulat"], solution_fr:"prémisse / postulat", explanation_he:"prémisse = הנחת יסוד (בהגיון). postulat = אקסיומה. présupposé = הנחה סמויה.", tip_he:"prémisse · postulat · présupposé · axiome · paradigme." },
    { instruction_he:"תרגם לצרפתית: «המרפסת משקיפה על הים»", prompt_fr:"Ce balcon ____ sur la mer.", trans_he:"המרפסת הזו משקיפה על הים.", accepted:["donne","s'ouvre","domine"], solution_fr:"donne sur", explanation_he:"donner sur = להשקיף על, לפנות אל. la fenêtre donne sur la rue.", tip_he:"donner sur · faire face à · surplomber (להשקיף על מגובה)." },
    { instruction_he:"תרגם לצרפתית: «הסופר מדגיש»", prompt_fr:"L'auteur ____ l'importance du dialogue.", trans_he:"הסופר מדגיש את החשיבות של הדיאלוג.", accepted:["souligne","met en avant","insiste sur","met l'accent sur"], solution_fr:"souligne / met en avant", explanation_he:"souligner = להדגיש (ספרותי). mettre en avant = להעמיד בחזית.", tip_he:"souligner · mettre en relief · accentuer · insister sur." },
  ],
  com: [
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"« L'essence même de la démocratie réside non dans l'unanimité des opinions, mais dans la capacité d'une société à tolérer, voire à valoriser, la divergence des points de vue. »", trans_he:"מהות הדמוקרטיה אינה בפה אחד, אלא ביכולת של חברה לסבול ואף להעריך שונות בדעות.", question_fr:"Selon ce texte, qu'est-ce qui caractérise une démocratie ?", q_he:"לפי הטקסט, מה מאפיין דמוקרטיה?", options:["L'accord unanime des citoyens","La tolérance envers la divergence des opinions","L'absence de tout débat politique"], correct:1, explanation_he:"« capacité à tolérer la divergence des points de vue » = היכולת לסבול שונות בדעות." },
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"« Si la modernité a affranchi l'individu des contraintes collectives, elle l'a simultanément privé des cadres symboliques qui donnaient sens à son existence. Ce paradoxe fonde le malaise contemporain. »", trans_he:"אם המודרניות שחררה את הפרט ממאסרים קולקטיביים, היא שללה ממנו את המסגרות הסמליות שנתנו משמעות לקיומו. פרדוקס זה מהווה בסיס לאי-הנוחות הקונטמפורנית.", question_fr:"Quel est le paradoxe évoqué dans ce texte ?", q_he:"מהו הפרדוקס בטקסט?", options:["La liberté moderne crée à la fois émancipation et perte de sens","La modernité a renforcé les liens collectifs","Les contraintes collectives donnent un sens à la vie"], correct:0, explanation_he:"הפרדוקס: המודרניות שחררה (חיובי) אבל שללה את המסגרות הסמליות (שלילי)." },
    { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"« La traduction n'est jamais neutre : elle est toujours un acte d'interprétation, voire de création, car le traducteur ne transporte pas seulement des mots, mais des mondes. »", trans_he:"תרגום אינו ניטרלי: הוא תמיד מעשה פרשנות, ואף יצירה, כי המתרגם מעביר לא רק מילים אלא עולמות.", question_fr:"Selon l'auteur, que fait réellement le traducteur ?", q_he:"מה עושה המתרגם בפועל?", options:["Il copie des mots d'une langue à une autre","Il interprète et crée en transférant des univers culturels","Il reste strictement fidèle à l'original"], correct:1, explanation_he:"« acte d'interprétation, voire de création... transporte des mondes » = מפרש, יוצר, מעביר עולמות." },
  ],
  exp: [
    { instruction_he:"הצג טיעון פילוסופי מאוזן (תשובה חופשית)", prompt_fr:"Dans quelle mesure le progrès technique améliore-t-il la condition humaine ? Développez en deux paragraphes.", trans_he:"באיזו מידה ההתקדמות הטכנולוגית משפרת את המצב האנושי? פתחו בשני פסקאות.", model_fr:"D'une part, le progrès technique a indéniablement transformé nos conditions de vie en réduisant la souffrance physique. D'autre part, cette évolution soulève des interrogations profondes quant à la déshumanisation des rapports sociaux.", keys_fr:["d'une part... d'autre part","indéniablement","soulève des interrogations","quant à","déshumanisation"], tip_he:"מבנה dialectique: thèse → antithèse. d'une part... d'autre part · certes... cependant." },
    { instruction_he:"פרשנות ציטוט (תשובה חופשית)", prompt_fr:"Commentez brièvement cette citation de Camus : « Je me révolte, donc nous sommes. »", trans_he:"הגיבו בקצרה על ציטוט זה של קאמי: «אני מורד, לכן אנחנו קיימים.»", model_fr:"Camus renverse ici le cogito cartésien pour affirmer que la révolte n'est pas un acte individuel, mais le fondement même du lien social. En se révoltant contre l'injustice, l'individu transcende son moi et crée une solidarité avec autrui.", keys_fr:["renverse","le cogito cartésien","la révolte","transcende","solidarité","autrui"], tip_he:"ניתוח ציטוט: התייחסות לטקסט קיים → פרשנות המשמעות." },
    { instruction_he:"עמדה מנומקת עם גוונים (תשובה חופשית)", prompt_fr:"L'intelligence artificielle représente-t-elle une menace ou une opportunité pour l'humanité ? Nuancez votre réponse.", trans_he:"האם בינה מלאכותית מהווה איום או הזדמנות לאנושות? הדגישו גוונים בתשובתכם.", model_fr:"Loin de se réduire à une opposition binaire, la question de l'IA exige une lecture nuancée. Si ses applications médicales ouvrent des perspectives inédites, le risque d'instrumentalisation à des fins de surveillance demeure préoccupant.", keys_fr:["loin de se réduire à","exige une lecture nuancée","ouvrent des perspectives","demeure préoccupant","instrumentalisation"], tip_he:"C2: « il serait réducteur de » · « la réalité est plus complexe » · « il convient de distinguer »." },
  ],
};

/* -------------------- BUILT-IN BANK (B2/C1 → split by level) -------------------- */
const BANK_BC = {
  gra: [
    { instruction_he: "השלם בצורת הפועל הנכונה (סובז'ונקטיף)",
      prompt_fr: "Il faut que tu ____ (finir) ce rapport avant midi.",
      trans_he: "צריך שתסיים את הדוח הזה לפני הצהריים.",
      accepted: ["finisses"], solution_fr: "Il faut que tu finisses ce rapport avant midi.",
      explanation_he: "אחרי « il faut que » תמיד בא סובז'ונקטיף. הצורה של finir בגוף שני יחיד היא finisses.",
      tip_he: "ביטויי הכרח (il faut que, il est important que) גוררים סובז'ונקטיף." },
    { instruction_he: "השלם בצורה הנכונה (סובז'ונקטיף אחרי bien que)",
      prompt_fr: "Bien qu'il ____ (être) fatigué, il continue à travailler.",
      trans_he: "למרות שהוא עייף, הוא ממשיך לעבוד.",
      accepted: ["soit"], solution_fr: "Bien qu'il soit fatigué, il continue à travailler.",
      explanation_he: "« bien que » (אף ש-) דורש תמיד סובז'ונקטיף. הצורה של être היא soit.",
      tip_he: "ויתור/ניגוד: bien que, quoique → סובז'ונקטיף." },
    { instruction_he: "השלם בתנאי עבר (conditionnel passé)",
      prompt_fr: "Si j'avais su, je ne ____ (venir) pas.",
      trans_he: "אילו ידעתי, לא הייתי בא.",
      accepted: ["serais venu", "serais venue"], solution_fr: "Si j'avais su, je ne serais pas venu.",
      explanation_he: "מבנה תנאי לא-מציאותי בעבר: Si + plus-que-parfait, ואז conditionnel passé. venir מצריך être → je serais venu.",
      tip_he: "Si + avais su → ... serais venu (חרטה על העבר)." },
    { instruction_he: "השלם בהתאמת זמנים (discours indirect)",
      prompt_fr: "Elle a dit qu'elle ____ (finir) son travail la veille.",
      trans_he: "היא אמרה שהיא סיימה את העבודה שלה יום קודם.",
      accepted: ["avait fini"], solution_fr: "Elle a dit qu'elle avait fini son travail la veille.",
      explanation_he: "בדיבור עקיף בעבר, פעולה שקדמה לאמירה הופכת ל-plus-que-parfait: avait fini.",
      tip_he: "« hier » בדיבור עקיף הופך ל-« la veille »." },
    { instruction_he: "השלם בצורה הנכונה (סובז'ונקטיף אחרי pour que)",
      prompt_fr: "Je répète l'explication pour que tu ____ (comprendre).",
      trans_he: "אני חוזר על ההסבר כדי שתבין.",
      accepted: ["comprennes"], solution_fr: "Je répète l'explication pour que tu comprennes.",
      explanation_he: "« pour que » (כדי ש-) דורש סובז'ונקטיף. comprendre → comprennes.",
      tip_he: "מטרה: pour que, afin que → סובז'ונקטיף." },
    { instruction_he: "השלם בכינוי הזיקה הנכון",
      prompt_fr: "Le livre ____ je t'ai parlé est passionnant.",
      trans_he: "הספר שדיברתי איתך עליו מרתק.",
      accepted: ["dont"], solution_fr: "Le livre dont je t'ai parlé est passionnant.",
      explanation_he: "« dont » מחליף de + שם. כאן הפועל הוא parler de, ולכן משתמשים ב-dont.",
      tip_he: "פועל שדורש de (parler de, avoir besoin de) → dont." },
    { instruction_he: "השלם בהתאם הנכון של ה-participe passé",
      prompt_fr: "Les fleurs que j'ai ____ (acheter) sont magnifiques.",
      trans_he: "הפרחים שקניתי נהדרים.",
      accepted: ["achetées"], solution_fr: "Les fleurs que j'ai achetées sont magnifiques.",
      explanation_he: "עם העזר avoir, ה-participe מתאים למושא הישיר כשהוא מופיע לפניו. fleurs נקבה רבים → achetées.",
      tip_he: "מושא ישיר לפני avoir → התאמה במין ובמספר." },
    { instruction_he: "השלם בצורה הנכונה (סובז'ונקטיף אחרי le seul qui)",
      prompt_fr: "C'est le seul ami qui me ____ (comprendre) vraiment.",
      trans_he: "זה החבר היחיד שבאמת מבין אותי.",
      accepted: ["comprenne"], solution_fr: "C'est le seul ami qui me comprenne vraiment.",
      explanation_he: "אחרי « le seul/le premier/le dernier qui » בא בדרך כלל סובז'ונקטיף: comprenne.",
      tip_he: "le seul qui, le premier qui → סובז'ונקטיף." },
    { instruction_he: "השלם ב-gérondif (בו-זמניות/אופן)",
      prompt_fr: "Il a appris le français ____ (regarder) des films.",
      trans_he: "הוא למד צרפתית תוך כדי צפייה בסרטים.",
      accepted: ["en regardant"], solution_fr: "Il a appris le français en regardant des films.",
      explanation_he: "gérondif נבנה מ-en + הווה רציף (participe présent), ומביע אופן או בו-זמניות.",
      tip_he: "en + פועל בסיומת -ant = תוך כדי..." },
    { instruction_he: "השלם ב-plus-que-parfait",
      prompt_fr: "Quand je suis arrivé à la gare, le train ____ déjà (partir).",
      trans_he: "כשהגעתי לתחנה, הרכבת כבר יצאה.",
      accepted: ["était déjà parti", "était parti"], solution_fr: "Quand je suis arrivé à la gare, le train était déjà parti.",
      explanation_he: "פעולה שהסתיימה לפני פעולה אחרת בעבר → plus-que-parfait: était parti (partir עם être).",
      tip_he: "עבר שלפני עבר = plus-que-parfait (avais/était + participe)." },
    { instruction_he: "השלם ב-conditionnel présent",
      prompt_fr: "Si j'avais plus de temps, je ____ (voyager) davantage.",
      trans_he: "אם היה לי יותר זמן, הייתי מטייל יותר.",
      accepted: ["voyagerais"], solution_fr: "Si j'avais plus de temps, je voyagerais davantage.",
      explanation_he: "מבנה תנאי בהווה לא-מציאותי: Si + imparfait → conditionnel présent (voyagerais).",
      tip_he: "Si + imparfait → conditionnel présent." },
    { instruction_he: "השלם בכינוי הנכון (y)",
      prompt_fr: "Tu penses à ton avenir ? — Oui, j'____ pense souvent.",
      trans_he: "אתה חושב על העתיד שלך? — כן, אני חושב על זה לעיתים קרובות.",
      accepted: ["y"], solution_fr: "Oui, j'y pense souvent.",
      explanation_he: "« y » מחליף à + דבר. penser à qqch → y penser.",
      tip_he: "à + דבר (לא אדם) → y." },
    { instruction_he: "השלם בכינוי הנכון (en)",
      prompt_fr: "Tu as des amis à Paris ? — Oui, j'____ ai beaucoup.",
      trans_he: "יש לך חברים בפריז? — כן, יש לי הרבה.",
      accepted: ["en"], solution_fr: "Oui, j'en ai beaucoup.",
      explanation_he: "« en » מחליף de/des + שם, ובמיוחד ביטויי כמות. j'en ai beaucoup = יש לי הרבה מהם.",
      tip_he: "כמות (beaucoup, trois, un peu) → en." },
    { instruction_he: "השלם ב-subjonctif passé",
      prompt_fr: "Bien qu'il ____ (faire) de son mieux, il a échoué.",
      trans_he: "למרות שעשה כמיטב יכולתו, הוא נכשל.",
      accepted: ["ait fait"], solution_fr: "Bien qu'il ait fait de son mieux, il a échoué.",
      explanation_he: "כשהפעולה כבר הושלמה, אחרי bien que בא subjonctif passé: ait fait.",
      tip_he: "subjonctif passé = aie/aies/ait + participe." },
    { instruction_he: "השלם בהתאמת זמנים (עתיד בדיבור עקיף)",
      prompt_fr: "Il m'a dit qu'il ____ (venir) le lendemain.",
      trans_he: "הוא אמר לי שהוא יבוא למחרת.",
      accepted: ["viendrait"], solution_fr: "Il m'a dit qu'il viendrait le lendemain.",
      explanation_he: "עתיד שמדווח בדיבור עקיף בעבר הופך ל-conditionnel présent: viendrait.",
      tip_he: "futur בדיבור ישיר → conditionnel בדיבור עקיף." },
    { instruction_he: "השלם במילת היחס הנכונה",
      prompt_fr: "Je rêve ____ visiter le Canada un jour.",
      trans_he: "אני חולם לבקר בקנדה יום אחד.",
      accepted: ["de"], solution_fr: "Je rêve de visiter le Canada un jour.",
      explanation_he: "rêver de faire qqch — הפועל rêver דורש את מילת היחס de לפני שם הפועל.",
      tip_he: "rêver de, décider de, essayer de, oublier de." },
  ],
  voc: [
    { instruction_he: "תרגם לצרפתית: «להתפטר מעבודה»",
      prompt_fr: "____ (לעזוב את העבודה ביוזמתך)", trans_he: "להתפטר מעבודה ביוזמתך.",
      accepted: ["démissionner", "demissionner"], solution_fr: "démissionner",
      explanation_he: "« démissionner » = להתפטר. quitter son emploi כללי יותר, démissionner ספציפי להתפטרות.",
      tip_he: "donner sa démission = להגיש מכתב התפטרות." },
    { instruction_he: "תרגם לצרפתית: «מועד אחרון / דדליין»",
      prompt_fr: "____ (התאריך שעד אליו צריך לסיים)", trans_he: "המועד האחרון לסיום משימה.",
      accepted: ["une échéance", "échéance", "echeance", "un délai", "délai", "une date limite", "date limite"],
      solution_fr: "une échéance / une date limite",
      explanation_he: "« échéance » או « date limite » = מועד אחרון. « délai » הוא פרק הזמן עד המועד.",
      tip_he: "respecter les délais = לעמוד בלוחות זמנים." },
    { instruction_he: "תרגם לצרפתית: «להסתדר / להתמודד לבד»",
      prompt_fr: "se ____ (להצליח להסתדר בעצמך)", trans_he: "להצליח להסתדר ולמצוא פתרון בעצמך.",
      accepted: ["débrouiller", "debrouiller", "se débrouiller", "se debrouiller"], solution_fr: "se débrouiller",
      explanation_he: "« se débrouiller » = להסתדר, למצוא פתרון לבד. מילה יומיומית מאוד.",
      tip_he: "Débrouille-toi ! = תסתדר לבד!" },
    { instruction_he: "תרגם לצרפתית: «זה שווה את זה / כדאי»",
      prompt_fr: "ça ____ (זה שווה את המאמץ)", trans_he: "זה שווה את המאמץ.",
      accepted: ["vaut le coup", "ça vaut le coup", "vaut la peine", "ça vaut la peine"], solution_fr: "ça vaut le coup / ça vaut la peine",
      explanation_he: "« ça vaut le coup » (מדובר) או « ça vaut la peine » (רשמי יותר) = שווה את זה.",
      tip_he: "ça ne vaut pas le coup = לא שווה את הטרחה." },
    { instruction_he: "תרגם לצרפתית: «מתוסכל»",
      prompt_fr: "Je suis ____ (תחושת תסכול)", trans_he: "אני מתוסכל.",
      accepted: ["frustré", "frustre", "frustrée"], solution_fr: "frustré(e)",
      explanation_he: "« frustré » = מתוסכל. שים לב לסיומת נקבה frustrée.",
      tip_he: "la frustration = התסכול (שם עצם)." },
    { instruction_he: "תרגם לצרפתית: «לוותר / להרים ידיים»",
      prompt_fr: "____ (להפסיק לנסות)", trans_he: "לוותר, להפסיק לנסות.",
      accepted: ["abandonner", "laisser tomber", "renoncer"], solution_fr: "abandonner / laisser tomber",
      explanation_he: "« abandonner » או « renoncer » = לוותר. « laisser tomber » מדובר מאוד = לעזוב את זה.",
      tip_he: "Laisse tomber ! = עזוב את זה / לא משנה." },
    { instruction_he: "תרגם לצרפתית: «בכוונה / במכוון»",
      prompt_fr: "Il l'a fait ____ (לא במקרה)", trans_he: "הוא עשה את זה בכוונה.",
      accepted: ["exprès", "expres", "volontairement"], solution_fr: "exprès",
      explanation_he: "« faire exprès » = לעשות בכוונה. « volontairement » רשמי יותר.",
      tip_he: "Je ne l'ai pas fait exprès = לא עשיתי את זה בכוונה." },
    { instruction_he: "תרגם לצרפתית: «להתרגל ל-»",
      prompt_fr: "Je dois m'____ à ce climat. (להתרגל)", trans_he: "אני צריך להתרגל לאקלים הזה.",
      accepted: ["habituer", "habituer à"], solution_fr: "s'habituer à",
      explanation_he: "« s'habituer à qqch » = להתרגל למשהו. שים לב למילת היחס à.",
      tip_he: "être habitué à = להיות רגיל ל-." },
    { instruction_he: "תרגם לצרפתית: «להעמיד פנים»",
      prompt_fr: "Il ____ de dormir. (להעמיד פנים)", trans_he: "הוא מעמיד פנים שהוא ישן.",
      accepted: ["fait semblant", "faire semblant"], solution_fr: "faire semblant (de)",
      explanation_he: "« faire semblant de » = להעמיד פנים. faire semblant de dormir = להעמיד פני ישן.",
      tip_he: "faire semblant de + שם פועל." },
    { instruction_he: "תרגם לצרפתית: «להתלונן»",
      prompt_fr: "Il n'arrête pas de se ____ (להתלונן)", trans_he: "הוא לא מפסיק להתלונן.",
      accepted: ["plaindre", "se plaindre"], solution_fr: "se plaindre (de)",
      explanation_he: "« se plaindre de qqch » = להתלונן על משהו. פועל רפלקסיבי.",
      tip_he: "se plaindre de = להתלונן על." },
    { instruction_he: "תרגם לצרפתית: «מודאג / דואג»",
      prompt_fr: "Je suis ____ pour lui. (דואג)", trans_he: "אני דואג לו.",
      accepted: ["inquiet", "inquiète", "soucieux"], solution_fr: "inquiet",
      explanation_he: "« inquiet » = מודאג. נקבה: inquiète. « s'inquiéter » = לדאוג (פועל).",
      tip_he: "Ne t'inquiète pas = אל תדאג." },
    { instruction_he: "תרגם לצרפתית: «בכל זאת / למרות הכל»",
      prompt_fr: "C'était difficile, mais je l'ai fait ____ (בכל זאת)", trans_he: "זה היה קשה, אבל עשיתי את זה בכל זאת.",
      accepted: ["quand même", "quand meme", "malgré tout", "malgre tout"], solution_fr: "quand même",
      explanation_he: "« quand même » = בכל זאת, למרות הכל. ביטוי שימושי ושכיח מאוד בדיבור.",
      tip_he: "Merci quand même = תודה בכל זאת." },
    { instruction_he: "תרגם לצרפתית: «להתחרט / להצטער על»",
      prompt_fr: "Je ____ ma décision. (להתחרט על)", trans_he: "אני מתחרט על ההחלטה שלי.",
      accepted: ["regrette", "regretter"], solution_fr: "regretter",
      explanation_he: "« regretter qqch » = להתחרט/להצטער על משהו. אל תבלבל עם manquer.",
      tip_he: "Je regrette = אני מצטער / מתחרט." },
    { instruction_he: "תרגם לצרפתית: «לדעתי / מבחינתי»",
      prompt_fr: "____, c'est une bonne idée. (לדעתי)", trans_he: "לדעתי, זה רעיון טוב.",
      accepted: ["à mon avis", "a mon avis", "selon moi"], solution_fr: "à mon avis / selon moi",
      explanation_he: "« à mon avis » או « selon moi » = לדעתי. פותח הבעת דעה.",
      tip_he: "à mon avis פותח משפט של דעה אישית." },
    { instruction_he: "תרגם לצרפתית: «מעצבן / מטריד»",
      prompt_fr: "Ce bruit est vraiment ____ (מעצבן)", trans_he: "הרעש הזה ממש מעצבן.",
      accepted: ["agaçant", "agacant", "énervant", "enervant"], solution_fr: "agaçant / énervant",
      explanation_he: "« agaçant » או « énervant » = מעצבן. ça m'énerve = זה מעצבן אותי.",
      tip_he: "Ça m'énerve ! = זה מעצבן אותי!" },
  ],
  com: [
    { instruction_he: "קרא וענה: בחר את התשובה הנכונה",
      prompt_fr: "« Depuis la pandémie, le télétravail s'est imposé dans de nombreuses entreprises. Si certains salariés y voient un gain de liberté, d'autres regrettent le manque de contact humain et peinent à séparer vie professionnelle et vie privée. »",
      trans_he: "מאז המגפה, העבודה מרחוק התבססה בחברות רבות. בעוד שחלק מהעובדים רואים בכך הרווחת חופש, אחרים מתגעגעים למגע האנושי ומתקשים להפריד בין חיי העבודה לחיים הפרטיים.",
      question_fr: "Selon le texte, quel est un inconvénient du télétravail ?",
      q_he: "לפי הטקסט, מהו חיסרון של העבודה מרחוק?",
      options: ["Il réduit la liberté des salariés", "Il brouille la frontière entre travail et vie privée", "Il augmente les contacts humains"],
      correct: 1,
      explanation_he: "הטקסט אומר שעובדים מסוימים מתקשים להפריד בין חיי העבודה לחיים הפרטיים — זה החיסרון. האפשרויות האחרות סותרות את הטקסט." },
    { instruction_he: "קרא וענה: בחר את התשובה הנכונה",
      prompt_fr: "« Le maire a annoncé que la nouvelle ligne de tramway serait mise en service d'ici deux ans, à condition que le financement soit validé par la région. »",
      trans_he: "ראש העיר הודיע שקו הטראם החדש ייכנס לשירות בתוך שנתיים, בתנאי שהמימון יאושר על ידי המחוז.",
      question_fr: "La mise en service du tramway dépend de quoi ?",
      q_he: "כניסת הטראם לשירות תלויה במה?",
      options: ["De l'approbation du financement régional", "De la décision des habitants", "De la météo des prochains mois"],
      correct: 0,
      explanation_he: "« à condition que le financement soit validé par la région » = בתנאי שהמימון יאושר ע\"י המחוז. כלומר הכל תלוי באישור המימון." },
    { instruction_he: "קרא וענה: בחר את התשובה הנכונה",
      prompt_fr: "« Malgré un accueil critique mitigé, le dernier film du réalisateur a rencontré un franc succès auprès du public, dépassant le million d'entrées en une semaine. »",
      trans_he: "למרות קבלת פנים ביקורתית מעורבת, סרטו האחרון של הבמאי זכה להצלחה גדולה בקרב הקהל, ועבר מיליון צופים בשבוע.",
      question_fr: "Comment le film a-t-il été reçu ?",
      q_he: "כיצד התקבל הסרט?",
      options: ["Aimé par la critique mais ignoré du public", "Critiqué mais très populaire auprès du public", "Un échec total"],
      correct: 1,
      explanation_he: "« accueil critique mitigé » = ביקורות מעורבות, אבל « franc succès auprès du public » = הצלחה גדולה אצל הקהל. כלומר: ביקורת פושרת, קהל מתלהב." },
    { instruction_he: "קרא וענה: בחר את התשובה הנכונה",
      prompt_fr: "« Loin d'être un simple effet de mode, la consommation locale traduit une véritable prise de conscience écologique chez les jeunes générations. »",
      trans_he: "רחוק מלהיות סתם אופנה חולפת, הצריכה המקומית מבטאת מודעות אקולוגית אמיתית בקרב הדורות הצעירים.",
      question_fr: "Que pense l'auteur de la consommation locale ?",
      q_he: "מה דעת הכותב על צריכה מקומית?",
      options: ["C'est une mode passagère", "C'est le signe d'une vraie conscience écologique", "C'est réservé aux personnes âgées"],
      correct: 1,
      explanation_he: "« loin d'être un simple effet de mode » = רחוק מלהיות סתם אופנה חולפת. המחבר רואה בזה מודעות אקולוגית אמיתית." },
    { instruction_he: "קרא וענה: בחר את התשובה הנכונה",
      prompt_fr: "« Les réseaux sociaux permettent de rester en contact avec ses proches, mais une utilisation excessive peut nuire à la concentration et au sommeil. »",
      trans_he: "הרשתות החברתיות מאפשרות להישאר בקשר עם הקרובים, אך שימוש מופרז עלול לפגוע בריכוז ובשינה.",
      question_fr: "Quel risque le texte mentionne-t-il ?",
      q_he: "איזה סיכון מזכיר הטקסט?",
      options: ["Une meilleure concentration", "Des troubles du sommeil", "Une perte de contacts"],
      correct: 1,
      explanation_he: "הטקסט מציין ששימוש מופרז « peut nuire à la concentration et au sommeil » — עלול לפגוע בריכוז ובשינה." },
    { instruction_he: "קרא וענה: בחר את התשובה הנכונה",
      prompt_fr: "« De plus en plus de consommateurs se tournent vers les produits biologiques, convaincus qu'ils sont meilleurs pour la santé, malgré un prix souvent plus élevé. »",
      trans_he: "יותר ויותר צרכנים פונים למוצרים אורגניים, משוכנעים שהם בריאים יותר, למרות מחיר שלעיתים קרובות גבוה יותר.",
      question_fr: "Qu'est-ce qui peut freiner l'achat de produits bio ?",
      q_he: "מה עלול להרתיע מקנייה של מוצרים אורגניים?",
      options: ["Leur goût", "Leur prix plus élevé", "Leur rareté"],
      correct: 1,
      explanation_he: "« malgré un prix souvent plus élevé » = למרות מחיר גבוה יותר. המחיר הוא החיסרון שמוזכר." },
    { instruction_he: "קרא וענה: בחר את התשובה הנכונה",
      prompt_fr: "« Si le livre numérique a séduit de nombreux lecteurs par sa praticité, le livre papier conserve un charme que beaucoup ne sont pas prêts à abandonner. »",
      trans_he: "אם הספר הדיגיטלי כבש קוראים רבים בזכות הנוחות שלו, הספר המודפס שומר על קסם שרבים לא מוכנים לוותר עליו.",
      question_fr: "Que dit le texte sur le livre papier ?",
      q_he: "מה אומר הטקסט על הספר המודפס?",
      options: ["Il a complètement disparu", "Il garde un charme apprécié", "Il est plus pratique que le numérique"],
      correct: 1,
      explanation_he: "הטקסט אומר שהספר המודפס « conserve un charme » — שומר על קסם שרבים לא מוכנים לוותר עליו." },
    { instruction_he: "קרא וענה: בחר את התשובה הנכונה",
      prompt_fr: "« Pour désengorger le centre-ville, la municipalité encourage l'usage du vélo en multipliant les pistes cyclables. »",
      trans_he: "כדי לפנות את הגודש במרכז העיר, העירייה מעודדת שימוש באופניים על ידי הרבטת שבילי אופניים.",
      question_fr: "Quel est l'objectif de la municipalité ?",
      q_he: "מה המטרה של העירייה?",
      options: ["Augmenter le trafic automobile", "Réduire l'encombrement du centre-ville", "Interdire totalement les voitures"],
      correct: 1,
      explanation_he: "« désengorger le centre-ville » = להקל על הגודש במרכז העיר. זו המטרה — לצמצם את העומס." },
    { instruction_he: "קרא וענה: בחר את התשובה הנכונה",
      prompt_fr: "« Apprendre une langue étrangère demande de la patience : les progrès sont parfois lents, mais la régularité finit toujours par payer. »",
      trans_he: "ללמוד שפה זרה דורש סבלנות: ההתקדמות לעיתים איטית, אך ההתמדה תמיד משתלמת בסוף.",
      question_fr: "Quel facteur est essentiel selon le texte ?",
      q_he: "איזה גורם חיוני לפי הטקסט?",
      options: ["Le talent inné", "La régularité", "La rapidité"],
      correct: 1,
      explanation_he: "« la régularité finit toujours par payer » = ההתמדה תמיד משתלמת. הסדירות היא המפתח, לא הכישרון או המהירות." },
  ],
  exp: [
    { instruction_he: "הבע את דעתך בשני משפטים (תשובה חופשית)",
      prompt_fr: "Que penses-tu du télétravail ? Donne ton avis en deux phrases.",
      trans_he: "מה דעתך על העבודה מרחוק? הבע את דעתך בשני משפטים.",
      model_fr: "Personnellement, je trouve que le télétravail offre une grande flexibilité et permet de gagner du temps de transport. Cependant, il peut créer un sentiment d'isolement, c'est pourquoi je préfère un rythme hybride.",
      keys_fr: ["je trouve que", "offrir la flexibilité", "cependant", "c'est pourquoi", "un rythme hybride"],
      tip_he: "מבנה דעה חזק: התחל ב-« Je trouve que… », הוסף ניגוד ב-« Cependant… », וסיים בעמדה." },
    { instruction_he: "ספר על משהו (תשובה חופשית)",
      prompt_fr: "Raconte un week-end qui t'a marqué. Utilise le passé composé et l'imparfait.",
      trans_he: "ספר על סוף שבוע שהשאיר בך רושם. השתמש ב-passé composé וב-imparfait.",
      model_fr: "Le week-end dernier, je suis allé à la montagne avec des amis. Il faisait un temps magnifique et nous avons fait une longue randonnée. Le soir, nous étions épuisés mais heureux.",
      keys_fr: ["le week-end dernier", "je suis allé", "il faisait", "nous avons fait", "nous étions"],
      tip_he: "passé composé לפעולות (je suis allé), imparfait לרקע ולתיאור (il faisait, nous étions)." },
    { instruction_he: "הגב למצב (תשובה חופשית)",
      prompt_fr: "Comment réagirais-tu si un ami annulait à la dernière minute ? Utilise le conditionnel.",
      trans_he: "איך היית מגיב אם חבר היה מבטל ברגע האחרון? השתמש ב-conditionnel.",
      model_fr: "Je serais un peu déçu, mais je comprendrais s'il avait une bonne raison. Je lui proposerais de reporter à un autre jour plutôt que de me fâcher.",
      keys_fr: ["je serais", "je comprendrais", "je lui proposerais", "plutôt que de"],
      tip_he: "conditionnel présent למצב היפותטי: je serais, je comprendrais, je proposerais." },
    { instruction_he: "תאר והסבר (תשובה חופשית)",
      prompt_fr: "Décris ton plat préféré et explique pourquoi tu l'aimes.",
      trans_he: "תאר את המנה האהובה עליך והסבר למה אתה אוהב אותה.",
      model_fr: "Mon plat préféré, c'est sans doute les pâtes à la carbonara. J'apprécie ce plat parce qu'il est à la fois simple et réconfortant. De plus, il me rappelle un voyage que j'ai fait en Italie.",
      keys_fr: ["mon plat préféré", "j'apprécie ce plat parce que", "à la fois", "de plus", "il me rappelle"],
      tip_he: "קישורים שמעשירים: « à la fois… », « de plus… », « parce que… »." },
    { instruction_he: "הבע עמדה (תשובה חופשית)",
      prompt_fr: "Selon toi, les réseaux sociaux rapprochent-ils ou éloignent-ils les gens ?",
      trans_he: "לדעתך, הרשתות החברתיות מקרבות או מרחיקות בין אנשים?",
      model_fr: "À mon avis, les réseaux sociaux rapprochent les gens qui sont loin, mais ils peuvent aussi nous éloigner de ceux qui sont à côté de nous. Tout dépend de la manière dont on les utilise.",
      keys_fr: ["à mon avis", "rapprocher", "éloigner", "tout dépend de", "la manière dont"],
      tip_he: "להבעת דעה מאוזנת: « D'un côté… de l'autre… » או « Tout dépend de… »." },
    { instruction_he: "תאר רצף (תשובה חופשית)",
      prompt_fr: "Décris ta journée de week-end idéale.",
      trans_he: "תאר את יום סוף השבוע האידיאלי שלך.",
      model_fr: "Ma journée idéale commencerait par un petit-déjeuner tranquille. Ensuite, je me promènerais en ville, puis je retrouverais des amis l'après-midi. Le soir, je regarderais un bon film en me détendant.",
      keys_fr: ["commencerait par", "ensuite", "puis", "l'après-midi", "le soir"],
      tip_he: "מילות רצף: « D'abord… ensuite… puis… enfin… » מסדרות את הסיפור." },
    { instruction_he: "תגובה היפותטית (תשובה חופשית)",
      prompt_fr: "Si tu pouvais maîtriser instantanément une compétence, laquelle choisirais-tu ? Utilise le conditionnel.",
      trans_he: "אם יכולת לרכוש מיומנות אחת באופן מיידי, איזו היית בוחר? השתמש ב-conditionnel.",
      model_fr: "Si je pouvais maîtriser une compétence, je choisirais de jouer du piano. J'aimerais pouvoir improviser et exprimer mes émotions par la musique. Ce serait une source de joie quotidienne.",
      keys_fr: ["si je pouvais", "je choisirais", "j'aimerais pouvoir", "ce serait"],
      tip_he: "Si + imparfait → conditionnel: « Si je pouvais, je choisirais… »." },
    { instruction_he: "תן עצה (תשובה חופשית)",
      prompt_fr: "Quels conseils donnerais-tu à un débutant qui apprend le français ?",
      trans_he: "אילו עצות היית נותן למתחיל שלומד צרפתית?",
      model_fr: "Je lui conseillerais d'écouter du français tous les jours, même quelques minutes. Il faudrait aussi qu'il n'ait pas peur de faire des erreurs, car c'est en se trompant qu'on apprend.",
      keys_fr: ["je lui conseillerais de", "il faudrait que", "ne pas avoir peur de", "c'est en ... que"],
      tip_he: "למתן עצה: « Je te conseille de… », « Il faudrait que tu… » (סובז'ונקטיף)." },
  ],
};

/* assembled bank — B2/C1 split from BANK_BC */
const BANK = {
  A1: BANK_A1,
  A2: BANK_A2,
  B1: BANK_B1,
  B2: {
    gra: BANK_BC.gra.filter((_, i) => [5,6,8,9,10,11,12,15].includes(i)),
    voc: BANK_BC.voc.filter((_, i) => [0,2,3,4,5,6,7,8].includes(i)),
    com: BANK_BC.com.filter((_, i) => [0,1,2,4,6].includes(i)),
    exp: BANK_BC.exp.filter((_, i) => [0,2,4,5].includes(i)),
  },
  C1: {
    gra: BANK_BC.gra.filter((_, i) => [0,1,2,3,4,7,13,14].includes(i)),
    voc: BANK_BC.voc.filter((_, i) => [1,9,10,11,12,13,14].includes(i)),
    com: [
      ...BANK_BC.com.filter((_, i) => [3,7,8].includes(i)),
      { instruction_he:"קרא וענה: בחר את התשובה הנכונה", prompt_fr:"« Le numérique a profondément reconfiguré notre rapport au temps. L'immédiateté des échanges numériques, si elle abolit les distances, génère paradoxalement une nouvelle forme d'impatience qui érode notre capacité à la réflexion approfondie. »", trans_he:"הדיגיטלי מחדש ביסודו את יחסנו לזמן. המיידיות, אם כי מבטלת מרחקים, מייצרת חוסר סבלנות ששוחק את יכולת ההרהור המעמיק.", question_fr:"Quel est l'effet paradoxal du numérique selon ce texte ?", q_he:"מהו האפקט הפרדוקסלי של הדיגיטלי?", options:["Il rapproche les gens et renforce la réflexion","Il abolit les distances mais génère de l'impatience","Il améliore notre rapport au temps"], correct:1, explanation_he:"הפרדוקס: מבטל מרחקים אבל יוצר חוסר סבלנות ששוחק הרהור מעמיק." },
    ],
    exp: BANK_BC.exp.filter((_, i) => [1,3,6,7].includes(i)),
  },
  C2: BANK_C2,
};

const pick = (arr, avoid) => {
  const pool = arr.length > 1 && avoid != null ? arr.filter((_, i) => i !== avoid) : arr;
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { item, idx: arr.indexOf(item) };
};

/* -------------------- progress service (localStorage now, cloud later) --------------------
   All persistence goes through `store`. To move to a cloud backend later,
   swap ONLY the two methods in `store` for API calls — nothing else changes. */
const SKILLS = ["gra", "voc", "com", "exp"];
const PKEY = "frenchup_progress_v2";
const PKEY_V1 = "frenchup_progress_v1";
const _mem = new Map();
const _hasLS = () => { try { return typeof window !== "undefined" && !!window.localStorage; } catch { return false; } };
const store = {
  get(k) { try { if (_hasLS()) { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } } catch (e) {} return _mem.has(k) ? _mem.get(k) : null; },
  set(k, v) { try { if (_hasLS()) { localStorage.setItem(k, JSON.stringify(v)); return; } } catch (e) {} _mem.set(k, v); },
};
const freshSkillMap = () => Object.fromEntries(SKILLS.map((s) => [s, { xp: 0, correct: 0 }]));
const freshProgress = () => ({
  xp: 0, streak: { count: 0, lastDay: null },
  bySkill: freshSkillMap(),
  byLevel: Object.fromEntries(LEVELS.map((l) => [l, freshSkillMap()])),
  history: [], mistakes: {}, badges: [],
});
function loadProgress() {
  let p = store.get(PKEY);
  if (!p) {
    const v1 = store.get(PKEY_V1);
    if (v1) {
      p = { ...freshProgress(), ...v1, byLevel: freshProgress().byLevel };
      SKILLS.forEach((s) => { if (v1.bySkill?.[s]) p.byLevel.B2[s] = { ...v1.bySkill[s] }; });
    } else return freshProgress();
  }
  const base = freshProgress();
  const byLevel = Object.fromEntries(LEVELS.map((l) => [l, {
    ...base.byLevel[l],
    ...Object.fromEntries(SKILLS.map((s) => [s, { ...base.byLevel[l][s], ...(p.byLevel?.[l]?.[s] || {}) }])),
  }]));
  return { ...base, ...p, streak: { ...base.streak, ...(p.streak || {}) },
    bySkill: { ...base.bySkill, ...(p.bySkill || {}) }, byLevel,
    mistakes: p.mistakes || {}, history: p.history || [], badges: p.badges || [] };
}
const saveProgress = (p) => { store.set(PKEY, p); return p; };
const dayKey = (d = new Date()) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };
function streakStatus(p) {
  const t = dayKey(), y = yesterdayKey();
  const { count = 0, lastDay = null } = p.streak || {};
  if (lastDay === t) return { count, active: true };
  if (lastDay === y) return { count, active: false };
  return { count: 0, active: false };
}
function recordAnswer(p, { skill, correct, xp, solution, level }) {
  p.xp = Math.max(0, p.xp + (xp || 0));
  if (p.bySkill[skill]) {
    p.bySkill[skill].xp = Math.max(0, (p.bySkill[skill].xp || 0) + (xp || 0));
    if (correct) p.bySkill[skill].correct = (p.bySkill[skill].correct || 0) + 1;
  }
  if (level && p.byLevel?.[level]?.[skill]) {
    p.byLevel[level][skill].xp = Math.max(0, (p.byLevel[level][skill].xp || 0) + (xp || 0));
    if (correct) p.byLevel[level][skill].correct = (p.byLevel[level][skill].correct || 0) + 1;
  }
  if (!correct && solution) p.mistakes[solution] = (p.mistakes[solution] || 0) + 1;
  return p;
}
function recordSession(p, { sessionXp, correct, total }) {
  const t = dayKey(), y = yesterdayKey();
  const s = p.streak || { count: 0, lastDay: null };
  if (s.lastDay !== t) { s.count = s.lastDay === y ? s.count + 1 : 1; s.lastDay = t; }
  p.streak = s;
  p.history.unshift({ date: new Date().toISOString(), xp: sessionXp, correct, total });
  p.history = p.history.slice(0, 60);
  return p;
}

/* -------------------- metro lines (progress by correct answers) -------------------- */
const STATIONS_PER = 6;       // stations per skill line
const PER_STATION = 3;        // correct answers needed to advance one station
const STATION_NAMES = {
  A1: {
    gra: ["être/avoir", "Articles", "Pluriel", "Négation", "Adjectifs", "Questions"],
    voc: ["Salutations", "Famille", "Couleurs", "Chiffres", "Jours", "Objets"],
    com: ["Au café", "À l'école", "La famille", "Au magasin", "Dans la rue", "À la maison"],
    exp: ["Se présenter", "Ma famille", "J'aime…", "Ma journée", "Mon école", "Mon pays"],
  },
  A2: {
    gra: ["Passé composé", "Avoir/Être", "Futur proche", "Adjectifs", "Possessifs", "Imparfait"],
    voc: ["Alimentation", "Transport", "Santé", "Vêtements", "Sport", "Météo"],
    com: ["Panneaux", "Horaires", "Menus", "SMS & mails", "Annonces", "Articles courts"],
    exp: ["Hier…", "Mon appart", "Mon week-end", "Mes goûts", "Ma routine", "Mon quartier"],
  },
  B1: {
    gra: ["Imparfait/PC", "Qui / Que", "Pronoms COD", "Pronoms COI", "Réfléchis", "Comparatifs"],
    voc: ["Voyages", "Santé", "Environnement", "Médias", "Travail", "Relations"],
    com: ["Faits divers", "Blogs", "Publicités", "Interviews", "Critiques", "Reportages"],
    exp: ["Opinion", "Événement", "Description", "Comparaison", "Conseil", "Récit"],
  },
  B2: {
    gra: ["Dont / Y / En", "Gérondif", "Plus-que-parfait", "Conditionnel", "Accord PP", "Prépositions"],
    voc: ["Travail", "Émotions", "Expressions", "Nuances", "Registres", "Idiomes"],
    com: ["Presse", "Chroniques", "Débats TV", "Essais", "Discours", "Analyses"],
    exp: ["Société", "Culture", "Argumentation", "Nuancer", "Convaincre", "Improviser"],
  },
  C1: {
    gra: ["Subjonctif", "Conditionnel passé", "Disc. indirect", "Concordance", "Subj. passé", "Style avancé"],
    voc: ["Abstrait", "Professionnel", "Académique", "Registres", "Idiomes avancés", "Littéraire"],
    com: ["Débats", "Littérature", "Philosophie", "Politique", "Sciences", "Arts"],
    exp: ["Débattre", "Nuancer", "Négocier", "Analyser", "Convaincre", "Spontané"],
  },
  C2: {
    gra: ["Passif", "Participe composé", "Ne explétif", "Quoi que…", "Hypothèses", "Style littéraire"],
    voc: ["Diversité", "Philosophie", "Rhétorique", "Littéraire", "Académique", "Épistémologie"],
    com: ["Philosophie", "Littérature", "Sociologie", "Politique", "Esthétique", "Épistémologie"],
    exp: ["Dissertation", "Commentaire", "Thèse/Antithèse", "Analyse", "Nuance", "Maîtrise"],
  },
};
const stationsDone = (correct) => Math.min(Math.floor((correct || 0) / PER_STATION), STATIONS_PER);
function weeklyXp(p) {
  const names = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const map = {};
  (p.history || []).forEach((h) => { const k = dayKey(new Date(h.date)); map[k] = (map[k] || 0) + (h.xp || 0); });
  const out = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push({ d: names[d.getDay()], xp: Math.max(0, map[dayKey(d)] || 0) }); }
  return out;
}

/* -------------------- AUDIO: neural (cloud) + device fallback -------------------- */
const cleanSpeech = (s) => (s || "").replace(/«|»/g, "").replace(/\([^)]*\)/g, "").replace(/_+/g, "... ").replace(/\s+/g, " ").trim();
const hasFrench = (s) => /[a-zA-ZÀ-ÿ]/.test(cleanSpeech(s));

let TTS_MODE = "checking";        // 'cloud' | 'device' | 'checking'
const audioCache = new Map();     // text -> object URL
let currentAudio = null;

async function fetchNeural(text) {
  const clean = cleanSpeech(text);
  if (audioCache.has(clean)) return audioCache.get(clean);
  const res = await fetch("/api/tts", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: clean }),
  });
  if (!res.ok) throw new Error("tts " + res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(clean, url);
  return url;
}

async function speakNeural(text) {
  const url = await fetchNeural(text);
  if (currentAudio) { try { currentAudio.pause(); } catch (e) {} }
  currentAudio = new Audio(url);
  await currentAudio.play();
}

/* ---- device voices (fallback) ---- */
let FR_VOICES = [];
let CURRENT_VOICE = null;
function scoreVoice(v) {
  const n = (v.name || "").toLowerCase();
  let s = 0;
  if (/google/.test(n)) s += 60;
  if (/natural|neural|online|wavenet/.test(n)) s += 55;
  if (/siri/.test(n)) s += 45;
  if (/enhanced|premium|améliorée|amelioree/.test(n)) s += 40;
  if (/thomas|amélie|amelie|aurélie|aurelie|audrey|marie|chantal/.test(n)) s += 20;
  if (/fr-fr/i.test(v.lang)) s += 10;
  if (/fr-ca|fr-be|fr-ch/i.test(v.lang)) s += 4;
  if (v.localService === false) s += 8;
  if (/compact|eloquence|basique/.test(n)) s -= 80;
  return s;
}
function loadVoices() {
  try {
    const all = window.speechSynthesis?.getVoices() || [];
    FR_VOICES = all.filter((v) => /^fr/i.test(v.lang)).sort((a, b) => scoreVoice(b) - scoreVoice(a));
    if (FR_VOICES.length && (!CURRENT_VOICE || !FR_VOICES.some((v) => v.voiceURI === CURRENT_VOICE.voiceURI)))
      CURRENT_VOICE = FR_VOICES[0];
  } catch (e) {}
  return FR_VOICES;
}
function speakDevice(text) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (!CURRENT_VOICE) loadVoices();
    synth.cancel();
    const u = new SpeechSynthesisUtterance(cleanSpeech(text));
    u.lang = CURRENT_VOICE?.lang || "fr-FR";
    if (CURRENT_VOICE) u.voice = CURRENT_VOICE;
    u.rate = 0.96; u.pitch = 1.0;
    synth.speak(u);
  } catch (e) {}
}

// unified entry: neural first, device on failure
async function speak(text, setBusy) {
  try {
    if (setBusy) setBusy(true);
    if (TTS_MODE === "device") { speakDevice(text); return; }
    await speakNeural(text);
  } catch (e) {
    speakDevice(text);
  } finally {
    if (setBusy) setBusy(false);
  }
}

function SpeakerBtn({ text, color = INK, size = 34 }) {
  const [busy, setBusy] = useState(false);
  if (!hasFrench(text)) return null;
  return (
    <button className="spk" style={{ width: size, height: size, borderColor: color, color }}
      onClick={(e) => { e.stopPropagation(); speak(text, setBusy); }} aria-label="האזן בצרפתית" title="האזן">
      {busy ? (
        <span className="spk-spin" style={{ borderTopColor: color }} />
      ) : (
        <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      )}
    </button>
  );
}

function FrBlock({ text, he, big }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [text]);
  return (
    <div className={`frblock ${big ? "big" : ""}`}>
      <div className="frblock-bar">
        <SpeakerBtn text={text} />
        {he && <button className="translate-btn" onClick={() => setOpen((o) => !o)}>{open ? "הסתר תרגום" : "👆 תרגום"}</button>}
      </div>
      <div className="frblock-text" onClick={() => he && setOpen((o) => !o)} style={{ cursor: he ? "pointer" : "default" }}>{text}</div>
      {open && he && <div className="frblock-trans">{he}</div>}
    </div>
  );
}

function VoicePicker() {
  const [, force] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const upd = () => { loadVoices(); setReady(true); force((x) => x + 1); };
    upd();
    synth.addEventListener?.("voiceschanged", upd);
    const t = setTimeout(upd, 400);
    return () => { synth.removeEventListener?.("voiceschanged", upd); clearTimeout(t); };
  }, []);
  if (!ready || FR_VOICES.length <= 1) return null;
  return (
    <label className="voice-sel" title="בחר קול צרפתי">🔊
      <select value={CURRENT_VOICE?.voiceURI || ""}
        onChange={(e) => { CURRENT_VOICE = FR_VOICES.find((v) => v.voiceURI === e.target.value) || CURRENT_VOICE; force((x) => x + 1); speakDevice("Bonjour"); }}>
        {FR_VOICES.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
      </select>
    </label>
  );
}

function TtsStatus() {
  const [mode, setMode] = useState("checking");
  useEffect(() => {
    let alive = true;
    fetch("/api/tts").then((r) => r.json()).then((d) => {
      if (!alive) return;
      const m = d?.configured ? "cloud" : "device";
      TTS_MODE = m; setMode(m); if (m === "device") loadVoices();
    }).catch(() => { if (alive) { TTS_MODE = "device"; setMode("device"); loadVoices(); } });
    return () => { alive = false; };
  }, []);
  if (mode === "checking") return <p className="vq">בודק קול…</p>;
  if (mode === "cloud") return <p className="vq ok">✓ קול נוירוני (ElevenLabs) פעיל — נשמע אנושי לחלוטין.</p>;
  return (
    <div>
      <p className="vq warn">
        השרת ל-TTS עדיין לא מוגדר (חסר <b>ELEVENLABS_API_KEY</b> ב-Vercel) — בינתיים בשימוש קול המכשיר.
        הוסף את המפתח ב-Vercel והאתר יעבור אוטומטית לקול הנוירוני.
      </p>
      <VoicePicker />
    </div>
  );
}

/* -------------------- PARISIAN BACKGROUND MUSIC -------------------- */
const NOTE_FREQ = {
  A2: 110.00, B2: 123.47, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, CS4: 277.18, D4: 293.66, E4: 329.63, F4: 349.23, FS4: 369.99, G4: 392.00, GS4: 415.30, A4: 440.00, B4: 493.88,
  C5: 523.25, CS5: 554.37, D5: 587.33, E5: 659.25, F5: 698.46, FS5: 739.99, G5: 783.99, GS5: 830.61, A5: 880.00, B5: 987.77,
};
const PARIS_MELODY = [
  ["E5", 0, 1.35, 0.72], ["D5", 1.55, 0.55, 0.5], ["C5", 2.18, 0.72, 0.58],
  ["B4", 3, 0.95, 0.5], ["C5", 4.1, 0.62, 0.54], ["A4", 5.02, 0.9, 0.44],
  ["D5", 6, 1.18, 0.68], ["F5", 7.4, 0.48, 0.44], ["E5", 8.02, 0.82, 0.54],
  ["C5", 9.1, 0.58, 0.48], ["B4", 9.86, 0.5, 0.4], ["A4", 10.6, 1.25, 0.56],
  ["C5", 12, 0.72, 0.5], ["E5", 12.86, 0.76, 0.6], ["A5", 13.82, 1.1, 0.7],
  ["G5", 15.2, 0.58, 0.5], ["F5", 16.05, 0.82, 0.56], ["E5", 17.05, 1.1, 0.54],
  ["D5", 18, 0.72, 0.46], ["CS5", 18.86, 0.55, 0.4], ["D5", 19.5, 0.9, 0.52],
  ["F5", 20.65, 0.68, 0.54], ["E5", 21.62, 0.75, 0.48], ["A4", 22.72, 1.1, 0.5],
  ["B4", 24, 0.72, 0.52], ["C5", 24.92, 0.72, 0.55], ["D5", 25.8, 1.0, 0.58],
  ["E5", 27.05, 1.2, 0.62], ["G5", 28.45, 0.44, 0.42], ["F5", 29.05, 0.8, 0.5],
  ["E5", 30, 1.05, 0.54], ["D5", 31.25, 0.58, 0.42], ["C5", 32.1, 0.88, 0.52],
  ["B4", 33.18, 0.58, 0.4], ["GS4", 34.0, 0.7, 0.38], ["A4", 35.0, 1.0, 0.52],
  ["C5", 36, 0.76, 0.48], ["B4", 36.95, 0.66, 0.42], ["A4", 37.85, 1.1, 0.5],
  ["F5", 39.1, 0.82, 0.58], ["E5", 40.18, 0.7, 0.48], ["D5", 41.05, 0.9, 0.46],
  ["C5", 42.2, 0.7, 0.44], ["B4", 43.05, 0.64, 0.4], ["A4", 44, 1.8, 0.56],
];
const PARIS_CHORDS = [
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "E3", notes: ["E4", "GS4", "B4"] },
  { root: "D3", notes: ["F4", "A4", "D5"] },
  { root: "E3", notes: ["D4", "GS4", "B4"] },
  { root: "F3", notes: ["E4", "A4", "C5"] },
  { root: "D3", notes: ["F4", "A4", "CS5"] },
  { root: "E3", notes: ["D4", "GS4", "B4"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "C3", notes: ["E4", "G4", "C5"] },
  { root: "D3", notes: ["F4", "A4", "D5"] },
  { root: "F3", notes: ["E4", "A4", "C5"] },
  { root: "B2", notes: ["D4", "F4", "B4"] },
  { root: "E3", notes: ["D4", "GS4", "B4"] },
  { root: "A2", notes: ["C4", "E4", "A4"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
];
const SEINE_MELODY = [
  ["C5", 0, 1.4, 0.5], ["E5", 1.7, 0.9, 0.58], ["D5", 3.0, 1.1, 0.46],
  ["B4", 4.35, 0.7, 0.38], ["C5", 5.3, 1.4, 0.5], ["A4", 7.0, 1.2, 0.42],
  ["F4", 9.0, 0.8, 0.36], ["A4", 10.1, 0.75, 0.44], ["C5", 11.05, 1.35, 0.54],
  ["E5", 13.0, 1.0, 0.55], ["G5", 14.35, 0.62, 0.5], ["F5", 15.25, 1.25, 0.48],
  ["E5", 17.0, 0.86, 0.46], ["D5", 18.2, 0.86, 0.4], ["C5", 19.4, 1.5, 0.52],
  ["B4", 22.0, 0.78, 0.36], ["C5", 23.1, 0.9, 0.48], ["E5", 24.35, 1.2, 0.54],
  ["D5", 26.0, 0.9, 0.42], ["A4", 27.25, 1.35, 0.44], ["C5", 30.0, 1.8, 0.5],
];
const SEINE_CHORDS = [
  { root: "C3", notes: ["E4", "G4", "C5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "F3", notes: ["E4", "A4", "C5"] },
  { root: "D3", notes: ["F4", "A4", "D5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "C3", notes: ["E4", "G4", "C5"] },
  { root: "C3", notes: ["G4", "C5", "E5"] },
  { root: "F3", notes: ["A4", "C5", "F5"] },
  { root: "C3", notes: ["E4", "G4", "C5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "C3", notes: ["E4", "G4", "C5"] },
];
const MONTMARTRE_MELODY = [
  ["A4", 0, 0.7, 0.62], ["C5", 0.9, 0.45, 0.48], ["E5", 1.5, 0.5, 0.56], ["A5", 2.15, 0.85, 0.68],
  ["G5", 3.15, 0.65, 0.52], ["E5", 4.0, 0.5, 0.48], ["C5", 4.65, 0.55, 0.44], ["A4", 5.35, 0.9, 0.5],
  ["D5", 6.0, 0.72, 0.58], ["F5", 6.95, 0.42, 0.46], ["A5", 7.5, 0.5, 0.56], ["G5", 8.1, 0.9, 0.6],
  ["E5", 9.2, 0.58, 0.48], ["D5", 10.0, 0.6, 0.44], ["C5", 10.82, 1.05, 0.52],
  ["E5", 12.0, 0.62, 0.52], ["F5", 12.8, 0.52, 0.48], ["E5", 13.45, 0.52, 0.5], ["D5", 14.1, 0.72, 0.42],
  ["C5", 15.0, 0.8, 0.48], ["A4", 16.05, 0.55, 0.42], ["B4", 16.75, 0.55, 0.44], ["C5", 17.5, 1.1, 0.54],
  ["F5", 18.7, 0.62, 0.54], ["E5", 19.5, 0.62, 0.48], ["D5", 20.3, 0.72, 0.44], ["A4", 21.35, 1.25, 0.5],
];
const MONTMARTRE_CHORDS = [
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "D3", notes: ["F4", "A4", "D5"] },
  { root: "E3", notes: ["D4", "GS4", "B4"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "F3", notes: ["A4", "C5", "F5"] },
  { root: "D3", notes: ["F4", "A4", "D5"] },
  { root: "E3", notes: ["D4", "GS4", "B4"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
];
const RIVE_GAUCHE_MELODY = [
  ["D5", 0, 1.6, 0.48], ["F5", 2.05, 0.95, 0.54], ["E5", 3.45, 1.3, 0.46],
  ["C5", 5.2, 1.4, 0.42], ["A4", 7.1, 1.25, 0.38], ["D5", 9.2, 1.6, 0.5],
  ["C5", 11.3, 0.8, 0.4], ["B4", 12.45, 0.8, 0.36], ["A4", 13.6, 1.8, 0.42],
  ["F4", 16.0, 0.9, 0.35], ["A4", 17.15, 1.15, 0.42], ["D5", 18.65, 1.45, 0.5],
  ["E5", 21.0, 1.0, 0.44], ["F5", 22.35, 1.1, 0.48], ["A4", 24.1, 1.85, 0.4],
];
const RIVE_GAUCHE_CHORDS = [
  { root: "D3", notes: ["F4", "A4", "D5"] },
  { root: "A2", notes: ["E4", "A4", "CS5"] },
  { root: "B2", notes: ["D4", "F4", "B4"] },
  { root: "F3", notes: ["A4", "C5", "F5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "C3", notes: ["E4", "G4", "C5"] },
  { root: "A2", notes: ["E4", "A4", "CS5"] },
  { root: "D3", notes: ["F4", "A4", "D5"] },
  { root: "D3", notes: ["A4", "D5", "F5"] },
];
const MUSIC_THEMES = [
  { id: "salon", name: "Salon de Paris", mood: "פסנתר ואקורדיון קאמרי", melody: PARIS_MELODY, chords: PARIS_CHORDS, beat: 0.58, loopBeats: 48, master: 0.24, wet: 0.34, filter: 6200, piano: 0.095, accordion: 0.026 },
  { id: "seine", name: "Clair de Seine", mood: "נוקטורן רגוע על הנהר", melody: SEINE_MELODY, chords: SEINE_CHORDS, beat: 0.68, loopBeats: 36, master: 0.22, wet: 0.44, filter: 5400, piano: 0.105, accordion: 0.012 },
  { id: "montmartre", name: "Valse de Montmartre", mood: "ואלס אקורדיון חי יותר", melody: MONTMARTRE_MELODY, chords: MONTMARTRE_CHORDS, beat: 0.48, loopBeats: 24, master: 0.23, wet: 0.3, filter: 6600, piano: 0.08, accordion: 0.042 },
  { id: "rive", name: "Nocturne Rive Gauche", mood: "לילה צרפתי איטי ועדין", melody: RIVE_GAUCHE_MELODY, chords: RIVE_GAUCHE_CHORDS, beat: 0.74, loopBeats: 27, master: 0.2, wet: 0.48, filter: 5000, piano: 0.1, accordion: 0.008 },
];

function humanTime(i) {
  return ((((i * 37) % 17) - 8) / 1000) * 1.8;
}

function makeRoomImpulse(ctx) {
  const duration = 2.8;
  const length = Math.floor(ctx.sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.1) * 0.42;
    }
  }
  return impulse;
}

function playTone(ctx, dest, freq, start, duration, {
  type = "triangle", gain = 0.12, detune = 0, attack = 0.025, release = 0.2, pan = 0,
} = {}) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const panner = ctx.createStereoPanner?.();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.detune.setValueAtTime(detune, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration + release);
  osc.connect(amp);
  if (panner) {
    panner.pan.setValueAtTime(pan, start);
    amp.connect(panner);
    panner.connect(dest);
  } else {
    amp.connect(dest);
  }
  osc.start(start);
  osc.stop(start + duration + release + 0.05);
}

function playPiano(ctx, dest, freq, start, duration, gain = 0.08, pan = 0) {
  playTone(ctx, dest, freq, start, duration, { type: "sine", gain: gain * 0.95, attack: 0.012, release: 0.42, pan });
  playTone(ctx, dest, freq * 2.003, start + 0.004, duration * 0.72, { type: "triangle", gain: gain * 0.22, attack: 0.008, release: 0.28, pan });
  playTone(ctx, dest, freq * 3.002, start + 0.006, duration * 0.38, { type: "sine", gain: gain * 0.08, attack: 0.006, release: 0.18, pan });
}

function playAccordion(ctx, dest, freq, start, duration, gain = 0.045, pan = 0.18) {
  [-11, 9, 23].forEach((detune, i) => {
    playTone(ctx, dest, freq, start + i * 0.006, duration, {
      type: "sawtooth", gain: gain * (i === 2 ? 0.22 : 0.34), detune, attack: 0.08, release: 0.36, pan,
    });
  });
}

function scheduleParisLoop(ctx, dest, startAt, theme) {
  const beat = theme.beat;
  const loopBeats = theme.loopBeats;
  theme.melody.forEach(([note, beatAt, beats, vel], i) => {
    const start = startAt + beatAt * beat + humanTime(i);
    const dur = beats * beat * 1.18;
    const freq = NOTE_FREQ[note];
    playPiano(ctx, dest, freq, start, dur, theme.piano * vel, -0.08);
    if (beats > 0.85) playAccordion(ctx, dest, freq, start + 0.035, dur * 0.86, theme.accordion * vel, 0.16);
  });
  theme.chords.forEach((chord, bar) => {
    const base = startAt + bar * 3 * beat + humanTime(bar + 100);
    const mood = bar % 4 === 3 ? 0.84 : 1;
    playPiano(ctx, dest, NOTE_FREQ[chord.root], base, beat * 1.55, theme.piano * 1.25 * mood, -0.24);
    chord.notes.forEach((note, i) => {
      playPiano(ctx, dest, NOTE_FREQ[note], base + (0.78 + i * 0.46) * beat + humanTime(bar * 5 + i), beat * 1.85, theme.piano * 0.4 * mood, -0.04 + i * 0.06);
      if (bar % 2 === 0 && i !== 1) playAccordion(ctx, dest, NOTE_FREQ[note], base + (1.05 + i * 0.4) * beat, beat * 1.25, theme.accordion * 0.54 * mood, 0.22);
    });
  });
  return loopBeats * beat;
}

function ParisMusicButton() {
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [themeId, setThemeId] = useState("salon");
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const theme = MUSIC_THEMES.find((t) => t.id === themeId) || MUSIC_THEMES[0];

  const stopMusic = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    const pack = audioRef.current;
    audioRef.current = null;
    if (!pack) return;
    const now = pack.ctx.currentTime;
    pack.master.gain.cancelScheduledValues(now);
    pack.master.gain.setTargetAtTime(0.0001, now, 0.08);
    setTimeout(() => pack.ctx.close().catch(() => {}), 250);
  };

  const startMusic = async (nextTheme = theme) => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const input = ctx.createGain();
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    const reverb = ctx.createConvolver();
    const compressor = ctx.createDynamicsCompressor();
    const master = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = nextTheme.filter;
    filter.Q.value = 0.7;
    dry.gain.value = 0.82;
    wet.gain.value = nextTheme.wet;
    reverb.buffer = makeRoomImpulse(ctx);
    compressor.threshold.value = -22;
    compressor.knee.value = 24;
    compressor.ratio.value = 2.4;
    compressor.attack.value = 0.018;
    compressor.release.value = 0.24;
    master.gain.value = 0.0001;
    input.connect(filter);
    filter.connect(dry);
    filter.connect(reverb);
    reverb.connect(wet);
    dry.connect(compressor);
    wet.connect(compressor);
    compressor.connect(master);
    master.connect(ctx.destination);
    audioRef.current = { ctx, master };
    await ctx.resume();
    const startAt = ctx.currentTime + 0.08;
    const loopSec = scheduleParisLoop(ctx, input, startAt, nextTheme);
    master.gain.setTargetAtTime(nextTheme.master, ctx.currentTime, 0.32);
    let nextStart = startAt + loopSec;
    timerRef.current = setInterval(() => {
      scheduleParisLoop(ctx, input, nextStart, nextTheme);
      nextStart += loopSec;
    }, (loopSec - 0.8) * 1000);
  };

  const chooseTheme = async (nextTheme) => {
    setThemeId(nextTheme.id);
    setOpen(false);
    if (!playing) return;
    stopMusic();
    try {
      await startMusic(nextTheme);
      setPlaying(true);
    } catch (e) {
      stopMusic();
      setPlaying(false);
    }
  };

  const toggle = async () => {
    if (playing) {
      stopMusic();
      setPlaying(false);
      return;
    }
    try {
      await startMusic();
      setPlaying(true);
    } catch (e) {
      stopMusic();
      setPlaying(false);
    }
  };

  useEffect(() => stopMusic, []);

  return (
    <div className="music-player">
      <button className={`music-btn ${playing ? "on" : ""}`} onClick={toggle}
        aria-label={playing ? "כבה מוזיקת רקע" : "הפעל מוזיקת רקע"} title={playing ? "כבה מוזיקה" : "הפעל מוזיקה"}>
        ♪
      </button>
      <button className="music-name" onClick={() => setOpen((v) => !v)} aria-label="בחר מנגינה" title="בחר מנגינה">
        <span>{theme.name}</span>
        <small>{theme.mood}</small>
      </button>
      {open && (
        <div className="music-menu">
          {MUSIC_THEMES.map((t) => (
            <button key={t.id} className={`music-option ${t.id === theme.id ? "active" : ""}`} onClick={() => chooseTheme(t)}>
              <span>{t.name}</span>
              <small>{t.mood}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- local grading (-15 on wrong) -------------------- */
const strip = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const norm = (s) => strip((s || "").toLowerCase().trim().replace(/[.,!?;:«»"'’()]/g, "").replace(/\s+/g, " "));
function gradeInput(ex, userAns) {
  const nu = norm(userAns);
  const ok = ex.accepted.some((a) => { const na = norm(a); return nu === na || nu.includes(na); });
  return { correct: ok, xp: ok ? 50 : -15, correction_fr: ex.solution_fr,
    explanation_he: ok ? "כל הכבוד — בדיוק נכון. " + ex.explanation_he : "התשובה הנכונה היא « " + ex.solution_fr + " ». " + ex.explanation_he,
    tip_he: ex.tip_he };
}
function gradeMC(ex, selIdx) {
  const ok = selIdx === ex.correct;
  return { correct: ok, xp: ok ? 50 : -15, correction_fr: "✔ " + ex.options[ex.correct],
    explanation_he: (ok ? "" : "התשובה הנכונה: « " + ex.options[ex.correct] + " ». ") + ex.explanation_he, tip_he: null };
}
function gradeOpen(ex) {
  return { correct: true, xp: 40, selfCheck: true, correction_fr: ex.model_fr,
    explanation_he: "תשובה חופשית — השווה לדוגמה למעלה. ביטויי מפתח שכדאי לשלב: " + ex.keys_fr.join(" · "), tip_he: ex.tip_he };
}

// AI evaluation for free-text answers (server-side; throws if unavailable)
let CHECK_AVAILABLE = null; // null=unknown, true/false once probed
async function probeCheck() {
  try { const r = await fetch("/api/check"); const d = await r.json(); CHECK_AVAILABLE = !!d?.configured; }
  catch { CHECK_AVAILABLE = false; }
  return CHECK_AVAILABLE;
}
async function evaluateOpen(ex, answer, level = "B1") {
  const res = await fetch("/api/check", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt_fr: ex.prompt_fr, instruction_he: ex.instruction_he, answer, level }),
  });
  if (!res.ok) throw new Error("check " + res.status);
  const d = await res.json();
  if (d.error) throw new Error(d.error);
  const score = Math.max(0, Math.min(100, Number(d.score) || 0));
  const correct = score >= 70 && d.answers_question !== false;
  const xp = correct ? (score >= 85 ? 50 : 30) : -15;
  return {
    open: true, correct, xp, score,
    criteria: [
      { label: "דקדוק", ok: !!d.grammar_ok },
      { label: "משמעות", ok: !!d.meaning_ok },
      { label: "עונה לשאלה", ok: !!d.answers_question },
      { label: "עומד בתנאים", ok: !!d.conditions_ok },
    ],
    correction_fr: d.corrected_fr || ex.model_fr,
    explanation_he: d.feedback_he || "",
    tip_he: d.tip_he || ex.tip_he,
  };
}

/* ==================================================================== */
function Quest({ onExit, level = "B1" }) {
  const [phase, setPhase] = useState("intro");
  const [round, setRound] = useState(0);
  const [ex, setEx] = useState(null);
  const [answer, setAnswer] = useState("");
  const [selIdx, setSelIdx] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkOn, setCheckOn] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [results, setResults] = useState([]);
  const lastIdx = useRef({});
  const progressRef = useRef(null);
  const inputRef = useRef(null);
  const nextBtnRef = useRef(null);
  const cur = ROUNDS[round];

  // load saved progress on mount
  useEffect(() => {
    const p = loadProgress();
    progressRef.current = p;
    setTotalXp(p.xp);
    setStreak(streakStatus(p).count);
    (CHECK_AVAILABLE === null ? probeCheck() : Promise.resolve(CHECK_AVAILABLE)).then(setCheckOn);
  }, []);

  const loadExercise = (idx) => {
    setEx(null); setFeedback(null); setAnswer(""); setSelIdx(null);
    const r = ROUNDS[idx];
    const bank = BANK[level]?.[r.id] || BANK.B2[r.id];
    const { item, idx: chosen } = pick(bank, lastIdx.current[r.id]);
    lastIdx.current[r.id] = chosen;
    const type = r.id === "com" ? "mc" : r.id === "exp" ? "open" : "input";
    let exercise = { ...item, type, skill: r };
    if (type === "mc") {
      const indexed = item.options.map((o, i) => ({ o, i }));
      for (let i = indexed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
      }
      exercise = { ...exercise, options: indexed.map((x) => x.o), correct: indexed.findIndex((x) => x.i === item.correct) };
    }
    setEx(exercise);
  };

  const start = () => { setPhase("playing"); setRound(0); setSessionXp(0); setResults([]); loadExercise(0); };
  useEffect(() => { if (ex && ex.type !== "mc" && inputRef.current) inputRef.current.focus(); }, [ex]);
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => nextBtnRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [feedback]);
  const fmtXp = (n) => (n >= 0 ? "+" + n : "" + n);

  const applyFeedback = (fb) => {
    setFeedback(fb);
    const p = progressRef.current || loadProgress();
    recordAnswer(p, { skill: cur.id, correct: fb.correct, xp: fb.xp || 0, solution: ex.solution_fr, level });
    saveProgress(p);
    progressRef.current = p;
    setTotalXp(p.xp);
    setSessionXp((x) => x + (fb.xp || 0));
    setResults((r) => [...r, { round: cur, correct: fb.correct, xp: fb.xp || 0, self: fb.selfCheck }]);
  };

  const submit = async () => {
    if (checking) return;
    if (ex.type === "mc") { if (selIdx == null) return; applyFeedback(gradeMC(ex, selIdx)); return; }
    if (ex.type !== "open") { if (!answer.trim()) return; applyFeedback(gradeInput(ex, answer)); return; }
    // open: AI evaluation when available, else fall back to model answer
    if (!answer.trim()) return;
    if (!/[a-zA-ZÀ-ÿ]/.test(answer))
      return applyFeedback({ correct: false, xp: -15, correction_fr: ex.model_fr, tip_he: ex.tip_he, explanation_he: "התשובה חייבת להיות בצרפתית — לא זוהו אותיות לטיניות." });
    if (answer.trim().split(/\s+/).length < 10)
      return applyFeedback({ correct: false, xp: -15, correction_fr: ex.model_fr, tip_he: ex.tip_he, explanation_he: `התשובה קצרה מדי — נדרשות לפחות 10 מילים. נסה להרחיב.` });
    if (!checkOn) { applyFeedback(gradeOpen(ex)); return; }
    setChecking(true);
    try {
      const fb = await evaluateOpen(ex, answer, level);
      applyFeedback(fb);
    } catch (e) {
      applyFeedback(gradeOpen(ex)); // graceful fallback
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    if (round + 1 >= ROUNDS.length) {
      const p = progressRef.current || loadProgress();
      const correctCount = results.filter((r) => r.correct).length;
      recordSession(p, { sessionXp, correct: correctCount, total: results.length });
      saveProgress(p);
      progressRef.current = p;
      setStreak(streakStatus(p).count);
      setPhase("done");
      return;
    }
    const n = round + 1; setRound(n); loadExercise(n);
  };

  return (
    <div dir="rtl" className="quest">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500;1,9..144,600&display=swap');
        * { box-sizing: border-box; }
        .quest { font-family:'Assistant',system-ui,sans-serif; color:${INK};
          background: radial-gradient(circle at 15% 0%, #FBF7EE, ${PAPER} 45%), ${PAPER};
          min-height:100vh; padding: clamp(16px,3vw,40px); max-width:760px; margin:0 auto; }
        .music-player { position:fixed; left:18px; bottom:18px; z-index:30; display:flex; align-items:center; gap:8px; direction:ltr; }
        .music-btn { width:46px; height:46px; border-radius:50%; flex:none;
          border:2px solid ${INK}; background:#fff; color:${INK}; font-family:'Fraunces',serif; font-size:25px; cursor:pointer;
          display:grid; place-items:center; box-shadow:4px 4px 0 ${INK}; transition:transform .12s,box-shadow .12s,background .12s; }
        .music-btn:hover { transform:translate(-2px,-2px); box-shadow:6px 6px 0 ${INK}; }
        .music-btn:active { transform:translate(1px,1px); box-shadow:2px 2px 0 ${INK}; }
        .music-btn.on { background:${GOLD}; }
        .music-name { min-width:170px; max-width:min(260px,calc(100vw - 88px)); text-align:left; border:2px solid ${INK}; border-radius:14px;
          background:#fff; color:${INK}; padding:8px 12px; cursor:pointer; box-shadow:4px 4px 0 ${INK}; font-family:'Assistant'; }
        .music-name span, .music-option span { display:block; font-family:'Fraunces',serif; font-style:italic; font-weight:600; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .music-name small, .music-option small { display:block; font-size:11.5px; font-weight:700; color:#7C7463; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .music-menu { position:absolute; left:0; bottom:58px; width:min(310px,calc(100vw - 36px)); background:#fff; border:2px solid ${INK};
          border-radius:16px; padding:8px; box-shadow:6px 6px 0 ${INK}; display:flex; flex-direction:column; gap:6px; }
        .music-option { text-align:left; border:1.5px solid #DDD4BF; border-radius:11px; background:#F8F4EA; padding:9px 11px; color:${INK}; cursor:pointer; }
        .music-option:hover, .music-option.active { border-color:${INK}; background:${GOLD}; }
        .fr { font-family:'Fraunces',Georgia,serif; font-style:italic; }
        .nums { font-family:'Fraunces',serif; font-variant-numeric:tabular-nums; }
        .topline { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
        .brand { font-family:'Fraunces',serif; font-style:italic; font-weight:600; font-size:26px; }
        .brand b{ color:#E8503A; font-style:normal; }
        .xp-pill { margin-inline-start:auto; background:${INK}; color:${PAPER}; border-radius:999px;
          padding:7px 15px; font-weight:700; font-size:14px; display:flex; gap:7px; align-items:center; box-shadow:3px 3px 0 ${GOLD}; }
        .topline-right { margin-inline-start:auto; display:flex; gap:10px; align-items:center; }
        .home-btn { width:38px; height:38px; border-radius:12px; border:2px solid ${INK}; background:#fff; color:${INK};
          font-size:20px; line-height:1; cursor:pointer; box-shadow:2px 2px 0 ${INK}; flex:none; }
        .home-btn:hover { transform:translate(-1px,-1px); box-shadow:3px 3px 0 ${INK}; }
        .home-btn:active { transform:translate(1px,1px); box-shadow:1px 1px 0 ${INK}; }
        .lvl-badge { background:${GOLD}; color:${INK}; border-radius:8px; padding:5px 10px; font-weight:800; font-size:13px; }
        .topline-right .xp-pill { margin-inline-start:0; }
        .streak-pill { background:#fff; border:2px solid ${INK}; color:${INK}; border-radius:999px;
          padding:6px 13px; font-weight:800; font-size:14px; display:flex; gap:6px; align-items:center; box-shadow:3px 3px 0 #E8503A; }
        .streak-banner { font-size:13.5px; font-weight:700; color:#A3471F; background:#FDEFE9; border:1px solid #F2C4B2;
          border-radius:10px; padding:10px 13px; margin-top:14px; }
        .totals-row { display:flex; justify-content:center; gap:18px; flex-wrap:wrap; font-weight:700; color:${INK};
          background:#F3EFE4; border:1.5px solid #DDD4BF; border-radius:12px; padding:12px 16px; margin-bottom:6px; }
        .progress-dots { display:flex; gap:8px; margin-bottom:20px; }
        .pdot { flex:1; height:7px; border-radius:6px; background:#E2DAC6; transition:background .3s; }
        .card { background:#fff; border:2px solid ${INK}; border-radius:20px; padding: clamp(20px,3vw,32px); box-shadow:7px 7px 0 ${INK}; }
        .ai-tag{ display:inline-flex; align-items:center; gap:7px; background:${INK}; color:${PAPER}; padding:5px 13px; border-radius:999px; font-size:13px; font-weight:700; margin-bottom:18px; }
        .round-head { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
        .round-ic { width:48px; height:48px; border-radius:14px; display:grid; place-items:center; font-size:24px; border:2px solid ${INK}; box-shadow:3px 3px 0 ${INK}; }
        .round-he { font-weight:800; font-size:19px; }
        .round-fr { font-family:'Fraunces',serif; font-style:italic; color:#8A8270; font-size:14px; }
        .instr { font-weight:700; font-size:15px; margin:0 0 12px; color:#4A4636; }
        .frblock { background:#F3EFE4; border:1.5px solid #DDD4BF; border-radius:14px; padding:14px 16px; margin-bottom:12px; }
        .frblock-bar { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
        .spk { display:grid; place-items:center; border:2px solid; background:#fff; border-radius:50%; cursor:pointer; padding:0; transition:transform .12s; flex:none; }
        .spk:hover { transform:scale(1.1); } .spk:active { transform:scale(.94); }
        .spk-spin { width:50%; height:50%; border:2px solid currentColor; border-top-color:transparent !important; border-radius:50%; animation:spin .7s linear infinite; opacity:.5; }
        .translate-btn { font-family:'Assistant'; font-weight:700; font-size:12.5px; color:#6B6452; background:#fff; border:1.5px solid #DDD4BF; border-radius:999px; padding:5px 12px; cursor:pointer; }
        .translate-btn:hover { border-color:${INK}; color:${INK}; }
        .frblock-text { font-family:'Fraunces',serif; font-size:20px; line-height:1.55; direction:ltr; text-align:left; }
        .frblock-trans { margin-top:12px; padding-top:12px; border-top:1px dashed #C9C2B2; font-size:15px; color:#4A4636; line-height:1.6; font-weight:600; }
        .question-row { display:flex; align-items:flex-start; gap:10px; margin:4px 0 12px; }
        .question-fr { font-family:'Fraunces',serif; font-style:italic; font-size:17px; direction:ltr; text-align:left; flex:1; }
        .q-trans { font-size:13.5px; color:#8A8270; margin:-6px 0 14px; font-weight:600; }
        textarea, input.ans { width:100%; font-family:'Fraunces',serif; font-size:18px; direction:ltr; text-align:left;
          border:2px solid ${INK}; border-radius:12px; padding:14px 16px; resize:vertical; background:#fff; color:${INK}; outline:none; }
        textarea:focus, input.ans:focus { box-shadow:0 0 0 3px ${GOLD}55; }
        .opts { display:flex; flex-direction:column; gap:10px; }
        .opt { display:flex; align-items:center; gap:10px; text-align:right; direction:ltr; font-family:'Fraunces',serif; font-size:16px;
          padding:13px 16px; border:2px solid ${INK}; border-radius:12px; background:#fff; cursor:pointer; transition:transform .1s; }
        .opt > span { flex:1; }
        .opt:hover{ transform:translateX(-3px); }
        .opt.sel{ background:${INK}; color:${PAPER}; }
        .opt.correct{ background:#0E9F6E; color:#fff; border-color:#0E9F6E; }
        .opt.wrong{ background:#E8503A; color:#fff; border-color:#E8503A; }
        .btn { font-family:'Assistant'; font-weight:800; font-size:16px; cursor:pointer; border:2px solid ${INK};
          border-radius:13px; padding:14px 24px; box-shadow:4px 4px 0 ${INK}; transition:transform .12s,box-shadow .12s; }
        .btn:hover{ transform:translate(-2px,-2px); box-shadow:6px 6px 0 ${INK}; }
        .btn:active{ transform:translate(2px,2px); box-shadow:1px 1px 0 ${INK}; }
        .btn:disabled{ opacity:.45; cursor:not-allowed; transform:none; box-shadow:4px 4px 0 ${INK}; }
        .btn-primary{ background:${GOLD}; color:${INK}; } .btn-dark{ background:${INK}; color:${PAPER}; }
        .btn-row{ display:flex; gap:12px; margin-top:18px; align-items:center; flex-wrap:wrap; }
        .feedback { margin-top:18px; border-radius:16px; padding:18px 20px; border:2px solid; }
        .fb-correct{ background:#EAF7F0; border-color:#0E9F6E; } .fb-wrong{ background:#FDF0EE; border-color:#E8503A; } .fb-self{ background:#F1EEFB; border-color:#8B5CF6; }
        .fb-head{ display:flex; align-items:center; gap:10px; font-weight:800; font-size:18px; margin-bottom:10px; }
        .fb-score{ font-family:'Fraunces',serif; font-weight:600; font-size:15px; color:#6B6452; }
        .criteria{ display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
        .crit{ font-size:13px; font-weight:700; padding:5px 11px; border-radius:999px; border:1.5px solid; }
        .crit.ok{ color:#0B6B4F; background:#EAF7F0; border-color:#A9DEC8; }
        .crit.no{ color:#A3271A; background:#FDECE8; border-color:#F2C0B2; }
        .fb-xp{ margin-inline-start:auto; font-family:'Fraunces',serif; font-weight:600; }
        .fb-xp.minus{ color:#E8503A; } .fb-xp.plus{ color:${GOLD}; }
        .fb-correction{ display:flex; align-items:center; gap:10px; font-family:'Fraunces',serif; font-size:16px; direction:ltr; text-align:left;
          line-height:1.5; background:#fff; border-radius:10px; padding:11px 14px; margin-bottom:10px; border:1px solid #0002; }
        .fb-correction > span { flex:1; }
        .fb-exp{ font-size:14.5px; line-height:1.6; }
        .fb-tip{ font-size:13.5px; margin-top:10px; padding-top:10px; border-top:1px dashed #0003; color:#4A4636; }
        .fb-tip b{ color:${INK}; }
        .vq { font-size:12.5px; line-height:1.65; font-weight:600; border-radius:10px; padding:10px 13px; margin-top:14px; color:#6B6452; }
        .vq.ok { color:#0B6B4F; background:#EAF7F0; border:1px solid #A9DEC8; }
        .vq.warn { color:#8A6A2A; background:#FBF3DD; border:1px solid #E7D49A; }
        .vq b { color:${INK}; }
        .voice-sel { display:inline-flex; align-items:center; gap:6px; background:#fff; border:1.5px solid #DDD4BF; border-radius:999px; padding:4px 10px; font-size:13px; font-weight:700; color:#6B6452; margin-top:10px; }
        .voice-sel select { border:none; background:transparent; font-family:'Assistant'; font-weight:700; font-size:13px; color:${INK}; outline:none; max-width:150px; }
        .intro-h{ font-family:'Fraunces',serif; font-style:italic; font-size:clamp(28px,5vw,40px); margin:0 0 6px; }
        .intro-p{ font-size:16px; color:#4A4636; line-height:1.6; margin:0 0 22px; }
        .intro-list{ list-style:none; padding:0; margin:0 0 24px; }
        .intro-list li{ display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #E2DAC6; font-weight:600; }
        .done-h{ font-family:'Fraunces',serif; font-style:italic; font-size:clamp(30px,6vw,46px); margin:0; }
        .big-xp{ font-family:'Fraunces',serif; font-size:64px; font-weight:600; color:${GOLD}; line-height:1; }
        .summary{ display:flex; flex-direction:column; gap:10px; margin:22px 0; }
        .sum-row{ display:flex; align-items:center; gap:12px; padding:12px 16px; background:#F3EFE4; border-radius:12px; border:1.5px solid #DDD4BF; font-weight:700; }
        .sum-xp{ margin-inline-start:auto; font-family:'Fraunces',serif; }
        @keyframes spin{ to{ transform:rotate(360deg);} }
      `}</style>

      <div className="topline">
        <button className="home-btn" onClick={onExit} aria-label="חזרה לדף הבית">⌂</button>
        <span className="brand">French<b>Up</b></span>
        <div className="topline-right">
          <span className="lvl-badge">{level}</span>
          {streak > 0 && <span className="streak-pill">🔥 <span className="nums">{streak}</span></span>}
          <span className="xp-pill">⭐ <span className="nums">{totalXp}</span> XP</span>
        </div>
      </div>

      {phase === "intro" && (
        <div className="card">
          <span className="ai-tag">🎯 אתגר יומי · 4 סבבים</span>
          <h1 className="intro-h">Le défi du jour</h1>
          <p className="intro-p">
            ארבעה סבבים ברמת B2/C1. הקש על 🔊 כדי לשמוע צרפתית בקול נוירוני, ועל «תרגום» לראות עברית.
            תשובה נכונה: +50 XP · תשובה שגויה: −15 XP עם הסבר מלא.
          </p>
          <ul className="intro-list">
            {ROUNDS.map((r) => (
              <li key={r.id}><span style={{ fontSize: 22 }}>{r.icon}</span>
                <span>{r.he} <span className="fr" style={{ color: "#8A8270" }}>· {r.fr}</span></span></li>
            ))}
          </ul>
          <button className="btn btn-primary" onClick={start}>התחל את האתגר ←</button>
          {streak > 0 && <p className="streak-banner">🔥 רצף של {streak} ימים — אל תשבור אותו! השלם אתגר היום.</p>}
          <TtsStatus />
        </div>
      )}

      {phase === "playing" && (
        <>
          <div className="progress-dots">
            {ROUNDS.map((r, i) => (
              <span key={r.id} className="pdot" style={{ background: i < round ? "#0E9F6E" : i === round ? cur.color : "#E2DAC6" }} />
            ))}
          </div>
          <div className="card">
            <div className="round-head">
              <div className="round-ic" style={{ background: cur.color + "22" }}>{cur.icon}</div>
              <div>
                <div className="round-he">{cur.he}</div>
                <div className="round-fr">{cur.fr} · סבב {round + 1}/{ROUNDS.length}</div>
              </div>
            </div>

            {ex && (
              <>
                <p className="instr">{ex.instruction_he}</p>
                <FrBlock text={ex.prompt_fr} he={ex.trans_he} big />

                {ex.type === "mc" && (
                  <>
                    <div className="question-row">
                      <SpeakerBtn text={ex.question_fr} size={30} />
                      <p className="question-fr">{ex.question_fr}</p>
                    </div>
                    {ex.q_he && <p className="q-trans">↳ {ex.q_he}</p>}
                    <div className="opts">
                      {ex.options.map((o, i) => {
                        let cls = "opt";
                        if (feedback) { if (i === ex.correct) cls += " correct"; else if (i === selIdx) cls += " wrong"; }
                        else if (i === selIdx) cls += " sel";
                        return (
                          <button key={i} className={cls} disabled={!!feedback} onClick={() => setSelIdx(i)}>
                            <span>{o}</span><SpeakerBtn text={o} size={28} color={feedback && (i === ex.correct || i === selIdx) ? "#fff" : INK} />
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {ex.type !== "mc" && !feedback && (
                  ex.type === "open"
                    ? <textarea ref={inputRef} rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="כתוב את תשובתך בצרפתית..." />
                    : <input ref={inputRef} className="ans" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="התשובה שלך בצרפתית..." />
                )}

                {!feedback && (
                  <div className="btn-row">
                    <button className="btn btn-dark" onClick={submit}
                      disabled={checking || (ex.type === "mc" ? selIdx == null : !answer.trim())}>
                      {checking ? "Claude בודק…" : ex.type === "open" ? (checkOn ? "בדוק את התשובה שלי" : "הצג תשובת מודל") : "שלח תשובה"}
                    </button>
                    {checking && <div className="spinner" />}
                  </div>
                )}

                {feedback && (
                  <>
                    <div className={`feedback ${feedback.open ? (feedback.correct ? "fb-correct" : "fb-wrong") : feedback.selfCheck ? "fb-self" : feedback.correct ? "fb-correct" : "fb-wrong"}`}>
                      <div className="fb-head">
                        <span>
                          {feedback.open
                            ? (feedback.score >= 85 ? "מצוין! 🎉" : feedback.score >= 60 ? "טוב — עם תיקונים" : "צריך עבודה")
                            : feedback.selfCheck ? "תשובת מודל" : feedback.correct ? "✓ נכון!" : "✗ טעות"}
                        </span>
                        {feedback.open && <span className="fb-score">{feedback.score}/100</span>}
                        <span className={`fb-xp ${feedback.xp < 0 ? "minus" : "plus"}`}>{fmtXp(feedback.xp)} XP</span>
                      </div>
                      {feedback.criteria && (
                        <div className="criteria">
                          {feedback.criteria.map((c, i) => (
                            <span key={i} className={`crit ${c.ok ? "ok" : "no"}`}>{c.ok ? "✓" : "✗"} {c.label}</span>
                          ))}
                        </div>
                      )}
                      {feedback.correction_fr && (
                        <div className="fb-correction">
                          <span>{feedback.open ? "✍️ " : ""}{feedback.correction_fr}</span>
                          <SpeakerBtn text={feedback.correction_fr} size={30} />
                        </div>
                      )}
                      {feedback.explanation_he && <div className="fb-exp">{feedback.explanation_he}</div>}
                      {feedback.tip_he && <div className="fb-tip"><b>טיפ:</b> {feedback.tip_he}</div>}
                    </div>
                    <div className="btn-row">
                      <button ref={nextBtnRef} className="btn btn-primary" onClick={next}>{round + 1 >= ROUNDS.length ? "סיים אתגר 🎉" : "הסבב הבא ←"}</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>🗼</div>
          <h1 className="done-h">Bravo !</h1>
          <p style={{ color: "#4A4636", fontWeight: 600, margin: "8px 0 18px" }}>
            {streak > 1 ? `רצף של ${streak} ימים — כל הכבוד! 🔥` : "סיימת את האתגר היומי. הסטריק התחיל! 🔥"}
          </p>
          <div className="big-xp">{sessionXp >= 0 ? "+" + sessionXp : sessionXp}</div>
          <div style={{ fontWeight: 700, color: "#8A8270", marginBottom: 14 }}>XP בסשן הזה</div>
          <div className="totals-row">
            <span>🔥 {streak} ימים רצוף</span>
            <span>⭐ סה״כ {totalXp} XP</span>
          </div>
          <div className="summary">
            {results.map((r, i) => (
              <div className="sum-row" key={i}>
                <span>{r.round.icon}</span><span>{r.round.he}</span>
                <span style={{ color: r.self ? "#8B5CF6" : r.correct ? "#0E9F6E" : "#E8503A" }}>{r.self ? "✎" : r.correct ? "✓" : "✗"}</span>
                <span className="sum-xp" style={{ color: r.xp < 0 ? "#E8503A" : GOLD }}>{r.xp >= 0 ? "+" + r.xp : r.xp}</span>
              </div>
            ))}
          </div>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={start}>אתגר נוסף</button>
            <button className="btn btn-dark" onClick={onExit}>דף הבית ←</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================================================================== */
/*  DASHBOARD — home screen, reads live progress, links into the Quest  */
/* ==================================================================== */
function MetroLine({ skill, correct, idx, sel, onSel, level }) {
  const names = STATION_NAMES[level]?.[skill.id] || [];
  const done = stationsDone(correct);
  const pct = Math.round((done / STATIONS_PER) * 100);
  return (
    <div className="metro-row" style={{ animationDelay: `${0.1 + idx * 0.08}s` }}>
      <div className="metro-head">
        <span className="metro-dot" style={{ background: skill.color }} />
        <span className="metro-he">{skill.he}</span>
        <span className="metro-fr">{skill.fr}</span>
        <span className="metro-pct" style={{ color: skill.color }}>{pct}%</span>
      </div>
      <div className="metro-track">
        <div className="rail-base" />
        <div className="rail-fill" style={{ background: skill.color, width: `${(Math.max(done, 0) / (STATIONS_PER - 1)) * 100}%` }} />
        <div className="stations">
          {names.map((s, i) => {
            const isDone = i < done, here = i === done, isSel = sel === `${skill.id}-${i}`;
            return (
              <button key={s} className={`station ${here ? "here" : ""} ${isSel ? "sel" : ""}`}
                onClick={() => onSel(`${skill.id}-${i}`)}
                style={{ borderColor: isDone || here ? skill.color : "#C9C2B2", background: isDone ? skill.color : here ? "#fff" : "#EDE7D8" }}>
                {here && <span className="here-pin" style={{ background: skill.color }} />}
                <span className="station-label" style={{ color: isSel ? skill.color : undefined, fontWeight: isSel || here ? 700 : 400 }}>{s}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onStart, selectedLevel, onLevelChange }) {
  const [p, setP] = useState(null);
  const [sel, setSel] = useState(null);
  useEffect(() => { setP(loadProgress()); }, []);
  if (!p) return null;
  const sStat = streakStatus(p);
  const week = weeklyXp(p);
  const maxXp = Math.max(10, ...week.map((w) => w.xp));
  const totalCorrect = SKILLS.reduce((a, s) => a + (p.byLevel?.[selectedLevel]?.[s]?.correct || 0), 0);
  const selInfo = sel ? (() => { const [sid, i] = sel.split("-"); const sk = ROUNDS.find((r) => r.id === sid); return { sk, name: STATION_NAMES[selectedLevel]?.[sid]?.[+i], idx: +i + 1 }; })() : null;

  return (
    <div dir="rtl" className="dash">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500;1,9..144,600&display=swap');
        * { box-sizing: border-box; }
        .dash { font-family:'Assistant',system-ui,sans-serif; color:${INK};
          background: radial-gradient(circle at 12% 0%, #FBF7EE, ${PAPER} 45%), ${PAPER};
          min-height:100vh; padding: clamp(16px,3vw,40px); max-width:820px; margin:0 auto; }
        .music-player { position:fixed; left:18px; bottom:18px; z-index:30; display:flex; align-items:center; gap:8px; direction:ltr; }
        .music-btn { width:46px; height:46px; border-radius:50%; flex:none;
          border:2px solid ${INK}; background:#fff; color:${INK}; font-family:'Fraunces',serif; font-size:25px; cursor:pointer;
          display:grid; place-items:center; box-shadow:4px 4px 0 ${INK}; transition:transform .12s,box-shadow .12s,background .12s; }
        .music-btn:hover { transform:translate(-2px,-2px); box-shadow:6px 6px 0 ${INK}; }
        .music-btn:active { transform:translate(1px,1px); box-shadow:2px 2px 0 ${INK}; }
        .music-btn.on { background:${GOLD}; }
        .music-name { min-width:170px; max-width:min(260px,calc(100vw - 88px)); text-align:left; border:2px solid ${INK}; border-radius:14px;
          background:#fff; color:${INK}; padding:8px 12px; cursor:pointer; box-shadow:4px 4px 0 ${INK}; font-family:'Assistant'; }
        .music-name span, .music-option span { display:block; font-family:'Fraunces',serif; font-style:italic; font-weight:600; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .music-name small, .music-option small { display:block; font-size:11.5px; font-weight:700; color:#7C7463; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .music-menu { position:absolute; left:0; bottom:58px; width:min(310px,calc(100vw - 36px)); background:#fff; border:2px solid ${INK};
          border-radius:16px; padding:8px; box-shadow:6px 6px 0 ${INK}; display:flex; flex-direction:column; gap:6px; }
        .music-option { text-align:left; border:1.5px solid #DDD4BF; border-radius:11px; background:#F8F4EA; padding:9px 11px; color:${INK}; cursor:pointer; }
        .music-option:hover, .music-option.active { border-color:${INK}; background:${GOLD}; }
        .fr { font-family:'Fraunces',serif; font-style:italic; }
        .nums { font-family:'Fraunces',serif; font-variant-numeric:tabular-nums; }
        .d-top { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
        .d-brand { font-family:'Fraunces',serif; font-style:italic; font-weight:600; font-size:28px; }
        .d-brand b{ color:#E8503A; font-style:normal; }
        .d-right { margin-inline-start:auto; display:flex; gap:10px; align-items:center; }
        .d-streak { background:#fff; border:2px solid ${INK}; border-radius:999px; padding:6px 13px; font-weight:800; font-size:14px; display:flex; gap:6px; align-items:center; box-shadow:3px 3px 0 #E8503A; }
        .d-xp { background:${INK}; color:${PAPER}; border-radius:999px; padding:7px 15px; font-weight:700; font-size:14px; display:flex; gap:7px; align-items:center; box-shadow:3px 3px 0 ${GOLD}; }
        .hero { background:linear-gradient(115deg, ${INK}, #20305A); color:${PAPER}; border:2px solid ${INK}; border-radius:20px;
          padding:clamp(20px,3vw,30px); box-shadow:7px 7px 0 ${INK}; position:relative; overflow:hidden; margin-bottom:22px; }
        .hero::before{ content:"é à ê ç î"; position:absolute; inset:0; font-family:'Fraunces',serif; font-style:italic;
          font-size:120px; color:rgba(255,255,255,.05); white-space:nowrap; pointer-events:none; line-height:1; padding:8px; }
        .hero-eye{ color:${GOLD}; letter-spacing:.14em; font-weight:700; font-size:12px; text-transform:uppercase; position:relative; }
        .hero h1{ font-size:clamp(22px,3.4vw,30px); margin:6px 0 14px; position:relative; }
        .hero-cta{ position:relative; font-family:'Assistant'; font-weight:800; font-size:17px; background:${GOLD}; color:${INK};
          border:2px solid ${PAPER}; border-radius:14px; padding:15px 28px; cursor:pointer; box-shadow:4px 4px 0 rgba(0,0,0,.35); transition:transform .12s; }
        .hero-cta:hover{ transform:translate(-2px,-2px); } .hero-cta:active{ transform:translate(2px,2px); }
        .card { background:#fff; border:2px solid ${INK}; border-radius:20px; padding:clamp(18px,2.6vw,26px); box-shadow:6px 6px 0 ${INK}; margin-bottom:22px; }
        .card-eyebrow { font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#9A917A; margin-bottom:4px; }
        .card-title { font-size:19px; font-weight:800; margin:0 0 18px; }
        .metro-row { margin-bottom:24px; opacity:0; transform:translateX(16px); animation:slidein .5s ease forwards; }
        .metro-row:last-child{ margin-bottom:4px; }
        @keyframes slidein { to{ opacity:1; transform:none; } }
        .metro-head { display:flex; align-items:center; gap:9px; margin-bottom:13px; }
        .metro-dot { width:13px; height:13px; border-radius:50%; box-shadow:0 0 0 3px #fff,0 0 0 4.5px currentColor; }
        .metro-he { font-weight:800; font-size:15px; }
        .metro-fr { font-family:'Fraunces',serif; font-style:italic; font-size:13px; color:#8A8270; }
        .metro-pct { margin-inline-start:auto; font-family:'Fraunces',serif; font-weight:600; font-size:16px; }
        .metro-track { position:relative; padding:4px 12px 30px; }
        .rail-base { position:absolute; top:11px; right:12px; left:12px; height:6px; background:#E2DAC6; border-radius:6px; }
        .rail-fill { position:absolute; top:11px; right:12px; height:6px; border-radius:6px; transition:width 1s cubic-bezier(.3,.8,.3,1) .2s; }
        .stations { position:relative; display:flex; justify-content:space-between; }
        .station { position:relative; width:22px; height:22px; border-radius:50%; border:3px solid; cursor:pointer; padding:0; transition:transform .15s; }
        .station:hover{ transform:scale(1.2); } .station.here{ width:26px; height:26px; margin-top:-2px; } .station.sel{ transform:scale(1.3); }
        .here-pin { position:absolute; top:-15px; right:50%; transform:translateX(50%); width:8px; height:8px; border-radius:50%; }
        .station-label { position:absolute; top:28px; right:50%; transform:translateX(50%) rotate(-32deg); transform-origin:top right;
          white-space:nowrap; font-size:11px; color:#6B6452; font-family:'Fraunces',serif; font-style:italic; }
        .sel-info { margin-top:8px; padding:12px 14px; border-radius:12px; background:#F3EFE4; border:1.5px dashed ${INK}; font-size:14px; }
        .sel-info b { font-family:'Fraunces',serif; font-style:italic; }
        .week { display:flex; align-items:flex-end; justify-content:space-between; gap:8px; height:110px; margin-top:6px; }
        .bar-col { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; height:100%; justify-content:flex-end; }
        .bar { width:100%; max-width:30px; background:${INK}; border-radius:6px 6px 0 0; transition:height .8s cubic-bezier(.3,.8,.3,1); min-height:3px; }
        .bar.top { background:#E8503A; }
        .bar-d { font-size:12px; font-weight:700; color:#8A8270; }
        .stat-line { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:22px; }
        .stat-box { flex:1; min-width:120px; background:#fff; border:2px solid ${INK}; border-radius:16px; padding:14px 16px; box-shadow:4px 4px 0 ${INK}; }
        .stat-num { font-family:'Fraunces',serif; font-size:30px; font-weight:600; line-height:1; }
        .stat-lbl { font-weight:700; color:#8A8270; font-size:13px; margin-top:4px; }
        .level-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
        .lvl-btn { font-family:'Assistant'; font-weight:800; font-size:14px; padding:9px 16px; border:2px solid ${INK}; border-radius:10px; cursor:pointer; background:#fff; color:${INK}; transition:transform .12s,box-shadow .12s; }
        .lvl-btn:hover { transform:translateY(-2px); box-shadow:2px 2px 0 ${INK}; }
        .lvl-btn.active { background:${INK}; color:${PAPER}; box-shadow:3px 3px 0 ${GOLD}; }
      `}</style>

      <div className="d-top">
        <span className="d-brand">French<b>Up</b></span>
        <div className="d-right">
          <span className="d-streak">🔥 <span className="nums">{sStat.count}</span></span>
          <span className="d-xp">⭐ <span className="nums">{p.xp}</span> XP</span>
        </div>
      </div>

      <div className="level-tabs">
        {LEVELS.map((l) => (
          <button key={l} className={`lvl-btn ${selectedLevel === l ? "active" : ""}`} onClick={() => { onLevelChange(l); setSel(null); }}>{l}</button>
        ))}
      </div>

      <div className="hero">
        <div className="hero-eye">בונז'ור 👋 · רמה {selectedLevel}</div>
        <h1>{sStat.active ? `כבר התאמנת היום ברמה ${selectedLevel} — עוד סבב?` : `מוכן לאתגר ${selectedLevel}?`}</h1>
        <button className="hero-cta" onClick={onStart}>התחל אתגר ←</button>
      </div>

      <div className="stat-line">
        <div className="stat-box"><div className="stat-num" style={{ color: "#E8503A" }}>{sStat.count}</div><div className="stat-lbl">ימים רצוף 🔥</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color: GOLD }}>{p.xp}</div><div className="stat-lbl">XP כולל ⭐</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color: "#0E9F6E" }}>{totalCorrect}</div><div className="stat-lbl">תשובות נכונות ✓</div></div>
      </div>

      <div className="card">
        <div className="card-eyebrow">Plan du progrès · קווי ההתקדמות</div>
        <h2 className="card-title">המסע שלך — תחנה לכל 3 תשובות נכונות</h2>
        {ROUNDS.map((skill, i) => (
          <MetroLine key={skill.id + selectedLevel} skill={skill} idx={i} correct={p.byLevel?.[selectedLevel]?.[skill.id]?.correct || 0} sel={sel} onSel={setSel} level={selectedLevel} />
        ))}
        {selInfo && (
          <div className="sel-info">תחנה {selInfo.idx} בקו <b style={{ color: selInfo.sk.color }}>{selInfo.sk.fr}</b> · {selInfo.sk.he}: <b>{selInfo.name}</b></div>
        )}
      </div>

      <div className="card">
        <div className="card-eyebrow">Cette semaine · השבוע</div>
        <h2 className="card-title">XP ב-7 הימים האחרונים</h2>
        <div className="week">
          {week.map((w, i) => (
            <div className="bar-col" key={i}>
              <div className={`bar ${w.xp === maxXp && w.xp > 0 ? "top" : ""}`} style={{ height: `${(w.xp / maxXp) * 100}%` }} title={`${w.xp} XP`} />
              <span className="bar-d">{w.d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  APP — single page, internal transitions between dashboard & quest   */
/* ==================================================================== */
export default function App() {
  const [view, setView] = useState("dashboard");
  const [tick, setTick] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(() => store.get(LKEY) || "B1");
  const handleLevelChange = (l) => { setSelectedLevel(l); store.set(LKEY, l); };
  return (
    <>
      <ParisMusicButton />
      {view === "dashboard"
        ? <Dashboard key={tick} selectedLevel={selectedLevel} onLevelChange={handleLevelChange} onStart={() => setView("quest")} />
        : <Quest level={selectedLevel} onExit={() => { setTick((t) => t + 1); setView("dashboard"); }} />}
    </>
  );
}
