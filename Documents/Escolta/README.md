# Escolta Platform

Uma plataforma web para controle de escolta com sistema de login, perfis de usuário, scanner de QR codes e logging de localização.

## Funcionalidades

- **Sistema de Autenticação**: Login com dois perfis (Escolta e Admin)
- **Scanner de QR Code**: Interface para escanear QR codes com câmera ou entrada manual
- **Logging Automático**: Registro automático de localização e horário dos escaneamentos
- **Dashboard**: Visão geral das estatísticas e logs recentes
- **Painel Administrativo**: Gerenciamento de usuários e QR codes (apenas Admin)
- **Exportação de Dados**: Exportar logs em formato JSON ou CSV

## Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- SQLite3
- JWT para autenticação
- bcryptjs para hash de senhas

### Frontend
- React.js
- React Router
- Axios para requisições HTTP
- Styled Components
- React Toastify para notificações

## Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos para instalação

1. **Clone ou baixe o projeto**
   ```bash
   cd escolta-platform
   ```

2. **Instale as dependências do servidor**
   ```bash
   npm install
   ```

3. **Instale as dependências do cliente**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

   Este comando irá iniciar tanto o servidor backend (porta 5000) quanto o frontend React (porta 3000).

## Uso

### Acesso à aplicação
- Acesse `http://localhost:3000` no seu navegador
- A aplicação será redirecionada automaticamente para a tela de login

### Usuários padrão
- **Admin**: 
  - Usuário: `admin`
  - Senha: [consulte o administrador do sistema]
- **Escolta**: 
  - Usuário: `escolta`
  - Senha: [consulte o administrador do sistema]

### Funcionalidades por perfil

#### Perfil Escolta
- Dashboard com visão geral
- Scanner de QR codes
- Visualização de logs próprios
- Exportação de logs próprios

#### Perfil Admin
- Todas as funcionalidades do perfil Escolta
- Painel administrativo
- Estatísticas gerais
- Gerenciamento de usuários
- Gerenciamento de QR codes
- Visualização de todos os logs
- Exportação completa de dados

### Scanner de QR Code
1. Acesse a aba "Scanner QR"
2. Configure a localização (opcional)
3. Clique em "Iniciar Scanner" para usar a câmera
4. Ou digite o código manualmente no campo de entrada
5. O sistema registrará automaticamente a localização e horário

### QR Codes pré-cadastrados
O sistema vem com alguns QR codes de exemplo:
- `PONTO_001` - Entrada Principal
- `PONTO_002` - Área de Estacionamento
- `PONTO_003` - Recepção
- `PONTO_004` - Escritórios

## Estrutura do Projeto

```
escolta-platform/
├── server/                 # Backend Node.js
│   ├── database/          # Configuração do banco SQLite
│   ├── routes/            # Rotas da API
│   └── index.js           # Servidor principal
├── client/                # Frontend React
│   ├── public/            # Arquivos estáticos
│   ├── src/               # Código fonte React
│   │   ├── components/    # Componentes React
│   │   ├── context/       # Context API
│   │   └── App.js         # Componente principal
│   └── package.json       # Dependências do frontend
├── package.json           # Dependências do backend
└── README.md             # Este arquivo
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/verify` - Verificar token

### QR Codes
- `POST /api/qr/scan` - Escanear QR code
- `GET /api/qr/list` - Listar QR codes
- `POST /api/qr/add` - Adicionar QR code (Admin)

### Logs
- `GET /api/logs` - Listar logs com filtros
- `GET /api/logs/stats` - Estatísticas (Admin)
- `GET /api/logs/export` - Exportar logs (Admin)

### Usuários
- `GET /api/users` - Listar usuários (Admin)

## Banco de Dados

O sistema utiliza SQLite3 com as seguintes tabelas:

- **users**: Usuários do sistema
- **qr_codes**: QR codes cadastrados
- **qr_logs**: Logs de escaneamentos

## Configuração de Produção

Para deploy em produção:

1. **Configure variáveis de ambiente**
   ```bash
   export JWT_SECRET=sua_chave_secreta_aqui
   export PORT=5000
   ```

2. **Build do frontend**
   ```bash
   cd client
   npm run build
   cd ..
   ```

3. **Inicie o servidor**
   ```bash
   npm start
   ```

## Segurança

- Senhas são criptografadas com bcryptjs
- Tokens JWT com expiração de 24 horas
- Validação de permissões por rota
- Sanitização de dados de entrada

## Suporte

Para dúvidas ou problemas, verifique:
1. Se todas as dependências foram instaladas corretamente
2. Se as portas 3000 e 5000 estão disponíveis
3. Se o banco de dados foi inicializado corretamente
4. Os logs do console para mensagens de erro

## Licença

Este projeto é de uso interno e não possui licença pública.
