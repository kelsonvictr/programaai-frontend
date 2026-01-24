# 🎨 Course Card Dinâmico - Quick Start

## TL;DR

Para criar um **novo curso com card dinâmico**, adicione 3 atributos no DynamoDB:

```json
{
  "technologiaIcone": { "S": "python" },
  "bgGradient": { "S": "blue-purple" },
  "descricaoCurta": { "S": "Sua descrição curta aqui (max 80 chars)" }
}
```

O card será gerado automaticamente com:
- ✅ Gradiente de fundo bonito
- ✅ Ícone da tecnologia
- ✅ Foto do professor
- ✅ Layout moderno e responsivo

## 🚀 Ícones Disponíveis

| Valor | Emoji | Cor | Uso |
|-------|-------|-----|-----|
| `python` | 🐍 | Azul | Python |
| `javascript` | ⚡ | Amarelo | JavaScript |
| `typescript` | 📘 | Azul | TypeScript |
| `react` | ⚛️ | Azul | React |
| `reactnative` | 📱 | Azul | React Native |
| `nodejs` | 🟢 | Verde | Node.js |
| `java` | ☕ | Azul | Java |
| `go` | 🐹 | Azul | Go/Golang |
| `kotlin` | 🎯 | Roxo | Kotlin |
| `sql` | 🗄️ | Azul | SQL/Database |
| `docker` | 🐳 | Azul | Docker |
| `aws` | ☁️ | Laranja | AWS |
| `security` | 🔒 | Vermelho | Segurança |
| `fullstack` | 🚀 | Roxo | Fullstack |
| `data` | 📊 | Laranja | Data Science |
| `ai` | 🤖 | Roxo | IA/ML |
| `n8n` | 🔗 | Rosa | N8N |
| `microservices` | 🏗️ | Azul | Microservices |
| `qa` | 🧪 | Verde | Testes/QA |

## 🌈 Gradientes Disponíveis

| Valor | Cores | Preview |
|-------|-------|---------|
| `blue-purple` | Azul → Roxo | 🟦🟪 |
| `green-teal` | Verde → Verde-água | 🟩🟦 |
| `orange-red` | Laranja → Vermelho | 🟧🟥 |
| `pink-purple` | Rosa → Roxo | 🩷🟪 |
| `blue-cyan` | Azul escuro → Ciano | 🔵🔷 |
| `purple-pink` | Roxo → Rosa | 🟪🩷 |
| `dark-blue` | Azul escuro degradê | 🌊 |
| `emerald` | Esmeralda → Verde | 💚🟢 |
| `sunset` | Rosa → Amarelo | 🌅 |
| `ocean` | Azul marinho → Ciano | 🌊 |
| `fire` | Vermelho → Amarelo | 🔥 |
| `forest` | Verde escuro → Verde claro | 🌲 |

## 📋 Template Completo

```json
{
  "id": { "S": "NUMERO_DO_CURSO" },
  "ativo": { "BOOL": true },
  "title": { "S": "Nome do Curso" },
  "description": { "S": "Descrição longa do curso..." },
  "descricaoCurta": { "S": "Descrição curta para o card (max 80)" },
  "professor": { "S": "Nome do Professor" },
  "profFoto": { "S": "/professores/nome.jpeg" },
  "modalidade": { "S": "PRESENCIAL" },
  "horario": { "S": "19h00 - 21h00" },
  "duration": { "S": "20 horas" },
  "price": { "S": "R$499,99" },
  "linkedin": { "S": "https://linkedin.com/in/..." },
  "datas": { "L": [ { "S": "28/01/2026 (quarta-feira)" } ] },
  "bannerSite": { "S": "/banners/banner-site-curso.png" },
  "bannerMobile": { "S": "/banners/banner-mobile-curso.png" },
  "bio": { "S": "Biografia do professor..." },
  
  "technologiaIcone": { "S": "python" },
  "bgGradient": { "S": "blue-purple" },
  
  "prerequisitos": { "L": [...] },
  "publicoAlvo": { "L": [...] },
  "oQueVaiAprender": { "L": [...] },
  "modulos": { "L": [...] }
}
```

## 🔄 Retrocompatibilidade

**Cursos antigos (com `imageUrl`):** Continuam funcionando com PNG  
**Novos cursos (com `technologiaIcone`):** Usam card dinâmico

Não precisa alterar nada nos cursos existentes!

## 📚 Documentação Completa

- [Guia Completo](./course-card-dinamico.md)
- [Exemplo Programação do Zero](./exemplo-progdozero-dinamico.md)

## 🎯 Exemplos Rápidos

### Curso de Python
```json
"technologiaIcone": { "S": "python" },
"bgGradient": { "S": "blue-purple" },
"descricaoCurta": { "S": "Aprenda Python do zero em 24 horas" }
```

### Curso de React
```json
"technologiaIcone": { "S": "react" },
"bgGradient": { "S": "blue-cyan" },
"descricaoCurta": { "S": "Construa interfaces modernas com React" }
```

### Curso de Segurança
```json
"technologiaIcone": { "S": "security" },
"bgGradient": { "S": "orange-red" },
"descricaoCurta": { "S": "Proteja aplicações contra vulnerabilidades" }
```

---

**Feito!** É só adicionar os 3 atributos e o card dinâmico aparece automaticamente! 🎉
