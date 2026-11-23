import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loginRequest, logoutRequest, meRequest, registerRequest } from '../services/authService';
import { SESSION_EXPIRED_EVENT, SESSION_UPDATED_EVENT } from '../services/api';
import { clearSession, isTokenExpired, readSession, saveSession, SESSION_KEY } from '../services/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authRevision = useRef(0);

  const logout = useCallback(async () => {
    const revision = ++authRevision.current;
    try { if (readSession()) await logoutRequest(); }
    finally {
      if (authRevision.current === revision) { clearSession(); setUser(null); }
    }
  }, []);

  useEffect(() => {
    let active = true;
    let generation = 0;
    const validate = async () => {
      const current = ++generation;
      const revision = authRevision.current;
      const session = readSession();
      setLoading(true);
      if (!session || isTokenExpired(session.refreshToken)) {
        clearSession(); setUser(null); setLoading(false); return;
      }
      try {
        const serverUser = await meRequest();
        if (!active || generation !== current || authRevision.current !== revision || !readSession()) return;
        // Solo se utiliza el rol confirmado por el servidor.
        saveSession({ ...readSession(), user: serverUser });
        setUser(serverUser);
      } catch (err) {
        if (active && generation === current && authRevision.current === revision) setUser(null);
      } finally {
        if (active && generation === current) setLoading(false);
      }
    };
    const onExpired = () => { ++generation; setUser(null); setLoading(false); };
    const onUpdated = () => { setUser(readSession()?.user || null); };
    const onStorage = (event) => {
      if (event.key !== SESSION_KEY) return;
      // Un evento storage puede venir de valores manipulados: revalidar el usuario.
      ++authRevision.current;
      if (!readSession()) onExpired(); else validate();
    };
    validate();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    window.addEventListener(SESSION_UPDATED_EVENT, onUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      active = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      window.removeEventListener(SESSION_UPDATED_EVENT, onUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const startSession = (data, revision) => {
    if (authRevision.current !== revision) throw new Error('La sesión cambió. Intenta nuevamente.');
    saveSession(data); setUser(data.user); setLoading(false); return data.user;
  };
  const login = async (email, password) => {
    const revision = ++authRevision.current;
    return startSession(await loginRequest(email, password), revision);
  };
  const register = async (form) => {
    const revision = ++authRevision.current;
    return startSession(await registerRequest(form), revision);
  };
  const value = useMemo(() => ({
    user, loading, isAuthenticated: Boolean(user), isAdmin: user?.role === 'ADMIN',
    hasRole: (...roles) => Boolean(user) && roles.includes(user.role), login, register, logout
  }), [user, loading, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
