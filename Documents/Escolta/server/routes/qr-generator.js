const express = require('express');
const QRCode = require('qrcode');
const { db } = require('../database/init');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'escolta_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Gerar QR code como imagem PNG
router.post('/generate', authenticateToken, async (req, res) => {
  const { code, description, location } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Código é obrigatório' });
  }

  try {
    // Verificar se o código já existe
    const existingQR = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM qr_codes WHERE code = ?', [code], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingQR) {
      return res.status(400).json({ error: 'Código já existe' });
    }

    // Gerar QR code como buffer PNG
    const qrCodeBuffer = await QRCode.toBuffer(code, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Salvar QR code no banco de dados
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO qr_codes (code, description, location) VALUES (?, ?, ?)',
        [code, description || '', location || ''],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Retornar a imagem como base64
    const base64Image = qrCodeBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    res.json({
      success: true,
      qrCode: dataUrl,
      code: code,
      description: description || '',
      location: location || ''
    });

  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar QR code para código existente
router.get('/generate/:code', authenticateToken, async (req, res) => {
  const { code } = req.params;

  try {
    // Buscar QR code no banco
    const qrData = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM qr_codes WHERE code = ?', [code], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!qrData) {
      return res.status(404).json({ error: 'QR code não encontrado' });
    }

    // Gerar QR code como buffer PNG
    const qrCodeBuffer = await QRCode.toBuffer(code, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Retornar a imagem como base64
    const base64Image = qrCodeBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    res.json({
      success: true,
      qrCode: dataUrl,
      code: qrData.code,
      description: qrData.description,
      location: qrData.location
    });

  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
