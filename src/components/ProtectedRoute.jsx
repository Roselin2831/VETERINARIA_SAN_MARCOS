import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege rutas según sesión y rol.
 *  - Sin sesión          → /ingresar (recordando a dónde quería ir).
 *  - Sesión sin el rol   → /no-autorizado.
 *  - Mientras se valida la sesión al recargar → spinner (no redirige antes de tiempo).
 * Uso: <Route element={<ProtectedRoute roles={['ADMIN']} />}> ...rutas hijas... </Route>
 */
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container py-5 text-center"><div className="spinner-border text-success" role="status" /><p className="mt-2 text-secondary">Verificando sesión…</p></div>;
  }
  if (!user) return <Navigate to="/ingresar" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/no-autorizado" replace />;
  return <Outlet />;
}
