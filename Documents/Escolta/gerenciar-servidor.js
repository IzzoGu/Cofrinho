const { spawn, exec } = require('child_process');

console.log('🔧 GERENCIADOR DE SERVIDOR - Escolta Platform\n');

// Função para verificar se o servidor está rodando
function checkServer() {
  return new Promise((resolve) => {
    exec('netstat -ano | findstr :9443', (error, stdout) => {
      if (stdout.includes('LISTENING')) {
        const lines = stdout.trim().split('\n');
        const pid = lines[0].split(/\s+/).pop();
        console.log(`✅ Servidor rodando (PID: ${pid})`);
        resolve(true);
      } else {
        console.log('❌ Servidor não está rodando');
        resolve(false);
      }
    });
  });
}

// Função para parar o servidor
function stopServer() {
  return new Promise((resolve) => {
    console.log('🛑 Parando servidor...');
    exec('taskkill /F /IM node.exe', (error, stdout) => {
      if (error) {
        console.log('⚠️  Alguns processos não puderam ser finalizados (normal)');
      }
      console.log('✅ Servidor parado');
      resolve();
    });
  });
}

// Função para iniciar o servidor
function startServer() {
  return new Promise((resolve) => {
    console.log('🚀 Iniciando servidor...');
    const server = spawn('npm', ['run', 'server'], { 
      stdio: 'inherit',
      shell: true 
    });
    
    // Aguardar um pouco para o servidor inicializar
    setTimeout(() => {
      console.log('✅ Servidor iniciado');
      resolve();
    }, 3000);
  });
}

// Função para reiniciar o servidor
async function restartServer() {
  console.log('🔄 Reiniciando servidor...');
  await stopServer();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2 segundos
  await startServer();
}

// Função para mostrar status
async function showStatus() {
  console.log('📊 STATUS DO SERVIDOR:');
  const isRunning = await checkServer();
  
  if (isRunning) {
    console.log('\n🌐 URLs DISPONÍVEIS:');
    console.log('• Local: http://localhost:8080');
    console.log('• Rede: http://192.168.0.35:8080');
    console.log('\n💡 COMANDOS:');
    console.log('• Para parar: Ctrl+C');
    console.log('• Para reiniciar: rs (no terminal do nodemon)');
  } else {
    console.log('\n💡 Para iniciar o servidor:');
    console.log('• npm run server (desenvolvimento)');
    console.log('• npm start (produção)');
  }
}

// Função principal
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      await startServer();
      break;
    case 'stop':
      await stopServer();
      break;
    case 'restart':
      await restartServer();
      break;
    case 'status':
    default:
      await showStatus();
      break;
  }
}

main().catch(console.error);
