const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const qrRoutes = require('./routes/qr');
const logRoutes = require('./routes/logs');
const userRoutes = require('./routes/users');
const qrGeneratorRoutes = require('./routes/qr-generator');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 9443;

// Configurações de CORS mais permissivas
const corsOptions = {
  origin: process.env.CORS_ORIGIN === 'false' ? false : true, // Permite qualquer origem por padrão
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qr-generator', qrGeneratorRoutes);

// Serve React app sempre
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Initialize database and start server
initDatabase().then(() => {
  try {
    // Carregar certificados SSL
    const privateKey = fs.readFileSync(path.join(__dirname, '../ssl/private-key.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, '../ssl/certificate.pem'), 'utf8');
    
    const credentials = {
      key: privateKey,
      cert: certificate
    };

    // Criar servidor HTTPS
    const httpsServer = https.createServer(credentials, app);
    
    httpsServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🔒 Servidor HTTPS rodando na porta ${PORT}`);
      console.log(`🌐 Acesse localmente: https://localhost:${PORT}`);
      console.log(`🌐 Acesse na rede local: https://192.168.0.35:${PORT}`);
      console.log(`🌐 Para acesso externo, configure port forwarding ou use um serviço de túnel`);
      console.log(`⚠️  Certificado auto-assinado - aceite o aviso de segurança no navegador`);
      console.log(`📡 CORS configurado para permitir acesso externo`);
      console.log(`\n🔧 SOLUÇÃO PARA ERR_CONNECTION_FAILED:`);
      console.log(`1. Use HTTP: http://192.168.0.35:8080`);
      console.log(`2. Ou aceite o certificado SSL no navegador`);
      console.log(`3. Ou execute: node tunnel.js para criar túnel ngrok`);
    });
    
    // Criar servidor HTTP adicional na porta 8080
    const httpServer = http.createServer(app);
    httpServer.listen(8080, '0.0.0.0', () => {
      console.log(`🌐 Servidor HTTP rodando na porta 8080`);
      console.log(`🌐 Acesse localmente: http://localhost:8080`);
      console.log(`🌐 Acesse na rede local: http://[SEU_IP_LOCAL]:8080`);
      console.log(`📡 CORS configurado para permitir acesso externo`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao carregar certificados SSL:', error.message);
    console.log('💡 Execute: node generate-ssl.js');
    
    // Fallback para HTTP se não conseguir carregar certificados
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️  Servidor HTTP rodando na porta ${PORT} (sem SSL)`);
      console.log(`🌐 Acesse localmente: http://localhost:${PORT}`);
      console.log(`🌐 Acesse na rede local: http://[SEU_IP_LOCAL]:${PORT}`);
      console.log(`📡 CORS configurado para permitir acesso externo`);
    });
  }
}).catch(err => {
  console.error('Erro ao inicializar banco de dados:', err);
});
