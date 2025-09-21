const winston = require('winston');
const { combine, timestamp, printf, colorize, json } = winston.format;
const path = require('path');

// Define log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}] ${message}`;
  
  // Add metadata if it exists and is not an empty object
  if (metadata && Object.keys(metadata).length > 0) {
    // If there's an error, include its stack trace
    if (metadata.error && metadata.error.stack) {
      msg += `\n${metadata.error.stack}`;
      delete metadata.error; // Remove error to avoid duplication
    }
    
    // Stringify the remaining metadata for clean output
    const metadataStr = JSON.stringify(metadata, null, 2);
    if (metadataStr !== '{}') {
      msg += `\n${metadataStr}`;
    }
  }
  
  return msg;
});

// Create a logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? json() : combine(colorize(), logFormat)
  ),
  defaultMeta: { service: 'agroia-api' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error' 
    }),
    // Write all logs to `combined.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log') 
    })
  ]
});

// If we're not in production, log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function (message, encoding) {
    // Use the 'info' log level so the output will be picked up by both transports
    logger.info(message.trim());
  },
};

module.exports = logger;
