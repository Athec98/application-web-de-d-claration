import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Table des utilisateurs avec rôles multiples (Parent, Mairie, Hôpital)
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  address: text("address"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["parent", "mairie", "hopital", "admin"]).default("parent").notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  otpCode: varchar("otpCode", { length: 6 }),
  otpExpiry: timestamp("otpExpiry"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Table des déclarations de naissance
 */
export const birthDeclarations = mysqlTable("birthDeclarations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // ID du parent qui fait la déclaration
  
  // Informations de l'enfant
  childFirstName: varchar("childFirstName", { length: 255 }).notNull(),
  childLastName: varchar("childLastName", { length: 255 }).notNull(),
  childGender: mysqlEnum("childGender", ["masculin", "feminin"]).notNull(),
  birthDate: timestamp("birthDate").notNull(),
  birthPlace: varchar("birthPlace", { length: 255 }).notNull(), // Nom de l'hôpital
  
  // Informations du père
  fatherFirstName: varchar("fatherFirstName", { length: 255 }).notNull(),
  fatherLastName: varchar("fatherLastName", { length: 255 }).notNull(),
  fatherIdNumber: varchar("fatherIdNumber", { length: 50 }).notNull(),
  
  // Informations de la mère
  motherFirstName: varchar("motherFirstName", { length: 255 }).notNull(),
  motherLastName: varchar("motherLastName", { length: 255 }).notNull(),
  motherIdNumber: varchar("motherIdNumber", { length: 50 }).notNull(),
  
  // Adresse
  residenceAddress: text("residenceAddress").notNull(),
  
  // Statut de la déclaration
  status: mysqlEnum("status", ["en_cours", "en_attente", "valide", "rejete"]).default("en_cours").notNull(),
  rejectionReason: text("rejectionReason"),
  
  // Métadonnées
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  verifiedByMairieAt: timestamp("verifiedByMairieAt"),
  verifiedByHopitalAt: timestamp("verifiedByHopitalAt"),
  validatedAt: timestamp("validatedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BirthDeclaration = typeof birthDeclarations.$inferSelect;
export type InsertBirthDeclaration = typeof birthDeclarations.$inferInsert;

/**
 * Table des documents justificatifs
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  declarationId: int("declarationId").notNull(),
  documentType: mysqlEnum("documentType", [
    "certificat_accouchement",
    "id_pere",
    "id_mere",
    "autre"
  ]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Table des actes de naissance générés
 */
export const birthCertificates = mysqlTable("birthCertificates", {
  id: int("id").autoincrement().primaryKey(),
  declarationId: int("declarationId").notNull().unique(),
  certificateNumber: varchar("certificateNumber", { length: 50 }).notNull().unique(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  generatedBy: int("generatedBy").notNull(), // ID de l'agent de mairie
});

export type BirthCertificate = typeof birthCertificates.$inferSelect;
export type InsertBirthCertificate = typeof birthCertificates.$inferInsert;

/**
 * Table des paiements
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  certificateId: int("certificateId").notNull(),
  amount: int("amount").notNull(), // Montant en francs CFA (250)
  paymentMethod: mysqlEnum("paymentMethod", ["wave", "orange_money"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Table des notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  declarationId: int("declarationId"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "error"]).default("info").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
