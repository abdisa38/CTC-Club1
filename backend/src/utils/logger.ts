type LogLevel = 'info' | 'warn' | 'error';

const emit = (level: LogLevel, message: string, meta?: unknown) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${level.toUpperCase()} ${message}`;

  if (meta === undefined) {
    if (level === 'error') {
      console.error(line);
      return;
    }

    if (level === 'warn') {
      console.warn(line);
      return;
    }

    console.info(line);
    return;
  }

  if (level === 'error') {
    console.error(line, meta);
    return;
  }

  if (level === 'warn') {
    console.warn(line, meta);
    return;
  }

  console.info(line, meta);
};

export const logger = {
  info: (message: string, meta?: unknown) => emit('info', message, meta),
  warn: (message: string, meta?: unknown) => emit('warn', message, meta),
  error: (message: string, meta?: unknown) => emit('error', message, meta),
};
