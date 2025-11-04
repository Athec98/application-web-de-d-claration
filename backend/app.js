const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database'); // fonction pour connecter MongoDB
const { auditLogger } = require('./middleware/auditLog');
const authRoutes = require('./routes/authRoutes');

// Configuration de l'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Création de l'application Express
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de journalisation des accès
app.use(auditLogger);

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
