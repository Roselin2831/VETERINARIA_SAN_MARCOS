import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Protege rutas según sesión y rol.
 *  - Sin sesión          → /ingresar (recordando a dónde quería ir).
 *  - Sesión sin el rol   → /no-autorizado.
 *  - Mientras se valida la sesión al recargar → spinner (no redirige antes de tiempo).
 * Uso: <Route element={<ProtectedRoute roles={['ADMIN']} />}> ...rutas hijas... </Route>
 */
export function StorefrontRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader label="Verificando sesión…" />;
  return user?.role === 'VENDEDOR' ? <Navigate to="/vendedor" replace /> : <Outlet />;
}

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader label="Verificando sesión…" />;
  }
  if (!user) return <Navigate to="/ingresar" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/no-autorizado" replace />;
  return <Outlet />;
}
