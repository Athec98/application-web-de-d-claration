const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database'); // fonction pour connecter MongoDB
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB(); // connexion à MongoDB

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
