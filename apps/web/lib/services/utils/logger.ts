/**
 * Logger utility for consistent logging across the application
 * Replaces console.log with structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private serializeContext(context?: LogContext): string {
    if (!context) {
      return '';
    }

    const seen = new WeakSet<object>();

    try {
      return ` ${JSON.stringify(context, (_key, value: unknown) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }

        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          };
        }

        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }

        return value;
      })}`;
    } catch {
      return ' {"logger":"[unserializable-context]"}';
    }
  }

  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = this.serializeContext(context);
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment()) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment()) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context));
  }

  log(message: string, context?: LogContext): void {
    // Alias for info in development
    this.info(message, context);
  }
}

export const logger = new Logger();



