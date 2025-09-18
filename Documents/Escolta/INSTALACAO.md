# Instalação Rápida - Escolta Platform

## Instalação Automática (Recomendado)

1. **Execute o script de setup:**
   ```bash
   node setup.js
   ```

2. **Inicie a aplicação:**
   ```bash
   npm run dev
   ```

3. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

## Instalação Manual

### 1. Instalar dependências do servidor
```bash
npm install
```

### 2. Instalar dependências do cliente
```bash
cd client
npm install
cd ..
```

### 3. Iniciar aplicação
```bash
npm run dev
```

## Primeiro Acesso

### Usuários padrão:
- **Admin**: `admin` / [senha padrão]
- **Escolta**: `escolta` / [senha padrão]

### QR Codes de exemplo:
- `PONTO_001` - Entrada Principal
- `PONTO_002` - Área de Estacionamento  
- `PONTO_003` - Recepção
- `PONTO_004` - Escritórios

## Funcionalidades

### Perfil Escolta:
- Dashboard com estatísticas pessoais
- Scanner de QR codes (câmera ou manual)
- Visualização de logs próprios
- Exportação de dados pessoais

### Perfil Admin:
- Todas as funcionalidades do Escolta
- Painel administrativo completo
- Estatísticas gerais do sistema
- Gerenciamento de usuários
- Gerenciamento de QR codes
- Visualização de todos os logs
- Exportação completa de dados

## Solução de Problemas

### Erro de porta em uso:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :3000
lsof -i :5000
```

### Erro de dependências:
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
npm install
cd client && npm install && cd ..
```

### Erro de banco de dados:
```bash
# Deletar banco e reiniciar (cuidado: perde dados)
rm server/database/escolta.db
npm run dev
```

## Suporte

Para mais informações, consulte o `README.md` completo.
