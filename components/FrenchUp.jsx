"use client";
import React, { useState, useRef, useEffect } from "react";

/* ============================================================
   FrenchUp — Daily Quest (Next.js)
   B2/C1 quest with local grading, tap-to-translate, -15 XP on
   wrong answers. Audio uses a NEURAL voice via /api/tts
   (ElevenLabs), with automatic fallback to the device voice.
   ============================================================ */

const INK = "#16203A";
const PAPER = "#F6F2E9";
const GOLD = "#C8A23A";

const ROUNDS = [
  { id: "gra", he: "דקדוק", fr: "Grammaire", color: "#2563EB", icon: "✍️" },
  { id: "voc", he: "אוצר מילים", fr: "Vocabulaire", color: "#E8503A", icon: "🃏" },
  { id: "com", he: "הבנה", fr: "Compréhension", color: "#0E9F6E", icon: "📖" },
  { id: "exp", he: "דיבור", fr: "Expression", color: "#8B5CF6", icon: "💬" },
];

/* -------------------- BUILT-IN BANK (B2/C1) -------------------- */
const BANK = {
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

const pick = (arr, avoid) => {
  const pool = arr.length > 1 && avoid != null ? arr.filter((_, i) => i !== avoid) : arr;
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { item, idx: arr.indexOf(item) };
};

/* -------------------- progress service (localStorage now, cloud later) --------------------
   All persistence goes through `store`. To move to a cloud backend later,
   swap ONLY the two methods in `store` for API calls — nothing else changes. */
const SKILLS = ["gra", "voc", "com", "exp"];
const PKEY = "frenchup_progress_v1";
const _mem = new Map();
const _hasLS = () => { try { return typeof window !== "undefined" && !!window.localStorage; } catch { return false; } };
const store = {
  get(k) { try { if (_hasLS()) { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } } catch (e) {} return _mem.has(k) ? _mem.get(k) : null; },
  set(k, v) { try { if (_hasLS()) { localStorage.setItem(k, JSON.stringify(v)); return; } } catch (e) {} _mem.set(k, v); },
};
const freshProgress = () => ({
  xp: 0, streak: { count: 0, lastDay: null },
  bySkill: Object.fromEntries(SKILLS.map((s) => [s, { xp: 0, correct: 0 }])),
  history: [], mistakes: {}, badges: [],
});
function loadProgress() {
  const p = store.get(PKEY);
  if (!p) return freshProgress();
  const base = freshProgress();
  return { ...base, ...p,
    streak: { ...base.streak, ...(p.streak || {}) },
    bySkill: { ...base.bySkill, ...(p.bySkill || {}) },
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
function recordAnswer(p, { skill, correct, xp, solution }) {
  p.xp = Math.max(0, p.xp + (xp || 0));
  if (p.bySkill[skill]) {
    p.bySkill[skill].xp = Math.max(0, (p.bySkill[skill].xp || 0) + (xp || 0));
    if (correct) p.bySkill[skill].correct = (p.bySkill[skill].correct || 0) + 1;
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
  gra: ["Subjonctif", "Conditionnel", "Disc. indirect", "Concordance", "Gérondif", "Style"],
  voc: ["Émotions", "Travail", "Actualités", "Culture", "Argot", "Littéraire"],
  com: ["Dialogues", "Podcasts", "Le journal", "Cinéma", "Débats", "Accents"],
  exp: ["Présenter", "Opinion", "Débattre", "Négocier", "Nuances", "Spontané"],
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
async function evaluateOpen(ex, answer) {
  const res = await fetch("/api/check", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt_fr: ex.prompt_fr, instruction_he: ex.instruction_he, answer }),
  });
  if (!res.ok) throw new Error("check " + res.status);
  const d = await res.json();
  if (d.error) throw new Error(d.error);
  const score = Math.max(0, Math.min(100, Number(d.score) || 0));
  const correct = score >= 70 && d.answers_question !== false;
  const xp = score >= 85 ? 50 : score >= 60 ? 30 : -15;
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
function Quest({ onExit }) {
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
    const { item, idx: chosen } = pick(BANK[r.id], lastIdx.current[r.id]);
    lastIdx.current[r.id] = chosen;
    const type = r.id === "com" ? "mc" : r.id === "exp" ? "open" : "input";
    setEx({ ...item, type, skill: r });
  };

  const start = () => { setPhase("playing"); setRound(0); setSessionXp(0); setResults([]); loadExercise(0); };
  useEffect(() => { if (ex && ex.type !== "mc" && inputRef.current) inputRef.current.focus(); }, [ex]);
  const fmtXp = (n) => (n >= 0 ? "+" + n : "" + n);

  const applyFeedback = (fb) => {
    setFeedback(fb);
    const p = progressRef.current || loadProgress();
    recordAnswer(p, { skill: cur.id, correct: fb.correct, xp: fb.xp || 0, solution: ex.solution_fr });
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
    if (!checkOn) { applyFeedback(gradeOpen(ex)); return; }
    setChecking(true);
    try {
      const fb = await evaluateOpen(ex, answer);
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
                      <button className="btn btn-primary" onClick={next}>{round + 1 >= ROUNDS.length ? "סיים אתגר 🎉" : "הסבב הבא ←"}</button>
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
function MetroLine({ skill, correct, idx, sel, onSel }) {
  const names = STATION_NAMES[skill.id];
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

function Dashboard({ onStart }) {
  const [p, setP] = useState(null);
  const [sel, setSel] = useState(null);
  useEffect(() => { setP(loadProgress()); }, []);
  if (!p) return null;
  const sStat = streakStatus(p);
  const week = weeklyXp(p);
  const maxXp = Math.max(10, ...week.map((w) => w.xp));
  const totalCorrect = SKILLS.reduce((a, s) => a + (p.bySkill[s]?.correct || 0), 0);
  const selInfo = sel ? (() => { const [sid, i] = sel.split("-"); const sk = ROUNDS.find((r) => r.id === sid); return { sk, name: STATION_NAMES[sid][+i], idx: +i + 1 }; })() : null;

  return (
    <div dir="rtl" className="dash">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500;1,9..144,600&display=swap');
        * { box-sizing: border-box; }
        .dash { font-family:'Assistant',system-ui,sans-serif; color:${INK};
          background: radial-gradient(circle at 12% 0%, #FBF7EE, ${PAPER} 45%), ${PAPER};
          min-height:100vh; padding: clamp(16px,3vw,40px); max-width:820px; margin:0 auto; }
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
      `}</style>

      <div className="d-top">
        <span className="d-brand">French<b>Up</b></span>
        <div className="d-right">
          <span className="d-streak">🔥 <span className="nums">{sStat.count}</span></span>
          <span className="d-xp">⭐ <span className="nums">{p.xp}</span> XP</span>
        </div>
      </div>

      <div className="hero">
        <div className="hero-eye">בונז'ור 👋 · אתגר היום</div>
        <h1>{sStat.active ? "כבר התאמנת היום — אפשר עוד סבב!" : "מוכן לאתגר היומי?"}</h1>
        <button className="hero-cta" onClick={onStart}>התחל אתגר יומי ←</button>
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
          <MetroLine key={skill.id} skill={skill} idx={i} correct={p.bySkill[skill.id]?.correct || 0} sel={sel} onSel={setSel} />
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
  return view === "dashboard"
    ? <Dashboard key={tick} onStart={() => setView("quest")} />
    : <Quest onExit={() => { setTick((t) => t + 1); setView("dashboard"); }} />;
}
