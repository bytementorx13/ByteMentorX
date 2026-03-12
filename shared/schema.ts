import { z } from "zod";

export const insertRequestSchema = z.object({
  serviceType: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  formData: z.record(z.unknown()),
  calculatedPrice: z.number().nullable().optional(),
});

export type InsertRequest = z.infer<typeof insertRequestSchema>;

export type RequestResponse = {
  id: string;
  serviceType: string;
  name: string;
  email: string;
  formData: Record<string, unknown>;
  calculatedPrice: number | null;
  timestamp: Date;
};
