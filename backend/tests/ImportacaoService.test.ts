import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/config/env', () => ({ env: { JWT_SECRET: 'test-secret-32-chars-minimum-aaaaaaaaaa', JWT_EXPIRES_IN: '8h', BCRYPT_SALT_ROUNDS: 10, MAX_LOGIN_ATTEMPTS: 5, LOGIN_LOCKOUT_MINUTES: 15, NODE_ENV: 'test', PORT: 3001, DATABASE_URL: 'mysql://test', CORS_ORIGIN: 'http://localhost:5173' } }));
vi.mock('../src/config/prisma', () => ({ prisma: {} }));
import { ImportacaoService } from '../src/services/ImportacaoService';
describe('ImportacaoService.parseCSV', () => {
  it('parse CSV com virgula', () => {
    const { linhas, erros } = ImportacaoService.parseCSV('nome,email,login,matricula\nRamon Santos,ramon@x.com,ramon,2026001\nLuiz Souza,luiz@x.com,luiz,2026002');
    expect(erros).toHaveLength(0);
    expect(linhas).toHaveLength(2);
    expect(linhas[0]).toMatchObject({ nome: 'Ramon Santos', login: 'ramon', matricula: '2026001' });
  });
  it('aceita ponto-e-virgula', () => {
    const { linhas, erros } = ImportacaoService.parseCSV('nome;email;matricula\nAna;ana@x.com;2026010');
    expect(erros).toHaveLength(0);
    expect(linhas[0].matricula).toBe('2026010');
  });
  it('deriva login do email', () => {
    const { linhas } = ImportacaoService.parseCSV('nome,email,matricula\nAna Maria,ana.maria@x.com,2026011');
    expect(linhas[0].login).toBe('ana.maria');
  });
  it('remove BOM e aspas', () => {
    const { linhas } = ImportacaoService.parseCSV('\uFEFF"nome","email","matricula"\n"Ze Junior","ze@x.com","2026012"');
    expect(linhas[0].nome).toBe('Ze Junior');
  });
  it('erro quando cabecalho invalido', () => {
    const { linhas, erros } = ImportacaoService.parseCSV('foo,bar\n1,2');
    expect(linhas).toHaveLength(0);
    expect(erros.length).toBeGreaterThan(0);
  });
  it('pula linhas em branco', () => {
    const { linhas, erros } = ImportacaoService.parseCSV('nome,email,matricula\n,vazio@x.com,2026013\nValido,valido@x.com,2026014');
    expect(linhas).toHaveLength(1);
    expect(erros.length).toBe(1);
  });
});
