export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LogRecord { ts: string; level: LogLevel; scope: string; msg: string; data?: unknown; }
export type LogSink = (record: LogRecord) => void;

const sinks: LogSink[] = [];
let minLevel: LogLevel = (process.env.NEXORA_LOG_LEVEL as LogLevel) ?? 'info';

export function setLogLevel(level: LogLevel): void { minLevel = level; }
export function addLogSink(sink: LogSink): () => void {
  sinks.push(sink);
  return () => { const i = sinks.indexOf(sink); if (i >= 0) sinks.splice(i, 1); };
}

export interface Logger {
  debug(msg: string, data?: unknown): void;
  info(msg: string, data?: unknown): void;
  warn(msg: string, data?: unknown): void;
  error(msg: string, data?: unknown): void;
  child(scope: string): Logger;
}

export function createLogger(scope: string): Logger {
  const emit = (level: LogLevel, msg: string, data?: unknown) => {
    if (ORDER[level] < ORDER[minLevel]) return;
    const record: LogRecord = { ts: new Date().toISOString(), level, scope, msg, data };
    for (const s of sinks) s(record);
    if (process.env.NEXORA_LOG_SILENT === '1') return;
    const line = `[${record.ts}] ${level.toUpperCase().padEnd(5)} ${scope} — ${msg}`;
    if (level === 'error') console.error(line, data ?? '');
    else if (level === 'warn') console.warn(line, data ?? '');
    else console.log(line, data ?? '');
  };
  return {
    debug: (m, d) => emit('debug', m, d),
    info: (m, d) => emit('info', m, d),
    warn: (m, d) => emit('warn', m, d),
    error: (m, d) => emit('error', m, d),
    child: (s) => createLogger(`${scope}:${s}`),
  };
}
