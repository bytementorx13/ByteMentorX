import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import nodemailer from "nodemailer";
import { connectToDatabase } from "./db";

const ADMIN_ID = "admin";
const ADMIN_PASSWORD = "Admin@1";

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

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: `"ByteMentorX" <${process.env.SMTP_USER}>`,
      to: opts.to,
      replyTo: process.env.SMTP_USER,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

function emailLayout(content: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="background:linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%);padding:28px 32px 20px;border-radius:12px 12px 0 0;border-bottom:1px solid #2d2d5e;">
  <p style="margin:0;font-size:11px;color:#6366f1;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">ByteMentorX</p>
</td></tr>
<tr><td style="background:#12122a;padding:28px 32px;">${content}</td></tr>
<tr><td style="background:#0d0d1a;padding:18px 32px;border-radius:0 0 12px 12px;border-top:1px solid #1e1e38;">
  <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;">ByteMentorX · Build Faster. Learn Smarter. Get Ahead.</p>
</td></tr>
</table>
</td></tr>
</table></body></html>`;
}

function buildNewRequestEmail(
  name: string,
  email: string,
  serviceType: string,
  formData: Record<string, unknown>,
  calculatedPrice?: number | null,
) {
  const serviceLabel = SERVICE_LABELS[serviceType] || serviceType;
  const rows = Object.entries(formData)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:10px 16px;background:#1a1a2e;color:#9ca3af;font-size:13px;width:38%;border-bottom:1px solid #2d2d4e;vertical-align:top;">${FIELD_LABELS[k] || k}</td>
        <td style="padding:10px 16px;background:#12122a;color:#e2e8f0;font-size:13px;border-bottom:1px solid #2d2d4e;vertical-align:top;">${String(v)}</td>
      </tr>`,
    )
    .join("");

  const priceBlock = calculatedPrice
    ? `<div style="margin:20px 0;padding:16px 24px;background:linear-gradient(135deg,#1e3a5f,#1a2e4a);border-left:4px solid #6366f1;border-radius:6px;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">Estimated Price</p>
        <p style="margin:6px 0 0;font-size:24px;font-weight:700;color:#a5b4fc;">₹${calculatedPrice.toLocaleString("en-IN")}</p>
      </div>`
    : `<div style="margin:20px 0;padding:14px 20px;background:#1a2e4a;border-left:4px solid #6366f1;border-radius:6px;">
        <p style="margin:0;font-size:13px;color:#e2e8f0;font-weight:600;">Pricing: Custom / To be discussed</p>
      </div>`;

  return emailLayout(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td><h1 style="margin:0 0 4px;font-size:20px;color:#fff;font-weight:700;">New Service Request</h1></td>
        <td align="right"><span style="display:inline-block;padding:5px 12px;background:#6366f1;color:#fff;font-size:12px;font-weight:600;border-radius:20px;">${serviceLabel}</span></td>
      </tr>
    </table>
    <p style="margin:16px 0 4px;font-size:13px;color:#9ca3af;">From: <strong style="color:#f1f5f9;">${name}</strong> &lt;<a href="mailto:${email}" style="color:#818cf8;">${email}</a>&gt;</p>
    ${priceBlock}
    <p style="margin:16px 0 10px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;font-weight:600;">Request Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #2d2d4e;">${rows}</table>
    <p style="margin:20px 0 14px;font-size:14px;color:#94a3b8;">Log in to the admin panel to review and respond to this request.</p>
    <a href="mailto:${email}?subject=Re: Your ByteMentorX Request" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">Reply to ${name}</a>
  `);
}

function buildStatusEmail(
  name: string,
  serviceType: string,
  accepted: boolean,
  adminNotes?: string | null,
) {
  const serviceLabel = SERVICE_LABELS[serviceType] || serviceType;
  if (accepted) {
    return emailLayout(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#a5b4fc;font-weight:700;">Great News, ${name}!</h2>
      <p style="color:#e2e8f0;font-size:15px;line-height:1.6;">Your request for <strong>${serviceLabel}</strong> has been <strong style="color:#4ade80;">accepted</strong>.</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;">We will reach out to you shortly to confirm the next steps and schedule your session.</p>
      ${adminNotes ? `<div style="margin:20px 0;padding:16px;background:#1a2e1a;border-left:4px solid #4ade80;border-radius:6px;"><p style="margin:0;color:#86efac;font-size:14px;">${adminNotes}</p></div>` : ""}
      <p style="color:#6b7280;font-size:13px;margin-top:24px;">— TechieSteve · ByteMentorX</p>
    `);
  } else {
    return emailLayout(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#f1f5f9;font-weight:700;">Request Update — ${name}</h2>
      <p style="color:#e2e8f0;font-size:15px;line-height:1.6;">Thank you for reaching out about <strong>${serviceLabel}</strong>.</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;">Unfortunately, we are unable to accommodate this request at the moment.</p>
      ${adminNotes ? `<div style="margin:20px 0;padding:16px;background:#2a1a1a;border-left:4px solid #f87171;border-radius:6px;"><p style="margin:0;color:#fca5a5;font-size:14px;">${adminNotes}</p></div>` : ""}
      <p style="color:#6b7280;font-size:13px;margin-top:24px;">Feel free to reach out again in the future.<br>— TechieSteve · ByteMentorX</p>
    `);
  }
}

function buildScheduleEmail(
  name: string,
  serviceType: string,
  sessionDate: string,
  sessionTime: string,
  meetingLink?: string | null,
) {
  const serviceLabel = SERVICE_LABELS[serviceType] || serviceType;
  return emailLayout(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#a5b4fc;font-weight:700;">Session Scheduled — ${name}</h2>
    <p style="color:#e2e8f0;font-size:15px;line-height:1.6;">Your <strong>${serviceLabel}</strong> session has been confirmed.</p>
    <div style="margin:24px 0;padding:20px 24px;background:#1a1a2e;border:1px solid #2d2d4e;border-radius:10px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;color:#9ca3af;font-size:13px;width:40%;">Date</td>
          <td style="padding:8px 0;color:#f1f5f9;font-size:15px;font-weight:600;">${sessionDate}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Time</td>
          <td style="padding:8px 0;color:#f1f5f9;font-size:15px;font-weight:600;">${sessionTime}</td>
        </tr>
        ${
          meetingLink
            ? `<tr>
          <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Meeting</td>
          <td style="padding:8px 0;"><a href="${meetingLink}" style="color:#818cf8;font-size:14px;font-weight:600;">${meetingLink}</a></td>
        </tr>`
            : ""
        }
      </table>
    </div>
    ${meetingLink ? `<a href="${meetingLink}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;margin-bottom:20px;">Join Meeting</a>` : ""}
    <p style="color:#6b7280;font-size:13px;margin-top:16px;">Please be available 5 minutes early. See you there!<br>— TechieSteve · ByteMentorX</p>
  `);
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  await connectToDatabase();

  // ── Public: submit a request ──────────────────────────────────────────
  app.post(api.requests.create.path, async (req, res) => {
    try {
      const input = api.requests.create.input.parse(req.body);
      const request = await storage.createRequest(input);

      // Notify admin
      const adminHtml = buildNewRequestEmail(
        input.name,
        input.email,
        input.serviceType,
        input.formData as Record<string, unknown>,
        input.calculatedPrice,
      );
      await sendEmail({
        to: process.env.SMTP_TO || process.env.SMTP_USER || "",
        subject: `[ByteMentorX] New Request — ${SERVICE_LABELS[input.serviceType] || input.serviceType} from ${input.name}`,
        html: adminHtml,
      });

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

  // ── Admin Auth ─────────────────────────────────────────────────────────
  app.post("/api/admin/login", (req, res) => {
    const { id, password } = req.body;
    if (id === ADMIN_ID && password === ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      return res.json({ success: true });
    }
    return res.status(401).json({ message: "Invalid credentials" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {});
    res.json({ success: true });
  });

  app.get("/api/admin/check", (req, res) => {
    res.json({ isAdmin: !!req.session?.isAdmin });
  });

  // ── Admin: get all requests ────────────────────────────────────────────
  app.get("/api/admin/requests", requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllRequests();
      res.json(requests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Admin: update request (accept/reject/schedule/complete) ───────────
  app.patch("/api/admin/requests/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, adminNotes, sessionDate, sessionTime, meetingLink, finalPrice } = req.body;

      let updates: Record<string, unknown> = {};

      if (action === "accept") {
        updates = { status: "accepted", adminNotes: adminNotes || null };
      } else if (action === "reject") {
        updates = { status: "rejected", adminNotes: adminNotes || null };
      } else if (action === "schedule") {
        updates = {
          status: "scheduled",
          sessionDate,
          sessionTime,
          meetingLink: meetingLink || null,
        };
      } else if (action === "complete") {
        updates = { status: "completed" };
      } else if (action === "setPrice") {
        updates = { finalPrice };
      } else {
        return res.status(400).json({ message: "Invalid action" });
      }

      const updated = await storage.updateRequest(id, updates as any);
      if (!updated) return res.status(404).json({ message: "Request not found" });

      // Send emails on status change
      if (action === "accept") {
        await sendEmail({
          to: updated.email,
          subject: `Your ${SERVICE_LABELS[updated.serviceType] || updated.serviceType} Request Has Been Accepted`,
          html: buildStatusEmail(updated.name, updated.serviceType, true, adminNotes),
        });
      } else if (action === "reject") {
        await sendEmail({
          to: updated.email,
          subject: `Regarding Your ByteMentorX Request`,
          html: buildStatusEmail(updated.name, updated.serviceType, false, adminNotes),
        });
      } else if (action === "schedule") {
        await sendEmail({
          to: updated.email,
          subject: `Your Session Has Been Scheduled — ByteMentorX`,
          html: buildScheduleEmail(
            updated.name,
            updated.serviceType,
            sessionDate,
            sessionTime,
            meetingLink,
          ),
        });
      }

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
