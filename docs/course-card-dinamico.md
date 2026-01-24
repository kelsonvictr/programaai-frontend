# 🎨 Course Card Dinâmico - Guia de Uso

## 📋 Visão Geral

O sistema de Course Cards agora suporta **duas versões**:

1. **Card Estático** (padrão): Usa imagem PNG estática (cursos antigos)
2. **Card Dinâmico** (novo): Gerado automaticamente com gradientes e ícones

## 🔄 Detecção Automática

O componente `CourseCard` detecta automaticamente qual versão usar:

- ✅ Se o curso tiver `technologiaIcone` OU `bgGradient` → **Card Dinâmico**
- ❌ Caso contrário → **Card Estático** (imagem PNG)

## 🆕 Novos Atributos no DynamoDB

### Para Novos Cursos (com Card Dinâmico)

Adicione estes 3 novos atributos opcionais ao item do curso:

```json
{
  "technologiaIcone": {
    "S": "python"
  },
  "bgGradient": {
    "S": "blue-purple"
  },
  "descricaoCurta": {
    "S": "Aprenda programação do zero com Python em 24 horas"
  }
}
```

### Descrição dos Atributos

#### 1. `technologiaIcone` (String, opcional)

Ícone da tecnologia principal do curso.

**Valores disponíveis:**
- `python` 🐍 - Azul Python
- `javascript` ⚡ - Amarelo JS
- `typescript` 📘 - Azul TypeScript
- `react` ⚛️ - Azul React
- `reactnative` 📱 - Azul React Native
- `nodejs` 🟢 - Verde Node.js
- `java` ☕ - Azul Java
- `go` 🐹 - Azul Go
- `kotlin` 🎯 - Roxo Kotlin
- `sql` 🗄️ - Azul SQL
- `docker` 🐳 - Azul Docker
- `aws` ☁️ - Laranja AWS
- `security` 🔒 - Vermelho Security
- `fullstack` 🚀 - Roxo Fullstack
- `data` 📊 - Laranja Data Science
- `ai` 🤖 - Roxo IA
- `n8n` 🔗 - Rosa N8N
- `microservices` 🏗️ - Azul Microservices
- `qa` 🧪 - Verde QA
- `default` 💻 - Roxo padrão

#### 2. `bgGradient` (String, opcional)

Gradiente de fundo do card.

**Valores disponíveis:**
- `blue-purple` - Azul → Roxo (padrão)
- `green-teal` - Verde → Verde-água
- `orange-red` - Laranja → Vermelho
- `pink-purple` - Rosa → Roxo
- `blue-cyan` - Azul escuro → Azul claro
- `purple-pink` - Roxo → Rosa
- `dark-blue` - Azul escuro degradê
- `emerald` - Esmeralda → Verde
- `sunset` - Rosa → Amarelo (pôr do sol)
- `ocean` - Azul marinho → Ciano
- `fire` - Vermelho → Amarelo (fogo)
- `forest` - Verde escuro → Verde claro

#### 3. `descricaoCurta` (String, opcional)

Descrição resumida do curso para exibição no card.

- **Tamanho recomendado:** até 80 caracteres
- **Uso:** Se não for fornecida, usa os primeiros 80 chars do campo `description`

## 📝 Exemplos Práticos

### Exemplo 1: Curso de Python

```json
{
  "id": { "S": "10" },
  "title": { "S": "Curso Programação para Iniciantes (Turma 02)" },
  "technologiaIcone": { "S": "python" },
  "bgGradient": { "S": "blue-purple" },
  "descricaoCurta": { "S": "Aprenda programação do zero com Python em 24 horas" },
  "professor": { "S": "Kelson Almeida" },
  "profFoto": { "S": "/professores/kelson.jpeg" },
  "modalidade": { "S": "PRESENCIAL" },
  "horario": { "S": "19h00 - 21h00" },
  "datas": { "L": [...] }
  // ... outros campos obrigatórios
}
```

**Resultado:** Card com gradiente azul-roxo, ícone 🐍 de Python, foto do professor

---

### Exemplo 2: Curso de React Native

```json
{
  "id": { "S": "11" },
  "title": { "S": "Bootcamp React Native para Iniciantes" },
  "technologiaIcone": { "S": "reactnative" },
  "bgGradient": { "S": "blue-cyan" },
  "descricaoCurta": { "S": "Crie apps mobile do zero com React Native e TypeScript" },
  "professor": { "S": "Kelson Almeida" },
  "profFoto": { "S": "/professores/kelson.jpeg" }
  // ... outros campos
}
```

**Resultado:** Card com gradiente azul-ciano, ícone 📱 de React Native

---

### Exemplo 3: Curso de Segurança

```json
{
  "id": { "S": "12" },
  "title": { "S": "AppSec - Segurança em Aplicações" },
  "technologiaIcone": { "S": "security" },
  "bgGradient": { "S": "orange-red" },
  "descricaoCurta": { "S": "Aprenda a proteger suas aplicações contra vulnerabilidades" }
  // ... outros campos
}
```

**Resultado:** Card com gradiente laranja-vermelho, ícone 🔒 de Security

---

### Exemplo 4: Curso Antigo (Sem Novos Atributos)

```json
{
  "id": { "S": "5" },
  "title": { "S": "Curso React Native Antigo" },
  "imageUrl": { "S": "/coursecard-reactnative.png" },
  "professor": { "S": "Kelson Almeida" }
  // NÃO tem technologiaIcone nem bgGradient
}
```

**Resultado:** Card estático com imagem PNG (comportamento antigo mantido)

## 🎨 Sugestões de Combinações

### Cursos de Backend
```
technologiaIcone: "nodejs"
bgGradient: "emerald"
```

### Cursos de Frontend
```
technologiaIcone: "react"
bgGradient: "blue-cyan"
```

### Cursos de Dados/IA
```
technologiaIcone: "data" ou "ai"
bgGradient: "sunset" ou "purple-pink"
```

### Cursos de DevOps
```
technologiaIcone: "docker" ou "aws"
bgGradient: "dark-blue" ou "ocean"
```

### Cursos Fullstack
```
technologiaIcone: "fullstack"
bgGradient: "blue-purple"
```

## ✅ Checklist para Adicionar Novo Curso

- [ ] Adicionar item na tabela DynamoDB
- [ ] Incluir `technologiaIcone` com tecnologia apropriada
- [ ] Incluir `bgGradient` com gradiente bonito
- [ ] Incluir `descricaoCurta` com resumo de até 80 chars
- [ ] Garantir que `profFoto` aponta para foto existente em `/professores/`
- [ ] Testar no ambiente local

## 🔧 Para Desenvolvedores

### Adicionar Novo Ícone de Tecnologia

Edite: `src/config/courseVisuals.ts`

```typescript
export const TECH_ICONS: Record<string, TechIcon> = {
  // ... existentes
  minhatecnologia: { icon: '🎯', color: '#ff6b6b' },
}
```

### Adicionar Novo Gradiente

Edite: `src/config/courseVisuals.ts`

```typescript
export const BG_GRADIENTS: Record<string, string> = {
  // ... existentes
  'meugradiente': 'linear-gradient(135deg, #cor1 0%, #cor2 100%)',
}
```

## 📸 Visual Comparativo

### Card Estático (Antigo)
- Usa imagem PNG pré-criada
- Tamanho fixo da imagem
- Não responsivo ao tema

### Card Dinâmico (Novo)
- Gerado via CSS/React
- Totalmente responsivo
- Animações suaves
- Ícone da tecnologia visível
- Foto do professor integrada
- Gradiente customizável
- Performance melhor (sem PNG pesado)

## 🚀 Vantagens do Card Dinâmico

1. **Sem design manual**: Não precisa criar PNGs no Photoshop/Figma
2. **Consistência**: Todos os cards seguem o mesmo padrão visual
3. **Manutenção**: Atualizar layout é global, não arquivo por arquivo
4. **Performance**: Gradientes CSS são mais leves que imagens
5. **Acessibilidade**: Melhor suporte a screen readers
6. **Responsividade**: Adapta-se automaticamente a diferentes telas

---

**Criado em:** 23/01/2026  
**Última atualização:** 23/01/2026
