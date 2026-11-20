import { clearSession, isTokenExpired, readSession, saveSession } from './session';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Evento para avisar a React que la sesión terminó (token vencido y no renovable).
export const SESSION_EXPIRED_EVENT = 'san-marcos:session-expired';

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

let refreshPromise = null;

// Pide un par nuevo de tokens. Si varias peticiones lo necesitan a la vez, comparten la misma llamada.
export function refreshTokens() {
  if (!refreshPromise) {
    const session = readSession();
    refreshPromise = (async () => {
      if (!session?.refreshToken || isTokenExpired(session.refreshToken)) throw new ApiError(401, 'Sesión expirada.');
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken })
      });
      if (!res.ok) throw new ApiError(401, 'Sesión expirada.');
      const data = await res.json();
      saveSession(data);
      return data;
    })()
      .catch((err) => {
        clearSession();
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        throw err;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

/**
 * Cliente HTTP único de la app:
 *  1. Agrega "Authorization: Bearer <accessToken>" si hay sesión.
 *  2. Si el accessToken está por vencer (< 30 s), lo renueva antes de llamar.
 *  3. Si el backend responde 401, renueva una vez y reintenta.
 *  4. Convierte los errores JSON del backend en ApiError con mensaje legible.
 */
export async function api(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  let session = auth ? readSession() : null;
  if (session?.accessToken && isTokenExpired(session.accessToken, 30_000)) {
    try { session = await refreshTokens(); } catch { session = null; }
  }

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. ¿Está encendido el backend?');
  }

  if (res.status === 401 && auth && retry && session?.refreshToken) {
    await refreshTokens();
    return api(path, { method, body, auth, retry: false });
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error || `Error ${res.status}`, data?.fields);
  return data;
}
