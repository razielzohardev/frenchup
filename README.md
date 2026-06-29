# 🇫🇷 FrenchUp

אפליקציית לימוד צרפתית מוצגת כמטרו ברחובות פריז — אתגר יומי ב-6 רמות (A1–C2), שאלות מותאמות לתחנה, שמירת נתונים בענן ו-Auth מלא.
בנויה ב-Next.js, מוכנה לפריסה ב-Vercel.

---

## ✨ פיצ׳רים

### לימוד
- **6 רמות CEFR** — A1, A2, B1, B2, C1, C2
- **4 מיומנויות בכל רמה** — דקדוק, אוצר מילים, הבנה, ביטוי חופשי
- **מטרו פריז** — 6 תחנות לכל מיומנות, 3 תשובות נכונות = קידום לתחנה הבאה
- **שאלות לפי תחנה** — כל תחנה עוסקת בנושא ספציפי (למשל A1 דקדוק תחנה 2 = Articles)
- **Landmark icons** — פריז נפתחת על המפה עם כל הישג
- **Hero text לפי רמה** — ברכה ייחודית בכל רמה בדשבורד

### מענה ובדיקה
- **בדיקה אוטומטית** — דקדוק ואוצר מילים
- **רב-ברירה** — הבנה (comprehension)
- **בדיקת AI** — שאלות ביטוי חופשי דרך Claude (`/api/check`)
- **ניקוד** — תשובה נכונה +50 XP, שגויה −15 XP עם הסבר מפורט
- **תרגום תשובת מודל** — כפתור תרגום לתשובות מודל בשאלות חופשיות (MyMemory API)
- **מקשי גישה מהירה לאותיות** — סרגל é è ê ë à â ù û ô ö ç œ î ï מעל שדות הטקסט
- **קול נוירוני** דרך ElevenLabs (`/api/tts`) עם fallback לקול המכשיר

### Question Mastery
- שאלה שנענתה **נכון** לא מופיעה שוב
- רק שאלות שטעו בהן יכולות לחזור
- כל תחנה מחזיקה בנק שאלות עצמאי — 3 שאלות לפחות לכל תחנה

### שיעורים (Lessons)
- **כרטיסיות שיעור לפי רמה** — A1–C2, כל שיעור מתרחב בלחיצה
- **סרטון YouTube** מוטמע בכל שיעור (youtube-nocookie, lazy loading)
- **טבלת דקדוק** — תאים לחיצים: לחיצה ראשונה = השמעה, לחיצה שנייה = תרגום (MyMemory)
- **Flashcards אוצר מילים** — רשת 2 עמודות, הפיכה עם השמעת המילה הצרפתית + חזרה אוטומטית לצרפתית אחרי 2 שניות
- **כרטיס בודד ממורכז** — כשמספר הכרטיסיות אי-זוגי, הכרטיס האחרון ממורכז
- **דוגמאות עם השמעה** — כל משפט לחיץ לשמיעה דרך TTS

### חשבון משתמש (Supabase)
- **מסך פתיחה** עם Login / Signup (Email + Password) + Google OAuth
- **שכחתי סיסמה** — שחזור דרך אימייל עם דף reset-password
- **מסך ברוך הבא** — אנימציית כניסה של 5 שניות
- **שם תצוגה לפי שפה** — שם בעברית ושם באנגלית, מוצג לפי שפת הממשק
- **שמירה בענן** — XP, streak, מספר תשובות נכונות, מסלול המטרו לפי רמה — כל הנתונים שמורים לכל משתמש
- **Row Level Security** — כל משתמש רואה רק את הנתונים שלו
- **Fallback מקומי** — אם Supabase לא מוגדר, עובד ב-localStorage

### Dashboard
- **Weekly XP** — גרף שבועי עם תוויות ערך
- **Streak** — ימי לימוד רצופים
- **מפת פריז SVG** — מציגה את ההתקדמות על מפת המטרו
- **ציר זמן רמות** — נקודות צבעוניות עם תיאורים בעברית לכל רמת CEFR
- **בחירת רמה** — החלפה בין A1–C2 בלחיצה
- **תפריט משתמש** — שינוי שם + יציאה

### לוקליזציה
- **דו-לשוני מלא** — עברית ואנגלית, ניתן להחלפה בלחיצה (HE | EN)
- **כפתור שפה קבוע** — מופיע בפינה הימנית העליונה במסך הכניסה
- **RTL / LTR** — עברית מימין לשמאל, אנגלית משמאל לימין
- **כל מחרוזות הממשק** — מתורגמות לשתי השפות (`lib/lang.js`)

### נגינת מוזיקה
- **נגן מוזיקה** — מנגינות קלאסיות צרפתיות ברקע (À la claire fontaine, La Marseillaise ועוד)

---

## הרצה מקומית

```bash
npm install
cp .env.example .env.local
# הוסף את המפתחות (ראה למטה)
npm run dev
```

פתח http://localhost:3000

---

## משתני סביבה

```env
# ElevenLabs — קול נוירוני (לא חובה)
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...        # ברירת מחדל קיימת

# Anthropic Claude — בדיקת ביטוי חופשי (לא חובה)
ANTHROPIC_API_KEY=...
CHECK_MODEL=claude-sonnet-4-6  # ברירת מחדל

# Supabase — Auth + שמירת progress (לא חובה, fallback ל-localStorage)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## פריסה ל-Vercel

1. העלה ל-GitHub → חבר ב-Vercel → הוסף Environment Variables
2. הוסף ב-Vercel את כל המפתחות מלמעלה
3. לחץ **Deploy**

---

## מסד נתונים (Supabase)

הרץ ב-SQL Editor של Supabase:

```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user sees own" ON progress FOR ALL USING (auth.uid() = user_id);
```

---

## מבנה הפרויקט

```
frenchup/
├─ app/
│  ├─ layout.js                 # RTL, עברית
│  ├─ page.js                   # Session check → AuthScreen / App
│  ├─ globals.css
│  ├─ reset-password/page.js    # דף שחזור סיסמה
│  └─ api/
│     ├─ tts/route.js           # פרוקסי ל-ElevenLabs
│     ├─ check/route.js         # בדיקת תשובות עם Claude
│     └─ translate/route.js     # תרגום עם Claude (fallback: MyMemory)
├─ components/
│  ├─ FrenchUp.jsx              # כל לוגיקת האפליקציה
│  └─ AuthScreen.jsx            # מסך Login / Signup / Reset
├─ lib/
│  ├─ supabase.js               # Supabase client
│  ├─ lang.js                   # LangContext — מחרוזות עברית / אנגלית
│  ├─ lessons.js                # תוכן השיעורים (A1–C2)
│  ├─ banks.js                  # בנקי שאלות בעברית
│  └─ banks-en.js               # בנקי שאלות באנגלית
├─ .env.example
├─ .gitignore
└─ package.json
```

---

## אבטחה

- מפתחות API נשארים בצד השרת בלבד (ELEVENLABS, ANTHROPIC)
- Supabase RLS — כל משתמש מוגבל לנתונים שלו בלבד
- `.gitignore` חוסם `.env*` ו-`.env.local`
