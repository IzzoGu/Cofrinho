const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./server/routes/auth');
const qrRoutes = require('./server/routes/qr');
const logRoutes = require('./server/routes/logs');
const userRoutes = require('./server/routes/users');
const qrGeneratorRoutes = require('./server/routes/qr-generator');
const { initDatabase } = require('./server/database/init');

const app = express();
const PORT = 3000; // Porta padrão para mobile

// Configurações de CORS otimizadas para mobile
const corsOptions = {
  origin: true, // Permite qualquer origem
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos do React
app.use(express.static(path.join(__dirname, 'client/build')));

// Routes da API
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qr-generator', qrGeneratorRoutes);

// Rota para servir o React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Inicializar banco de dados e iniciar servidor
initDatabase().then(() => {
  const server = http.createServer(app);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log('📱 SERVIDOR MOBILE INICIADO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 URL Local: http://localhost:${PORT}`);
    console.log(`📱 URL Mobile: http://192.168.0.35:${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 PARA ACESSAR NO MOBILE:');
    console.log('1. Conecte o mobile na mesma rede WiFi');
    console.log('2. Acesse: http://192.168.0.35:3000');
    console.log('3. Funciona em qualquer navegador mobile');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 Configurações:');
    console.log('• CORS habilitado para mobile');
    console.log('• Sem SSL (evita problemas de certificado)');
    console.log('• Otimizado para dispositivos móveis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Porta ${PORT} já está em uso`);
      console.log('💡 Execute: taskkill /F /IM node.exe');
    } else {
      console.error('❌ Erro no servidor:', err);
    }
  });
  
}).catch(err => {
  console.error('❌ Erro ao inicializar banco de dados:', err);
  process.exit(1);
});
