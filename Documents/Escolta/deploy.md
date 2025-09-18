# Deploy no Netlify - Instruções

## 1. Preparar o Projeto

```bash
# Fazer build do React
cd client
npm run build
cd ..
```

## 2. Configurar Netlify

### Opção A: Deploy via GitHub (Recomendado)

1. **Criar repositório no GitHub**
2. **Fazer push do código**
3. **Conectar no Netlify**
4. **Configurar build settings:**
   - Build command: `cd client && npm run build`
   - Publish directory: `client/build`

### Opção B: Deploy via Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login no Netlify
netlify login

# Deploy
netlify deploy --prod --dir=client/build
```

## 3. Configurar Backend

O backend precisa estar hospedado em um serviço como:
- Heroku
- Railway
- Render
- Vercel

## 4. Variáveis de Ambiente

No Netlify, configurar:
- `REACT_APP_API_URL`: URL do seu backend

## 5. Testar

Após o deploy, testar:
- Login funciona
- Scanner de QR funciona
- Logs são salvos
- Todas as funcionalidades operacionais
