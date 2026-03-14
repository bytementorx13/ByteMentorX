import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be set.");
}

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "bytementorx",
      serverSelectionTimeoutMS: 8000,
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    isConnected = true;
    console.log("[mongodb] Connected to MongoDB Atlas");
  } catch (error) {
    console.error(
      "[mongodb] Connection failed — submissions will still work but won't be persisted until Atlas IP whitelist is configured:",
      (error as Error).message,
    );
  }
}

export function getIsConnected() {
  return isConnected;
}

const requestSchema = new mongoose.Schema(
  {
    serviceType: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    formData: { type: mongoose.Schema.Types.Mixed, required: true },
    calculatedPrice: { type: Number, default: null },
    finalPrice: { type: Number, default: null },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "rejected", "scheduled", "completed"],
    },
    paymentStatus: {
      type: String,
      default: "unpaid",
      enum: ["unpaid", "paid", "advance_paid", "fully_paid"],
    },
    sessionDate: { type: String, default: null },
    sessionTime: { type: String, default: null },
    meetingLink: { type: String, default: null },
    paymentLink: { type: String, default: null },
    adminNotes: { type: String, default: null },
  },
  { timestamps: { createdAt: "timestamp", updatedAt: "updatedAt" } },
);

export const RequestModel =
  mongoose.models.Request ||
  mongoose.model("Request", requestSchema, "requests");
