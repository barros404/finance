const { exec } = require('child_process');

console.log('Iniciando migrações...');

const migrate = exec('npx sequelize-cli db:migrate', { env: { ...process.env, DEBUG: 'sequelize:*' } });

migrate.stdout.on('data', (data) => {
  console.log(data);
});

migrate.stderr.on('data', (data) => {
  console.error(`Erro: ${data}`);
});

migrate.on('close', (code) => {
  console.log(`Processo finalizado com código ${code}`);
});
