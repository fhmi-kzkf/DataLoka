export type LogLevel = "INFO" | "WARN" | "ERROR" | "AUDIT";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class Logger {
  private serviceName: string;
  private static defaultInstance = new Logger("DataLoka-Backend");

  constructor(serviceName: string = "DataLoka-Backend") {
    this.serviceName = serviceName;
  }

  private formatEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error | unknown
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      context,
    };

    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      };
    } else if (error) {
      entry.error = {
        name: "UnknownError",
        message: String(error),
      };
    }

    return entry;
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.formatEntry("INFO", message, context);
    console.log(JSON.stringify(entry));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.formatEntry("WARN", message, context);
    console.warn(JSON.stringify(entry));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const entry = this.formatEntry("ERROR", message, context, error);
    console.error(JSON.stringify(entry));
  }

  audit(action: string, actor: string, details: Record<string, unknown>): void {
    const entry = this.formatEntry("AUDIT", `Audit Action: ${action}`, {
      actor,
      action,
      ...details,
    });
    console.log(JSON.stringify(entry));
  }

  // Static convenience methods
  static info(message: string, context?: Record<string, unknown>): void {
    this.defaultInstance.info(message, context);
  }

  static warn(message: string, context?: Record<string, unknown>): void {
    this.defaultInstance.warn(message, context);
  }

  static error(message: string, contextOrError?: Error | unknown, context?: Record<string, unknown>): void {
    if (contextOrError instanceof Error) {
      this.defaultInstance.error(message, contextOrError, context);
    } else if (typeof contextOrError === "object" && contextOrError !== null) {
      this.defaultInstance.error(message, undefined, contextOrError as Record<string, unknown>);
    } else {
      this.defaultInstance.error(message, contextOrError, context);
    }
  }

  static audit(action: string, actor: string, details: Record<string, unknown>): void {
    this.defaultInstance.audit(action, actor, details);
  }
}

export const logger = new Logger();
