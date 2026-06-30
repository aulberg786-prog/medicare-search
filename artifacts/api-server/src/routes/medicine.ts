import { Router } from "express";
import { db } from "@workspace/db";
import { medicineHistoryTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const SYSTEM_PROMPT = `You are a highly knowledgeable pharmacist. Provide accurate info about the medicine the user searches. You MUST return ONLY a valid JSON object with this exact structure:
{ "isMedicine": true, "medicineName": "...", "english": { "uses": "...", "dosage": "...", "sideEffects": "...", "precautions": "...", "disclaimer": "..." }, "romanUrdu": { "uses": "...", "dosage": "...", "sideEffects": "...", "precautions": "...", "disclaimer": "..." }, "urduScript": { "uses": "...", "dosage": "...", "sideEffects": "...", "precautions": "...", "disclaimer": "..." } }.
If the input is not a medicine, set isMedicine to false and return this: { "isMedicine": false, "errorMsg_EN": "Sorry, '{{query}}' is not a recognized medicine.", "errorMsg_RU": "Maaf kijiye, '{{query}}' koi dawai nahi hai.", "errorMsg_UR": "معاف کیجئے، '{{query}}' کوئی دوائی نہیں ہے۔" }`;

// POST /api/medicine/search
router.post("/search", async (req, res) => {
  const { query } = req.body as { query: string };

  if (!query || typeof query !== "string" || !query.trim()) {
    res.status(400).json({ error: "Query is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Gemini API key not configured" });
    return;
  }

  const prompt = SYSTEM_PROMPT.replace(/\{\{query\}\}/g, query.trim()) +
    `\n\nUser Input: ${query.trim()}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      req.log.error({ status: response.status }, "Gemini API error");
      res.status(502).json({ error: "AI service unavailable. Please try again." });
      return;
    }

    let result: { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    try {
      result = await response.json() as typeof result;
    } catch {
      req.log.error("Failed to parse Gemini response");
      res.status(502).json({ error: "AI service returned an invalid response." });
      return;
    }

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    if (!cleaned) {
      res.status(502).json({ error: "AI service returned an empty response." });
      return;
    }

    let parsed: {
      isMedicine: boolean;
      medicineName?: string;
      errorMsg_EN?: string;
      errorMsg_RU?: string;
      errorMsg_UR?: string;
    };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      req.log.error({ cleaned }, "Failed to parse Gemini JSON output");
      res.status(502).json({ error: "AI response could not be processed." });
      return;
    }

    // Save to history if valid medicine
    if (parsed.isMedicine && parsed.medicineName) {
      try {
        await db.insert(medicineHistoryTable).values({
          query: query.trim(),
          medicineName: parsed.medicineName,
        });
      } catch (dbErr) {
        req.log.error({ dbErr }, "Failed to save search history");
      }
    }

    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "Medicine search error");
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/medicine/history
router.get("/history", async (req, res) => {
  try {
    const limitParam = req.query.limit;
    const limit = limitParam ? Math.min(Number(limitParam), 50) : 10;

    const history = await db
      .select()
      .from(medicineHistoryTable)
      .orderBy(desc(medicineHistoryTable.searchedAt))
      .limit(limit);

    res.json(history);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch history");
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
