const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

// Format personnalisé pour les logs
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}] ${message} `;
  if (metadata && Object.keys(metadata).length > 0) {
    // Ne pas logger les données sensibles
    const sanitizedMetadata = { ...metadata };
    ['password', 'otp', 'token', 'passwordHash'].forEach(field => {
      if (sanitizedMetadata[field]) {
        sanitizedMetadata[field] = '***';
      }
    });
    msg += JSON.stringify(sanitizedMetadata);
  }
  return msg;
});

// Création du logger
const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ 
      filename: 'logs/audit.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Middleware pour logger les requêtes d'authentification
const auditLogger = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function (body) {
    const responseTime = Date.now() - start;
    
    // Ne logger que les routes d'authentification
    if (req.path.startsWith('/api/auth/')) {
      const logData = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      };
      
      if (res.statusCode >= 400) {
        logger.error('Échec de l\'authentification', logData);
      } else {
        logger.info('Requête d\'authentification traitée', logData);
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

module.exports = { logger, auditLogger };
