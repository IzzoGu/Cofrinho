const { exec, spawn } = require('child_process');
const os = require('os');

console.log('📱 INICIANDO SERVIDOR PARA MOBILE\n');

// Função para obter IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '192.168.0.35'; // Fallback
}

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

// Função para liberar portas
async function freePorts() {
  console.log('🔧 Verificando portas...');
  
  const port3000 = await checkPort(3000);
  const port8080 = await checkPort(8080);
  const port9443 = await checkPort(9443);
  
  if (port3000 || port8080 || port9443) {
    console.log('🛑 Parando processos Node.js...');
    
    return new Promise((resolve) => {
      exec('taskkill /F /IM node.exe', (error, stdout) => {
        if (error) {
          console.log('⚠️  Alguns processos não puderam ser finalizados');
        }
        console.log('✅ Processos finalizados');
        
        setTimeout(async () => {
          const port3000After = await checkPort(3000);
          if (!port3000After) {
            console.log('✅ Porta 3000 liberada');
            resolve();
          } else {
            console.log('⚠️  Porta 3000 ainda em uso');
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

// Função para iniciar servidor mobile
function startMobileServer() {
  const ip = getLocalIP();
  
  console.log('🚀 Iniciando servidor mobile...');
  console.log(`📱 IP detectado: ${ip}`);
  
  const server = spawn('node', ['servidor-mobile.js'], { 
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
    console.log('\n🛑 Encerrando servidor mobile...');
    server.kill();
    process.exit(0);
  });
  
  // Mostrar informações após iniciar
  setTimeout(() => {
    console.log('\n📱 INFORMAÇÕES PARA MOBILE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 URL para acessar: http://${ip}:3000`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 INSTRUÇÕES:');
    console.log('1. Conecte o mobile na mesma rede WiFi');
    console.log('2. Abra o navegador no mobile');
    console.log(`3. Digite: http://${ip}:3000`);
    console.log('4. A aplicação abrirá normalmente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, 3000);
}

// Função principal
async function main() {
  try {
    await freePorts();
    startMobileServer();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
