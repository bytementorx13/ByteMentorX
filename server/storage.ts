import { RequestModel, getIsConnected } from "./db";
import type { InsertRequest, RequestResponse, AdminRequest } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createRequest(request: InsertRequest): Promise<RequestResponse>;
  getAllRequests(): Promise<AdminRequest[]>;
  updateRequest(id: string, updates: Partial<AdminRequest>): Promise<AdminRequest | null>;
  getRequestById(id: string): Promise<AdminRequest | null>;
}

export class MongoStorage implements IStorage {
  async createRequest(request: InsertRequest): Promise<RequestResponse> {
    if (!getIsConnected()) {
      return {
        id: randomUUID(),
        serviceType: request.serviceType,
        name: request.name,
        email: request.email,
        formData: request.formData as Record<string, unknown>,
        calculatedPrice: request.calculatedPrice ?? null,
        status: "pending",
        paymentStatus: "unpaid",
        timestamp: new Date(),
      };
    }

    const doc = await RequestModel.create(request);
    return docToResponse(doc);
  }

  async getAllRequests(): Promise<AdminRequest[]> {
    if (!getIsConnected()) return [];
    const docs = await RequestModel.find().sort({ timestamp: -1 }).lean();
    return docs.map(docToAdminRequest);
  }

  async updateRequest(id: string, updates: Partial<AdminRequest>): Promise<AdminRequest | null> {
    if (!getIsConnected()) return null;
    const doc = await RequestModel.findByIdAndUpdate(id, { $set: updates }, { returnDocument: "after" }).lean();
    if (!doc) return null;
    return docToAdminRequest(doc);
  }

  async getRequestById(id: string): Promise<AdminRequest | null> {
    if (!getIsConnected()) return null;
    const doc = await RequestModel.findById(id).lean();
    if (!doc) return null;
    return docToAdminRequest(doc);
  }
}

function docToResponse(doc: any): RequestResponse {
  return {
    id: doc._id.toString(),
    serviceType: doc.serviceType,
    name: doc.name,
    email: doc.email,
    formData: doc.formData,
    calculatedPrice: doc.calculatedPrice ?? null,
    status: doc.status,
    paymentStatus: doc.paymentStatus,
    timestamp: doc.timestamp,
  };
}

function docToAdminRequest(doc: any): AdminRequest {
  return {
    id: doc._id.toString(),
    serviceType: doc.serviceType,
    name: doc.name,
    email: doc.email,
    formData: doc.formData,
    calculatedPrice: doc.calculatedPrice ?? null,
    finalPrice: doc.finalPrice ?? null,
    status: doc.status || "pending",
    paymentStatus: doc.paymentStatus || "unpaid",
    sessionDate: doc.sessionDate ?? null,
    sessionTime: doc.sessionTime ?? null,
    meetingLink: doc.meetingLink ?? null,
    adminNotes: doc.adminNotes ?? null,
    timestamp: doc.timestamp,
  };
}

export const storage = new MongoStorage();
