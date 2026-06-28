"use client";
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

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

/* -------------------- EXERCISE BANKS (station-indexed 2D arrays) -------------------- */
/* Structure: BANK_XX.skill[stationIndex] = array of question objects               */

const BANK_A1 = {
  /* stations: être/avoir · Articles · Pluriel · Négation · Adjectifs · Questions */
  gra: [
    [ /* 0 — être/avoir */
      { instruction_he:"השלם בצורת être הנכונה", prompt_fr:"Je ____ (être) étudiant.", trans_he:"אני סטודנט.", accepted:["suis"], solution_fr:"Je suis étudiant.", explanation_he:"être בגוף ראשון יחיד: je suis.", tip_he:"être: je suis · tu es · il/elle est · nous sommes · vous êtes · ils sont." },
      { instruction_he:"השלם בצורת avoir הנכונה", prompt_fr:"Elle ____ (avoir) un chat.", trans_he:"יש לה חתול.", accepted:["a"], solution_fr:"Elle a un chat.", explanation_he:"avoir בגוף שלישי יחיד: il/elle a.", tip_he:"avoir: j'ai · tu as · il/elle a · nous avons · vous avez · ils ont." },
      { instruction_he:"être או avoir?", prompt_fr:"Nous ____ (être) contents.", trans_he:"אנחנו שמחים.", accepted:["sommes"], solution_fr:"Nous sommes contents.", explanation_he:"être בגוף ראשון רבים: nous sommes.", tip_he:"nous sommes (être) · nous avons (avoir) — שניהם נחוצים!" },
    ],
    [ /* 1 — Articles (le/la/les/un/une/du) */
      { instruction_he:"השלם במאמר הנכון (le / la)", prompt_fr:"____ soleil brille aujourd'hui.", trans_he:"השמש זורחת היום.", accepted:["Le"], solution_fr:"Le soleil brille aujourd'hui.", explanation_he:"soleil הוא זכר → le soleil.", tip_he:"le = זכר יחיד · la = נקבה יחיד · les = רבים." },
      { instruction_he:"השלם במאמר הנכון (un / une)", prompt_fr:"C'est ____ livre intéressant.", trans_he:"זה ספר מעניין.", accepted:["un"], solution_fr:"C'est un livre intéressant.", explanation_he:"livre הוא זכר → un. una = נקבה.", tip_he:"un garçon · une fille · un livre · une table." },
      { instruction_he:"השלם במאמר כמות (du / de la)", prompt_fr:"Je mange ____ fromage.", trans_he:"אני אוכל גבינה.", accepted:["du"], solution_fr:"Je mange du fromage.", explanation_he:"fromage זכר + כמות לא מוגדרת = du (=de+le).", tip_he:"du (זכר) · de la (נקבה) · de l' (תנועה) · des (רבים)." },
    ],
    [ /* 2 — Pluriel */
      { instruction_he:"השלם בצורת הרבים", prompt_fr:"Les ____ (chat) sont mignons.", trans_he:"החתולים חמודים.", accepted:["chats"], solution_fr:"Les chats sont mignons.", explanation_he:"רוב שמות העצם מקבלים -s ברבים.", tip_he:"chien→chiens · livre→livres · ami→amis." },
      { instruction_he:"רבים בסיומת -aux", prompt_fr:"Les ____ (journal) sont sur la table.", trans_he:"העיתונים על השולחן.", accepted:["journaux"], solution_fr:"Les journaux sont sur la table.", explanation_he:"שמות ב-al הופכים לרבים ב-aux: journal→journaux.", tip_he:"journal→journaux · animal→animaux · cheval→chevaux." },
      { instruction_he:"שנה לרבים", prompt_fr:"____ garçon ____ grand → ____ garçons ____.", trans_he:"הבנים גדולים.", accepted:["Les / sont","Les garçons sont grands"], solution_fr:"Les garçons sont grands.", explanation_he:"le→les, est→sont, grand→grands (הסכמת תואר).", tip_he:"שמות תואר מתאימים למין ומספר: grand/grands." },
    ],
    [ /* 3 — Négation */
      { instruction_he:"הוסף שלילה (ne...pas)", prompt_fr:"Je ____ mange ____ de viande.", trans_he:"אני לא אוכל בשר.", accepted:["ne / pas","ne...pas"], solution_fr:"Je ne mange pas de viande.", explanation_he:"ne + פועל + pas. אחרי שלילה: de במקום du/de la.", tip_he:"ne...pas עוטף את הפועל." },
      { instruction_he:"שלילת תדירות (ne...jamais)", prompt_fr:"Il ____ fume ____.", trans_he:"הוא לא מעשן אף פעם.", accepted:["ne / jamais","ne...jamais"], solution_fr:"Il ne fume jamais.", explanation_he:"ne...jamais = לעולם לא. ne לפני הפועל, jamais אחריו.", tip_he:"jamais = אף פעם · toujours = תמיד · souvent = לעיתים." },
      { instruction_he:"שלילה (ne...plus)", prompt_fr:"Je ____ habite ____ à Lyon.", trans_he:"אני כבר לא גר ב-ליון.", accepted:["ne / plus","ne...plus","n' / plus"], solution_fr:"Je n'habite plus à Lyon.", explanation_he:"ne...plus = כבר לא. ne לפני הפועל, plus אחריו.", tip_he:"ne...plus (כבר לא) · ne...rien (כלום) · ne...personne (אף אחד)." },
    ],
    [ /* 4 — Adjectifs */
      { instruction_he:"צורת הנקבה של התואר", prompt_fr:"Marie est une étudiante ____. (intelligent→?)", trans_he:"מארי היא סטודנטית חכמה.", accepted:["intelligente"], solution_fr:"Marie est une étudiante intelligente.", explanation_he:"intelligent→intelligente: מוסיפים -e.", tip_he:"grand→grande · petit→petite · content→contente." },
      { instruction_he:"תואר נקבה בסיומת מיוחדת", prompt_fr:"Ma voisine est très ____. (gentil→?)", trans_he:"השכנה שלי מאוד נחמדה.", accepted:["gentille"], solution_fr:"Ma voisine est très gentille.", explanation_he:"gentil→gentille: מכפילים -l ומוסיפים -e.", tip_he:"gentil→gentille · nul→nulle · cruel→cruelle." },
      { instruction_he:"תואר זכר רבים", prompt_fr:"Les enfants sont ____. (content→?)", trans_he:"הילדים שמחים.", accepted:["contents"], solution_fr:"Les enfants sont contents.", explanation_he:"זכר רבים: content→contents. מוסיפים -s.", tip_he:"content/contente/contents/contentes." },
    ],
    [ /* 5 — Questions */
      { instruction_he:"צור שאלה עם est-ce que", prompt_fr:"____ tu parles français ?", trans_he:"האם אתה מדבר צרפתית?", accepted:["Est-ce que","est-ce que"], solution_fr:"Est-ce que tu parles français ?", explanation_he:"est-ce que + נושא + פועל = שאלה ניטרלית.", tip_he:"Est-ce que tu...? · Tu...? (אינטונציה) · Parles-tu...? (רשמי)." },
      { instruction_he:"כינוי שאלה: מה", prompt_fr:"____ tu fais le week-end ?", trans_he:"מה אתה עושה בסוף השבוע?", accepted:["Qu'est-ce que","Que"], solution_fr:"Qu'est-ce que tu fais le week-end ?", explanation_he:"Qu'est-ce que = מה (שאלת מושא). Qu'est-ce que tu fais? = מה אתה עושה?", tip_he:"Qu'est-ce que (מה) · Qui (מי) · Où (איפה) · Quand (מתי)." },
      { instruction_he:"כינוי שאלה: איפה", prompt_fr:"____ habites-tu ? — À Paris.", trans_he:"איפה אתה גר? — בפריז.", accepted:["Où","où"], solution_fr:"Où habites-tu ?", explanation_he:"Où = איפה. בשאלה רשמית: Où + פועל + נושא (היפוך).", tip_he:"Où (איפה) · Quand (מתי) · Comment (איך) · Pourquoi (למה)." },
    ],
  ],
  /* stations: Salutations · Famille · Couleurs · Chiffres · Jours · Objets */
  voc: [
    [ /* 0 — Salutations */
      { instruction_he:"תרגם: «שלום/בוקר טוב»", prompt_fr:"____ ! Comment allez-vous ?", trans_he:"שלום! מה שלומכם?", accepted:["Bonjour","bonjour"], solution_fr:"Bonjour", explanation_he:"Bonjour = שלום/בוקר טוב (רשמי). Salut = היי (לא רשמי).", tip_he:"Bonjour (ביום) · Bonsoir (ערב) · Salut (לא רשמי)." },
      { instruction_he:"תרגם: «תודה רבה»", prompt_fr:"____ beaucoup !", trans_he:"תודה רבה!", accepted:["Merci","merci"], solution_fr:"Merci beaucoup !", explanation_he:"Merci = תודה. Merci beaucoup = תודה רבה.", tip_he:"De rien = אין על מה · Avec plaisir = בשמחה." },
      { instruction_he:"תרגם: «להתראות»", prompt_fr:"____ ! À demain.", trans_he:"להתראות! להתראות מחר.", accepted:["Au revoir","au revoir"], solution_fr:"Au revoir !", explanation_he:"Au revoir = להתראות. À bientôt = להתראות בקרוב.", tip_he:"Au revoir · À bientôt · À demain · À tout à l'heure." },
    ],
    [ /* 1 — Famille */
      { instruction_he:"תרגם: «אמא שלי»", prompt_fr:"Ma ____ s'appelle Sophie.", trans_he:"אמא שלי נקראת סופי.", accepted:["mère","maman"], solution_fr:"Ma mère", explanation_he:"mère = אמא (רשמי) · maman = אמא (חיבה).", tip_he:"père = אבא · mère = אמא · frère = אח · sœur = אחות." },
      { instruction_he:"תרגם: «אבא שלי»", prompt_fr:"____ s'appelle Pierre.", trans_he:"אבא שלי נקרא פייר.", accepted:["Mon père","mon père"], solution_fr:"Mon père", explanation_he:"père = אבא. mon = שלי (זכר). mon père = אבא שלי.", tip_he:"mon père · ma mère · mon frère · ma sœur · mes parents." },
      { instruction_he:"תרגם: «שני אחים»", prompt_fr:"J'ai deux ____.", trans_he:"יש לי שני אחים.", accepted:["frères"], solution_fr:"J'ai deux frères.", explanation_he:"frère = אח, frères = אחים (רבים + מאמר des נעלם עם chiffre).", tip_he:"frère = אח · sœur = אחות · cousin(e) = דוד/ה · oncle = דוד." },
    ],
    [ /* 2 — Couleurs */
      { instruction_he:"תרגם: «כחול»", prompt_fr:"Le ciel est ____.", trans_he:"השמיים כחולים.", accepted:["bleu","bleue"], solution_fr:"bleu", explanation_he:"bleu = כחול. צבעים בד\"כ לא משתנים עם מאמרים.", tip_he:"rouge · bleu · vert · jaune · blanc · noir · gris · orange." },
      { instruction_he:"תרגם: «אדום»", prompt_fr:"La rose est ____.", trans_he:"הוורד אדום.", accepted:["rouge"], solution_fr:"rouge", explanation_he:"rouge = אדום. rouge לא משתנה לנקבה.", tip_he:"rouge (אדום) · bleu (כחול) · vert (ירוק) · jaune (צהוב)." },
      { instruction_he:"תרגם: «שחור ולבן»", prompt_fr:"Le chat est ____ et ____.", trans_he:"החתול שחור ולבן.", accepted:["noir et blanc","noir / blanc"], solution_fr:"noir et blanc", explanation_he:"noir = שחור · blanc = לבן. שניהם לא משתנים עם le chat.", tip_he:"noir/noire · blanc/blanche (נקבה שונה!) · gris/grise." },
    ],
    [ /* 3 — Chiffres */
      { instruction_he:"תרגם: «חמש»", prompt_fr:"J'ai ____ ans.", trans_he:"אני בן/בת חמש.", accepted:["cinq"], solution_fr:"cinq", explanation_he:"cinq = 5. un·deux·trois·quatre·cinq.", tip_he:"1-10: un·deux·trois·quatre·cinq·six·sept·huit·neuf·dix." },
      { instruction_he:"תרגם: «שניים עשר»", prompt_fr:"Il y a ____ mois dans l'année.", trans_he:"יש שנים-עשר חודשים בשנה.", accepted:["douze"], solution_fr:"douze", explanation_he:"douze = 12. onze(11)·douze(12)·treize(13).", tip_he:"11-15: onze·douze·treize·quatorze·quinze." },
      { instruction_he:"תרגם: «שלושים»", prompt_fr:"Il a ____ ans.", trans_he:"הוא בן שלושים.", accepted:["trente"], solution_fr:"trente", explanation_he:"trente = 30. vingt(20)·trente(30)·quarante(40).", tip_he:"dizaines: vingt·trente·quarante·cinquante·soixante." },
    ],
    [ /* 4 — Jours */
      { instruction_he:"תרגם: «יום שני»", prompt_fr:"Aujourd'hui c'est ____.", trans_he:"היום יום שני.", accepted:["lundi"], solution_fr:"lundi", explanation_he:"ימי השבוע: lundi·mardi·mercredi·jeudi·vendredi·samedi·dimanche.", tip_he:"ימי השבוע מתחילים ב-lundi (שני)." },
      { instruction_he:"תרגם: «יום שישי בערב»", prompt_fr:"On se retrouve ____ soir.", trans_he:"נתראה ביום שישי בערב.", accepted:["vendredi"], solution_fr:"vendredi soir", explanation_he:"vendredi = שישי, soir = ערב. ימי שבוע ללא מאמר בד\"כ.", tip_he:"lundi·mardi·mercredi·jeudi·vendredi·samedi·dimanche." },
      { instruction_he:"תרגם: «בסוף השבוע»", prompt_fr:"Je me repose ____.", trans_he:"אני נח בסוף השבוע.", accepted:["le week-end","le weekend"], solution_fr:"le week-end", explanation_he:"le week-end = בסוף השבוע (samedi + dimanche).", tip_he:"le week-end · samedi soir · dimanche matin." },
    ],
    [ /* 5 — Objets */
      { instruction_he:"תרגם: «ספרים»", prompt_fr:"J'aime lire des ____.", trans_he:"אני אוהב לקרוא ספרים.", accepted:["livres"], solution_fr:"livres", explanation_he:"livre = ספר (זכר). des livres = ספרים.", tip_he:"un livre · un stylo · une table · une chaise · une fenêtre." },
      { instruction_he:"תרגם: «עיפרון»", prompt_fr:"Tu as un ____ ?", trans_he:"יש לך עיפרון?", accepted:["crayon","stylo"], solution_fr:"un crayon / un stylo", explanation_he:"crayon = עיפרון · stylo = עט. שניהם זכר.", tip_he:"un crayon · un stylo · une gomme (מחק) · une règle (סרגל)." },
      { instruction_he:"תרגם: «שולחן»", prompt_fr:"Mets ton sac sur la ____.", trans_he:"שים את התיק על השולחן.", accepted:["table"], solution_fr:"table", explanation_he:"table = שולחן (נקבה). sur la table = על השולחן.", tip_he:"une table · une chaise · un bureau · une fenêtre · une porte." },
    ],
  ],
  /* stations: Au café · À l'école · La famille · Au magasin · Dans la rue · À la maison */
  com: [
    [ /* 0 — Au café */
      { instruction_he:"קרא וענה", prompt_fr:"— Bonjour ! Vous voulez quelque chose ?\n— Oui, un café, s'il vous plaît.\n— Voilà. C'est deux euros.", trans_he:"— שלום! אתה רוצה משהו?\n— כן, קפה, בבקשה.\n— הנה. זה שני יורו.", question_fr:"Combien coûte le café ?", q_he:"כמה עולה הקפה?", options:["Un euro","Deux euros","Trois euros"], correct:1, explanation_he:"« C'est deux euros » = זה עולה שני יורו." },
      { instruction_he:"קרא וענה", prompt_fr:"— Bonjour, je voudrais un croissant et un jus d'orange.\n— Pour manger ici ou à emporter ?\n— À emporter, merci.", trans_he:"— שלום, הייתי רוצה קרואסון ומיץ תפוזים.\n— לאכול כאן או לקחת?\n— לקחת, תודה.", question_fr:"Qu'est-ce que la personne commande ?", q_he:"מה האדם מזמין?", options:["Un café et un gâteau","Un croissant et un jus d'orange","Un sandwich et un thé"], correct:1, explanation_he:"« un croissant et un jus d'orange »." },
      { instruction_he:"קרא וענה", prompt_fr:"— L'addition, s'il vous plaît.\n— C'est sept euros cinquante.\n— Je paye par carte ?\n— Oui, bien sûr.", trans_he:"— החשבון, בבקשה.\n— זה שבעה וחצי יורו.\n— אני משלם בכרטיס?\n— כן, כמובן.", question_fr:"Comment la personne veut-elle payer ?", q_he:"איך הלקוח רוצה לשלם?", options:["En espèces","Par carte","Par chèque"], correct:1, explanation_he:"« Je paye par carte » = אני משלם בכרטיס." },
    ],
    [ /* 1 — À l'école */
      { instruction_he:"קרא וענה", prompt_fr:"Le lundi, Marie va à l'école. Le mercredi, elle fait du sport. Le samedi, elle regarde des films.", trans_he:"ביום שני מארי הולכת לבית ספר. ביום רביעי היא עושה ספורט. בשבת היא צופה בסרטים.", question_fr:"Quand est-ce que Marie fait du sport ?", q_he:"מתי מארי עושה ספורט?", options:["Le lundi","Le mercredi","Le samedi"], correct:1, explanation_he:"« Le mercredi, elle fait du sport »." },
      { instruction_he:"קרא וענה", prompt_fr:"Il y a vingt-cinq élèves dans ma classe. Notre professeur s'appelle Madame Leblanc. Les cours commencent à huit heures.", trans_he:"יש עשרים וחמישה תלמידים בכיתה שלי. המורה שלנו נקראת מדאם לבלאן. השיעורים מתחילים בשמונה.", question_fr:"À quelle heure commencent les cours ?", q_he:"מתי מתחילים השיעורים?", options:["À sept heures","À huit heures","À neuf heures"], correct:1, explanation_he:"« Les cours commencent à huit heures »." },
      { instruction_he:"קרא וענה", prompt_fr:"Lucas aime l'école mais il n'aime pas les mathématiques. Sa matière préférée est le dessin.", trans_he:"לוקאס אוהב את בית הספר אבל לא אוהב מתמטיקה. המקצוע האהוב עליו הוא ציור.", question_fr:"Quelle est la matière préférée de Lucas ?", q_he:"מהו המקצוע האהוב על לוקאס?", options:["Les mathématiques","Le dessin","Le français"], correct:1, explanation_he:"« Sa matière préférée est le dessin »." },
    ],
    [ /* 2 — La famille */
      { instruction_he:"קרא וענה", prompt_fr:"Je m'appelle Lucas. J'ai dix-huit ans. Je suis français. J'habite à Paris avec ma famille.", trans_he:"שמי לוקאס. אני בן 18. אני צרפתי. אני גר בפריז עם משפחתי.", question_fr:"Où habite Lucas ?", q_he:"איפה לוקאס גר?", options:["À Lyon","À Paris","À Marseille"], correct:1, explanation_he:"« J'habite à Paris »." },
      { instruction_he:"קרא וענה", prompt_fr:"Dans ma famille, il y a quatre personnes : mon père, ma mère, ma petite sœur et moi. Ma sœur a six ans.", trans_he:"במשפחה שלי יש ארבעה אנשים: אבא, אמא, אחותי הקטנה ואני. לאחותי שש שנים.", question_fr:"Combien de personnes y a-t-il dans la famille ?", q_he:"כמה אנשים יש במשפחה?", options:["Trois","Quatre","Cinq"], correct:1, explanation_he:"« il y a quatre personnes »." },
      { instruction_he:"קרא וענה", prompt_fr:"Ma grand-mère s'appelle Hélène. Elle a soixante-dix ans. Elle habite à Lyon avec mon grand-père.", trans_he:"סבתא שלי נקראת הלן. היא בת שבעים. היא גרה ב-ליון עם סבא שלי.", question_fr:"Où habite la grand-mère ?", q_he:"איפה גרה הסבתא?", options:["À Paris","À Lyon","À Bordeaux"], correct:1, explanation_he:"« Elle habite à Lyon »." },
    ],
    [ /* 3 — Au magasin */
      { instruction_he:"קרא וענה", prompt_fr:"— Je cherche une veste. Quelle est votre taille ?\n— Du 38, s'il vous plaît.\n— Voici une veste bleue en taille 38.", trans_he:"— אני מחפש מעיל. מה המידה שלכם?\n— 38.\n— הנה מעיל כחול במידה 38.", question_fr:"Quelle taille cherche le client ?", q_he:"איזו מידה מחפש הלקוח?", options:["Taille 36","Taille 38","Taille 40"], correct:1, explanation_he:"« Du 38, s'il vous plaît »." },
      { instruction_he:"קרא וענה", prompt_fr:"Les soldes commencent demain. Tout est à moins 30%. Le magasin est ouvert de 9h à 20h.", trans_he:"המכירות מתחילות מחר. הכל ב-30% הנחה. החנות פתוחה מ-9 עד 20.", question_fr:"Quel est le pourcentage de réduction ?", q_he:"כמה אחוז הנחה?", options:["20%","30%","50%"], correct:1, explanation_he:"« moins 30% » = 30% הנחה." },
      { instruction_he:"קרא וענה", prompt_fr:"— Est-ce que vous avez ce pantalon en rouge ?\n— Désolé, seulement en bleu et en noir.\n— Je vais prendre le bleu alors.", trans_he:"— יש לכם את המכנסיים האלה באדום?\n— מצטערים, רק בכחול ובשחור.\n— אז אני לוקח את הכחול.", question_fr:"Quelle couleur choisit la cliente ?", q_he:"איזה צבע הלקוח בוחר?", options:["Rouge","Bleu","Noir"], correct:1, explanation_he:"« Je vais prendre le bleu »." },
    ],
    [ /* 4 — Dans la rue */
      { instruction_he:"קרא וענה", prompt_fr:"— Excusez-moi, où est la gare ?\n— Allez tout droit, puis tournez à gauche. C'est à cinq minutes.", trans_he:"— סליחה, איפה התחנה?\n— לכו ישר, ואז פנו שמאלה. זה חמש דקות.", question_fr:"Quelle direction faut-il prendre ?", q_he:"לאיזה כיוון ללכת?", options:["À droite","Tout droit puis à gauche","Tout droit puis à droite"], correct:1, explanation_he:"« tout droit, puis à gauche »." },
      { instruction_he:"קרא וענה", prompt_fr:"La pharmacie est en face de la boulangerie. La poste est à côté de la pharmacie.", trans_he:"בית המרקחת ממול לאפייה. הדואר נמצא לצד בית המרקחת.", question_fr:"Où est la poste ?", q_he:"איפה הדואר?", options:["En face de la boulangerie","À côté de la pharmacie","Derrière la boulangerie"], correct:1, explanation_he:"« La poste est à côté de la pharmacie »." },
      { instruction_he:"קרא וענה", prompt_fr:"Je cherche le musée. Il se trouve dans la rue principale, entre le café et la banque.", trans_he:"אני מחפש את המוזיאון. הוא נמצא ברחוב הראשי, בין בית הקפה לבנק.", question_fr:"Où se trouve le musée ?", q_he:"איפה המוזיאון?", options:["À côté de la gare","Entre le café et la banque","En face de la poste"], correct:1, explanation_he:"« entre le café et la banque »." },
    ],
    [ /* 5 — À la maison */
      { instruction_he:"קרא וענה", prompt_fr:"Dans mon appartement il y a un salon, une cuisine, deux chambres et une salle de bains.", trans_he:"בדירה שלי יש סלון, מטבח, שני חדרי שינה ואמבטיה.", question_fr:"Combien de chambres y a-t-il ?", q_he:"כמה חדרי שינה יש?", options:["Une chambre","Deux chambres","Trois chambres"], correct:1, explanation_he:"« deux chambres » = שני חדרי שינה." },
      { instruction_he:"קרא וענה", prompt_fr:"Le soir, toute la famille mange ensemble à la cuisine. Papa cuisine souvent des pâtes. Maman préfère les salades.", trans_he:"בערב כל המשפחה אוכלת יחד במטבח. אבא מבשל לעתים קרובות פסטה. אמא מעדיפה סלטים.", question_fr:"Où mange la famille le soir ?", q_he:"איפה המשפחה אוכלת בערב?", options:["Dans le salon","À la cuisine","Dans le jardin"], correct:1, explanation_he:"« toute la famille mange ensemble à la cuisine »." },
      { instruction_he:"קרא וענה", prompt_fr:"Le dimanche matin, je reste à la maison. Je lis un livre ou je regarde la télé. L'après-midi, je fais le ménage.", trans_he:"בבוקר יום ראשון, אני נשאר בבית. אני קורא ספר או צופה בטלוויזיה. אחר הצהריים, אני עושה ניקיון.", question_fr:"Que fait-il le dimanche matin ?", q_he:"מה הוא עושה ביום ראשון בבוקר?", options:["Il fait du sport","Il reste à la maison","Il sort avec des amis"], correct:1, explanation_he:"« je reste à la maison. Je lis un livre ou je regarde la télé »." },
    ],
  ],
  /* stations: Se présenter · Ma famille · J'aime… · Ma journée · Mon école · Mon pays */
  exp: [
    [ /* 0 — Se présenter */
      { instruction_he:"הצג את עצמך", prompt_fr:"Présentez-vous : prénom, âge et ville.", trans_he:"הצג את עצמך: שמך, גילך ועירך.", model_fr:"Je m'appelle David. J'ai vingt ans. J'habite à Tel Aviv.", keys_fr:["Je m'appelle","J'ai ... ans","J'habite à"], tip_he:"Je m'appelle · J'ai ... ans · J'habite à." },
      { instruction_he:"ספר מה אתה לומד/עובד", prompt_fr:"Qu'est-ce que tu fais dans la vie ?", trans_he:"מה אתה עושה בחיים?", model_fr:"Je suis étudiant en informatique à l'université. J'étudie depuis deux ans.", keys_fr:["Je suis","étudiant","je travaille","depuis"], tip_he:"Je suis étudiant(e) · Je travaille comme... · Je fais des études de..." },
      { instruction_he:"ספר על שפות שאתה מדבר", prompt_fr:"Quelles langues parles-tu ?", trans_he:"אילו שפות אתה מדבר?", model_fr:"Je parle hébreu et anglais. En ce moment, j'apprends le français.", keys_fr:["Je parle","j'apprends","aussi","un peu de"], tip_he:"Je parle français · J'apprends l'espagnol · Je parle un peu de..." },
    ],
    [ /* 1 — Ma famille */
      { instruction_he:"תאר את המשפחה שלך", prompt_fr:"Décris ta famille.", trans_he:"תאר את המשפחה שלך.", model_fr:"Dans ma famille, il y a mon père, ma mère et ma sœur. Mon père s'appelle Ilan.", keys_fr:["dans ma famille","il y a","mon père","ma mère","s'appelle"], tip_he:"il y a = יש · mon père = אבא · ma mère = אמא · mon frère = אחי." },
      { instruction_he:"ספר על אחד מבני משפחתך", prompt_fr:"Décris un membre de ta famille.", trans_he:"תאר אחד מבני משפחתך.", model_fr:"Mon frère s'appelle Noah. Il a vingt-cinq ans. Il est grand et brun. Il habite à Haïfa.", keys_fr:["il s'appelle","il a ... ans","il est","il habite"], tip_he:"il s'appelle · il a ... ans · il est + adj · il habite." },
      { instruction_he:"ספר על הסבים שלך", prompt_fr:"Parle de tes grands-parents.", trans_he:"ספר על הסבים שלך.", model_fr:"Mes grands-parents habitent à Jérusalem. Ma grand-mère fait de très bons gâteaux.", keys_fr:["mes grands-parents","ma grand-mère","mon grand-père","il/elle aime"], tip_he:"mon grand-père = סבא · ma grand-mère = סבתא · mes grands-parents = הסבים." },
    ],
    [ /* 2 — J'aime… */
      { instruction_he:"מה אתה אוהב לעשות?", prompt_fr:"Qu'est-ce que tu aimes faire ? Donne deux exemples.", trans_he:"מה אתה אוהב לעשות?", model_fr:"J'aime écouter de la musique et jouer au football. Je n'aime pas faire la cuisine.", keys_fr:["J'aime","Je n'aime pas","et"], tip_he:"J'aime + infinitif: jouer, écouter, regarder, lire." },
      { instruction_he:"ספר על תחביב אהוב", prompt_fr:"Parle d'un hobby que tu aimes. Pourquoi ?", trans_he:"ספר על תחביב שאתה אוהב ולמה.", model_fr:"J'aime beaucoup lire. Je lis des romans et des bandes dessinées. C'est relaxant.", keys_fr:["j'aime beaucoup","je lis","c'est","parce que"], tip_he:"J'aime + infinitif · C'est + adj · parce que (כי)." },
      { instruction_he:"ספר על מוזיקה או סרט", prompt_fr:"Quel film ou quelle chanson tu aimes ?", trans_he:"איזה סרט או שיר אתה אוהב?", model_fr:"J'aime beaucoup la musique reggae. C'est très relaxant. J'écoute quand je suis stressé.", keys_fr:["j'aime","c'est","j'écoute","quand"], tip_he:"J'aime la musique de... · C'est + adj · J'écoute / Je regarde." },
    ],
    [ /* 3 — Ma journée */
      { instruction_he:"תאר את הבוקר שלך", prompt_fr:"Décris ton matin.", trans_he:"תאר את הבוקר שלך.", model_fr:"Je me réveille à sept heures. Je prends une douche et je mange un petit-déjeuner. Ensuite je vais au travail.", keys_fr:["je me réveille","je prends","ensuite","je vais"], tip_he:"Je me réveille · Je me lève · Je prends une douche · Ensuite." },
      { instruction_he:"תאר את הערב שלך", prompt_fr:"Qu'est-ce que tu fais le soir normalement ?", trans_he:"מה אתה עושה בדרך כלל בערב?", model_fr:"Le soir, je rentre à la maison vers dix-neuf heures. Je mange avec ma famille. Après, je regarde la télé.", keys_fr:["le soir","je rentre","vers","je mange","après"], tip_he:"le soir (בערב) · après (אחרי כן) · normalement (בדרך כלל)." },
      { instruction_he:"תאר יום שגרתי שלך", prompt_fr:"Décris une journée typique.", trans_he:"תאר יום שגרתי שלך.", model_fr:"D'habitude, je me lève à sept heures. Je mange du pain avec du café. Je vais au bureau à huit heures et demie.", keys_fr:["d'habitude","je me lève","je mange","je vais"], tip_he:"d'habitude · d'abord · ensuite · enfin." },
    ],
    [ /* 4 — Mon école */
      { instruction_he:"ספר על בית הספר שלך", prompt_fr:"Parle de ton école ou de tes études.", trans_he:"ספר על בית הספר שלך.", model_fr:"Je suis au lycée. Il y a environ huit cents élèves. Mon cours préféré est la biologie.", keys_fr:["je suis au","il y a","mon cours préféré"], tip_he:"une école · un lycée · une université · un cours (שיעור)." },
      { instruction_he:"ספר על המורה האהוב עליך", prompt_fr:"Décris ton professeur préféré.", trans_he:"תאר את המורה האהוב עליך.", model_fr:"Mon professeur préféré s'appelle Monsieur Cohen. Il enseigne les mathématiques. Il est patient.", keys_fr:["il s'appelle","il enseigne","il est"], tip_he:"il/elle enseigne (מלמד/ת) · il/elle est sympa/patient(e)." },
      { instruction_he:"ספר על חברים בבית הספר", prompt_fr:"Parle de tes amis à l'école.", trans_he:"ספר על החברים שלך בבית הספר.", model_fr:"J'ai beaucoup d'amis à l'école. Mon meilleur ami s'appelle Roni. On mange ensemble à la cantine.", keys_fr:["j'ai","mon meilleur ami","on mange","ensemble"], tip_he:"mon meilleur ami = החבר הטוב ביותר · on = nous." },
    ],
    [ /* 5 — Mon pays */
      { instruction_he:"ספר על המדינה שלך", prompt_fr:"Parle de ton pays.", trans_he:"ספר על המדינה שלך.", model_fr:"Je viens d'Israël. C'est un petit pays au Moyen-Orient. Il y a environ neuf millions d'habitants.", keys_fr:["je viens de","c'est un pays","il y a ... habitants"], tip_he:"Je viens de · c'est un pays · la capitale est." },
      { instruction_he:"ספר על עיר בארצך", prompt_fr:"Décris une ville de ton pays.", trans_he:"תאר עיר אחת בארצך.", model_fr:"Tel Aviv est une grande ville moderne au bord de la mer. Il y a beaucoup de restaurants et de plages.", keys_fr:["c'est une ville","au bord de","il y a","très"], tip_he:"c'est une ville + adj · grande/petite/moderne/historique." },
      { instruction_he:"ספר על האוכל של ארצך", prompt_fr:"Décris un plat typique de ton pays.", trans_he:"תאר מנה טיפוסית ממדינתך.", model_fr:"En Israël, on mange beaucoup de houmous et de falafel. C'est bon et pas cher.", keys_fr:["on mange","c'est","souvent","typique"], tip_he:"on mange = אנחנו אוכלים · c'est bon = זה טעים." },
    ],
  ],
};

const BANK_A2 = {
  /* stations: Passé composé · Avoir/Être · Futur proche · Adjectifs · Possessifs · Imparfait */
  gra: [
    [ /* 0 — Passé composé (avec avoir) */
      { instruction_he:"passé composé עם avoir", prompt_fr:"Hier, j'____ (manger) une pizza.", trans_he:"אתמול אכלתי פיצה.", accepted:["ai mangé"], solution_fr:"Hier, j'ai mangé une pizza.", explanation_he:"passé composé עם avoir: j'ai + participe passé. manger→mangé.", tip_he:"manger→mangé · finir→fini · prendre→pris · faire→fait." },
      { instruction_he:"passé composé: participe passé", prompt_fr:"Nous ____ (finir) l'exercice.", trans_he:"סיימנו את התרגיל.", accepted:["avons fini"], solution_fr:"Nous avons fini l'exercice.", explanation_he:"nous avons + participe passé. finir→fini.", tip_he:"travailler→travaillé · écouter→écouté · choisir→choisi." },
      { instruction_he:"passé composé: négation", prompt_fr:"Je ____ (ne pas manger) de petit-déjeuner ce matin.", trans_he:"לא אכלתי ארוחת בוקר הבוקר.", accepted:["n'ai pas mangé","ne ai pas mangé"], solution_fr:"Je n'ai pas mangé de petit-déjeuner ce matin.", explanation_he:"שלילה בpassé composé: ne/n' + auxiliaire + pas + participe.", tip_he:"Je n'ai pas mangé (לא אכלתי) · Je ne suis pas allé(e) (לא הלכתי)." },
    ],
    [ /* 1 — Avoir/Être (choix de l'auxiliaire) */
      { instruction_he:"passé composé עם être", prompt_fr:"Elle ____ (aller) au cinéma samedi.", trans_he:"היא הלכה לקולנוע בשבת.", accepted:["est allée","est allé"], solution_fr:"Elle est allée au cinéma samedi.", explanation_he:"aller לוקח être. participe מתאים: elle→allée.", tip_he:"פעלי תנועה+être: aller, venir, partir, arriver, sortir, entrer." },
      { instruction_he:"être או avoir?", prompt_fr:"Ils ____ (arriver) tard hier soir.", trans_he:"הם הגיעו מאוחר אמש.", accepted:["sont arrivés"], solution_fr:"Ils sont arrivés tard hier soir.", explanation_he:"arriver לוקח être. ils→arrivés (זכר רבים).", tip_he:"ADVENT verbs use être: Arriver, Naître, Descendre, Venir, Entrer, Naître, Tomber..." },
      { instruction_he:"participe passé עם être — הסכמה", prompt_fr:"Marie ____ (partir) à midi.", trans_he:"מארי עזבה בצהריים.", accepted:["est partie"], solution_fr:"Marie est partie à midi.", explanation_he:"partir עם être. Marie נקבה → partie.", tip_he:"il est parti · elle est partie · ils sont partis · elles sont parties." },
    ],
    [ /* 2 — Futur proche */
      { instruction_he:"futur proche", prompt_fr:"Ce soir, nous ____ (regarder) un film.", trans_he:"הלילה נצפה בסרט.", accepted:["allons regarder"], solution_fr:"Ce soir, nous allons regarder un film.", explanation_he:"futur proche = aller (מוטה) + infinitif.", tip_he:"je vais · tu vas · il va · nous allons · vous allez · ils vont + infinitif." },
      { instruction_he:"futur proche: שלילה", prompt_fr:"Je ____ (ne pas sortir) ce soir.", trans_he:"אני לא עומד לצאת הלילה.", accepted:["ne vais pas sortir","vais pas sortir"], solution_fr:"Je ne vais pas sortir ce soir.", explanation_he:"שלילה: ne + vais + pas + infinitif.", tip_he:"Je ne vais pas travailler · Tu ne vas pas venir?" },
      { instruction_he:"futur proche: שאלה", prompt_fr:"Qu'est-ce que vous ____ (faire) ce week-end ?", trans_he:"מה אתם הולכים לעשות בסוף השבוע?", accepted:["allez faire"], solution_fr:"Qu'est-ce que vous allez faire ce week-end ?", explanation_he:"vous allez faire = אתם הולכים לעשות.", tip_he:"futur proche מביע עתיד קרוב או כוונה." },
    ],
    [ /* 3 — Adjectifs (accord et placement) */
      { instruction_he:"הסכמת תואר נקבה", prompt_fr:"Ma voisine est très ____. (gentil→?)", trans_he:"השכנה שלי מאוד נחמדה.", accepted:["gentille"], solution_fr:"Ma voisine est très gentille.", explanation_he:"gentil→gentille: מכפילים -l ומוסיפים -e.", tip_he:"gentil→gentille · nul→nulle · pareil→pareille." },
      { instruction_he:"תואר לפני שם עצם (BAGS)", prompt_fr:"C'est un ____ livre. (bon→?)", trans_he:"זה ספר טוב.", accepted:["bon"], solution_fr:"C'est un bon livre.", explanation_he:"bon (טוב) = תואר BAGS שבא לפני שם העצם: un bon livre.", tip_he:"BAGS: Beauty/Age/Goodness/Size — תמיד לפני: beau, vieux, bon, grand, petit." },
      { instruction_he:"תואר אחרי שם עצם (צבע/צורה)", prompt_fr:"Elle porte une robe ____. (rouge)", trans_he:"היא לובשת שמלה אדומה.", accepted:["rouge"], solution_fr:"Elle porte une robe rouge.", explanation_he:"צבעים, צורות, לאומים — תמיד אחרי שם העצם.", tip_he:"une voiture rouge · un homme grand · une fille française." },
    ],
    [ /* 4 — Possessifs */
      { instruction_he:"תואר קניין: son / sa", prompt_fr:"C'est le sac de Marie. C'est ____ sac.", trans_he:"זה התיק של מארי. זה התיק שלה.", accepted:["son"], solution_fr:"C'est son sac.", explanation_he:"son/sa/ses נקבע לפי המושא, לא הבעלים. sac זכר → son.", tip_he:"son sac (זכר) · sa chambre (נקבה) · ses affaires (רבים)." },
      { instruction_he:"תואר קניין: mon / ma", prompt_fr:"C'est ____ mère. (של אבא)", trans_he:"זו אמא שלו.", accepted:["sa"], solution_fr:"C'est sa mère.", explanation_he:"sa מתייחס ל-mère (נקבה). הבעלים = אבא (זכר), אבל sa נקבע לפי mère!", tip_he:"mon (m) · ma (f) · mes (pl) · ton (m) · ta (f) · son (m) · sa (f)." },
      { instruction_he:"תואר קניין: notre / votre / leur", prompt_fr:"C'est ____ maison. (של הם)", trans_he:"זה הבית שלהם.", accepted:["leur"], solution_fr:"C'est leur maison.", explanation_he:"leur = שלהם/שלהן (לא מוטה). leur maison = הבית שלהם.", tip_he:"notre (שלנו) · votre (שלכם) · leur (שלהם)." },
    ],
    [ /* 5 — Imparfait */
      { instruction_he:"imparfait: הרגל בעבר", prompt_fr:"Quand j'étais petit, j'____ (aimer) jouer dehors.", trans_he:"כשהייתי קטן אהבתי לשחק בחוץ.", accepted:["aimais"], solution_fr:"Quand j'étais petit, j'aimais jouer dehors.", explanation_he:"imparfait מביע הרגל בעבר.", tip_he:"imparfait = שורש nous + -ais/-ait/-ions/-iez/-aient." },
      { instruction_he:"imparfait: תיאור בעבר", prompt_fr:"Le ciel ____ (être) bleu et il ____ (faire) beau.", trans_he:"השמיים היו כחולים והיה יפה.", accepted:["était / faisait","était...faisait"], solution_fr:"Le ciel était bleu et il faisait beau.", explanation_he:"imparfait לתיאור מצב/מזג אוויר בעבר.", tip_he:"il faisait (היה) · il neigeait (ירד שלג) · il pleuvait (ירד גשם)." },
      { instruction_he:"imparfait: nous", prompt_fr:"Avant, nous ____ (habiter) à Lyon.", trans_he:"לפני כן גרנו בליון.", accepted:["habitions"], solution_fr:"Avant, nous habitions à Lyon.", explanation_he:"imparfait: nous habitions (שורש habiter + -ions).", tip_he:"nous habitions · vous habitiez · ils habitaient." },
    ],
  ],
  /* stations: Alimentation · Transport · Santé · Vêtements · Sport · Météo */
  voc: [
    [ /* 0 — Alimentation */
      { instruction_he:"תרגם: «לחם»", prompt_fr:"Je mange du ____ tous les matins.", trans_he:"אני אוכל לחם כל בוקר.", accepted:["pain"], solution_fr:"pain", explanation_he:"pain = לחם (זכר). une baguette = באגט.", tip_he:"le pain · le fromage · la viande · le poisson · les légumes." },
      { instruction_he:"תרגם: «אני רעב»", prompt_fr:"J'ai ____.", trans_he:"אני רעב.", accepted:["faim"], solution_fr:"J'ai faim.", explanation_he:"avoir faim = להיות רעב. avoir soif = להיות צמא.", tip_he:"J'ai faim (רעב) · J'ai soif (צמא) · J'ai chaud (חם) · J'ai froid (קר)." },
      { instruction_he:"תרגם: «לבשל»", prompt_fr:"J'aime ____ le week-end.", trans_he:"אני אוהב לבשל בסוף השבוע.", accepted:["cuisiner","faire la cuisine"], solution_fr:"cuisiner", explanation_he:"cuisiner = לבשל (יומיומי). faire la cuisine = לבשל (רשמי יותר).", tip_he:"cuisiner · préparer le repas · faire la cuisine." },
    ],
    [ /* 1 — Transport */
      { instruction_he:"תרגם: «ברכבת תחתית»", prompt_fr:"Je vais au travail ____ métro.", trans_he:"אני הולך לעבודה ברכבת תחתית.", accepted:["en","par le"], solution_fr:"en métro", explanation_he:"en + אמצעי תחבורה: en métro, en bus, en voiture.", tip_he:"en métro · en bus · en voiture · à pied (ברגל) · à vélo (באופניים)." },
      { instruction_he:"תרגם: «כרטיס הלוך ושוב»", prompt_fr:"Je voudrais un billet ____ Paris.", trans_he:"הייתי רוצה כרטיס הלוך ושוב לפריז.", accepted:["aller-retour","aller retour"], solution_fr:"aller-retour", explanation_he:"aller-retour = הלוך ושוב. aller simple = כרטיס חד-כיווני.", tip_he:"un billet (כרטיס) · aller simple (חד-כיווני) · aller-retour (הלוך-ושוב)." },
      { instruction_he:"תרגם: «מחכה לאוטובוס»", prompt_fr:"J'____ l'autobus.", trans_he:"אני מחכה לאוטובוס.", accepted:["attends"], solution_fr:"J'attends l'autobus.", explanation_he:"attendre = לחכות. J'attends = אני מחכה (présent).", tip_he:"attendre le bus · prendre le métro · manquer le train." },
    ],
    [ /* 2 — Santé */
      { instruction_he:"תרגם: «ראש כואב לי»", prompt_fr:"J'ai ____ à la tête.", trans_he:"ראש כואב לי.", accepted:["mal"], solution_fr:"J'ai mal à la tête.", explanation_he:"avoir mal à = לכאוב. J'ai mal à la tête/au ventre.", tip_he:"J'ai mal à la gorge (גרון) · J'ai de la fièvre (חום) · Je me sens mal (לא טוב לי)." },
      { instruction_he:"תרגם: «אני חולה»", prompt_fr:"Je suis ____.", trans_he:"אני חולה.", accepted:["malade"], solution_fr:"Je suis malade.", explanation_he:"malade = חולה. aller mieux = להרגיש טוב יותר.", tip_he:"Je suis malade · Je me sens mieux (טוב יותר) · Je vais mal (לא בסדר)." },
      { instruction_he:"תרגם: «קח תרופה»", prompt_fr:"Tu dois prendre un ____.", trans_he:"אתה חייב לקחת תרופה.", accepted:["médicament"], solution_fr:"médicament", explanation_he:"médicament = תרופה. une ordonnance = מרשם. une pharmacie = בית מרקחת.", tip_he:"un médicament · une ordonnance · chez le médecin (אצל הרופא)." },
    ],
    [ /* 3 — Vêtements */
      { instruction_he:"תרגם: «אני לובש חולצה»", prompt_fr:"Je porte une ____.", trans_he:"אני לובש חולצה.", accepted:["chemise","chemise / t-shirt"], solution_fr:"une chemise / un t-shirt", explanation_he:"chemise = חולצה (מוצלבת) · t-shirt = חולצת טי · pull = סוודר.", tip_he:"une chemise · un jean · une veste · un manteau · des chaussures." },
      { instruction_he:"תרגם: «לעשות קניות»", prompt_fr:"J'aime faire ____ le week-end.", trans_he:"אני אוהב לעשות קניות בסוף השבוע.", accepted:["du shopping","les courses"], solution_fr:"faire du shopping", explanation_he:"faire du shopping = לעשות קניות. faire les courses = לקנות מצרכים.", tip_he:"faire du shopping · les soldes (מכירות) · une boutique (חנות בגדים)." },
      { instruction_he:"תרגם: «המידה שלי»", prompt_fr:"Quelle est votre ____ ?", trans_he:"מה המידה שלכם?", accepted:["taille"], solution_fr:"taille", explanation_he:"la taille = המידה. Quelle taille faites-vous? = מה המידה שלך?", tip_he:"la taille (מידה) · la pointure (מידת נעל) · ça me va (זה מתאים לי)." },
    ],
    [ /* 4 — Sport */
      { instruction_he:"תרגם: «לשחק כדורגל»", prompt_fr:"J'aime ____ au football.", trans_he:"אני אוהב לשחק כדורגל.", accepted:["jouer"], solution_fr:"jouer au football", explanation_he:"jouer à + ספורט עם כדור: jouer au foot, au tennis, au basket.", tip_he:"jouer au foot · faire du vélo · nager · courir · faire de la natation." },
      { instruction_he:"תרגם: «אני עושה ספורט»", prompt_fr:"Je fais du ____ trois fois par semaine.", trans_he:"אני עושה ספורט שלוש פעמים בשבוע.", accepted:["sport"], solution_fr:"sport", explanation_he:"faire du sport = לעשות ספורט. fois = פעמים. par semaine = בשבוע.", tip_he:"faire du sport · faire de la gym · faire du yoga · faire de la course." },
      { instruction_he:"תרגם: «אני עייף אחרי האימון»", prompt_fr:"Je suis très ____ après l'entraînement.", trans_he:"אני מאוד עייף אחרי האימון.", accepted:["fatigué","fatigué(e)","fatiguée"], solution_fr:"fatigué(e)", explanation_he:"fatigué = עייף. l'entraînement = האימון. après = אחרי.", tip_he:"fatigué (עייף) · épuisé (מותש) · en forme (בכושר)." },
    ],
    [ /* 5 — Météo */
      { instruction_he:"תרגם: «מה מזג האוויר?»", prompt_fr:"Quel ____ fait-il ?", trans_he:"מה מזג האוויר?", accepted:["temps"], solution_fr:"Quel temps fait-il ?", explanation_he:"Quel temps fait-il? = מה מזג האוויר? il fait beau = יפה, il fait froid = קר.", tip_he:"il fait beau · il fait froid · il fait chaud · il pleut · il neige." },
      { instruction_he:"תרגם: «ירד גשם»", prompt_fr:"Hier, il a ____.", trans_he:"אתמול ירד גשם.", accepted:["plu"], solution_fr:"il a plu", explanation_he:"pleuvoir בpassé composé: il a plu. pleuvoir = לרדת גשם.", tip_he:"il pleut (הווה) · il a plu (עבר) · il va pleuvoir (עתיד)." },
      { instruction_he:"תרגם: «יהיה קר»", prompt_fr:"Demain, il va faire ____.", trans_he:"מחר יהיה קר.", accepted:["froid"], solution_fr:"il va faire froid", explanation_he:"il fait froid = קר. futur proche: il va faire froid.", tip_he:"il fait chaud (חם) · il fait froid (קר) · il fait beau (יפה) · il fait gris (מעונן)." },
    ],
  ],
  /* stations: Panneaux · Horaires · Menus · SMS & mails · Annonces · Articles courts */
  com: [
    [ /* 0 — Panneaux (signs & notices) */
      { instruction_he:"קרא וענה", prompt_fr:"FERMÉ POUR TRAVAUX\nRéouverture le 15 mars.", trans_he:"סגור לצורך עבודות. פתיחה מחדש ב-15 במרץ.", question_fr:"Pourquoi le magasin est-il fermé ?", q_he:"למה החנות סגורה?", options:["Pour les vacances","Pour des travaux","Pour l'inventaire"], correct:1, explanation_he:"« FERMÉ POUR TRAVAUX » = סגור לצורך עבודות." },
      { instruction_he:"קרא וענה", prompt_fr:"ENTRÉE INTERDITE\nAccès réservé au personnel autorisé.", trans_he:"כניסה אסורה. גישה שמורה לצוות מורשה.", question_fr:"Qui peut entrer ?", q_he:"מי יכול להיכנס?", options:["Tout le monde","Seulement le personnel","Les clients uniquement"], correct:1, explanation_he:"« Accès réservé au personnel autorisé » = רק צוות מורשה." },
      { instruction_he:"קרא וענה", prompt_fr:"SOLDES — 30 à 50% sur tout le magasin\nDu 10 au 25 janvier.", trans_he:"מכירות — 30 עד 50% על כל החנות. מ-10 עד 25 בינואר.", question_fr:"Quelle est la réduction maximale ?", q_he:"מהי ההנחה המקסימלית?", options:["30%","40%","50%"], correct:2, explanation_he:"« 30 à 50% » = מ-30 עד 50%. המקסימום הוא 50%." },
    ],
    [ /* 1 — Horaires (schedules) */
      { instruction_he:"קרא וענה", prompt_fr:"Le musée est ouvert tous les jours sauf le mardi. L'entrée coûte 8 euros pour les adultes et 4 euros pour les enfants.", trans_he:"המוזיאון פתוח כל יום חוץ מיום שלישי. הכניסה עולה 8 יורו למבוגרים ו-4 יורו לילדים.", question_fr:"Quand le musée est-il fermé ?", q_he:"מתי המוזיאון סגור?", options:["Le lundi","Le mardi","Le dimanche"], correct:1, explanation_he:"« ouvert tous les jours sauf le mardi » = פתוח כל יום חוץ מיום שלישי." },
      { instruction_he:"קרא וענה", prompt_fr:"Train Paris → Lyon\nDépart: 08h15 — Arrivée: 10h00\nDurée du trajet: 1h45\nPrix: 45€", trans_he:"רכבת פריז → ליון. יציאה: 08:15 — הגעה: 10:00. משך: שעה 45 דקות. מחיר: 45 יורו.", question_fr:"À quelle heure le train arrive-t-il à Lyon ?", q_he:"מתי הרכבת מגיעה לליון?", options:["À 08h15","À 10h00","À 09h45"], correct:1, explanation_he:"« Arrivée: 10h00 »." },
      { instruction_he:"קרא וענה", prompt_fr:"Bibliothèque municipale\nLundi-vendredi : 9h-19h\nSamedi : 10h-17h\nDimanche : fermé", trans_he:"ספרייה עירונית. שני-שישי: 9-19. שבת: 10-17. ראשון: סגור.", question_fr:"La bibliothèque est-elle ouverte le samedi soir à 18h ?", q_he:"האם הספרייה פתוחה ביום שבת בשעה 18?", options:["Oui","Non","On ne sait pas"], correct:1, explanation_he:"שבת: 10h-17h. 18h > 17h → הספרייה כבר סגורה." },
    ],
    [ /* 2 — Menus */
      { instruction_he:"קרא וענה", prompt_fr:"Menu du jour — 12€\nEntrée : soupe ou salade\nPlat : poulet ou poisson\nDessert : tarte aux pommes", trans_he:"תפריט היום — 12 יורו. מנה ראשונה: מרק או סלט. מנה עיקרית: עוף או דג. קינוח: פאי תפוחים.", question_fr:"Qu'est-ce qu'on peut choisir comme entrée ?", q_he:"מה אפשר לבחור כמנה ראשונה?", options:["Poulet ou poisson","Soupe ou salade","Tarte aux pommes"], correct:1, explanation_he:"« Entrée : soupe ou salade »." },
      { instruction_he:"קרא וענה", prompt_fr:"— Comme plat, vous avez le bœuf bourguignon ou le saumon grillé.\n— Je suis végétarienne. Il y a un plat sans viande ?\n— Oui, nous avons une quiche aux légumes.", trans_he:"— כמנה עיקרית, יש לכם בקר בורגיניון או סלמון צלוי.\n— אני צמחונית. יש מנה ללא בשר?\n— כן, יש לנו קיש ירקות.", question_fr:"Que choisit la personne végétarienne ?", q_he:"מה הצמחונית בוחרת?", options:["Le bœuf bourguignon","Le saumon grillé","La quiche aux légumes"], correct:2, explanation_he:"« nous avons une quiche aux légumes » — זה האפשרות ללא בשר." },
      { instruction_he:"קרא וענה", prompt_fr:"Sophie a vingt-deux ans. Elle est infirmière. Elle travaille à l'hôpital du lundi au vendredi. Le week-end, elle fait du yoga et elle lit des livres.", trans_he:"סופי בת 22. היא אחות. היא עובדת בבית חולים מ-שני עד שישי. בסוף שבוע היא עושה יוגה וקוראת ספרים.", question_fr:"Que fait Sophie le week-end ?", q_he:"מה סופי עושה בסוף השבוע?", options:["Elle travaille à l'hôpital","Elle fait du yoga et lit des livres","Elle sort avec des amis"], correct:1, explanation_he:"« le week-end, elle fait du yoga et elle lit des livres »." },
    ],
    [ /* 3 — SMS & mails */
      { instruction_he:"קרא וענה", prompt_fr:"Salut ! T'es libre ce soir ? On se retrouve au café vers 19h ? Réponds vite stp !", trans_he:"היי! אתה פנוי הערב? נתראה בבית הקפה בסביבות 19? ענה מהר בבקשה!", question_fr:"Pourquoi envoie-t-on ce message ?", q_he:"למה שולחים את ההודעה הזו?", options:["Pour annuler un rendez-vous","Pour proposer une rencontre","Pour demander de l'aide"], correct:1, explanation_he:"« On se retrouve au café » = לתאם פגישה." },
      { instruction_he:"קרא וענה", prompt_fr:"Objet : Candidature pour le poste d'assistant\nMadame, Monsieur,\nJe me permets de vous adresser ma candidature pour le poste annoncé sur votre site.", trans_he:"נושא: מועמדות לתפקיד עוזר. גברת, אדון, ברשותי להגיש מועמדותי לתפקיד שפורסם באתרכם.", question_fr:"À quoi sert ce mail ?", q_he:"למה ההודעה הזו?", options:["À commander un produit","À postuler pour un travail","À réserver un hôtel"], correct:1, explanation_he:"« candidature pour le poste » = מועמדות לתפקיד." },
      { instruction_he:"קרא וענה", prompt_fr:"SMS: Allo ! Je suis en retard, le bus est bloqué. J'arrive dans 20 min max. Désolé !", trans_he:"היי! אני מאחר, האוטובוס תקוע. אגיע בעוד 20 דקות לכל היותר. סורי!", question_fr:"Pourquoi la personne est-elle en retard ?", q_he:"למה האדם מאחר?", options:["Il a oublié le rendez-vous","Le bus est bloqué","Il est malade"], correct:1, explanation_he:"« le bus est bloqué » = האוטובוס תקוע." },
    ],
    [ /* 4 — Annonces */
      { instruction_he:"קרא וענה", prompt_fr:"Demain, il va faire très chaud : 35 degrés. Il est conseillé de boire beaucoup d'eau et d'éviter le soleil entre 12h et 16h.", trans_he:"מחר יהיה חם מאוד: 35 מעלות. מומלץ לשתות הרבה מים ולהימנע מהשמש בין 12 ל-16.", question_fr:"Que faut-il éviter demain ?", q_he:"ממה כדאי להימנע מחר?", options:["Boire de l'eau","Le soleil l'après-midi","Sortir le matin"], correct:1, explanation_he:"« éviter le soleil entre 12h et 16h »." },
      { instruction_he:"קרא וענה", prompt_fr:"OFFRE D'EMPLOI\nRestaurant cherche serveur/serveuse.\nHoraires : soir et week-end.\nExpérience souhaitée. Envoyer CV à contact@bistro.fr", trans_he:"מודעת עבודה. מסעדה מחפשת מלצר/ית. שעות: ערב וסוף שבוע. ניסיון מועדף. שלח קורות חיים.", question_fr:"Quand le poste exige-t-il de travailler ?", q_he:"מתי צריך לעבוד בתפקיד זה?", options:["Le matin et la journée","Le soir et le week-end","De nuit uniquement"], correct:1, explanation_he:"« Horaires : soir et week-end »." },
      { instruction_he:"קרא וענה", prompt_fr:"CONCERT — Les Fatals Picards\nSamedi 15 juin, 20h30\nSalle Pleyel, Paris\nPlaces : 25€ à 45€ · Réservation sur bigliote.fr", trans_he:"קונצרט — Les Fatals Picards. שבת 15 ביוני, 20:30. Salle Pleyel, פריז. כרטיסים: 25-45 יורו.", question_fr:"Où a lieu le concert ?", q_he:"איפה מתקיים הקונצרט?", options:["À Lyon","À Paris","À Bordeaux"], correct:1, explanation_he:"« Salle Pleyel, Paris »." },
    ],
    [ /* 5 — Articles courts */
      { instruction_he:"קרא וענה", prompt_fr:"De plus en plus de Français choisissent le vélo pour leurs déplacements en ville, pour des raisons écologiques et économiques.", trans_he:"יותר ויותר צרפתים בוחרים באופניים לנסיעות בעיר, מסיבות אקולוגיות וכלכליות.", question_fr:"Pourquoi les Français choisissent-ils le vélo ?", q_he:"למה הצרפתים בוחרים באופניים?", options:["Pour le sport uniquement","Pour des raisons écologiques et économiques","Parce qu'il n'y a pas de transports en commun"], correct:1, explanation_he:"« pour des raisons écologiques et économiques »." },
      { instruction_he:"קרא וענה", prompt_fr:"Une nouvelle application permet de trouver facilement des restaurants végétariens dans toute la France. Elle est disponible gratuitement sur smartphone.", trans_he:"אפליקציה חדשה מאפשרת למצוא בקלות מסעדות צמחוניות בכל צרפת. היא זמינה בחינם בסמארטפון.", question_fr:"À quoi sert cette application ?", q_he:"למה משמשת האפליקציה הזו?", options:["À commander des repas","À trouver des restaurants végétariens","À faire des réservations d'hôtel"], correct:1, explanation_he:"« trouver facilement des restaurants végétariens »." },
      { instruction_he:"קרא וענה", prompt_fr:"Le français est la langue officielle de 29 pays dans le monde. C'est la deuxième langue la plus étudiée après l'anglais.", trans_he:"הצרפתית היא השפה הרשמית של 29 מדינות בעולם. זוהי השפה השנייה הנלמדת ביותר אחרי האנגלית.", question_fr:"Combien de pays ont le français comme langue officielle ?", q_he:"כמה מדינות מכירות בצרפתית כשפה רשמית?", options:["19 pays","29 pays","39 pays"], correct:1, explanation_he:"« langue officielle de 29 pays »." },
    ],
  ],
  /* stations: Hier… · Mon appart · Mon week-end · Mes goûts · Ma routine · Mon quartier */
  exp: [
    [ /* 0 — Hier… (passé composé) */
      { instruction_he:"ספר מה עשית אתמול", prompt_fr:"Qu'est-ce que tu as fait hier ? Utilise le passé composé.", trans_he:"מה עשית אתמול? השתמש ב-passé composé.", model_fr:"Hier, je me suis levé à sept heures. J'ai mangé des céréales. Ensuite, je suis allé au travail. Le soir, j'ai regardé un film.", keys_fr:["hier","j'ai + participe","je suis allé(e)","ensuite","le soir"], tip_he:"passé composé: j'ai mangé · j'ai regardé · je suis allé(e) · je suis rentré(e)." },
      { instruction_he:"ספר על אירוע מהשבוע שעבר", prompt_fr:"Qu'est-ce que tu as fait la semaine dernière ?", trans_he:"מה עשית בשבוע שעבר?", model_fr:"La semaine dernière, j'ai travaillé beaucoup. Mercredi soir, je suis sorti avec des amis. On a mangé dans un bon restaurant.", keys_fr:["la semaine dernière","j'ai travaillé","je suis sorti(e)","on a mangé"], tip_he:"la semaine dernière (שבוע שעבר) · hier soir (אמש) · avant-hier (שלשום)." },
      { instruction_he:"ספר על ביקור שעשית", prompt_fr:"Décris une visite que tu as faite récemment.", trans_he:"תאר ביקור שעשית לאחרונה.", model_fr:"Le mois dernier, je suis allé à Tel Aviv. J'ai visité un musée et j'ai mangé dans un restaurant sympa. C'était super.", keys_fr:["je suis allé(e)","j'ai visité","j'ai mangé","c'était"], tip_he:"c'était = זה היה (imparfait de être) — להבעת הרגשה." },
    ],
    [ /* 1 — Mon appart */
      { instruction_he:"תאר את הדירה שלך", prompt_fr:"Décris ton appartement ou ta maison.", trans_he:"תאר את הדירה או הבית שלך.", model_fr:"J'habite dans un appartement au troisième étage. Il y a trois pièces : un salon, une chambre et une cuisine. C'est assez grand et lumineux.", keys_fr:["j'habite dans","il y a","un salon","une chambre","assez"], tip_he:"un salon · une chambre · une cuisine · une salle de bains." },
      { instruction_he:"תאר את החדר שלך", prompt_fr:"Décris ta chambre.", trans_he:"תאר את החדר שלך.", model_fr:"Ma chambre est petite mais confortable. Il y a un lit, un bureau et une armoire. J'ai des posters sur les murs.", keys_fr:["ma chambre est","il y a","un lit","un bureau","sur les murs"], tip_he:"un lit (מיטה) · un bureau (שולחן עבודה) · une armoire (ארון) · les murs (הקירות)." },
      { instruction_he:"ספר על השכנות שלך", prompt_fr:"Parle de ton quartier ou de tes voisins.", trans_he:"ספר על שכונתך או שכניך.", model_fr:"Mon appartement est dans un quartier calme. Mes voisins sont sympas. Il y a un parc à deux minutes à pied.", keys_fr:["mon appartement est","dans un quartier","mes voisins","à deux minutes"], tip_he:"un quartier calme/animé · les voisins (שכנים) · à ... minutes à pied." },
    ],
    [ /* 2 — Mon week-end */
      { instruction_he:"תאר את סוף השבוע שלך", prompt_fr:"Raconte ce que tu fais normalement le week-end.", trans_he:"ספר מה אתה עושה בדרך כלל בסוף השבוע.", model_fr:"Le samedi matin, je fais les courses au marché. L'après-midi, je retrouve mes amis en ville. Le dimanche, je reste chez moi.", keys_fr:["le samedi","le dimanche","je fais","l'après-midi","en ville"], tip_he:"présent לתיאור הרגל: je fais, je retrouve, je reste, je lis." },
      { instruction_he:"ספר על סוף שבוע מיוחד", prompt_fr:"Décris un week-end particulièrement agréable.", trans_he:"תאר סוף שבוע מהנה במיוחד.", model_fr:"Le week-end dernier était super. Samedi, je suis allé à la plage avec des amis. Il faisait beau. Le soir, on a fait un barbecue.", keys_fr:["le week-end dernier","je suis allé(e)","il faisait beau","le soir","on a fait"], tip_he:"mélanger passé composé et imparfait: actions (PC) + contexte (imparfait)." },
      { instruction_he:"ספר על תוכניות לסוף השבוע", prompt_fr:"Qu'est-ce que tu vas faire ce week-end ?", trans_he:"מה אתה הולך לעשות בסוף השבוע?", model_fr:"Ce week-end, je vais rendre visite à ma famille. On va manger ensemble et regarder un film. J'ai hâte !", keys_fr:["je vais","on va","hâte","ce week-end"], tip_he:"futur proche: je vais + infinitif · J'ai hâte = אני מצפה בקוצר רוח." },
    ],
    [ /* 3 — Mes goûts */
      { instruction_he:"ספר על הטעמים שלך", prompt_fr:"Parle de ce que tu aimes et n'aimes pas.", trans_he:"ספר על מה שאתה אוהב ולא אוהב.", model_fr:"J'adore la musique et le cinéma. Je n'aime pas tellement les sports d'équipe, mais j'aime nager. En général, je préfère les activités calmes.", keys_fr:["j'adore","je n'aime pas tellement","mais","je préfère","en général"], tip_he:"j'adore · j'aime beaucoup · je n'aime pas tellement · je déteste." },
      { instruction_he:"השווה שני דברים שאתה אוהב", prompt_fr:"Compare deux choses que tu aimes.", trans_he:"השווה שני דברים שאתה אוהב.", model_fr:"J'aime le café et le thé, mais je préfère le café. Le thé est plus doux, mais le café est plus fort et me réveille mieux.", keys_fr:["je préfère","plus ... que","mais","le/la ... est plus"], tip_he:"plus + adj + que = יותר...מ-. moins + adj + que = פחות...מ-. aussi ... que = כמו." },
      { instruction_he:"ספר על ז'אנר מוזיקה אהוב", prompt_fr:"Décris le genre de musique que tu aimes.", trans_he:"תאר את הסגנון מוזיקלי האהוב עליך.", model_fr:"J'aime beaucoup le jazz. C'est une musique douce et sophistiquée. J'écoute du jazz quand je travaille ou quand je me repose.", keys_fr:["j'aime beaucoup","c'est une musique","j'écoute","quand"], tip_he:"le jazz · le rock · la musique classique · le rap · la chanson française." },
    ],
    [ /* 4 — Ma routine */
      { instruction_he:"תאר את השגרה היומיומית שלך", prompt_fr:"Décris ta routine quotidienne.", trans_he:"תאר את השגרה היומיומית שלך.", model_fr:"Je me lève à six heures et demie. Je prends une douche, puis je mange. Je vais au bureau en métro. Le soir, je rentre vers dix-neuf heures.", keys_fr:["je me lève","je prends","je vais","le soir","je rentre"], tip_he:"d'abord · ensuite · puis · après · enfin." },
      { instruction_he:"ספר על בוקר שגרתי", prompt_fr:"Décris un matin typique chez toi.", trans_he:"תאר בוקר שגרתי שלך.", model_fr:"Mon réveil sonne à sept heures. Je me lève dix minutes après. Je me douche et je m'habille. Je mange des toasts et je bois du café.", keys_fr:["mon réveil sonne","je me lève","je me douche","je m'habille","je mange"], tip_he:"se lever · se doucher · s'habiller · prendre le petit-déjeuner · partir." },
      { instruction_he:"ספר מה אתה עושה בשעות הפנאי", prompt_fr:"Que fais-tu le soir après le travail ?", trans_he:"מה אתה עושה בערב אחרי העבודה?", model_fr:"Après le travail, je vais souvent faire du sport. Ensuite, je prépare le dîner et je regarde la télé ou je lis un peu.", keys_fr:["après le travail","je vais faire","ensuite","je prépare","je regarde"], tip_he:"après (אחרי) · ensuite (אחר כך) · souvent (לעתים קרובות)." },
    ],
    [ /* 5 — Mon quartier */
      { instruction_he:"תאר את השכונה שלך", prompt_fr:"Décris ton quartier.", trans_he:"תאר את השכונה שלך.", model_fr:"J'habite dans un quartier animé près du centre-ville. Il y a beaucoup de cafés, de restaurants et de boutiques. C'est pratique mais parfois bruyant.", keys_fr:["j'habite dans","un quartier","il y a","c'est","mais"], tip_he:"animé (תוסס) · calme (שקט) · pratique (נוח) · bruyant (רועש) · propre (נקי)." },
      { instruction_he:"ספר על חנויות/שירותים בקרבתך", prompt_fr:"Quels commerces ou services y a-t-il près de chez toi ?", trans_he:"אילו חנויות/שירותים יש בקרבת ביתך?", model_fr:"Près de chez moi, il y a une boulangerie, un supermarché et une pharmacie. Il y a aussi un parc où je me promène le week-end.", keys_fr:["près de chez moi","il y a","aussi","où je"], tip_he:"une boulangerie · un supermarché · une pharmacie · une poste · un parc." },
      { instruction_he:"השווה שכונות", prompt_fr:"Compare ton quartier à un autre endroit que tu connais.", trans_he:"השווה את שכונתך לאזור אחר שאתה מכיר.", model_fr:"Mon quartier est plus calme que le centre-ville, mais moins animé. Il y a moins de restaurants mais plus d'espaces verts. Je préfère le calme.", keys_fr:["plus ... que","moins ... que","mais","je préfère"], tip_he:"plus calme que · moins animé · autant de · je préfère." },
    ],
  ],
};

const BANK_B1 = {
  /* stations: Imparfait/PC · Qui/Que · Pronoms COD · Pronoms COI · Réfléchis · Comparatifs */
  gra: [
    [ /* 0 — Imparfait / Passé composé */
      { instruction_he:"imparfait ל-PC: מצב רקע", prompt_fr:"Quand le téléphone a sonné, je ____ (dormir).", trans_he:"כשהטלפון צלצל, ישנתי.", accepted:["dormais"], solution_fr:"Quand le téléphone a sonné, je dormais.", explanation_he:"PC לפעולה חדה (a sonné), imparfait לרקע מתמשך (dormais).", tip_he:"imparfait = רקע/מצב · passé composé = פעולה חדה." },
      { instruction_he:"imparfait ל-PC: פעולה חדה", prompt_fr:"J'____ (regarder) la télé quand il est entré.", trans_he:"צפיתי בטלוויזיה כשהוא נכנס.", accepted:["regardais"], solution_fr:"Je regardais la télé quand il est entré.", explanation_he:"regardais (imparfait) = רקע מתמשך. est entré (PC) = פעולה חדה שהפריעה.", tip_he:"quand/pendant que + imparfait (רקע) + PC (פעולה)." },
      { instruction_he:"בחר imparfait או PC", prompt_fr:"Il ____ (pleuvoir) quand nous ____ (sortir).", trans_he:"ירד גשם כשיצאנו.", accepted:["pleuvait / sommes sortis","pleuvait ... sommes sortis"], solution_fr:"Il pleuvait quand nous sommes sortis.", explanation_he:"pleuvait (imparfait) = מצב מתמשך. sommes sortis (PC) = פעולה שקרתה.", tip_he:"imparfait = מה שהיה ברקע · PC = מה שקרה." },
    ],
    [ /* 1 — Qui / Que / Dont */
      { instruction_he:"כינוי זיקה: נושא", prompt_fr:"La femme ____ travaille ici est médecin.", trans_he:"האישה שעובדת כאן היא רופאה.", accepted:["qui"], solution_fr:"La femme qui travaille ici est médecin.", explanation_he:"qui = שהיא (נושא). la femme היא הנושא של travaille → qui.", tip_he:"qui = נושא (אחריו פועל) · que = מושא (אחריו נושא)." },
      { instruction_he:"כינוי זיקה: מושא ישיר", prompt_fr:"C'est l'ami ____ j'ai rencontré hier.", trans_he:"זה החבר שפגשתי אתמול.", accepted:["que","qu'"], solution_fr:"C'est l'ami que j'ai rencontré hier.", explanation_he:"que = שאותו (מושא ישיר). l'ami הוא המושא של rencontrer.", tip_he:"qui = נושא (qui vient) · que = מושא (que je vois)." },
      { instruction_he:"כינוי זיקה: dont", prompt_fr:"C'est le livre ____ tu m'as parlé.", trans_he:"זה הספר שדיברת איתי עליו.", accepted:["dont"], solution_fr:"C'est le livre dont tu m'as parlé.", explanation_he:"dont מחליף de + שם. parler de qqch → dont.", tip_he:"dont אחרי פעלים ב-de: parler de, avoir besoin de, se souvenir de." },
    ],
    [ /* 2 — Pronoms COD (le/la/les) */
      { instruction_he:"COD: la", prompt_fr:"Tu vois Marie ? — Oui, je ____ vois tous les jours.", trans_he:"אתה רואה את מארי? — כן, אני רואה אותה כל יום.", accepted:["la"], solution_fr:"Oui, je la vois tous les jours.", explanation_he:"COD לנקבה יחיד = la. בא לפני הפועל.", tip_he:"le (אותו) · la (אותה) · les (אותם/ן)." },
      { instruction_he:"COD: les", prompt_fr:"Tu as regardé les films ? — Oui, je ____ ai regardés.", trans_he:"צפית בסרטים? — כן, צפיתי בהם.", accepted:["les"], solution_fr:"Oui, je les ai regardés.", explanation_he:"les = אותם. בpassé composé עם avoir + COD לפניו, participe מתאים: regardés.", tip_he:"COD לפני avoir בPC → participe מתאים למין ומספר." },
      { instruction_he:"COD: placement avec infinitif", prompt_fr:"Je vais appeler ma sœur. → Je vais ____ appeler.", trans_he:"אני הולך להתקשר לאחותי. → אני הולך להתקשר אליה.", accepted:["la"], solution_fr:"Je vais la appeler. / Je vais l'appeler.", explanation_he:"עם futur proche: COD נמצא לפני ה-infinitif: vais la appeler.", tip_he:"aller + la/le/les + infinitif · veux la voir · dois les faire." },
    ],
    [ /* 3 — Pronoms COI (lui/leur) */
      { instruction_he:"COI: leur", prompt_fr:"Tu parles à tes parents ? — Oui, je ____ parle tous les jours.", trans_he:"אתה מדבר עם ההורים שלך? — כן, אני מדבר איתם כל יום.", accepted:["leur"], solution_fr:"Oui, je leur parle tous les jours.", explanation_he:"COI לרבים = leur. parler à qqn → lui/leur.", tip_he:"lui = לו/לה (יחיד) · leur = להם/להן (רבים)." },
      { instruction_he:"COI: lui", prompt_fr:"Tu as dit la vérité à Pierre ? — Oui, je ____ ai dit la vérité.", trans_he:"אמרת לפייר את האמת? — כן, אמרתי לו.", accepted:["lui"], solution_fr:"Oui, je lui ai dit la vérité.", explanation_he:"COI ליחיד (זכר) = lui. dire à qqn → lui.", tip_he:"lui ai dit · lui ai donné · lui ai montré — כולם COI יחיד." },
      { instruction_he:"COI vs COD", prompt_fr:"Je téléphone à Marc. → Je ____ téléphone.", trans_he:"אני מתקשר למארק. → אני מתקשר לו.", accepted:["lui"], solution_fr:"Je lui téléphone.", explanation_he:"téléphoner à qqn → COI → lui. אל תשתמש ב-le (זה COD)!", tip_he:"COI: parler à, téléphoner à, écrire à, répondre à → lui/leur." },
    ],
    [ /* 4 — Verbes réfléchis */
      { instruction_he:"פועל רפלקסיבי: présent", prompt_fr:"Chaque matin, je ____ (se lever) à sept heures.", trans_he:"כל בוקר אני קם בשבע.", accepted:["me lève"], solution_fr:"Chaque matin, je me lève à sept heures.", explanation_he:"se lever = לקום. je me lève, tu te lèves, il se lève.", tip_he:"se lever · se coucher · s'habiller · se laver · se réveiller." },
      { instruction_he:"פועל רפלקסיבי: passé composé", prompt_fr:"Elle ____ (se réveiller) tard ce matin.", trans_he:"היא התעוררה מאוחר הבוקר.", accepted:["s'est réveillée","s'est reveillée"], solution_fr:"Elle s'est réveillée tard ce matin.", explanation_he:"פועלים רפלקסיביים לוקחים être בPC. elle → s'est réveillée (נקבה).", tip_he:"se + être + participe: elle s'est levée · il s'est couché." },
      { instruction_he:"פועל רפלקסיבי: négatif", prompt_fr:"Il ____ (ne pas se dépêcher) ce matin.", trans_he:"הוא לא מיהר הבוקר.", accepted:["ne s'est pas dépêché","s'est pas dépêché"], solution_fr:"Il ne s'est pas dépêché ce matin.", explanation_he:"שלילה בPC רפלקסיבי: ne + s' + est + pas + participe.", tip_he:"Il ne s'est pas levé (לא קם) · Elle ne s'est pas habillée (לא התלבשה)." },
    ],
    [ /* 5 — Comparatifs / Superlatifs */
      { instruction_he:"comparatif: plus...que", prompt_fr:"Paris est ____ grande ____ Lyon.", trans_he:"פריז גדולה יותר מליון.", accepted:["plus / que","plus...que"], solution_fr:"Paris est plus grande que Lyon.", explanation_he:"plus + adj + que = יותר...מ-.", tip_he:"plus...que · moins...que · aussi...que = כמו." },
      { instruction_he:"superlatif: le/la plus", prompt_fr:"C'est ____ film ____ intéressant de l'année.", trans_he:"זה הסרט המעניין ביותר של השנה.", accepted:["le / plus","le plus","le film le plus"], solution_fr:"C'est le film le plus intéressant de l'année.", explanation_he:"supérlatif: le/la/les + plus + adj. le film le plus intéressant.", tip_he:"le plus (הכי) · le moins (הכי פחות) · le meilleur (הטוב ביותר)." },
      { instruction_he:"irréguliers: meilleur / mieux", prompt_fr:"Ce restaurant est ____ que l'autre.", trans_he:"המסעדה הזו יותר טובה מהאחרת.", accepted:["meilleur","meilleure","mieux"], solution_fr:"Ce restaurant est meilleur que l'autre.", explanation_he:"bon → meilleur (תואר שם). bien → mieux (תואר פועל).", tip_he:"bon/meilleur (adj) · bien/mieux (adv) · mauvais/pire." },
    ],
  ],
  /* stations: Voyages · Santé · Environnement · Médias · Travail · Relations */
  voc: [
    [ /* 0 — Voyages */
      { instruction_he:"תרגם: «לטייל»", prompt_fr:"J'adore ____ en Europe.", trans_he:"אני מאוד אוהב לטייל באירופה.", accepted:["voyager"], solution_fr:"voyager", explanation_he:"voyager = לטייל. un voyage = מסע.", tip_he:"voyager · partir en vacances · explorer · faire un séjour." },
      { instruction_he:"תרגם: «להגיע בזמן»", prompt_fr:"Il est important d'____ à l'heure.", trans_he:"חשוב להגיע בזמן.", accepted:["arriver","arriver à l'heure"], solution_fr:"arriver à l'heure", explanation_he:"arriver à l'heure = להגיע בזמן. être en retard = להיות מאוחר.", tip_he:"à l'heure (בזמן) · en retard (מאוחר) · en avance (מוקדם)." },
      { instruction_he:"תרגם: «ביטוח נסיעה»", prompt_fr:"J'ai pris une ____ de voyage.", trans_he:"לקחתי ביטוח נסיעה.", accepted:["assurance"], solution_fr:"une assurance de voyage", explanation_he:"assurance = ביטוח. une assurance de voyage = ביטוח נסיעה.", tip_he:"une assurance · un passeport · un visa · une réservation." },
    ],
    [ /* 1 — Santé */
      { instruction_he:"תרגם: «ממש עייף»", prompt_fr:"Après le sport, je suis ____.", trans_he:"אחרי ספורט, אני ממש עייף.", accepted:["épuisé","épuisée","crevé"], solution_fr:"épuisé(e) / crevé(e)", explanation_he:"épuisé = מותש. crevé = סלנג לממש מותש.", tip_he:"fatigué (עייף) · épuisé (מותש) · crevé (ממש מותש, סלנג)." },
      { instruction_he:"תרגם: «אני מרגיש טוב יותר»", prompt_fr:"Je ____ mieux depuis hier.", trans_he:"אני מרגיש טוב יותר מאתמול.", accepted:["me sens","vais"], solution_fr:"Je me sens mieux / Je vais mieux", explanation_he:"se sentir mieux = להרגיש טוב יותר. aller mieux = להיות בסדר יותר.", tip_he:"se sentir (bien/mal) · aller mieux · être en forme." },
      { instruction_he:"תרגם: «ניתוח»", prompt_fr:"Il doit subir une ____.", trans_he:"הוא חייב לעבור ניתוח.", accepted:["opération","intervention","chirurgie"], solution_fr:"une opération / une intervention", explanation_he:"opération = ניתוח (יומיומי) · intervention = התערבות רפואית · chirurgie = כירורגיה.", tip_he:"une opération · une anesthésie · une convalescence (החלמה)." },
    ],
    [ /* 2 — Environnement */
      { instruction_he:"תרגם: «לשמור על הסביבה»", prompt_fr:"Il faut ____ l'environnement.", trans_he:"צריך לשמור על הסביבה.", accepted:["protéger","respecter","préserver"], solution_fr:"protéger / préserver l'environnement", explanation_he:"protéger = להגן · préserver = לשמר · l'environnement = הסביבה.", tip_he:"le réchauffement climatique · le recyclage · les énergies renouvelables." },
      { instruction_he:"תרגם: «פחמן דו חמצני»", prompt_fr:"Les voitures émettent beaucoup de ____.", trans_he:"מכוניות פולטות הרבה פחמן דו חמצני.", accepted:["CO2","dioxyde de carbone","gaz carbonique"], solution_fr:"CO2 / dioxyde de carbone", explanation_he:"dioxyde de carbone = פחמן דו חמצני. gaz à effet de serre = גזי חממה.", tip_he:"les émissions de CO2 · l'effet de serre · le changement climatique." },
      { instruction_he:"תרגם: «מיחזור»", prompt_fr:"Il est important de faire le ____.", trans_he:"חשוב לעשות מיחזור.", accepted:["recyclage"], solution_fr:"le recyclage", explanation_he:"le recyclage = מיחזור. recycler = למחזר. les déchets = פסולת.", tip_he:"recycler · trier les déchets · économiser l'énergie · le compost." },
    ],
    [ /* 3 — Médias */
      { instruction_he:"תרגם: «עיתון»", prompt_fr:"Je lis le ____ tous les matins.", trans_he:"אני קורא את העיתון כל בוקר.", accepted:["journal","journal / quotidien","quotidien"], solution_fr:"journal / quotidien", explanation_he:"journal = עיתון (יומי). quotidien = יומי (adj ו-n). hebdomadaire = שבועי.", tip_he:"un journal · un magazine · une revue · une chaîne de télévision." },
      { instruction_he:"תרגם: «לפי הידיעות»", prompt_fr:"____, il va pleuvoir demain.", trans_he:"לפי הידיעות, מחר ירד גשם.", accepted:["D'après les informations","Selon les informations","D'après les médias"], solution_fr:"D'après les informations", explanation_he:"d'après = לפי (מקור מידע). selon = לפי (דעה). d'après les infos = לפי החדשות.", tip_he:"d'après · selon · d'après les médias/la radio/le journal." },
      { instruction_he:"תרגם: «חברת מדיה»", prompt_fr:"Cette ____ diffuse ses programmes dans le monde entier.", trans_he:"חברת המדיה הזו משדרת תוכניות ברחבי העולם.", accepted:["chaîne","chaîne de télévision","média"], solution_fr:"chaîne (de télévision)", explanation_he:"une chaîne = ערוץ טלוויזיה. un média = מדיה. les médias = כלי התקשורת.", tip_he:"une chaîne · un réseau (רשת) · les médias · la presse (העיתונות)." },
    ],
    [ /* 4 — Travail */
      { instruction_he:"תרגם: «מועמדות לעבודה»", prompt_fr:"J'ai envoyé ma ____ pour ce poste.", trans_he:"שלחתי את מועמדותי לתפקיד הזה.", accepted:["candidature"], solution_fr:"ma candidature", explanation_he:"une candidature = מועמדות. un candidat/e = מועמד/ת. postuler = להגיש מועמדות.", tip_he:"postuler · une candidature · un CV · une lettre de motivation." },
      { instruction_he:"תרגם: «עמית לעבודה»", prompt_fr:"Je m'entends bien avec mes ____.", trans_he:"אני מסתדר טוב עם עמיתיי לעבודה.", accepted:["collègues"], solution_fr:"collègues", explanation_he:"un/une collègue = עמית לעבודה. le patron/la patronne = הבוס.", tip_he:"un collègue · le patron · l'employé · le chef de projet." },
      { instruction_he:"תרגם: «לשכת אבטלה»", prompt_fr:"Il est au ____ depuis trois mois.", trans_he:"הוא מובטל כבר שלושה חודשים.", accepted:["chômage"], solution_fr:"au chômage", explanation_he:"être au chômage = להיות מובטל. le chômage = אבטלה. Pôle emploi = לשכת התעסוקה.", tip_he:"au chômage (מובטל) · licencier (לפטר) · démissionner (להתפטר)." },
    ],
    [ /* 5 — Relations */
      { instruction_he:"תרגם: «אני מסכים איתך»", prompt_fr:"Je suis ____ avec toi.", trans_he:"אני מסכים איתך.", accepted:["d'accord"], solution_fr:"Je suis d'accord avec toi.", explanation_he:"être d'accord = להסכים. Je ne suis pas d'accord = אני לא מסכים.", tip_he:"d'accord · au contraire (להיפך) · en revanche (לעומת זאת)." },
      { instruction_he:"תרגם: «להסכים / להתפשר»", prompt_fr:"On a trouvé un ____.", trans_he:"מצאנו פשרה.", accepted:["compromis"], solution_fr:"un compromis", explanation_he:"un compromis = פשרה. trouver un compromis = להגיע לפשרה.", tip_he:"un compromis · un accord · une solution · négocier (לנהל משא ומתן)." },
      { instruction_he:"תרגם: «תמיכה»", prompt_fr:"J'ai besoin de ton ____.", trans_he:"אני צריך את תמיכתך.", accepted:["soutien","aide","support"], solution_fr:"soutien / aide", explanation_he:"le soutien = תמיכה. l'aide = עזרה. soutenir = לתמוך.", tip_he:"le soutien · l'aide · la solidarité · l'entraide (עזרה הדדית)." },
    ],
  ],
  /* stations: Faits divers · Blogs · Publicités · Interviews · Critiques · Reportages */
  com: [
    [ /* 0 — Faits divers */
      { instruction_he:"קרא וענה", prompt_fr:"De plus en plus de consommateurs se tournent vers les produits biologiques, convaincus qu'ils sont meilleurs pour la santé, malgré un prix souvent plus élevé.", trans_he:"יותר ויותר צרכנים פונים למוצרים אורגניים, משוכנעים שהם בריאים יותר, למרות מחיר גבוה יותר.", question_fr:"Qu'est-ce qui peut freiner l'achat de produits bio ?", q_he:"מה עלול להרתיע מקנייה של מוצרים אורגניים?", options:["Leur goût","Leur prix plus élevé","Leur rareté"], correct:1, explanation_he:"« malgré un prix souvent plus élevé »." },
      { instruction_he:"קרא וענה", prompt_fr:"Un incendie s'est déclaré hier soir dans un immeuble du centre-ville. Cinq personnes ont été évacuées. Aucune victime n'est à déplorer.", trans_he:"שריפה פרצה אמש בבניין במרכז העיר. חמישה אנשים פונו. אין נפגעים.", question_fr:"Combien de personnes ont été évacuées ?", q_he:"כמה אנשים פונו?", options:["Trois personnes","Cinq personnes","Dix personnes"], correct:1, explanation_he:"« Cinq personnes ont été évacuées »." },
      { instruction_he:"קרא וענה", prompt_fr:"Un jeune de 17 ans a remporté le premier prix du concours de mathématiques national. Il représentera la France aux Olympiades internationales.", trans_he:"נער בן 17 זכה בפרס הראשון בתחרות מתמטיקה לאומית. הוא ייצג את צרפת באולימפיאדה הבינלאומית.", question_fr:"Que va faire ce jeune maintenant ?", q_he:"מה הנער עומד לעשות כעת?", options:["Il va quitter la France","Il va représenter la France aux Olympiades","Il va enseigner les maths"], correct:1, explanation_he:"« Il représentera la France aux Olympiades internationales »." },
    ],
    [ /* 1 — Blogs */
      { instruction_he:"קרא וענה", prompt_fr:"Apprendre une langue étrangère demande de la patience : les progrès sont parfois lents, mais la régularité finit toujours par payer.", trans_he:"ללמוד שפה זרה דורש סבלנות: ההתקדמות לפעמים איטית, אך ההתמדה תמיד משתלמת בסוף.", question_fr:"Quel facteur est essentiel selon le texte ?", q_he:"איזה גורם חיוני לפי הטקסט?", options:["Le talent inné","La régularité","La rapidité"], correct:1, explanation_he:"« la régularité finit toujours par payer »." },
      { instruction_he:"קרא וענה", prompt_fr:"Mon blog parle de ma vie à Paris en tant qu'étudiante étrangère. Je raconte mes aventures, mes galères et mes découvertes culturelles.", trans_he:"הבלוג שלי מדבר על חיי בפריז כסטודנטית זרה. אני מספרת על ההרפתקאות, הקשיים והגילויים התרבותיים שלי.", question_fr:"De quoi parle ce blog ?", q_he:"במה עוסק הבלוג?", options:["De recettes de cuisine","De la vie d'une étudiante étrangère à Paris","De voyages en Europe"], correct:1, explanation_he:"« ma vie à Paris en tant qu'étudiante étrangère »." },
      { instruction_he:"קרא וענה", prompt_fr:"Hier, j'ai essayé une nouvelle recette : une tarte aux courgettes. Le résultat était délicieux et mes amis ont adoré. Je vous donne la recette en bas de l'article.", trans_he:"אתמול ניסיתי מתכון חדש: פאי קישואים. התוצאה הייתה טעימה ואחיי אהבו. אני נותן לכם את המתכון בתחתית הכתבה.", question_fr:"Où peut-on trouver la recette ?", q_he:"איפה אפשר למצוא את המתכון?", options:["En début d'article","En bas de l'article","Sur un autre site"], correct:1, explanation_he:"« Je vous donne la recette en bas de l'article »." },
    ],
    [ /* 2 — Publicités */
      { instruction_he:"קרא וענה", prompt_fr:"Nouvelle voiture électrique NOVA : 500 km d'autonomie, charge en 30 minutes, à partir de 29 000€. Révolutionnez vos déplacements.", trans_he:"מכונית חשמלית חדשה NOVA: 500 ק\"מ טווח, טעינה ב-30 דקות, מ-29,000 יורו. שנו את הנסיעות שלכם.", question_fr:"Combien de temps dure la charge ?", q_he:"כמה זמן לוקחת הטעינה?", options:["15 minutes","30 minutes","1 heure"], correct:1, explanation_he:"« charge en 30 minutes »." },
      { instruction_he:"קרא וענה", prompt_fr:"Abonnez-vous à notre magazine pendant 6 mois et recevez le 7e mois gratuit ! Offre valable jusqu'au 31 décembre.", trans_he:"הירשמו למגזין שלנו ל-6 חודשים וקבלו את החודש השביעי חינם! ההצעה תקפה עד 31 בדצמבר.", question_fr:"Quel est l'avantage de cette offre ?", q_he:"מה היתרון של ההצעה הזו?", options:["Un mois gratuit","Deux mois gratuits","La livraison gratuite"], correct:0, explanation_he:"« recevez le 7e mois gratuit » = חודש 7 חינם." },
      { instruction_he:"קרא וענה", prompt_fr:"Les réseaux sociaux permettent de rester en contact avec ses proches, mais une utilisation excessive peut nuire à la concentration et au sommeil.", trans_he:"הרשתות החברתיות מאפשרות להישאר בקשר, אך שימוש מופרז עלול לפגוע בריכוז ובשינה.", question_fr:"Quel risque le texte mentionne-t-il ?", q_he:"איזה סיכון מזכיר הטקסט?", options:["Une meilleure concentration","Des troubles du sommeil","Une perte de contacts"], correct:1, explanation_he:"« peut nuire à la concentration et au sommeil »." },
    ],
    [ /* 3 — Interviews */
      { instruction_he:"קרא וענה", prompt_fr:"— Comment êtes-vous devenu chef cuisinier ?\n— Tout a commencé dans la cuisine de ma grand-mère. J'avais dix ans et elle m'apprenait ses recettes.", trans_he:"— איך הפכתם לשף?\n— הכל התחיל במטבח של סבתא שלי. הייתי בן עשר והיא לימדה אותי את המתכונים שלה.", question_fr:"Où la passion du chef a-t-elle commencé ?", q_he:"איפה התחיל התשוקה של השף?", options:["Dans une école de cuisine","Dans la cuisine de sa grand-mère","Dans un restaurant célèbre"], correct:1, explanation_he:"« Tout a commencé dans la cuisine de ma grand-mère »." },
      { instruction_he:"קרא וענה", prompt_fr:"— Quel est votre conseil pour les jeunes qui veulent travailler dans l'éducation ?\n— Soyez patient. Les résultats prennent du temps, mais la satisfaction de voir un élève progresser est incomparable.", trans_he:"— מה העצה שלכם לצעירים שרוצים לעבוד בחינוך?\n— היו סבלניים. התוצאות לוקחות זמן, אבל הסיפוק מלראות תלמיד מתקדם אין לו תחליף.", question_fr:"Quel est le conseil principal de la personne interviewée ?", q_he:"מה העצה העיקרית של הנסכח?", options:["Travailler beaucoup d'heures","Être patient","Changer d'école souvent"], correct:1, explanation_he:"« Soyez patient » = היו סבלניים." },
      { instruction_he:"קרא וענה", prompt_fr:"— Vous avez publié votre premier roman à 65 ans. Pourquoi si tard ?\n— J'ai toujours voulu écrire, mais la vie professionnelle ne me laissait pas le temps.", trans_he:"— פרסמתם את הרומן הראשון שלכם בגיל 65. למה כל כך מאוחר?\n— תמיד רציתי לכתוב, אבל חיי המקצועיים לא הותירו לי זמן.", question_fr:"Pourquoi l'auteur n'a-t-il pas écrit plus tôt ?", q_he:"למה הסופר לא כתב מוקדם יותר?", options:["Il n'aimait pas écrire","Sa vie professionnelle ne lui laissait pas le temps","Il manquait d'inspiration"], correct:1, explanation_he:"« la vie professionnelle ne me laissait pas le temps »." },
    ],
    [ /* 4 — Critiques */
      { instruction_he:"קרא וענה", prompt_fr:"« Si le livre numérique a séduit de nombreux lecteurs par sa praticité, le livre papier conserve un charme que beaucoup ne sont pas prêts à abandonner. »", trans_he:"אם הספר הדיגיטלי כבש קוראים בזכות הנוחות, הספר המודפס שומר על קסם שרבים לא מוכנים לוותר עליו.", question_fr:"Que dit le texte sur le livre papier ?", q_he:"מה אומר הטקסט על הספר המודפס?", options:["Il a complètement disparu","Il garde un charme apprécié","Il est plus pratique que le numérique"], correct:1, explanation_he:"« conserve un charme que beaucoup ne sont pas prêts à abandonner »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Malgré un accueil critique mitigé, le dernier film du réalisateur a rencontré un franc succès auprès du public, dépassant le million d'entrées en une semaine. »", trans_he:"למרות קבלת פנים ביקורתית מעורבת, הסרט האחרון זכה להצלחה גדולה בקרב הקהל, ועבר מיליון צופים בשבוע.", question_fr:"Comment le film a-t-il été reçu ?", q_he:"כיצד התקבל הסרט?", options:["Aimé par la critique mais ignoré du public","Critiqué mais très populaire auprès du public","Un échec total"], correct:1, explanation_he:"« accueil critique mitigé » + « franc succès auprès du public »." },
      { instruction_he:"קרא וענה", prompt_fr:"Ce roman est à la fois touchant et décevant. L'auteur crée des personnages attachants, mais l'intrigue perd de sa vigueur dans la deuxième moitié.", trans_he:"הרומן הזה מרגש ומאכזב בו-זמנית. הסופר יוצר דמויות מרתקות, אך העלילה מאבדת מכוחה במחצית השנייה.", question_fr:"Quel est le défaut du roman selon le critique ?", q_he:"מה החיסרון של הרומן לפי המבקר?", options:["Les personnages sont peu intéressants","L'intrigue s'affaiblit dans la deuxième moitié","Le style est trop complexe"], correct:1, explanation_he:"« l'intrigue perd de sa vigueur dans la deuxième moitié »." },
    ],
    [ /* 5 — Reportages */
      { instruction_he:"קרא וענה", prompt_fr:"« Pour désengorger le centre-ville, la municipalité encourage l'usage du vélo en multipliant les pistes cyclables. »", trans_he:"כדי לפנות את הגודש במרכז העיר, העירייה מעודדת שימוש באופניים על ידי הרבטת שבילי אופניים.", question_fr:"Quel est l'objectif de la municipalité ?", q_he:"מה המטרה של העירייה?", options:["Augmenter le trafic automobile","Réduire l'encombrement du centre-ville","Interdire totalement les voitures"], correct:1, explanation_he:"« désengorger le centre-ville » = להקל על הגודש." },
      { instruction_he:"קרא וענה", prompt_fr:"Dans certaines régions de France, des producteurs locaux ont créé des marchés alternatifs pour vendre directement leurs produits aux consommateurs, sans intermédiaire.", trans_he:"באזורים מסוימים בצרפת, יצרנים מקומיים יצרו שווקים חלופיים למכירה ישירה לצרכנים ללא מתווכים.", question_fr:"Quel est l'avantage de ces marchés ?", q_he:"מה היתרון של השווקים האלה?", options:["Ils sont réservés aux touristes","Ils permettent une vente directe sans intermédiaire","Ils sont moins chers que les supermarchés"], correct:1, explanation_he:"« vendre directement aux consommateurs, sans intermédiaire »." },
      { instruction_he:"קרא וענה", prompt_fr:"Un rapport récent montre que la France est l'un des pays d'Europe où l'on travaille le moins d'heures par semaine, grâce aux 35 heures légales.", trans_he:"דוח עדכני מראה שצרפת היא מהמדינות באירופה שבהן עובדים הכי מעט שעות בשבוע, הודות לחוק 35 השעות.", question_fr:"À quoi est attribuée la faible durée de travail en France ?", q_he:"למה מיוחסות שעות העבודה הנמוכות בצרפת?", options:["Au manque de travail","Aux 35 heures légales","Au chômage élevé"], correct:1, explanation_he:"« grâce aux 35 heures légales » = הודות לחוק 35 השעות." },
    ],
  ],
  /* stations: Opinion · Événement · Description · Comparaison · Conseil · Récit */
  exp: [
    [ /* 0 — Opinion */
      { instruction_he:"הבע עמדה על הרשתות החברתיות", prompt_fr:"Selon toi, les réseaux sociaux rapprochent-ils ou éloignent-ils les gens ?", trans_he:"לדעתך, הרשתות החברתיות מקרבות או מרחיקות?", model_fr:"À mon avis, les réseaux sociaux rapprochent les gens qui sont loin, mais peuvent nous éloigner de ceux qui sont à côté. Tout dépend de l'utilisation.", keys_fr:["à mon avis","rapprocher","éloigner","tout dépend de"], tip_he:"D'un côté… de l'autre… · À mon avis · Je pense que · Tout dépend de." },
      { instruction_he:"הבע עמדה על הסביבה", prompt_fr:"Penses-tu que les individus peuvent vraiment aider l'environnement ?", trans_he:"לדעתך, האם אנשים יכולים באמת לעזור לסביבה?", model_fr:"Je pense que oui, les gestes quotidiens comptent : recycler, prendre les transports en commun, réduire sa consommation. Mais les entreprises ont une part de responsabilité plus grande.", keys_fr:["je pense que","les gestes quotidiens","mais","une part de responsabilité"], tip_he:"Je pense que · certes (כמובן) · mais · cependant (עם זאת)." },
      { instruction_he:"הבע עמדה על הטכנולוגיה", prompt_fr:"La technologie améliore-t-elle notre vie quotidienne ?", trans_he:"האם הטכנולוגיה משפרת את חיינו היומיומיים?", model_fr:"En général, je dirais que oui. La technologie nous facilite la vie, mais elle peut aussi créer une dépendance. Il faut l'utiliser de façon raisonnée.", keys_fr:["en général","je dirais que","mais","une dépendance","de façon raisonnée"], tip_he:"en général · il faut + infinitif · de façon raisonnée = בצורה מחושבת." },
    ],
    [ /* 1 — Événement */
      { instruction_he:"ספר על סוף שבוע שהשאיר רושם", prompt_fr:"Raconte un week-end qui t'a marqué.", trans_he:"ספר על סוף שבוע שהשאיר בך רושם.", model_fr:"Le week-end dernier, je suis allé à la montagne avec des amis. Il faisait magnifique et nous avons fait une longue randonnée. Le soir, nous étions épuisés mais heureux.", keys_fr:["le week-end dernier","je suis allé","il faisait","nous avons fait","nous étions"], tip_he:"PC לפעולות + imparfait לרקע: il faisait beau · nous étions fatigués." },
      { instruction_he:"ספר על ארוע שחווית", prompt_fr:"Décris un événement récent qui t'a touché ou surpris.", trans_he:"תאר ארוע עדכני שנגע בך או הפתיע אותך.", model_fr:"La semaine dernière, j'ai assisté à un concert de jazz. Je ne m'attendais pas à apprécier autant. L'ambiance était fantastique et les musiciens étaient incroyables.", keys_fr:["j'ai assisté à","je ne m'attendais pas","l'ambiance était","incroyables"], tip_he:"je ne m'attendais pas = לא ציפיתי. l'ambiance = האווירה." },
      { instruction_he:"ספר על חגיגה משפחתית", prompt_fr:"Décris une fête familiale récente.", trans_he:"תאר חגיגה משפחתית שהתקיימה לאחרונה.", model_fr:"Le mois dernier, nous avons fêté l'anniversaire de ma grand-mère. Toute la famille s'était réunie. On a mangé, dansé et ri toute la soirée.", keys_fr:["nous avons fêté","toute la famille","s'était réunie","on a mangé","toute la soirée"], tip_he:"on a = nous avons (יומיומי) · toute la soirée = כל הערב." },
    ],
    [ /* 2 — Description */
      { instruction_he:"תאר אדם שאתה מכיר", prompt_fr:"Décris une personne que tu admires. Son apparence et sa personnalité.", trans_he:"תאר אדם שאתה מעריך. מראהו ואישיותו.", model_fr:"J'admire beaucoup mon professeur de musique. Il est grand et élégant, avec des cheveux grisonnants. C'est un homme patient et passionné.", keys_fr:["j'admire","il est","avec des cheveux","c'est un homme","passionné"], tip_he:"apparence: grand/e · brun/e · élégant/e · personnalité: patient/e · généreux/se." },
      { instruction_he:"תאר מקום אהוב", prompt_fr:"Décris un endroit que tu aimes particulièrement.", trans_he:"תאר מקום שאתה אוהב במיוחד.", model_fr:"J'adore la plage de Bat Yam. C'est un endroit calme avec une belle vue sur la mer. Le soir, on peut voir le coucher de soleil, c'est magnifique.", keys_fr:["j'adore","c'est un endroit","avec une belle vue","le soir","magnifique"], tip_he:"avec + description · c'est un endroit où... · on peut y + verb." },
      { instruction_he:"תאר את המנה האהובה עליך", prompt_fr:"Décris ton plat préféré et explique pourquoi tu l'aimes.", trans_he:"תאר את המנה האהובה עליך.", model_fr:"Mon plat préféré, c'est les pâtes à la carbonara. C'est à la fois simple et réconfortant. De plus, ça me rappelle un voyage en Italie.", keys_fr:["mon plat préféré","à la fois","de plus","ça me rappelle"], tip_he:"à la fois... et... · de plus · parce que · ça me rappelle." },
    ],
    [ /* 3 — Comparaison */
      { instruction_he:"השווה שתי ערים", prompt_fr:"Compare deux villes que tu connais.", trans_he:"השווה בין שתי ערים שאתה מכיר.", model_fr:"Tel Aviv est plus moderne et plus animée que Jérusalem. Mais Jérusalem est plus historique et plus calme. Les deux ont leur charme particulier.", keys_fr:["plus ... que","mais","les deux","leur charme"], tip_he:"plus...que · moins...que · aussi...que · les deux (שתיהן)." },
      { instruction_he:"השווה שתי אפשרויות", prompt_fr:"Est-il mieux de travailler en équipe ou seul ? Compare les deux.", trans_he:"מה עדיף: לעבוד בצוות או לבד? השווה.", model_fr:"Travailler en équipe permet de partager les idées et de s'entraider. Travailler seul est plus tranquille et permet de se concentrer. Personnellement, je préfère une combinaison des deux.", keys_fr:["permet de","travailler seul","personnellement","je préfère"], tip_he:"permet de + inf · d'un côté... de l'autre · personnellement." },
      { instruction_he:"השווה שני סגנונות חיים", prompt_fr:"Comparez la vie à la campagne et la vie en ville.", trans_he:"השווה בין חיים בכפר לחיים בעיר.", model_fr:"La vie en ville est pratique : tout est proche. Mais c'est aussi plus stressant et plus bruyant. La campagne est plus calme et plus verte, mais on y manque de services.", keys_fr:["la vie en ville est","mais","la campagne","on y manque de"], tip_he:"pratique (נוח) · stressant (מלחיץ) · manquer de (חסר)." },
    ],
    [ /* 4 — Conseil */
      { instruction_he:"תן עצה לתלמיד חדש", prompt_fr:"Quels conseils donnerais-tu à un élève qui commence le lycée ?", trans_he:"אילו עצות היית נותן לתלמיד שמתחיל תיכון?", model_fr:"Je lui conseillerais de s'organiser dès le début et de ne pas remettre au lendemain. Il devrait aussi participer en classe et ne pas hésiter à poser des questions.", keys_fr:["je lui conseillerais de","s'organiser","ne pas remettre","participer","ne pas hésiter"], tip_he:"je te conseille de + inf · tu devrais + inf · il faut que tu + subj." },
      { instruction_he:"תן עצה בריאותית", prompt_fr:"Quels conseils donnerais-tu à quelqu'un qui veut être en meilleure santé ?", trans_he:"אילו עצות היית נותן למישהו שרוצה להיות בריא יותר?", model_fr:"Je lui conseillerais d'abord de faire du sport régulièrement, même 30 minutes par jour. Ensuite, il faudrait réduire le sucre et dormir suffisamment.", keys_fr:["je lui conseillerais","régulièrement","il faudrait","réduire","suffisamment"], tip_he:"régulièrement = באופן סדיר · réduire = להפחית · suffisamment = מספיק." },
      { instruction_he:"תן עצה לנסיעה", prompt_fr:"Quels conseils donnerais-tu à quelqu'un qui visite Paris pour la première fois ?", trans_he:"אילו עצות היית נותן למי שמבקר בפריז בפעם הראשונה?", model_fr:"Je lui conseille de prendre le métro plutôt que le taxi. Il devrait aussi visiter les quartiers moins touristiques comme Montmartre ou le Marais.", keys_fr:["je lui conseille de","plutôt que","il devrait","les quartiers"], tip_he:"je conseille de + inf · plutôt que (במקום) · il devrait (הוא צריך)." },
    ],
    [ /* 5 — Récit */
      { instruction_he:"ספר סיפור בעבר", prompt_fr:"Raconte une aventure ou une anecdote amusante.", trans_he:"ספר הרפתקה או סיפור מצחיק.", model_fr:"Un jour, je me suis perdu dans un quartier inconnu de Paris. Je ne parlais pas français à l'époque. Finalement, un passant m'a aidé avec des gestes.", keys_fr:["un jour","je me suis perdu","je ne parlais pas","finalement","m'a aidé"], tip_he:"un jour (יום אחד) · finalement (לבסוף) · à l'époque (באותה תקופה)." },
      { instruction_he:"ספר על רגע מיוחד", prompt_fr:"Raconte un moment important de ta vie.", trans_he:"ספר על רגע חשוב בחייך.", model_fr:"Le moment le plus important de ma vie a été quand j'ai réussi mon baccalauréat. J'avais travaillé dur pendant des mois et quand j'ai vu les résultats, j'ai pleuré de joie.", keys_fr:["le moment le plus important","j'ai réussi","j'avais travaillé","quand j'ai vu","j'ai pleuré de joie"], tip_he:"plus-que-parfait pour l'arrière-plan: j'avais travaillé · j'avais préparé." },
      { instruction_he:"ספר על חוויה בחו\"ל", prompt_fr:"Raconte une expérience à l'étranger.", trans_he:"ספר על חוויה בחו\"ל.", model_fr:"L'été dernier, je suis allé en France pour la première fois. Tout me semblait différent : la nourriture, le rythme de vie, la façon de parler. J'ai adoré cette expérience.", keys_fr:["l'été dernier","pour la première fois","tout me semblait","la façon de","j'ai adoré"], tip_he:"tout me semblait (הכל נראה לי) · la façon de + inf · pour la première fois." },
    ],
  ],
};

const BANK_C2 = {
  /* stations: Passif · Participe composé · Ne explétif · Quoi que… · Hypothèses · Style littéraire */
  gra: [
    [ /* 0 — Passif */
      { instruction_he:"פאסיף: présent", prompt_fr:"Cette chanson ____ (chanter) par des millions de personnes.", trans_he:"השיר הזה נשר על ידי מיליוני אנשים.", accepted:["est chantée","a été chantée"], solution_fr:"Cette chanson est chantée par des millions de personnes.", explanation_he:"פאסיף = être + participe passé. chanson נקבה → chantée.", tip_he:"פאסיף: sujet + être + participe passé + par + agent." },
      { instruction_he:"פאסיף: passé composé", prompt_fr:"Le rapport ____ (rédiger) par l'équipe hier.", trans_he:"הדוח נכתב על ידי הצוות אתמול.", accepted:["a été rédigé"], solution_fr:"Le rapport a été rédigé par l'équipe hier.", explanation_he:"פאסיף בעבר: avoir + été + participe passé. rapport זכר → rédigé.", tip_he:"passé composé passif: a été + participe." },
      { instruction_he:"פאסיף: futur simple", prompt_fr:"Les résultats ____ (annoncer) demain.", trans_he:"התוצאות יוכרזו מחר.", accepted:["seront annoncés","seront annoncées"], solution_fr:"Les résultats seront annoncés demain.", explanation_he:"פאסיף עתיד: seront + participe. résultats זכר רבים → annoncés.", tip_he:"futur passif: sera/seront + participe passé." },
    ],
    [ /* 1 — Participe composé (ayant/étant + participe) */
      { instruction_he:"participe passé composé: ayant", prompt_fr:"____ (finir) son discours, il a quitté la salle.", trans_he:"לאחר שסיים את נאומו, עזב את האולם.", accepted:["Ayant fini"], solution_fr:"Ayant fini son discours, il a quitté la salle.", explanation_he:"participe passé composé = ayant/étant + participe passé. מבטא פעולה שקדמה.", tip_he:"Ayant terminé (לאחר שסיים) · Étant arrivé (לאחר שהגיע)." },
      { instruction_he:"participe passé composé: étant", prompt_fr:"____ (arriver) en avance, elle a pu choisir sa place.", trans_he:"לאחר שהגיעה מוקדם, הצליחה לבחור את מקומה.", accepted:["Étant arrivée","Etant arrivée"], solution_fr:"Étant arrivée en avance, elle a pu choisir sa place.", explanation_he:"verbe d'état/mouvement → étant + participe. elle → arrivée (נקבה).", tip_he:"Étant parti · Étant arrivé · S'étant levé — עם être." },
      { instruction_he:"participe présent vs participe passé composé", prompt_fr:"____ (lire) la lettre, il a compris la situation.", trans_he:"לאחר שקרא את המכתב, הבין את המצב.", accepted:["Ayant lu"], solution_fr:"Ayant lu la lettre, il a compris la situation.", explanation_he:"participe passé composé לפעולה שקדמה לפעולה אחרת: ayant lu.", tip_he:"Lisant (בו-זמני) vs Ayant lu (קדמה לפעולה)." },
    ],
    [ /* 2 — Ne explétif */
      { instruction_he:"ne explétif: avant que", prompt_fr:"Partons avant qu'il ne ____ (pleuvoir).", trans_he:"נצא לפני שירד גשם.", accepted:["pleuve"], solution_fr:"Partons avant qu'il ne pleuve.", explanation_he:"avant que + subjonctif. ה-ne explétif הוא מנומס/ספרותי — לא שלילה.", tip_he:"ne explétif אחרי avant que, à moins que, de peur que — לא משמעות שלילית." },
      { instruction_he:"ne explétif: de peur que", prompt_fr:"Il chuchote de peur qu'on ne l'____ (entendre).", trans_he:"הוא לוחש מחשש שישמעו אותו.", accepted:["entende"], solution_fr:"Il chuchote de peur qu'on ne l'entende.", explanation_he:"de peur que גורר subjonctif + ne explétif. entendre → entende.", tip_he:"de peur que · craindre que → ne explétif + subjonctif." },
      { instruction_he:"ne explétif: à moins que", prompt_fr:"Je viendrai à moins qu'il ne ____ (être) trop tard.", trans_he:"אבוא אלא אם יהיה מאוחר מדי.", accepted:["soit"], solution_fr:"Je viendrai à moins qu'il ne soit trop tard.", explanation_he:"à moins que = אלא אם. subjonctif + ne explétif. être → soit.", tip_he:"à moins que ne → subjonctif. לא שלילה אמיתית!" },
    ],
    [ /* 3 — Quoi que… / Qui que… / Où que… */
      { instruction_he:"quoi que + subjonctif", prompt_fr:"Quoi qu'il ____ (faire), il ne réussira pas à nous tromper.", trans_he:"יהיה מה שיהיה, הוא לא יצליח לרמות אותנו.", accepted:["fasse"], solution_fr:"Quoi qu'il fasse, il ne réussira pas à nous tromper.", explanation_he:"quoi que = יהיה מה שיהיה, תמיד עם subjonctif. faire → fasse.", tip_he:"quoi que · qui que · où que — כולם עם subjonctif." },
      { instruction_he:"où que + subjonctif", prompt_fr:"Où qu'il ____ (aller), il emporte ses livres.", trans_he:"לאן שילך, הוא לוקח את ספריו.", accepted:["aille"], solution_fr:"Où qu'il aille, il emporte ses livres.", explanation_he:"où que = לאן שהוא. aller → aille (subjonctif irrégulier).", tip_he:"aller au subjonctif: j'aille · tu ailles · il aille." },
      { instruction_he:"qui que + subjonctif", prompt_fr:"Qui que tu ____ (être), tu mérites le respect.", trans_he:"מי שאתה תהיה, אתה ראוי לכבוד.", accepted:["sois"], solution_fr:"Qui que tu sois, tu mérites le respect.", explanation_he:"qui que = מי שהוא. être → sois (subjonctif).", tip_he:"qui que vous soyez · quoi qu'il en soit = כך או כך." },
    ],
    [ /* 4 — Hypothèses complexes */
      { instruction_he:"Si + PQP → conditionnel passé", prompt_fr:"S'il avait plu, nous ____ (rester) à la maison.", trans_he:"אילו ירד גשם, היינו נשארים בבית.", accepted:["serions restés","serions restées"], solution_fr:"S'il avait plu, nous serions restés à la maison.", explanation_he:"היפוך בעבר: Si + plus-que-parfait → conditionnel passé. rester עם être.", tip_he:"Si + avait/était → conditionnel passé (aurait/serait + participe)." },
      { instruction_he:"Si + PQP → conditionnel présent (conséquence actuelle)", prompt_fr:"Si j'avais étudié le droit, je ____ (être) avocat aujourd'hui.", trans_he:"אלו למדתי משפטים, הייתי עורך דין היום.", accepted:["serais"], solution_fr:"Si j'avais étudié le droit, je serais avocat aujourd'hui.", explanation_he:"תנאי עבר עם תוצאה בהווה: Si + PQP → conditionnel présent.", tip_he:"Si + avait fait → serait (today) — תוצאה בהווה של תנאי עבר." },
      { instruction_he:"Hypothèse avec sans / avec", prompt_fr:"Sans ton aide, je n'____ pas réussi.", trans_he:"בלי עזרתך, לא הייתי מצליח.", accepted:["aurais"], solution_fr:"Sans ton aide, je n'aurais pas réussi.", explanation_he:"sans + שם עצם ← conditionnel passé. תחליף ל-si + PQP.", tip_he:"sans toi, j'aurais… · avec plus de temps, j'aurais…" },
    ],
    [ /* 5 — Style littéraire / avancé */
      { instruction_he:"style littéraire: inversion du sujet", prompt_fr:"Peut-____ faut-il reconsidérer cette approche.", trans_he:"אולי צריך לשקול מחדש גישה זו.", accepted:["être"], solution_fr:"Peut-être faut-il reconsidérer cette approche.", explanation_he:"peut-être en début de phrase → inversion du sujet: faut-il (לא il faut).", tip_he:"peut-être + inversion: faut-il · est-ce · doit-on." },
      { instruction_he:"ביטוי ספרותי: souligner", prompt_fr:"L'auteur ____ l'importance du dialogue dans son œuvre.", trans_he:"הסופר מדגיש את חשיבות הדיאלוג ביצירתו.", accepted:["souligne","met en relief","accentue"], solution_fr:"souligne / met en relief", explanation_he:"souligner = להדגיש (ספרותי). mettre en relief = להבליט.", tip_he:"souligner · mettre en relief · accentuer · insister sur." },
      { instruction_he:"style littéraire: remarquable", prompt_fr:"C'est un phénomène ____ dans la littérature contemporaine.", trans_he:"זוהי תופעה בולטת בספרות העכשווית.", accepted:["remarquable","notable","prépondérant","saillant"], solution_fr:"remarquable", explanation_he:"remarquable = ראוי לציון, בולט. notable = חשוב. prépondérant = דומיננטי.", tip_he:"remarquable · prépondérant · incontournable · emblématique · paradigmatique." },
    ],
  ],
  /* stations: Diversité · Philosophie · Rhétorique · Littéraire · Académique · Épistémologie */
  voc: [
    [ /* 0 — Diversité */
      { instruction_he:"גיוון תרבותי", prompt_fr:"La ____ des cultures enrichit notre société.", trans_he:"הגיוון של התרבויות מעשיר את החברה שלנו.", accepted:["diversité"], solution_fr:"la diversité", explanation_he:"diversité = גיוון. pluralité = ריבוי. hétérogénéité = הטרוגניות.", tip_he:"diversité · pluralité · singularité · homogénéité." },
      { instruction_he:"הכללה / אחידות", prompt_fr:"Ce mouvement prône l'____ sociale.", trans_he:"התנועה הזו תומכת בכלילה חברתית.", accepted:["inclusion","intégration"], solution_fr:"l'inclusion / l'intégration", explanation_he:"inclusion = כלילה (מקבל שונות). intégration = שילוב. assimilation = התבוללות.", tip_he:"inclusion · intégration · assimilation · exclusion (הדרה)." },
      { instruction_he:"ביטוי: ריבוי", prompt_fr:"La ____ des points de vue est une richesse.", trans_he:"ריבוי נקודות המבט הוא עושר.", accepted:["pluralité","diversité","multiplicité"], solution_fr:"la pluralité", explanation_he:"pluralité = ריבוי (פילוסופי/ספרותי). diversité = גיוון (יומיומי).", tip_he:"pluralité · multiplicité · hétérogénéité · singularité." },
    ],
    [ /* 1 — Philosophie */
      { instruction_he:"נובע מזה", prompt_fr:"Il ____ de cette décision une profonde injustice.", trans_he:"מהחלטה זו נובעת עוולה עמוקה.", accepted:["ressort","résulte","découle"], solution_fr:"il ressort / il résulte / il découle", explanation_he:"il ressort de = משתמע מ-. il résulte de = נובע מ-.", tip_he:"il s'ensuit que · il en résulte que · il ressort de cela que." },
      { instruction_he:"הנחת מוצא", prompt_fr:"Ce raisonnement repose sur une ____ erronée.", trans_he:"הנימוק מבוסס על הנחת מוצא שגויה.", accepted:["prémisse","présupposition","postulat"], solution_fr:"prémisse / postulat", explanation_he:"prémisse = הנחת יסוד (בהגיון). postulat = אקסיומה.", tip_he:"prémisse · postulat · présupposé · axiome · paradigme." },
      { instruction_he:"להתעמק", prompt_fr:"Il convient d'____ cette question.", trans_he:"ראוי להתעמק בשאלה זו.", accepted:["approfondir","creuser"], solution_fr:"approfondir", explanation_he:"approfondir = להעמיק. creuser = לחפור/לחקור לעומק.", tip_he:"approfondir · élucider (להבהיר) · décortiquer (לפרק לגורמים)." },
    ],
    [ /* 2 — Rhétorique */
      { instruction_he:"ביטוי רטורי: להדגיש", prompt_fr:"L'orateur ____ ce point essentiel à plusieurs reprises.", trans_he:"הנואם הדגיש את הנקודה החיונית הזו מספר פעמים.", accepted:["souligne","martèle","insiste sur"], solution_fr:"souligne / martèle", explanation_he:"marteler = לפטיש, לחזור שוב ושוב. souligner = להדגיש.", tip_he:"souligner · marteler · mettre en exergue (להבליט)." },
      { instruction_he:"שאלה רטורית", prompt_fr:"Peut-on vraiment parler de progrès sans parler d'____ ?", trans_he:"האם ניתן לדבר על קדמה בלי לדבר על שוויון?", accepted:["égalité","équité"], solution_fr:"égalité / équité", explanation_he:"égalité = שוויון (מידה). équité = הוגנות (מחשבה). שאלה רטורית = שאלה ללא ציפייה לתשובה.", tip_he:"l'égalité (שוויון) · l'équité (הוגנות) · la justice · la liberté." },
      { instruction_he:"concession רטורית", prompt_fr:"____ que cette théorie soit séduisante, elle comporte des limites.", trans_he:"למרות שהתיאוריה הזו מפתה, יש לה מגבלות.", accepted:["Si","Bien","Certes"], solution_fr:"Si (= même si) / Certes", explanation_he:"concession: Si séduisante que soit… · certes… mais… · il est vrai que…", tip_he:"certes (כמובן ש-) · il est vrai que · si ... que ... soit." },
    ],
    [ /* 3 — Littéraire */
      { instruction_he:"מרפסת משקיפה", prompt_fr:"Ce balcon ____ sur la mer.", trans_he:"המרפסת הזו משקיפה על הים.", accepted:["donne","s'ouvre","domine"], solution_fr:"donne sur", explanation_he:"donner sur = להשקיף על. la fenêtre donne sur la rue.", tip_he:"donner sur · faire face à · surplomber (להשקיף על מגובה)." },
      { instruction_he:"תיאור ספרותי: אטמוספרה", prompt_fr:"Une atmosphère ____ régnait sur la ville.", trans_he:"אווירה מאיימת שלטה על העיר.", accepted:["menaçante","lourde","oppressante","sinistre"], solution_fr:"menaçante / oppressante", explanation_he:"menaçante = מאיימת. oppressante = מעיקה. sinistre = מוזר ומאיים.", tip_he:"atmosphère + adj: lourde · pesante · menaçante · sereine (שלווה)." },
      { instruction_he:"פיגורה: personification", prompt_fr:"La nuit ____ ses étoiles sur la ville endormie.", trans_he:"הלילה פיזר את כוכביו על העיר הנרדמת.", accepted:["répand","étend","jette"], solution_fr:"répand / étend", explanation_he:"personification = ייחוס תכונות אנושיות. « la nuit étend » = הלילה פורש.", tip_he:"la nuit enveloppe · le vent murmure · la ville s'éveille." },
    ],
    [ /* 4 — Académique */
      { instruction_he:"ביטוי אקדמי: הצגת טיעון", prompt_fr:"Cet article ____ la thèse selon laquelle…", trans_he:"מאמר זה טוען את הטענה ש-…", accepted:["soutient","défend","avance","prétend"], solution_fr:"soutient / défend", explanation_he:"soutenir une thèse = לטעון טענה. défendre = להגן עליה. avancer = להציע.", tip_he:"soutenir · défendre · avancer · formuler (לנסח)." },
      { instruction_he:"ביטוי אקדמי: סיכום", prompt_fr:"En ____, on peut affirmer que…", trans_he:"לסיכום, ניתן לקבוע ש-…", accepted:["conclusion","somme","définitive"], solution_fr:"En conclusion / En somme / En définitive", explanation_he:"en conclusion = לסיכום. en somme = בסה\"כ. en définitive = בסופו של דבר.", tip_he:"en conclusion · en somme · bref · pour conclure · en définitive." },
      { instruction_he:"ביטוי אקדמי: ניגוד", prompt_fr:"____ les apparences, la situation est complexe.", trans_he:"למרות המראה החיצוני, המצב מורכב.", accepted:["Contrairement à","Malgré","Au-delà de"], solution_fr:"Contrairement aux apparences / Malgré les apparences", explanation_he:"contrairement à = בניגוד ל-. malgré = למרות. au-delà de = מעבר ל-.", tip_he:"contrairement à · malgré · nonobstant (ספרותי: למרות)." },
    ],
    [ /* 5 — Épistémologie */
      { instruction_he:"ידע / הכרה", prompt_fr:"La ____ est l'étude des fondements du savoir.", trans_he:"האפיסטמולוגיה היא חקר יסודות הידע.", accepted:["épistémologie","epistemologie"], solution_fr:"L'épistémologie", explanation_he:"épistémologie = תורת ההכרה/פילוסופיה של הידע. épistème = בסיס הידע.", tip_he:"épistémologie · ontologie (מהות) · phénoménologie (תיאור חוויה)." },
      { instruction_he:"ערעור ידע", prompt_fr:"Cette découverte ____ les certitudes établies.", trans_he:"הגילוי הזה מערער את הוודאויות המבוססות.", accepted:["remet en question","ébranle","remet en cause"], solution_fr:"remet en question / ébranle", explanation_he:"remettre en question = לערער. ébranler = לטלטל, לערער. invalider = לבטל.", tip_he:"remettre en question · ébranler · invalider · contredire (לסתור)." },
      { instruction_he:"פרדיגמה", prompt_fr:"Ce chercheur propose un changement de ____.", trans_he:"החוקר הזה מציע שינוי פרדיגמה.", accepted:["paradigme"], solution_fr:"paradigme", explanation_he:"paradigme = פרדיגמה (מסגרת תיאורטית שלטת). Thomas Kuhn הגדיר שינוי פרדיגמה.", tip_he:"un paradigme · un changement de paradigme · une rupture épistémologique." },
    ],
  ],
  /* stations: Philosophie · Littérature · Sociologie · Politique · Esthétique · Épistémologie */
  com: [
    [ /* 0 — Philosophie */
      { instruction_he:"קרא וענה", prompt_fr:"« L'essence même de la démocratie réside non dans l'unanimité des opinions, mais dans la capacité d'une société à tolérer, voire à valoriser, la divergence des points de vue. »", trans_he:"מהות הדמוקרטיה אינה בפה אחד, אלא ביכולת של חברה לסבול ואף להעריך שונות בדעות.", question_fr:"Selon ce texte, qu'est-ce qui caractérise une démocratie ?", q_he:"לפי הטקסט, מה מאפיין דמוקרטיה?", options:["L'accord unanime des citoyens","La tolérance envers la divergence des opinions","L'absence de tout débat politique"], correct:1, explanation_he:"« capacité à tolérer la divergence des points de vue »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Si la modernité a affranchi l'individu des contraintes collectives, elle l'a simultanément privé des cadres symboliques qui donnaient sens à son existence. Ce paradoxe fonde le malaise contemporain. »", trans_he:"אם המודרניות שחררה את הפרט, היא שללה ממנו את המסגרות הסמליות שנתנו משמעות לקיומו.", question_fr:"Quel est le paradoxe évoqué dans ce texte ?", q_he:"מהו הפרדוקס בטקסט?", options:["La liberté moderne crée à la fois émancipation et perte de sens","La modernité a renforcé les liens collectifs","Les contraintes collectives donnent un sens à la vie"], correct:0, explanation_he:"הפרדוקס: המודרניות שחררה (חיובי) אבל שללה את המסגרות הסמליות (שלילי)." },
      { instruction_he:"קרא וענה", prompt_fr:"« Le bonheur n'est pas un état mais un mouvement : il ne s'atteint pas, il se vit dans la quête elle-même. »", trans_he:"האושר אינו מצב אלא תנועה: הוא לא מושג, אלא חי בחיפוש עצמו.", question_fr:"Comment l'auteur définit-il le bonheur ?", q_he:"כיצד מגדיר הכותב את האושר?", options:["Comme un état stable à atteindre","Comme un processus vécu dans la recherche","Comme une illusion impossible"], correct:1, explanation_he:"« il se vit dans la quête elle-même » = חי בחיפוש עצמו." },
    ],
    [ /* 1 — Littérature */
      { instruction_he:"קרא וענה", prompt_fr:"« La traduction n'est jamais neutre : elle est toujours un acte d'interprétation, voire de création, car le traducteur ne transporte pas seulement des mots, mais des mondes. »", trans_he:"תרגום אינו ניטרלי: הוא תמיד מעשה פרשנות, ואף יצירה, כי המתרגם מעביר לא רק מילים אלא עולמות.", question_fr:"Selon l'auteur, que fait réellement le traducteur ?", q_he:"מה עושה המתרגם בפועל?", options:["Il copie des mots d'une langue à une autre","Il interprète et crée en transférant des univers culturels","Il reste strictement fidèle à l'original"], correct:1, explanation_he:"« acte d'interprétation, voire de création... transporte des mondes »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La littérature n'est pas un miroir du réel, mais un prisme qui le démultiplie, le déforme, le réinvente pour en révéler des vérités autrement inaccessibles. »", trans_he:"הספרות אינה מראה של המציאות, אלא פריזמה המכפילה, מעוותת ומחדשת אותה כדי לחשוף אמיתות אחרות.", question_fr:"Quelle est la fonction de la littérature selon ce texte ?", q_he:"מה תפקיד הספרות לפי הטקסט?", options:["Reproduire fidèlement la réalité","Révéler des vérités à travers une transformation du réel","Distraire le lecteur"], correct:1, explanation_he:"« réinvente pour en révéler des vérités autrement inaccessibles »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Lire, c'est habiter temporairement une autre conscience, s'ouvrir à des modes d'être que la vie quotidienne ne permettrait jamais d'explorer. »", trans_he:"לקרוא זה לשהות זמנית בתודעה אחרת, להיפתח לאופני קיום שהחיים היומיומיים לא יאפשרו לחקור.", question_fr:"Que représente la lecture selon l'auteur ?", q_he:"מה מייצגת הקריאה לפי הכותב?", options:["Une façon d'éviter la réalité","L'expérience temporaire d'une autre conscience","Un exercice purement intellectuel"], correct:1, explanation_he:"« habiter temporairement une autre conscience »." },
    ],
    [ /* 2 — Sociologie */
      { instruction_he:"קרא וענה", prompt_fr:"« Loin d'être un simple effet de mode, la consommation locale traduit une véritable prise de conscience écologique chez les jeunes générations. »", trans_he:"רחוק מלהיות סתם אופנה חולפת, הצריכה המקומית מבטאת מודעות אקולוגית אמיתית בקרב הדורות הצעירים.", question_fr:"Que pense l'auteur de la consommation locale ?", q_he:"מה דעת הכותב על צריכה מקומית?", options:["C'est une mode passagère","C'est le signe d'une vraie conscience écologique","C'est réservé aux personnes âgées"], correct:1, explanation_he:"« loin d'être un simple effet de mode » + « véritable prise de conscience »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La précarité économique ne se réduit pas à un manque d'argent : elle génère une instabilité cognitive qui affecte la prise de décision et reproduit les inégalités. »", trans_he:"חוסר יציבות כלכלי אינו מסתכם בחוסר כסף: הוא מייצר חוסר יציבות קוגניטיבי המשפיע על קבלת החלטות ומשכפל את האי-שוויון.", question_fr:"Quel effet la précarité a-t-elle selon le texte ?", q_he:"איזה השפעה יש לחוסר הביטחון?", options:["Elle renforce la prise de décision","Elle crée une instabilité cognitive qui perpétue les inégalités","Elle n'affecte que les finances"], correct:1, explanation_he:"« instabilité cognitive qui affecte la prise de décision et reproduit les inégalités »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Les sociétés contemporaines valorisent à la fois l'individualisme et la solidarité, créant une tension structurelle difficile à résoudre. »", trans_he:"החברות העכשוויות מעריכות גם אינדיבידואליזם וגם סולידריות, ויוצרות מתח מבני קשה לפתרון.", question_fr:"Quelle tension le texte identifie-t-il ?", q_he:"איזה מתח מזהה הטקסט?", options:["Entre liberté et sécurité","Entre individualisme et solidarité","Entre tradition et modernité"], correct:1, explanation_he:"« valorisent à la fois l'individualisme et la solidarité, créant une tension »." },
    ],
    [ /* 3 — Politique */
      { instruction_he:"קרא וענה", prompt_fr:"« Le populisme se nourrit du sentiment d'abandon des classes moyennes, exploitant la méfiance envers les élites pour proposer des solutions simplistes à des problèmes complexes. »", trans_he:"הפופוליזם ניזון מתחושת הנטישה של מעמד הביניים, ומנצל את חוסר האמון באליטות כדי להציע פתרונות פשטניים לבעיות מורכבות.", question_fr:"Comment le texte explique-t-il le populisme ?", q_he:"כיצד מסביר הטקסט את הפופוליזם?", options:["Comme une idéologie bien définie","Comme une exploitation du mécontentement populaire","Comme un système politique stable"], correct:1, explanation_he:"« exploitant la méfiance envers les élites pour proposer des solutions simplistes »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La démocratie délibérative suppose que la légitimité des décisions politiques découle non du vote seul, mais de la qualité du débat qui le précède. »", trans_he:"הדמוקרטיה הדיונית מניחה שלגיטימיות ההחלטות הפוליטיות נובעת לא רק מהצבעה, אלא מאיכות הדיון שקודם לה.", question_fr:"Qu'est-ce qui légitime une décision selon la démocratie délibérative ?", q_he:"מה מעניק לגיטימיות להחלטה?", options:["Le vote seul","La qualité du débat préalable","La décision des experts"], correct:1, explanation_he:"« légitimité découle... de la qualité du débat qui le précède »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La souveraineté nationale et l'intégration européenne créent une dialectique permanente entre identité et appartenance à un espace politique plus large. »", trans_he:"ריבונות לאומית והשתלבות אירופאית יוצרים דיאלקטיקה בין זהות ושייכות למרחב פוליטי רחב יותר.", question_fr:"Quelle tension le texte décrit-il ?", q_he:"איזה מתח מתאר הטקסט?", options:["Entre droite et gauche","Entre souveraineté nationale et intégration européenne","Entre tradition et révolution"], correct:1, explanation_he:"« souveraineté nationale et l'intégration européenne »." },
    ],
    [ /* 4 — Esthétique */
      { instruction_he:"קרא וענה", prompt_fr:"« L'art contemporain provoque souvent un sentiment d'incompréhension non par manque de talent de l'artiste, mais parce qu'il exige du spectateur une disposition à l'incertitude. »", trans_he:"האמנות העכשווית גורמת לעתים לתחושת אי-הבנה לא בגלל חוסר כישרון, אלא כי היא דורשת מהצופה נכונות לחוסר ודאות.", question_fr:"Pourquoi l'art contemporain est-il parfois incompris ?", q_he:"מדוע אמנות עכשווית לא מובנת לפעמים?", options:["À cause du manque de talent des artistes","Parce qu'il demande une tolérance à l'incertitude","Parce qu'il est trop traditionnel"], correct:1, explanation_he:"« exige du spectateur une disposition à l'incertitude »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Le beau ne réside pas dans l'objet, mais dans la relation dynamique entre l'œuvre et le regard qui la reçoit, selon les catégories culturelles du spectateur. »", trans_he:"היופי אינו טמון בחפץ, אלא בקשר הדינמי בין היצירה ובין המבט שמקבל אותה, בהתאם לקטגוריות התרבותיות של הצופה.", question_fr:"Où réside le beau selon ce texte ?", q_he:"איפה נמצא היופי לפי הטקסט?", options:["Dans l'objet lui-même","Dans la relation entre l'œuvre et le regard du spectateur","Dans les règles de l'art classique"], correct:1, explanation_he:"« dans la relation dynamique entre l'œuvre et le regard qui la reçoit »." },
      { instruction_he:"קרא וענה", prompt_fr:"« L'esthétique kantienne distingue le beau du sublime : si le beau apaise, le sublime confronte l'homme à ses propres limites face à l'infini. »", trans_he:"האסתטיקה הקאנטיאנית מבחינה בין יפה לנשגב: אם היפה מרגיע, הנשגב מעמת את האדם עם גבולותיו מול האינסוף.", question_fr:"Quelle est la différence entre le beau et le sublime selon Kant ?", q_he:"מה ההבדל בין יפה לנשגב לפי קאנט?", options:["Le beau est plus rare que le sublime","Le beau apaise, le sublime confronte à nos limites","Le sublime est plus simple à comprendre"], correct:1, explanation_he:"« le beau apaise, le sublime confronte l'homme à ses propres limites »." },
    ],
    [ /* 5 — Épistémologie */
      { instruction_he:"קרא וענה", prompt_fr:"« La science ne produit pas des vérités définitives, mais des modèles provisoires, constamment révisés à la lumière de nouvelles données. »", trans_he:"המדע אינו מייצר אמיתות סופיות, אלא מודלים זמניים, המתוקנים ללא הרף לאור נתונים חדשים.", question_fr:"Comment le texte décrit-il la science ?", q_he:"כיצד מתאר הטקסט את המדע?", options:["Comme une source de vérités définitives","Comme un ensemble de modèles provisoires et révisables","Comme une discipline figée"], correct:1, explanation_he:"« modèles provisoires, constamment révisés »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La notion de paradigme, telle que définie par Thomas Kuhn, désigne l'ensemble des présupposés théoriques et méthodologiques partagés par une communauté scientifique. »", trans_he:"מושג הפרדיגמה, כפי שהוגדר על ידי תומס קון, מציין את מכלול ההנחות התיאורטיות והמתודולוגיות שחולקת קהילה מדעית.", question_fr:"Que désigne le terme « paradigme » selon Kuhn ?", q_he:"מה מציין המונח «פרדיגמה» לפי קון?", options:["Une découverte scientifique majeure","L'ensemble des présupposés partagés d'une communauté scientifique","Un outil de mesure scientifique"], correct:1, explanation_he:"« l'ensemble des présupposés théoriques et méthodologiques partagés »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Le scepticisme épistémologique ne conduit pas au nihilisme, mais invite à une vigilance critique permanente face aux certitudes établies. »", trans_he:"הספקנות האפיסטמולוגית אינה מובילה לניהיליזם, אלא מזמינה לדריכות ביקורתית מתמדת מול הוודאויות המבוססות.", question_fr:"Quel est l'effet du scepticisme épistémologique selon le texte ?", q_he:"מה ההשפעה של הספקנות האפיסטמולוגית?", options:["Il mène au nihilisme","Il encourage une vigilance critique face aux certitudes","Il renforce les certitudes établies"], correct:1, explanation_he:"« invite à une vigilance critique permanente face aux certitudes établies »." },
    ],
  ],
  /* stations: Dissertation · Commentaire · Thèse/Antithèse · Analyse · Nuance · Maîtrise */
  exp: [
    [ /* 0 — Dissertation */
      { instruction_he:"מבנה dissertation: d'une part / d'autre part", prompt_fr:"Dans quelle mesure le progrès technique améliore-t-il la condition humaine ? Développez en deux paragraphes.", trans_he:"באיזו מידה ההתקדמות הטכנולוגית משפרת את המצב האנושי? פתחו בשני פסקאות.", model_fr:"D'une part, le progrès technique a indéniablement transformé nos conditions de vie. D'autre part, cette évolution soulève des interrogations quant à la déshumanisation des rapports sociaux.", keys_fr:["d'une part... d'autre part","indéniablement","soulève des interrogations","quant à"], tip_he:"d'une part... d'autre part · certes... cependant · il est vrai que... néanmoins." },
      { instruction_he:"dissertation: conclusion dialectique", prompt_fr:"La liberté est-elle compatible avec la loi ? Rédigez une conclusion en 3-4 phrases.", trans_he:"האם חופש מתיישב עם חוק? כתבו מסקנה ב-3-4 משפטים.", model_fr:"En somme, liberté et loi ne s'opposent pas fondamentalement. La loi, loin d'entraver la liberté, en est la condition même. Sans cadre juridique, la liberté de l'un empiéterait nécessairement sur celle d'autrui.", keys_fr:["en somme","ne s'opposent pas","loin d'","en est la condition","empiéterait"], tip_he:"en somme · loin de + inf · nécessairement · la condition même de." },
      { instruction_he:"dissertation: introduction — poser la problématique", prompt_fr:"Rédigez une introduction sur : « L'art peut-il changer le monde ? »", trans_he:"כתבו מבוא לנושא: «האם האמנות יכולה לשנות את העולם?»", model_fr:"De tout temps, l'art a été porteur de messages politiques et sociaux. Mais peut-il véritablement transformer la société ? C'est à cette question que nous tenterons de répondre.", keys_fr:["de tout temps","porteur de messages","véritablement","nous tenterons de répondre"], tip_he:"מבוא dissertation: context → question → annonce du plan." },
    ],
    [ /* 1 — Commentaire */
      { instruction_he:"פרשנות ציטוט: Camus", prompt_fr:"Commentez brièvement : « Je me révolte, donc nous sommes. » (Camus)", trans_he:"הגיבו בקצרה: «אני מורד, לכן אנחנו קיימים.» (קאמי)", model_fr:"Camus renverse le cogito cartésien pour affirmer que la révolte n'est pas individuelle, mais le fondement du lien social. En se révoltant, l'individu transcende son moi et crée une solidarité avec autrui.", keys_fr:["renverse","le cogito","la révolte","transcende","solidarité","autrui"], tip_he:"ניתוח ציטוט: מה הוא אומר? על מה הוא מתבסס? איזו השלכה יש לו?" },
      { instruction_he:"commentaire de texte: repérer le ton", prompt_fr:"Analysez le ton de ce passage : « La machine ne connaît ni pitié ni repos. Elle avance, implacable, vers l'horizon vide de tout sens humain. »", trans_he:"נתחו את הטון של הקטע הזה.", model_fr:"Le ton est pessimiste et même tragique. L'auteur personnifie la machine pour en faire une force hostile. La répétition sonore (« pitié », « implacable ») renforce la sensation d'inéluctabilité.", keys_fr:["pessimiste","personnifie","répétition","inéluctabilité"], tip_he:"repérer le ton: ironique · lyrique · pessimiste · critique · solennel." },
      { instruction_he:"commentaire: identifier la figure de style", prompt_fr:"Identifiez et expliquez la figure de style dans : « Le temps est un voleur silencieux. »", trans_he:"זהו והסבירו את הדמות הרטורית ב: «הזמן הוא גנב שקט.»", model_fr:"C'est une métaphore : le temps est comparé à un voleur sans utiliser « comme ». Cela suggère que le temps nous dérobe insensiblement notre vie, nos souvenirs, notre jeunesse.", keys_fr:["métaphore","comparé à","sans utiliser","dérobe insensiblement"], tip_he:"métaphore (ללא comme) · comparaison (עם comme) · personnification · oxymore." },
    ],
    [ /* 2 — Thèse/Antithèse */
      { instruction_he:"thèse: טיעון תומך", prompt_fr:"Formulez une thèse en faveur du travail à distance.", trans_he:"נסחו טענה בעד עבודה מרחוק.", model_fr:"Le télétravail favorise l'autonomie et réduit le temps de transport, permettant aux salariés de gagner en qualité de vie et en productivité.", keys_fr:["favorise","réduit","permettant","qualité de vie","productivité"], tip_he:"thèse: sujet + verbe fort + argument + exemple/conséquence." },
      { instruction_he:"antithèse: טיעון מנוגד", prompt_fr:"Formulez une antithèse contre le travail à distance.", trans_he:"נסחו טענה נגד עבודה מרחוק.", model_fr:"Cependant, le télétravail isole les employés, érode la cohésion d'équipe et brouille les frontières entre vie professionnelle et vie privée.", keys_fr:["cependant","isole","érode","brouille","frontières"], tip_he:"antithèse: cependant · en revanche · or · néanmoins + טיעון מנוגד." },
      { instruction_he:"synthèse: עמדה מאוזנת", prompt_fr:"Proposez une synthèse sur le travail à distance.", trans_he:"הציעו סינתזה על עבודה מרחוק.", model_fr:"En définitive, il convient d'adopter une approche hybride : le télétravail partiel préserve la flexibilité tout en maintenant le lien social indispensable au bien-être collectif.", keys_fr:["en définitive","il convient d'","hybride","tout en maintenant","indispensable"], tip_he:"synthèse: en définitive · au final · il convient de · une approche équilibrée." },
    ],
    [ /* 3 — Analyse */
      { instruction_he:"ניתוח: בינה מלאכותית — הזדמנות או איום?", prompt_fr:"L'intelligence artificielle représente-t-elle une menace ou une opportunité ? Nuancez.", trans_he:"האם בינה מלאכותית מהווה איום או הזדמנות? הדגישו גוונים.", model_fr:"Loin d'une opposition binaire, l'IA exige une lecture nuancée. Si ses applications médicales ouvrent des perspectives inédites, le risque d'instrumentalisation à des fins de surveillance demeure préoccupant.", keys_fr:["loin d'une opposition","exige une lecture nuancée","ouvrent des perspectives","demeure préoccupant"], tip_he:"il serait réducteur de · la réalité est plus complexe · il convient de distinguer." },
      { instruction_he:"ניתוח: השפעת הרשתות החברתיות", prompt_fr:"Analysez les effets des réseaux sociaux sur la démocratie.", trans_he:"נתחו את השפעות הרשתות החברתיות על הדמוקרטיה.", model_fr:"D'un côté, les réseaux sociaux facilitent la mobilisation citoyenne. De l'autre, ils favorisent la désinformation et les chambres d'écho, fragmentant l'espace public.", keys_fr:["d'un côté","de l'autre","facilitent","désinformation","chambres d'écho","fragmentant"], tip_he:"d'un côté · de l'autre · par ailleurs · en outre · cela étant." },
      { instruction_he:"ניתוח: מגבלות וסיכויים", prompt_fr:"Analysez les limites et opportunités de l'éducation en ligne.", trans_he:"נתחו את המגבלות וההזדמנויות של לימוד מקוון.", model_fr:"Si l'éducation en ligne offre une accessibilité accrue, elle présente des lacunes en termes d'interaction sociale et de suivi individualisé. Son potentiel reste néanmoins considérable.", keys_fr:["si","offre","présente des lacunes","en termes de","néanmoins"], tip_he:"si (= bien que) · présente des lacunes (יש לה חסרונות) · reste néanmoins." },
    ],
    [ /* 4 — Nuance */
      { instruction_he:"גוון עמדה: certes / mais", prompt_fr:"Nuancez cette affirmation : « La technologie détruit le lien social. »", trans_he:"גוונו את הטענה: «הטכנולוגיה הורסת את הקשר החברתי.»", model_fr:"Certes, les écrans peuvent substituer aux interactions réelles. Mais ils créent aussi de nouveaux liens entre personnes éloignées. Il serait réducteur de condamner la technologie sans distinguer ses usages.", keys_fr:["certes","mais","il serait réducteur de","sans distinguer"], tip_he:"certes... mais · il est vrai que... néanmoins · on peut admettre que... cependant." },
      { instruction_he:"גוון: להציג שני היבטים", prompt_fr:"Nuancez : « La mondialisation est une chance pour tous. »", trans_he:"גוונו: «הגלובליזציה היא הזדמנות לכולם.»", model_fr:"Si la mondialisation a permis à des millions de sortir de la pauvreté, elle a également creusé les inégalités au sein des sociétés et fragilisé les cultures locales.", keys_fr:["si ... a permis","elle a également","creusé les inégalités","fragilisé"], tip_he:"si + avantage → elle a également + désavantage. Ne pas oublier la nuance!" },
      { instruction_he:"גוון: הוספת פרספקטיבה", prompt_fr:"Ajoutez une nuance à : « Le travail manuel est moins valorisé que le travail intellectuel. »", trans_he:"הוסיפו גוון: «עבודה ידנית מוערכת פחות מעבודה אינטלקטואלית.»", model_fr:"Ce constat mérite d'être nuancé selon les époques et les cultures. Dans certaines sociétés, le savoir-faire artisanal est hautement respecté. La hiérarchie des métiers varie selon le contexte.", keys_fr:["mérite d'être nuancé","selon","savoir-faire artisanal","la hiérarchie varie"], tip_he:"mérite d'être nuancé · selon les contextes · il convient de distinguer · cela varie selon." },
    ],
    [ /* 5 — Maîtrise */
      { instruction_he:"שליטה: ביטוי ספונטני על נושא עכשווי", prompt_fr:"Exprimez-vous librement sur l'avenir du français dans le monde.", trans_he:"הביעו עצמכם בחופשיות על עתיד הצרפתית בעולם.", model_fr:"Le français, parlé par plus de 300 millions de locuteurs, connaît une expansion notable en Afrique. Loin de son déclin annoncé, il reste une langue de culture et de diplomatie, adaptant son usage aux réalités contemporaines.", keys_fr:["locuteurs","expansion","loin de","reste une langue de","adaptant"], tip_he:"C2: phrases longues · participiales · registre formel · vocabulaire précis." },
      { instruction_he:"שליטה: improvisation sur אתיקה", prompt_fr:"La fin justifie-t-elle les moyens ? Développez en 5 phrases.", trans_he:"האם המטרה מקדשת את האמצעים? פתחו ב-5 משפטים.", model_fr:"Cette formule, attribuée à Machiavel, soulève une question éthique fondamentale. Si certains actes répréhensibles peuvent sembler justifiés par leurs effets, cette logique ouvre la voie à toutes les dérives. Une société ne peut prospérer sur un relativisme moral absolu.", keys_fr:["soulève","répréhensibles","ouvre la voie","dérives","relativisme moral"], tip_he:"attribuée à · soulève une question · ouvre la voie à · toutes les dérives." },
      { instruction_he:"שליטה: אנליזה פתוחה", prompt_fr:"« Parler, c'est agir. » Développez cette idée.", trans_he:"«לדבר זה לפעול.» פתחו רעיון זה.", model_fr:"Selon Austin et les théories des actes de langage, la parole n'est pas un simple reflet de la pensée : elle produit des effets dans le monde. Promettre, ordonner, déclarer — ces actes transforment la réalité.", keys_fr:["actes de langage","produit des effets","promettre","ordonner","transforment la réalité"], tip_he:"selon + philosophe/théorie · la parole n'est pas seulement · elle produit / génère / transforme." },
    ],
  ],
};

/* -------------------- B2 bank (2D: 6 stations × 3 questions) -------------------- */
const BANK_B2 = {
  /* stations: Dont/Y/En · Gérondif · Plus-que-parfait · Conditionnel · Accord PP · Prépositions */
  gra: [
    [ /* 0 — Dont / Y / En */
      { instruction_he:"כינוי dont", prompt_fr:"Le livre ____ je t'ai parlé est passionnant.", trans_he:"הספר שדיברתי איתך עליו מרתק.", accepted:["dont"], solution_fr:"Le livre dont je t'ai parlé est passionnant.", explanation_he:"dont מחליף de + שם. parler de qqch → dont.", tip_he:"dont אחרי: parler de · avoir besoin de · se souvenir de." },
      { instruction_he:"כינוי y", prompt_fr:"Tu penses à ton avenir ? — Oui, j'____ pense souvent.", trans_he:"אתה חושב על עתידך? — כן, אני חושב על זה לעיתים.", accepted:["y"], solution_fr:"Oui, j'y pense souvent.", explanation_he:"y מחליף à + דבר (לא אדם). penser à qqch → y penser.", tip_he:"à + דבר (לא אדם) → y." },
      { instruction_he:"כינוי en", prompt_fr:"Tu as des amis à Paris ? — Oui, j'____ ai beaucoup.", trans_he:"יש לך חברים בפריז? — כן, יש לי הרבה.", accepted:["en"], solution_fr:"Oui, j'en ai beaucoup.", explanation_he:"en מחליף de/des + שם ובמיוחד ביטויי כמות.", tip_he:"כמות (beaucoup, trois, un peu) → en." },
    ],
    [ /* 1 — Gérondif */
      { instruction_he:"gérondif: אופן/בו-זמניות", prompt_fr:"Il a appris le français ____ (regarder) des films.", trans_he:"הוא למד צרפתית תוך כדי צפייה בסרטים.", accepted:["en regardant"], solution_fr:"Il a appris le français en regardant des films.", explanation_he:"gérondif = en + participe présent. מביע אופן או בו-זמניות.", tip_he:"en + פועל בסיומת -ant = תוך כדי…" },
      { instruction_he:"gérondif: tout en (ניגוד)", prompt_fr:"Il sourit ____ (penser) à son erreur.", trans_he:"הוא מחייך בחשבו על טעותו.", accepted:["en pensant","tout en pensant"], solution_fr:"Il sourit en pensant à son erreur.", explanation_he:"en pensant = בחשבו. tout en pensant מדגיש בו-זמניות עם ניגוד קל.", tip_he:"tout en + gérondif מדגיש את הניגוד: tout en souriant, il pleurait." },
      { instruction_he:"gérondif: condition", prompt_fr:"Tu perdras du poids ____ (faire) du sport régulièrement.", trans_he:"תרד במשקל על ידי עשיית ספורט בקביעות.", accepted:["en faisant"], solution_fr:"Tu perdras du poids en faisant du sport régulièrement.", explanation_he:"gérondif מביע תנאי/אמצעי: en faisant = על ידי עשיית.", tip_he:"en faisant (על ידי) · en mangeant (על ידי אכילת) · en étudiant." },
    ],
    [ /* 2 — Plus-que-parfait */
      { instruction_he:"plus-que-parfait: עבר שלפני עבר", prompt_fr:"Quand je suis arrivé à la gare, le train ____ déjà (partir).", trans_he:"כשהגעתי לתחנה, הרכבת כבר יצאה.", accepted:["était déjà parti","était parti"], solution_fr:"le train était déjà parti.", explanation_he:"פעולה שהסתיימה לפני פעולה אחרת בעבר → plus-que-parfait.", tip_he:"עבר שלפני עבר = plus-que-parfait (avais/était + participe)." },
      { instruction_he:"plus-que-parfait: דיבור עקיף", prompt_fr:"Elle a dit qu'elle ____ (finir) son travail la veille.", trans_he:"היא אמרה שהיא סיימה את עבודתה יום קודם.", accepted:["avait fini"], solution_fr:"Elle avait fini son travail la veille.", explanation_he:"בדיבור עקיף בעבר, פעולה שקדמה → plus-que-parfait.", tip_he:"« hier » בדיבור עקיף הופך ל-« la veille »." },
      { instruction_he:"plus-que-parfait: bien que", prompt_fr:"Bien qu'il ____ (faire) de son mieux, il a échoué.", trans_he:"למרות שעשה כמיטב יכולתו, הוא נכשל.", accepted:["ait fait"], solution_fr:"Bien qu'il ait fait de son mieux, il a échoué.", explanation_he:"כשהפעולה כבר הושלמה, אחרי bien que בא subjonctif passé: ait fait.", tip_he:"subjonctif passé = aie/aies/ait + participe." },
    ],
    [ /* 3 — Conditionnel présent & passé */
      { instruction_he:"conditionnel présent: hypothèse", prompt_fr:"Si j'avais plus de temps, je ____ (voyager) davantage.", trans_he:"אם היה לי יותר זמן, הייתי מטייל יותר.", accepted:["voyagerais"], solution_fr:"je voyagerais davantage.", explanation_he:"Si + imparfait → conditionnel présent.", tip_he:"Si + imparfait → conditionnel présent." },
      { instruction_he:"conditionnel passé: hypothèse irréelle", prompt_fr:"Si j'avais su, je ne ____ (venir) pas.", trans_he:"אילו ידעתי, לא הייתי בא.", accepted:["serais venu","serais venue"], solution_fr:"je ne serais pas venu.", explanation_he:"Si + plus-que-parfait → conditionnel passé. venir עם être.", tip_he:"Si + avais su → ... serais venu (חרטה על העבר)." },
      { instruction_he:"conditionnel: politesse", prompt_fr:"Je ____ un café, s'il vous plaît.", trans_he:"הייתי רוצה קפה, בבקשה.", accepted:["voudrais","aimerais"], solution_fr:"Je voudrais un café.", explanation_he:"conditionnel לבקשה מנומסת. voudrais = הייתי רוצה.", tip_he:"je voudrais · j'aimerais · pourriez-vous — כולם conditionnel לנימוס." },
    ],
    [ /* 4 — Accord du participe passé */
      { instruction_he:"accord PP עם avoir + COD לפניו", prompt_fr:"Les fleurs que j'ai ____ (acheter) sont magnifiques.", trans_he:"הפרחים שקניתי נהדרים.", accepted:["achetées"], solution_fr:"Les fleurs que j'ai achetées sont magnifiques.", explanation_he:"COD לפני avoir → PP מתאים. fleurs נקבה רבים → achetées.", tip_he:"COD לפני avoir → התאמה במין ובמספר." },
      { instruction_he:"accord PP עם être", prompt_fr:"Les filles sont ____ (partir) tôt.", trans_he:"הבנות יצאו מוקדם.", accepted:["parties"], solution_fr:"Les filles sont parties tôt.", explanation_he:"avec être, PP מתאים תמיד לנושא. filles נקבה רבות → parties.", tip_he:"être + PP → תמיד מתאים לנושא." },
      { instruction_he:"accord PP: le seul qui", prompt_fr:"C'est le seul ami qui me ____ (comprendre) vraiment.", trans_he:"זה החבר היחיד שבאמת מבין אותי.", accepted:["comprenne"], solution_fr:"C'est le seul ami qui me comprenne vraiment.", explanation_he:"le seul qui → subjonctif. comprendre → comprenne.", tip_he:"le seul qui, le premier qui → subjonctif." },
    ],
    [ /* 5 — Prépositions avancées */
      { instruction_he:"מילת יחס: rêver de", prompt_fr:"Je rêve ____ visiter le Canada un jour.", trans_he:"אני חולם לבקר בקנדה יום אחד.", accepted:["de"], solution_fr:"Je rêve de visiter le Canada.", explanation_he:"rêver de faire qqch — הפועל rêver דורש de לפני שם הפועל.", tip_he:"rêver de · décider de · essayer de · oublier de." },
      { instruction_he:"מילת יחס: tenir à", prompt_fr:"Je tiens ____ vous remercier.", trans_he:"אני מרגיש צורך להודות לכם.", accepted:["à"], solution_fr:"Je tiens à vous remercier.", explanation_he:"tenir à faire qqch = לרצות בחזקה / לחשוב שחשוב לעשות.", tip_he:"tenir à · s'opposer à · renoncer à · réussir à." },
      { instruction_he:"מילת יחס: se passer de", prompt_fr:"Je ne peux pas me passer ____ café le matin.", trans_he:"אני לא יכול בלי קפה בבוקר.", accepted:["de"], solution_fr:"Je ne peux pas me passer de café.", explanation_he:"se passer de = להסתדר בלי. toujours de לפני שם העצם.", tip_he:"se passer de · manquer de · avoir besoin de · profiter de." },
    ],
  ],
  /* stations: Travail · Émotions · Expressions · Nuances · Registres · Idiomes */
  voc: [
    [ /* 0 — Travail */
      { instruction_he:"להתפטר", prompt_fr:"Il a décidé de ____ (להתפטר).", trans_he:"הוא החליט להתפטר.", accepted:["démissionner","donner sa démission"], solution_fr:"démissionner", explanation_he:"démissionner = להתפטר. donner sa démission = להגיש התפטרות.", tip_he:"démissionner · être licencié (לפוטר) · être au chômage." },
      { instruction_he:"מועד אחרון", prompt_fr:"Je dois respecter l'____ (המועד האחרון).", trans_he:"אני חייב לעמוד במועד האחרון.", accepted:["échéance","date limite"], solution_fr:"l'échéance / la date limite", explanation_he:"échéance = מועד אחרון. délai = פרק הזמן עד המועד.", tip_he:"respecter les délais = לעמוד בלוחות זמנים." },
      { instruction_he:"להסתדר לבד", prompt_fr:"Je dois apprendre à me ____ (להסתדר לבד).", trans_he:"אני חייב ללמוד להסתדר לבד.", accepted:["débrouiller","se débrouiller"], solution_fr:"se débrouiller", explanation_he:"se débrouiller = להסתדר, למצוא פתרון לבד.", tip_he:"Débrouille-toi ! = תסתדר לבד!" },
    ],
    [ /* 1 — Émotions */
      { instruction_he:"מתוסכל", prompt_fr:"Je suis vraiment ____ (תחושת תסכול).", trans_he:"אני ממש מתוסכל.", accepted:["frustré","frustrée","frustré(e)"], solution_fr:"frustré(e)", explanation_he:"frustré = מתוסכל. la frustration = התסכול.", tip_he:"frustré · déçu (מאוכזב) · énervé (מעצבן) · soulagé (מוקל)." },
      { instruction_he:"מודאג", prompt_fr:"Je suis vraiment ____ pour lui. (דואג)", trans_he:"אני ממש דואג לו.", accepted:["inquiet","inquiète","soucieux"], solution_fr:"inquiet", explanation_he:"inquiet = מודאג. s'inquiéter = לדאוג.", tip_he:"Ne t'inquiète pas = אל תדאג." },
      { instruction_he:"לוותר", prompt_fr:"Il ne faut jamais ____ (להרים ידיים).", trans_he:"אסור אף פעם לוותר.", accepted:["abandonner","laisser tomber","renoncer"], solution_fr:"abandonner / laisser tomber", explanation_he:"abandonner = לוותר. laisser tomber = לעזוב את זה (מדובר).", tip_he:"Laisse tomber ! = עזוב את זה!" },
    ],
    [ /* 2 — Expressions courantes */
      { instruction_he:"שווה את זה", prompt_fr:"Ce film, ça ____ le coup !", trans_he:"הסרט הזה שווה את זה!", accepted:["vaut le coup","vaut la peine"], solution_fr:"ça vaut le coup / la peine", explanation_he:"ça vaut le coup/la peine = שווה את זה.", tip_he:"ça ne vaut pas le coup = לא שווה את הטרחה." },
      { instruction_he:"בכוונה", prompt_fr:"Il l'a fait ____ (לא במקרה).", trans_he:"הוא עשה את זה בכוונה.", accepted:["exprès","expres","volontairement"], solution_fr:"exprès", explanation_he:"faire exprès = לעשות בכוונה.", tip_he:"Je ne l'ai pas fait exprès = לא עשיתי בכוונה." },
      { instruction_he:"להתחרט", prompt_fr:"Je ____ vraiment ma décision.", trans_he:"אני ממש מתחרט על ההחלטה.", accepted:["regrette"], solution_fr:"Je regrette ma décision.", explanation_he:"regretter = להתחרט/להצטער.", tip_he:"Je regrette = אני מצטער / מתחרט." },
    ],
    [ /* 3 — Nuances */
      { instruction_he:"להתרגל ל-", prompt_fr:"Je dois m'____ à ce nouveau rythme.", trans_he:"אני חייב להתרגל לקצב החדש הזה.", accepted:["habituer","habituer à"], solution_fr:"s'habituer à", explanation_he:"s'habituer à qqch = להתרגל למשהו.", tip_he:"être habitué à = להיות רגיל ל-." },
      { instruction_he:"להעמיד פנים", prompt_fr:"Il ____ de ne pas comprendre.", trans_he:"הוא מעמיד פנים שאינו מבין.", accepted:["fait semblant","fait semblant de"], solution_fr:"faire semblant (de)", explanation_he:"faire semblant de = להעמיד פנים.", tip_he:"faire semblant de + שם פועל." },
      { instruction_he:"מעצבן (nuance)", prompt_fr:"Ce bruit constant est vraiment ____ !", trans_he:"הרעש המתמיד הזה ממש מעצבן!", accepted:["agaçant","agacant","énervant","enervant"], solution_fr:"agaçant / énervant", explanation_he:"agaçant = מעצבן (קל יותר) · énervant = מעצבן (חזק יותר).", tip_he:"agaçant · énervant · irritant · exaspérant (מתסכל ביותר)." },
    ],
    [ /* 4 — Registres */
      { instruction_he:"בכל זאת (ניגוד)", prompt_fr:"C'était difficile, mais j'ai réussi ____ (בכל זאת).", trans_he:"זה היה קשה, אבל הצלחתי בכל זאת.", accepted:["quand même","quand meme","malgré tout","malgre tout"], solution_fr:"quand même / malgré tout", explanation_he:"quand même = בכל זאת. malgré tout = למרות הכל.", tip_he:"Merci quand même = תודה בכל זאת." },
      { instruction_he:"להתלונן", prompt_fr:"Il n'arrête pas de se ____ de tout !", trans_he:"הוא לא מפסיק להתלונן על הכל!", accepted:["plaindre","se plaindre"], solution_fr:"se plaindre (de)", explanation_he:"se plaindre de qqch = להתלונן על משהו.", tip_he:"se plaindre de = להתלונן על." },
      { instruction_he:"לדעתי (registre)", prompt_fr:"____, cette décision est la bonne. (לדעתי — רשמי)", trans_he:"לדעתי, ההחלטה הזו נכונה (רשמי).", accepted:["à mon avis","a mon avis","selon moi","à mon sens"], solution_fr:"À mon avis / Selon moi / À mon sens", explanation_he:"à mon sens = ספרותי יותר. selon moi = רשמי. à mon avis = יומיומי.", tip_he:"à mon avis · selon moi · à mon sens · de mon point de vue." },
    ],
    [ /* 5 — Idiomes B2 */
      { instruction_he:"ביטוי: מחר בבוקר", prompt_fr:"Ne remets pas ____ ce que tu peux faire aujourd'hui.", trans_he:"אל תדחה להמחרת מה שאתה יכול לעשות היום.", accepted:["au lendemain","à demain"], solution_fr:"au lendemain", explanation_he:"remettre au lendemain = לדחות למחר. procrastiner = לדחות.", tip_he:"remettre au lendemain = procrastiner = לשים בצד." },
      { instruction_he:"ביטוי: לראות את התמונה הגדולה", prompt_fr:"Il faut voir les choses ____ (בפרספקטיבה נרחבת).", trans_he:"צריך לראות דברים בפרספקטיבה רחבה.", accepted:["dans leur ensemble","en perspective","globalement"], solution_fr:"dans leur ensemble / en perspective", explanation_he:"voir dans leur ensemble = לראות בכללות. en perspective = בפרספקטיבה.", tip_he:"globalement · dans l'ensemble · en perspective · vue d'ensemble." },
      { instruction_he:"ביטוי: לא כדאי", prompt_fr:"Ce n'est pas la ____ (לא שווה את המאמץ).", trans_he:"זה לא שווה את המאמץ.", accepted:["peine","peine d'y aller"], solution_fr:"Ce n'est pas la peine.", explanation_he:"ce n'est pas la peine = לא כדאי, לא צריך להטריח.", tip_he:"ce n'est pas la peine · ça ne vaut pas le coup · inutile de." },
    ],
  ],
  /* stations: Presse · Chroniques · Débats TV · Essais · Discours · Analyses */
  com: [
    [ /* 0 — Presse */
      { instruction_he:"קרא וענה", prompt_fr:"« Depuis la pandémie, le télétravail s'est imposé dans de nombreuses entreprises. Si certains salariés y voient un gain de liberté, d'autres regrettent le manque de contact humain et peinent à séparer vie professionnelle et vie privée. »", trans_he:"מאז המגפה, העבודה מרחוק התבססה. חלק מהעובדים רואים בכך חופש, אחרים מתגעגעים למגע האנושי ומתקשים להפריד בין עבודה לחיים.", question_fr:"Selon le texte, quel est un inconvénient du télétravail ?", q_he:"מהו חיסרון של עבודה מרחוק?", options:["Il réduit la liberté des salariés","Il brouille la frontière entre travail et vie privée","Il augmente les contacts humains"], correct:1, explanation_he:"« peinent à séparer vie professionnelle et vie privée »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Le maire a annoncé que la nouvelle ligne de tramway serait mise en service d'ici deux ans, à condition que le financement soit validé par la région. »", trans_he:"ראש העיר הודיע שקו הטראם ייכנס לשירות בתוך שנתיים, בתנאי שהמימון יאושר.", question_fr:"La mise en service du tramway dépend de quoi ?", q_he:"כניסת הטראם לשירות תלויה במה?", options:["De l'approbation du financement régional","De la décision des habitants","De la météo"], correct:0, explanation_he:"« à condition que le financement soit validé par la région »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Loin d'être un simple effet de mode, la consommation locale traduit une véritable prise de conscience écologique chez les jeunes générations. »", trans_he:"רחוק מלהיות סתם אופנה, הצריכה המקומית מבטאת מודעות אקולוגית אמיתית בקרב הדורות הצעירים.", question_fr:"Que pense l'auteur de la consommation locale ?", q_he:"מה דעת הכותב על צריכה מקומית?", options:["C'est une mode passagère","C'est le signe d'une vraie conscience écologique","C'est réservé aux personnes âgées"], correct:1, explanation_he:"« loin d'être un simple effet de mode » + « véritable prise de conscience »." },
    ],
    [ /* 1 — Chroniques */
      { instruction_he:"קרא וענה", prompt_fr:"« Si le livre numérique a séduit de nombreux lecteurs par sa praticité, le livre papier conserve un charme que beaucoup ne sont pas prêts à abandonner. »", trans_he:"אם הספר הדיגיטלי כבש קוראים בנוחות, הספר המודפס שומר על קסם שרבים לא מוכנים לוותר עליו.", question_fr:"Que dit le texte sur le livre papier ?", q_he:"מה אומר הטקסט על הספר המודפס?", options:["Il a complètement disparu","Il garde un charme apprécié","Il est plus pratique que le numérique"], correct:1, explanation_he:"« conserve un charme que beaucoup ne sont pas prêts à abandonner »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Les réseaux sociaux permettent de rester en contact avec ses proches, mais une utilisation excessive peut nuire à la concentration et au sommeil. »", trans_he:"הרשתות החברתיות מאפשרות להישאר בקשר, אך שימוש מופרז עלול לפגוע בריכוז ובשינה.", question_fr:"Quel risque le texte mentionne-t-il ?", q_he:"איזה סיכון מזכיר הטקסט?", options:["Une meilleure concentration","Des troubles du sommeil","Une perte de contacts"], correct:1, explanation_he:"« peut nuire à la concentration et au sommeil »." },
      { instruction_he:"קרא וענה", prompt_fr:"« De plus en plus de consommateurs se tournent vers les produits biologiques, convaincus qu'ils sont meilleurs pour la santé, malgré un prix souvent plus élevé. »", trans_he:"יותר ויותר צרכנים פונים למוצרים אורגניים, למרות מחיר גבוה יותר.", question_fr:"Qu'est-ce qui peut freiner l'achat de produits bio ?", q_he:"מה עלול להרתיע מקנייה אורגנית?", options:["Leur goût","Leur prix plus élevé","Leur rareté"], correct:1, explanation_he:"« malgré un prix souvent plus élevé »." },
    ],
    [ /* 2 — Débats TV */
      { instruction_he:"קרא וענה", prompt_fr:"« Malgré un accueil critique mitigé, le dernier film du réalisateur a rencontré un franc succès auprès du public, dépassant le million d'entrées en une semaine. »", trans_he:"למרות ביקורות מעורבות, הסרט זכה להצלחה גדולה בקרב הקהל, ועבר מיליון צופים.", question_fr:"Comment le film a-t-il été reçu ?", q_he:"כיצד התקבל הסרט?", options:["Aimé par la critique mais ignoré du public","Critiqué mais très populaire auprès du public","Un échec total"], correct:1, explanation_he:"« accueil critique mitigé » + « franc succès auprès du public »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Pour désengorger le centre-ville, la municipalité encourage l'usage du vélo en multipliant les pistes cyclables. »", trans_he:"כדי להקל על הגודש, העירייה מעודדת שימוש באופניים על ידי הרבת שבילי אופניים.", question_fr:"Quel est l'objectif de la municipalité ?", q_he:"מה המטרה של העירייה?", options:["Augmenter le trafic automobile","Réduire l'encombrement du centre-ville","Interdire les voitures"], correct:1, explanation_he:"« désengorger le centre-ville »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Le numérique a profondément reconfiguré notre rapport au temps. L'immédiateté des échanges génère paradoxalement une nouvelle forme d'impatience qui érode notre capacité à la réflexion approfondie. »", trans_he:"הדיגיטלי מחדש את יחסנו לזמן. המיידיות יוצרת חוסר סבלנות ששוחק את יכולת ההרהור.", question_fr:"Quel est l'effet paradoxal du numérique ?", q_he:"מהו האפקט הפרדוקסלי של הדיגיטלי?", options:["Il rapproche les gens et renforce la réflexion","Il abolit les distances mais génère de l'impatience","Il améliore notre rapport au temps"], correct:1, explanation_he:"פרדוקס: מבטל מרחקים אבל יוצר חוסר סבלנות." },
    ],
    [ /* 3 — Essais */
      { instruction_he:"קרא וענה", prompt_fr:"« La précarité économique ne se réduit pas à un manque d'argent : elle génère une instabilité cognitive qui affecte la prise de décision. »", trans_he:"חוסר ביטחון כלכלי אינו מסתכם בחוסר כסף: הוא מייצר חוסר יציבות קוגניטיבי שמשפיע על קבלת החלטות.", question_fr:"Quel effet la précarité a-t-elle ?", q_he:"איזה השפעה יש לחוסר הביטחון?", options:["Elle renforce la prise de décision","Elle crée une instabilité cognitive","Elle n'affecte que les finances"], correct:1, explanation_he:"« instabilité cognitive qui affecte la prise de décision »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Apprendre une langue étrangère demande de la patience : les progrès sont parfois lents, mais la régularité finit toujours par payer. »", trans_he:"ללמוד שפה זרה דורש סבלנות: ההתקדמות לפעמים איטית, אך ההתמדה תמיד משתלמת.", question_fr:"Quel facteur est essentiel selon le texte ?", q_he:"איזה גורם חיוני?", options:["Le talent inné","La régularité","La rapidité"], correct:1, explanation_he:"« la régularité finit toujours par payer »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Les sociétés contemporaines valorisent à la fois l'individualisme et la solidarité, créant une tension structurelle difficile à résoudre. »", trans_he:"החברות העכשוויות מעריכות גם אינדיבידואליזם וגם סולידריות, ויוצרות מתח מבני.", question_fr:"Quelle tension le texte identifie-t-il ?", q_he:"איזה מתח מזהה הטקסט?", options:["Entre liberté et sécurité","Entre individualisme et solidarité","Entre tradition et modernité"], correct:1, explanation_he:"« valorisent à la fois l'individualisme et la solidarité »." },
    ],
    [ /* 4 — Discours */
      { instruction_he:"קרא וענה", prompt_fr:"« Le populisme se nourrit du sentiment d'abandon des classes moyennes, exploitant la méfiance envers les élites pour proposer des solutions simplistes à des problèmes complexes. »", trans_he:"הפופוליזם ניזון מתחושת נטישה ומנצל את חוסר האמון באליטות.", question_fr:"Comment le texte explique-t-il le populisme ?", q_he:"כיצד מסביר הטקסט את הפופוליזם?", options:["Comme une idéologie bien définie","Comme une exploitation du mécontentement populaire","Comme un système stable"], correct:1, explanation_he:"« exploitant la méfiance envers les élites »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La science ne produit pas des vérités définitives, mais des modèles provisoires, constamment révisés à la lumière de nouvelles données. »", trans_he:"המדע אינו מייצר אמיתות סופיות, אלא מודלים זמניים, המתוקנים ללא הרף.", question_fr:"Comment le texte décrit-il la science ?", q_he:"כיצד מתאר הטקסט את המדע?", options:["Comme une source de vérités définitives","Comme un ensemble de modèles provisoires","Comme une discipline figée"], correct:1, explanation_he:"« modèles provisoires, constamment révisés »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La démocratie délibérative suppose que la légitimité des décisions découle non du vote seul, mais de la qualité du débat qui le précède. »", trans_he:"הדמוקרטיה הדיונית מניחה שלגיטימיות ההחלטות נובעת לא מהצבעה בלבד אלא מאיכות הדיון.", question_fr:"Qu'est-ce qui légitime une décision ?", q_he:"מה מעניק לגיטימיות?", options:["Le vote seul","La qualité du débat préalable","La décision des experts"], correct:1, explanation_he:"« qualité du débat qui le précède »." },
    ],
    [ /* 5 — Analyses */
      { instruction_he:"קרא וענה", prompt_fr:"« L'esthétique kantienne distingue le beau du sublime : si le beau apaise, le sublime confronte l'homme à ses propres limites face à l'infini. »", trans_he:"קאנט מבחין בין יפה לנשגב: היפה מרגיע, הנשגב מעמת עם הגבולות.", question_fr:"Quelle est la différence entre le beau et le sublime ?", q_he:"מה ההבדל בין יפה לנשגב?", options:["Le beau est plus rare","Le beau apaise, le sublime confronte à nos limites","Le sublime est plus simple"], correct:1, explanation_he:"« le beau apaise, le sublime confronte l'homme à ses propres limites »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La traduction n'est jamais neutre : elle est toujours un acte d'interprétation, voire de création, car le traducteur ne transporte pas seulement des mots, mais des mondes. »", trans_he:"תרגום אינו ניטרלי: הוא תמיד מעשה פרשנות ואף יצירה.", question_fr:"Que fait réellement le traducteur ?", q_he:"מה עושה המתרגם?", options:["Il copie des mots","Il interprète et crée en transférant des univers","Il reste fidèle à l'original"], correct:1, explanation_he:"« acte d'interprétation, voire de création... transporte des mondes »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Si la modernité a affranchi l'individu des contraintes collectives, elle l'a privé des cadres symboliques qui donnaient sens à son existence. »", trans_he:"המודרניות שחררה את הפרט ממאסרים קולקטיביים אבל שללה ממנו את המסגרות הסמליות.", question_fr:"Quel est le paradoxe évoqué ?", q_he:"מהו הפרדוקס?", options:["La liberté moderne crée émancipation et perte de sens","La modernité a renforcé les liens","Les contraintes donnent un sens à la vie"], correct:0, explanation_he:"הפרדוקס: שחרור + שלילת מסגרות סמליות." },
    ],
  ],
  /* stations: Société · Culture · Argumentation · Nuancer · Convaincre · Improviser */
  exp: [
    [ /* 0 — Société */
      { instruction_he:"הבע עמדה: עבודה מרחוק", prompt_fr:"Que penses-tu du télétravail ? Donne ton avis en deux phrases.", trans_he:"מה דעתך על עבודה מרחוק?", model_fr:"Personnellement, je trouve que le télétravail offre une grande flexibilité. Cependant, il peut créer un sentiment d'isolement, c'est pourquoi je préfère un rythme hybride.", keys_fr:["personnellement","je trouve que","cependant","c'est pourquoi"], tip_he:"personnellement · je trouve que · cependant · c'est pourquoi." },
      { instruction_he:"הבע עמדה: רשתות חברתיות", prompt_fr:"Les réseaux sociaux : avantage ou danger pour la société ?", trans_he:"רשתות חברתיות: יתרון או סכנה לחברה?", model_fr:"À mon avis, les réseaux sociaux rapprochent les gens qui sont loin, mais peuvent nous éloigner de ceux qui sont à côté. Tout dépend de la manière dont on les utilise.", keys_fr:["à mon avis","rapprocher","éloigner","tout dépend de"], tip_he:"D'un côté… de l'autre… · à mon avis · tout dépend de." },
      { instruction_he:"הבע עמדה: שינויי אקלים", prompt_fr:"Les individus peuvent-ils vraiment aider l'environnement ?", trans_he:"האם אנשים יכולים באמת לעזור לסביבה?", model_fr:"Je pense que oui : recycler, consommer moins, prendre les transports en commun — ces gestes comptent. Mais la responsabilité principale incombe aux entreprises et aux gouvernements.", keys_fr:["je pense que","ces gestes comptent","mais","incombe aux"], tip_he:"ces gestes comptent (המעשים האלה חשובים) · incombe à (מוטלת על)." },
    ],
    [ /* 1 — Culture */
      { instruction_he:"תאר מנה אהובה", prompt_fr:"Décris ton plat préféré et explique pourquoi tu l'aimes.", trans_he:"תאר את המנה האהובה עליך.", model_fr:"Mon plat préféré, c'est sans doute les pâtes à la carbonara. J'apprécie ce plat parce qu'il est simple et réconfortant. De plus, il me rappelle un voyage en Italie.", keys_fr:["sans doute","j'apprécie parce que","à la fois","de plus","il me rappelle"], tip_he:"à la fois · de plus · parce que · il me rappelle." },
      { instruction_he:"תאר יום סוף שבוע אידיאלי", prompt_fr:"Décris ta journée de week-end idéale.", trans_he:"תאר את יום סוף השבוע האידיאלי שלך.", model_fr:"Ma journée idéale commencerait par un petit-déjeuner tranquille. Ensuite, je me promènerais en ville, puis je retrouverais des amis. Le soir, je regarderais un film.", keys_fr:["commencerait par","ensuite","puis","le soir"], tip_he:"conditionnel: commencerait · je me promènerais · je retrouverais." },
      { instruction_he:"השווה שתי תרבויות", prompt_fr:"Compare deux pays ou cultures que tu connais.", trans_he:"השווה בין שתי מדינות או תרבויות שאתה מכיר.", model_fr:"Israël et la France ont des cultures très différentes. En Israël, on est direct et informel. En France, on valorise davantage la politesse formelle et la gastronomie. Les deux ont leur charme.", keys_fr:["en Israël","en France","davantage","les deux ont leur charme"], tip_he:"en ... on + verbe · davantage (יותר) · les deux · à l'inverse." },
    ],
    [ /* 2 — Argumentation */
      { instruction_he:"מסגרת טיעון: ב-2 טיעונים", prompt_fr:"Donnez deux arguments pour ou contre la semaine de 4 jours.", trans_he:"תנו שני טיעונים בעד או נגד שבוע עבודה בן 4 ימים.", model_fr:"Premièrement, la semaine de 4 jours améliore le bien-être des employés et réduit l'absentéisme. Deuxièmement, elle peut augmenter la productivité en concentrant les efforts.", keys_fr:["premièrement","deuxièmement","améliore","réduit","augmenter"], tip_he:"premièrement · deuxièmement · en outre (בנוסף) · de plus (יתרה מזאת)." },
      { instruction_he:"תן עצה: ללמוד צרפתית", prompt_fr:"Quels conseils donnerais-tu à quelqu'un qui commence le français ?", trans_he:"אילו עצות היית נותן למי שמתחיל ללמוד צרפתית?", model_fr:"Je lui conseillerais d'écouter du français tous les jours, même quelques minutes. Il ne faudrait pas avoir peur de faire des erreurs, car c'est en se trompant qu'on apprend.", keys_fr:["je lui conseillerais","ne pas avoir peur","c'est en se trompant que"], tip_he:"je lui conseille de + inf · il faudrait que · c'est en + gérondif que." },
      { instruction_he:"בנה טיעון: conditionnel", prompt_fr:"Si tu étais président(e), quelle loi voterais-tu en premier ?", trans_he:"אם היית נשיא/ה, על איזה חוק היית מצביע ראשון?", model_fr:"Si j'étais président, je voterais d'abord une loi obligatoire sur le recyclage. Je pense que l'urgence climatique exige des mesures concrètes et immédiates.", keys_fr:["si j'étais","je voterais","je pense que","l'urgence climatique","exige"], tip_he:"Si + imparfait → conditionnel. je voterais · je créerais · j'imposerais." },
    ],
    [ /* 3 — Nuancer */
      { instruction_he:"גוון עמדה: הוסף certes/mais", prompt_fr:"Nuancez : « La technologie détruit le lien social. »", trans_he:"גוונו: «הטכנולוגיה הורסת את הקשר החברתי.»", model_fr:"Certes, les écrans peuvent substituer aux interactions réelles. Mais ils créent aussi de nouveaux liens entre personnes éloignées. Il serait réducteur de condamner la technologie.", keys_fr:["certes","mais","il serait réducteur de"], tip_he:"certes... mais · il est vrai que... néanmoins · on peut admettre que... cependant." },
      { instruction_he:"גוון: שני היבטים", prompt_fr:"Nuancez : « La mondialisation est une chance pour tous. »", trans_he:"גוונו: «הגלובליזציה היא הזדמנות לכולם.»", model_fr:"Si la mondialisation a permis à des millions de sortir de la pauvreté, elle a également creusé les inégalités au sein des sociétés et fragilisé les cultures locales.", keys_fr:["si ... a permis","elle a également","creusé les inégalités","fragilisé"], tip_he:"si (avantage) → elle a également (désavantage). Ne pas oublier la nuance!" },
      { instruction_he:"גוון: הפרדה בין היבטים", prompt_fr:"Nuancez le rôle des réseaux sociaux dans les mouvements citoyens.", trans_he:"גוונו את תפקיד הרשתות החברתיות בתנועות אזרחיות.", model_fr:"D'un côté, les réseaux sociaux ont facilité des mobilisations historiques. De l'autre, ils peuvent aussi propager des fausses informations et diviser. Tout dépend de l'usage.", keys_fr:["d'un côté","de l'autre","facilité","propager","tout dépend de l'usage"], tip_he:"d'un côté · de l'autre · par ailleurs · tout dépend de." },
    ],
    [ /* 4 — Convaincre */
      { instruction_he:"שכנע: הצג מסקנה", prompt_fr:"Rédigez une conclusion convaincante sur l'importance des langues étrangères.", trans_he:"כתבו מסקנה משכנעת על חשיבות שפות זרות.", model_fr:"En définitive, apprendre une langue étrangère n'est pas seulement un atout professionnel : c'est une ouverture sur le monde, un enrichissement culturel et humain irremplaçable.", keys_fr:["en définitive","n'est pas seulement","c'est une ouverture","enrichissement","irremplaçable"], tip_he:"en définitive · n'est pas seulement... c'est aussi · irremplaçable." },
      { instruction_he:"שכנע: הגב להתנגדות", prompt_fr:"Quelqu'un dit : « L'art n'est pas utile. » Comment répondez-vous ?", trans_he:"מישהו אומר: «אמנות אינה שימושית.» כיצד תגיבו?", model_fr:"Je comprends ce point de vue, mais l'utilité n'est pas la seule valeur. L'art nourrit l'esprit, développe la créativité et offre un espace de réflexion que rien d'autre ne peut remplacer.", keys_fr:["je comprends","mais","nourrit l'esprit","développe","rien d'autre ne peut remplacer"], tip_he:"je comprends... mais · loin de là · bien au contraire · néanmoins." },
      { instruction_he:"שכנע: תמוך בעמדה", prompt_fr:"Convainquez quelqu'un d'apprendre le français.", trans_he:"שכנעו מישהו ללמוד צרפתית.", model_fr:"Le français est une langue internationale parlée sur cinq continents. En apprenant le français, vous accédez à une culture riche, à des opportunités professionnelles et à des relations humaines élargies.", keys_fr:["internationale","cinq continents","en apprenant","opportunités","relations humaines élargies"], tip_he:"en + gérondif = בזכות + infinitif · vous accédez à · une culture riche." },
    ],
    [ /* 5 — Improviser */
      { instruction_he:"אימפרוביזציה: תגובה היפותטית", prompt_fr:"Comment réagirais-tu si un ami annulait à la dernière minute ?", trans_he:"איך היית מגיב אם חבר מבטל ברגע האחרון?", model_fr:"Je serais un peu déçu, mais je comprendrais s'il avait une bonne raison. Je lui proposerais de reporter à un autre jour plutôt que de me fâcher.", keys_fr:["je serais","je comprendrais","je lui proposerais","plutôt que de"], tip_he:"conditionnel présent: je serais · je comprendrais · je proposerais." },
      { instruction_he:"אימפרוביזציה: מיומנות שתרצה", prompt_fr:"Si tu pouvais maîtriser une compétence instantanément, laquelle choisirais-tu ?", trans_he:"אם יכולת לרכוש מיומנות אחת מיידית, איזו היית בוחר?", model_fr:"Si je pouvais maîtriser une compétence, je choisirais de jouer du piano. Ce serait une source de joie quotidienne et cela me permettrait d'exprimer des émotions autrement.", keys_fr:["si je pouvais","je choisirais","ce serait","cela me permettrait"], tip_he:"Si + imparfait → conditionnel: je choisirais · ce serait · je pourrais." },
      { instruction_he:"אימפרוביזציה: עצה לדמות היסטורית", prompt_fr:"Quels conseils donnerais-tu à un jeune Napoléon ?", trans_he:"אילו עצות היית נותן לנפוליאון הצעיר?", model_fr:"Je lui conseillerais d'écouter davantage ses conseillers et de ne pas laisser l'orgueil dicter ses décisions militaires. La modération est souvent plus puissante que l'ambition débridée.", keys_fr:["je lui conseillerais","d'écouter davantage","ne pas laisser","l'orgueil","la modération"], tip_he:"je lui conseillerais de · ne pas laisser + N + inf · la modération." },
    ],
  ],
};

/* -------------------- C1 bank (2D: 6 stations × 3 questions) -------------------- */
const BANK_C1 = {
  /* stations: Subjonctif · Conditionnel passé · Disc. indirect · Concordance · Subj. passé · Style avancé */
  gra: [
    [ /* 0 — Subjonctif présent */
      { instruction_he:"subjonctif: il faut que", prompt_fr:"Il faut que tu ____ (finir) ce rapport avant midi.", trans_he:"צריך שתסיים את הדוח לפני הצהריים.", accepted:["finisses"], solution_fr:"Il faut que tu finisses ce rapport avant midi.", explanation_he:"il faut que + subjonctif. finir → finisses.", tip_he:"il faut que · il est important que · il est essentiel que → subjonctif." },
      { instruction_he:"subjonctif: bien que", prompt_fr:"Bien qu'il ____ (être) fatigué, il continue à travailler.", trans_he:"למרות שהוא עייף, הוא ממשיך לעבוד.", accepted:["soit"], solution_fr:"Bien qu'il soit fatigué, il continue à travailler.", explanation_he:"bien que (אף ש-) + subjonctif. être → soit.", tip_he:"bien que · quoique · encore que → subjonctif." },
      { instruction_he:"subjonctif: pour que", prompt_fr:"Je répète l'explication pour que tu ____ (comprendre).", trans_he:"אני חוזר על ההסבר כדי שתבין.", accepted:["comprennes"], solution_fr:"pour que tu comprennes.", explanation_he:"pour que (כדי ש-) + subjonctif. comprendre → comprennes.", tip_he:"pour que · afin que · à condition que → subjonctif." },
    ],
    [ /* 1 — Conditionnel passé */
      { instruction_he:"conditionnel passé: regret", prompt_fr:"Si j'avais su, je ne ____ (venir) pas.", trans_he:"אילו ידעתי, לא הייתי בא.", accepted:["serais venu","serais venue"], solution_fr:"je ne serais pas venu.", explanation_he:"Si + PQP → conditionnel passé. venir = être → serais venu.", tip_he:"Si + avais su → ... serais venu." },
      { instruction_he:"conditionnel passé: conséquence actuelle", prompt_fr:"Si j'avais étudié la médecine, je ____ (être) médecin aujourd'hui.", trans_he:"אלו למדתי רפואה, הייתי רופא היום.", accepted:["serais"], solution_fr:"je serais médecin aujourd'hui.", explanation_he:"תנאי עבר + תוצאה בהווה: Si + PQP → conditionnel présent.", tip_he:"Si + avait fait → serait (aujourd'hui) — תוצאה בהווה." },
      { instruction_he:"conditionnel passé: reprocher", prompt_fr:"Tu ____ (pouvoir) me prévenir !", trans_he:"יכולת להזהיר אותי!", accepted:["aurais pu"], solution_fr:"Tu aurais pu me prévenir !", explanation_he:"conditionnel passé לגינוי/ייאוש. avoir + pu.", tip_he:"tu aurais pu · il aurait dû · vous auriez dû." },
    ],
    [ /* 2 — Discours indirect */
      { instruction_he:"discours indirect: passé composé → PQP", prompt_fr:"Elle a dit qu'elle ____ (finir) son travail la veille.", trans_he:"היא אמרה שסיימה את עבודתה יום קודם.", accepted:["avait fini"], solution_fr:"Elle a dit qu'elle avait fini son travail la veille.", explanation_he:"בדיבור עקיף בעבר, PC → PQP.", tip_he:"« hier » בדיבור עקיף → « la veille »." },
      { instruction_he:"discours indirect: futur → conditionnel", prompt_fr:"Il m'a dit qu'il ____ (venir) le lendemain.", trans_he:"הוא אמר לי שיבוא למחרת.", accepted:["viendrait"], solution_fr:"Il m'a dit qu'il viendrait le lendemain.", explanation_he:"futur בדיבור ישיר → conditionnel présent בדיבור עקיף.", tip_he:"futur → conditionnel en discours indirect passé." },
      { instruction_he:"discours indirect: question", prompt_fr:"Elle lui a demandé s'il ____ (comprendre) le cours.", trans_he:"היא שאלה אותו אם הוא מבין את השיעור.", accepted:["comprenait"], solution_fr:"s'il comprenait le cours.", explanation_he:"שאלה בדיבור עקיף: si + imparfait (כשהשאלה המקורית בpresent).", tip_he:"direct: « Tu comprends ? » → indirect: il demande si elle comprend." },
    ],
    [ /* 3 — Concordance des temps */
      { instruction_he:"concordance: present → imparfait", prompt_fr:"Je pensais qu'il ____ (avoir) raison.", trans_he:"חשבתי שהוא צודק.", accepted:["avait"], solution_fr:"je pensais qu'il avait raison.", explanation_he:"présent בעבר. penser (imparfait) → avoir (imparfait) בפסוקית.", tip_he:"pensais/croyais/savais → ... avait / faisait / était." },
      { instruction_he:"concordance: subjonctif imparfait (style soutenu)", prompt_fr:"Il fallait qu'il ____ (faire) mieux. (style soutenu)", trans_he:"היה צורך שיעשה טוב יותר (סגנון רשמי).", accepted:["fît","fit"], solution_fr:"Il fallait qu'il fît mieux.", explanation_he:"subjonctif imparfait בסגנון ספרותי/רשמי אחרי fallait que.", tip_he:"fît (littéraire) vs fasse (courant) — שניהם אחרי fallait que." },
      { instruction_he:"concordance: séquence narrative", prompt_fr:"Quand il est arrivé, tout le monde ____ déjà (partir).", trans_he:"כשהגיע, כולם כבר הלכו.", accepted:["était parti","était déjà parti"], solution_fr:"tout le monde était déjà parti.", explanation_he:"PQP לפעולה שקדמה לעבר: était parti.", tip_he:"עבר שלפני עבר = PQP (avait/était + participe)." },
    ],
    [ /* 4 — Subjonctif passé */
      { instruction_he:"subjonctif passé: bien que (פעולה מוגמרת)", prompt_fr:"Bien qu'il ____ (finir) tôt, il est resté.", trans_he:"למרות שסיים מוקדם, הוא נשאר.", accepted:["ait fini"], solution_fr:"Bien qu'il ait fini tôt, il est resté.", explanation_he:"subjonctif passé לפעולה שהסתיימה אחרי bien que.", tip_he:"subjonctif passé = avoir/être au subjonctif + participe." },
      { instruction_he:"subjonctif passé: douter que", prompt_fr:"Je doute qu'il ____ (lire) ce rapport.", trans_he:"אני מטיל ספק שהוא קרא את הדוח הזה.", accepted:["ait lu"], solution_fr:"Je doute qu'il ait lu ce rapport.", explanation_he:"douter que + subjonctif passé. lire → ait lu.", tip_he:"douter que · ne pas penser que · ne pas croire que → subjonctif." },
      { instruction_he:"subjonctif passé: le seul qui", prompt_fr:"C'est le seul ami qui me ____ (vraiment aider).", trans_he:"זה החבר היחיד שבאמת עזר לי.", accepted:["ait vraiment aidé","ait aidé"], solution_fr:"C'est le seul ami qui m'ait vraiment aidé.", explanation_he:"le seul qui + subjonctif passé כשהפעולה הסתיימה.", tip_he:"le seul/premier/dernier qui + subjonctif (présent ou passé)." },
    ],
    [ /* 5 — Style avancé */
      { instruction_he:"inversion du sujet: peut-être", prompt_fr:"____ faut-il reconsidérer cette approche.", trans_he:"אולי צריך לשקול מחדש גישה זו.", accepted:["Peut-être"], solution_fr:"Peut-être faut-il reconsidérer cette approche.", explanation_he:"peut-être en début → inversion: faut-il, est-ce, doit-on.", tip_he:"peut-être + inversion: faut-il · est-ce · doit-on." },
      { instruction_he:"style avancé: sans que + subjonctif", prompt_fr:"Il est parti ____ que personne (savoir).", trans_he:"הוא עזב מבלי שאיש ידע.", accepted:["sans","sans que"], solution_fr:"Il est parti sans que personne sache.", explanation_he:"sans que + subjonctif. savoir → sache.", tip_he:"sans que + subjonctif. sans + infinitif (même sujet)." },
      { instruction_he:"style avancé: quoi que", prompt_fr:"____ vous fassiez, faites-le avec conviction.", trans_he:"יהיה מה שתעשו, עשו זאת בהכרה.", accepted:["Quoi que","Quoique"], solution_fr:"Quoi que vous fassiez, faites-le avec conviction.", explanation_he:"quoi que + subjonctif = quel que soit ce que.", tip_he:"quoi que · où que · qui que — כולם עם subjonctif." },
    ],
  ],
  /* stations: Abstrait · Professionnel · Académique · Registres · Idiomes avancés · Littéraire */
  voc: [
    [ /* 0 — Abstrait */
      { instruction_he:"מושג מופשט: empathy", prompt_fr:"L'____ est la capacité de comprendre les émotions d'autrui.", trans_he:"האמפתיה היא היכולת להבין את רגשות הזולת.", accepted:["empathie"], solution_fr:"L'empathie", explanation_he:"empathie = אמפתיה. autrui = הזולת (ספרותי). sympathie = הזדהות.", tip_he:"empathie · sympathie · compassion · bienveillance (נדיבות)." },
      { instruction_he:"מושג: résilience", prompt_fr:"La ____ est la capacité de surmonter les épreuves.", trans_he:"החוסן הוא היכולת להתגבר על קשיים.", accepted:["résilience","resilience"], solution_fr:"La résilience", explanation_he:"résilience = חוסן. surmonter = להתגבר על. une épreuve = מבחן/קשי.", tip_he:"résilience · persévérance · détermination · endurance." },
      { instruction_he:"מושג: ambiguïté", prompt_fr:"Ce texte est marqué par une grande ____.", trans_he:"הטקסט הזה מאופיין בעמימות רבה.", accepted:["ambiguïté","ambiguité"], solution_fr:"une grande ambiguïté", explanation_he:"ambiguïté = עמימות. ambigu = עמום. ambigu = ניתן לפרשנות כפולה.", tip_he:"ambigu · équivoque · ambigu (adj) · l'ambiguïté (n)." },
    ],
    [ /* 1 — Professionnel */
      { instruction_he:"עסקי: négocier", prompt_fr:"Les deux parties ont dû ____ un compromis.", trans_he:"שני הצדדים נאלצו לנהל משא ומתן לפשרה.", accepted:["négocier"], solution_fr:"négocier", explanation_he:"négocier = לנהל משא ומתן. une négociation = משא ומתן.", tip_he:"négocier · conclure un accord · trouver un terrain d'entente." },
      { instruction_he:"עסקי: sous-traiter", prompt_fr:"L'entreprise a décidé de ____ cette tâche.", trans_he:"החברה החליטה לקבלן-משנה משימה זו.", accepted:["sous-traiter","externaliser"], solution_fr:"sous-traiter / externaliser", explanation_he:"sous-traiter = לקבלן-משנה. externaliser = לבצע מחוץ לחברה.", tip_he:"sous-traiter · externaliser · déléguer · confier à." },
      { instruction_he:"עסקי: rentable", prompt_fr:"Ce projet n'est pas assez ____.", trans_he:"הפרויקט הזה לא מספיק כלכלי.", accepted:["rentable"], solution_fr:"rentable", explanation_he:"rentable = כלכלי/רווחי. la rentabilité = כדאיות כלכלית.", tip_he:"rentable · profitable · viable · lucratif." },
    ],
    [ /* 2 — Académique */
      { instruction_he:"אקדמי: soutenir une thèse", prompt_fr:"Cet article ____ la thèse selon laquelle…", trans_he:"מאמר זה מגן על הטענה ש-…", accepted:["soutient","défend","avance"], solution_fr:"soutient / défend", explanation_he:"soutenir une thèse = לטעון/להגן. avancer = להציע.", tip_he:"soutenir · défendre · avancer · formuler (לנסח)." },
      { instruction_he:"אקדמי: résulte de", prompt_fr:"Il ____ de cette analyse que…", trans_he:"מניתוח זה נובע ש-…", accepted:["ressort","résulte","découle"], solution_fr:"Il ressort / résulte / découle de cette analyse", explanation_he:"il ressort de = משתמע מ-. il résulte de = נובע מ-.", tip_he:"il ressort · il résulte · il découle · il s'ensuit que." },
      { instruction_he:"אקדמי: en conclusion", prompt_fr:"____, on peut affirmer que la mondialisation est ambivalente.", trans_he:"לסיכום, ניתן לקבוע שהגלובליזציה היא דו-ערכית.", accepted:["En conclusion","En somme","En définitive","Pour conclure"], solution_fr:"En conclusion / En somme / En définitive", explanation_he:"en conclusion = לסיכום. en somme = בסה\"כ. en définitive = בסופו של דבר.", tip_he:"en conclusion · en somme · bref · pour conclure · en définitive." },
    ],
    [ /* 3 — Registres */
      { instruction_he:"רישום: רשמי vs מדובר", prompt_fr:"Registre soutenu de : « J'ai pas eu le temps. »", trans_he:"כתבו ברישום רשמי: «לא היה לי זמן.»", accepted:["Je n'ai pas eu le temps","Je n'ai pas disposé du temps nécessaire"], solution_fr:"Je n'ai pas eu le temps.", explanation_he:"רישום מדובר: pas (ללא ne). רשמי: ne … pas.", tip_he:"מדובר: j'ai pas · y'a pas · c'est pas · רשמי: je n'ai pas · il n'y a pas." },
      { instruction_he:"רישום: ironique", prompt_fr:"Identifiez l'ironie dans : « Quelle surprise, encore du retard ! »", trans_he:"זהו את האירוניה: «איזה הפתעה, עוד עיכוב!»", accepted:["ironie","ironiqu","l'ironie"], solution_fr:"C'est de l'ironie / c'est ironique", explanation_he:"ironique = אירוני. le locuteur לא מופתע — ההפך מהמשמעות המילולית.", tip_he:"ironie = הפך בין מה שנאמר למה שמתכוונים." },
      { instruction_he:"רישום: soutenu", prompt_fr:"Version soutenue de : « Il est vachement bien ce film ! »", trans_he:"נסחו ברישום ספרותי: «הסרט הזה מדהים!»", accepted:["Ce film est remarquable","Ce film est excellent","Ce film est exceptionnel"], solution_fr:"Ce film est remarquable / exceptionnel.", explanation_he:"vachement = סלנג. remarquable/exceptionnel = רשמי/ספרותי.", tip_he:"vachement bien → remarquable · super → excellent · nul → médiocre." },
    ],
    [ /* 4 — Idiomes avancés */
      { instruction_he:"idiome: avoir le cafard", prompt_fr:"Depuis son départ, elle a vraiment le ____.", trans_he:"מאז שהוא עזב, יש לה מרה שחורה ממש.", accepted:["cafard"], solution_fr:"avoir le cafard", explanation_he:"avoir le cafard = להיות בדכאון/במרה שחורה (idiome).", tip_he:"avoir le cafard · broyer du noir · ne pas avoir le moral." },
      { instruction_he:"idiome: casser les pieds", prompt_fr:"Arrête, tu me ____ avec tes questions !", trans_he:"תפסיק, אתה מציק לי עם השאלות שלך!", accepted:["casses les pieds","casses les pieds"], solution_fr:"tu me casses les pieds", explanation_he:"casser les pieds à qqn = להציק (idiome מדובר).", tip_he:"casser les pieds = להציק · casser les pieds à qqn = לעצבן מישהו." },
      { instruction_he:"idiome: mettre les pieds dans le plat", prompt_fr:"Il a vraiment mis les ____ dans le plat lors de la réunion.", trans_he:"הוא ממש הכניס את הרגליים לצלחת בפגישה.", accepted:["pieds"], solution_fr:"mettre les pieds dans le plat", explanation_he:"mettre les pieds dans le plat = לשים טלאי במקום הלא נכון / לפה פתוח.", tip_he:"mettre les pieds dans le plat = to put one's foot in it." },
    ],
    [ /* 5 — Littéraire */
      { instruction_he:"ביטוי ספרותי: souligner", prompt_fr:"L'auteur ____ l'importance du dialogue dans son œuvre.", trans_he:"הסופר מדגיש את חשיבות הדיאלוג ביצירתו.", accepted:["souligne","met en relief","accentue","met en exergue"], solution_fr:"souligne / met en relief", explanation_he:"souligner = להדגיש. mettre en exergue = להבליט (ספרותי).", tip_he:"souligner · mettre en relief · accentuer · mettre en exergue." },
      { instruction_he:"ביטוי ספרותי: paradigmatique", prompt_fr:"Ce roman est ____ de son époque.", trans_he:"הרומן הזה מייצג את תקופתו.", accepted:["paradigmatique","emblématique","représentatif"], solution_fr:"paradigmatique / emblématique", explanation_he:"paradigmatique = מייצג תקופה/מגמה. emblématique = מסמל.", tip_he:"paradigmatique · emblématique · symptomatique · caractéristique." },
      { instruction_he:"ביטוי ספרותי: prépondérant", prompt_fr:"La question du sens joue un rôle ____ dans ce texte.", trans_he:"שאלת המשמעות ממלאת תפקיד דומיננטי בטקסט זה.", accepted:["prépondérant","essentiel","central","fondamental"], solution_fr:"prépondérant", explanation_he:"prépondérant = דומיננטי, שולט. rôle prépondérant = תפקיד מוביל.", tip_he:"prépondérant · essentiel · fondamental · central · pivot." },
    ],
  ],
  /* stations: Débats · Littérature · Philosophie · Politique · Sciences · Arts */
  com: [
    [ /* 0 — Débats */
      { instruction_he:"קרא וענה", prompt_fr:"« Les réseaux sociaux ont transformé le débat public en amplifiant les voix marginales, mais au prix d'une fragmentation de l'espace commun et d'une radicalisation des opinions. »", trans_he:"הרשתות החברתיות שינו את השיח הציבורי על ידי הגברת קולות שוליים, אך במחיר פיצול המרחב המשותף.", question_fr:"Quel est l'effet paradoxal des réseaux sociaux sur le débat ?", q_he:"מה האפקט הפרדוקסלי של הרשתות על הדיון?", options:["Ils suppriment les voix marginales","Ils amplifient ces voix mais fragmentent l'espace commun","Ils unifient les opinions"], correct:1, explanation_he:"מגברים קולות שוליים אבל מפצלים את המרחב הציבורי." },
      { instruction_he:"קרא וענה", prompt_fr:"« Le numérique a profondément reconfiguré notre rapport au temps. L'immédiateté des échanges génère paradoxalement une nouvelle forme d'impatience qui érode notre capacité à la réflexion approfondie. »", trans_he:"הדיגיטלי מחדש את יחסנו לזמן. המיידיות יוצרת חוסר סבלנות ששוחק את יכולת ההרהור.", question_fr:"Quel est l'effet paradoxal du numérique ?", q_he:"מהו האפקט הפרדוקסלי?", options:["Il renforce la réflexion","Il génère de l'impatience qui érode la réflexion","Il améliore notre rapport au temps"], correct:1, explanation_he:"פרדוקס: מיידיות → חוסר סבלנות → שחיקת הרהור." },
      { instruction_he:"קרא וענה", prompt_fr:"« La démocratie délibérative suppose que la légitimité des décisions découle non du vote seul, mais de la qualité du débat qui le précède. »", trans_he:"הדמוקרטיה הדיונית מניחה שלגיטימיות ההחלטות נובעת מאיכות הדיון.", question_fr:"Qu'est-ce qui légitime une décision ?", q_he:"מה מעניק לגיטימיות?", options:["Le vote seul","La qualité du débat préalable","La décision des experts"], correct:1, explanation_he:"« qualité du débat qui le précède »." },
    ],
    [ /* 1 — Littérature */
      { instruction_he:"קרא וענה", prompt_fr:"« La littérature n'est pas un miroir du réel, mais un prisme qui le démultiplie, le déforme, le réinvente pour en révéler des vérités autrement inaccessibles. »", trans_he:"הספרות אינה מראה של המציאות, אלא פריזמה שמחדשת אותה כדי לחשוף אמיתות.", question_fr:"Quelle est la fonction de la littérature selon ce texte ?", q_he:"מה תפקיד הספרות?", options:["Reproduire fidèlement la réalité","Révéler des vérités à travers une transformation du réel","Distraire le lecteur"], correct:1, explanation_he:"« réinvente pour en révéler des vérités autrement inaccessibles »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Lire, c'est habiter temporairement une autre conscience, s'ouvrir à des modes d'être que la vie quotidienne ne permettrait jamais d'explorer. »", trans_he:"לקרוא זה לשהות זמנית בתודעה אחרת.", question_fr:"Que représente la lecture selon l'auteur ?", q_he:"מה מייצגת הקריאה?", options:["Une façon d'éviter la réalité","L'expérience temporaire d'une autre conscience","Un exercice purement intellectuel"], correct:1, explanation_he:"« habiter temporairement une autre conscience »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La traduction n'est jamais neutre : elle est toujours un acte d'interprétation, voire de création. »", trans_he:"תרגום אינו ניטרלי: הוא תמיד מעשה פרשנות ואף יצירה.", question_fr:"Que fait réellement le traducteur ?", q_he:"מה עושה המתרגם?", options:["Il copie des mots","Il interprète et crée","Il reste fidèle à l'original"], correct:1, explanation_he:"« acte d'interprétation, voire de création »." },
    ],
    [ /* 2 — Philosophie */
      { instruction_he:"קרא וענה", prompt_fr:"« L'essence même de la démocratie réside non dans l'unanimité des opinions, mais dans la capacité d'une société à tolérer la divergence des points de vue. »", trans_he:"מהות הדמוקרטיה ביכולת לסבול שונות בדעות.", question_fr:"Qu'est-ce qui caractérise une démocratie ?", q_he:"מה מאפיין דמוקרטיה?", options:["L'accord unanime","La tolérance envers la divergence","L'absence de débat"], correct:1, explanation_he:"« capacité à tolérer la divergence des points de vue »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Si la modernité a affranchi l'individu des contraintes collectives, elle l'a privé des cadres symboliques qui donnaient sens à son existence. »", trans_he:"המודרניות שחררה את הפרט אבל שללה ממנו את המסגרות הסמליות.", question_fr:"Quel est le paradoxe de la modernité ?", q_he:"מהו הפרדוקס של המודרניות?", options:["Elle a renforcé les liens sociaux","Elle libère mais prive de sens","Elle a supprimé toute contrainte"], correct:1, explanation_he:"שחרור + שלילת מסגרות סמליות = פרדוקס." },
      { instruction_he:"קרא וענה", prompt_fr:"« Le bonheur n'est pas un état mais un mouvement : il ne s'atteint pas, il se vit dans la quête elle-même. »", trans_he:"האושר אינו מצב אלא תנועה: חי בחיפוש עצמו.", question_fr:"Comment l'auteur définit-il le bonheur ?", q_he:"כיצד מגדיר הכותב את האושר?", options:["Comme un état stable","Comme un processus vécu dans la recherche","Comme une illusion"], correct:1, explanation_he:"« il se vit dans la quête elle-même »." },
    ],
    [ /* 3 — Politique */
      { instruction_he:"קרא וענה", prompt_fr:"« Le populisme se nourrit du sentiment d'abandon des classes moyennes, exploitant la méfiance envers les élites pour proposer des solutions simplistes à des problèmes complexes. »", trans_he:"הפופוליזם ניזון מתחושת נטישה ומנצל את חוסר האמון באליטות.", question_fr:"Comment le texte explique-t-il le populisme ?", q_he:"כיצד מסביר הטקסט את הפופוליזם?", options:["Comme une idéologie bien définie","Comme une exploitation du mécontentement","Comme un système stable"], correct:1, explanation_he:"« exploitant la méfiance envers les élites »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La souveraineté nationale et l'intégration européenne créent une dialectique permanente entre identité et appartenance à un espace politique plus large. »", trans_he:"ריבונות לאומית והשתלבות אירופאית יוצרים דיאלקטיקה.", question_fr:"Quelle tension le texte décrit-il ?", q_he:"איזה מתח?", options:["Entre droite et gauche","Entre souveraineté nationale et intégration européenne","Entre tradition et révolution"], correct:1, explanation_he:"« souveraineté nationale et l'intégration européenne »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La précarité économique génère une instabilité cognitive qui affecte la prise de décision et reproduit les inégalités. »", trans_he:"חוסר ביטחון כלכלי מייצר חוסר יציבות קוגניטיבי שמשכפל אי-שוויון.", question_fr:"Quel effet la précarité a-t-elle ?", q_he:"איזה השפעה?", options:["Elle renforce la décision","Elle crée instabilité et reproduit inégalités","Elle n'affecte que les finances"], correct:1, explanation_he:"« instabilité cognitive » + « reproduit les inégalités »." },
    ],
    [ /* 4 — Sciences */
      { instruction_he:"קרא וענה", prompt_fr:"« La science ne produit pas des vérités définitives, mais des modèles provisoires, constamment révisés à la lumière de nouvelles données. »", trans_he:"המדע אינו מייצר אמיתות סופיות, אלא מודלים זמניים.", question_fr:"Comment le texte décrit-il la science ?", q_he:"כיצד מתאר הטקסט את המדע?", options:["Comme une source de vérités définitives","Comme des modèles provisoires révisables","Comme une discipline figée"], correct:1, explanation_he:"« modèles provisoires, constamment révisés »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La notion de paradigme désigne l'ensemble des présupposés théoriques et méthodologiques partagés par une communauté scientifique. »", trans_he:"מושג הפרדיגמה מציין את ההנחות התיאורטיות שחולקת קהילה מדעית.", question_fr:"Que désigne le terme « paradigme » ?", q_he:"מה מציין «פרדיגמה»?", options:["Une découverte scientifique","L'ensemble des présupposés d'une communauté scientifique","Un outil de mesure"], correct:1, explanation_he:"« l'ensemble des présupposés théoriques et méthodologiques partagés »." },
      { instruction_he:"קרא וענה", prompt_fr:"« L'intelligence artificielle redéfinit les frontières entre créativité humaine et machine, posant des questions inédites sur la paternité des œuvres. »", trans_he:"בינה מלאכותית מגדירה מחדש את הגבולות בין יצירתיות אנושית למכונה.", question_fr:"Quelle question l'IA soulève-t-elle ?", q_he:"איזו שאלה מעלה הבינה המלאכותית?", options:["La vitesse de calcul","La paternité des œuvres créatives","Le coût de production"], correct:1, explanation_he:"« questions inédites sur la paternité des œuvres »." },
    ],
    [ /* 5 — Arts */
      { instruction_he:"קרא וענה", prompt_fr:"« L'art contemporain provoque souvent un sentiment d'incompréhension non par manque de talent, mais parce qu'il exige du spectateur une disposition à l'incertitude. »", trans_he:"האמנות העכשווית גורמת לאי-הבנה כי דורשת נכונות לחוסר ודאות.", question_fr:"Pourquoi l'art contemporain est-il parfois incompris ?", q_he:"מדוע אמנות עכשווית לא מובנת?", options:["À cause du manque de talent","Parce qu'il demande une tolérance à l'incertitude","Parce qu'il est trop traditionnel"], correct:1, explanation_he:"« exige du spectateur une disposition à l'incertitude »." },
      { instruction_he:"קרא וענה", prompt_fr:"« Le beau ne réside pas dans l'objet, mais dans la relation dynamique entre l'œuvre et le regard qui la reçoit, selon les catégories culturelles du spectateur. »", trans_he:"היופי אינו בחפץ אלא בקשר הדינמי בין היצירה ובין המבט.", question_fr:"Où réside le beau selon ce texte ?", q_he:"איפה נמצא היופי?", options:["Dans l'objet","Dans la relation entre l'œuvre et le regard","Dans les règles classiques"], correct:1, explanation_he:"« dans la relation dynamique entre l'œuvre et le regard »." },
      { instruction_he:"קרא וענה", prompt_fr:"« La musique est le seul art qui se consomme dans le temps, imposant au spectateur une durée, une tension narrative qui le soumet à son flux. »", trans_he:"המוזיקה היא האמנות היחידה הנצרכת בזמן, מטילה על הצופה משך ומתח נרטיבי.", question_fr:"Qu'est-ce qui rend la musique unique selon le texte ?", q_he:"מה הופך את המוזיקה לייחודית?", options:["Sa facilité d'accès","Elle se déploie dans le temps et impose une durée","Sa popularité"], correct:1, explanation_he:"« se consomme dans le temps, imposant une durée »." },
    ],
  ],
  /* stations: Débattre · Nuancer · Négocier · Analyser · Convaincre · Spontané */
  exp: [
    [ /* 0 — Débattre */
      { instruction_he:"הבע עמדה עם ניגוד", prompt_fr:"Que penses-tu du télétravail ? Donne ton avis en deux phrases.", trans_he:"מה דעתך על עבודה מרחוק?", model_fr:"Personnellement, je trouve que le télétravail offre une grande flexibilité. Cependant, il peut créer un sentiment d'isolement, c'est pourquoi je préfère un rythme hybride.", keys_fr:["personnellement","je trouve que","cependant","c'est pourquoi"], tip_he:"je trouve que · cependant · c'est pourquoi + עמדה." },
      { instruction_he:"debate: תמיכה בצד מסוים", prompt_fr:"Défendez l'idée que l'école devrait enseigner la philosophie dès l'école primaire.", trans_he:"הגנו על הרעיון שיש ללמד פילוסופיה כבר בבית ספר יסודי.", model_fr:"Enseigner la philosophie dès le plus jeune âge développe la pensée critique et la capacité à raisonner. De plus, cela habitue les enfants à questionner le monde et à formuler des arguments.", keys_fr:["dès le plus jeune âge","la pensée critique","de plus","habitue à","formuler des arguments"], tip_he:"dès (כבר מ-) · développe · habitue à · cela permet de." },
      { instruction_he:"debate: ניסוח עמדה מנומקת", prompt_fr:"Pensez-vous que l'art devrait être subventionné par l'État ?", trans_he:"לדעתכם, האם המדינה צריכה לסבסד אמנות?", model_fr:"Je pense que oui. L'art joue un rôle social essentiel en offrant un espace de réflexion collective. Sans soutien public, seuls les artistes issus de milieux aisés pourraient survivre.", keys_fr:["je pense que","joue un rôle essentiel","sans soutien public","milieux aisés"], tip_he:"joue un rôle (ממלא תפקיד) · sans + GN, + conditionnel · issus de." },
    ],
    [ /* 1 — Nuancer */
      { instruction_he:"גוון עמדה: הטכנולוגיה", prompt_fr:"Nuancez : « La technologie détruit le lien social. »", trans_he:"גוונו: «הטכנולוגיה הורסת את הקשר החברתי.»", model_fr:"Certes, les écrans peuvent substituer aux interactions réelles. Mais ils créent aussi de nouveaux liens. Il serait réducteur de condamner la technologie sans distinguer ses usages.", keys_fr:["certes","mais","il serait réducteur de","sans distinguer"], tip_he:"certes... mais · il est vrai que... néanmoins · on peut admettre que... cependant." },
      { instruction_he:"גוון: ניגוד מבוסס", prompt_fr:"Nuancez : « La mondialisation est une chance pour tous. »", trans_he:"גוונו: «הגלובליזציה היא הזדמנות לכולם.»", model_fr:"Si la mondialisation a permis à des millions de sortir de la pauvreté, elle a aussi creusé les inégalités et fragilisé les cultures locales.", keys_fr:["si ... a permis","elle a aussi","creusé les inégalités","fragilisé"], tip_he:"si (avantage) → elle a aussi (désavantage)." },
      { instruction_he:"גוון: הוסף פרספקטיבה", prompt_fr:"Ajoutez une nuance à : « Le travail est source d'épanouissement. »", trans_he:"הוסיפו גוון: «העבודה היא מקור לפיתוח אישי.»", model_fr:"Cette affirmation mérite d'être nuancée. Si certains trouvent dans leur travail un épanouissement réel, d'autres le vivent comme une contrainte ou une source de stress.", keys_fr:["mérite d'être nuancée","si certains","d'autres","une contrainte"], tip_he:"mérite d'être nuancé · si certains... d'autres · selon le contexte." },
    ],
    [ /* 2 — Négocier */
      { instruction_he:"ניהול משא ומתן: הצעה מנומסת", prompt_fr:"Proposez une solution de compromis dans une situation de conflit.", trans_he:"הציעו פתרון פשרה במצב קונפליקט.", model_fr:"Je comprends votre point de vue. Cependant, je vous propose une solution intermédiaire : nous pourrions partager les responsabilités de façon équitable.", keys_fr:["je comprends","cependant","je vous propose","une solution intermédiaire","de façon équitable"], tip_he:"je comprends · cependant · je vous propose · une solution intermédiaire." },
      { instruction_he:"משא ומתן: הצגת תנאים", prompt_fr:"Exposez vos conditions dans une négociation professionnelle.", trans_he:"הציגו את תנאיכם במשא ומתן מקצועי.", model_fr:"Je suis prêt à accepter cette mission, à condition que le délai soit prolongé de deux semaines et que les ressources nécessaires soient fournies.", keys_fr:["je suis prêt à","à condition que","le délai soit prolongé","les ressources soient fournies"], tip_he:"je suis prêt à · à condition que + subjonctif · à moins que." },
      { instruction_he:"משא ומתן: השגת הסכמה", prompt_fr:"Comment concluriez-vous une négociation réussie ?", trans_he:"כיצד הייתם מסיימים משא ומתן מוצלח?", model_fr:"En définitive, nous avons trouvé un terrain d'entente qui satisfait les deux parties. Je vous remercie de votre flexibilité et j'espère que cette collaboration sera fructueuse.", keys_fr:["en définitive","un terrain d'entente","qui satisfait","je vous remercie","fructueuse"], tip_he:"trouver un terrain d'entente · satisfaire les deux parties · être fructueux." },
    ],
    [ /* 3 — Analyser */
      { instruction_he:"ניתוח: בינה מלאכותית", prompt_fr:"L'intelligence artificielle représente-t-elle une menace ou une opportunité ? Nuancez.", trans_he:"האם בינה מלאכותית מהווה איום או הזדמנות?", model_fr:"Loin d'une opposition binaire, l'IA exige une lecture nuancée. Si ses applications médicales ouvrent des perspectives, le risque de surveillance demeure préoccupant.", keys_fr:["loin d'une opposition","exige une lecture nuancée","ouvrent des perspectives","demeure préoccupant"], tip_he:"loin d'une opposition · exige une lecture nuancée · demeure préoccupant." },
      { instruction_he:"ניתוח: השפעת הרשתות על הדמוקרטיה", prompt_fr:"Analysez les effets des réseaux sociaux sur la démocratie.", trans_he:"נתחו את השפעות הרשתות החברתיות על הדמוקרטיה.", model_fr:"D'un côté, les réseaux facilitent la mobilisation citoyenne. De l'autre, ils favorisent la désinformation et les chambres d'écho, fragmentant l'espace public.", keys_fr:["d'un côté","de l'autre","facilitent","désinformation","chambres d'écho"], tip_he:"d'un côté · de l'autre · par ailleurs · en outre." },
      { instruction_he:"ניתוח: ספרות ומציאות", prompt_fr:"Dans quelle mesure la littérature peut-elle changer notre vision du monde ?", trans_he:"באיזו מידה הספרות יכולה לשנות את השקפתנו על העולם?", model_fr:"La littérature, en nous plongeant dans d'autres existences, élargit notre empathie. En lisant Proust ou Camus, on perçoit la réalité sous un angle inédit.", keys_fr:["en nous plongeant","élargit notre empathie","sous un angle inédit","percevoir"], tip_he:"en + gérondif (= על ידי) · élargir (להרחיב) · sous un angle inédit." },
    ],
    [ /* 4 — Convaincre */
      { instruction_he:"שכנע: חשיבות הצרפתית", prompt_fr:"Rédigez une conclusion convaincante sur l'importance des langues étrangères.", trans_he:"כתבו מסקנה משכנעת על חשיבות שפות זרות.", model_fr:"En définitive, apprendre une langue étrangère n'est pas seulement un atout professionnel : c'est une ouverture sur le monde et un enrichissement humain irremplaçable.", keys_fr:["en définitive","n'est pas seulement","c'est une ouverture","enrichissement","irremplaçable"], tip_he:"en définitive · n'est pas seulement... c'est aussi · irremplaçable." },
      { instruction_he:"שכנע: תגובה להתנגדות", prompt_fr:"Quelqu'un dit : « L'art n'est pas utile. » Comment répondez-vous ?", trans_he:"מישהו אומר: «אמנות אינה שימושית.» כיצד תגיבו?", model_fr:"Je comprends ce point de vue, mais l'utilité n'est pas la seule valeur. L'art nourrit l'esprit et développe la créativité — une compétence essentielle aujourd'hui.", keys_fr:["je comprends","mais","nourrit l'esprit","développe","essentielle"], tip_he:"je comprends... mais · loin de là · bien au contraire." },
      { instruction_he:"שכנע: הגנה על ערך", prompt_fr:"Défendez l'importance de la lecture dans le monde numérique.", trans_he:"הגנו על חשיבות הקריאה בעולם הדיגיטלי.", model_fr:"À l'heure du tout-numérique, la lecture reste irremplaçable. Elle développe la concentration, enrichit le vocabulaire et stimule l'imagination d'une façon qu'aucun écran ne peut égaler.", keys_fr:["à l'heure de","irremplaçable","développe","enrichit","qu'aucun ... ne peut égaler"], tip_he:"à l'heure de (בעידן של) · irremplaçable · qu'aucun X ne peut égaler." },
    ],
    [ /* 5 — Spontané */
      { instruction_he:"ספונטני: תגובה היפותטית", prompt_fr:"Comment réagirais-tu si un ami annulait à la dernière minute ?", trans_he:"איך היית מגיב אם חבר מבטל ברגע האחרון?", model_fr:"Je serais déçu, mais je comprendrais s'il avait une bonne raison. Je lui proposerais de reporter plutôt que de me fâcher.", keys_fr:["je serais déçu","je comprendrais","je lui proposerais","plutôt que de"], tip_he:"conditionnel: je serais · je comprendrais · je proposerais." },
      { instruction_he:"ספונטני: מיומנות שתרצה", prompt_fr:"Si tu pouvais maîtriser une compétence instantanément, laquelle choisirais-tu ?", trans_he:"אם יכולת לרכוש מיומנות אחת מיידית, איזו היית בוחר?", model_fr:"Si je pouvais, je choisirais de jouer du piano. Ce serait une source de joie quotidienne et cela me permettrait d'exprimer des émotions autrement.", keys_fr:["si je pouvais","je choisirais","ce serait","cela me permettrait"], tip_he:"Si + imparfait → conditionnel: je choisirais · ce serait · je pourrais." },
      { instruction_here:"ספונטני: תאר יום אידיאלי", prompt_fr:"Décris ta journée de week-end idéale.", trans_he:"תאר את יום סוף השבוע האידיאלי שלך.", model_fr:"Ma journée idéale commencerait par un petit-déjeuner tranquille. Ensuite, je me promènerais en ville, puis je retrouverais des amis. Le soir, je regarderais un bon film.", keys_fr:["commencerait par","ensuite","puis","le soir"], tip_he:"conditionnel: commencerait · je me promènerais · je retrouverais." },
    ],
  ],
};

/* -------------------- BUILT-IN BANK (B2/C1 — kept for legacy reference, not used) -------------------- */
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

/* assembled bank */
const BANK = {
  A1: BANK_A1,
  A2: BANK_A2,
  B1: BANK_B1,
  B2: BANK_B2,
  C1: BANK_C1,
  C2: BANK_C2,
};

const pick = (arr, avoid, masteredSet = new Set()) => {
  let pool = arr.filter((_, i) => !masteredSet.has(i));
  if (pool.length === 0) pool = [...arr]; // all mastered — allow full rotation
  if (pool.length > 1 && avoid != null) pool = pool.filter((x) => arr.indexOf(x) !== avoid);
  if (pool.length === 0) pool = arr.filter((_, i) => !masteredSet.has(i));
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { item, idx: arr.indexOf(item) };
};

/* -------------------- progress service (Supabase cloud + localStorage fallback) --------------------
   All persistence goes through `cloudStore`. localStorage used as fallback when no userId. */
const SKILLS = ["gra", "voc", "com", "exp"];
const PKEY = "frenchup_progress_v2";
const PKEY_V1 = "frenchup_progress_v1";
const _mem = new Map();
const _hasLS = () => { try { return typeof window !== "undefined" && !!window.localStorage; } catch { return false; } };
const localStore = {
  get(k) { try { if (_hasLS()) { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } } catch (e) {} return _mem.has(k) ? _mem.get(k) : null; },
  set(k, v) { try { if (_hasLS()) { localStorage.setItem(k, JSON.stringify(v)); return; } } catch (e) {} _mem.set(k, v); },
};
const freshSkillMap = () => Object.fromEntries(SKILLS.map((s) => [s, { xp: 0, correct: 0 }]));
const freshProgress = () => ({
  xp: 0, streak: { count: 0, lastDay: null },
  bySkill: freshSkillMap(),
  byLevel: Object.fromEntries(LEVELS.map((l) => [l, freshSkillMap()])),
  history: [], mistakes: {}, badges: [], mastered: {}, displayName: "", lastPracticed: {},
});
function mergeProgress(p) {
  if (!p) return freshProgress();
  const base = freshProgress();
  const byLevel = Object.fromEntries(LEVELS.map((l) => [l, {
    ...base.byLevel[l],
    ...Object.fromEntries(SKILLS.map((s) => [s, { ...base.byLevel[l][s], ...(p.byLevel?.[l]?.[s] || {}) }])),
  }]));
  return { ...base, ...p, streak: { ...base.streak, ...(p.streak || {}) },
    bySkill: { ...base.bySkill, ...(p.bySkill || {}) }, byLevel,
    mistakes: p.mistakes || {}, history: p.history || [], badges: p.badges || [],
    mastered: p.mastered || {}, displayName: p.displayName || "",
    lastPracticed: p.lastPracticed || {} };
}
async function loadProgressCloud(userId) {
  if (!userId) {
    const p = localStore.get(PKEY) || localStore.get(PKEY_V1);
    return mergeProgress(p);
  }
  try {
    const { data } = await supabase.from("progress").select("data").eq("user_id", userId).single();
    return mergeProgress(data?.data);
  } catch { return freshProgress(); }
}
function loadProgress(userId) {
  // sync fallback for non-async callers (uses localStorage)
  if (!userId) {
    const p = localStore.get(PKEY) || localStore.get(PKEY_V1);
    return mergeProgress(p);
  }
  return freshProgress(); // will be replaced by async load on mount
}
async function saveProgress(p, userId) {
  if (!userId) { localStore.set(PKEY, p); return p; }
  try {
    await supabase.from("progress").upsert({ user_id: userId, data: p, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  } catch (e) { localStore.set(PKEY, p); } // fallback
  return p;
}
const dayKey = (d = new Date()) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };
function streakStatus(p) {
  const t = dayKey(), y = yesterdayKey();
  const { count = 0, lastDay = null } = p.streak || {};
  if (lastDay === t) return { count, active: true };
  if (lastDay === y) return { count, active: false };
  return { count: 0, active: false };
}
function recordAnswer(p, { skill, correct, xp, solution, level, masteryKey }) {
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
  if (masteryKey) {
    if (!p.mastered) p.mastered = {};
    if (correct) p.mastered[masteryKey] = true;
    else delete p.mastered[masteryKey];
  }
  return p;
}
function recordSession(p, { sessionXp, correct, total, level }) {
  const t = dayKey(), y = yesterdayKey();
  const s = p.streak || { count: 0, lastDay: null };
  if (s.lastDay !== t) { s.count = s.lastDay === y ? s.count + 1 : 1; s.lastDay = t; }
  p.streak = s;
  if (level) p.lastPracticed = { ...p.lastPracticed, [level]: t };
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

const LEVEL_COLORS = {
  // A1 — Candy Pastel: blue, orange, mint, pink
  A1: { gra: "#74C0FC", voc: "#FF9F43", com: "#55EFC4", exp: "#FD79A8" },
  // A2 — Tropical: cyan, coral, lime, golden yellow
  A2: { gra: "#00B4D8", voc: "#FF6B6B", com: "#6BCB77", exp: "#FFD93D" },
  // B1 — Classic Metro: royal blue, fire red, forest green, violet
  B1: { gra: "#1971C2", voc: "#E03131", com: "#2F9E44", exp: "#7048E8" },
  // B2 — Autumn Bold: deep purple, burnt orange, pine, raspberry
  B2: { gra: "#6741D9", voc: "#D9480F", com: "#2B8A3E", exp: "#C2255C" },
  // C1 — Jewel: sapphire, ruby, emerald, amethyst
  C1: { gra: "#0B3D91", voc: "#A50021", com: "#005C29", exp: "#6A0DAD" },
  // C2 — Nuit Parisienne: indigo, wine, jade, bronze
  C2: { gra: "#364FC7", voc: "#862E2E", com: "#1A6B3A", exp: "#744210" },
};

const LEVEL_DOT_COLORS = {
  A1: "#FF6B6B", A2: "#FF9F43", B1: "#6BCB77", B2: "#00B4D8", C1: "#1971C2", C2: "#6741D9",
};
const LEVEL_HE_LABELS = {
  A1: "מתחיל", A2: "בסיסי", B1: "עצמאי", B2: "מתקדם", C1: "שוטף", C2: "מומחה",
};

const METRO_STATIONS = {
  gra: [[120,155],[168,155],[210,188],[322,215],[372,225],[435,250]],
  voc: [[ 92,322],[155,298],[245,298],[328,330],[408,328],[432,342]],
  com: [[262, 68],[260,132],[272,230],[295,275],[310,355],[322,438]],
  exp: [[115,385],[168,360],[248,258],[338,256],[408,202],[430,172]],
};

const LANDMARKS = [
  { emoji: "🗼", label: "Tour Eiffel",      x: 152, y: 358, unlock: (d) => d.gra >= 1 },
  { emoji: "⛪", label: "Sacré-Cœur",       x: 205, y:  80, unlock: (d) => d.com >= 1 },
  { emoji: "🏛️",  label: "Arc de Triomphe", x:  92, y: 222, unlock: (d) => d.voc >= 2 },
  { emoji: "🖼️",  label: "Louvre",           x: 230, y: 172, unlock: (d) => d.gra >= 3 || d.com >= 3 },
  { emoji: "⛩️",  label: "Notre-Dame",       x: 268, y: 368, unlock: (d) => d.voc >= 4 },
  { emoji: "🎭", label: "Opéra Garnier",    x: 392, y: 262, unlock: (d) => d.exp >= 4 },
  { emoji: "🏰", label: "Versailles",       x: 362, y: 330, unlock: (d) => d.gra >= 5 && d.voc >= 5 && d.com >= 5 && d.exp >= 5 },
];
function weeklyXp(p) {
  const names = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const map = {};
  (p.history || []).forEach((h) => { const k = dayKey(new Date(h.date)); map[k] = (map[k] || 0) + (h.xp || 0); });
  const out = [];
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday); d.setDate(sunday.getDate() + i);
    return { d: names[d.getDay()], xp: Math.max(0, map[dayKey(d)] || 0) };
  });
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
// La Vie en Rose — Édith Piaf (G major)
const PARIS_MELODY = [
  ["G4", 0, 1.6, 0.58],
  ["B4", 1.8, 0.45, 0.52], ["C5", 2.35, 0.5, 0.56], ["B4", 2.95, 0.4, 0.48],
  ["A4", 3.45, 0.4, 0.44], ["G4", 3.95, 0.5, 0.42], ["E4", 4.55, 0.45, 0.38], ["D4", 5.1, 0.45, 0.36],
  ["G4", 5.7, 1.8, 0.44],
  ["B4", 8, 1.2, 0.58],
  ["D5", 9.4, 0.45, 0.5], ["E5", 9.95, 0.5, 0.56], ["D5", 10.55, 0.4, 0.48],
  ["C5", 11.05, 0.4, 0.44], ["B4", 11.55, 0.4, 0.42], ["A4", 12.05, 0.5, 0.48],
  ["G4", 12.7, 2.0, 0.44],
  // Chorus "La vie en rose"
  ["D5", 16, 1.8, 0.7],
  ["D5", 18.0, 0.35, 0.5], ["E5", 18.45, 0.4, 0.54], ["D5", 18.95, 0.35, 0.48],
  ["C5", 19.4, 0.35, 0.44], ["B4", 19.85, 0.35, 0.42], ["A4", 20.3, 0.45, 0.5],
  ["G4", 20.9, 2.2, 0.58],
  ["A4", 24.0, 0.35, 0.44], ["B4", 24.45, 0.35, 0.46], ["C5", 24.9, 0.4, 0.5],
  ["D5", 25.4, 0.45, 0.54], ["E5", 25.95, 1.3, 0.66],
  ["D5", 27.45, 0.4, 0.5], ["C5", 27.95, 0.35, 0.44], ["B4", 28.4, 0.35, 0.42],
  ["A4", 28.85, 0.45, 0.48], ["G4", 29.45, 1.7, 0.44],
  // Final chorus
  ["D5", 32, 1.8, 0.72],
  ["D5", 34.0, 0.35, 0.54], ["E5", 34.45, 0.4, 0.58], ["D5", 34.95, 0.35, 0.52],
  ["C5", 35.4, 0.35, 0.48], ["B4", 35.85, 0.35, 0.44], ["A4", 36.3, 0.45, 0.52],
  ["G4", 36.9, 1.8, 0.56],
  ["B4", 39.4, 0.5, 0.48], ["D5", 40.1, 0.5, 0.46], ["G5", 40.8, 1.2, 0.54],
  ["FS5", 42.2, 0.4, 0.44], ["E5", 42.75, 0.4, 0.46], ["D5", 43.3, 0.4, 0.42], ["G4", 44.0, 1.8, 0.5],
];
const PARIS_CHORDS = [
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "G3", notes: ["B4", "D5", "G5"] },
  { root: "D3", notes: ["FS4", "A4", "D5"] },
  { root: "D3", notes: ["A4", "C5", "FS4"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "E3", notes: ["E4", "G4", "B4"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "D3", notes: ["FS4", "A4", "C5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "C3", notes: ["E4", "G4", "C5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "D3", notes: ["FS4", "A4", "C5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "E3", notes: ["E4", "G4", "B4"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "D3", notes: ["FS4", "A4", "C5"] },
];
// Sous le Ciel de Paris — Juliette Gréco (C major)
const SEINE_MELODY = [
  ["C5", 0, 1.8, 0.52],
  ["B4", 2.0, 0.4, 0.44], ["A4", 2.5, 0.4, 0.42], ["G4", 3.0, 0.45, 0.44],
  ["E4", 3.55, 0.4, 0.38], ["D4", 4.05, 0.4, 0.36], ["C4", 4.55, 1.5, 0.44],
  ["G4", 6.3, 0.4, 0.44], ["A4", 6.8, 0.4, 0.46], ["C5", 7.35, 1.5, 0.52],
  ["E5", 9.2, 1.8, 0.58],
  ["D5", 11.3, 0.4, 0.48], ["C5", 11.8, 0.4, 0.46], ["B4", 12.3, 0.4, 0.42],
  ["A4", 12.85, 1.4, 0.46],
  ["G4", 14.6, 0.4, 0.42], ["A4", 15.1, 0.4, 0.44], ["C5", 15.65, 0.5, 0.5],
  ["E5", 16.35, 1.2, 0.56], ["G5", 17.8, 1.0, 0.54],
  ["F5", 19.0, 0.45, 0.48], ["E5", 19.55, 0.45, 0.46], ["D5", 20.1, 0.45, 0.44],
  ["C5", 20.65, 1.7, 0.5],
  ["A4", 22.6, 0.4, 0.44], ["B4", 23.1, 0.4, 0.46], ["C5", 23.65, 0.5, 0.52],
  ["E5", 24.35, 1.4, 0.56],
  ["D5", 26.0, 0.4, 0.46], ["C5", 26.5, 0.4, 0.44], ["B4", 27.0, 0.4, 0.42],
  ["A4", 27.55, 1.3, 0.46],
  ["G4", 29.2, 0.4, 0.42], ["A4", 29.75, 0.4, 0.44], ["C5", 30.3, 2.2, 0.52],
  ["G4", 33.5, 1.5, 0.4],
];
const SEINE_CHORDS = [
  { root: "C3", notes: ["E4", "G4", "C5"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "C3", notes: ["G4", "C5", "E5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "F3", notes: ["A4", "C5", "F5"] },
  { root: "C3", notes: ["E4", "G4", "C5"] },
  { root: "G3", notes: ["D4", "F4", "B4"] },
  { root: "C3", notes: ["E4", "G4", "C5"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "D3", notes: ["F4", "A4", "D5"] },
  { root: "G3", notes: ["D4", "F4", "B4"] },
];
// La Valse d'Amélie — Yann Tiersen (A minor waltz)
const MONTMARTRE_MELODY = [
  ["A4", 0, 0.5, 0.62],
  ["C5", 0.6, 0.75, 0.68], ["B4", 1.45, 0.4, 0.52], ["A4", 1.95, 0.4, 0.48],
  ["G4", 2.45, 0.4, 0.44], ["F4", 2.95, 0.4, 0.4], ["E4", 3.45, 1.2, 0.56],
  ["A4", 5.0, 0.45, 0.52],
  ["C5", 5.55, 0.55, 0.56], ["E5", 6.2, 1.0, 0.62],
  ["D5", 7.35, 0.4, 0.5], ["C5", 7.85, 0.4, 0.48], ["B4", 8.35, 0.4, 0.42],
  ["A4", 8.9, 1.0, 0.52],
  ["G4", 10.3, 0.45, 0.46], ["A4", 10.85, 0.45, 0.5], ["C5", 11.45, 0.7, 0.54],
  ["E5", 12.25, 1.0, 0.6], ["G5", 13.4, 0.55, 0.56],
  ["E5", 14.05, 0.4, 0.5], ["D5", 14.55, 0.4, 0.46],
  ["C5", 15.05, 0.4, 0.44], ["B4", 15.55, 0.45, 0.4], ["A4", 16.1, 1.0, 0.5],
  ["A4", 18, 0.5, 0.6],
  ["C5", 18.6, 0.7, 0.64], ["B4", 19.4, 0.4, 0.5], ["A4", 19.9, 0.4, 0.46],
  ["G4", 20.4, 0.35, 0.42], ["F4", 20.85, 0.35, 0.38], ["E4", 21.3, 0.55, 0.52],
  ["A4", 22.0, 0.4, 0.46], ["C5", 22.5, 0.4, 0.5], ["E5", 23.05, 0.8, 0.56],
];
const MONTMARTRE_CHORDS = [
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "F3", notes: ["A4", "C5", "F5"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "E3", notes: ["E4", "GS4", "B4"] },
  { root: "A2", notes: ["C5", "E5", "A5"] },
  { root: "F3", notes: ["A4", "C5", "F5"] },
  { root: "A2", notes: ["E4", "A4", "C5"] },
  { root: "E3", notes: ["E4", "GS4", "B4"] },
];
// Gymnopédie No.1 — Erik Satie (D major, very slow)
const RIVE_GAUCHE_MELODY = [
  ["D4", 0, 2.6, 0.44],
  ["E4", 2.8, 0.8, 0.42], ["FS4", 3.7, 0.8, 0.42], ["G4", 4.65, 0.8, 0.44],
  ["A4", 5.6, 2.5, 0.46],
  ["B4", 8.4, 0.8, 0.44], ["A4", 9.35, 0.8, 0.4], ["G4", 10.4, 0.8, 0.38],
  ["FS4", 11.45, 2.0, 0.44],
  ["D5", 14.5, 2.5, 0.48],
  ["B4", 17.2, 0.8, 0.44], ["A4", 18.2, 0.8, 0.4], ["G4", 19.25, 0.8, 0.38],
  ["FS4", 20.35, 0.7, 0.36], ["E4", 21.15, 0.7, 0.38], ["D4", 22.05, 2.4, 0.44],
  ["FS4", 25.4, 0.7, 0.38], ["A4", 26.2, 0.7, 0.42],
];
const RIVE_GAUCHE_CHORDS = [
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "D3", notes: ["FS4", "A4", "D5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "D3", notes: ["FS4", "A4", "D5"] },
  { root: "G3", notes: ["B4", "D5", "G5"] },
  { root: "D3", notes: ["FS4", "A4", "D5"] },
  { root: "G3", notes: ["D4", "G4", "B4"] },
  { root: "D3", notes: ["FS4", "A4", "D5"] },
  { root: "E3", notes: ["E4", "G4", "B4"] },
];
const MUSIC_THEMES = [
  { id: "salon", name: "La Vie en Rose", mood: "פסנתר ואקורדיון קאמרי", melody: PARIS_MELODY, chords: PARIS_CHORDS, beat: 0.58, loopBeats: 48, master: 0.24, wet: 0.32, filter: 6200, piano: 0.095, accordion: 0.028 },
  { id: "seine", name: "Sous le Ciel de Paris", mood: "נוקטורן רגוע על הנהר", melody: SEINE_MELODY, chords: SEINE_CHORDS, beat: 0.66, loopBeats: 36, master: 0.20, wet: 0.48, filter: 5000, piano: 0.11, accordion: 0.010 },
  { id: "montmartre", name: "La Valse d'Amélie", mood: "ואלס אקורדיון חי יותר", melody: MONTMARTRE_MELODY, chords: MONTMARTRE_CHORDS, beat: 0.38, loopBeats: 24, master: 0.22, wet: 0.28, filter: 6800, piano: 0.085, accordion: 0.048 },
  { id: "rive", name: "Gymnopédie No.1", mood: "לילה צרפתי איטי ועדין", melody: RIVE_GAUCHE_MELODY, chords: RIVE_GAUCHE_CHORDS, beat: 0.85, loopBeats: 27, master: 0.18, wet: 0.55, filter: 4800, piano: 0.11, accordion: 0.006 },
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
function Quest({ onExit, level = "B1", userId }) {
  const [phase, setPhase] = useState("intro");
  const [round, setRound] = useState(0);
  const [ex, setEx] = useState(null);
  const [answer, setAnswer] = useState("");
  const [showAllAccents, setShowAllAccents] = useState(false);
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
    loadProgressCloud(userId).then((p) => {
      progressRef.current = p;
      setTotalXp(p.xp);
      setStreak(streakStatus(p).count);
    });
    (CHECK_AVAILABLE === null ? probeCheck() : Promise.resolve(CHECK_AVAILABLE)).then(setCheckOn);
  }, [userId]);

  const loadExercise = (idx) => {
    setEx(null); setFeedback(null); setAnswer(""); setSelIdx(null);
    const r = ROUNDS[idx];
    const p = progressRef.current || loadProgress(userId);
    const correct = p.byLevel?.[level]?.[r.id]?.correct || 0;
    const stationIdx = Math.min(stationsDone(correct), STATIONS_PER - 1);
    const rawBank = BANK[level]?.[r.id] || BANK.B2[r.id];
    const bank = Array.isArray(rawBank[0]) ? (rawBank[stationIdx] || rawBank[rawBank.length - 1]) : rawBank;
    const prefix = `${level}:${r.id}:${stationIdx}:`;
    const masteredSet = new Set(
      Object.keys(p.mastered || {})
        .filter((k) => k.startsWith(prefix))
        .map((k) => +k.slice(prefix.length))
    );
    const { item, idx: chosen } = pick(bank, lastIdx.current[r.id], masteredSet);
    lastIdx.current[r.id] = chosen;
    const masteryKey = `${level}:${r.id}:${stationIdx}:${chosen}`;
    const type = r.id === "com" ? "mc" : r.id === "exp" ? "open" : "input";
    let exercise = { ...item, type, skill: r, masteryKey, stationIdx };
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
    const p = progressRef.current || loadProgress(userId);
    recordAnswer(p, { skill: cur.id, correct: fb.correct, xp: fb.xp || 0, solution: ex.solution_fr, level, masteryKey: ex.masteryKey });
    saveProgress(p, userId);
    progressRef.current = p;
    setTotalXp(p.xp);
    setSessionXp((x) => x + (fb.xp || 0));
    setResults((r) => [...r, { round: cur, correct: fb.correct, xp: fb.xp || 0, self: fb.selfCheck }]);
  };

  const COMMON_ACCENTS = ["à","é","è","ê","ë","î","ï","ô","ù","û","ü","ç","œ"];
  const ALL_ACCENTS = [
    "à","â","ä","á","é","è","ê","ë","î","ï","ô","ö","ù","û","ü","ç","œ","æ",
    "À","Â","Ä","Á","É","È","Ê","Ë","Î","Ï","Ô","Ö","Ù","Û","Ü","Ç","Œ","Æ"
  ];

  const addAccent = (ch) => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    const start = typeof el.selectionStart === "number" ? el.selectionStart : answer.length;
    const end = typeof el.selectionEnd === "number" ? el.selectionEnd : answer.length;
    const nextAnswer = answer.slice(0, start) + ch + answer.slice(end);
    setAnswer(nextAnswer);
    setTimeout(() => {
      el.focus();
      if (typeof el.setSelectionRange === "function") {
        el.setSelectionRange(start + 1, start + 1);
      }
    }, 0);
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
      const p = progressRef.current || loadProgress(userId);
      const correctCount = results.filter((r) => r.correct).length;
      recordSession(p, { sessionXp, correct: correctCount, total: results.length, level });
      saveProgress(p, userId);
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
        .accent-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; }
        .accent-row-full { margin-top:-4px; padding-bottom:8px; }
        .accent-btn, .accent-toggle { border:1px solid #D8CDAF; border-radius:10px; background:#fff; color:${INK}; padding:8px 10px; font-size:15px; cursor:pointer; transition:transform .12s, background .12s, border-color .12s; }
        .accent-btn:hover, .accent-toggle:hover { transform:translateY(-1px); border-color:${INK}; background:#FBF7EE; }
        .accent-btn:active, .accent-toggle:active { transform:translateY(1px); }
        .accent-toggle { margin-left:auto; font-weight:700; }
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
                  <>
                    <div className="accent-row" role="toolbar" aria-label="תוויה צרפתית">
                      {COMMON_ACCENTS.map((ch) => (
                        <button key={ch} type="button" className="accent-btn" onClick={() => addAccent(ch)}>{ch}</button>
                      ))}
                      <button type="button" className="accent-toggle" onClick={() => setShowAllAccents((v) => !v)}>
                        {showAllAccents ? "פחות סימנים" : "עוד סימנים"}
                      </button>
                    </div>
                    {showAllAccents && (
                      <div className="accent-row accent-row-full" role="toolbar" aria-label="סימנים צרפתיים נוספים">
                        {ALL_ACCENTS.map((ch) => (
                          <button key={ch} type="button" className="accent-btn" onClick={() => addAccent(ch)}>{ch}</button>
                        ))}
                      </div>
                    )}
                    {ex.type === "open"
                      ? <textarea ref={inputRef} rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="כתוב את תשובתך בצרפתית..." />
                      : <input ref={inputRef} className="ans" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="התשובה שלך בצרפתית..." />
                    }
                  </>
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
function ParisMetroMap({ p, selectedLevel, sel, onSel }) {
  const colors = LEVEL_COLORS[selectedLevel] || LEVEL_COLORS.B2;
  const done = Object.fromEntries(SKILLS.map((s) => [s, stationsDone(p.byLevel?.[selectedLevel]?.[s]?.correct || 0)]));
  const names = STATION_NAMES[selectedLevel] || STATION_NAMES.B2;

  const selInfo = sel
    ? (() => {
        const [sid, i] = sel.split("-");
        const sk = ROUNDS.find((r) => r.id === sid);
        return { sk, name: names[sid]?.[+i], idx: +i + 1 };
      })()
    : null;

  return (
    <div>
      <div style={{
        borderRadius: "50%",
        overflow: "hidden",
        aspectRatio: "1",
        maxWidth: 600,
        margin: "0 auto",
        boxShadow: "0 4px 28px rgba(0,0,0,0.14), 0 0 0 3px #C8BCA8",
      }}>
      <svg viewBox="0 0 520 520" style={{ width: "100%", display: "block" }}>
        <defs>
          <style>{`
            @keyframes pulse-ring { 0%{r:13;opacity:.7} 100%{r:21;opacity:0} }
            .pring{animation:pulse-ring 1.6s ease-out infinite;fill:none;stroke-width:2}
            @keyframes lm-glow { 0%,100%{opacity:.15} 50%{opacity:.30} }
            .lm-glow{animation:lm-glow 2.5s ease-in-out infinite}
          `}</style>
          <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#E8F4FD" />
            <stop offset="40%"  stopColor="#F5EFE6" />
            <stop offset="100%" stopColor="#EDE4D3" />
          </linearGradient>
          <radialGradient id="blob1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4E8FF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D4E8FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blob2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE4D6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFE4D6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blob3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D6F5E8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D6F5E8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blob4" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EEE0FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EEE0FF" stopOpacity="0" />
          </radialGradient>
          <pattern id="dotpat" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="11" cy="11" r="1" fill="#C8BFAE" opacity="0.6" />
          </pattern>
        </defs>

        {/* Background base */}
        <rect x="0" y="0" width="520" height="520" fill="url(#bg-grad)" />

        {/* Decorative district blobs */}
        <ellipse cx="130" cy="140" rx="155" ry="130" fill="url(#blob1)" />
        <ellipse cx="390" cy="380" rx="150" ry="130" fill="url(#blob2)" />
        <ellipse cx="270" cy="265" rx="130" ry="115" fill="url(#blob3)" />
        <ellipse cx="400" cy="100" rx="120" ry="105" fill="url(#blob4)" />

        {/* Dot grid texture */}
        <rect x="0" y="0" width="520" height="520" fill="url(#dotpat)" />


        {/* Seine river */}
        <path d="M40,358 C100,328 175,368 250,342 C325,316 385,358 455,330 C490,316 510,322 520,315"
          fill="none" stroke="#7BBCD9" strokeWidth="20" strokeLinecap="round" opacity="0.28" />
        <path d="M40,358 C100,328 175,368 250,342 C325,316 385,358 455,330 C490,316 510,322 520,315"
          fill="none" stroke="#A8D8F0" strokeWidth="12" strokeLinecap="round" opacity="0.45" />
        <path d="M40,358 C100,328 175,368 250,342 C325,316 385,358 455,330 C490,316 510,322 520,315"
          fill="none" stroke="#C8E8FA" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        <text x="148" y="354" fontSize="9" fill="#4A8AAF" fontStyle="italic" fontFamily="Georgia,serif" opacity="0.85">Seine</text>

        {/* Track base (gray under-rail) */}
        {ROUNDS.map((r) => (
          <polyline key={`bg-${r.id}`}
            points={METRO_STATIONS[r.id].map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none" stroke="#D2CABC" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Completed portion of each line */}
        {ROUNDS.map((r) => {
          const d = done[r.id];
          if (d < 1) return null;
          const pts = METRO_STATIONS[r.id].slice(0, d + 1);
          return (
            <polyline key={`fill-${r.id}`}
              points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="none" stroke={colors[r.id]} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: "stroke 0.4s" }} />
          );
        })}

        {/* Landmarks */}
        {LANDMARKS.map((lm) => {
          const unlocked = lm.unlock(done);
          return (
            <g key={lm.label} style={{ transition: "opacity 0.5s" }}>
              {/* Glow ring (unlocked only) */}
              {unlocked && <circle cx={lm.x} cy={lm.y + 14} r={24} fill="#C8A23A" className="lm-glow" />}
              {/* White backing circle */}
              <circle cx={lm.x} cy={lm.y + 14} r={18}
                fill={unlocked ? "#FFFDF5" : "#EDE8DC"}
                stroke={unlocked ? "#C8A23A" : "#C0B8A8"}
                strokeWidth={unlocked ? 2.5 : 1.5}
                opacity={unlocked ? 1 : 0.55} />
              {/* Emoji icon */}
              <text x={lm.x} y={lm.y + 20} fontSize="20" textAnchor="middle"
                style={{ filter: unlocked ? "none" : "grayscale(1) opacity(0.5)" }}>
                {lm.emoji}
              </text>
              {/* Label pill */}
              <rect x={lm.x - 34} y={lm.y + 36} width={68} height={14} rx={6}
                fill={unlocked ? INK : "#ADA598"} opacity={unlocked ? 1 : 0.6} />
              <text x={lm.x} y={lm.y + 46} fontSize="8" textAnchor="middle"
                fill="#ffffff" fontFamily="'Assistant',sans-serif" fontWeight="800">
                {lm.label}
              </text>
            </g>
          );
        })}

        {/* Station dots + labels */}
        {ROUNDS.map((r) => {
          const d = done[r.id];
          const color = colors[r.id];
          const stNames = names[r.id] || [];
          return METRO_STATIONS[r.id].map(([x, y], i) => {
            const isDone = i < d;
            const isCurrent = i === d;
            const isSel = sel === `${r.id}-${i}`;
            const label = stNames[i] || "";
            return (
              <g key={`${r.id}-${i}`} onClick={() => onSel(sel === `${r.id}-${i}` ? null : `${r.id}-${i}`)}
                style={{ cursor: "pointer" }}>
                {isCurrent && (
                  <circle cx={x} cy={y} className="pring" stroke={color} />
                )}
                <circle cx={x} cy={y}
                  r={isSel ? 11 : 9}
                  fill={isDone ? color : isCurrent ? "#fff" : "#EDE7D8"}
                  stroke={isDone || isCurrent ? color : "#B8B0A0"}
                  strokeWidth={isSel ? 3 : 2}
                  style={{ transition: "fill 0.3s,stroke 0.3s,r 0.15s" }} />
                {isCurrent && <circle cx={x} cy={y} r={4} fill={color} />}
                {isDone && <text x={x} y={y + 4} fontSize="8" textAnchor="middle" fill="#fff" fontWeight="700">✓</text>}
                <text
                  x={0} y={0}
                  fontSize="10"
                  textAnchor="middle"
                  fill={isDone || isCurrent ? color : "#6B6252"}
                  fontWeight={isSel || isCurrent ? "800" : "600"}
                  fontFamily="'Fraunces',serif"
                  fontStyle="italic"
                  stroke="rgba(255,255,255,0.95)"
                  strokeWidth="4"
                  paintOrder="stroke"
                  transform={`translate(${x},${y + 23}) rotate(-22)`}
                  style={{ pointerEvents: "none" }}>
                  {label}
                </text>
              </g>
            );
          });
        })}

      </svg>
      </div>

      {/* Legend pills below the circle */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 10 }}>
        {ROUNDS.map((r) => (
          <span key={r.id} style={{
            background: colors[r.id],
            color: "#fff",
            borderRadius: 999,
            padding: "4px 13px",
            fontWeight: 800,
            fontSize: 12,
            fontFamily: "'Assistant',sans-serif",
            letterSpacing: "0.01em",
          }}>
            {r.icon} {r.fr}
          </span>
        ))}
      </div>

      {selInfo && (
        <div className="sel-info" style={{ marginTop: 12 }}>
          תחנה {selInfo.idx} בקו <b style={{ color: colors[selInfo.sk.id] }}>{selInfo.sk.fr}</b>
          {" · "}{selInfo.sk.he}: <b>{selInfo.name}</b>
        </div>
      )}
    </div>
  );
}

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

function NameModal({ onSave }) {
  const [name, setName] = useState("");
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,26,46,0.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
      <div style={{ background:"#F5F0E8", borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:380, textAlign:"right", direction:"rtl", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
        <p style={{ fontSize:13, color:"#8A8270", marginBottom:6, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase" }}>Bienvenue · ברוך הבא</p>
        <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontStyle:"italic", fontWeight:600, fontSize:30, color:"#1A1A2E", margin:"0 0 20px", lineHeight:1.2 }}>
          איך קוראים לך?
        </h2>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && name.trim() && onSave(name.trim())}
          placeholder="שמך..."
          dir="rtl"
          style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"2px solid #DDD8CC", fontSize:16, fontFamily:"'Assistant',sans-serif", marginBottom:14, background:"#fff", outline:"none" }}
        />
        <button
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={!name.trim()}
          style={{ width:"100%", padding:14, borderRadius:12, border:"none", background:"#C8A23A", color:"#fff", fontSize:16, fontWeight:800, fontFamily:"'Assistant',sans-serif", cursor: name.trim() ? "pointer" : "default", opacity: name.trim() ? 1 : 0.5 }}
        >
          בואו נתחיל ←
        </button>
      </div>
    </div>
  );
}

function Dashboard({ onStart, selectedLevel, onLevelChange, userId }) {
  const [p, setP] = useState(null);
  const [sel, setSel] = useState(null);
  const [mapMode, setMapMode] = useState("metro");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const handleLogout = async () => { await supabase.auth.signOut(); };
  useEffect(() => {
    loadProgressCloud(userId).then((loaded) => {
      setP(loaded);
      if (!loaded.displayName) setShowNameModal(true);
    });
  }, [userId]);
  const handleNameSave = async (name) => {
    const updated = { ...p, displayName: name };
    setP(updated);
    setShowNameModal(false);
    await saveProgress(updated, userId);
  };
  if (!p) return null;
  const sStat = streakStatus(p);
  const practicedToday = p.lastPracticed?.[selectedLevel] === dayKey();
  const week = weeklyXp(p);
  const maxXp = Math.max(10, ...week.map((w) => w.xp));
  const totalCorrect = SKILLS.reduce((a, s) => a + (p.byLevel?.[selectedLevel]?.[s]?.correct || 0), 0);
  const selInfoLines = sel ? (() => { const [sid, i] = sel.split("-"); const sk = ROUNDS.find((r) => r.id === sid); return { sk, name: STATION_NAMES[selectedLevel]?.[sid]?.[+i], idx: +i + 1 }; })() : null;

  return (
    <>
    {showNameModal && <NameModal onSave={handleNameSave} />}
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
        .menu-wrap { position:relative; }
        .menu-btn { width:36px; height:36px; border-radius:10px; border:2px solid ${INK}; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; color:${INK}; transition:all .15s; font-family:'Assistant',sans-serif; }
        .menu-btn:hover { background:${INK}; color:#fff; }
        .menu-drop { position:absolute; left:0; top:44px; background:#fff; border-radius:12px; padding:6px; box-shadow:0 8px 30px rgba(0,0,0,.18),3px 3px 0 ${INK}; min-width:150px; z-index:100; border:2px solid ${INK}; }
        .menu-item { width:100%; padding:10px 14px; border:none; background:none; cursor:pointer; text-align:right; font-family:'Assistant',sans-serif; font-size:14px; font-weight:700; color:${INK}; border-radius:8px; display:flex; align-items:center; gap:8px; direction:rtl; }
        .menu-item:hover { background:${PAPER}; }
        .menu-item.danger { color:#E53E3E; }
        .menu-item.danger:hover { background:#FFF5F5; }
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
        .sel-info { margin-top:10px; padding:10px 14px; border-radius:12px; background:#F3EFE4; border:1.5px dashed ${INK}; font-size:14px; }
        .sel-info b { font-family:'Fraunces',serif; font-style:italic; }
        .week { display:flex; align-items:flex-end; justify-content:space-between; gap:8px; height:110px; margin-top:6px; }
        .bar-col { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; height:100%; justify-content:flex-end; }
        .bar { width:100%; max-width:30px; background:${INK}; border-radius:6px 6px 0 0; transition:height .8s cubic-bezier(.3,.8,.3,1); min-height:3px; }
        .bar.top { background:#E8503A; }
        .bar-d { font-size:12px; font-weight:700; color:#8A8270; }
        .bar-val { font-size:11px; font-weight:800; line-height:1; }
        .stat-line { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:22px; }
        .stat-box { flex:1; min-width:120px; background:#fff; border:2px solid ${INK}; border-radius:16px; padding:14px 16px; box-shadow:4px 4px 0 ${INK}; }
        .stat-num { font-family:'Fraunces',serif; font-size:30px; font-weight:600; line-height:1; }
        .stat-lbl { font-weight:700; color:#8A8270; font-size:13px; margin-top:4px; }
        .level-label { text-align:center; margin-bottom:10px; font-size:11px; font-weight:700; letter-spacing:.14em; color:#8A8270; text-transform:uppercase; }
        .level-label b { font-family:'Fraunces',serif; font-style:italic; font-size:13px; color:${INK}; letter-spacing:0; text-transform:none; }
        .tl-wrap { margin-top:16px; margin-bottom:8px; }
        .tl-track { position:relative; display:flex; justify-content:space-between; align-items:flex-start; padding:10px 8px 32px; direction:ltr; }
        .tl-rail { position:absolute; top:19px; left:8px; right:8px; height:4px; background:#E2DAC6; border-radius:4px; }
        .tl-fill { position:absolute; top:19px; left:8px; height:4px; background:${INK}; border-radius:4px; transition:width .5s cubic-bezier(.3,.8,.3,1); }
        .tl-dot { position:relative; display:flex; flex-direction:column; align-items:center; gap:10px; background:none; border:none; cursor:pointer; padding:0; z-index:1; }
        .tl-circle { width:22px; height:22px; border-radius:50%; border:3px solid #D4CEC0; background:#fff; transition:all .2s; display:block; }
        .tl-lbl { font-family:'Assistant'; font-weight:800; font-size:13px; color:#AAA; transition:color .2s; white-space:nowrap; }
        .tl-sub { font-family:'Assistant'; font-weight:600; font-size:10px; color:#BBB; white-space:nowrap; margin-top:-6px; transition:color .2s; }
        .tl-dot.past .tl-sub, .tl-dot.current .tl-sub { opacity:0.75; }
        .tl-dot.current .tl-circle { width:30px; height:30px; margin:-4px; }
        .tl-dot.current .tl-lbl { font-size:14px; font-weight:900; }
        .tl-dot:hover .tl-circle { transform:scale(1.2); }
        .view-btn { font-family:'Assistant'; font-weight:700; font-size:13px; padding:7px 15px; border:2px solid ${INK}; border-radius:10px; cursor:pointer; background:#fff; color:${INK}; transition:background .15s,color .15s; }
        .view-btn.active { background:${INK}; color:${PAPER}; }
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
      `}</style>

      <div className="d-top">
        <span className="d-brand">French<b>Up</b></span>
        <div className="d-right">
          <span className="d-streak">🔥 <span className="nums">{sStat.count}</span></span>
          <span className="d-xp">⭐ <span className="nums">{p.xp}</span> XP</span>
          <div className="menu-wrap">
            <button className="menu-btn" onClick={() => setShowMenu((m) => !m)}>⋮</button>
            {showMenu && (
              <div className="menu-drop">
                <button className="menu-item danger" onClick={handleLogout}>🚪 התנתק</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="tl-wrap">
          <p className="level-label"><b>NIVEAU</b> · רמת לימוד</p>
          <div className="tl-track">
            <div className="tl-rail" />
            <div className="tl-fill" style={{ width: `${(LEVELS.indexOf(selectedLevel) / (LEVELS.length - 1)) * 100}%`, background: LEVEL_DOT_COLORS[selectedLevel] }} />
            {LEVELS.map((l) => {
              const idx = LEVELS.indexOf(l);
              const selIdx = LEVELS.indexOf(selectedLevel);
              const color = LEVEL_DOT_COLORS[l];
              const isPast = idx < selIdx;
              const isCurrent = l === selectedLevel;
              return (
                <button key={l}
                  className={`tl-dot ${isPast ? "past" : ""} ${isCurrent ? "current" : ""}`}
                  onClick={() => { onLevelChange(l); setSel(null); }}>
                  <span className="tl-circle" style={{
                    borderColor: color,
                    background: (isPast || isCurrent) ? color : "#fff",
                    ...(isCurrent ? { boxShadow: `0 0 0 5px ${color}44` } : {}),
                  }} />
                  <span className="tl-lbl" style={{ color: (isPast || isCurrent) ? color : "#AAA" }}>{l}</span>
                  <span className="tl-sub" style={{ color: (isPast || isCurrent) ? color : "#BBB" }}>{LEVEL_HE_LABELS[l]}</span>
                </button>
              );
            })}
          </div>
        </div>

      <div className="hero">
        <div className="hero-eye">בונז'ור{p.displayName ? `, ${p.displayName}` : ""} 👋 · רמה {selectedLevel}</div>
        <h1>{practicedToday ? `כבר התאמנת היום ברמה ${selectedLevel} — עוד סבב?` : `מוכן לאתגר ${selectedLevel}?`}</h1>
        <button className="hero-cta" onClick={onStart}>התחל אתגר ←</button>
      </div>

      <div className="stat-line">
        <div className="stat-box"><div className="stat-num" style={{ color: "#E8503A" }}>{sStat.count}</div><div className="stat-lbl">ימים רצוף 🔥</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color: GOLD }}>{p.xp}</div><div className="stat-lbl">XP כולל ⭐</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color: "#0E9F6E" }}>{totalCorrect}</div><div className="stat-lbl">תשובות נכונות ✓</div></div>
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div className="card-eyebrow" style={{ margin: 0 }}>Plan du progrès · ההתקדמות שלך</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className={`view-btn ${mapMode === "metro" ? "active" : ""}`} onClick={() => { setMapMode("metro"); setSel(null); }}>🗺️ פריז</button>
            <button className={`view-btn ${mapMode === "lines" ? "active" : ""}`} onClick={() => { setMapMode("lines"); setSel(null); }}>≡ קווים</button>
          </div>
        </div>
        <h2 className="card-title">המסע שלך ברמה {selectedLevel} — תחנה לכל 3 תשובות נכונות</h2>
        {mapMode === "metro" ? (
          <ParisMetroMap p={p} selectedLevel={selectedLevel} sel={sel} onSel={setSel} />
        ) : (
          <>
            {ROUNDS.map((skill, i) => (
              <MetroLine key={skill.id + selectedLevel} skill={skill} idx={i}
                correct={p.byLevel?.[selectedLevel]?.[skill.id]?.correct || 0}
                sel={sel} onSel={setSel} level={selectedLevel} />
            ))}
            {selInfoLines && (
              <div className="sel-info">תחנה {selInfoLines.idx} בקו <b style={{ color: selInfoLines.sk.color }}>{selInfoLines.sk.fr}</b> · {selInfoLines.sk.he}: <b>{selInfoLines.name}</b></div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <div className="card-eyebrow">Cette semaine · השבוע</div>
        <h2 className="card-title">XP ב-7 הימים האחרונים</h2>
        <div className="week">
          {week.map((w, i) => {
            const isTop = w.xp === maxXp && w.xp > 0;
            return (
              <div className="bar-col" key={i}>
                {w.xp > 0 && <span className="bar-val" style={{ color: isTop ? "#E8503A" : INK }}>{w.xp}</span>}
                <div className={`bar ${isTop ? "top" : ""}`} style={{ height: `${(w.xp / maxXp) * 100}%` }} title={`${w.xp} XP`} />
                <span className="bar-d">{w.d}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}

/* ==================================================================== */
/*  APP — single page, internal transitions between dashboard & quest   */
/* ==================================================================== */
export default function App({ userId }) {
  const [view, setView] = useState("dashboard");
  const [tick, setTick] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(() => localStore.get(LKEY) || "B1");
  const handleLevelChange = (l) => { setSelectedLevel(l); localStore.set(LKEY, l); };
  return (
    <>
      <ParisMusicButton />
      {view === "dashboard"
        ? <Dashboard key={tick} selectedLevel={selectedLevel} onLevelChange={handleLevelChange} onStart={() => setView("quest")} userId={userId} />
        : <Quest level={selectedLevel} userId={userId} onExit={() => { setTick((t) => t + 1); setView("dashboard"); }} />}
    </>
  );
}
