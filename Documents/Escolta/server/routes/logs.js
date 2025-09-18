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

// Listar logs (todos os logs para admin, apenas próprios para escolta)
router.get('/', authenticateToken, (req, res) => {
  const { page = 1, limit = 50, startDate, endDate, userId, description } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT ql.*, u.username, qc.description as qr_description, qc.location as qr_location
    FROM qr_logs ql
    JOIN users u ON ql.user_id = u.id
    JOIN qr_codes qc ON ql.qr_data = qc.code
    WHERE 1=1
  `;
  let params = [];

  // Filtro por usuário (escolta só vê seus próprios logs)
  if (req.user.role === 'escolta') {
    query += ' AND ql.user_id = ?';
    params.push(req.user.id);
  } else if (userId) {
    query += ' AND ql.user_id = ?';
    params.push(userId);
  }

  // Filtro por data
  if (startDate) {
    query += ' AND DATE(ql.scanned_at) >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND DATE(ql.scanned_at) <= ?';
    params.push(endDate);
  }

  // Filtro por descrição
  if (description) {
    query += ' AND qc.description LIKE ?';
    params.push(`%${description}%`);
  }

  query += ' ORDER BY ql.scanned_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, logs) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Contar total de registros para paginação
    let countQuery = `
      SELECT COUNT(*) as total
      FROM qr_logs ql
      WHERE 1=1
    `;
    let countParams = [];

    if (req.user.role === 'escolta') {
      countQuery += ' AND ql.user_id = ?';
      countParams.push(req.user.id);
    } else if (userId) {
      countQuery += ' AND ql.user_id = ?';
      countParams.push(userId);
    }

    if (startDate) {
      countQuery += ' AND DATE(ql.scanned_at) >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ' AND DATE(ql.scanned_at) <= ?';
      countParams.push(endDate);
    }
    if (description) {
      countQuery += ' AND qc.description LIKE ?';
      countParams.push(`%${description}%`);
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// Estatísticas gerais (apenas admin)
router.get('/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'adm') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const queries = [
    'SELECT COUNT(*) as total_scans FROM qr_logs',
    'SELECT COUNT(DISTINCT user_id) as active_users FROM qr_logs WHERE scanned_at >= datetime("now", "-7 days")',
    'SELECT COUNT(*) as scans_today FROM qr_logs WHERE DATE(scanned_at) = DATE("now")',
    'SELECT qr_data, COUNT(*) as count FROM qr_logs GROUP BY qr_data ORDER BY count DESC LIMIT 5'
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.all(query, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    })
  )).then(results => {
    res.json({
      totalScans: results[0][0].total_scans,
      activeUsers: results[1][0].active_users,
      scansToday: results[2][0].scans_today,
      topQRCodes: results[3]
    });
  }).catch(err => {
    res.status(500).json({ error: 'Erro interno do servidor' });
  });
});

// Exportar logs (apenas admin)
router.get('/export', authenticateToken, (req, res) => {
  if (req.user.role !== 'adm') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { startDate, endDate, description, format = 'json' } = req.query;

  let query = `
    SELECT ql.*, u.username, qc.description as qr_description, qc.location as qr_location
    FROM qr_logs ql
    JOIN users u ON ql.user_id = u.id
    JOIN qr_codes qc ON ql.qr_data = qc.code
    WHERE 1=1
  `;
  let params = [];

  if (startDate) {
    query += ' AND DATE(ql.scanned_at) >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND DATE(ql.scanned_at) <= ?';
    params.push(endDate);
  }
  if (description) {
    query += ' AND qc.description LIKE ?';
    params.push(`%${description}%`);
  }

  query += ' ORDER BY ql.scanned_at DESC';

  db.all(query, params, (err, logs) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (format === 'csv') {
      const csv = [
        'ID,Usuário,QR Code,Descrição,Localização,Latitude,Longitude,Data/Hora',
        ...logs.map(log => 
          `${log.id},${log.username},${log.qr_data},"${log.qr_description}","${log.location || ''}",${log.latitude || ''},${log.longitude || ''},"${log.scanned_at}"`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');
      res.send(csv);
    } else {
      res.json(logs);
    }
  });
});

module.exports = router;
