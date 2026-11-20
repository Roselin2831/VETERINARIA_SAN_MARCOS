// Manejo de la sesión en el navegador.
// Se guarda en localStorage para que la sesión sobreviva a recargas de página y nuevas pestañas.
// Medidas de seguridad:
//  - El accessToken dura solo 15 minutos; se renueva con el refreshToken.
//  - Al iniciar la app el usuario se vuelve a validar contra el backend (/auth/me):
//    el rol que usa la interfaz viene del servidor, no de lo que esté guardado.
//  - Si el refreshToken expiró o es inválido, la sesión se borra.
const KEY = 'san-marcos-session';

export const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
};

export const saveSession = ({ accessToken, refreshToken, user }) =>
  localStorage.setItem(KEY, JSON.stringify({ accessToken, refreshToken, user }));

export const clearSession = () => localStorage.removeItem(KEY);

export const SESSION_KEY = KEY;

// Lee la fecha de expiración (exp) del payload del JWT. No verifica la firma: eso lo hace el backend.
export const tokenExpiresAt = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000;
  } catch {
    return 0;
  }
};

export const isTokenExpired = (token, marginMs = 0) => !token || tokenExpiresAt(token) - marginMs <= Date.now();
