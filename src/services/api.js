import { clearSession, isTokenExpired, readSession, saveSession } from './session';

export const API_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');
export const SESSION_EXPIRED_EVENT = 'san-marcos:session-expired';
export const SESSION_UPDATED_EVENT = 'san-marcos:session-updated';

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

function expireSession(expectedToken) {
  if (readSession()?.refreshToken !== expectedToken) return;
  clearSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

async function send(path, options) {
  try {
    return await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Intenta nuevamente.');
  }
}

let refreshPromise = null;
export function refreshTokens() {
  if (refreshPromise) return refreshPromise;
  const expectedToken = readSession()?.refreshToken;
  const renew = async () => {
    const session = readSession();
    // Otra pestaña pudo renovar mientras esta esperaba el bloqueo.
    if (session?.refreshToken !== expectedToken && session && !isTokenExpired(session.accessToken, 30_000)) return session;
    if (!session?.refreshToken || isTokenExpired(session.refreshToken)) {
      expireSession(session?.refreshToken);
      throw new ApiError(401, 'Sesión expirada. Inicia sesión nuevamente.');
    }
    const res = await send('/auth/refresh', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 401) expireSession(session.refreshToken);
      throw new ApiError(res.status, data?.error || 'No se pudo renovar la sesión. Intenta nuevamente.');
    }
    // Una respuesta pendiente nunca debe restaurar una sesión cerrada ni reemplazar un nuevo login.
    if (readSession()?.refreshToken !== session.refreshToken) {
      throw new ApiError(401, 'La sesión cambió. Intenta nuevamente.');
    }
    saveSession(data);
    window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
    return data;
  };
  const locks = globalThis.navigator?.locks;
  refreshPromise = (locks ? locks.request('san-marcos:refresh', renew) : renew())
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function api(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  let session = auth ? readSession() : null;
  if (session?.accessToken && isTokenExpired(session.accessToken, 30_000)) session = await refreshTokens();
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;
  const res = await send(path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  if (res.status === 401 && auth && retry && session?.refreshToken) {
    await refreshTokens();
    return api(path, { method, body, auth, retry: false });
  }
  if (res.status === 401 && auth && session) expireSession(session.refreshToken);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error || `Error ${res.status}`, data?.fields);
  return data;
}
