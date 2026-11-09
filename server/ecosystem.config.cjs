/**
 * pm2 ecosystem config — be_tungviet (zuna-tungviet-server)
 *
 * Dùng để chạy ở production trên VPS (aaPanel):
 *   pm2 start ecosystem.config.js
 *   pm2 reload ecosystem.config.js --update-env
 *   pm2 logs zuna-tungviet
 *
 * ⚠️  TUYỆT ĐỐI KHÔNG dùng `npm run dev` (script `node --watch`) ở production.
 *     `node --watch` restart process mỗi khi file trong thư mục project thay đổi —
 *     kể cả file log ⇒ vòng lặp restart ⇒ CPU 100%.
 *
 * ⚠️  Log PHẢI ghi ra ngoài thư mục project, nếu không watcher sẽ kích hoạt
 *     restart mỗi lần ghi log.
 */
const path = require('path');

const LOG_DIR = process.env.PM2_LOG_DIR || '/www/wwwlogs';

module.exports = {
  apps: [
    {
      name: 'zuna-tungviet',
      script: path.join(__dirname, 'src/server.js'),
      cwd: __dirname,

      // 1 instance — app dùng chung cache in-memory và kết nối MongoDB.
      instances: 1,
      exec_mode: 'fork',

      // Chặn vòng lặp restart: tối đa 10 lần restart rồi pm2 dừng lại,
      // thay vì restart vô hạn ⇒ CPU 100%.
      max_restarts: 10,
      restart_delay: 5000,
      min_uptime: 20_000,

      // Giới hạn bộ nhớ — tránh process phình to (rò rỉ bộ nhớ) làm VPS nghẽn.
      max_memory_restart: '768M',

      // Không dùng --watch ở production.
      watch: false,

      env: {
        NODE_ENV: 'production',
        PORT: '5000',
      },

      // Log nằm NGOÀI thư mục project.
      out_file: path.join(LOG_DIR, 'zuna-tungviet.out.log'),
      error_file: path.join(LOG_DIR, 'zuna-tungviet.err.log'),
      merge_logs: false,
      time: true,

      kill_timeout: 10000,
      listen_timeout: 10000,
    },
  ],
};
