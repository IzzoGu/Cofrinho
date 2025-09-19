# Credenciais Padrão - Uso Interno

⚠️ **ATENÇÃO**: Este arquivo contém informações sensíveis. Mantenha-o seguro e não compartilhe publicamente.

## Usuários Padrão do Sistema

### Administrador
- **Usuário**: `admin`
- **Senha**: `admin123`
- **Perfil**: Administrador completo

### Escolta
- **Usuário**: `escolta`
- **Senha**: `escolta123`
- **Perfil**: Usuário escolta

### Cliente
- **Usuário**: `cliente`
- **Senha**: `cliente123`
- **Perfil**: Cliente (visualização de logs)

## Segurança

1. **Altere as senhas padrão** após a primeira instalação
2. **Remova este arquivo** em ambientes de produção
3. **Use senhas fortes** para usuários reais
4. **Monitore o acesso** através dos logs do sistema

## Como Alterar Senhas

Para alterar as senhas padrão, você pode:

1. **Via banco de dados** (SQLite):
   ```sql
   -- Conectar ao banco: server/database/escolta.db
   UPDATE users SET password = 'nova_senha_hash' WHERE username = 'admin';
   UPDATE users SET password = 'nova_senha_hash' WHERE username = 'escolta';
   ```

2. **Via código** (editar server/database/init.js):
   - Altere as senhas nas linhas onde são definidas
   - Reinstale o banco de dados

3. **Via interface** (futura implementação):
   - Adicionar funcionalidade de alteração de senha no painel admin

## Recomendações

- Use senhas com pelo menos 8 caracteres
- Inclua letras maiúsculas, minúsculas, números e símbolos
- Não reutilize senhas de outros sistemas
- Implemente rotação periódica de senhas
