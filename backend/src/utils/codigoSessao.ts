/**
 * Gerador de código curto pra sessões de chamada.
 * Usa alfabeto sem caracteres confusos (sem 0/O, 1/I/L) pra evitar
 * que o aluno digite errado.
 */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // 31 chars
const CODE_LENGTH = 4;

export function gerarCodigoSessao(): string {
  let codigo = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    codigo += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return codigo;
}

/**
 * Valida formato (não checa unicidade — isso é responsabilidade do service).
 */
export function isCodigoValido(codigo: string): boolean {
  if (codigo.length !== CODE_LENGTH) return false;
  return codigo.split('').every((c) => ALPHABET.includes(c));
}
