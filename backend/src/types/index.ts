import { JwtPayload } from '../utils/jwt';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export type Perfil = 'A' | 'P' | 'U';

export const PERFIL_LABELS: Record<Perfil, string> = {
  A: 'Administrador',
  P: 'Professor',
  U: 'Aluno',
};

export {};
