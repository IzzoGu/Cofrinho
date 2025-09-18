const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const qrRoutes = require('./routes/qr');
const logRoutes = require('./routes/logs');
const userRoutes = require('./routes/users');
const qrGeneratorRoutes = require('./routes/qr-generator');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
const corsOptions = {
  origin: ['https://escoltazelina.netlify.app', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qr-generator', qrGeneratorRoutes);

// Serve React app (apenas em produção)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  // Em desenvolvimento, retornar mensagem para acessar o frontend
  app.get('*', (req, res) => {
    res.json({ 
      message: 'Backend rodando. Acesse o frontend em http://localhost:3000',
      api: 'http://localhost:5000/api'
    });
  });
}

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log(`Acesse externamente: http://192.168.0.35:${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao inicializar banco de dados:', err);
});
