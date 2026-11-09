import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      }
    : undefined,
  base: { service: 'zuna-tungviet-server' },
});

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Ở production, ghi log MỖI request ở mức info sẽ tạo tải I/O rất lớn
    // (và chính là nguồn gây CPU cao khi bot quét site). Chỉ ghi ở mức debug,
    // hoặc bỏ qua request lỗi/không thành công khi bật LOG_REQUESTS=false.
    const level = duration > 1000 ? 'warn' : 'debug';
    logger[level]({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
    }, 'request');
  });
  next();
};