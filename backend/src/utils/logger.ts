export type LogLevel = "INFO" | "WARN" | "ERROR";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

function writeLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === "test" && level !== "ERROR") {
    return;
  }
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  };
  const serialized = JSON.stringify(entry);
  if (level === "ERROR") {
    console.error(serialized);
  } else {
    console.log(serialized);
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>): void =>
    writeLog("INFO", message, context),
  warn: (message: string, context?: Record<string, unknown>): void =>
    writeLog("WARN", message, context),
  error: (message: string, context?: Record<string, unknown>): void =>
    writeLog("ERROR", message, context),
};
