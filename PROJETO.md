# RUTh — Sistema de Chamada Interativa

> Documento mestre do projeto. **Leitura obrigatória** antes de qualquer alteração de código.
> Última atualização: 2026-05-07

---

## 1. Visão Geral

**RUTh** é um sistema web para registro de presença em aulas/treinamentos com validação em
tempo real via interações (perguntas/enquetes). Substitui a chamada manual por uma sessão
controlada pelo professor com janela de tempo, código de entrada e check-in confirmado por
resposta a uma pergunta.

**Trabalho final** da disciplina de Arquitetura de Software. A documentação completa
(descrição, requisitos, casos de uso, diagramas) é a fonte da verdade. O código deve
**refletir 1:1** o que está documentado.

---

## 2. Atores e Perfis (RBAC)

| Perfil | Pode fazer |
|---|---|
| **Aluno** (`U`) | Login, entrar em sessão (via código), check-in, responder interação, consultar próprias presenças |
| **Professor** (`P`) | Login, criar/encerrar sessão, disparar interações, acompanhar presenças em tempo real, gerar relatórios da própria turma |
| **Admin** (`A`) | Tudo do Professor + gerenciar usuários, turmas, parâmetros e revisar logs de auditoria |

**Regra de ouro:** toda rota (REST e Socket) é validada por perfil. Sem exceção.

---

## 3. Stack Tecnológica

### Frontend (`/frontend`)
- React 18 + Vite + TypeScript
- Tailwind CSS (estilização)
- React Router (navegação)
- Socket.IO Client (tempo real)
- Axios (HTTP)
- Zod (validação de formulários)
- lucide-react (ícones)

### Backend (`/backend`)
- Node.js LTS + Express + TypeScript
- Prisma ORM + MySQL
- Socket.IO (servidor)
- jsonwebtoken (JWT) + bcryptjs (hash de senha)
- Zod (validação de payload)
- pdfkit + csv-stringify (exportações)
- Vitest (testes)

### Infra (decidida)
- **GitHub** — repo + Actions pra CI
- **Vercel** — deploy do frontend
- **Render** (free tier) — deploy do backend (web service)
- **TiDB Cloud** (free Developer Tier) — MySQL gerenciado, compatível com Prisma

> **Nota sobre o banco:** o Render free tier não oferece MySQL gerenciado, apenas Postgres
> (com expiração de 30 dias). Como nossa documentação especifica MySQL (RNFT 02), usamos
> TiDB Cloud — banco serverless 100% compatível com MySQL, com tier gratuito permanente
> e suporte a SSL out of the box.

---

## 4. Estrutura do Repositório

```
ruth/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Lint + build + test em todo PR
├── docs/
│   ├── arquitetura.pdf               # Documentação original do trabalho
│   └── diagramas/                    # PNGs dos diagramas
├── frontend/                         # (a ser implementado)
├── backend/
│   ├── src/
│   │   ├── config/                   # env, prisma client
│   │   ├── controllers/              # AuthController, ...
│   │   ├── middleware/               # auth, rbac, validate, errorHandler
│   │   ├── routes/                   # auth.routes.ts, ...
│   │   ├── services/                 # AuthService, AuditoriaService, ...
│   │   ├── sockets/                  # handlers Socket.IO
│   │   ├── types/                    # tipos compartilhados
│   │   ├── utils/                    # jwt, password, errors, apiResponse
│   │   ├── app.ts                    # configuração Express
│   │   └── server.ts                 # entry point
│   ├── prisma/
│   │   ├── schema.prisma             # modelo de dados (10 entidades)
│   │   └── seed.ts                   # admin inicial + parâmetros
│   ├── tests/                        # Vitest
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── PROJETO.md                        # Este arquivo
├── AI_WORKFLOW.md                    # Pipeline de trabalho com IA
├── README.md                         # Setup, como rodar, link do deploy
└── .gitignore
```

**Regra:** nada de criar pasta nova fora dessa estrutura sem atualizar este documento primeiro.

---

## 5. Modelo de Dados (Prisma)

Espelha o **Diagrama de Classes Persistentes** (Figura 8 da documentação).

Entidades em `backend/prisma/schema.prisma`:
- `Usuario` (id, nome, email, login, senha, tipo[A|P|U], status[A|B], matricula, criadoEm)
- `Turma` (id, nome, periodo, disciplina, professorId)
- `Matricula` — N:N entre Aluno e Turma
- `SessaoChamada` (id, turmaId, professorId, dataAbertura, dataEncerramento, janelaMin, status, codigo)
- `Presenca` (id, sessaoId, alunoId, marcadoEm, validacao, atrasoMin, status, ip, dispositivo)
- `Pergunta` (id, sessaoId, tipo[MULTIPLA|VF|ENQUETE|TEXTO], enunciado, ativa)
- `OpcaoPergunta` (id, perguntaId, descricao, correta)
- `Resposta` (id, perguntaId, alunoId, opcaoId, textoLivre, respondidoEm, correta)
- `Parametro` (id, chave, descricao, valor, tipo, ativo)
- `AuditoriaLog` (id, usuarioId, acao, entidade, dataEvento, detalhes, ip)

**Senhas:** sempre bcrypt com `BCRYPT_SALT_ROUNDS = 10`. Nunca em texto puro.

**Constraints relevantes:**
- `Presenca @@unique([sessaoId, alunoId])` — atende RN10
- `Resposta @@unique([perguntaId, alunoId])` — aluno só responde 1x
- `Usuario.email` e `Usuario.login` únicos
- `SessaoChamada.codigo` único

---

## 6. Regras de Negócio (do documento, RN01-RN11)

| Código | Regra | Onde aplicar |
|---|---|---|
| RN01 | Presença válida só dentro da janela de tempo | `PresencaService.registrar` |
| RN02 | Tolerância de atraso por parâmetro | `PresencaService.registrar` |
| RN03 | Resposta à interação confirma/invalida presença | `InteracaoService.registrarResposta` |
| RN04 | Percentual mínimo de presença pra aprovação | `RelatorioService.calcularStatus` |
| RN05 | RBAC — só perfil autorizado acessa | Middleware `rbac()` em todas as rotas |
| RN06 | Sessão encerrada não aceita novas presenças | `PresencaService.registrar` |
| RN07 | Relatórios só de sessões encerradas | `RelatorioService.gerar` |
| RN08 | Tentativas de login negadas vão pra auditoria | `AuthService.login` ✅ implementado |
| RN09 | Janela de tempo definida pelo professor | `SessaoService.criar` |
| RN10 | Aluno só registra presença 1x por sessão | constraint `@@unique` no Prisma ✅ |
| RN11 | Aluno só registra presença em turma matriculada | `PresencaService.registrar` |

**Toda regra de negócio é coberta por pelo menos um teste em Vitest** (positivo + negativo).

---

## 7. Endpoints REST

### Já implementados
```
POST   /api/auth/login                 → { token, usuario }
GET    /api/auth/me                    → { user }   [autenticado]
GET    /api/health                     → status
```

### A implementar (próximos PRs)
```
POST   /api/auth/recuperar             → envia link/token de reset
POST   /api/auth/redefinir             → aplica nova senha

GET    /api/usuarios                   [Admin]
POST   /api/usuarios                   [Admin]
PUT    /api/usuarios/:id               [Admin]
DELETE /api/usuarios/:id               [Admin]
POST   /api/usuarios/importar-csv      [Admin]

GET    /api/turmas                     [Admin, Professor]
POST   /api/turmas                     [Admin]
PUT    /api/turmas/:id                 [Admin]

POST   /api/sessoes                    [Professor]   → cria sessão, retorna código
PUT    /api/sessoes/:id/encerrar       [Professor]
GET    /api/sessoes/:id                [Professor, Aluno*]
POST   /api/sessoes/entrar             [Aluno]       → body: { codigo }
POST   /api/sessoes/:id/checkin        [Aluno]

POST   /api/sessoes/:id/perguntas      [Professor]   → dispara interação
POST   /api/perguntas/:id/responder    [Aluno]

GET    /api/relatorios                 [Admin, Professor, Aluno*]
GET    /api/relatorios/exportar        [Admin, Professor]   → ?formato=pdf|csv

GET    /api/parametros                 [Admin]
PUT    /api/parametros/:id             [Admin]

GET    /api/auditoria                  [Admin]
```

\* Aluno só vê o que é dele.

### Padrão de resposta
```ts
// Sucesso
{ "success": true, "data": <payload> }

// Erro
{ "success": false, "error": { "code": "RN06_VIOLATION", "message": "...", "details": ... } }
```

---

## 8. Eventos Socket.IO

Namespace: `/sessao` (a implementar)

| Evento | Direção | Payload |
|---|---|---|
| `sessao:join` | client→server | `{ sessaoId, token }` |
| `sessao:presenca-nova` | server→client | `{ alunoId, nome, marcadoEm }` |
| `sessao:pergunta-disparada` | server→client | `{ pergunta, opcoes, ativa }` |
| `sessao:resposta-recebida` | server→client | `{ alunoId, opcaoId }` |
| `sessao:encerrada` | server→client | `{ sessaoId, encerradaEm }` |

**Autenticação do socket:** mesmo JWT da API, validado no handshake.

---

## 9. Variáveis de Ambiente

**Backend** (ver `.env.example`):
```
DATABASE_URL=mysql://user:pass@host:port/ruthdb?sslaccept=strict
JWT_SECRET=<openssl rand -hex 32>
JWT_EXPIRES_IN=8h
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://ruth.vercel.app
BCRYPT_SALT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_MINUTES=15
ADMIN_EMAIL=admin@ruth.local
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador
```

**Frontend**:
```
VITE_API_URL=https://ruth-api.onrender.com
VITE_SOCKET_URL=https://ruth-api.onrender.com
```

---

## 10. Setup Local

```bash
# 1. Clonar e entrar
git clone <repo>
cd ruth/backend

# 2. Instalar
npm install

# 3. Subir MySQL local (Docker)
docker run -d --name ruth-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=ruthdb \
  -p 3306:3306 mysql:8

# 4. Configurar env
cp .env.example .env
# editar JWT_SECRET com: openssl rand -hex 32

# 5. Migrar e popular (só admin)
npx prisma migrate dev --name init
npx prisma db seed

# 6. Rodar
npm run dev
# → http://localhost:3001
# → http://localhost:3001/api/health
```

**Login inicial:** `admin@ruth.local` / `admin123` (mudar em produção via env vars).

A partir do admin, cadastrar manualmente via UI: professores → turmas → alunos.

---

## 11. Cronograma do Trabalho

| Aula | Data | Entrega |
|---|---|---|
| 12 | 07/05 | Início da implementação ✅ |
| 13 | 14/05 | Continuidade |
| 14 | 21/05 | **Entrega 4: link do repo + link do projeto web** |
| 15 | 28/05 | Socialização (10min apresentação) |
| 16 | 11/06 | **Entrega 5: MVP final com ajustes da socialização** |

**Marcos internos do grupo:**
- 14/05: Auth + criação de sessão + check-in funcionando local
- 18/05: Real-time + interações + deploy preliminar
- 21/05: Relatórios + polimento + entrega 4
- 04/06: Ajustes da apresentação + correções de bugs
- 11/06: Entrega final

---

## 12. Definição de Pronto (DoD)

Uma feature só é considerada "pronta" quando:

- [ ] Implementada conforme caso de uso correspondente
- [ ] Regras de negócio aplicáveis cobertas
- [ ] Validação de input com Zod
- [ ] Middleware de RBAC aplicado (se rota protegida)
- [ ] Erros tratados (try/catch + retorno padronizado)
- [ ] Pelo menos 1 teste positivo + 1 negativo pra cada RN tocada
- [ ] Funciona em dev local
- [ ] CI verde no PR
- [ ] Atualizado neste documento ou em README se mudou contrato

---

## 13. Equipe

- Alexandre Broering
- Luciano Antonio Spricigo
- Luiz Henrique de Souza
- Ramon Souza dos Santos
- Ryuki Alex Katsurem
