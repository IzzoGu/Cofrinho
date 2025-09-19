const http = require('http');

console.log('🧪 TESTE DE CONECTIVIDADE - Escolta Platform\n');

// Função para testar HTTP
function testHTTP(host, port, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: '/api/auth/verify',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${description}: Servidor respondendo`);
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   URL: http://${host}:${port}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ ${description}: Erro de conexão`);
      console.log(`   Erro: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${description}: Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Executar testes
async function runTests() {
  console.log('Testando conectividade...\n');
  
  const localHTTP = await testHTTP('localhost', 8080, 'HTTP Local (8080)');
  const localHTTPS = await testHTTP('localhost', 9443, 'HTTPS Local (9443)');
  const networkHTTP = await testHTTP('192.168.0.35', 8080, 'HTTP Rede (192.168.0.35:8080)');
  const networkHTTPS = await testHTTP('192.168.0.35', 9443, 'HTTPS Rede (192.168.0.35:9443)');
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log(`HTTP Local: ${localHTTP ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`HTTPS Local: ${localHTTPS ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`HTTP Rede: ${networkHTTP ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`HTTPS Rede: ${networkHTTPS ? '✅ OK' : '❌ FALHOU'}`);
  
  console.log('\n🌐 URLs FUNCIONAIS:');
  if (localHTTP) console.log('• http://localhost:8080');
  if (localHTTPS) console.log('• https://localhost:9443');
  if (networkHTTP) console.log('• http://192.168.0.35:8080');
  if (networkHTTPS) console.log('• https://192.168.0.35:9443');
  
  console.log('\n📱 PARA ACESSAR DE OUTRO DISPOSITIVO:');
  if (networkHTTP) {
    console.log('✅ Use: http://192.168.0.35:8080');
    console.log('   (Mais confiável, sem problemas de certificado)');
  }
  if (networkHTTPS) {
    console.log('✅ Ou: https://192.168.0.35:9443');
    console.log('   (Aceite o certificado no navegador)');
  }
  
  if (!networkHTTP && !networkHTTPS) {
    console.log('❌ Nenhuma URL de rede funcionando');
    console.log('💡 Possíveis soluções:');
    console.log('   1. Configure o firewall do Windows');
    console.log('   2. Verifique se o roteador permite comunicação entre dispositivos');
    console.log('   3. Use um túnel: npm run tunnel');
  }
}

runTests();
