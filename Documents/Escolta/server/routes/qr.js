const express = require('express');
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

// Escanear QR code
router.post('/scan', authenticateToken, (req, res) => {
  const { qrData, location, latitude, longitude } = req.body;

  if (!qrData) {
    return res.status(400).json({ error: 'Dados do QR code são obrigatórios' });
  }

  // Verificar se o QR code existe na base de dados
  db.get(
    'SELECT * FROM qr_codes WHERE code = ?',
    [qrData],
    (err, qrCode) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (!qrCode) {
        return res.status(404).json({ error: 'QR code não reconhecido' });
      }

      // Registrar o log
      db.run(
        `INSERT INTO qr_logs (user_id, qr_data, location, latitude, longitude) 
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, qrData, location || qrCode.location, latitude, longitude],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao registrar log' });
          }

          res.json({
            success: true,
            message: 'QR code escaneado com sucesso',
            logId: this.lastID,
            qrInfo: {
              code: qrCode.code,
              description: qrCode.description,
              location: qrCode.location
            }
          });
        }
      );
    }
  );
});

// Listar QR codes cadastrados
router.get('/list', authenticateToken, (req, res) => {
  db.all('SELECT * FROM qr_codes ORDER BY created_at DESC', (err, qrCodes) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(qrCodes);
  });
});

// Adicionar novo QR code (apenas admin)
router.post('/add', authenticateToken, (req, res) => {
  if (req.user.role !== 'adm') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { code, description, location } = req.body;

  if (!code || !description) {
    return res.status(400).json({ error: 'Código e descrição são obrigatórios' });
  }

  db.run(
    'INSERT INTO qr_codes (code, description, location) VALUES (?, ?, ?)',
    [code, description, location],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Código já existe' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        success: true,
        message: 'QR code adicionado com sucesso',
        id: this.lastID
      });
    }
  );
});

module.exports = router;
