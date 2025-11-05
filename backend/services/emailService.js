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
exports.sendPasswordResetEmail = async (email, message) => {
  try {
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
          <p>${message}</p>
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

    console.log(`✅ Email de notification envoyé avec succès à ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de notification :`, error);
    throw new Error(`Impossible d'envoyer l'email de notification`);
  }
};
