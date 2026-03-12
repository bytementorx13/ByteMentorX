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

const SERVICE_LABELS: Record<string, string> = {
  webdev: "Web Development Service",
  consultation: "Consultation Service",
  csfunda: "CS Fundamentals Teaching",
  project: "Project Guidance & Resume Review",
};

const FIELD_LABELS: Record<string, string> = {
  projectDesc: "Project Description",
  features: "Required Features",
  timeline: "Expected Timeline",
  budget: "Budget",
  links: "Reference Links",
  topic: "Consultation Topic",
  hours: "Number of Hours",
  level: "Current Level",
  goals: "Goals",
  meetingTime: "Preferred Meeting Time",
  subject: "Subject",
  sessions: "Sessions",
  doubts: "Key Topics / Doubts",
  schedule: "Preferred Schedule",
  focusArea: "Focus Area",
  projectCategory: "Project Category",
  customCategory: "Custom Category",
  details: "Project / Resume Details",
  currentStage: "Current Stage",
  category: "Project Category",
  idea: "Project Idea",
  deadline: "Deadline",
  techStack: "Tech Stack",
  complexity: "Complexity Level",
};

function buildHtmlEmail(
  name: string,
  email: string,
  serviceType: string,
  formData: Record<string, unknown>,
  calculatedPrice?: number | null
): string {
  const serviceLabel = SERVICE_LABELS[serviceType] || serviceType;

  const rows = Object.entries(formData)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      const label = FIELD_LABELS[k] || k;
      return `
        <tr>
          <td style="padding:10px 16px;background:#1a1a2e;color:#9ca3af;font-size:13px;width:38%;border-bottom:1px solid #2d2d4e;vertical-align:top;">${label}</td>
          <td style="padding:10px 16px;background:#12122a;color:#e2e8f0;font-size:13px;border-bottom:1px solid #2d2d4e;vertical-align:top;">${String(v)}</td>
        </tr>`;
    })
    .join("");

  const priceBlock = calculatedPrice
    ? `<div style="margin:24px 0;padding:16px 24px;background:linear-gradient(135deg,#1e3a5f,#1a2e4a);border-left:4px solid #6366f1;border-radius:6px;">
        <p style="margin:0;font-size:13px;color:#94a3b8;letter-spacing:0.05em;text-transform:uppercase;">Estimated Price</p>
        <p style="margin:6px 0 0;font-size:26px;font-weight:700;color:#a5b4fc;">₹${calculatedPrice.toLocaleString("en-IN")}</p>
      </div>`
    : `<div style="margin:24px 0;padding:16px 24px;background:#1a2e4a;border-left:4px solid #6366f1;border-radius:6px;">
        <p style="margin:0;font-size:13px;color:#94a3b8;">Pricing</p>
        <p style="margin:6px 0 0;font-size:18px;font-weight:600;color:#e2e8f0;">Custom / To be discussed</p>
      </div>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%);padding:32px 32px 24px;border-radius:12px 12px 0 0;border-bottom:1px solid #2d2d5e;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:11px;color:#6366f1;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">ByteMentorX</p>
                  <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff;font-weight:700;">New Service Request</h1>
                </td>
                <td align="right">
                  <span style="display:inline-block;padding:6px 14px;background:#6366f1;color:#fff;font-size:12px;font-weight:600;border-radius:20px;">${serviceLabel}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Client Info -->
        <tr>
          <td style="background:#12122a;padding:24px 32px 0;">
            <p style="margin:0 0 16px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Client Information</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:10px;">
                  <p style="margin:0;font-size:13px;color:#9ca3af;">Full Name</p>
                  <p style="margin:4px 0 0;font-size:16px;color:#f1f5f9;font-weight:600;">${name}</p>
                </td>
                <td style="padding-bottom:10px;">
                  <p style="margin:0;font-size:13px;color:#9ca3af;">Email Address</p>
                  <p style="margin:4px 0 0;font-size:16px;color:#6366f1;font-weight:600;">
                    <a href="mailto:${email}" style="color:#818cf8;text-decoration:none;">${email}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Price -->
        <tr>
          <td style="background:#12122a;padding:0 32px;">
            ${priceBlock}
          </td>
        </tr>

        <!-- Request Details -->
        <tr>
          <td style="background:#12122a;padding:0 32px 24px;">
            <p style="margin:0 0 12px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Request Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #2d2d4e;">
              ${rows}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#12122a;padding:0 32px 32px;">
            <p style="margin:24px 0 16px;font-size:14px;color:#94a3b8;">Reply to this email or reach out directly to schedule a Google Meet with the client.</p>
            <a href="mailto:${email}?subject=Re: Your ByteMentorX Request — ${serviceLabel}"
               style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
              Reply to ${name}
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d0d1a;padding:20px 32px;border-radius:0 0 12px 12px;border-top:1px solid #1e1e38;">
            <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;">
              ByteMentorX · Build Faster. Learn Smarter. Get Ahead.<br>
              This email was auto-generated from a form submission.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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
        const htmlBody = buildHtmlEmail(
          input.name,
          input.email,
          input.serviceType,
          input.formData as Record<string, unknown>,
          input.calculatedPrice
        );

        const serviceLabel = SERVICE_LABELS[input.serviceType] || input.serviceType;

        await transporter.sendMail({
          from: `"ByteMentorX" <${process.env.SMTP_USER}>`,
          to: process.env.SMTP_TO || process.env.SMTP_USER,
          replyTo: input.email,
          subject: `[ByteMentorX] New Request — ${serviceLabel} from ${input.name}`,
          html: htmlBody,
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
