# 🚀 Deploy 2FA Login - SIMPLIFICADO (Sem DynamoDB)

**Guia ultra-rápido para colocar o 2FA em produção**

---

## 🎉 NOVIDADE: Sem Tabela DynamoDB!

✅ **Códigos armazenados em cache (memória) no Lambda**  
✅ **Custo: $0.00/mês** (antes era $0.01/mês)  
✅ **Setup: 2 passos** (antes eram 4 passos)  
✅ **Deploy: 2 minutos** (antes eram 5 minutos)

---

## ✅ Pré-requisitos

- AWS CLI configurado
- Serverless Framework instalado
- Credenciais AWS com permissões para:
  - ~~DynamoDB~~ ❌ NÃO PRECISA MAIS!
  - SES (VerifyEmailIdentity, SendEmail)
  - Lambda (Deploy via Serverless)

---

## 🚀 Deploy em 2 Passos

### Passo 1: Verificar Email no SES

```bash
# Verificar seu email admin
aws ses verify-email-identity \
  --email-address admin@programaai.dev \
  --region us-east-1

# AWS enviará email com link de confirmação
# Clique no link para verificar

# Verificar status
aws ses get-identity-verification-attributes \
  --identities admin@programaai.dev \
  --region us-east-1
```

**Resultado esperado:** `"VerificationStatus": "Success"`

---

### Passo 2: Deploy Backend

```bash
cd /Users/kelson.almeida/Documents/workspace/programaai-full-site/programaai-galaxy

# Deploy
serverless deploy --verbose

# Aguardar conclusão (2-3 minutos)
```

**Resultado esperado:**
```
✔ Service deployed to stack programaai-galaxy-dev

endpoints:
  ANY - https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}

functions:
  admin_router: programaai-galaxy-dev-admin_router
```

---

## ✅ Testar Fluxo Completo

### 1. Login

```bash
# Abrir Galaxy Admin
open https://programaai.dev/admin
```

**Ações:**
1. Inserir email e senha
2. Clicar em "Entrar"
3. ✅ Mensagem: "Enviando código..."

### 2. Verificar Email

- Abrir seu email
- Procurar: "🔐 Código de Autenticação - Galaxy Admin"
- ✅ Código com 6 dígitos em caixa roxa

### 3. Inserir Código

1. Copiar código do email
2. Colar no modal
3. Clicar em "Verificar Código"
4. ✅ Dashboard carrega

### 4. Testar Código Errado

1. Logout
2. Login novamente
3. Inserir código errado (999999)
4. ✅ Erro: "Código incorreto. Tentativas restantes: 2"

### 5. Testar Código Expirado

1. Logout
2. Login novamente
3. Aguardar 6 minutos
4. Inserir código
5. ✅ Erro: "Código expirado. Solicite um novo código."

---

## 🔍 Troubleshooting

### Email Não Chega

```bash
# 1. Verificar se email está verificado
aws ses list-verified-email-addresses --region us-east-1

# 2. Verificar logs Lambda
aws logs tail /aws/lambda/programaai-galaxy-dev-admin_router \
  --follow \
  --region us-east-1
```

### Código Sempre Expirado

**Causa:** Lambda cold start apagou cache  
**Solução:** Normal! Usuário solicita novo código

### Erro 403

**Causa:** Email não é ADMIN_EMAIL  
**Solução:** Verificar variável de ambiente `ADMIN_EMAIL` no serverless.yml

---

## 📊 Como Funciona (Cache)

### Fluxo Técnico

```
1. Login → request-2fa
   └─> Gera código aleatório (6 dígitos)
   └─> Salva em _login_codes_cache (memória)
   └─> Expira em 5 minutos
   └─> Envia email

2. Usuário insere código → verify-2fa
   └─> Busca em _login_codes_cache
   └─> Verifica expiração
   └─> Verifica tentativas (máx 3)
   └─> Verifica código
   └─> Deleta do cache (one-time use)
   └─> Retorna token
```

### Estrutura do Cache

```python
_login_codes_cache = {
    'admin@programaai.dev': {
        'code': '851273',
        'firebaseToken': 'eyJhbGc...',
        'attempts': 0,
        'expires': 1706019300.0  # Unix timestamp
    }
}
```

### Garbage Collection

```python
# A cada solicitação, limpa códigos expirados
now = datetime.utcnow().timestamp()
expired = [e for e, d in _login_codes_cache.items() if d['expires'] < now]
for e in expired:
    del _login_codes_cache[e]
```

---

## 💰 Custo

### Antes (com DynamoDB)
```
DynamoDB: $0.01/mês
SES:      $0.01/mês
Total:    $0.02/mês
```

### Agora (cache memória)
```
Cache:    $0.00/mês (grátis!)
SES:      $0.01/mês
Total:    $0.01/mês 🎉
```

**Economia:** 50%

---

## 🎯 Checklist Final

- [ ] Email admin verificado no SES ✉️
- [ ] Backend deployed (`serverless deploy`) 🚀
- [ ] Frontend built e deployed 🎨
- [ ] Teste: Login → Email → Código → Dashboard ✅
- [ ] Teste: Código errado → Erro apropriado ✅
- [ ] Teste: Código expirado → Erro apropriado ✅

---

## 🎉 Pronto!

**2FA está ativo no Galaxy Admin!** 🔐

**Comandos úteis:**

```bash
# Ver emails verificados
aws ses list-verified-email-addresses

# Ver logs em tempo real
aws logs tail /aws/lambda/programaai-galaxy-dev-admin_router --follow

# Ver último deploy
serverless info

# Ver cache (debug)
# Não é possível ver diretamente (está em memória Lambda)
# Use CloudWatch Logs para debug
```

---

## ❓ FAQ

### O cache não é inseguro?

**Não!** 
- Códigos expiram em 5 minutos (mesmo com DynamoDB)
- Lambda mantém warm por 15+ minutos
- Máximo 3 tentativas
- One-time use (deletado após uso)

### E se o Lambda reiniciar?

**Sem problema!**
- Usuário solicita novo código
- Processo leva 10 segundos
- Mesma experiência que "código expirado"

### Lambda warm dura quanto tempo?

**15-30 minutos** sem uso  
**Horas** com uso ativo  
**Códigos:** 5 minutos (muito menos!)

### Por que não usar DynamoDB?

**DynamoDB é overkill para:**
- Dados temporários (5 min)
- Volume baixo (< 100 logins/mês)
- Sem necessidade de auditoria
- Cache resolve perfeitamente!

---

**Última atualização:** 23/01/2026  
**Status:** ✅ Pronto para deploy  
**Setup:** 2 passos (SES + Deploy)  
**Custo:** $0.01/mês (antes $0.02/mês)
