import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import nodemailer from "nodemailer";
import { connectToDatabase } from "./db";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await connectToDatabase();

  app.post(api.requests.create.path, async (req, res) => {
    try {
      const input = api.requests.create.input.parse(req.body);
      const request = await storage.createRequest(input);

      try {
        const formattedDetails = Object.entries(input.formData as Record<string, unknown>)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");

        await transporter.sendMail({
          from: `"ByteMentorX" <${process.env.SMTP_USER}>`,
          to: process.env.SMTP_TO || process.env.SMTP_USER,
          subject: `New Request: ${input.serviceType} from ${input.name}`,
          text: `
New service request received on ByteMentorX:

Name: ${input.name}
Email: ${input.email}
Service: ${input.serviceType}
Price: ${input.calculatedPrice ? "₹" + input.calculatedPrice : "Custom / To be discussed"}

Details:
${formattedDetails}

---
Respond to the client at: ${input.email}
          `.trim(),
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }

      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
