type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';
  private shownOnceMessages = new Set<string>();

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

  info(message: string, context?: object, showOnce = false): void {
    // If this is a message that should only be shown once and has already been shown, skip it
    if (showOnce && this.shownOnceMessages.has(message)) {
      return;
    }
    
    console.info(this.formatMessage('info', message, context));
    
    // If this is a message that should only be shown once, add it to the set
    if (showOnce) {
      this.shownOnceMessages.add(message);
    }
  }

  warn(message: string, context?: object, showOnce = false): void {
    // If this is a message that should only be shown once and has already been shown, skip it
    if (showOnce && this.shownOnceMessages.has(message)) {
      return;
    }
    
    console.warn(this.formatMessage('warn', message, context));
    
    // If this is a message that should only be shown once, add it to the set
    if (showOnce) {
      this.shownOnceMessages.add(message);
    }
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