type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';

  private formatMessage(level: LogLevel, message: string, context?: object): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  debug(message: string, context?: object): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: object): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: object): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error, context?: object): void {
    console.error(
      this.formatMessage('error', message, {
        ...context,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : undefined
      })
    );
  }

  group(label: string): void {
    console.group(label);
  }

  groupEnd(): void {
    console.groupEnd();
  }

  trace(message: string): void {
    if (this.isDevelopment) {
      console.trace(message);
    }
  }
}

export const logger = new Logger();