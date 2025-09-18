const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuração do banco PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Inicializar banco de dados
const initDatabase = async () => {
  try {
    // Criar tabelas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK(role IN ('escolta', 'adm', 'cliente')),
        full_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(255),
        company VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS qr_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        qr_data VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir usuários padrão
    const adminPassword = bcrypt.hashSync('admin123', 10);
    await pool.query(`
      INSERT INTO users (username, password, role, full_name, email) 
      VALUES ('admin', $1, 'adm', 'Administrador', 'admin@empresa.com')
      ON CONFLICT (username) DO NOTHING
    `, [adminPassword]);

    const escoltaPassword = bcrypt.hashSync('escolta123', 10);
    await pool.query(`
      INSERT INTO users (username, password, role, full_name, email) 
      VALUES ('escolta', $1, 'escolta', 'Usuário Escolta', 'escolta@empresa.com')
      ON CONFLICT (username) DO NOTHING
    `, [escoltaPassword]);

    const clientePassword = bcrypt.hashSync('cliente123', 10);
    await pool.query(`
      INSERT INTO users (username, password, role, full_name, email, company) 
      VALUES ('cliente', $1, 'cliente', 'Cliente Exemplo', 'cliente@empresa.com', 'Empresa Cliente')
      ON CONFLICT (username) DO NOTHING
    `, [clientePassword]);

    // Inserir QR codes de exemplo
    await pool.query(`
      INSERT INTO qr_codes (code, description, location) 
      VALUES 
      ('PONTO_001', 'Entrada Principal', 'Portão Principal'),
      ('PONTO_002', 'Área de Estacionamento', 'Estacionamento A'),
      ('PONTO_003', 'Recepção', 'Hall de Entrada'),
      ('PONTO_004', 'Escritórios', '2º Andar')
      ON CONFLICT (code) DO NOTHING
    `);

    console.log('Banco PostgreSQL inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco PostgreSQL:', error);
    throw error;
  }
};

module.exports = { pool, initDatabase };
