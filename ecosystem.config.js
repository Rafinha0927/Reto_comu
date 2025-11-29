module.exports = {
  apps: [
    {
      name: 'reto-comu-dashboard',
      script: 'npm',
      args: 'run preview',
      cwd: '/home/ec2-user/apps/Reto_comu',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      error_file: '/home/ec2-user/apps/Reto_comu/logs/error.log',
      out_file: '/home/ec2-user/apps/Reto_comu/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      }
    }
  ]
};
