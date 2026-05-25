import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Iniciando seed...');
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const hash = (s: string) => bcrypt.hash(s, saltRounds);

  const admin = await prisma.usuario.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? 'admin@ruth.local' },
    update: {},
    create: {
      nome: process.env.ADMIN_NAME ?? 'Administrador',
      email: process.env.ADMIN_EMAIL ?? 'admin@ruth.local',
      login: 'admin',
      senha: await hash(process.env.ADMIN_PASSWORD ?? 'admin123'),
      tipo: 'A', status: 'A',
    },
  });
  console.info(`✓ Admin: ${admin.login}`);

  const moacir = await prisma.usuario.upsert({
    where: { email: 'moacir@ruth.local' },
    update: {},
    create: {
      nome: 'Moacir Solano Kichel', email: 'moacir@ruth.local', login: 'moacir',
      senha: await hash('prof123'), tipo: 'P', status: 'A',
    },
  });
  console.info(`✓ Professor: ${moacir.login}`);

  const alunosData = [
    { nome: 'Ramon Souza dos Santos', login: 'ramon', email: 'ramon@ruth.local', matricula: '2026001' },
    { nome: 'Alexandre Broering', login: 'alexandre', email: 'alexandre@ruth.local', matricula: '2026002' },
    { nome: 'Luiz Henrique de Souza', login: 'luiz', email: 'luiz@ruth.local', matricula: '2026003' },
    { nome: 'Ryuki Alex Katsurem', login: 'ryuki', email: 'ryuki@ruth.local', matricula: '2026004' },
    { nome: 'Aluno Teste', login: 'teste', email: 'teste@ruth.local', matricula: '2026999' },
  ];
  const alunos = [];
  for (const a of alunosData) {
    const aluno = await prisma.usuario.upsert({
      where: { email: a.email }, update: {},
      create: { nome: a.nome, email: a.email, login: a.login, senha: await hash('aluno123'), tipo: 'U', status: 'A', matricula: a.matricula },
    });
    alunos.push(aluno);
  }
  console.info(`✓ ${alunos.length} alunos`);

  let turma = await prisma.turma.findFirst({ where: { nome: 'Engenharia de Software', periodo: '2026/01' } });
  if (!turma) turma = await prisma.turma.create({ data: { nome: 'Engenharia de Software', periodo: '2026/01' } });
  console.info(`✓ Turma: ${turma.nome} ${turma.periodo}`);

  const disciplinasData = [
    { nome: 'Arquitetura de Software', professorId: moacir.id },
    { nome: 'Banco de Dados', professorId: moacir.id },
  ];
  for (const d of disciplinasData) {
    const existe = await prisma.disciplina.findFirst({ where: { nome: d.nome, turmaId: turma.id } });
    if (!existe) await prisma.disciplina.create({ data: { nome: d.nome, turmaId: turma.id, professorId: d.professorId } });
  }
  console.info(`✓ ${disciplinasData.length} disciplinas`);

  for (const aluno of alunos) {
    await prisma.matricula.upsert({
      where: { alunoId_turmaId: { alunoId: aluno.id, turmaId: turma.id } },
      update: {}, create: { alunoId: aluno.id, turmaId: turma.id },
    });
  }
  console.info(`✓ ${alunos.length} matrículas`);

  const parametros = [
    { chave: 'janela_padrao', descricao: 'Janela padrão de chamada', valor: '10', tipo: 'MIN' },
    { chave: 'tolerancia_atraso', descricao: 'Tolerância de atraso', valor: '5', tipo: 'MIN' },
    { chave: 'peso_interacao', descricao: 'Peso da pergunta na presença', valor: '0.5', tipo: 'P' },
    { chave: 'presenca_minima', descricao: 'Presença mínima para aprovação', valor: '75', tipo: 'P' },
  ];
  for (const p of parametros) {
    await prisma.parametro.upsert({ where: { chave: p.chave }, update: {}, create: p });
  }
  console.info(`✓ ${parametros.length} parâmetros padrão`);
  console.info('🌱 Seed concluído.');
}

main().catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
