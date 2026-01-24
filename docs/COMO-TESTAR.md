# 🧪 Como Testar o Card Dinâmico

## 1️⃣ Visualizar no Ambiente Local

### Opção A: Usando Mock (RECOMENDADO para teste rápido)

Um curso de exemplo já foi adicionado em `src/mocks/courses.ts` com ID 999.

Para visualizar:

```bash
cd programa-ai
npm run dev
```

Depois acesse:
- **Lista de cursos:** `http://localhost:5173/cursos`
- **Home:** `http://localhost:5173` (seção de cursos)

O card de teste aparecerá no topo da lista com:
- 🐍 Ícone do Python
- Gradiente azul → roxo
- Foto do Professor Kelson
- Layout moderno

### Opção B: Testando com API Real

Se preferir testar com dados reais do DynamoDB:

1. Adicione os 3 novos atributos em um curso na tabela DynamoDB:

```json
"technologiaIcone": { "S": "python" },
"bgGradient": { "S": "blue-purple" },
"descricaoCurta": { "S": "Aprenda programação do zero com Python" }
```

2. Execute o projeto:

```bash
npm run dev
```

3. Acesse `/cursos` e veja o card dinâmico em ação!

---

## 2️⃣ Testar Diferentes Combinações

### No arquivo `src/mocks/courses.ts`, altere o curso ID 999:

#### Teste 1: React Native
```typescript
technologiaIcone: "reactnative",
bgGradient: "blue-cyan",
descricaoCurta: "Crie apps mobile com React Native",
```

#### Teste 2: Segurança
```typescript
technologiaIcone: "security",
bgGradient: "orange-red",
descricaoCurta: "Proteja suas aplicações contra vulnerabilidades",
```

#### Teste 3: Data Science
```typescript
technologiaIcone: "data",
bgGradient: "sunset",
descricaoCurta: "Análise de dados e visualizações com Python",
```

#### Teste 4: Fullstack
```typescript
technologiaIcone: "fullstack",
bgGradient: "purple-pink",
descricaoCurta: "Do zero ao deploy: React e Node.js",
```

---

## 3️⃣ Comparar Card Estático vs Dinâmico

No arquivo `src/mocks/courses.ts`:

1. **Curso ID 5** (React Native) → Card ESTÁTICO (tem `imageUrl`, sem `technologiaIcone`)
2. **Curso ID 999** (Python) → Card DINÂMICO (tem `technologiaIcone`)

Observe as diferenças lado a lado em `/cursos`.

---

## 4️⃣ Remover o Curso de Teste

Quando terminar de testar, remova o curso ID 999 do arquivo `src/mocks/courses.ts`:

```typescript
export const courses: Course[] = [
  // REMOVA ou COMENTE este bloco inteiro:
  /*
  {
    id: 999,
    title: "Curso Programação para Iniciantes com Python - TESTE CARD DINÂMICO",
    ...
  },
  */
  {
    id: 5,
    title: "Bootcamp: Meu Primeiro App...",
    ...
  },
  // resto dos cursos
]
```

---

## 5️⃣ Checklist de Teste

- [ ] Card dinâmico aparece corretamente na lista `/cursos`
- [ ] Gradiente de fundo está bonito
- [ ] Ícone da tecnologia aparece (🐍 para Python)
- [ ] Foto do professor carrega corretamente
- [ ] Descrição curta está legível (não cortada)
- [ ] Hover effect funciona (card levanta ao passar mouse)
- [ ] Botão "Ver Detalhes" funciona
- [ ] Card é responsivo (testar em mobile)
- [ ] Cursos antigos (com imageUrl) continuam funcionando

---

## 6️⃣ Testar em Mobile

1. Execute o projeto: `npm run dev`
2. Acesse pelo celular: `http://SEU-IP-LOCAL:5173/cursos`
3. Verifique se o card fica bonito no mobile

**Encontrar seu IP:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

---

## 🐛 Solução de Problemas

### Card não aparece como dinâmico?
✅ Verifique se o curso tem `technologiaIcone` OU `bgGradient`

### Foto do professor não carrega?
✅ Verifique se o caminho em `profFoto` está correto: `/professores/kelson.jpeg`

### Ícone não aparece?
✅ Verifique se o valor de `technologiaIcone` está na lista disponível (ver QUICKSTART)

### Gradiente não aparece?
✅ Verifique se o valor de `bgGradient` está na lista disponível

### Console mostra erros?
✅ Abra DevTools (F12) e veja os erros no Console

---

## 📸 Tirar Screenshots

Para documentação ou apresentação:

1. Acesse `/cursos`
2. Abra DevTools (F12)
3. Clique em "Toggle device toolbar" (Ctrl+Shift+M)
4. Selecione "iPhone 12 Pro" ou "iPad"
5. Tire screenshots comparando cards estáticos vs dinâmicos

---

## ✅ Após Confirmar que Está Funcionando

1. Remova o curso de teste ID 999 do mock
2. Adicione os 3 atributos no DynamoDB para seus cursos reais
3. Deploy e aproveite! 🚀

---

**Dica:** Comece testando com apenas 1 curso antes de migrar todos!
