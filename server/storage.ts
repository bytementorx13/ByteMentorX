import { db } from "./db";
import { requests, type InsertRequest, type RequestResponse } from "@shared/schema";

export interface IStorage {
  createRequest(request: InsertRequest): Promise<RequestResponse>;
}

export class DatabaseStorage implements IStorage {
  async createRequest(request: InsertRequest): Promise<RequestResponse> {
    const [created] = await db.insert(requests).values(request).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
