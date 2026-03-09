import { pgTable, text, serial, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  serviceType: text("service_type").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  formData: jsonb("form_data").notNull(),
  calculatedPrice: integer("calculated_price"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  timestamp: true,
});

export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;

export type CreateRequestRequest = InsertRequest;
export type RequestResponse = Request;
