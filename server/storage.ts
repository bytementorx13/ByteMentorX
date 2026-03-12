import { RequestModel, getIsConnected } from "./db";
import type { InsertRequest, RequestResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createRequest(request: InsertRequest): Promise<RequestResponse>;
}

export class MongoStorage implements IStorage {
  async createRequest(request: InsertRequest): Promise<RequestResponse> {
    if (!getIsConnected()) {
      // Fallback: return a synthetic response if MongoDB is unavailable
      return {
        id: randomUUID(),
        serviceType: request.serviceType,
        name: request.name,
        email: request.email,
        formData: request.formData as Record<string, unknown>,
        calculatedPrice: request.calculatedPrice ?? null,
        timestamp: new Date(),
      };
    }

    const doc = await RequestModel.create(request);
    return {
      id: doc._id.toString(),
      serviceType: doc.serviceType,
      name: doc.name,
      email: doc.email,
      formData: doc.formData,
      calculatedPrice: doc.calculatedPrice ?? null,
      timestamp: doc.timestamp,
    };
  }
}

export const storage = new MongoStorage();
