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

// Listar usuários (apenas admin)
router.get('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'adm') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  db.all(
    'SELECT id, username, role, full_name, email, phone, company, created_at FROM users ORDER BY created_at DESC',
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      res.json(users);
    }
  );
});

// Criar usuário (apenas admin)
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'adm') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { username, password, role, full_name, email, phone, company } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password e role são obrigatórios' });
  }

  if (!['escolta', 'adm', 'cliente'].includes(role)) {
    return res.status(400).json({ error: 'Role deve ser escolta, adm ou cliente' });
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, password, role, full_name, email, phone, company) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, hashedPassword, role, full_name || '', email || '', phone || '', company || ''],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Username já existe' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        success: true,
        message: 'Usuário criado com sucesso',
        userId: this.lastID
      });
    }
  );
});

// Atualizar usuário (apenas admin)
router.put('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'adm') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { id } = req.params;
  const { username, role, full_name, email, phone, company } = req.body;

  if (!username || !role) {
    return res.status(400).json({ error: 'Username e role são obrigatórios' });
  }

  if (!['escolta', 'adm', 'cliente'].includes(role)) {
    return res.status(400).json({ error: 'Role deve ser escolta, adm ou cliente' });
  }

  db.run(
    'UPDATE users SET username = ?, role = ?, full_name = ?, email = ?, phone = ?, company = ? WHERE id = ?',
    [username, role, full_name || '', email || '', phone || '', company || '', id],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Username já existe' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso'
      });
    }
  );
});

// Alterar senha (apenas admin)
router.put('/:id/password', authenticateToken, (req, res) => {
  if (req.user.role !== 'adm') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Senha é obrigatória' });
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    }
  );
});

// Deletar usuário (apenas admin)
router.delete('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'adm') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { id } = req.params;

  // Não permitir deletar o próprio usuário
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
  }

  db.run(
    'DELETE FROM users WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    }
  );
});

module.exports = router;
