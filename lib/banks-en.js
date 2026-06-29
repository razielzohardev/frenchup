/**
 * English translations for all exercise banks.
 * Each exercise object mirrors the Hebrew exercise at the same index.
 * French text (prompt_fr, accepted, solution_fr, question_fr, model_fr, keys_fr) is NEVER translated.
 * Fields added: instruction_en, trans_en, explanation_en, tip_en
 * com exercises also add: q_en
 * exp exercises add: instruction_en, tip_en
 */

export const BANKS_EN = {
  /* ============================================================ A1 ============================================================ */
  A1: {
    gra: [
      [ /* 0 — être/avoir */
        { instruction_en:"Fill in the correct form of être", trans_en:"I am a student.", explanation_en:"First person singular of être: je suis.", tip_en:"être: je suis · tu es · il/elle est · nous sommes · vous êtes · ils sont." },
        { instruction_en:"Fill in the correct form of avoir", trans_en:"She has a cat.", explanation_en:"avoir in third person singular: il/elle a.", tip_en:"avoir: j'ai · tu as · il/elle a · nous avons · vous avez · ils ont." },
        { instruction_en:"être or avoir?", trans_en:"We are happy.", explanation_en:"être in first person plural: nous sommes.", tip_en:"nous sommes (être) · nous avons (avoir) — both are essential!" },
      ],
      [ /* 1 — Articles */
        { instruction_en:"Fill in the correct article (le / la)", trans_en:"The sun is shining today.", explanation_en:"soleil is masculine → le soleil.", tip_en:"le = masculine singular · la = feminine singular · les = plural." },
        { instruction_en:"Fill in the correct article (un / une)", trans_en:"It's an interesting book.", explanation_en:"livre is masculine → un. une = feminine.", tip_en:"un garçon · une fille · un livre · une table." },
        { instruction_en:"Fill in the partitive article (du / de la)", trans_en:"I eat cheese.", explanation_en:"fromage is masculine + undefined quantity = du (=de+le).", tip_en:"du (masc.) · de la (fem.) · de l' (vowel) · des (plural)." },
      ],
      [ /* 2 — Pluriel */
        { instruction_en:"Fill in the plural form", trans_en:"The cats are cute.", explanation_en:"Most nouns add -s in the plural.", tip_en:"chien→chiens · livre→livres · ami→amis." },
        { instruction_en:"Plural ending in -aux", trans_en:"The newspapers are on the table.", explanation_en:"Nouns ending in -al become -aux in the plural: journal→journaux.", tip_en:"journal→journaux · animal→animaux · cheval→chevaux." },
        { instruction_en:"Change to plural", trans_en:"The boys are tall.", explanation_en:"le→les, est→sont, grand→grands (adjective agreement).", tip_en:"Adjectives agree in gender and number: grand/grands." },
      ],
      [ /* 3 — Négation */
        { instruction_en:"Add negation (ne...pas)", trans_en:"I don't eat meat.", explanation_en:"ne + verb + pas. After negation: de instead of du/de la.", tip_en:"ne...pas wraps around the verb." },
        { instruction_en:"Negation of frequency (ne...jamais)", trans_en:"He never smokes.", explanation_en:"ne...jamais = never. ne before the verb, jamais after.", tip_en:"jamais = never · toujours = always · souvent = often." },
        { instruction_en:"Negation (ne...plus)", trans_en:"I no longer live in Lyon.", explanation_en:"ne...plus = no longer. ne before the verb, plus after.", tip_en:"ne...plus (no longer) · ne...rien (nothing) · ne...personne (nobody)." },
      ],
      [ /* 4 — Adjectifs */
        { instruction_en:"Feminine form of the adjective", trans_en:"Marie is an intelligent student.", explanation_en:"intelligent→intelligente: add -e.", tip_en:"grand→grande · petit→petite · content→contente." },
        { instruction_en:"Feminine adjective with special ending", trans_en:"My neighbor is very nice.", explanation_en:"gentil→gentille: double -l and add -e.", tip_en:"gentil→gentille · nul→nulle · cruel→cruelle." },
        { instruction_en:"Masculine plural adjective", trans_en:"The children are happy.", explanation_en:"Masculine plural: content→contents. Add -s.", tip_en:"content/contente/contents/contentes." },
      ],
      [ /* 5 — Questions */
        { instruction_en:"Form a question with est-ce que", trans_en:"Do you speak French?", explanation_en:"est-ce que + subject + verb = neutral question.", tip_en:"Est-ce que tu...? · Tu...? (intonation) · Parles-tu...? (formal)." },
        { instruction_en:"Question word: what", trans_en:"What do you do on weekends?", explanation_en:"Qu'est-ce que = what (object). Qu'est-ce que tu fais? = What do you do?", tip_en:"Qu'est-ce que (what) · Qui (who) · Où (where) · Quand (when)." },
        { instruction_en:"Question word: where", trans_en:"Where do you live? — In Paris.", explanation_en:"Où = where. Formal question: Où + verb + subject (inversion).", tip_en:"Où (where) · Quand (when) · Comment (how) · Pourquoi (why)." },
      ],
    ],
    voc: [
      [ /* 0 — Salutations */
        { instruction_en:"Translate: 'hello / good morning'", trans_en:"Hello! How are you?", explanation_en:"Bonjour = hello/good morning (formal). Salut = hi (informal).", tip_en:"Bonjour (daytime) · Bonsoir (evening) · Salut (informal)." },
        { instruction_en:"Translate: 'thank you very much'", trans_en:"Thank you very much!", explanation_en:"Merci = thank you. Merci beaucoup = thank you very much.", tip_en:"De rien = you're welcome · Avec plaisir = with pleasure." },
        { instruction_en:"Translate: 'goodbye'", trans_en:"Goodbye! See you tomorrow.", explanation_en:"Au revoir = goodbye. À bientôt = see you soon.", tip_en:"Au revoir · À bientôt · À demain · À tout à l'heure." },
      ],
      [ /* 1 — Famille */
        { instruction_en:"Translate: 'my mother'", trans_en:"My mother's name is Sophie.", explanation_en:"mère = mother (formal) · maman = mom (affectionate).", tip_en:"père = father · mère = mother · frère = brother · sœur = sister." },
        { instruction_en:"Translate: 'my father'", trans_en:"My father's name is Pierre.", explanation_en:"père = father. mon = my (masc.). mon père = my father.", tip_en:"mon père · ma mère · mon frère · ma sœur · mes parents." },
        { instruction_en:"Translate: 'two brothers'", trans_en:"I have two brothers.", explanation_en:"frère = brother, frères = brothers (plural + article des drops with numbers).", tip_en:"frère = brother · sœur = sister · cousin(e) = cousin · oncle = uncle." },
      ],
      [ /* 2 — Couleurs */
        { instruction_en:"Translate: 'blue'", trans_en:"The sky is blue.", explanation_en:"bleu = blue. Colors usually don't change with articles.", tip_en:"rouge · bleu · vert · jaune · blanc · noir · gris · orange." },
        { instruction_en:"Translate: 'red'", trans_en:"The rose is red.", explanation_en:"rouge = red. rouge doesn't change for feminine.", tip_en:"rouge (red) · bleu (blue) · vert (green) · jaune (yellow)." },
        { instruction_en:"Translate: 'black and white'", trans_en:"The cat is black and white.", explanation_en:"noir = black · blanc = white. Both don't change with le chat.", tip_en:"noir/noire · blanc/blanche (feminine differs!) · gris/grise." },
      ],
      [ /* 3 — Chiffres */
        { instruction_en:"Translate: 'five'", trans_en:"I am five years old.", explanation_en:"cinq = 5. un·deux·trois·quatre·cinq.", tip_en:"1-10: un·deux·trois·quatre·cinq·six·sept·huit·neuf·dix." },
        { instruction_en:"Translate: 'twelve'", trans_en:"There are twelve months in the year.", explanation_en:"douze = 12. onze(11)·douze(12)·treize(13).", tip_en:"11-15: onze·douze·treize·quatorze·quinze." },
        { instruction_en:"Translate: 'thirty'", trans_en:"He is thirty years old.", explanation_en:"trente = 30. vingt(20)·trente(30)·quarante(40).", tip_en:"tens: vingt·trente·quarante·cinquante·soixante." },
      ],
      [ /* 4 — Jours */
        { instruction_en:"Translate: 'Monday'", trans_en:"Today is Monday.", explanation_en:"Days: lundi·mardi·mercredi·jeudi·vendredi·samedi·dimanche.", tip_en:"The week starts on lundi (Monday) in French." },
        { instruction_en:"Translate: 'Friday evening'", trans_en:"See you Friday evening.", explanation_en:"vendredi = Friday, soir = evening. Days of the week usually without article.", tip_en:"lundi·mardi·mercredi·jeudi·vendredi·samedi·dimanche." },
        { instruction_en:"Translate: 'on the weekend'", trans_en:"I rest on the weekend.", explanation_en:"le week-end = on the weekend (samedi + dimanche).", tip_en:"le week-end · samedi soir · dimanche matin." },
      ],
      [ /* 5 — Objets */
        { instruction_en:"Translate: 'books'", trans_en:"I like reading books.", explanation_en:"livre = book (masc.). des livres = books.", tip_en:"un livre · un stylo · une table · une chaise · une fenêtre." },
        { instruction_en:"Translate: 'pencil'", trans_en:"Do you have a pencil?", explanation_en:"crayon = pencil · stylo = pen. Both masculine.", tip_en:"un crayon · un stylo · une gomme (eraser) · une règle (ruler)." },
        { instruction_en:"Translate: 'table'", trans_en:"Put your bag on the table.", explanation_en:"table = table (feminine). sur la table = on the table.", tip_en:"une table · une chaise · un bureau · une fenêtre · une porte." },
      ],
    ],
    com: [
      [ /* 0 — Au café */
        { instruction_en:"Read and answer", q_en:"How much does the coffee cost?", explanation_en:"« C'est deux euros » = It costs two euros." },
        { instruction_en:"Read and answer", q_en:"What does the person order?", explanation_en:"« un croissant et un jus d'orange »." },
        { instruction_en:"Read and answer", q_en:"How does the customer want to pay?", explanation_en:"« Je paye par carte » = I'm paying by card." },
      ],
      [ /* 1 — À l'école */
        { instruction_en:"Read and answer", q_en:"When does Marie do sport?", explanation_en:"« Le mercredi, elle fait du sport »." },
        { instruction_en:"Read and answer", q_en:"What time do classes start?", explanation_en:"« Les cours commencent à huit heures »." },
        { instruction_en:"Read and answer", q_en:"What is Lucas's favorite subject?", explanation_en:"« Sa matière préférée est le dessin »." },
      ],
      [ /* 2 — La famille */
        { instruction_en:"Read and answer", q_en:"Where does Lucas live?", explanation_en:"« J'habite à Paris »." },
        { instruction_en:"Read and answer", q_en:"How many people are in the family?", explanation_en:"« il y a quatre personnes »." },
        { instruction_en:"Read and answer", q_en:"Where does the grandmother live?", explanation_en:"« Elle habite à Lyon »." },
      ],
      [ /* 3 — Au magasin */
        { instruction_en:"Read and answer", q_en:"What size is the customer looking for?", explanation_en:"« Du 38, s'il vous plaît »." },
        { instruction_en:"Read and answer", q_en:"What is the discount percentage?", explanation_en:"« moins 30% » = 30% discount." },
        { instruction_en:"Read and answer", q_en:"What color does the customer choose?", explanation_en:"« Je vais prendre le bleu »." },
      ],
      [ /* 4 — Dans la rue */
        { instruction_en:"Read and answer", q_en:"Which direction should you go?", explanation_en:"« tout droit, puis à gauche »." },
        { instruction_en:"Read and answer", q_en:"Where is the post office?", explanation_en:"« La poste est à côté de la pharmacie »." },
        { instruction_en:"Read and answer", q_en:"Where is the museum?", explanation_en:"« entre le café et la banque »." },
      ],
      [ /* 5 — À la maison */
        { instruction_en:"Read and answer", q_en:"How many bedrooms are there?", explanation_en:"« deux chambres » = two bedrooms." },
        { instruction_en:"Read and answer", q_en:"Where does the family eat in the evening?", explanation_en:"« toute la famille mange ensemble à la cuisine »." },
        { instruction_en:"Read and answer", q_en:"What does he do on Sunday morning?", explanation_en:"« je reste à la maison. Je lis un livre ou je regarde la télé »." },
      ],
    ],
    exp: [
      [ /* 0 — Se présenter */
        { instruction_en:"Introduce yourself", tip_en:"Je m'appelle · J'ai ... ans · J'habite à." },
        { instruction_en:"Tell what you study / do for work", tip_en:"Je suis étudiant(e) · Je travaille comme... · Je fais des études de..." },
        { instruction_en:"Tell which languages you speak", tip_en:"Je parle français · J'apprends l'espagnol · Je parle un peu de..." },
      ],
      [ /* 1 — Ma famille */
        { instruction_en:"Describe your family", tip_en:"il y a = there is/are · mon père = my father · ma mère = my mother." },
        { instruction_en:"Describe a family member", tip_en:"il s'appelle · il a ... ans · il est + adj · il habite." },
        { instruction_en:"Talk about your grandparents", tip_en:"mon grand-père = grandfather · ma grand-mère = grandmother." },
      ],
      [ /* 2 — J'aime… */
        { instruction_en:"What do you like to do?", tip_en:"J'aime + infinitive: jouer, écouter, regarder, lire." },
        { instruction_en:"Talk about a favourite hobby", tip_en:"J'aime + infinitive · C'est + adj · parce que (because)." },
        { instruction_en:"Talk about music or a film", tip_en:"J'aime la musique de... · C'est + adj · J'écoute / Je regarde." },
      ],
      [ /* 3 — Ma journée */
        { instruction_en:"Describe your morning", tip_en:"Je me réveille · Je me lève · Je prends une douche · Ensuite." },
        { instruction_en:"Describe your evening", tip_en:"le soir (in the evening) · après (afterwards) · normalement (usually)." },
        { instruction_en:"Describe a typical day", tip_en:"d'habitude · d'abord · ensuite · enfin." },
      ],
      [ /* 4 — Mon école */
        { instruction_en:"Talk about your school", tip_en:"une école · un lycée · une université · un cours (class)." },
        { instruction_en:"Describe your favourite teacher", tip_en:"il/elle enseigne (teaches) · il/elle est sympa/patient(e)." },
        { instruction_en:"Talk about friends at school", tip_en:"mon meilleur ami = my best friend · on = nous." },
      ],
      [ /* 5 — Mon pays */
        { instruction_en:"Talk about your country", tip_en:"Je viens de · c'est un pays · la capitale est." },
        { instruction_en:"Describe a city in your country", tip_en:"c'est une ville + adj · grande/petite/moderne/historique." },
        { instruction_en:"Talk about food from your country", tip_en:"on mange = we eat · c'est bon = it's tasty." },
      ],
    ],
  },

  /* ============================================================ A2 ============================================================ */
  A2: {
    gra: [
      [ /* 0 — Passé composé avec avoir */
        { instruction_en:"Passé composé with avoir", trans_en:"Yesterday I ate a pizza.", explanation_en:"Passé composé with avoir: j'ai + past participle. manger→mangé.", tip_en:"manger→mangé · finir→fini · prendre→pris · faire→fait." },
        { instruction_en:"Passé composé: past participle", trans_en:"We finished the exercise.", explanation_en:"nous avons + past participle. finir→fini.", tip_en:"travailler→travaillé · écouter→écouté · choisir→choisi." },
        { instruction_en:"Passé composé: negation", trans_en:"I didn't eat breakfast this morning.", explanation_en:"Negation in passé composé: ne/n' + auxiliary + pas + participle.", tip_en:"Je n'ai pas mangé (I didn't eat) · Je ne suis pas allé(e) (I didn't go)." },
      ],
      [ /* 1 — Avoir/Être */
        { instruction_en:"Passé composé with être", trans_en:"She went to the cinema on Saturday.", explanation_en:"aller takes être. Participle agrees: elle→allée.", tip_en:"Movement verbs with être: aller, venir, partir, arriver, sortir, entrer." },
        { instruction_en:"être or avoir?", trans_en:"They arrived late last night.", explanation_en:"arriver takes être. ils→arrivés (masculine plural).", tip_en:"ADVENT verbs use être: Arriver, Naître, Descendre, Venir, Entrer, Tomber..." },
        { instruction_en:"Participe passé with être — agreement", trans_en:"Marie left at noon.", explanation_en:"partir with être. Marie is feminine → partie.", tip_en:"il est parti · elle est partie · ils sont partis · elles sont parties." },
      ],
      [ /* 2 — Futur proche */
        { instruction_en:"Futur proche", trans_en:"Tonight we will watch a film.", explanation_en:"Futur proche = aller (conjugated) + infinitive.", tip_en:"je vais · tu vas · il va · nous allons · vous allez · ils vont + infinitive." },
        { instruction_en:"Futur proche: negation", trans_en:"I'm not going to go out tonight.", explanation_en:"Negation: ne + vais + pas + infinitive.", tip_en:"Je ne vais pas travailler · Tu ne vas pas venir?" },
        { instruction_en:"Futur proche: question", trans_en:"What are you going to do this weekend?", explanation_en:"vous allez faire = you are going to do.", tip_en:"Futur proche expresses near future or intention." },
      ],
      [ /* 3 — Adjectifs */
        { instruction_en:"Feminine adjective agreement", trans_en:"My neighbor is very nice.", explanation_en:"gentil→gentille: double -l and add -e.", tip_en:"gentil→gentille · nul→nulle · pareil→pareille." },
        { instruction_en:"Adjective before noun (BAGS)", trans_en:"It's a good book.", explanation_en:"bon (good) = BAGS adjective that comes before the noun: un bon livre.", tip_en:"BAGS: Beauty/Age/Goodness/Size — always before: beau, vieux, bon, grand, petit." },
        { instruction_en:"Adjective after noun (colour/shape)", trans_en:"She's wearing a red dress.", explanation_en:"Colours, shapes, nationalities — always after the noun.", tip_en:"une voiture rouge · un homme grand · une fille française." },
      ],
      [ /* 4 — Possessifs */
        { instruction_en:"Possessive adjective: son / sa", trans_en:"It's Marie's bag. It's her bag.", explanation_en:"son/sa/ses is determined by the object, not the owner. sac is masculine → son.", tip_en:"son sac (masc.) · sa chambre (fem.) · ses affaires (plural)." },
        { instruction_en:"Possessive adjective: mon / ma", trans_en:"It's his mother.", explanation_en:"sa refers to mère (feminine). The owner is masculine, but sa is determined by mère!", tip_en:"mon (m) · ma (f) · mes (pl) · ton (m) · ta (f) · son (m) · sa (f)." },
        { instruction_en:"Possessive adjective: notre / votre / leur", trans_en:"It's their house.", explanation_en:"leur = their (invariable). leur maison = their house.", tip_en:"notre (our) · votre (your) · leur (their)." },
      ],
      [ /* 5 — Imparfait */
        { instruction_en:"Imparfait: past habit", trans_en:"When I was little I loved playing outside.", explanation_en:"Imparfait expresses past habit.", tip_en:"imparfait = nous stem + -ais/-ait/-ions/-iez/-aient." },
        { instruction_en:"Imparfait: past description", trans_en:"The sky was blue and the weather was nice.", explanation_en:"Imparfait for describing state/weather in the past.", tip_en:"il faisait (it was) · il neigeait (it was snowing) · il pleuvait (it was raining)." },
        { instruction_en:"Imparfait: nous", trans_en:"Before, we used to live in Lyon.", explanation_en:"imparfait: nous habitions (stem habiter + -ions).", tip_en:"nous habitions · vous habitiez · ils habitaient." },
      ],
    ],
    voc: [
      [ /* 0 — Alimentation */
        { instruction_en:"Translate: 'bread'", trans_en:"I eat bread every morning.", explanation_en:"pain = bread (masc.). une baguette = baguette.", tip_en:"le pain · le fromage · la viande · le poisson · les légumes." },
        { instruction_en:"Translate: 'I'm hungry'", trans_en:"I'm hungry.", explanation_en:"avoir faim = to be hungry. avoir soif = to be thirsty.", tip_en:"J'ai faim (hungry) · J'ai soif (thirsty) · J'ai chaud (hot) · J'ai froid (cold)." },
        { instruction_en:"Translate: 'to cook'", trans_en:"I like to cook on weekends.", explanation_en:"cuisiner = to cook (everyday). faire la cuisine = to cook (more formal).", tip_en:"cuisiner · préparer le repas · faire la cuisine." },
      ],
      [ /* 1 — Transport */
        { instruction_en:"Translate: 'by metro'", trans_en:"I go to work by metro.", explanation_en:"en + means of transport: en métro, en bus, en voiture.", tip_en:"en métro · en bus · en voiture · à pied (on foot) · à vélo (by bike)." },
        { instruction_en:"Translate: 'round-trip ticket'", trans_en:"I'd like a round-trip ticket to Paris.", explanation_en:"aller-retour = round-trip. aller simple = one-way ticket.", tip_en:"un billet (ticket) · aller simple (one-way) · aller-retour (round-trip)." },
        { instruction_en:"Translate: 'waiting for the bus'", trans_en:"I'm waiting for the bus.", explanation_en:"attendre = to wait. J'attends = I'm waiting (présent).", tip_en:"attendre le bus · prendre le métro · manquer le train." },
      ],
      [ /* 2 — Santé */
        { instruction_en:"Translate: 'I have a headache'", trans_en:"I have a headache.", explanation_en:"avoir mal à = to be in pain. J'ai mal à la tête/au ventre.", tip_en:"J'ai mal à la gorge (sore throat) · J'ai de la fièvre (fever) · Je me sens mal." },
        { instruction_en:"Translate: 'I'm sick'", trans_en:"I'm sick.", explanation_en:"malade = sick. aller mieux = to feel better.", tip_en:"Je suis malade · Je me sens mieux (better) · Je vais mal (not well)." },
        { instruction_en:"Translate: 'take medicine'", trans_en:"You must take medicine.", explanation_en:"médicament = medicine. une ordonnance = prescription. une pharmacie = pharmacy.", tip_en:"un médicament · une ordonnance · chez le médecin (at the doctor's)." },
      ],
      [ /* 3 — Vêtements */
        { instruction_en:"Translate: 'I'm wearing a shirt'", trans_en:"I'm wearing a shirt.", explanation_en:"chemise = shirt · t-shirt = t-shirt · pull = sweater.", tip_en:"une chemise · un jean · une veste · un manteau · des chaussures." },
        { instruction_en:"Translate: 'to go shopping'", trans_en:"I like to go shopping on weekends.", explanation_en:"faire du shopping = to go shopping. faire les courses = to buy groceries.", tip_en:"faire du shopping · les soldes (sales) · une boutique (clothing shop)." },
        { instruction_en:"Translate: 'my size'", trans_en:"What is your size?", explanation_en:"la taille = size. Quelle taille faites-vous? = What's your size?", tip_en:"la taille (size) · la pointure (shoe size) · ça me va (it fits me)." },
      ],
      [ /* 4 — Sport */
        { instruction_en:"Translate: 'to play football'", trans_en:"I like to play football.", explanation_en:"jouer à + ball sports: jouer au foot, au tennis, au basket.", tip_en:"jouer au foot · faire du vélo · nager · courir · faire de la natation." },
        { instruction_en:"Translate: 'I do sport'", trans_en:"I do sport three times a week.", explanation_en:"faire du sport = to do sport. fois = times. par semaine = per week.", tip_en:"faire du sport · faire de la gym · faire du yoga · faire de la course." },
        { instruction_en:"Translate: 'I'm tired after training'", trans_en:"I'm very tired after training.", explanation_en:"fatigué = tired. l'entraînement = training. après = after.", tip_en:"fatigué (tired) · épuisé (exhausted) · en forme (in shape)." },
      ],
      [ /* 5 — Météo */
        { instruction_en:"Translate: 'what's the weather like?'", trans_en:"What's the weather like?", explanation_en:"Quel temps fait-il? = What's the weather? il fait beau = nice, il fait froid = cold.", tip_en:"il fait beau · il fait froid · il fait chaud · il pleut · il neige." },
        { instruction_en:"Translate: 'it rained'", trans_en:"It rained yesterday.", explanation_en:"pleuvoir in passé composé: il a plu. pleuvoir = to rain.", tip_en:"il pleut (present) · il a plu (past) · il va pleuvoir (future)." },
        { instruction_en:"Translate: 'it will be cold'", trans_en:"It will be cold tomorrow.", explanation_en:"il fait froid = it's cold. futur proche: il va faire froid.", tip_en:"il fait chaud (hot) · il fait froid (cold) · il fait beau (nice) · il fait gris (cloudy)." },
      ],
    ],
    com: [
      [ /* 0 — Panneaux */
        { instruction_en:"Read and answer", q_en:"Why is the shop closed?", explanation_en:"« FERMÉ POUR TRAVAUX » = Closed for construction work." },
        { instruction_en:"Read and answer", q_en:"Who can enter?", explanation_en:"« Accès réservé au personnel autorisé » = Only authorised staff." },
        { instruction_en:"Read and answer", q_en:"What is the maximum discount?", explanation_en:"« 30 à 50% » = From 30 to 50%. Maximum is 50%." },
      ],
      [ /* 1 — Horaires */
        { instruction_en:"Read and answer", q_en:"When is the museum closed?", explanation_en:"« ouvert tous les jours sauf le mardi » = open every day except Tuesday." },
        { instruction_en:"Read and answer", q_en:"What time does the train arrive in Lyon?", explanation_en:"« Arrivée: 10h00 »." },
        { instruction_en:"Read and answer", q_en:"Is the library open on Saturday at 6pm?", explanation_en:"Saturday: 10h-17h. 6pm > 5pm → already closed." },
      ],
      [ /* 2 — Menus */
        { instruction_en:"Read and answer", q_en:"What can you choose as a starter?", explanation_en:"« Entrée : soupe ou salade »." },
        { instruction_en:"Read and answer", q_en:"What does the vegetarian person choose?", explanation_en:"« nous avons une quiche aux légumes » — the option without meat." },
        { instruction_en:"Read and answer", q_en:"What does Sophie do on weekends?", explanation_en:"« le week-end, elle fait du yoga et elle lit des livres »." },
      ],
      [ /* 3 — SMS & mails */
        { instruction_en:"Read and answer", q_en:"Why is this message being sent?", explanation_en:"« On se retrouve au café » = to arrange a meeting." },
        { instruction_en:"Read and answer", q_en:"What is the purpose of this email?", explanation_en:"« candidature pour le poste » = job application." },
        { instruction_en:"Read and answer", q_en:"Why is the person late?", explanation_en:"« le bus est bloqué » = the bus is stuck." },
      ],
      [ /* 4 — Annonces */
        { instruction_en:"Read and answer", q_en:"What should be avoided tomorrow?", explanation_en:"« éviter le soleil entre 12h et 16h »." },
        { instruction_en:"Read and answer", q_en:"When must you work in this position?", explanation_en:"« Horaires : soir et week-end »." },
        { instruction_en:"Read and answer", q_en:"Where is the concert taking place?", explanation_en:"« Salle Pleyel, Paris »." },
      ],
      [ /* 5 — Articles courts */
        { instruction_en:"Read and answer", q_en:"Why do the French choose bicycles?", explanation_en:"« pour des raisons écologiques et économiques »." },
        { instruction_en:"Read and answer", q_en:"What does this app do?", explanation_en:"« trouver facilement des restaurants végétariens »." },
        { instruction_en:"Read and answer", q_en:"How many countries have French as an official language?", explanation_en:"« langue officielle de 29 pays »." },
      ],
    ],
    exp: [
      [ /* 0 — Hier… */
        { instruction_en:"Tell what you did yesterday", tip_en:"passé composé: j'ai mangé · j'ai regardé · je suis allé(e) · je suis rentré(e)." },
        { instruction_en:"Tell about an event last week", tip_en:"la semaine dernière (last week) · hier soir (last night) · avant-hier (two days ago)." },
        { instruction_en:"Describe a visit you made recently", tip_en:"c'était = it was (imparfait of être) — to express a feeling." },
      ],
      [ /* 1 — Mon appart */
        { instruction_en:"Describe your apartment or house", tip_en:"un salon · une chambre · une cuisine · une salle de bains." },
        { instruction_en:"Describe your bedroom", tip_en:"un lit (bed) · un bureau (desk) · une armoire (wardrobe) · les murs (walls)." },
        { instruction_en:"Talk about your neighbourhood or neighbours", tip_en:"un quartier calme/animé · les voisins (neighbours) · à ... minutes à pied." },
      ],
      [ /* 2 — Mon week-end */
        { instruction_en:"Describe what you normally do on weekends", tip_en:"present for habit: je fais, je retrouve, je reste, je lis." },
        { instruction_en:"Describe a particularly enjoyable weekend", tip_en:"mix passé composé and imparfait: actions (PC) + context (imparfait)." },
        { instruction_en:"Talk about plans for the weekend", tip_en:"futur proche: je vais + infinitive · J'ai hâte = I can't wait." },
      ],
      [ /* 3 — Mes goûts */
        { instruction_en:"Talk about your likes and dislikes", tip_en:"j'adore · j'aime beaucoup · je n'aime pas tellement · je déteste." },
        { instruction_en:"Compare two things you like", tip_en:"plus + adj + que = more...than. moins + adj + que = less...than. aussi ... que = as...as." },
        { instruction_en:"Describe your favourite music genre", tip_en:"le jazz · le rock · la musique classique · le rap · la chanson française." },
      ],
      [ /* 4 — Ma routine */
        { instruction_en:"Describe your daily routine", tip_en:"d'abord · ensuite · puis · après · enfin." },
        { instruction_en:"Describe a typical morning", tip_en:"se lever · se doucher · s'habiller · prendre le petit-déjeuner · partir." },
        { instruction_en:"Tell what you do in your free time in the evening", tip_en:"après (after) · ensuite (then) · souvent (often)." },
      ],
      [ /* 5 — Mon quartier */
        { instruction_en:"Describe your neighbourhood", tip_en:"animé (lively) · calme (quiet) · pratique (convenient) · bruyant (noisy) · propre (clean)." },
        { instruction_en:"Talk about shops/services near you", tip_en:"une boulangerie · un supermarché · une pharmacie · une poste · un parc." },
        { instruction_en:"Compare neighbourhoods", tip_en:"plus calme que · moins animé · autant de · je préfère." },
      ],
    ],
  },

  /* ============================================================ B1 ============================================================ */
  B1: {
    gra: [
      [ /* 0 — Imparfait / PC */
        { instruction_en:"Imparfait for background state", trans_en:"When the phone rang, I was sleeping.", explanation_en:"PC for sudden action (a sonné), imparfait for continuous background (dormais).", tip_en:"imparfait = background/state · passé composé = sudden action." },
        { instruction_en:"Imparfait for ongoing action", trans_en:"I was watching TV when he came in.", explanation_en:"regardais (imparfait) = ongoing background. est entré (PC) = sudden interrupting action.", tip_en:"quand/pendant que + imparfait (background) + PC (action)." },
        { instruction_en:"Choose imparfait or PC", trans_en:"It was raining when we went out.", explanation_en:"pleuvait (imparfait) = ongoing state. sommes sortis (PC) = action that happened.", tip_en:"imparfait = what was happening in the background · PC = what happened." },
      ],
      [ /* 1 — Qui / Que / Dont */
        { instruction_en:"Relative pronoun: subject", trans_en:"The woman who works here is a doctor.", explanation_en:"qui = who/that (subject). la femme is the subject of travaille → qui.", tip_en:"qui = subject (followed by verb) · que = object (followed by subject)." },
        { instruction_en:"Relative pronoun: direct object", trans_en:"He's the friend I met yesterday.", explanation_en:"que = whom/that (direct object). l'ami is the object of rencontrer.", tip_en:"qui = subject (qui vient) · que = object (que je vois)." },
        { instruction_en:"Relative pronoun: dont", trans_en:"That's the book you told me about.", explanation_en:"dont replaces de + noun. parler de qqch → dont.", tip_en:"dont after verbs with de: parler de, avoir besoin de, se souvenir de." },
      ],
      [ /* 2 — Pronoms COD */
        { instruction_en:"COD: la", trans_en:"Do you see Marie? — Yes, I see her every day.", explanation_en:"COD for feminine singular = la. Placed before the verb.", tip_en:"le (him/it) · la (her/it) · les (them)." },
        { instruction_en:"COD: les", trans_en:"Did you watch the films? — Yes, I watched them.", explanation_en:"les = them. In passé composé with avoir + preceding COD, participle agrees: regardés.", tip_en:"COD before avoir in PC → participle agrees in gender and number." },
        { instruction_en:"COD: placement with infinitive", trans_en:"I'm going to call my sister. → I'm going to call her.", explanation_en:"With futur proche: COD goes before the infinitive. Since appeler starts with a vowel, la elides to l' — elision is mandatory: je vais l'appeler.", tip_en:"aller + la/le/les + infinitive · veux la voir · dois les faire · va l'aider." },
      ],
      [ /* 3 — Pronoms COI */
        { instruction_en:"COI: leur", trans_en:"Do you talk to your parents? — Yes, I talk to them every day.", explanation_en:"COI for plural = leur. parler à qqn → lui/leur.", tip_en:"lui = to him/her (singular) · leur = to them (plural)." },
        { instruction_en:"COI: lui", trans_en:"Did you tell Pierre the truth? — Yes, I told him.", explanation_en:"COI for singular (masculine) = lui. dire à qqn → lui.", tip_en:"lui ai dit · lui ai donné · lui ai montré — all COI singular." },
        { instruction_en:"COI vs COD", trans_en:"I'm calling Marc. → I'm calling him.", explanation_en:"téléphoner à qqn → COI → lui. Don't use le (that's COD)!", tip_en:"COI: parler à, téléphoner à, écrire à, répondre à → lui/leur." },
      ],
      [ /* 4 — Verbes réfléchis */
        { instruction_en:"Reflexive verb: présent", trans_en:"Every morning I get up at seven.", explanation_en:"se lever = to get up. je me lève, tu te lèves, il se lève.", tip_en:"se lever · se coucher · s'habiller · se laver · se réveiller." },
        { instruction_en:"Reflexive verb: passé composé", trans_en:"She woke up late this morning.", explanation_en:"Reflexive verbs take être in PC. elle → s'est réveillée (feminine).", tip_en:"se + être + participle: elle s'est levée · il s'est couché." },
        { instruction_en:"Reflexive verb: negative", trans_en:"He didn't hurry this morning.", explanation_en:"Negation in reflexive PC: ne + s' + est + pas + participle.", tip_en:"Il ne s'est pas levé · Elle ne s'est pas habillée." },
      ],
      [ /* 5 — Comparatifs / Superlatifs */
        { instruction_en:"Comparative: plus...que", trans_en:"Paris is bigger than Lyon.", explanation_en:"plus + adj + que = more...than.", tip_en:"plus...que · moins...que · aussi...que = as...as." },
        { instruction_en:"Superlative: le/la plus", trans_en:"It's the most interesting film of the year.", explanation_en:"Superlative: le/la/les + plus + adj. le film le plus intéressant.", tip_en:"le plus (the most) · le moins (the least) · le meilleur (the best)." },
        { instruction_en:"Irregular: meilleur / mieux", trans_en:"This restaurant is better than the other.", explanation_en:"bon → meilleur (adjective). bien → mieux (adverb).", tip_en:"bon/meilleur (adj) · bien/mieux (adv) · mauvais/pire." },
      ],
    ],
    voc: [
      [ /* 0 — Voyages */
        { instruction_en:"Translate: 'to travel'", trans_en:"I love to travel in Europe.", explanation_en:"voyager = to travel. un voyage = a journey.", tip_en:"voyager · partir en vacances · explorer · faire un séjour." },
        { instruction_en:"Translate: 'to arrive on time'", trans_en:"It's important to arrive on time.", explanation_en:"arriver à l'heure = to arrive on time. être en retard = to be late.", tip_en:"à l'heure (on time) · en retard (late) · en avance (early)." },
        { instruction_en:"Translate: 'travel insurance'", trans_en:"I took out travel insurance.", explanation_en:"assurance = insurance. une assurance de voyage = travel insurance.", tip_en:"une assurance · un passeport · un visa · une réservation." },
      ],
      [ /* 1 — Santé */
        { instruction_en:"Translate: 'really tired'", trans_en:"After sport, I'm really tired.", explanation_en:"épuisé = exhausted. crevé = slang for really exhausted.", tip_en:"fatigué (tired) · épuisé (exhausted) · crevé (totally wiped out, slang)." },
        { instruction_en:"Translate: 'I feel better'", trans_en:"I feel better since yesterday.", explanation_en:"se sentir mieux = to feel better. aller mieux = to be better.", tip_en:"se sentir (bien/mal) · aller mieux · être en forme." },
        { instruction_en:"Translate: 'surgery / operation'", trans_en:"He must undergo surgery.", explanation_en:"opération = operation/surgery (everyday). intervention = medical intervention. chirurgie = surgery.", tip_en:"une opération · une anesthésie · une convalescence (recovery)." },
      ],
      [ /* 2 — Environnement */
        { instruction_en:"Translate: 'to protect the environment'", trans_en:"We must protect the environment.", explanation_en:"protéger = to protect · préserver = to preserve · l'environnement = the environment.", tip_en:"le réchauffement climatique · le recyclage · les énergies renouvelables." },
        { instruction_en:"Translate: 'carbon dioxide'", trans_en:"Cars emit a lot of carbon dioxide.", explanation_en:"dioxyde de carbone = carbon dioxide. gaz à effet de serre = greenhouse gases.", tip_en:"les émissions de CO2 · l'effet de serre · le changement climatique." },
        { instruction_en:"Translate: 'recycling'", trans_en:"It's important to do recycling.", explanation_en:"le recyclage = recycling. recycler = to recycle. les déchets = waste.", tip_en:"recycler · trier les déchets · économiser l'énergie · le compost." },
      ],
      [ /* 3 — Médias */
        { instruction_en:"Translate: 'newspaper'", trans_en:"I read the newspaper every morning.", explanation_en:"journal = newspaper (daily). quotidien = daily (adj and n). hebdomadaire = weekly.", tip_en:"un journal · un magazine · une revue · une chaîne de télévision." },
        { instruction_en:"Translate: 'according to the news'", trans_en:"According to the news, it will rain tomorrow.", explanation_en:"d'après = according to (source). selon = according to (opinion).", tip_en:"d'après · selon · d'après les médias/la radio/le journal." },
        { instruction_en:"Translate: 'media company'", trans_en:"This media company broadcasts programmes worldwide.", explanation_en:"une chaîne = TV channel. un média = media. les médias = media (plural).", tip_en:"une chaîne · un réseau (network) · les médias · la presse (the press)." },
      ],
      [ /* 4 — Travail */
        { instruction_en:"Translate: 'job application'", trans_en:"I sent my application for this position.", explanation_en:"une candidature = application. un candidat/e = candidate. postuler = to apply.", tip_en:"postuler · une candidature · un CV · une lettre de motivation." },
        { instruction_en:"Translate: 'colleague'", trans_en:"I get along well with my colleagues.", explanation_en:"un/une collègue = colleague. le patron/la patronne = boss.", tip_en:"un collègue · le patron · l'employé · le chef de projet." },
        { instruction_en:"Translate: 'unemployment'", trans_en:"He has been unemployed for three months.", explanation_en:"être au chômage = to be unemployed. le chômage = unemployment.", tip_en:"au chômage (unemployed) · licencier (to fire) · démissionner (to resign)." },
      ],
      [ /* 5 — Relations */
        { instruction_en:"Translate: 'I agree with you'", trans_en:"I agree with you.", explanation_en:"être d'accord = to agree. Je ne suis pas d'accord = I disagree.", tip_en:"d'accord · au contraire (on the contrary) · en revanche (on the other hand)." },
        { instruction_en:"Translate: 'to agree / to compromise'", trans_en:"We found a compromise.", explanation_en:"un compromis = compromise. trouver un compromis = to reach a compromise.", tip_en:"un compromis · un accord · une solution · négocier (to negotiate)." },
        { instruction_en:"Translate: 'support'", trans_en:"I need your support.", explanation_en:"le soutien = support. l'aide = help. soutenir = to support.", tip_en:"le soutien · l'aide · la solidarité · l'entraide (mutual support)." },
      ],
    ],
    com: [
      [ /* 0 — Faits divers */
        { instruction_en:"Read and answer", q_en:"What might discourage buying organic products?", explanation_en:"« malgré un prix souvent plus élevé »." },
        { instruction_en:"Read and answer", q_en:"How many people were evacuated?", explanation_en:"« Cinq personnes ont été évacuées »." },
        { instruction_en:"Read and answer", q_en:"What will this young person do now?", explanation_en:"« Il représentera la France aux Olympiades internationales »." },
      ],
      [ /* 1 — Blogs */
        { instruction_en:"Read and answer", q_en:"What factor is essential according to the text?", explanation_en:"« la régularité finit toujours par payer »." },
        { instruction_en:"Read and answer", q_en:"What does this blog talk about?", explanation_en:"« ma vie à Paris en tant qu'étudiante étrangère »." },
        { instruction_en:"Read and answer", q_en:"Where can you find the recipe?", explanation_en:"« Je vous donne la recette en bas de l'article »." },
      ],
      [ /* 2 — Publicités */
        { instruction_en:"Read and answer", q_en:"How long does charging take?", explanation_en:"« charge en 30 minutes »." },
        { instruction_en:"Read and answer", q_en:"What is the advantage of this offer?", explanation_en:"« recevez le 7e mois gratuit » = the 7th month free." },
        { instruction_en:"Read and answer", q_en:"What risk does the text mention?", explanation_en:"« peut nuire à la concentration et au sommeil »." },
      ],
      [ /* 3 — Interviews */
        { instruction_en:"Read and answer", q_en:"Where did the chef's passion begin?", explanation_en:"« Tout a commencé dans la cuisine de ma grand-mère »." },
        { instruction_en:"Read and answer", q_en:"What is the main advice of the interviewee?", explanation_en:"« Soyez patient » = Be patient." },
        { instruction_en:"Read and answer", q_en:"Why didn't the author write earlier?", explanation_en:"« la vie professionnelle ne me laissait pas le temps »." },
      ],
      [ /* 4 — Critiques */
        { instruction_en:"Read and answer", q_en:"What does the text say about the printed book?", explanation_en:"« conserve un charme que beaucoup ne sont pas prêts à abandonner »." },
        { instruction_en:"Read and answer", q_en:"How was the film received?", explanation_en:"« accueil critique mitigé » + « franc succès auprès du public »." },
        { instruction_en:"Read and answer", q_en:"What is the flaw of the novel according to the critic?", explanation_en:"« l'intrigue perd de sa vigueur dans la deuxième moitié »." },
      ],
      [ /* 5 — Reportages */
        { instruction_en:"Read and answer", q_en:"What is the municipality's goal?", explanation_en:"« désengorger le centre-ville » = to relieve congestion." },
        { instruction_en:"Read and answer", q_en:"What is the advantage of these markets?", explanation_en:"« vendre directement aux consommateurs, sans intermédiaire »." },
        { instruction_en:"Read and answer", q_en:"What is the low working hours in France attributed to?", explanation_en:"« grâce aux 35 heures légales » = thanks to the 35-hour work week law." },
      ],
    ],
    exp: [
      [ /* 0 — Opinion */
        { instruction_en:"Express your opinion on social media", tip_en:"D'un côté… de l'autre… · À mon avis · Je pense que · Tout dépend de." },
        { instruction_en:"Express your opinion on the environment", tip_en:"Je pense que · certes (of course) · mais · cependant (however)." },
        { instruction_en:"Express your opinion on technology", tip_en:"en général · il faut + infinitive · de façon raisonnée = in a thoughtful way." },
      ],
      [ /* 1 — Événement */
        { instruction_en:"Tell about a weekend that left an impression", tip_en:"PC for actions + imparfait for background: il faisait beau · nous étions fatigués." },
        { instruction_en:"Tell about an event you experienced", tip_en:"je ne m'attendais pas = I didn't expect. l'ambiance = the atmosphere." },
        { instruction_en:"Describe a family celebration", tip_en:"on a = nous avons (informal) · toute la soirée = all evening." },
      ],
      [ /* 2 — Description */
        { instruction_en:"Describe someone you admire", tip_en:"appearance: grand/e · brun/e · élégant/e · personality: patient/e · généreux/se." },
        { instruction_en:"Describe a favourite place", tip_en:"avec + description · c'est un endroit où... · on peut y + verb." },
        { instruction_en:"Describe your favourite dish", tip_en:"à la fois... et... · de plus · parce que · ça me rappelle." },
      ],
      [ /* 3 — Comparaison */
        { instruction_en:"Compare two cities", tip_en:"plus...que · moins...que · aussi...que · les deux (both)." },
        { instruction_en:"Compare two options", tip_en:"permet de + inf · d'un côté... de l'autre · personnellement." },
        { instruction_en:"Compare two lifestyles", tip_en:"pratique (convenient) · stressant (stressful) · manquer de (lacking)." },
      ],
      [ /* 4 — Conseil */
        { instruction_en:"Give advice to a new student", tip_en:"je te conseille de + inf · tu devrais + inf · il faut que tu + subj." },
        { instruction_en:"Give health advice", tip_en:"régulièrement = regularly · réduire = to reduce · suffisamment = enough." },
        { instruction_en:"Give travel advice", tip_en:"je conseille de + inf · plutôt que (rather than) · il devrait (he should)." },
      ],
      [ /* 5 — Récit */
        { instruction_en:"Tell a story in the past", tip_en:"un jour (one day) · finalement (finally) · à l'époque (at the time)." },
        { instruction_en:"Tell about an important moment", tip_en:"plus-que-parfait for background: j'avais travaillé · j'avais préparé." },
        { instruction_en:"Tell about an experience abroad", tip_en:"tout me semblait (everything seemed to me) · la façon de + inf · pour la première fois." },
      ],
    ],
  },

  /* ============================================================ C2 ============================================================ */
  C2: {
    gra: [
      [ /* 0 — Passif */
        { instruction_en:"Passive voice: présent", trans_en:"This song is sung by millions of people.", explanation_en:"Passive = être + past participle. chanson is feminine → chantée.", tip_en:"Passive: subject + être + past participle + par + agent." },
        { instruction_en:"Passive voice: passé composé", trans_en:"The report was written by the team yesterday.", explanation_en:"Past passive: avoir + été + past participle. rapport is masculine → rédigé.", tip_en:"Passé composé passif: a été + participle." },
        { instruction_en:"Passive voice: futur simple", trans_en:"The results will be announced tomorrow.", explanation_en:"Future passive: seront + participle. résultats masc. plural → annoncés.", tip_en:"Future passive: sera/seront + past participle." },
      ],
      [ /* 1 — Participe composé */
        { instruction_en:"Compound participle: ayant", trans_en:"Having finished his speech, he left the room.", explanation_en:"Compound past participle = ayant/étant + past participle. Expresses a prior action.", tip_en:"Ayant terminé (having finished) · Étant arrivé (having arrived)." },
        { instruction_en:"Compound participle: étant", trans_en:"Having arrived early, she was able to choose her seat.", explanation_en:"Verb of state/movement → étant + participle. elle → arrivée (feminine).", tip_en:"Étant parti · Étant arrivé · S'étant levé — with être." },
        { instruction_en:"Present participle vs compound past participle", trans_en:"Having read the letter, he understood the situation.", explanation_en:"Compound past participle for an action prior to another: ayant lu.", tip_en:"Lisant (simultaneous) vs Ayant lu (prior to action)." },
      ],
      [ /* 2 — Ne explétif */
        { instruction_en:"Expletive ne: avant que", trans_en:"Let's leave before it rains.", explanation_en:"avant que + subjunctive. The expletive ne is polite/literary — not a negation.", tip_en:"Expletive ne after avant que, à moins que, de peur que — no negative meaning." },
        { instruction_en:"Expletive ne: de peur que", trans_en:"He whispers for fear someone will hear him.", explanation_en:"de peur que triggers subjunctive + expletive ne. entendre → entende.", tip_en:"de peur que · craindre que → expletive ne + subjunctive." },
        { instruction_en:"Expletive ne: à moins que", trans_en:"I'll come unless it's too late.", explanation_en:"à moins que = unless. subjunctive + expletive ne. être → soit.", tip_en:"à moins que ne → subjunctive. Not a real negation!" },
      ],
      [ /* 3 — Quoi que / Qui que / Où que */
        { instruction_en:"Quoi que + subjunctive", trans_en:"Whatever he does, he won't succeed in deceiving us.", explanation_en:"quoi que = whatever, always with subjunctive. faire → fasse.", tip_en:"quoi que · qui que · où que — all with subjunctive." },
        { instruction_en:"Où que + subjunctive", trans_en:"Wherever he goes, he takes his books.", explanation_en:"où que = wherever. aller → aille (irregular subjunctive).", tip_en:"aller in subjunctive: j'aille · tu ailles · il aille." },
        { instruction_en:"Qui que + subjunctive", trans_en:"Whoever you are, you deserve respect.", explanation_en:"qui que = whoever. être → sois (subjunctive).", tip_en:"qui que vous soyez · quoi qu'il en soit = be that as it may." },
      ],
      [ /* 4 — Hypothèses complexes */
        { instruction_en:"Si + pluperfect → past conditional", trans_en:"If it had rained, we would have stayed home.", explanation_en:"Past counterfactual: Si + plus-que-parfait → past conditional. rester with être.", tip_en:"Si + avait/était → past conditional (aurait/serait + participle)." },
        { instruction_en:"Si + pluperfect → present conditional (current consequence)", trans_en:"If I had studied law, I would be a lawyer today.", explanation_en:"Past condition with present result: Si + PQP → present conditional.", tip_en:"Si + avait fait → serait (today) — present-day result of a past condition." },
        { instruction_en:"Hypothesis with sans / avec", trans_en:"Without your help, I wouldn't have succeeded.", explanation_en:"sans + noun ← past conditional. Substitute for si + PQP.", tip_en:"sans toi, j'aurais… · avec plus de temps, j'aurais…" },
      ],
      [ /* 5 — Style littéraire */
        { instruction_en:"Literary style: subject inversion", trans_en:"Perhaps this approach needs to be reconsidered.", explanation_en:"peut-être at the start → subject inversion: faut-il (not il faut).", tip_en:"peut-être + inversion: faut-il · est-ce · doit-on." },
        { instruction_en:"Literary expression: to highlight", trans_en:"The author highlights the importance of dialogue in his work.", explanation_en:"souligner = to highlight (literary). mettre en relief = to foreground.", tip_en:"souligner · mettre en relief · accentuer · insister sur." },
        { instruction_en:"Literary style: remarkable", trans_en:"This is a remarkable phenomenon in contemporary literature.", explanation_en:"remarquable = noteworthy. notable = significant. prépondérant = dominant.", tip_en:"remarquable · prépondérant · incontournable · emblématique · paradigmatique." },
      ],
    ],
    voc: [
      [ /* 0 — Diversité */
        { instruction_en:"Cultural diversity", trans_en:"The diversity of cultures enriches our society.", explanation_en:"diversité = diversity. pluralité = plurality. hétérogénéité = heterogeneity.", tip_en:"diversité · pluralité · singularité · homogénéité." },
        { instruction_en:"Inclusion / uniformity", trans_en:"This movement advocates social inclusion.", explanation_en:"inclusion = inclusion (accepts difference). intégration = integration. assimilation = assimilation.", tip_en:"inclusion · intégration · assimilation · exclusion." },
        { instruction_en:"Expression: plurality", trans_en:"The plurality of viewpoints is a richness.", explanation_en:"pluralité = plurality (philosophical/literary). diversité = diversity (everyday).", tip_en:"pluralité · multiplicité · hétérogénéité · singularité." },
      ],
      [ /* 1 — Philosophie */
        { instruction_en:"It follows from this", trans_en:"A profound injustice stems from this decision.", explanation_en:"il ressort de = it emerges from. il résulte de = it results from.", tip_en:"il s'ensuit que · il en résulte que · il ressort de cela que." },
        { instruction_en:"Premise / assumption", trans_en:"This reasoning rests on an erroneous premise.", explanation_en:"prémisse = premise (in logic). postulat = axiom.", tip_en:"prémisse · postulat · présupposé · axiome · paradigme." },
        { instruction_en:"To examine deeply", trans_en:"It is worth examining this question in depth.", explanation_en:"approfondir = to deepen. creuser = to dig into/explore thoroughly.", tip_en:"approfondir · élucider (to elucidate) · décortiquer (to break down)." },
      ],
      [ /* 2 — Rhétorique */
        { instruction_en:"Rhetorical expression: to emphasise", trans_en:"The speaker emphasised this essential point several times.", explanation_en:"marteler = to hammer home, repeat insistently. souligner = to highlight.", tip_en:"souligner · marteler · mettre en exergue (to foreground)." },
        { instruction_en:"Rhetorical question", trans_en:"Can we truly speak of progress without speaking of equality?", explanation_en:"égalité = equality (measure). équité = fairness (concept). Rhetorical question = no answer expected.", tip_en:"l'égalité (equality) · l'équité (fairness) · la justice · la liberté." },
        { instruction_en:"Rhetorical concession", trans_en:"Although this theory is seductive, it has its limits.", explanation_en:"concession: Si séduisante que soit… · certes… mais… · il est vrai que…", tip_en:"certes (granted) · il est vrai que · si ... que ... soit." },
      ],
      [ /* 3 — Littéraire */
        { instruction_en:"Balcony overlooking", trans_en:"This balcony looks out over the sea.", explanation_en:"donner sur = to overlook. la fenêtre donne sur la rue.", tip_en:"donner sur · faire face à · surplomber (to overlook from above)." },
        { instruction_en:"Literary description: atmosphere", trans_en:"A threatening atmosphere reigned over the city.", explanation_en:"menaçante = threatening. oppressante = oppressive. sinistre = sinister.", tip_en:"atmosphère + adj: lourde · pesante · menaçante · sereine (serene)." },
        { instruction_en:"Figure of speech: personification", trans_en:"Night scattered its stars over the sleeping city.", explanation_en:"personification = attributing human qualities to things. « la nuit étend » = night spreads.", tip_en:"la nuit enveloppe · le vent murmure · la ville s'éveille." },
      ],
      [ /* 4 — Académique */
        { instruction_en:"Academic expression: presenting an argument", trans_en:"This article argues the thesis that…", explanation_en:"soutenir une thèse = to argue/defend a thesis. avancer = to propose.", tip_en:"soutenir · défendre · avancer · formuler (to formulate)." },
        { instruction_en:"Academic expression: summary", trans_en:"In conclusion, it can be stated that…", explanation_en:"en conclusion = in conclusion. en somme = in sum. en définitive = ultimately.", tip_en:"en conclusion · en somme · bref · pour conclure · en définitive." },
        { instruction_en:"Academic expression: contrast", trans_en:"Despite appearances, the situation is complex.", explanation_en:"contrairement à = contrary to. malgré = despite. au-delà de = beyond.", tip_en:"contrairement à · malgré · nonobstant (literary: notwithstanding)." },
      ],
      [ /* 5 — Épistémologie */
        { instruction_en:"Knowledge / cognition", trans_en:"Epistemology is the study of the foundations of knowledge.", explanation_en:"épistémologie = epistemology/philosophy of knowledge.", tip_en:"épistémologie · ontologie (essence) · phénoménologie (description of experience)." },
        { instruction_en:"Challenging knowledge", trans_en:"This discovery calls the established certainties into question.", explanation_en:"remettre en question = to call into question. ébranler = to shake/undermine.", tip_en:"remettre en question · ébranler · invalider · contredire (to contradict)." },
        { instruction_en:"Paradigm", trans_en:"This researcher proposes a paradigm shift.", explanation_en:"paradigme = paradigm (dominant theoretical framework). Thomas Kuhn defined paradigm shift.", tip_en:"un paradigme · un changement de paradigme · une rupture épistémologique." },
      ],
    ],
    com: [
      [ /* 0 — Philosophie */
        { instruction_en:"Read and answer", q_en:"According to this text, what characterises a democracy?", explanation_en:"« capacité à tolérer la divergence des points de vue »." },
        { instruction_en:"Read and answer", q_en:"What is the paradox in the text?", explanation_en:"The paradox: modernity liberated (positive) but deprived of symbolic frameworks (negative)." },
        { instruction_en:"Read and answer", q_en:"How does the author define happiness?", explanation_en:"« il se vit dans la quête elle-même » = it is lived in the search itself." },
      ],
      [ /* 1 — Littérature */
        { instruction_en:"Read and answer", q_en:"What does the translator actually do?", explanation_en:"« acte d'interprétation, voire de création... transporte des mondes »." },
        { instruction_en:"Read and answer", q_en:"What is the function of literature according to this text?", explanation_en:"« réinvente pour en révéler des vérités autrement inaccessibles »." },
        { instruction_en:"Read and answer", q_en:"What does reading represent according to the author?", explanation_en:"« habiter temporairement une autre conscience »." },
      ],
      [ /* 2 — Sociologie */
        { instruction_en:"Read and answer", q_en:"What does the author think of local consumption?", explanation_en:"« loin d'être un simple effet de mode » + « véritable prise de conscience »." },
        { instruction_en:"Read and answer", q_en:"What effect does precariousness have according to the text?", explanation_en:"« instabilité cognitive qui affecte la prise de décision et reproduit les inégalités »." },
        { instruction_en:"Read and answer", q_en:"What tension does the text identify?", explanation_en:"« valorisent à la fois l'individualisme et la solidarité, créant une tension »." },
      ],
      [ /* 3 — Politique */
        { instruction_en:"Read and answer", q_en:"How does the text explain populism?", explanation_en:"« exploitant la méfiance envers les élites pour proposer des solutions simplistes »." },
        { instruction_en:"Read and answer", q_en:"What legitimises a decision according to deliberative democracy?", explanation_en:"« légitimité découle... de la qualité du débat qui le précède »." },
        { instruction_en:"Read and answer", q_en:"What tension does the text describe?", explanation_en:"« souveraineté nationale et l'intégration européenne »." },
      ],
      [ /* 4 — Esthétique */
        { instruction_en:"Read and answer", q_en:"Why is contemporary art sometimes misunderstood?", explanation_en:"« exige du spectateur une disposition à l'incertitude »." },
        { instruction_en:"Read and answer", q_en:"Where does beauty reside according to this text?", explanation_en:"« dans la relation dynamique entre l'œuvre et le regard qui la reçoit »." },
        { instruction_en:"Read and answer", q_en:"What is the difference between the beautiful and the sublime according to Kant?", explanation_en:"« le beau apaise, le sublime confronte l'homme à ses propres limites »." },
      ],
      [ /* 5 — Épistémologie */
        { instruction_en:"Read and answer", q_en:"How does the text describe science?", explanation_en:"« modèles provisoires, constamment révisés »." },
        { instruction_en:"Read and answer", q_en:"What does the term 'paradigm' designate according to Kuhn?", explanation_en:"« l'ensemble des présupposés théoriques et méthodologiques partagés »." },
        { instruction_en:"Read and answer", q_en:"What is the effect of epistemological scepticism?", explanation_en:"« invite à une vigilance critique permanente face aux certitudes établies »." },
      ],
    ],
    exp: [
      [ /* 0 — Dissertation */
        { instruction_en:"Dissertation structure: d'une part / d'autre part", tip_en:"d'une part... d'autre part · certes... cependant · il est vrai que... néanmoins." },
        { instruction_en:"Dissertation: dialectical conclusion", tip_en:"en somme · loin de + inf · nécessairement · la condition même de." },
        { instruction_en:"Dissertation: introduction — posing the problem", tip_en:"Dissertation intro: context → question → announcement of the plan." },
      ],
      [ /* 1 — Commentaire */
        { instruction_en:"Interpreting a quote: Camus", tip_en:"Analysing a quote: what does it say? what does it build on? what implications does it have?" },
        { instruction_en:"Commentary: identifying the tone", tip_en:"Identifying tone: ironic · lyric · pessimistic · critical · solemn." },
        { instruction_en:"Commentary: identifying the figure of speech", tip_en:"métaphore (no 'comme') · comparaison (with 'comme') · personnification · oxymore." },
      ],
      [ /* 2 — Thèse/Antithèse */
        { instruction_en:"Thesis: supporting argument", tip_en:"thesis: subject + strong verb + argument + example/consequence." },
        { instruction_en:"Antithesis: opposing argument", tip_en:"antithèse: cependant · en revanche · or · néanmoins + opposing argument." },
        { instruction_en:"Synthesis: balanced position", tip_en:"synthèse: en définitive · au final · il convient de · une approche équilibrée." },
      ],
      [ /* 3 — Analyse */
        { instruction_en:"Analysis: AI — opportunity or threat?", tip_en:"il serait réducteur de · la réalité est plus complexe · il convient de distinguer." },
        { instruction_en:"Analysis: impact of social media", tip_en:"d'un côté · de l'autre · par ailleurs · en outre · cela étant." },
        { instruction_en:"Analysis: limitations and opportunities", tip_en:"si (= well, but) · présente des lacunes (has shortcomings) · reste néanmoins." },
      ],
      [ /* 4 — Nuance */
        { instruction_en:"Nuancing a position: certes / mais", tip_en:"certes... mais · il est vrai que... néanmoins · on peut admettre que... cependant." },
        { instruction_en:"Nuancing: presenting two aspects", tip_en:"si (advantage) → elle a également (disadvantage). Don't forget the nuance!" },
        { instruction_en:"Nuancing: adding perspective", tip_en:"mérite d'être nuancé · selon les contextes · il convient de distinguer · cela varie selon." },
      ],
      [ /* 5 — Maîtrise */
        { instruction_en:"Mastery: spontaneous expression on a current topic", tip_en:"C2: long sentences · participials · formal register · precise vocabulary." },
        { instruction_en:"Mastery: improvisation on ethics", tip_en:"attribuée à · soulève une question · ouvre la voie à · toutes les dérives." },
        { instruction_en:"Mastery: open analysis", tip_en:"selon + philosopher/theory · la parole n'est pas seulement · elle produit / génère / transforme." },
      ],
    ],
  },

  /* ============================================================ B2 ============================================================ */
  B2: {
    gra: [
      [ /* 0 — Dont/Y/En */
        { instruction_en:"Pronoun dont", trans_en:"The book you told me about is fascinating.", explanation_en:"dont replaces de + noun. parler de qqch → dont.", tip_en:"dont after: parler de · avoir besoin de · se souvenir de." },
        { instruction_en:"Pronoun y", trans_en:"Do you think about your future? — Yes, I think about it often.", explanation_en:"y replaces à + thing (not person). penser à qqch → y penser.", tip_en:"à + thing (not person) → y." },
        { instruction_en:"Pronoun en", trans_en:"Do you have friends in Paris? — Yes, I have a lot.", explanation_en:"en replaces de/des + noun and especially quantity expressions.", tip_en:"quantity (beaucoup, trois, un peu) → en." },
      ],
      [ /* 1 — Gérondif */
        { instruction_en:"Gérondif: manner/simultaneity", trans_en:"He learned French by watching films.", explanation_en:"gérondif = en + present participle. Expresses manner or simultaneity.", tip_en:"en + verb ending in -ant = while/by..." },
        { instruction_en:"Gérondif: tout en (contrast)", trans_en:"He smiles thinking about his mistake.", explanation_en:"en pensant = while thinking. tout en pensant emphasises simultaneity with slight contrast.", tip_en:"tout en + gérondif emphasises contrast." },
        { instruction_en:"Gérondif: condition", trans_en:"You'll lose weight by exercising regularly.", explanation_en:"gérondif expresses condition/means: en faisant = by doing.", tip_en:"en faisant (by doing) · en mangeant (by eating) · en étudiant." },
      ],
      [ /* 2 — Plus-que-parfait */
        { instruction_en:"Plus-que-parfait: past before past", trans_en:"When I arrived at the station, the train had already left.", explanation_en:"An action completed before another past action → plus-que-parfait.", tip_en:"Past before past = plus-que-parfait (avais/était + participle)." },
        { instruction_en:"Plus-que-parfait: indirect speech", trans_en:"She said she had finished her work the day before.", explanation_en:"In past indirect speech, an action prior to the saying → plus-que-parfait.", tip_en:"« hier » in indirect speech becomes « la veille »." },
        { instruction_en:"Plus-que-parfait: bien que", trans_en:"Although he had done his best, he failed.", explanation_en:"When the action is already completed, bien que takes subjonctif passé: ait fait.", tip_en:"subjonctif passé = aie/aies/ait + participle." },
      ],
      [ /* 3 — Conditionnel présent & passé */
        { instruction_en:"Present conditional: hypothesis", trans_en:"If I had more time, I would travel more.", explanation_en:"Si + imparfait → present conditional.", tip_en:"Si + imparfait → present conditional." },
        { instruction_en:"Past conditional: unreal hypothesis", trans_en:"If I had known, I wouldn't have come.", explanation_en:"Si + plus-que-parfait → past conditional. venir with être.", tip_en:"Si + avais su → ... serais venu (regret about the past)." },
        { instruction_en:"Conditional: politeness", trans_en:"I'd like a coffee, please.", explanation_en:"Conditional for polite requests. voudrais = would like.", tip_en:"je voudrais · j'aimerais · pourriez-vous — all conditional for politeness." },
      ],
      [ /* 4 — Accord du participe passé */
        { instruction_en:"Participle agreement with avoir + preceding COD", trans_en:"The flowers I bought are magnificent.", explanation_en:"COD before avoir → PP agrees. fleurs is feminine plural → achetées.", tip_en:"COD before avoir → agreement in gender and number." },
        { instruction_en:"Participle agreement with être", trans_en:"The girls left early.", explanation_en:"With être, PP always agrees with subject. filles feminine plural → parties.", tip_en:"être + PP → always agrees with subject." },
        { instruction_en:"Participle agreement: le seul qui", trans_en:"He's the only friend who truly understands me.", explanation_en:"le seul qui → subjunctive. comprendre → comprenne.", tip_en:"le seul qui, le premier qui → subjunctive." },
      ],
      [ /* 5 — Prépositions avancées */
        { instruction_en:"Preposition: rêver de", trans_en:"I dream of visiting Canada one day.", explanation_en:"rêver de faire qqch — rêver requires de before infinitive.", tip_en:"rêver de · décider de · essayer de · oublier de." },
        { instruction_en:"Preposition: tenir à", trans_en:"I feel the need to thank you.", explanation_en:"tenir à faire qqch = to feel strongly about doing / to want to do.", tip_en:"tenir à · s'opposer à · renoncer à · réussir à." },
        { instruction_en:"Preposition: se passer de", trans_en:"I can't go without coffee in the morning.", explanation_en:"se passer de = to do without. Always de before the noun.", tip_en:"se passer de · manquer de · avoir besoin de · profiter de." },
      ],
    ],
    voc: [
      [ /* 0 — Travail */
        { instruction_en:"To resign", trans_en:"He decided to resign.", explanation_en:"démissionner = to resign. donner sa démission = to hand in one's resignation.", tip_en:"démissionner · être licencié (to be fired) · être au chômage." },
        { instruction_en:"Deadline", trans_en:"I must meet the deadline.", explanation_en:"échéance = deadline. délai = the time period until the deadline.", tip_en:"respecter les délais = to meet deadlines." },
        { instruction_en:"To manage on one's own", trans_en:"I need to learn to manage on my own.", explanation_en:"se débrouiller = to manage, to find a solution on your own.", tip_en:"Débrouille-toi ! = Figure it out yourself!" },
      ],
      [ /* 1 — Émotions */
        { instruction_en:"Frustrated", trans_en:"I'm really frustrated.", explanation_en:"frustré = frustrated. la frustration = frustration.", tip_en:"frustré · déçu (disappointed) · énervé (annoyed) · soulagé (relieved)." },
        { instruction_en:"Worried", trans_en:"I'm really worried about him.", explanation_en:"inquiet = worried. s'inquiéter = to worry.", tip_en:"Ne t'inquiète pas = Don't worry." },
        { instruction_en:"To give up", trans_en:"You must never give up.", explanation_en:"abandonner = to give up. laisser tomber = to drop it (spoken). renoncer = to renounce.", tip_en:"Laisse tomber ! = Drop it! / Forget it!" },
      ],
      [ /* 2 — Expressions courantes */
        { instruction_en:"Worth it", trans_en:"This film is worth it!", explanation_en:"ça vaut le coup/la peine = it's worth it.", tip_en:"ça ne vaut pas le coup = it's not worth the effort." },
        { instruction_en:"On purpose", trans_en:"He did it on purpose.", explanation_en:"faire exprès = to do on purpose.", tip_en:"Je ne l'ai pas fait exprès = I didn't do it on purpose." },
        { instruction_en:"To regret", trans_en:"I really regret my decision.", explanation_en:"regretter = to regret/to be sorry.", tip_en:"Je regrette = I'm sorry / I regret." },
      ],
      [ /* 3 — Nuances */
        { instruction_en:"To get used to", trans_en:"I must get used to this new rhythm.", explanation_en:"s'habituer à qqch = to get used to something.", tip_en:"être habitué à = to be used to." },
        { instruction_en:"To pretend", trans_en:"He's pretending not to understand.", explanation_en:"faire semblant de = to pretend.", tip_en:"faire semblant de + infinitive." },
        { instruction_en:"Annoying (nuance)", trans_en:"This constant noise is really annoying!", explanation_en:"agaçant = mildly annoying · énervant = more strongly annoying.", tip_en:"agaçant · énervant · irritant · exaspérant (most frustrating)." },
      ],
      [ /* 4 — Registres */
        { instruction_en:"Nevertheless (contrast)", trans_en:"It was hard, but I succeeded nevertheless.", explanation_en:"quand même = nevertheless. malgré tout = despite everything.", tip_en:"Merci quand même = Thanks anyway." },
        { instruction_en:"To complain", trans_en:"He doesn't stop complaining about everything!", explanation_en:"se plaindre de qqch = to complain about something.", tip_en:"se plaindre de = to complain about." },
        { instruction_en:"In my opinion (register)", trans_en:"In my opinion, this decision is the right one (formal).", explanation_en:"à mon sens = more literary. selon moi = formal. à mon avis = everyday.", tip_en:"à mon avis · selon moi · à mon sens · de mon point de vue." },
      ],
      [ /* 5 — Idiomes B2 */
        { instruction_en:"Expression: to put off until tomorrow", trans_en:"Don't put off until tomorrow what you can do today.", explanation_en:"remettre au lendemain = to put off until tomorrow. procrastiner = to procrastinate.", tip_en:"remettre au lendemain = procrastiner." },
        { instruction_en:"Expression: to see the big picture", trans_en:"You need to see things in perspective.", explanation_en:"voir dans leur ensemble = to see as a whole. en perspective = in perspective.", tip_en:"globalement · dans l'ensemble · en perspective · vue d'ensemble." },
        { instruction_en:"Expression: not worth it", trans_en:"It's not worth the effort.", explanation_en:"ce n'est pas la peine = it's not worth it, no need to bother.", tip_en:"ce n'est pas la peine · ça ne vaut pas le coup · inutile de." },
      ],
    ],
    com: [
      [ /* 0 — Presse */
        { instruction_en:"Read and answer", q_en:"According to the text, what is a disadvantage of remote working?", explanation_en:"« peinent à séparer vie professionnelle et vie privée »." },
        { instruction_en:"Read and answer", q_en:"What does the tram's service entry depend on?", explanation_en:"« à condition que le financement soit validé par la région »." },
        { instruction_en:"Read and answer", q_en:"What does the author think of local consumption?", explanation_en:"« loin d'être un simple effet de mode » + « véritable prise de conscience »." },
      ],
      [ /* 1 — Chroniques */
        { instruction_en:"Read and answer", q_en:"What does the text say about the printed book?", explanation_en:"« conserve un charme que beaucoup ne sont pas prêts à abandonner »." },
        { instruction_en:"Read and answer", q_en:"What risk does the text mention?", explanation_en:"« peut nuire à la concentration et au sommeil »." },
        { instruction_en:"Read and answer", q_en:"What might discourage buying organic products?", explanation_en:"« malgré un prix souvent plus élevé »." },
      ],
      [ /* 2 — Débats TV */
        { instruction_en:"Read and answer", q_en:"How was the film received?", explanation_en:"« accueil critique mitigé » + « franc succès auprès du public »." },
        { instruction_en:"Read and answer", q_en:"What is the municipality's goal?", explanation_en:"« désengorger le centre-ville »." },
        { instruction_en:"Read and answer", q_en:"What is the paradoxical effect of digital technology?", explanation_en:"Paradox: immediacy → impatience → erosion of deep reflection." },
      ],
      [ /* 3 — Essais */
        { instruction_en:"Read and answer", q_en:"What effect does economic precariousness have?", explanation_en:"« instabilité cognitive qui affecte la prise de décision »." },
        { instruction_en:"Read and answer", q_en:"What factor is essential according to the text?", explanation_en:"« la régularité finit toujours par payer »." },
        { instruction_en:"Read and answer", q_en:"What tension does the text identify?", explanation_en:"« valorisent à la fois l'individualisme et la solidarité »." },
      ],
      [ /* 4 — Discours */
        { instruction_en:"Read and answer", q_en:"How does the text explain populism?", explanation_en:"« exploitant la méfiance envers les élites »." },
        { instruction_en:"Read and answer", q_en:"How does the text describe science?", explanation_en:"« modèles provisoires, constamment révisés »." },
        { instruction_en:"Read and answer", q_en:"What legitimises a decision?", explanation_en:"« qualité du débat qui le précède »." },
      ],
      [ /* 5 — Analyses */
        { instruction_en:"Read and answer", q_en:"What is the difference between the beautiful and the sublime?", explanation_en:"« le beau apaise, le sublime confronte l'homme à ses propres limites »." },
        { instruction_en:"Read and answer", q_en:"What does the translator actually do?", explanation_en:"« acte d'interprétation, voire de création... transporte des mondes »." },
        { instruction_en:"Read and answer", q_en:"What is the paradox mentioned?", explanation_en:"Paradox: liberation + deprivation of symbolic frameworks." },
      ],
    ],
    exp: [
      [ /* 0 — Société */
        { instruction_en:"Express your opinion: remote working", tip_en:"personnellement · je trouve que · cependant · c'est pourquoi." },
        { instruction_en:"Express your opinion: social media", tip_en:"D'un côté… de l'autre… · à mon avis · tout dépend de." },
        { instruction_en:"Express your opinion: climate change", tip_en:"ces gestes comptent (these actions count) · incombe à (falls upon)." },
      ],
      [ /* 1 — Culture */
        { instruction_en:"Describe a favourite dish", tip_en:"à la fois · de plus · parce que · il me rappelle." },
        { instruction_en:"Describe an ideal weekend day", tip_en:"conditional: commencerait · je me promènerais · je retrouverais." },
        { instruction_en:"Compare two cultures", tip_en:"en ... on + verb · davantage (more) · les deux · à l'inverse." },
      ],
      [ /* 2 — Argumentation */
        { instruction_en:"Argument framework: 2 arguments", tip_en:"premièrement · deuxièmement · en outre (furthermore) · de plus." },
        { instruction_en:"Give advice: learning French", tip_en:"je lui conseille de + inf · il faudrait que · c'est en + gérondif que." },
        { instruction_en:"Build an argument: conditional", tip_en:"Si + imparfait → conditionnel. je voterais · je créerais · j'imposerais." },
      ],
      [ /* 3 — Nuancer */
        { instruction_en:"Nuancing a position: add certes/mais", tip_en:"certes... mais · il est vrai que... néanmoins · on peut admettre que... cependant." },
        { instruction_en:"Nuancing: two aspects", tip_en:"si (advantage) → elle a également (disadvantage). Don't forget the nuance!" },
        { instruction_en:"Nuancing: separating aspects", tip_en:"d'un côté · de l'autre · par ailleurs · tout dépend de." },
      ],
      [ /* 4 — Convaincre */
        { instruction_en:"Convince: present a conclusion", tip_en:"en définitive · n'est pas seulement... c'est aussi · irremplaçable." },
        { instruction_en:"Convince: respond to an objection", tip_en:"je comprends... mais · loin de là · bien au contraire · néanmoins." },
        { instruction_en:"Convince: support a position", tip_en:"en + gérondif = by + ing · vous accédez à · une culture riche." },
      ],
      [ /* 5 — Improviser */
        { instruction_en:"Improvisation: hypothetical response", tip_en:"present conditional: je serais · je comprendrais · je proposerais." },
        { instruction_en:"Improvisation: skill you'd like", tip_en:"Si + imparfait → conditionnel: je choisirais · ce serait · je pourrais." },
        { instruction_en:"Improvisation: advice to a historical figure", tip_en:"je lui conseillerais de · ne pas laisser + N + inf · la modération." },
      ],
    ],
  },

  /* ============================================================ C1 ============================================================ */
  C1: {
    gra: [
      [ /* 0 — Subjonctif présent */
        { instruction_en:"Subjunctive: il faut que", trans_en:"You need to finish this report before noon.", explanation_en:"il faut que + subjunctive. finir → finisses.", tip_en:"il faut que · il est important que · il est essentiel que → subjunctive." },
        { instruction_en:"Subjunctive: bien que", trans_en:"Although he's tired, he keeps working.", explanation_en:"bien que (although) + subjunctive. être → soit.", tip_en:"bien que · quoique · encore que → subjunctive." },
        { instruction_en:"Subjunctive: pour que", trans_en:"I'm repeating the explanation so that you understand.", explanation_en:"pour que (so that) + subjunctive. comprendre → comprennes.", tip_en:"pour que · afin que · à condition que → subjunctive." },
      ],
      [ /* 1 — Conditionnel passé */
        { instruction_en:"Past conditional: regret", trans_en:"If I had known, I wouldn't have come.", explanation_en:"Si + PQP → past conditional. venir = être → serais venu.", tip_en:"Si + avais su → ... serais venu." },
        { instruction_en:"Past conditional: current consequence", trans_en:"If I had studied medicine, I would be a doctor today.", explanation_en:"Past condition + present result: Si + PQP → present conditional.", tip_en:"Si + avait fait → serait (aujourd'hui) — present-day result." },
        { instruction_en:"Past conditional: reproach", trans_en:"You could have warned me!", explanation_en:"Past conditional for reproach/exasperation. avoir + pu.", tip_en:"tu aurais pu · il aurait dû · vous auriez dû." },
      ],
      [ /* 2 — Discours indirect */
        { instruction_en:"Indirect speech: passé composé → PQP", trans_en:"She said she had finished her work the day before.", explanation_en:"In past indirect speech, PC → PQP.", tip_en:"« hier » in indirect speech → « la veille »." },
        { instruction_en:"Indirect speech: future → conditional", trans_en:"He told me he would come the next day.", explanation_en:"Future in direct speech → present conditional in indirect speech.", tip_en:"future → conditional in past indirect speech." },
        { instruction_en:"Indirect speech: question", trans_en:"She asked him if he understood the lesson.", explanation_en:"Question in indirect speech: si + imparfait (when original question was in present).", tip_en:"direct: « Tu comprends ? » → indirect: il demande si elle comprend." },
      ],
      [ /* 3 — Concordance des temps */
        { instruction_en:"Sequence of tenses: present → imparfait", trans_en:"I thought he was right.", explanation_en:"Present in the past. penser (imparfait) → avoir (imparfait) in the clause.", tip_en:"pensais/croyais/savais → ... avait / faisait / était." },
        { instruction_en:"Sequence of tenses: subjunctive imparfait (formal style)", trans_en:"He needed to do better. (formal style)", explanation_en:"Subjunctive imparfait in literary/formal style after fallait que.", tip_en:"fît (literary) vs fasse (everyday) — both after fallait que." },
        { instruction_en:"Sequence of tenses: narrative sequence", trans_en:"When he arrived, everyone had already left.", explanation_en:"PQP for an action that preceded the past: était parti.", tip_en:"Past before past = PQP (avait/était + participle)." },
      ],
      [ /* 4 — Subjonctif passé */
        { instruction_en:"Past subjunctive: bien que (completed action)", trans_en:"Although he finished early, he stayed.", explanation_en:"Past subjunctive for a completed action after bien que.", tip_en:"Past subjunctive = avoir/être in subjunctive + participle." },
        { instruction_en:"Past subjunctive: douter que", trans_en:"I doubt that he read this report.", explanation_en:"douter que + past subjunctive. lire → ait lu.", tip_en:"douter que · ne pas penser que · ne pas croire que → subjunctive." },
        { instruction_en:"Past subjunctive: le seul qui", trans_en:"He's the only friend who truly helped me.", explanation_en:"le seul qui + past subjunctive when action is completed.", tip_en:"le seul/premier/dernier qui + subjunctive (present or past)." },
      ],
      [ /* 5 — Style avancé */
        { instruction_en:"Subject inversion: peut-être", trans_en:"Perhaps this approach needs to be reconsidered.", explanation_en:"peut-être at the start → inversion: faut-il, est-ce, doit-on.", tip_en:"peut-être + inversion: faut-il · est-ce · doit-on." },
        { instruction_en:"Advanced style: sans que + subjunctive", trans_en:"He left without anyone knowing.", explanation_en:"sans que + subjunctive. savoir → sache.", tip_en:"sans que + subjunctive. sans + infinitive (same subject)." },
        { instruction_en:"Advanced style: quoi que", trans_en:"Whatever you do, do it with conviction.", explanation_en:"quoi que + subjunctive = whatever.", tip_en:"quoi que · où que · qui que — all with subjunctive." },
      ],
    ],
    voc: [
      [ /* 0 — Abstrait */
        { instruction_en:"Abstract concept: empathy", trans_en:"Empathy is the capacity to understand others' emotions.", explanation_en:"empathie = empathy. autrui = others (literary). sympathie = sympathy.", tip_en:"empathie · sympathie · compassion · bienveillance (kindness)." },
        { instruction_en:"Concept: resilience", trans_en:"Resilience is the capacity to overcome hardships.", explanation_en:"résilience = resilience. surmonter = to overcome. une épreuve = a trial/hardship.", tip_en:"résilience · persévérance · détermination · endurance." },
        { instruction_en:"Concept: ambiguity", trans_en:"This text is marked by great ambiguity.", explanation_en:"ambiguïté = ambiguity. ambigu = ambiguous.", tip_en:"ambigu · équivoque · l'ambiguïté (n)." },
      ],
      [ /* 1 — Professionnel */
        { instruction_en:"Business: to negotiate", trans_en:"Both parties had to negotiate a compromise.", explanation_en:"négocier = to negotiate. une négociation = negotiation.", tip_en:"négocier · conclure un accord · trouver un terrain d'entente." },
        { instruction_en:"Business: to subcontract", trans_en:"The company decided to subcontract this task.", explanation_en:"sous-traiter = to subcontract. externaliser = to outsource.", tip_en:"sous-traiter · externaliser · déléguer · confier à." },
        { instruction_en:"Business: profitable", trans_en:"This project isn't profitable enough.", explanation_en:"rentable = profitable. la rentabilité = profitability.", tip_en:"rentable · profitable · viable · lucratif." },
      ],
      [ /* 2 — Académique */
        { instruction_en:"Academic: to argue a thesis", trans_en:"This article argues the thesis that…", explanation_en:"soutenir une thèse = to argue/defend. avancer = to propose.", tip_en:"soutenir · défendre · avancer · formuler (to formulate)." },
        { instruction_en:"Academic: it results from", trans_en:"It emerges from this analysis that…", explanation_en:"il ressort de = it emerges from. il résulte de = it results from.", tip_en:"il ressort · il résulte · il découle · il s'ensuit que." },
        { instruction_en:"Academic: in conclusion", trans_en:"In conclusion, it can be stated that globalisation is ambivalent.", explanation_en:"en conclusion = in conclusion. en somme = in sum. en définitive = ultimately.", tip_en:"en conclusion · en somme · bref · pour conclure · en définitive." },
      ],
      [ /* 3 — Registres */
        { instruction_en:"Register: formal vs spoken", trans_en:"Write formally: 'I didn't have time.'", explanation_en:"Spoken: pas (without ne). Formal: ne … pas.", tip_en:"spoken: j'ai pas · y'a pas · formal: je n'ai pas · il n'y a pas." },
        { instruction_en:"Register: ironic", trans_en:"Identify the irony in: 'What a surprise, another delay!'", explanation_en:"ironic = ironic. The speaker is not surprised — the opposite of the literal meaning.", tip_en:"irony = gap between what is said and what is meant." },
        { instruction_en:"Register: formal", trans_en:"Write formally: 'This film is awesome!'", explanation_en:"vachement = slang. remarquable/exceptionnel = formal/literary.", tip_en:"vachement bien → remarquable · super → excellent · nul → médiocre." },
      ],
      [ /* 4 — Idiomes avancés */
        { instruction_en:"Idiom: avoir le cafard", trans_en:"Since he left, she's been really down in the dumps.", explanation_en:"avoir le cafard = to feel depressed/low (idiom).", tip_en:"avoir le cafard · broyer du noir · ne pas avoir le moral." },
        { instruction_en:"Idiom: casser les pieds", trans_en:"Stop it, you're getting on my nerves with your questions!", explanation_en:"casser les pieds à qqn = to annoy (informal idiom).", tip_en:"casser les pieds = to get on one's nerves." },
        { instruction_en:"Idiom: mettre les pieds dans le plat", trans_en:"He really put his foot in it at the meeting.", explanation_en:"mettre les pieds dans le plat = to put one's foot in it (idiom).", tip_en:"mettre les pieds dans le plat = to blunder / say the wrong thing." },
      ],
      [ /* 5 — Littéraire */
        { instruction_en:"Literary expression: to highlight", trans_en:"The author highlights the importance of dialogue in his work.", explanation_en:"souligner = to highlight. mettre en exergue = to foreground (literary).", tip_en:"souligner · mettre en relief · accentuer · mettre en exergue." },
        { instruction_en:"Literary expression: paradigmatic", trans_en:"This novel is emblematic of its era.", explanation_en:"paradigmatique = representative of a period/trend. emblématique = symbolic.", tip_en:"paradigmatique · emblématique · symptomatique · caractéristique." },
        { instruction_en:"Literary expression: prépondérant", trans_en:"The question of meaning plays a dominant role in this text.", explanation_en:"prépondérant = dominant. rôle prépondérant = leading role.", tip_en:"prépondérant · essentiel · fondamental · central · pivot." },
      ],
    ],
    com: [
      [ /* 0 — Débats */
        { instruction_en:"Read and answer", q_en:"What is the paradoxical effect of social media on debate?", explanation_en:"They amplify marginal voices but fragment the public space." },
        { instruction_en:"Read and answer", q_en:"What is the paradoxical effect of digital technology?", explanation_en:"Paradox: immediacy → impatience → erosion of deep reflection." },
        { instruction_en:"Read and answer", q_en:"What legitimises a decision?", explanation_en:"« qualité du débat qui le précède »." },
      ],
      [ /* 1 — Littérature */
        { instruction_en:"Read and answer", q_en:"What is the function of literature according to this text?", explanation_en:"« réinvente pour en révéler des vérités autrement inaccessibles »." },
        { instruction_en:"Read and answer", q_en:"What does reading represent according to the author?", explanation_en:"« habiter temporairement une autre conscience »." },
        { instruction_en:"Read and answer", q_en:"What does the translator actually do?", explanation_en:"« acte d'interprétation, voire de création »." },
      ],
      [ /* 2 — Philosophie */
        { instruction_en:"Read and answer", q_en:"What characterises a democracy?", explanation_en:"« capacité à tolérer la divergence des points de vue »." },
        { instruction_en:"Read and answer", q_en:"What is the paradox of modernity?", explanation_en:"Liberation + deprivation of symbolic frameworks = paradox." },
        { instruction_en:"Read and answer", q_en:"How does the author define happiness?", explanation_en:"« il se vit dans la quête elle-même »." },
      ],
      [ /* 3 — Politique */
        { instruction_en:"Read and answer", q_en:"How does the text explain populism?", explanation_en:"« exploitant la méfiance envers les élites »." },
        { instruction_en:"Read and answer", q_en:"What tension does the text describe?", explanation_en:"« souveraineté nationale et l'intégration européenne »." },
        { instruction_en:"Read and answer", q_en:"What effect does precariousness have?", explanation_en:"« instabilité cognitive » + « reproduit les inégalités »." },
      ],
      [ /* 4 — Sciences */
        { instruction_en:"Read and answer", q_en:"How does the text describe science?", explanation_en:"« modèles provisoires, constamment révisés »." },
        { instruction_en:"Read and answer", q_en:"What does the term 'paradigm' designate?", explanation_en:"« l'ensemble des présupposés théoriques et méthodologiques partagés »." },
        { instruction_en:"Read and answer", q_en:"What question does AI raise?", explanation_en:"« questions inédites sur la paternité des œuvres »." },
      ],
      [ /* 5 — Arts */
        { instruction_en:"Read and answer", q_en:"Why is contemporary art sometimes misunderstood?", explanation_en:"« exige du spectateur une disposition à l'incertitude »." },
        { instruction_en:"Read and answer", q_en:"Where does beauty reside according to this text?", explanation_en:"« dans la relation dynamique entre l'œuvre et le regard »." },
        { instruction_en:"Read and answer", q_en:"What makes music unique according to the text?", explanation_en:"« se consomme dans le temps, imposant une durée »." },
      ],
    ],
    exp: [
      [ /* 0 — Débattre */
        { instruction_en:"Express your opinion with contrast", tip_en:"je trouve que · cependant · c'est pourquoi + position." },
        { instruction_en:"Debate: support one side", tip_en:"dès (from) · développe · habitue à · cela permet de." },
        { instruction_en:"Debate: formulate a reasoned position", tip_en:"joue un rôle (plays a role) · sans + GN, + conditional · issus de." },
      ],
      [ /* 1 — Nuancer */
        { instruction_en:"Nuancing a position: technology", tip_en:"certes... mais · il est vrai que... néanmoins · on peut admettre que... cependant." },
        { instruction_en:"Nuancing: evidence-based contrast", tip_en:"si (advantage) → elle a aussi (disadvantage)." },
        { instruction_en:"Nuancing: add a perspective", tip_en:"mérite d'être nuancée · si certains... d'autres · selon le contexte." },
      ],
      [ /* 2 — Négocier */
        { instruction_en:"Negotiation: polite proposal", tip_en:"je comprends · cependant · je vous propose · une solution intermédiaire." },
        { instruction_en:"Negotiation: stating conditions", tip_en:"je suis prêt à · à condition que + subjunctive · à moins que." },
        { instruction_en:"Negotiation: reaching agreement", tip_en:"trouver un terrain d'entente · satisfaire les deux parties · être fructueux." },
      ],
      [ /* 3 — Analyser */
        { instruction_en:"Analysis: artificial intelligence", tip_en:"loin d'une opposition · exige une lecture nuancée · demeure préoccupant." },
        { instruction_en:"Analysis: impact of social media on democracy", tip_en:"d'un côté · de l'autre · par ailleurs · en outre." },
        { instruction_en:"Analysis: literature and reality", tip_en:"en + gérondif (= by) · élargir (to broaden) · sous un angle inédit." },
      ],
      [ /* 4 — Convaincre */
        { instruction_en:"Convince: importance of French", tip_en:"en définitive · n'est pas seulement... c'est aussi · irremplaçable." },
        { instruction_en:"Convince: respond to an objection", tip_en:"je comprends... mais · loin de là · bien au contraire." },
        { instruction_en:"Convince: defend a value", tip_en:"à l'heure de (in the age of) · irremplaçable · qu'aucun X ne peut égaler." },
      ],
      [ /* 5 — Spontané */
        { instruction_en:"Spontaneous: hypothetical response", tip_en:"conditional: je serais · je comprendrais · je proposerais." },
        { instruction_en:"Spontaneous: skill you'd like", tip_en:"Si + imparfait → conditional: je choisirais · ce serait · je pourrais." },
        { instruction_en:"Spontaneous: describe an ideal day", tip_en:"conditional: commencerait · je me promènerais · je retrouverais." },
      ],
    ],
  },

  /* ============================================================ BC (legacy flat arrays) ============================================================ */
  BC: {
    gra: [
      { instruction_en:"Fill in the correct verb form (subjunctive)", trans_en:"You need to finish this report before noon.", explanation_en:"After 'il faut que', always use subjunctive. Second person singular of finir is finisses.", tip_en:"Necessity expressions trigger subjunctive: il faut que, il est important que." },
      { instruction_en:"Fill in the correct form (subjunctive after bien que)", trans_en:"Although he's tired, he keeps working.", explanation_en:"'bien que' (although) always requires subjunctive. The form of être is soit.", tip_en:"Concession/contrast: bien que, quoique → subjunctive." },
      { instruction_en:"Fill in the past conditional", trans_en:"If I had known, I wouldn't have come.", explanation_en:"Past unreal conditional: Si + plus-que-parfait → past conditional. venir requires être.", tip_en:"Si + avais su → ... serais venu (regret about the past)." },
      { instruction_en:"Fill in the tense sequence (indirect speech)", trans_en:"She said she had finished her work the day before.", explanation_en:"In past indirect speech, an action prior to the saying becomes plus-que-parfait: avait fini.", tip_en:"'hier' in indirect speech becomes 'la veille'." },
      { instruction_en:"Fill in the correct form (subjunctive after pour que)", trans_en:"I'm repeating the explanation so that you understand.", explanation_en:"'pour que' (so that) requires subjunctive. comprendre → comprennes.", tip_en:"Purpose: pour que, afin que → subjunctive." },
      { instruction_en:"Fill in the correct relative pronoun", trans_en:"The book you told me about is fascinating.", explanation_en:"'dont' replaces de + noun. The verb here is parler de, so we use dont.", tip_en:"Verb requiring de (parler de, avoir besoin de) → dont." },
      { instruction_en:"Fill in the correct past participle agreement", trans_en:"The flowers I bought are magnificent.", explanation_en:"With avoir, the participle agrees with the direct object when it comes before. fleurs is feminine plural → achetées.", tip_en:"Direct object before avoir → agreement in gender and number." },
      { instruction_en:"Fill in the correct form (subjunctive after le seul qui)", trans_en:"He's the only friend who truly understands me.", explanation_en:"After 'le seul/le premier/le dernier qui', subjunctive is usually used: comprenne.", tip_en:"le seul qui, le premier qui → subjunctive." },
      { instruction_en:"Fill in the gérondif (simultaneity/manner)", trans_en:"He learned French by watching films.", explanation_en:"Gérondif is formed from en + present participle, expressing manner or simultaneity.", tip_en:"en + verb ending in -ant = while/by..." },
      { instruction_en:"Fill in the plus-que-parfait", trans_en:"When I arrived at the station, the train had already left.", explanation_en:"An action completed before another past action → plus-que-parfait: était parti (partir with être).", tip_en:"Past before past = plus-que-parfait (avais/était + participle)." },
      { instruction_en:"Fill in the present conditional", trans_en:"If I had more time, I would travel more.", explanation_en:"Present unreal conditional: Si + imparfait → present conditional (voyagerais).", tip_en:"Si + imparfait → present conditional." },
      { instruction_en:"Fill in the correct pronoun (y)", trans_en:"Are you thinking about your future? — Yes, I think about it often.", explanation_en:"'y' replaces à + thing. penser à qqch → y penser.", tip_en:"à + thing (not person) → y." },
      { instruction_en:"Fill in the correct pronoun (en)", trans_en:"Do you have friends in Paris? — Yes, I have a lot.", explanation_en:"'en' replaces de/des + noun, especially quantity expressions.", tip_en:"quantity (beaucoup, trois, un peu) → en." },
      { instruction_en:"Fill in the past subjunctive", trans_en:"Although he had done his best, he failed.", explanation_en:"When the action is already completed, bien que takes past subjunctive: ait fait.", tip_en:"past subjunctive = aie/aies/ait + participle." },
      { instruction_en:"Fill in the tense sequence (future in indirect speech)", trans_en:"He told me he would come the next day.", explanation_en:"Future reported in past indirect speech becomes present conditional: viendrait.", tip_en:"future in direct speech → conditional in indirect speech." },
    ],
    voc: [
      { instruction_en:"Translate into French: 'to resign from a job'", trans_en:"To leave a job at one's own initiative.", explanation_en:"'démissionner' = to resign.", tip_en:"donner sa démission = to hand in a letter of resignation." },
      { instruction_en:"Translate into French: 'deadline'", trans_en:"The date by which something must be finished.", explanation_en:"'échéance' or 'date limite' = deadline. 'délai' is the time period until the deadline.", tip_en:"respecter les délais = to meet deadlines." },
      { instruction_en:"Translate into French: 'to manage / to cope on one's own'", trans_en:"To succeed in managing and finding a solution by yourself.", explanation_en:"'se débrouiller' = to manage, to find a solution by oneself.", tip_en:"Débrouille-toi ! = Figure it out yourself!" },
      { instruction_en:"Translate into French: 'it's worth it / worthwhile'", trans_en:"It's worth the effort.", explanation_en:"'ça vaut le coup' (informal) or 'ça vaut la peine' (more formal) = it's worth it.", tip_en:"ça ne vaut pas le coup = it's not worth the effort." },
      { instruction_en:"Translate into French: 'frustrated'", trans_en:"I'm frustrated.", explanation_en:"'frustré' = frustrated.", tip_en:"la frustration = frustration (noun)." },
      { instruction_en:"Translate into French: 'to give up / to throw in the towel'", trans_en:"To give up, to stop trying.", explanation_en:"'abandonner' or 'renoncer' = to give up. 'laisser tomber' very informal = to drop it.", tip_en:"Laisse tomber ! = Drop it! / Forget it!" },
      { instruction_en:"Translate into French: 'on purpose / deliberately'", trans_en:"He did it on purpose.", explanation_en:"'faire exprès' = to do on purpose.", tip_en:"Je ne l'ai pas fait exprès = I didn't do it on purpose." },
      { instruction_en:"Translate into French: 'to get used to'", trans_en:"I must get used to this climate.", explanation_en:"'s'habituer à qqch' = to get used to something.", tip_en:"être habitué à = to be used to." },
      { instruction_en:"Translate into French: 'to pretend'", trans_en:"He's pretending to sleep.", explanation_en:"'faire semblant de' = to pretend.", tip_en:"faire semblant de + infinitive." },
      { instruction_en:"Translate into French: 'to complain'", trans_en:"He doesn't stop complaining.", explanation_en:"'se plaindre de qqch' = to complain about something.", tip_en:"se plaindre de = to complain about." },
      { instruction_en:"Translate into French: 'worried / concerned'", trans_en:"I'm worried about him.", explanation_en:"'inquiet' = worried. Feminine: inquiète.", tip_en:"Ne t'inquiète pas = Don't worry." },
      { instruction_en:"Translate into French: 'nevertheless / despite everything'", trans_en:"It was hard, but I did it nevertheless.", explanation_en:"'quand même' = nevertheless, despite everything.", tip_en:"Merci quand même = Thanks anyway." },
      { instruction_en:"Translate into French: 'to regret / to be sorry about'", trans_en:"I regret my decision.", explanation_en:"'regretter qqch' = to regret/be sorry about something.", tip_en:"Je regrette = I'm sorry / I regret." },
      { instruction_en:"Translate into French: 'in my opinion'", trans_en:"In my opinion, it's a good idea.", explanation_en:"'à mon avis' or 'selon moi' = in my opinion.", tip_en:"à mon avis opens a sentence expressing personal opinion." },
      { instruction_en:"Translate into French: 'annoying / irritating'", trans_en:"This noise is really annoying.", explanation_en:"'agaçant' or 'énervant' = annoying.", tip_en:"Ça m'énerve ! = That annoys me!" },
    ],
    com: [
      { q_en:"According to the text, what is a disadvantage of remote working?", explanation_en:"The text says some employees struggle to separate work life from private life." },
      { q_en:"What does the tram's service entry depend on?", explanation_en:"'à condition que le financement soit validé par la région' = provided funding is approved by the region." },
      { q_en:"How was the film received?", explanation_en:"'accueil critique mitigé' = mixed reviews, but 'franc succès auprès du public' = great success with audiences." },
      { q_en:"What does the author think of local consumption?", explanation_en:"'loin d'être un simple effet de mode' = far from being just a trend." },
      { q_en:"What risk does the text mention?", explanation_en:"The text says excessive use 'peut nuire à la concentration et au sommeil'." },
      { q_en:"What might discourage buying organic products?", explanation_en:"'malgré un prix souvent plus élevé' = despite often higher prices." },
      { q_en:"What does the text say about the printed book?", explanation_en:"The text says the printed book 'conserve un charme' — retains a charm." },
      { q_en:"What is the municipality's goal?", explanation_en:"'désengorger le centre-ville' = to relieve congestion in the city centre." },
      { q_en:"What factor is essential according to the text?", explanation_en:"'la régularité finit toujours par payer' = regularity always pays off." },
    ],
    exp: [
      { instruction_en:"Express your opinion in two sentences (open answer)", tip_en:"Strong opinion structure: 'Je trouve que…', add contrast with 'Cependant…', end with a position." },
      { instruction_en:"Tell about something (open answer)", tip_en:"passé composé for actions (je suis allé), imparfait for background (il faisait, nous étions)." },
      { instruction_en:"Respond to a situation (open answer)", tip_en:"Present conditional for hypothetical situations: je serais, je comprendrais, je proposerais." },
      { instruction_en:"Describe and explain (open answer)", tip_en:"Enriching connectors: 'à la fois…', 'de plus…', 'parce que…'." },
      { instruction_en:"Express a position (open answer)", tip_en:"For a balanced opinion: 'D'un côté… de l'autre…' or 'Tout dépend de…'." },
      { instruction_en:"Describe a sequence (open answer)", tip_en:"Sequence words: 'D'abord… ensuite… puis… enfin…' organise the story." },
      { instruction_en:"Hypothetical response (open answer)", tip_en:"Si + imparfait → conditionnel: 'Si je pouvais, je choisirais…'." },
      { instruction_en:"Give advice (open answer)", tip_en:"For giving advice: 'Je te conseille de…', 'Il faudrait que tu…' (subjunctive)." },
    ],
  },
};
