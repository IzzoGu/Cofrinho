const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'escolta.db');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('escolta', 'adm', 'cliente')),
          full_name TEXT,
          email TEXT,
          phone TEXT,
          company TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de logs de QR codes
      db.run(`
        CREATE TABLE IF NOT EXISTS qr_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          qr_data TEXT NOT NULL,
          location TEXT,
          latitude REAL,
          longitude REAL,
          scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Tabela de QR codes cadastrados
      db.run(`
        CREATE TABLE IF NOT EXISTS qr_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          description TEXT,
          location TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Inserir usuário admin padrão
      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.run(`
        INSERT OR IGNORE INTO users (username, password, role) 
        VALUES ('admin', ?, 'adm')
      `, [adminPassword]);

      // Inserir usuário escolta padrão
      const escoltaPassword = bcrypt.hashSync('escolta123', 10);
      db.run(`
        INSERT OR IGNORE INTO users (username, password, role, full_name, email) 
        VALUES ('escolta', ?, 'escolta', 'Usuário Escolta', 'escolta@empresa.com')
      `, [escoltaPassword]);

      // Inserir usuário cliente padrão
      const clientePassword = bcrypt.hashSync('cliente123', 10);
      db.run(`
        INSERT OR IGNORE INTO users (username, password, role, full_name, email, company) 
        VALUES ('cliente', ?, 'cliente', 'Cliente Exemplo', 'cliente@empresa.com', 'Empresa Cliente')
      `, [clientePassword]);

      // Inserir alguns QR codes de exemplo
      db.run(`
        INSERT OR IGNORE INTO qr_codes (code, description, location) 
        VALUES 
        ('PONTO_001', 'Entrada Principal', 'Portão Principal'),
        ('PONTO_002', 'Área de Estacionamento', 'Estacionamento A'),
        ('PONTO_003', 'Recepção', 'Hall de Entrada'),
        ('PONTO_004', 'Escritórios', '2º Andar')
      `);

      console.log('Banco de dados inicializado com sucesso');
      resolve();
    });
  });
};

module.exports = { initDatabase, db };
