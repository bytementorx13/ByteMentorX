import { z } from "zod";
import { insertRequestSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  requests: {
    create: {
      method: "POST" as const,
      path: "/api/requests" as const,
      input: insertRequestSchema,
      responses: {
        201: z.object({
          id: z.string(),
          serviceType: z.string(),
          name: z.string(),
          email: z.string(),
          formData: z.record(z.unknown()),
          calculatedPrice: z.number().nullable(),
          timestamp: z.date().or(z.string()),
        }),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type RequestInput = z.infer<typeof api.requests.create.input>;
export type RequestResponse = z.infer<typeof api.requests.create.responses[201]>;
