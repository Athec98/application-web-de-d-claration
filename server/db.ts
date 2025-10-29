import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  birthDeclarations, InsertBirthDeclaration,
  documents, InsertDocument,
  birthCertificates, InsertBirthCertificate,
  payments, InsertPayment,
  notifications, InsertNotification
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USERS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phoneNumber", "address", "otpCode"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.isVerified !== undefined) {
      values.isVerified = user.isVerified;
      updateSet.isVerified = user.isVerified;
    }
    if (user.otpExpiry !== undefined) {
      values.otpExpiry = user.otpExpiry;
      updateSet.otpExpiry = user.otpExpiry;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByPhone(phoneNumber: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserOTP(userId: number, otpCode: string, otpExpiry: Date) {
  const db = await getDb();
  if (!db) return;

  await db.update(users)
    .set({ otpCode, otpExpiry })
    .where(eq(users.id, userId));
}

export async function verifyUser(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(users)
    .set({ isVerified: true, otpCode: null, otpExpiry: null })
    .where(eq(users.id, userId));
}

// ==================== BIRTH DECLARATIONS ====================

export async function createBirthDeclaration(declaration: InsertBirthDeclaration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(birthDeclarations).values(declaration);
  return Number(result[0].insertId);
}

export async function getBirthDeclarationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(birthDeclarations).where(eq(birthDeclarations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBirthDeclarationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(birthDeclarations)
    .where(eq(birthDeclarations.userId, userId))
    .orderBy(desc(birthDeclarations.createdAt));
}

export async function getAllBirthDeclarations() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(birthDeclarations)
    .orderBy(desc(birthDeclarations.createdAt));
}

export async function updateDeclarationStatus(
  id: number, 
  status: "en_cours" | "en_attente" | "valide" | "rejete",
  rejectionReason?: string
) {
  const db = await getDb();
  if (!db) return;

  const updateData: any = { status };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  await db.update(birthDeclarations)
    .set(updateData)
    .where(eq(birthDeclarations.id, id));
}

export async function markDeclarationVerifiedByMairie(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(birthDeclarations)
    .set({ verifiedByMairieAt: new Date() })
    .where(eq(birthDeclarations.id, id));
}

export async function markDeclarationVerifiedByHopital(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(birthDeclarations)
    .set({ verifiedByHopitalAt: new Date() })
    .where(eq(birthDeclarations.id, id));
}

export async function markDeclarationValidated(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(birthDeclarations)
    .set({ validatedAt: new Date(), status: "valide" })
    .where(eq(birthDeclarations.id, id));
}

// ==================== DOCUMENTS ====================

export async function createDocument(document: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(documents).values(document);
  return Number(result[0].insertId);
}

export async function getDocumentsByDeclarationId(declarationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(documents)
    .where(eq(documents.declarationId, declarationId));
}

// ==================== BIRTH CERTIFICATES ====================

export async function createBirthCertificate(certificate: InsertBirthCertificate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(birthCertificates).values(certificate);
  return Number(result[0].insertId);
}

export async function getBirthCertificateByDeclarationId(declarationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(birthCertificates)
    .where(eq(birthCertificates.declarationId, declarationId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== PAYMENTS ====================

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(payment);
  return Number(result[0].insertId);
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(
  id: number,
  status: "pending" | "completed" | "failed",
  transactionId?: string
) {
  const db = await getDb();
  if (!db) return;

  const updateData: any = { paymentStatus: status };
  if (transactionId) {
    updateData.transactionId = transactionId;
  }
  if (status === "completed") {
    updateData.paidAt = new Date();
  }

  await db.update(payments)
    .set(updateData)
    .where(eq(payments.id, id));
}

// ==================== NOTIFICATIONS ====================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(notification);
  return Number(result[0].insertId);
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id));
}
