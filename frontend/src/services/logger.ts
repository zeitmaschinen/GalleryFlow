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

  private logWithShowOnce(level: LogLevel, message: string, context?: object, showOnce = false): void {
    if (showOnce && this.shownOnceMessages.has(message)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);
    switch (level) {
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
    }

    if (showOnce) {
      this.shownOnceMessages.add(message);
    }
  }

  info(message: string, context?: object, showOnce = false): void {
    this.logWithShowOnce('info', message, context, showOnce);
  }

  warn(message: string, context?: object, showOnce = false): void {
    this.logWithShowOnce('warn', message, context, showOnce);
  }

  error(message: string, error?: Error, context?: object): void {
    const errorContext = error ? {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n') // Only include first 5 lines of stack
    } : undefined;

    console.error(
      this.formatMessage('error', message, {
        ...context,
        error: errorContext
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