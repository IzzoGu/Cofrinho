const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 DEPLOY PARA NUVEM - Escolta Platform\n');

// Função para executar comandos
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`📦 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ Erro: ${error.message}`);
        reject(error);
      } else {
        console.log(`✅ ${description} concluído`);
        resolve(stdout);
      }
    });
  });
}

// Função para criar arquivo .env
function createEnvFile() {
  const envContent = `NODE_ENV=production
PORT=3001
CORS_ORIGIN=true
JWT_SECRET=${generateRandomSecret()}
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Arquivo .env criado');
}

// Função para gerar chave secreta aleatória
function generateRandomSecret() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

// Função para atualizar package.json
function updatePackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Atualizar scripts para produção
  packageJson.scripts = {
    ...packageJson.scripts,
    "start": "node server/production.js",
    "build": "cd client && npm install && npm run build",
    "postinstall": "npm run build"
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json atualizado para produção');
}

// Função para criar arquivo .gitignore
function createGitignore() {
  const gitignoreContent = `node_modules/
.env
.DS_Store
*.log
dist/
build/
.railway/
`;

  fs.writeFileSync('.gitignore', gitignoreContent);
  console.log('✅ .gitignore criado');
}

// Função para criar README de deploy
function createDeployReadme() {
  const readmeContent = `# 🚀 Escolta Platform - Deploy

## 🌐 URLs de Acesso

- **Local:** http://localhost:3001
- **Produção:** https://seu-app.railway.app

## 🔧 Comandos

\`\`\`bash
# Desenvolvimento
npm run dev

# Produção local
npm start

# Build
npm run build
\`\`\`

## 📱 Acesso Externo

A aplicação está configurada para funcionar de qualquer lugar do mundo!

## 🔒 Segurança

- CORS configurado para permitir acesso externo
- JWT para autenticação
- Senhas criptografadas
`;

  fs.writeFileSync('DEPLOY-README.md', readmeContent);
  console.log('✅ README de deploy criado');
}

// Função principal
async function deploy() {
  try {
    console.log('🔧 Preparando projeto para deploy...\n');
    
    // 1. Criar arquivo .env
    createEnvFile();
    
    // 2. Atualizar package.json
    updatePackageJson();
    
    // 3. Criar .gitignore
    createGitignore();
    
    // 4. Build do frontend
    await runCommand('npm run build', 'Fazendo build do frontend');
    
    // 5. Criar README de deploy
    createDeployReadme();
    
    console.log('\n🎉 PROJETO PRONTO PARA DEPLOY!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Crie conta no Railway: https://railway.app');
    console.log('2. Conecte seu repositório GitHub');
    console.log('3. Configure as variáveis de ambiente:');
    console.log('   - NODE_ENV=production');
    console.log('   - CORS_ORIGIN=true');
    console.log('   - JWT_SECRET=[sua_chave_secreta]');
    console.log('4. Deploy automático!');
    console.log('\n🌐 A aplicação estará acessível de qualquer lugar!');
    
  } catch (error) {
    console.error('❌ Erro durante o deploy:', error.message);
    process.exit(1);
  }
}

// Executar deploy
deploy();
