# 🇫🇷 FrenchUp

אפליקציית לימוד צרפתית עם מטרו פריז — אתגר יומי ב-6 רמות (A1–C2), שאלות מותאמות לתחנה, שמירת נתונים בענן ו-Auth מלא.
בנויה ב-Next.js, מוכנה לפריסה ב-Vercel.

---

## ✨ פיצ׳רים

### לימוד
- **6 רמות CEFR** — A1, A2, B1, B2, C1, C2
- **4 מיומנויות בכל רמה** — דקדוק, אוצר מילים, הבנה, ביטוי חופשי
- **מטרו פריז** — 6 תחנות לכל מיומנות, 3 תשובות נכונות = קידום לתחנה הבאה
- **שאלות לפי תחנה** — כל תחנה עוסקת בנושא ספציפי (למשל A1 דקדוק תחנה 2 = Articles)
- **Landmark icons** — פריז נפתחת על המפה עם כל הישג

### מענה ובדיקה
- **בדיקה אוטומטית** — דקדוק ואוצר מילים
- **רב-ברירה** — הבנה (comprehension)
- **בדיקת AI** — שאלות ביטוי חופשי דרך Claude (`/api/check`)
- **ניקוד** — תשובה נכונה +50 XP, שגויה −15 XP עם הסבר מפורט
- **תרגום בלחיצה** על כל משפט צרפתי
- **קול נוירוני** דרך ElevenLabs (`/api/tts`) עם fallback לקול המכשיר

### Question Mastery
- שאלה שנענתה **נכון** לא מופיעה שוב
- רק שאלות שטעו בהן יכולות לחזור
- כל תחנה מחזיקה בנק שאלות עצמאי — 3 שאלות לפחות לכל תחנה

### חשבון משתמש (Supabase)
- **מסך פתיחה** עם Login / Signup (Email + Password)
- **שמירה בענן** — XP, streak, מספר תשובות נכונות, מסלול המטרו לפי רמה — כל הנתונים שמורים לכל משתמש
- **Row Level Security** — כל משתמש רואה רק את הנתונים שלו
- **Fallback מקומי** — אם Supabase לא מוגדר, עובד ב-localStorage

### Dashboard
- **Weekly XP** — גרף שבועי
- **Streak** — ימי לימוד רצופים
- **מפת פריז SVG** — מציגה את ההתקדמות על מפת המטרו
- **בחירת רמה** — החלפה בין A1–C2 בלחיצה

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
│  ├─ layout.js              # RTL, עברית
│  ├─ page.js                # Session check → AuthScreen / App
│  ├─ globals.css
│  ├─ api/tts/route.js       # פרוקסי ל-ElevenLabs
│  └─ api/check/route.js     # בדיקת תשובות עם Claude
├─ components/
│  ├─ FrenchUp.jsx           # כל לוגיקת האפליקציה
│  └─ AuthScreen.jsx         # מסך Login / Signup
├─ lib/
│  └─ supabase.js            # Supabase client
├─ .env.example
├─ .gitignore
└─ package.json
```

---

## אבטחה

- מפתחות API נשארים בצד השרת בלבד (ELEVENLABS, ANTHROPIC)
- Supabase RLS — כל משתמש מוגבל לנתונים שלו בלבד
- `.gitignore` חוסם `.env*` ו-`.env.local`
