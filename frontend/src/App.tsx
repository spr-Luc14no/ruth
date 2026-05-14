import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardRouter from './pages/DashboardRouter';
import Usuarios from './pages/admin/Usuarios';
import Turmas from './pages/admin/Turmas';
import TurmaDetalhe from './pages/admin/TurmaDetalhe';
import IniciarSessao from './pages/professor/IniciarSessao';
import SessaoAtiva from './pages/professor/SessaoAtiva';
import EntrarSessao from './pages/aluno/EntrarSessao';
import SessaoAluno from './pages/aluno/SessaoAluno';
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

      {/* ============ ADMIN ============ */}
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

      {/* ============ PROFESSOR ============ */}
      <Route
        path="/professor/sessao/iniciar"
        element={
          <ProtectedRoute perfis={['P']}>
            <IniciarSessao />
          </ProtectedRoute>
        }
      />
      <Route
        path="/professor/sessao/:id"
        element={
          <ProtectedRoute perfis={['P']}>
            <SessaoAtiva />
          </ProtectedRoute>
        }
      />

      {/* ============ ALUNO ============ */}
      <Route
        path="/aluno/entrar"
        element={
          <ProtectedRoute perfis={['U']}>
            <EntrarSessao />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/sessao/:id"
        element={
          <ProtectedRoute perfis={['U']}>
            <SessaoAluno />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
