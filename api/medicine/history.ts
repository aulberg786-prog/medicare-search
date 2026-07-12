import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { desc } from 'drizzle-orm';

// Inline schema to avoid workspace import issues
const medicineHistoryTable = pgTable('medicine_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  query: text('query').notNull(),
  medicineName: text('medicine_name').notNull(),
  searchedAt: timestamp('searched_at').defaultNow().notNull(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.DATABASE_URL) {
    // Return empty history gracefully if DB not configured
    return res.json([]);
  }

  try {
    const limitParam = req.query.limit;
    const limit = limitParam ? Math.min(Number(limitParam), 50) : 10;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    const history = await db
      .select()
      .from(medicineHistoryTable)
      .orderBy(desc(medicineHistoryTable.searchedAt))
      .limit(limit);

    await pool.end();
    return res.json(history);
  } catch (err) {
    console.error('Failed to fetch history', err);
    return res.json([]); // Graceful fallback
  }
}
