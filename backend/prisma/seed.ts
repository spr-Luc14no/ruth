/**
 * Seed do banco RUTh
 * Cria apenas o admin inicial e os parâmetros padrão.
 * Demais cadastros (professor, turmas, alunos) feitos via UI.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Iniciando seed...');

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@ruth.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
  const adminName = process.env.ADMIN_NAME ?? 'Administrador';
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  // Admin inicial
  const senhaHash = await bcrypt.hash(adminPassword, saltRounds);

  const admin = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nome: adminName,
      email: adminEmail,
      login: 'admin',
      senha: senhaHash,
      tipo: 'A',
      status: 'A',
    },
  });
  console.info(`✓ Admin: ${admin.email}`);

  // Parâmetros padrão do sistema (Tabela 4 do documento)
  const parametros = [
    { chave: 'janela_padrao', descricao: 'Janela padrão de chamada', valor: '10', tipo: 'MIN' },
    { chave: 'tolerancia_atraso', descricao: 'Tolerância de atraso', valor: '5', tipo: 'MIN' },
    { chave: 'peso_interacao', descricao: 'Peso da pergunta na presença', valor: '0.5', tipo: 'P' },
    { chave: 'presenca_minima', descricao: 'Presença mínima para aprovação', valor: '75', tipo: 'P' },
  ];

  for (const p of parametros) {
    await prisma.parametro.upsert({
      where: { chave: p.chave },
      update: {},
      create: { ...p, ativo: true },
    });
  }
  console.info(`✓ ${parametros.length} parâmetros padrão`);

  console.info('🌱 Seed concluído.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
