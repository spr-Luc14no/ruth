# RUTh — Sistema de Chamada Interativa

[![CI](https://github.com/<usuario>/ruth/actions/workflows/ci.yml/badge.svg)](https://github.com/<usuario>/ruth/actions/workflows/ci.yml)

Sistema web para registro de presença em aulas com validação em tempo real via interações
(perguntas/enquetes). Trabalho final da disciplina de **Arquitetura de Software**.

🔗 **Demo:** *[em breve]*
📄 **Documentação:** [`docs/arquitetura.pdf`](./docs/arquitetura.pdf) · [`PROJETO.md`](./PROJETO.md) · [`AI_WORKFLOW.md`](./AI_WORKFLOW.md)

---

## O que faz

O **RUTh** substitui a chamada manual por uma sessão controlada pelo professor:

1. Professor abre uma sessão e gera um **código curto**
2. Aluno entra na sessão usando o código
3. Aluno faz **check-in** dentro da janela de tempo
4. Professor dispara perguntas/enquetes durante a aula
5. Resposta confirma a presença
6. Ao encerrar, sistema gera **relatórios exportáveis (CSV/PDF)**

### Perfis (RBAC)
- **Aluno** — entra em sessões, faz check-in, responde interações
- **Professor** — cria/encerra sessões, dispara interações, vê relatórios da turma
- **Admin** — gerencia usuários, turmas, parâmetros e auditoria

---

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind |
| Backend | Node.js + Express + TypeScript |
| Banco | MySQL + Prisma ORM (TiDB Cloud em produção) |
| Real-time | Socket.IO |
| Auth | JWT + bcryptjs |
| Testes | Vitest |
| CI | GitHub Actions |
| Deploy | Vercel (frontend) + Render (backend) |

---

## Como rodar local

Pré-requisitos: **Node 20+**, **Docker** (pra MySQL local), **npm**.

```bash
# Clonar
git clone <url-do-repo>
cd ruth

# Subir MySQL local
docker run -d --name ruth-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=ruthdb \
  -p 3306:3306 mysql:8

# Backend
cd backend
npm install
cp .env.example .env
# editar JWT_SECRET (gerar com: openssl rand -hex 32)
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
# → http://localhost:3001
# → http://localhost:3001/api/health

# Frontend (em outro terminal — quando estiver pronto)
cd ../frontend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5173
```

### Login inicial (criado pelo seed)
```
Email: admin@ruth.local
Senha: admin123
```

A partir do admin, cadastre manualmente: professores → turmas → alunos.

---

## Testes

```bash
cd backend
npm test          # roda uma vez
npm run test:watch # modo watch
```

---

## Documentos do projeto

- [`PROJETO.md`](./PROJETO.md) — escopo, stack, estrutura, modelo de dados, endpoints
- [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) — protocolo de trabalho com IA
- [`docs/arquitetura.pdf`](./docs/arquitetura.pdf) — documentação acadêmica completa

---

## Equipe

- Alexandre Broering
- Luciano Antonio Spricigo
- Luiz Henrique de Souza
- Ramon Souza dos Santos
- Ryuki Alex Katsurem

---

## Licença

Trabalho acadêmico. Uso educacional.
