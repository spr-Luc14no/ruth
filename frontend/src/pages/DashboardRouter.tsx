import { useAuth } from '@/contexts/AuthContext';
import DashboardAdmin from './DashboardAdmin';
import DashboardProfessor from './DashboardProfessor';
import DashboardAluno from './DashboardAluno';

export default function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.tipo) {
    case 'A':
      return <DashboardAdmin />;
    case 'P':
      return <DashboardProfessor />;
    case 'U':
      return <DashboardAluno />;
    default:
      return null;
  }
}
