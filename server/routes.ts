import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import nodemailer from "nodemailer";

// Basic nodemailer configuration for free SMTP testing
// For production, the user would configure actual SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'ethereal.pass',
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.requests.create.path, async (req, res) => {
    try {
      const input = api.requests.create.input.parse(req.body);
      const request = await storage.createRequest(input);
      
      // Attempt to send email, but don't fail the request if it fails
      try {
        await transporter.sendMail({
          from: '"ByteMentorX" <noreply@bytetmentorx.com>',
          to: "steve@bytetmentorx.com", // Send to admin
          subject: `New Request: ${input.serviceType} from ${input.name}`,
          text: `
New request received:
Name: ${input.name}
Email: ${input.email}
Service: ${input.serviceType}
Price: ${input.calculatedPrice ? '₹' + input.calculatedPrice : 'Custom'}
Details: ${JSON.stringify(input.formData, null, 2)}
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }

      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
