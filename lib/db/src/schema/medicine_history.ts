import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicineHistoryTable = pgTable("medicine_history", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  medicineName: text("medicine_name").notNull(),
  searchedAt: timestamp("searched_at").defaultNow().notNull(),
});

export const insertMedicineHistorySchema = createInsertSchema(medicineHistoryTable).omit({ id: true, searchedAt: true });
export type InsertMedicineHistory = z.infer<typeof insertMedicineHistorySchema>;
export type MedicineHistory = typeof medicineHistoryTable.$inferSelect;
