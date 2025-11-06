const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Fonction pour lire le template
const readTemplate = (templatePath, data) => {
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Remplacer les variables du template
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, data[key]);
  });
  
  return template;
};

// Fonction d'envoi d'email de vérification
exports.sendVerificationEmail = async (email, otp, userId) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${otp}&userId=${userId}`;
    const templatePath = path.join(__dirname, '../views/verification.handlebars');
    
    // Lire et remplir le template
    const emailHtml = readTemplate(templatePath, {
      otp,
      verificationLink,
      year: new Date().getFullYear()
    });

    // Envoyer l'email
    await transporter.sendMail({
      from: `"CIVILE-APP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Activation de votre compte CIVILE-APP',
      html: emailHtml
    });

    console.log(`✅ Email OTP envoyé avec succès à ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email OTP :`, error);
    throw new Error(`Impossible d'envoyer l'email de vérification`);
  }
};

// Fonction d'envoi d'email de réinitialisation de mot de passe
exports.sendPasswordResetEmail = async (email, resetToken, resetUrl, notificationMessage = null) => {
  try {
    // Si c'est une notification simple (pas de réinitialisation)
    if (notificationMessage && !resetUrl) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Notification CIVILE-APP</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Notification CIVILE-APP</h2>
            <p>${notificationMessage}</p>
            <p style="margin-top: 30px; font-size: 12px; color: #7f8c8d;">
              Si vous n'avez pas effectué cette action, veuillez contacter le support immédiatement.
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
              © ${new Date().getFullYear()} CIVILE-APP - Tous droits réservés
            </p>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"CIVILE-APP" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Notification de changement de mot de passe - CIVILE-APP',
        html: emailHtml
      });
    } else {
      // Email de réinitialisation avec lien
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Réinitialisation de mot de passe - CIVILE-APP</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #00853F; margin: 0;">CIVILE-APP</h1>
              <p style="color: #666; margin: 5px 0;">CIVILE-APP</p>
            </div>
            
            <h2 style="color: #2c3e50; margin-top: 0;">Réinitialisation de votre mot de passe</h2>
            
            <p>Bonjour,</p>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #00853F; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Ou copiez-collez ce lien dans votre navigateur :<br>
              <a href="${resetUrl}" style="color: #00853F; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="color: #e74c3c; font-size: 14px; font-weight: bold;">
              ⚠️ Ce lien est valide pendant 30 minutes uniquement.
            </p>
            
            <p style="color: #666; font-size: 14px;">
              Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email. Votre mot de passe restera inchangé.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center;">
              Si vous n'avez pas effectué cette action, veuillez contacter le support immédiatement.
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #7f8c8d; text-align: center;">
              © ${new Date().getFullYear()} République du Sénégal - CIVILE-APP - Tous droits réservés
            </p>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"CIVILE-APP" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - CIVILE-APP',
        html: emailHtml
      });
    }

    console.log(`✅ Email de réinitialisation envoyé avec succès à ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de réinitialisation :`, error);
    throw new Error(`Impossible d'envoyer l'email de réinitialisation`);
  }
};
