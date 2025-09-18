const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Escolta Platform...\n');

// Verificar se Node.js está instalado
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js ${nodeVersion.trim()} encontrado`);
} catch (error) {
  console.error('❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.');
  process.exit(1);
}

// Instalar dependências do servidor
console.log('\n📦 Instalando dependências do servidor...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependências do servidor instaladas');
} catch (error) {
  console.error('❌ Erro ao instalar dependências do servidor:', error.message);
  process.exit(1);
}

// Instalar dependências do cliente
console.log('\n📦 Instalando dependências do cliente...');
try {
  process.chdir('client');
  execSync('npm install', { stdio: 'inherit' });
  process.chdir('..');
  console.log('✅ Dependências do cliente instaladas');
} catch (error) {
  console.error('❌ Erro ao instalar dependências do cliente:', error.message);
  process.exit(1);
}

// Criar diretório de banco de dados se não existir
const dbDir = path.join(__dirname, 'server', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ Diretório de banco de dados criado');
}

console.log('\n🎉 Setup concluído com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. Execute: npm run dev');
console.log('2. Acesse: http://localhost:3000');
console.log('\n👤 Usuários padrão:');
console.log('   Admin: admin / admin123');
console.log('   Escolta: escolta / escolta123');
console.log('\n📖 Consulte o README.md para mais informações.');
