const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 CRIANDO TÚNEL PARA ACESSO EXTERNO\n');

// Verificar se ngrok está instalado
function checkNgrok() {
  return new Promise((resolve) => {
    const ngrok = spawn('ngrok', ['version'], { shell: true });
    
    ngrok.on('close', (code) => {
      if (code === 0) {
        console.log('✅ ngrok encontrado');
        resolve(true);
      } else {
        console.log('❌ ngrok não encontrado');
        console.log('📥 Instalando ngrok...');
        resolve(false);
      }
    });
    
    ngrok.on('error', () => {
      console.log('❌ ngrok não encontrado');
      resolve(false);
    });
  });
}

// Instalar ngrok via chocolatey
function installNgrok() {
  return new Promise((resolve) => {
    console.log('📦 Instalando ngrok via Chocolatey...');
    const choco = spawn('choco', ['install', 'ngrok', '-y'], { shell: true });
    
    choco.on('close', (code) => {
      if (code === 0) {
        console.log('✅ ngrok instalado com sucesso');
        resolve(true);
      } else {
        console.log('❌ Erro ao instalar ngrok');
        console.log('💡 Instale manualmente: https://ngrok.com/download');
        resolve(false);
      }
    });
  });
}

// Criar túnel
function createTunnel() {
  console.log('🌐 Criando túnel ngrok...');
  console.log('📡 Aguarde, isso pode levar alguns segundos...\n');
  
  const ngrok = spawn('ngrok', ['http', '8080', '--log=stdout'], { shell: true });
  
  ngrok.stdout.on('data', (data) => {
    const output = data.toString();
    
    // Procurar por URL do túnel
    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok\.io/);
    if (urlMatch) {
      const tunnelUrl = urlMatch[0];
      console.log('🎉 TÚNEL CRIADO COM SUCESSO!');
      console.log(`🌐 URL Externa: ${tunnelUrl}`);
      console.log(`📱 Acesse de qualquer lugar: ${tunnelUrl}`);
      console.log('\n⚠️  IMPORTANTE:');
      console.log('• Mantenha este terminal aberto');
      console.log('• O túnel expira em 2 horas (versão gratuita)');
      console.log('• Para parar: Ctrl+C');
    }
    
    // Mostrar logs do ngrok
    if (output.includes('started tunnel') || output.includes('session status')) {
      console.log('📊 Status do túnel:', output.trim());
    }
  });
  
  ngrok.stderr.on('data', (data) => {
    console.error('❌ Erro ngrok:', data.toString());
  });
  
  ngrok.on('close', (code) => {
    console.log(`\n🔚 Túnel encerrado (código: ${code})`);
  });
  
  // Capturar Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando túnel...');
    ngrok.kill();
    process.exit(0);
  });
}

// Função principal
async function main() {
  console.log('🔍 Verificando ngrok...');
  
  const hasNgrok = await checkNgrok();
  
  if (!hasNgrok) {
    const installed = await installNgrok();
    if (!installed) {
      console.log('\n❌ Não foi possível instalar ngrok automaticamente');
      console.log('📥 Instale manualmente: https://ngrok.com/download');
      console.log('🔄 Depois execute: ngrok http 8080');
      return;
    }
  }
  
  createTunnel();
}

main().catch(console.error);
