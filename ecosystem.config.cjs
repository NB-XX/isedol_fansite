module.exports = {
  apps: [{
    name: 'isedol-fansite',
    script: 'start-all.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // 优雅退出
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
