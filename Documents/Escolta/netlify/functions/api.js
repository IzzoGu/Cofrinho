const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const path = require('path');

// Importar rotas
const authRoutes = require('../server/routes/auth');
const qrRoutes = require('../server/routes/qr');
const logRoutes = require('../server/routes/logs');
const userRoutes = require('../server/routes/users');
const qrGeneratorRoutes = require('../server/routes/qr-generator');
const { initDatabase } = require('../server/database/postgres');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qr-generator', qrGeneratorRoutes);

// Inicializar banco de dados
initDatabase().catch(console.error);

module.exports.handler = serverless(app);
