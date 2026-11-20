import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, meRequest, registerRequest } from '../services/authService';
import { SESSION_EXPIRED_EVENT } from '../services/api';
import { clearSession, isTokenExpired, readSession, saveSession, SESSION_KEY } from '../services/session';

const AuthContext = createContext(null);

/**
 * Estado global de autenticación.
 * Al cargar la página: si hay sesión guardada y el refreshToken sigue vigente,
 * se valida con GET /api/auth/me. Mientras tanto "loading" es true para que
 * las rutas protegidas no redirijan antes de tiempo.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const session = readSession();
    if (!session || isTokenExpired(session.refreshToken)) {
      clearSession();
      setLoading(false);
      return;
    }
    meRequest()
      .then((serverUser) => {
        saveSession({ ...readSession(), user: serverUser });
        setUser(serverUser);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  // Si un token no se pudo renovar, se cierra la sesión en toda la app
  useEffect(() => {
    const onExpired = () => setUser(null);
    // Sincroniza entre pestañas: cerrar sesión en una la cierra en todas
    const onStorage = (event) => {
      if (event.key !== SESSION_KEY) return;
      setUser(readSession()?.user || null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const startSession = (data) => {
    saveSession(data);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => startSession(await loginRequest(email, password));
  const register = async (form) => startSession(await registerRequest(form));

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    hasRole: (...roles) => Boolean(user) && roles.includes(user.role),
    login,
    register,
    logout
  }), [user, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
