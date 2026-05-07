# AI_WORKFLOW.md — Pipeline de Trabalho com IA

> **Objetivo:** evitar que a IA "meta 60kg de beterraba" no projeto.
> Esse arquivo define o protocolo obrigatório que a IA deve seguir antes, durante e depois de cada feature.

---

## 1. Princípios Fundamentais

1. **A documentação é a fonte da verdade.** Código que diverge da documentação é bug.
2. **Pequeno e incremental ganha de grande e perfeito.** PRs de até ~300 linhas. Uma feature por PR.
3. **Não inventar.** Se a especificação não cobre, perguntar ao humano antes de codar.
4. **Espelhar o diagrama.** Estrutura de pastas, nomes de classes, e relações DEVEM bater com os diagramas.
5. **Auto-verificação obrigatória** ao final de cada feature (checklist na seção 5).

---

## 2. Ordem de Leitura Obrigatória (antes de QUALQUER alteração)

Toda IA, antes de escrever uma única linha, lê **nesta ordem**:

1. `PROJETO.md` — pra entender contexto, stack, estrutura e regras
2. `AI_WORKFLOW.md` — esse arquivo (pra lembrar do protocolo)
3. `docs/arquitetura.pdf` — só se a feature mexer com algo não claro no PROJETO.md
4. **Caso de uso correspondente** (UC001-UC007) na documentação
5. Arquivos relacionados que já existem (ex: se vai criar `SessaoController`, ler `AuthController` pra seguir o padrão)

**Se não tem caso de uso pra feature pedida, PARAR e perguntar.** Não inventar funcionalidade.

---

## 3. Padrões de Código

### 3.1 Estrutura de uma rota (backend)
```
Controller (recebe req)
  → valida com Zod (middleware)
  → chama Service
    → aplica regras de negócio
    → chama Prisma
  → retorna resposta padronizada
```

### 3.2 Resposta padronizada da API
```typescript
// Sucesso
{ success: true, data: <payload> }

// Erro
{ success: false, error: { code: "RN06_SESSAO_ENCERRADA", message: "..." } }
```

### 3.3 Princípios aplicados (light, sem religião)
- **DRY:** evitar duplicação. Lógica de RN sempre em service, nunca repetir em controller.
- **KISS:** preferir solução simples e legível. Nada de abstração prematura.
- **SoC (Separation of Concerns):** Controller não fala com Prisma. Service não devolve `Response`.
- **Nomes em português** pra entidades/regras de negócio (ex: `Presenca`, `Turma`).
  Nomes em inglês pra código técnico (ex: `validateBody`, `errorHandler`).

### 3.4 O que NUNCA fazer
- ❌ Acessar `process.env` fora de `config/env.ts`
- ❌ Usar `any` no TypeScript (`unknown` se precisar mesmo)
- ❌ Console.log esquecido em código de produção (use `logger`)
- ❌ Comparar senha em texto puro (sempre `bcrypt.compare`)
- ❌ Confiar em dados do client sem validar com Zod
- ❌ Esquecer middleware `rbac()` em rota protegida
- ❌ Criar nova dependência sem avisar/justificar

---

## 4. Workflow de Implementação de uma Feature

```
┌─────────────────────────────────────────────────────────┐
│ 1. LEITURA                                              │
│    Ler PROJETO.md + AI_WORKFLOW.md + UC correspondente  │
├─────────────────────────────────────────────────────────┤
│ 2. PLANEJAMENTO                                         │
│    Listar:                                              │
│    - Quais arquivos vou criar/modificar?                │
│    - Quais RNs aplicam?                                 │
│    - Tem teste pra escrever?                            │
│    - Algum endpoint novo? Atualizar PROJETO.md          │
├─────────────────────────────────────────────────────────┤
│ 3. IMPLEMENTAÇÃO                                        │
│    Branch: feature/<nome-curto>                         │
│    Commits pequenos, mensagens descritivas              │
│    Backend antes do frontend (contrato definido antes)  │
├─────────────────────────────────────────────────────────┤
│ 4. AUTO-CHECKLIST (seção 5)                             │
│    Não abrir PR antes de passar em todos os itens       │
├─────────────────────────────────────────────────────────┤
│ 5. PR + CI                                              │
│    Push, abrir PR, esperar CI verde                     │
│    Reviewer humano: validar e mergear                   │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Checklist Anti-Beterraba (auto-verificação)

Antes de marcar uma feature como pronta, a IA precisa responder **em texto** estas perguntas no PR:

### Sobre escopo
- [ ] Qual caso de uso (UC00X) essa feature implementa?
- [ ] Quais regras de negócio (RNxx) ela atende?
- [ ] Algo foi implementado que não está documentado? → Justificar ou remover.

### Sobre estrutura
- [ ] Algum arquivo foi criado fora da estrutura definida no PROJETO.md? → Justificar.
- [ ] Adicionou nova dependência (npm)? → Por quê? É realmente necessária?
- [ ] Alguma alteração de schema do Prisma? → Migration foi gerada?

### Sobre qualidade
- [ ] Validação Zod em toda entrada de dados?
- [ ] Middleware `rbac()` em todas as rotas protegidas?
- [ ] Tratamento de erros com retorno padronizado?
- [ ] Pelo menos 1 teste positivo + 1 negativo pra cada RN tocada?
- [ ] CI rodando local antes de pushar (`npm run lint && npm test && npm run build`)?

### Sobre integração
- [ ] Frontend espelha os DTOs do backend? (sem types divergentes)
- [ ] Eventos Socket.IO (se tocou): documentados no PROJETO.md?

**Se algum item ficou em branco ou "depois eu faço", a feature NÃO está pronta. Voltar e ajustar.**

---

## 6. Convenções de Git

### Branches
- `main` — só recebe merge via PR aprovado e CI verde. Reflete produção.
- `develop` — integração contínua. Receber PRs de features.
- `feature/<nome>` — uma feature por branch. Ex: `feature/auth-login`.
- `fix/<nome>` — correções pontuais.

### Commits (Conventional Commits, simplificado)
```
feat: adiciona endpoint de login
fix: corrige validação de janela de tempo (RN01)
docs: atualiza endpoints no PROJETO.md
test: adiciona testes de PresencaService (RN10)
chore: configura ESLint
refactor: extrai lógica de auditoria pra service
```

### Pull Requests
Template:
```markdown
## O que faz
[descrição curta]

## Casos de uso / RNs
- UC00X
- RN0X, RN0Y

## Como testar
1. ...
2. ...

## Checklist
[copiar checklist da seção 5 e marcar]
```

---

## 7. Pipeline de CI (GitHub Actions)

Configurado em `.github/workflows/ci.yml`. Roda em todo PR pra `main` e `develop`:

1. Setup Node 20
2. Instalar dependências (frontend e backend)
3. Lint (ESLint + TypeScript check)
4. Build (frontend e backend)
5. Testes (Vitest)

**Merge bloqueado se qualquer etapa falhar.** Sem exceção.

---

## 8. Quando a IA Deve PARAR e Perguntar

A IA **não pode** prosseguir sozinha quando:

1. A feature pedida não tem caso de uso correspondente
2. A regra de negócio é ambígua ou contradiz outra
3. Vai precisar adicionar uma biblioteca pesada (>500kb)
4. Vai precisar criar uma estrutura de pastas/módulo novo
5. O usuário pediu algo que conflita com a documentação
6. O escopo do PR está crescendo demais (>500 linhas)

Em qualquer um desses casos: **PARAR. Resumir a dúvida em 3-5 linhas. Pedir input.**

---

## 9. Anti-Padrões Conhecidos da IA (que vamos evitar)

| Anti-padrão | Como evitar |
|---|---|
| Inventar campos no banco "pra ficar mais completo" | Schema só do que está no Diagrama de Classes |
| Adicionar `react-query`, `redux`, `zustand` sem necessidade | Estado simples? `useState`. Estado global? `Context`. Só. |
| Criar tela "extra" não documentada | Só telas que mapeiam pra um caso de uso |
| Usar emojis e bordas coloridas no código | Comentário sucinto é suficiente |
| Try/catch genérico que engole erro | Erro tipado, logado, e retornado com código |
| Refatoração massiva sem motivo | Refatorar só quando há dor real |
| Sobrescrever arquivo grande sem ler antes | Sempre `view` antes de `str_replace`/`create_file` |

---

## 10. Resumo em Uma Frase

> **Lê a doc, segue a estrutura, valida tudo, testa as regras de negócio, pergunta quando duvidar, e abre PRs pequenos.**
