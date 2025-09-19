const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 DEPLOY AUTOMÁTICO PARA RAILWAY\n');

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

// Função para criar arquivo railway.json
function createRailwayConfig() {
  const railwayConfig = {
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
      "builder": "NIXPACKS"
    },
    "deploy": {
      "startCommand": "npm start",
      "healthcheckPath": "/api/auth/verify",
      "healthcheckTimeout": 100,
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 10
    }
  };

  fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
  console.log('✅ railway.json criado');
}

// Função para criar arquivo .env
function createEnvFile() {
  const envContent = `NODE_ENV=production
PORT=3001
CORS_ORIGIN=true
JWT_SECRET=${generateRandomSecret()}
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env criado');
}

// Função para gerar chave secreta
function generateRandomSecret() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

// Função para criar README de deploy
function createDeployReadme() {
  const readmeContent = `# 🚀 Escolta Platform - Deploy Railway

## 🌐 URLs de Acesso

- **Local:** http://localhost:3001
- **Railway:** https://seu-app.railway.app

## 🔧 Comandos

\`\`\`bash
# Desenvolvimento
npm run dev

# Produção local
npm start

# Build
npm run build
\`\`\`

## 📱 Acesso Global

A aplicação está configurada para funcionar de qualquer lugar do mundo!

## 🔒 Variáveis de Ambiente

Configure no Railway:
- NODE_ENV=production
- CORS_ORIGIN=true
- JWT_SECRET=[sua_chave_secreta]

## 🚀 Deploy

1. Conecte repositório no Railway
2. Deploy automático!
3. Acesse de qualquer lugar

## 📞 Suporte

Se tiver problemas, verifique os logs no Railway.
`;

  fs.writeFileSync('RAILWAY-README.md', readmeContent);
  console.log('✅ README Railway criado');
}

// Função para verificar se é repositório Git
function checkGitRepo() {
  return new Promise((resolve) => {
    exec('git status', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Não é um repositório Git');
        console.log('💡 Execute: git init');
        resolve(false);
      } else {
        console.log('✅ Repositório Git encontrado');
        resolve(true);
      }
    });
  });
}

// Função para fazer commit e push
async function gitCommitAndPush() {
  try {
    await runCommand('git add .', 'Adicionando arquivos');
    await runCommand('git commit -m "Deploy para Railway - Acesso global"', 'Fazendo commit');
    await runCommand('git push origin main', 'Fazendo push');
    console.log('✅ Código enviado para GitHub');
  } catch (error) {
    console.log('⚠️  Erro no Git, mas continuando...');
  }
}

// Função principal
async function deploy() {
  try {
    console.log('🔧 Preparando projeto para Railway...\n');
    
    // 1. Verificar Git
    const isGit = await checkGitRepo();
    
    // 2. Criar arquivos de configuração
    createRailwayConfig();
    createEnvFile();
    createDeployReadme();
    
    // 3. Build do frontend
    await runCommand('npm run build', 'Fazendo build do frontend');
    
    // 4. Git commit e push
    if (isGit) {
      await gitCommitAndPush();
    }
    
    console.log('\n🎉 PROJETO PRONTO PARA RAILWAY!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Acesse: https://railway.app');
    console.log('2. Clique em "Sign Up"');
    console.log('3. Conecte com GitHub');
    console.log('4. Clique em "New Project"');
    console.log('5. Selecione "Deploy from GitHub repo"');
    console.log('6. Escolha seu repositório');
    console.log('7. Railway fará deploy automático!');
    console.log('\n🔧 CONFIGURAR VARIÁVEIS NO RAILWAY:');
    console.log('• NODE_ENV=production');
    console.log('• CORS_ORIGIN=true');
    console.log('• JWT_SECRET=[sua_chave_secreta]');
    console.log('\n🌐 RESULTADO:');
    console.log('• URL global: https://seu-app.railway.app');
    console.log('• Acesso de qualquer lugar do mundo');
    console.log('• HTTPS automático');
    console.log('• Deploy automático');
    
  } catch (error) {
    console.error('❌ Erro durante o deploy:', error.message);
    process.exit(1);
  }
}

// Executar deploy
deploy();
