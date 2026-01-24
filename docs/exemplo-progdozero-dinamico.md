# 📝 Exemplo: Curso "Programação do Zero" com Card Dinâmico

## Item DynamoDB Original (com imageUrl estática)

```json
{
  "id": { "S": "10" },
  "ativo": { "BOOL": true },
  "bannerMobile": { "S": "/banners/banner-mobile-progdozero.png" },
  "bannerSite": { "S": "/banners/banner-site-progdozero.png" },
  "bio": { "S": "Kelson Almeida é Desenvolvedor Sênior na NTT Data..." },
  "datas": { "L": [...] },
  "description": { "S": "Curso prático e presencial de 18 horas..." },
  "duration": { "S": "24 horas (12 encontros)" },
  "faq": { "L": [...] },
  "horario": { "S": "19h00 - 21h00" },
  "imageUrl": { "S": "/coursecard-progdozero.png" },
  "linkedin": { "S": "https://www.linkedin.com/in/kelson-almeida/" },
  "modalidade": { "S": "PRESENCIAL" },
  "modulos": { "L": [...] },
  "obsPrice": { "S": "PREÇO PROMOCIONAL!" },
  "oQueVaiAprender": { "L": [...] },
  "prerequisitos": { "L": [...] },
  "price": { "S": "R$399,99" },
  "professor": { "S": "Kelson Almeida" },
  "profFoto": { "S": "/professores/kelson.jpeg" },
  "publicoAlvo": { "L": [...] },
  "title": { "S": "Curso Programação para Iniciantes (Turma 02)" },
  "video": { "S": "8.mp4" }
}
```

---

## ✨ Item DynamoDB NOVO (com Card Dinâmico)

Adicione apenas 3 novos atributos:

```json
{
  "id": { "S": "10" },
  "ativo": { "BOOL": true },
  "bannerMobile": { "S": "/banners/banner-mobile-progdozero.png" },
  "bannerSite": { "S": "/banners/banner-site-progdozero.png" },
  "bio": { "S": "Kelson Almeida é Desenvolvedor Sênior na NTT Data..." },
  "datas": { 
    "L": [
      { "S": "28/01/2026 (quarta-feira)" },
      { "S": "29/01/2026 (quinta-feira)" },
      { "S": "02/02/2026 (segunda-feira)" },
      { "S": "05/02/2026 (quinta-feira)" },
      { "S": "09/02/2026 (segunda-feira)" },
      { "S": "12/02/2026 (quinta-feira)" },
      { "S": "23/02/2026 (segunda-feira)" },
      { "S": "26/02/2026 (quinta-feira)" },
      { "S": "02/03/2026 (segunda-feira)" },
      { "S": "05/03/2026 (quinta-feira)" },
      { "S": "09/03/2026 (segunda-feira)" },
      { "S": "12/03/2026 (quinta-feira)" }
    ]
  },
  "description": { 
    "S": "Curso prático e presencial de 18 horas para quem nunca programou ou deseja revisar fundamentos de lógica e programação. Utilizando Python e o ambiente PyCharm, os alunos vão aprender estrutura sequencial, variáveis, condicionais, laços, listas, funções e pequenos projetos práticos. Tudo com uma didática acessível e acompanhamento próximo do professor." 
  },
  "duration": { "S": "24 horas (12 encontros)" },
  "faq": { "L": [...] },
  "horario": { "S": "19h00 - 21h00" },
  "imageUrl": { "S": "/coursecard-progdozero.png" },
  "linkedin": { "S": "https://www.linkedin.com/in/kelson-almeida/" },
  "modalidade": { "S": "PRESENCIAL" },
  "modulos": { "L": [...] },
  "obsPrice": { "S": "PREÇO PROMOCIONAL!" },
  "oQueVaiAprender": { "L": [...] },
  "prerequisitos": { "L": [...] },
  "price": { "S": "R$399,99" },
  "professor": { "S": "Kelson Almeida" },
  "profFoto": { "S": "/professores/kelson.jpeg" },
  "publicoAlvo": { "L": [...] },
  "title": { "S": "Curso Programação para Iniciantes (Turma 02)" },
  "video": { "S": "8.mp4" },
  
  "technologiaIcone": { "S": "python" },
  "bgGradient": { "S": "blue-purple" },
  "descricaoCurta": { "S": "Aprenda programação do zero com Python em 24 horas" }
}
```

---

## 🎨 Resultado Visual

### Com os novos atributos, o card será gerado assim:

```
┌─────────────────────────────────────┐
│ ╔═══════════════════════════════╗   │
│ ║   🐍                          ║   │ ← Ícone Python (technologiaIcone)
│ ║                               ║   │
│ ║   Gradiente Azul → Roxo       ║   │ ← Gradiente (bgGradient)
│ ║                               ║   │
│ ║   👤 Prof. Kelson             ║   │ ← Foto do professor (profFoto)
│ ╚═══════════════════════════════╝   │
│                                     │
│ [PRESENCIAL]                        │ ← Badge modalidade
│                                     │
│ Curso Programação para Iniciantes   │ ← Título
│ (Turma 02)                          │
│                                     │
│ Aprenda programação do zero com     │ ← descricaoCurta
│ Python em 24 horas                  │
│                                     │
│ 📅 12 encontros                     │ ← Calculado de datas.length
│ 🕐 19h00 - 21h00                    │ ← horario
│                                     │
│ [Ver Detalhes →]                    │ ← Botão
└─────────────────────────────────────┘
```

---

## 🔄 Migração Gradual

### Cursos Antigos (mantém imageUrl)
✅ Continuam funcionando normalmente  
✅ Usam o card estático com PNG  
✅ Não precisa alterar nada  

### Novos Cursos (adiciona 3 atributos)
✅ Adicione `technologiaIcone`  
✅ Adicione `bgGradient`  
✅ Adicione `descricaoCurta`  
✅ Card dinâmico será gerado automaticamente  

### Quando Quiser Migrar Curso Antigo
1. Adicione os 3 novos atributos
2. O card passa a ser dinâmico automaticamente
3. Pode manter ou remover o `imageUrl` (não faz diferença)

---

## 🎯 Sugestões de Atributos por Curso Existente

### React Native
```json
"technologiaIcone": { "S": "reactnative" }
"bgGradient": { "S": "blue-cyan" }
"descricaoCurta": { "S": "Crie apps mobile com React Native e TypeScript" }
```

### AppSec
```json
"technologiaIcone": { "S": "security" }
"bgGradient": { "S": "orange-red" }
"descricaoCurta": { "S": "Proteja suas aplicações contra vulnerabilidades web" }
```

### Amazing Data
```json
"technologiaIcone": { "S": "data" }
"bgGradient": { "S": "sunset" }
"descricaoCurta": { "S": "Análise de dados e visualizações com Python" }
```

### Java Starter
```json
"technologiaIcone": { "S": "java" }
"bgGradient": { "S": "emerald" }
"descricaoCurta": { "S": "Fundamentos de Java e Programação Orientada a Objetos" }
```

### Fullstack 05
```json
"technologiaIcone": { "S": "fullstack" }
"bgGradient": { "S": "purple-pink" }
"descricaoCurta": { "S": "Do zero ao deploy: React, Node.js e MongoDB" }
```

### Go Developer
```json
"technologiaIcone": { "S": "go" }
"bgGradient": { "S": "ocean" }
"descricaoCurta": { "S": "Aprenda Go/Golang para backend performático" }
```

### Microservices
```json
"technologiaIcone": { "S": "microservices" }
"bgGradient": { "S": "dark-blue" }
"descricaoCurta": { "S": "Arquitetura de microsserviços com Spring Boot" }
```

### N8N
```json
"technologiaIcone": { "S": "n8n" }
"bgGradient": { "S": "pink-purple" }
"descricaoCurta": { "S": "Automação de workflows sem código com N8N" }
```

### SQL do Zero
```json
"technologiaIcone": { "S": "sql" }
"bgGradient": { "S": "forest" }
"descricaoCurta": { "S": "Domine bancos de dados relacionais e SQL" }
```

### QA Zero
```json
"technologiaIcone": { "S": "qa" }
"bgGradient": { "S": "green-teal" }
"descricaoCurta": { "S": "Testes de software: manual e automatizado" }
```

---

**Dica:** Você pode começar testando com apenas um curso novo antes de migrar todos!
