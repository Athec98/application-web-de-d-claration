import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

// Helper pour générer un code OTP à 6 chiffres
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper pour générer un numéro de certificat unique
function generateCertificateNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `SN-${timestamp}-${random}`;
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // Inscription d'un parent
    register: publicProcedure
      .input(z.object({
        name: z.string(),
        phoneNumber: z.string(),
        email: z.string().email().optional(),
        address: z.string(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = input.email 
          ? await db.getUserByEmail(input.email)
          : await db.getUserByPhone(input.phoneNumber);

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un utilisateur avec cet email ou numéro existe déjà",
          });
        }

        // Générer un code OTP
        const otpCode = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // TODO: Envoyer l'OTP par email ou SMS
        console.log(`OTP pour ${input.phoneNumber}: ${otpCode}`);

        return {
          success: true,
          message: "Un code OTP a été envoyé. Veuillez vérifier votre email/téléphone.",
          otpCode, // À retirer en production
        };
      }),

    // Vérification OTP
    verifyOTP: publicProcedure
      .input(z.object({
        identifier: z.string(), // Email ou téléphone
        otpCode: z.string(),
      }))
      .mutation(async ({ input }) => {
        // TODO: Implémenter la logique de vérification OTP
        return {
          success: true,
          message: "Compte vérifié avec succès",
        };
      }),
  }),

  // Routes pour les déclarations de naissance
  declarations: router({
    // Créer une nouvelle déclaration
    create: protectedProcedure
      .input(z.object({
        childFirstName: z.string(),
        childLastName: z.string(),
        childGender: z.enum(["masculin", "feminin"]),
        birthDate: z.date(),
        birthPlace: z.string(),
        fatherFirstName: z.string(),
        fatherLastName: z.string(),
        fatherIdNumber: z.string(),
        motherFirstName: z.string(),
        motherLastName: z.string(),
        motherIdNumber: z.string(),
        residenceAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const declarationId = await db.createBirthDeclaration({
          userId: ctx.user.id,
          ...input,
          status: "en_cours",
        });

        // Créer une notification
        await db.createNotification({
          userId: ctx.user.id,
          declarationId,
          title: "Déclaration créée",
          message: "Votre déclaration de naissance a été créée avec succès.",
          type: "success",
        });

        return { declarationId };
      }),

    // Obtenir toutes les déclarations d'un parent
    getMyDeclarations: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "parent") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès réservé aux parents",
        });
      }
      return await db.getBirthDeclarationsByUserId(ctx.user.id);
    }),

    // Obtenir toutes les déclarations (pour Mairie)
    getAllDeclarations: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "mairie" && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès réservé à la mairie",
        });
      }
      return await db.getAllBirthDeclarations();
    }),

    // Obtenir une déclaration par ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const declaration = await db.getBirthDeclarationById(input.id);
        if (!declaration) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Déclaration non trouvée",
          });
        }
        return declaration;
      }),

    // Envoyer pour vérification à l'hôpital (Mairie)
    sendToHospitalVerification: protectedProcedure
      .input(z.object({ declarationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "mairie" && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Accès réservé à la mairie",
          });
        }

        await db.markDeclarationVerifiedByMairie(input.declarationId);
        
        const declaration = await db.getBirthDeclarationById(input.declarationId);
        if (declaration) {
          await db.createNotification({
            userId: declaration.userId,
            declarationId: input.declarationId,
            title: "Vérification en cours",
            message: "Votre dossier a été envoyé à l'hôpital pour vérification.",
            type: "info",
          });
        }

        return { success: true };
      }),

    // Rejeter une déclaration (Mairie)
    reject: protectedProcedure
      .input(z.object({
        declarationId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "mairie" && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Accès réservé à la mairie",
          });
        }

        await db.updateDeclarationStatus(input.declarationId, "rejete", input.reason);
        
        const declaration = await db.getBirthDeclarationById(input.declarationId);
        if (declaration) {
          await db.createNotification({
            userId: declaration.userId,
            declarationId: input.declarationId,
            title: "Déclaration rejetée",
            message: `Votre déclaration a été rejetée. Motif: ${input.reason}`,
            type: "error",
          });
        }

        return { success: true };
      }),

    // Valider le certificat d'accouchement (Hôpital)
    validateCertificate: protectedProcedure
      .input(z.object({
        declarationId: z.number(),
        isValid: z.boolean(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "hopital" && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Accès réservé à l'hôpital",
          });
        }

        await db.markDeclarationVerifiedByHopital(input.declarationId);

        if (input.isValid) {
          await db.updateDeclarationStatus(input.declarationId, "en_attente");
          
          const declaration = await db.getBirthDeclarationById(input.declarationId);
          if (declaration) {
            await db.createNotification({
              userId: declaration.userId,
              declarationId: input.declarationId,
              title: "Certificat validé",
              message: "Votre certificat d'accouchement a été validé par l'hôpital.",
              type: "success",
            });
          }
        } else {
          await db.updateDeclarationStatus(
            input.declarationId,
            "rejete",
            input.reason || "Certificat d'accouchement non conforme"
          );
          
          const declaration = await db.getBirthDeclarationById(input.declarationId);
          if (declaration) {
            await db.createNotification({
              userId: declaration.userId,
              declarationId: input.declarationId,
              title: "Certificat non conforme",
              message: `Le certificat d'accouchement n'est pas conforme. ${input.reason || ""}`,
              type: "error",
            });
          }
        }

        return { success: true };
      }),

    // Fabriquer l'acte de naissance (Mairie)
    generateCertificate: protectedProcedure
      .input(z.object({ declarationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "mairie" && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Accès réservé à la mairie",
          });
        }

        const declaration = await db.getBirthDeclarationById(input.declarationId);
        if (!declaration) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Déclaration non trouvée",
          });
        }

        if (declaration.status !== "en_attente") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "La déclaration doit être en attente pour générer l'acte",
          });
        }

        // Générer le certificat (simplifié pour l'instant)
        const certificateNumber = generateCertificateNumber();
        const certificateContent = `ACTE DE NAISSANCE\n\nNuméro: ${certificateNumber}\n\nNom: ${declaration.childLastName}\nPrénom: ${declaration.childFirstName}\nSexe: ${declaration.childGender}\nNé(e) le: ${declaration.birthDate}\nÀ: ${declaration.birthPlace}`;

        // Sauvegarder dans S3
        const fileKey = `certificates/${certificateNumber}.txt`;
        const { url } = await storagePut(fileKey, certificateContent, "text/plain");

        // Créer l'enregistrement du certificat
        await db.createBirthCertificate({
          declarationId: input.declarationId,
          certificateNumber,
          fileUrl: url,
          fileKey,
          generatedBy: ctx.user.id,
        });

        // Marquer la déclaration comme validée
        await db.markDeclarationValidated(input.declarationId);

        // Notifier le parent
        await db.createNotification({
          userId: declaration.userId,
          declarationId: input.declarationId,
          title: "Acte de naissance prêt",
          message: "Votre acte de naissance a été généré. Vous pouvez le télécharger moyennant 250 F.",
          type: "success",
        });

        return { success: true, certificateNumber };
      }),
  }),

  // Routes pour les documents
  documents: router({
    // Uploader un document
    upload: protectedProcedure
      .input(z.object({
        declarationId: z.number(),
        documentType: z.enum(["certificat_accouchement", "id_pere", "id_mere", "autre"]),
        fileName: z.string(),
        fileData: z.string(), // Base64
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Convertir base64 en buffer
        const buffer = Buffer.from(input.fileData, "base64");
        
        // Générer une clé unique
        const fileKey = `documents/${input.declarationId}/${Date.now()}-${input.fileName}`;
        
        // Uploader vers S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Créer l'enregistrement du document
        const documentId = await db.createDocument({
          declarationId: input.declarationId,
          documentType: input.documentType,
          fileName: input.fileName,
          fileUrl: url,
          fileKey,
          mimeType: input.mimeType,
        });

        return { documentId, url };
      }),

    // Obtenir les documents d'une déclaration
    getByDeclaration: protectedProcedure
      .input(z.object({ declarationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDocumentsByDeclarationId(input.declarationId);
      }),
  }),

  // Routes pour les notifications
  notifications: router({
    // Obtenir les notifications de l'utilisateur
    getMyNotifications: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUserId(ctx.user.id);
    }),

    // Marquer comme lue
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
  }),

  // Routes pour les paiements
  payments: router({
    // Créer un paiement
    create: protectedProcedure
      .input(z.object({
        certificateId: z.number(),
        paymentMethod: z.enum(["wave", "orange_money"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const paymentId = await db.createPayment({
          userId: ctx.user.id,
          certificateId: input.certificateId,
          amount: 250, // 250 F CFA
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
        });

        // TODO: Intégrer avec Wave ou Orange Money API

        return { paymentId };
      }),

    // Vérifier le statut d'un paiement
    getStatus: protectedProcedure
      .input(z.object({ paymentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPaymentById(input.paymentId);
      }),
  }),

  // Routes pour les certificats
  certificates: router({
    // Obtenir le certificat d'une déclaration
    getByDeclaration: protectedProcedure
      .input(z.object({ declarationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBirthCertificateByDeclarationId(input.declarationId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
