const https = require('https');
const http = require('http');

console.log('🔍 DIAGNÓSTICO DE CONECTIVIDADE - Escolta Platform\n');

// Função para testar HTTPS
function testHTTPS() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9443,
      path: '/api/auth/verify',
      method: 'GET',
      rejectUnauthorized: false // Ignora certificados auto-assinados
    };

    const req = https.request(options, (res) => {
      console.log('✅ HTTPS (9443): Servidor respondendo');
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log('❌ HTTPS (9443): Erro de conexão');
      console.log(`   Erro: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('⏰ HTTPS (9443): Timeout');
      resolve(false);
    });

    req.end();
  });
}

// Função para testar HTTP
function testHTTP() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/verify',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log('✅ HTTP (8080): Servidor respondendo');
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log('❌ HTTP (8080): Erro de conexão');
      console.log(`   Erro: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('⏰ HTTP (8080): Timeout');
      resolve(false);
    });

    req.end();
  });
}

// Função para testar IP local
function testLocalIP() {
  return new Promise((resolve) => {
    const options = {
      hostname: '192.168.0.35',
      port: 8080,
      path: '/api/auth/verify',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log('✅ IP Local (192.168.0.35:8080): Servidor respondendo');
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log('❌ IP Local (192.168.0.35:8080): Erro de conexão');
      console.log(`   Erro: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('⏰ IP Local (192.168.0.35:8080): Timeout');
      resolve(false);
    });

    req.end();
  });
}

// Executar todos os testes
async function runDiagnostics() {
  console.log('Testando conectividade...\n');
  
  const httpsResult = await testHTTPS();
  const httpResult = await testHTTP();
  const ipResult = await testLocalIP();
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log(`HTTPS (localhost:9443): ${httpsResult ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`HTTP (localhost:8080): ${httpResult ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`HTTP (192.168.0.35:8080): ${ipResult ? '✅ OK' : '❌ FALHOU'}`);
  
  console.log('\n🌐 URLs PARA TESTAR:');
  console.log('Local: https://localhost:9443');
  console.log('Local: http://localhost:8080');
  console.log('Rede: http://192.168.0.35:8080');
  console.log('Rede: https://192.168.0.35:9443');
  
  if (!httpsResult && !httpResult && !ipResult) {
    console.log('\n⚠️  PROBLEMA DETECTADO:');
    console.log('O servidor pode não estar rodando ou há problema de firewall.');
    console.log('Execute: npm start');
  }
}

runDiagnostics();
