const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000; // Porta diferente para evitar conflitos

// Configurações de CORS mais permissivas
app.use(cors({
  origin: true, // Permite qualquer origem
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Servir arquivos estáticos do React
app.use(express.static(path.join(__dirname, 'client/build')));

// Proxy para a API principal
app.use('/api', (req, res) => {
  const http = require('http');
  
  const options = {
    hostname: '192.168.0.35',
    port: 8080,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  req.pipe(proxy);
});

// Rota para servir o React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Iniciar servidor
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log('🌐 SERVIDOR EXTERNO INICIADO!');
  console.log(`🔗 URL Local: http://localhost:${PORT}`);
  console.log(`🔗 URL Rede: http://192.168.0.35:${PORT}`);
  console.log(`🔗 URL Externa: http://[SEU_IP_PUBLICO]:${PORT}`);
  console.log('');
  console.log('📱 PARA ACESSAR DE OUTRAS REDES:');
  console.log('1. Configure port forwarding no roteador');
  console.log('2. Ou use um serviço de túnel (ngrok, etc.)');
  console.log('3. Ou acesse via IP público do roteador');
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('• Mantenha o servidor principal rodando na porta 8080');
  console.log('• Este servidor faz proxy para a API principal');
  console.log('• Para parar: Ctrl+C');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Porta ${PORT} já está em uso`);
    console.log('💡 Tente parar outros servidores ou use uma porta diferente');
  } else {
    console.error('❌ Erro no servidor:', err);
  }
});
