const { spawn, exec } = require('child_process');

console.log('🚀 INICIANDO SERVIDOR DE DESENVOLVIMENTO\n');

// Função para verificar se a porta está em uso
function checkPort(port) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (stdout.includes('LISTENING')) {
        console.log(`⚠️  Porta ${port} está em uso`);
        resolve(true);
      } else {
        console.log(`✅ Porta ${port} está livre`);
        resolve(false);
      }
    });
  });
}

// Função para liberar as portas
async function freePorts() {
  console.log('🔧 Liberando portas...');
  
  const port9443 = await checkPort(9443);
  const port8080 = await checkPort(8080);
  
  if (port9443 || port8080) {
    console.log('🛑 Parando processos Node.js...');
    
    return new Promise((resolve) => {
      exec('taskkill /F /IM node.exe', (error, stdout) => {
        if (error) {
          console.log('⚠️  Alguns processos não puderam ser finalizados (normal)');
        }
        console.log('✅ Processos finalizados');
        
        // Aguardar um pouco para as portas serem liberadas
        setTimeout(async () => {
          const port9443After = await checkPort(9443);
          const port8080After = await checkPort(8080);
          
          if (!port9443After && !port8080After) {
            console.log('✅ Portas liberadas com sucesso');
            resolve();
          } else {
            console.log('⚠️  Ainda há processos usando as portas');
            resolve();
          }
        }, 2000);
      });
    });
  } else {
    console.log('✅ Portas já estão livres');
    resolve();
  }
}

// Função para iniciar o servidor
function startServer() {
  console.log('🚀 Iniciando servidor com nodemon...');
  console.log('📡 Aguarde, o servidor está inicializando...\n');
  
  const server = spawn('npm', ['run', 'server'], { 
    stdio: 'inherit',
    shell: true 
  });
  
  server.on('error', (err) => {
    console.error('❌ Erro ao iniciar servidor:', err);
  });
  
  server.on('close', (code) => {
    console.log(`\n🔚 Servidor encerrado (código: ${code})`);
  });
  
  // Capturar Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    server.kill();
    process.exit(0);
  });
}

// Função principal
async function main() {
  try {
    await freePorts();
    console.log('\n🌐 Iniciando servidor...');
    startServer();
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

main();
