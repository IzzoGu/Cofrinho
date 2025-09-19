# 🚨 SOLUÇÃO PARA ERR_CONNECTION_FAILED

## ✅ **SOLUÇÃO RÁPIDA (Recomendada)**

### 1. **Use HTTP em vez de HTTPS**
```
http://192.168.0.35:8080
```
**Por quê?** O erro geralmente é causado pelo certificado SSL auto-assinado.

### 2. **Configure o Firewall**
```bash
# Execute como Administrador
npm run firewall
```

### 3. **Teste a Conectividade**
```bash
npm run diagnostico
```

---

## 🔧 **SOLUÇÕES DETALHADAS**

### **Opção 1: HTTP (Mais Simples)**
1. Acesse: `http://192.168.0.35:8080`
2. Funciona imediatamente, sem problemas de certificado

### **Opção 2: HTTPS (Aceitar Certificado)**
1. Acesse: `https://192.168.0.35:9443`
2. Clique em "Avançado" no aviso de segurança
3. Clique em "Prosseguir para 192.168.0.35 (não seguro)"
4. Aceite o certificado

### **Opção 3: Túnel Externo (Para Acesso de Qualquer Lugar)**
```bash
npm run tunnel
```
Isso criará uma URL pública que funciona de qualquer lugar.

---

## 🛠️ **DIAGNÓSTICO DE PROBLEMAS**

### **1. Verificar se o Servidor está Rodando**
```bash
npm run diagnostico
```

### **2. Verificar Portas**
```bash
netstat -an | findstr :9443
netstat -an | findstr :8080
```

### **3. Verificar IP Local**
```bash
npm run check-ip
```

### **4. Testar Conectividade**
```bash
# Teste local
curl http://localhost:8080/api/auth/verify

# Teste na rede
curl http://192.168.0.35:8080/api/auth/verify
```

---

## 🌐 **URLs PARA TESTAR**

| Tipo | URL | Observação |
|------|-----|------------|
| **Local HTTP** | `http://localhost:8080` | Sempre funciona |
| **Local HTTPS** | `https://localhost:9443` | Pode dar erro de certificado |
| **Rede HTTP** | `http://192.168.0.35:8080` | **RECOMENDADO** |
| **Rede HTTPS** | `https://192.168.0.35:9443` | Precisa aceitar certificado |

---

## 📱 **PARA ACESSAR DE OUTRO DISPOSITIVO**

### **Na Mesma Rede WiFi:**
1. Use: `http://192.168.0.35:8080`
2. Funciona em celular, tablet, outro computador

### **De Qualquer Lugar:**
1. Execute: `npm run tunnel`
2. Use a URL fornecida pelo ngrok
3. Exemplo: `https://abc123.ngrok.io`

---

## ⚠️ **PROBLEMAS COMUNS**

### **ERR_CONNECTION_FAILED**
- **Causa**: Firewall ou certificado SSL
- **Solução**: Use HTTP ou configure firewall

### **ERR_CERT_AUTHORITY_INVALID**
- **Causa**: Certificado auto-assinado
- **Solução**: Aceite o certificado no navegador

### **ERR_CONNECTION_REFUSED**
- **Causa**: Servidor não está rodando
- **Solução**: Execute `npm start`

### **ERR_NETWORK_CHANGED**
- **Causa**: IP mudou
- **Solução**: Execute `npm run check-ip` para ver novo IP

---

## 🚀 **COMANDOS ÚTEIS**

```bash
# Iniciar servidor
npm start

# Diagnóstico completo
npm run diagnostico

# Configurar firewall
npm run firewall

# Criar túnel externo
npm run tunnel

# Ver IP local
npm run check-ip

# Build e deploy
npm run deploy
```

---

## 📞 **AINDA COM PROBLEMAS?**

1. **Execute o diagnóstico:**
   ```bash
   npm run diagnostico
   ```

2. **Verifique os logs do servidor** quando executar `npm start`

3. **Teste com diferentes navegadores** (Chrome, Firefox, Edge)

4. **Use HTTP em vez de HTTPS** para evitar problemas de certificado

5. **Configure o firewall** se necessário

---

## ✅ **TESTE FINAL**

Se tudo estiver funcionando, você deve conseguir:
1. Acessar `http://192.168.0.35:8080` no navegador
2. Ver a tela de login da aplicação
3. Fazer login com as credenciais padrão
4. Usar todas as funcionalidades normalmente
