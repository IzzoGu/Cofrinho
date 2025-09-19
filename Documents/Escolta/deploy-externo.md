# Deploy para Acesso Externo - Escolta Platform

## Opções para Acesso Externo

### 1. 🌐 Deploy em Serviços de Nuvem (Recomendado)

#### Opção A: Railway (Backend) + Netlify (Frontend)

**Backend no Railway:**
1. Acesse [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   ```
   PORT=9443
   JWT_SECRET=sua_chave_secreta_muito_segura
   CORS_ORIGIN=false
   ```
4. Deploy automático

**Frontend no Netlify:**
1. Acesse [netlify.com](https://netlify.com)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   ```
   REACT_APP_API_URL=https://seu-app.railway.app
   ```
4. Deploy automático

#### Opção B: Render (Full Stack)

1. Acesse [render.com](https://render.com)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   ```
   REACT_APP_API_URL=https://seu-app.onrender.com
   JWT_SECRET=sua_chave_secreta_muito_segura
   ```
4. Deploy automático

### 2. 🏠 Acesso Local com Túnel

#### Usando ngrok (Mais Fácil)

1. **Instale o ngrok:**
   ```bash
   # Windows (via Chocolatey)
   choco install ngrok
   
   # Ou baixe de https://ngrok.com/download
   ```

2. **Execute sua aplicação:**
   ```bash
   npm start
   ```

3. **Em outro terminal, crie o túnel:**
   ```bash
   # Para HTTPS (porta 9443)
   ngrok http 9443
   
   # Para HTTP (porta 8080)
   ngrok http 8080
   ```

4. **Use a URL fornecida pelo ngrok:**
   - Exemplo: `https://abc123.ngrok.io`
   - Esta URL funcionará de qualquer lugar do mundo

#### Usando Cloudflare Tunnel

1. **Instale cloudflared:**
   ```bash
   # Windows
   winget install cloudflare.cloudflared
   ```

2. **Crie o túnel:**
   ```bash
   cloudflared tunnel --url http://localhost:9443
   ```

### 3. 🔧 Configuração de Port Forwarding

Se você tem controle do roteador:

1. **Acesse o painel do roteador** (geralmente 192.168.1.1 ou 192.168.0.1)
2. **Configure port forwarding:**
   - Porta externa: 9443
   - Porta interna: 9443
   - IP do servidor: [IP do seu computador]
3. **Use seu IP público** para acessar externamente

### 4. 📱 Configuração para Mobile

Para acessar via celular na mesma rede:

1. **Descubra o IP do seu computador:**
   ```bash
   # Windows
   ipconfig
   
   # Procure por "IPv4 Address" da sua conexão WiFi
   ```

2. **Acesse no celular:**
   - `https://[SEU_IP]:9443` (HTTPS)
   - `http://[SEU_IP]:8080` (HTTP)

## ⚙️ Configurações Importantes

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Porta do servidor
PORT=9443

# URL da API (para produção)
REACT_APP_API_URL=https://seu-dominio.com

# Chave secreta JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui

# Configurações de CORS
CORS_ORIGIN=true
```

### Firewall

Certifique-se de que as portas estão abertas:
- **9443** (HTTPS)
- **8080** (HTTP)

## 🚀 Deploy Rápido

### Script de Deploy Automático

```bash
# 1. Build do frontend
npm run build

# 2. Iniciar servidor
npm start

# 3. Em outro terminal, criar túnel (se usando ngrok)
ngrok http 9443
```

## 🔍 Testando o Acesso Externo

1. **Teste local:**
   - `https://localhost:9443`

2. **Teste na rede local:**
   - `https://[SEU_IP]:9443`

3. **Teste externo:**
   - Use a URL do túnel ou serviço de nuvem

## 🛠️ Solução de Problemas

### Erro de CORS
- Verifique se `CORS_ORIGIN=true` está configurado
- Limpe o cache do navegador

### Erro de Certificado SSL
- Aceite o certificado auto-assinado no navegador
- Ou use a versão HTTP (porta 8080)

### Erro de Conexão
- Verifique se o firewall está permitindo as portas
- Teste com `telnet [IP] [PORTA]`

### Erro de API
- Verifique se a variável `REACT_APP_API_URL` está correta
- Verifique os logs do servidor

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do servidor
2. Teste a conectividade de rede
3. Verifique as configurações de firewall
4. Use as ferramentas de debug do navegador (F12)
