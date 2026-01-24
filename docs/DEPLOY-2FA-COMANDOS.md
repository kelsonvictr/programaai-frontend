# 🚀 Deploy 2FA Login - Comandos

**Guia rápido para colocar o 2FA em produção**

---

## ✅ Pré-requisitos

- AWS CLI configurado
- Serverless Framework instalado
- Credenciais AWS com permissões para:
  - DynamoDB (CreateTable, UpdateTimeToLive)
  - SES (VerifyEmailIdentity, SendEmail)
  - Lambda (Deploy via Serverless)

---

## 📦 Passo 1: Criar Tabela DynamoDB

### AdminLoginCodes

```bash
# Criar tabela
aws dynamodb create-table \
  --table-name AdminLoginCodes \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Aguardar criação (15-30 segundos)
aws dynamodb wait table-exists \
  --table-name AdminLoginCodes \
  --region us-east-1

# Habilitar TTL (auto-delete após 5 minutos)
aws dynamodb update-time-to-live \
  --table-name AdminLoginCodes \
  --time-to-live-specification Enabled=true,AttributeName=ttl \
  --region us-east-1

# Verificar status
aws dynamodb describe-table \
  --table-name AdminLoginCodes \
  --region us-east-1 \
  --query 'Table.{Name:TableName,Status:TableStatus,TTL:TimeToLiveDescription.TimeToLiveStatus}'
```

**Resultado esperado:**
```json
{
    "Name": "AdminLoginCodes",
    "Status": "ACTIVE",
    "TTL": "ENABLED"
}
```

---

## 📧 Passo 2: Verificar Email no SES

### Verificar Email Admin

```bash
# Listar emails verificados
aws ses list-verified-email-addresses --region us-east-1

# Se seu email NÃO aparecer na lista, verificar:
aws ses verify-email-identity \
  --email-address admin@programaai.dev \
  --region us-east-1

# AWS enviará email com link de confirmação
# Clique no link para verificar
```

### Verificar Status

```bash
aws ses get-identity-verification-attributes \
  --identities admin@programaai.dev \
  --region us-east-1 \
  --query 'VerificationAttributes.*.VerificationStatus'
```

**Resultado esperado:** `"Success"`

### Mover SES para Produção (Opcional - Remove Sandbox)

```bash
# Solicitar saída do sandbox (requer aprovação AWS)
# Vá para: AWS Console > SES > Account Dashboard > Request Production Access
```

---

## 🔧 Passo 3: Configurar Variáveis de Ambiente

### Editar serverless.yml (se necessário)

```bash
cd /Users/kelson.almeida/Documents/workspace/programaai-full-site/programaai-galaxy
```

Verificar se as variáveis estão corretas:

```yaml
environment:
  ADMIN_EMAIL: "admin@programaai.dev"  # ← Seu email
  REMINDER_FROM_EMAIL: "programa AI <no-reply@programaai.dev>"  # ← Remetente
```

---

## 🚀 Passo 4: Deploy Backend

### Deploy Serverless

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

### Anotar URL do Endpoint

```bash
# Salvar URL da API
echo "API_ENDPOINT=$(serverless info --verbose | grep 'endpoint' | awk '{print $2}')" >> ~/.bashrc
source ~/.bashrc
echo $API_ENDPOINT
```

---

## 🎨 Passo 5: Build e Deploy Frontend

### Build

```bash
cd /Users/kelson.almeida/Documents/workspace/programaai-full-site/programa-ai

# Build
npm run build

# Verificar dist/
ls -lh dist/
```

### Deploy (exemplo com S3 + CloudFront)

```bash
# Se usar S3 + CloudFront:
aws s3 sync dist/ s3://seu-bucket-frontend/ --delete

# Invalidar cache CloudFront
aws cloudfront create-invalidation \
  --distribution-id SEU_DISTRIBUTION_ID \
  --paths "/*"
```

### Deploy (exemplo com Vercel/Netlify)

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

---

## ✅ Passo 6: Testar Fluxo Completo

### 1. Login com Credenciais Corretas

```bash
# Abrir no navegador
open https://seu-site.com/admin
```

**Ações:**
1. Inserir email e senha corretos
2. Clicar em "Entrar"
3. ✅ Verificar se aparece mensagem "Enviando código..."

### 2. Verificar Email

```bash
# Abrir seu email
# Procurar por: "🔐 Código de Autenticação - Galaxy Admin"
```

**Verificar:**
- ✅ Email chegou em 10-30 segundos
- ✅ Código tem 6 dígitos
- ✅ Código está em caixa roxa/azul grande
- ✅ Aviso "Expira em 5 minutos"

### 3. Inserir Código Correto

**Ações:**
1. Copiar código do email
2. Colar no modal
3. Clicar em "Verificar Código"
4. ✅ Dashboard deve carregar

### 4. Testar Código Errado

**Ações:**
1. Fazer logout
2. Login novamente
3. Inserir código errado (ex: 999999)
4. ✅ Erro: "Código incorreto. Tentativas restantes: 2"

### 5. Testar Código Expirado

**Ações:**
1. Fazer logout
2. Login novamente
3. Aguardar 6 minutos
4. Inserir código (mesmo correto)
5. ✅ Erro: "Código expirado. Solicite um novo código."

### 6. Testar Limite de Tentativas

**Ações:**
1. Fazer logout
2. Login novamente
3. Inserir código errado 3 vezes
4. ✅ Erro: "Limite de tentativas excedido"

---

## 🔍 Passo 7: Verificar Logs (Troubleshooting)

### CloudWatch Logs

```bash
# Listar log groups
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/programaai-galaxy \
  --region us-east-1

# Ver logs recentes (últimos 10 min)
aws logs tail /aws/lambda/programaai-galaxy-dev-admin_router \
  --follow \
  --region us-east-1
```

### Buscar Erros

```bash
# Buscar por "2FA"
aws logs filter-log-events \
  --log-group-name /aws/lambda/programaai-galaxy-dev-admin_router \
  --filter-pattern "2FA" \
  --start-time $(date -u -d '10 minutes ago' +%s)000 \
  --region us-east-1
```

---

## 📊 Passo 8: Monitoramento (Opcional)

### CloudWatch Alarms

```bash
# Criar alarme para tentativas falhas
aws cloudwatch put-metric-alarm \
  --alarm-name "2FA-FailedLoginAttempts" \
  --alarm-description "Alerta se muitas tentativas de 2FA falharem" \
  --metric-name FailedLoginAttempts \
  --namespace Galaxy/Admin \
  --statistic Sum \
  --period 3600 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --region us-east-1
```

### Dashboard CloudWatch

```bash
# Criar dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "Galaxy-Admin-2FA" \
  --dashboard-body file://dashboard-2fa.json \
  --region us-east-1
```

**dashboard-2fa.json:**
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["Galaxy/Admin", "2FA-CodesSent"],
          [".", "2FA-CodesVerified"],
          [".", "2FA-CodesFailed"]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "us-east-1",
        "title": "2FA Login Activity"
      }
    }
  ]
}
```

---

## 🧹 Rollback (Se Necessário)

### Reverter Backend

```bash
cd /Users/kelson.almeida/Documents/workspace/programaai-full-site/programaai-galaxy

# Listar deploys
serverless deploy list

# Reverter para deploy anterior
serverless rollback --timestamp TIMESTAMP
```

### Reverter Frontend

```bash
# Restaurar versão anterior do S3
aws s3 sync s3://seu-bucket-frontend-backup/ s3://seu-bucket-frontend/ --delete

# Invalidar CloudFront
aws cloudfront create-invalidation \
  --distribution-id SEU_DISTRIBUTION_ID \
  --paths "/*"
```

---

## 🗑️ Cleanup (Remover 2FA)

### Deletar Tabela DynamoDB

```bash
aws dynamodb delete-table \
  --table-name AdminLoginCodes \
  --region us-east-1
```

### Remover Rotas do Backend

```bash
# Editar handler.py e remover:
# - _request_login_2fa()
# - _verify_login_2fa()
# - Rotas no admin_router

# Deploy novamente
cd /Users/kelson.almeida/Documents/workspace/programaai-full-site/programaai-galaxy
serverless deploy
```

---

## 📋 Checklist Final

- [ ] Tabela `AdminLoginCodes` criada com TTL habilitado
- [ ] Email admin verificado no SES
- [ ] Backend deployed (`serverless deploy`)
- [ ] Frontend built e deployed
- [ ] Teste 1: Login com credenciais corretas ✅
- [ ] Teste 2: Código correto → acesso liberado ✅
- [ ] Teste 3: Código errado → erro com tentativas ✅
- [ ] Teste 4: Código expirado → erro apropriado ✅
- [ ] Teste 5: 3 tentativas erradas → código deletado ✅
- [ ] CloudWatch Logs configurado (opcional)
- [ ] CloudWatch Alarms configurado (opcional)
- [ ] Documentação revisada

---

## 🎉 Pronto!

**2FA está ativo no Galaxy Admin!** 🔐

**Comandos úteis:**

```bash
# Ver status da tabela
aws dynamodb describe-table --table-name AdminLoginCodes

# Ver emails verificados
aws ses list-verified-email-addresses

# Ver logs em tempo real
aws logs tail /aws/lambda/programaai-galaxy-dev-admin_router --follow

# Contar itens na tabela
aws dynamodb scan --table-name AdminLoginCodes --select COUNT

# Ver último deploy
serverless info
```

---

**Última atualização:** 23/01/2026  
**Status:** ✅ Pronto para deploy
