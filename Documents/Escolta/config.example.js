// Arquivo de configuração de exemplo
// Copie este arquivo para config.js e ajuste os valores

module.exports = {
  // Porta do servidor
  PORT: process.env.PORT || 9443,
  
  // URL da API (para produção)
  API_URL: process.env.REACT_APP_API_URL || 'https://localhost:9443',
  
  // Chave secreta JWT
  JWT_SECRET: process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui',
  
  // Configurações do banco de dados
  DB_PATH: process.env.DB_PATH || './database/escolta.db',
  
  // Configurações de SSL
  SSL_KEY_PATH: process.env.SSL_KEY_PATH || './ssl/private-key.pem',
  SSL_CERT_PATH: process.env.SSL_CERT_PATH || './ssl/certificate.pem',
  
  // Configurações de CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || true, // true = permite qualquer origem
  CORS_CREDENTIALS: true,
  CORS_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  CORS_HEADERS: ['Content-Type', 'Authorization']
};
