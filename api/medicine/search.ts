import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Inline schema to avoid workspace import issues
const medicineHistoryTable = pgTable('medicine_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  query: text('query').notNull(),
  medicineName: text('medicine_name').notNull(),
  searchedAt: timestamp('searched_at').defaultNow().notNull(),
});

const SYSTEM_PROMPT = `You are a knowledgeable Pakistani pharmacist and patient safety expert. When the user searches a medicine, return ONLY a valid JSON object with this EXACT structure:

{
  "isMedicine": true,
  "medicineName": "Brand Name (Generic Name)",
  "english": {
    "uses": "...",
    "dosage": "...",
    "sideEffects": "...",
    "precautions": "...",
    "disclaimer": "..."
  },
  "romanUrdu": {
    "uses": "...",
    "dosage": "...",
    "sideEffects": "...",
    "precautions": "...",
    "disclaimer": "..."
  },
  "urduScript": {
    "uses": "...",
    "dosage": "...",
    "sideEffects": "...",
    "precautions": "...",
    "disclaimer": "..."
  },
  "genericInfo": {
    "genericName": "The actual generic/chemical name (e.g. Paracetamol for Panadol)",
    "en": "This medicine's brand name is [Brand]. The same medicine is available as [Generic] at much lower cost. Patients can ask their doctor or pharmacist for the generic version. Example cheaper brands: [list 2-3 cheaper alternatives available in Pakistan].",
    "ru": "Is dawai ka brand naam [Brand] hai. Yehi dawai [Generic] ke naam se bahut sasti milti hai. Doctor ya pharmacist se generic maangein. Sasti alternatives: [list].",
    "ur": "اس دوائی کا برانڈ نام [Brand] ہے۔ یہی دوائی [Generic] کے نام سے بہت سستی ملتی ہے۔ ڈاکٹر یا فارماسسٹ سے جنیرک مانگیں۔"
  },
  "necessityNote": {
    "en": "Is this medicine commonly over-prescribed in Pakistan for commission? Give an honest, specific assessment. If yes, explain when it IS actually needed vs when it may be unnecessary. If no, confirm it is a standard necessary prescription.",
    "ru": "Kya yeh dawai Pakistan mein commission ke liye zyada likhi jaati hai? Honest assessment dein.",
    "ur": "کیا یہ دوائی پاکستان میں کمیشن کے لیے زیادہ لکھی جاتی ہے؟ ایمانداری سے بتائیں۔"
  },
  "fakeMedicineWarning": {
    "riskLevel": "low|medium|high",
    "en": "Is this medicine commonly counterfeited/fake in Pakistan? riskLevel: low=rarely fake, medium=sometimes fake, high=very commonly fake. Give specific tips to identify genuine medicine (check packaging, hologram, batch number, buy from registered pharmacy, etc).",
    "ru": "Kya yeh dawai Pakistan mein nakli milti hai? Asli pehchanne ke tarike batayein.",
    "ur": "کیا یہ دوائی پاکستان میں جعلی ملتی ہے؟ اصلی پہچاننے کے طریقے بتائیں۔"
  }
}

If the input is NOT a medicine, return:
{ "isMedicine": false, "errorMsg_EN": "Sorry, '{{query}}' is not a recognized medicine.", "errorMsg_RU": "Maaf kijiye, '{{query}}' koi dawai nahi hai.", "errorMsg_UR": "معاف کیجئے، '{{query}}' کوئی دوائی نہیں ہے۔" }

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation, no code blocks.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body as { query?: string };
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const prompt =
    SYSTEM_PROMPT.replace(/\{\{query\}\}/g, query.trim()) +
    `\n\nUser Input: ${query.trim()}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!geminiRes.ok) {
      return res.status(502).json({ error: 'AI service unavailable. Please try again.' });
    }

    const result = await geminiRes.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    if (!cleaned) {
      return res.status(502).json({ error: 'AI service returned an empty response.' });
    }

    const parsed = JSON.parse(cleaned) as {
      isMedicine: boolean;
      medicineName?: string;
    };

    // Save to DB if valid medicine
    if (parsed.isMedicine && parsed.medicineName && process.env.DATABASE_URL) {
      try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const db = drizzle(pool);
        await db.insert(medicineHistoryTable).values({
          query: query.trim(),
          medicineName: parsed.medicineName,
        });
        await pool.end();
      } catch {
        // Non-fatal: history save failure doesn't break search
      }
    }

    return res.json(parsed);
  } catch (err) {
    console.error('Medicine search error', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
