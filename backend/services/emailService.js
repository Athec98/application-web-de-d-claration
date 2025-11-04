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
    console.error('❌ Erreur lors de l’envoi de l’email OTP :', error);
    throw new Error('Impossible d’envoyer l’email de vérification');
  }
};
