import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardRouter from './pages/DashboardRouter';
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
      {/* Catch-all: rota desconhecida vai pra home (que redireciona pro login se não logado) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
