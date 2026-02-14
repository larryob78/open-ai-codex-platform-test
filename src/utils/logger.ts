type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  switch (level) {
    case 'debug':
      console.debug(`[${entry.timestamp}] DEBUG: ${message}`, context ?? '');
      break;
    case 'info':
      console.info(`[${entry.timestamp}] INFO: ${message}`, context ?? '');
      break;
    case 'warn':
      console.warn(`[${entry.timestamp}] WARN: ${message}`, context ?? '');
      break;
    case 'error':
      console.error(`[${entry.timestamp}] ERROR: ${message}`, context ?? '');
      break;
  }
}

export const logger = {
  debug(msg: string, ctx?: Record<string, unknown>): void {
    log('debug', msg, ctx);
  },
  info(msg: string, ctx?: Record<string, unknown>): void {
    log('info', msg, ctx);
  },
  warn(msg: string, ctx?: Record<string, unknown>): void {
    log('warn', msg, ctx);
  },
  error(msg: string, ctx?: Record<string, unknown>): void {
    log('error', msg, ctx);
  },
};
