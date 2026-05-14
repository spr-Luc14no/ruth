import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardRouter from './pages/DashboardRouter';
import Usuarios from './pages/admin/Usuarios';
import Turmas from './pages/admin/Turmas';
import TurmaDetalhe from './pages/admin/TurmaDetalhe';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      {/* Área administrativa — só perfil A */}
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute perfis={['A']}>
            <Usuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/turmas"
        element={
          <ProtectedRoute perfis={['A']}>
            <Turmas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/turmas/:id"
        element={
          <ProtectedRoute perfis={['A']}>
            <TurmaDetalhe />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
