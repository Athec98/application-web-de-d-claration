const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur pour le développement
  console.error(err);

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      statusCode: 400,
      message: message.join(', ')
    };
  }

  // Erreur de duplication Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Ce ${field} existe déjà`;
    error = {
      statusCode: 400,
      message
    };
  }

  // Erreur de cast Mongoose (ID invalide)
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée';
    error = {
      statusCode: 404,
      message
    };
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = {
      statusCode: 401,
      message
    };
  }

  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = {
      statusCode: 401,
      message
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur serveur'
  });
};

module.exports = errorHandler;

