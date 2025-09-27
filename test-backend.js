const http = require('http');

console.log('🔍 Testando conexão com o backend...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend está rodando! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Resposta:', data);
  });
});

req.on('error', (err) => {
  console.log('❌ Backend não está rodando:', err.message);
  console.log('💡 Soluções:');
  console.log('   1. Execute: cd api && npm run dev');
  console.log('   2. Verifique se o PostgreSQL está rodando');
  console.log('   3. Verifique se a porta 5000 está livre');
});

req.on('timeout', () => {
  console.log('⏰ Timeout - Backend não respondeu em 5 segundos');
  req.destroy();
});

req.end();
