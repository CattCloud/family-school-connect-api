'use strict';

const { createLogger, format, transports } = require('winston');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

const logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const base = {
        ts: timestamp,
        level,
        message,
        ...meta,
      };
      if (stack) base.stack = stack;
      return JSON.stringify(base);
    })
  ),
  transports: [
    new transports.Console({
      format:
        NODE_ENV === 'development'
          ? format.combine(format.colorize(), format.simple())
          : format.json(),
    }),
  ],
  defaultMeta: { service: 'family-school-connect-api' },
});

module.exports = logger;