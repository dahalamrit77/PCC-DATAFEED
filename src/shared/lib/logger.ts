/**
 * Logger utility
 * Centralized logging with levels and structured output
 * Ready for integration with error tracking services (Sentry, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    if (this.isDevelopment) {
      // In development, use console with appropriate method
      switch (level) {
        case 'debug':
          console.debug('[Logger]', logEntry);
          break;
        case 'info':
          console.info('[Logger]', logEntry);
          break;
        case 'warn':
          console.warn('[Logger]', logEntry);
          break;
        case 'error':
          console.error('[Logger]', logEntry);
          break;
      }
    } else {
      // In production, send to error tracking service
      // TODO: Integrate with Sentry or similar service
      if (level === 'error') {
        // Example: Sentry.captureException(new Error(message), { extra: context });
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.log('error', `${message}: ${errorMessage}`, {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });
  }
}

export const logger = new Logger();
