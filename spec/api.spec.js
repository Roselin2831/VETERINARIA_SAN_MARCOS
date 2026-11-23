import { api, refreshTokens, ApiError } from '../src/services/api';
import { saveSession, readSession, clearSession, isTokenExpired } from '../src/services/session';

const token = (type, seconds = 900) => `header.${btoa(JSON.stringify({ type, exp: Math.floor(Date.now() / 1000) + seconds }))}.signature`;
const session = () => ({ accessToken: token('access'), refreshToken: token('refresh', 86400), user: { id: 1, name: 'Cliente', role: 'CLIENTE' } });
const response = (status, value) => Promise.resolve(new Response(status === 204 ? null : JSON.stringify(value), { status }));

describe('Cliente de API y sesión real', () => {
  beforeEach(() => clearSession());
  afterEach(() => clearSession());

  it('trata tokens sin expiración numérica como vencidos', () => {
    expect(isTokenExpired('header.' + btoa('{"exp":"invalid"}') + '.signature')).toBeTrue();
    expect(isTokenExpired('malformado')).toBeTrue();
  });

  it('recupera la sesión persistida y rechaza JSON corrupto', () => {
    const value = session(); saveSession(value);
    expect(readSession()).toEqual(value);
    localStorage.setItem('san-marcos-session', '{');
    expect(readSession()).toBeNull();
  });

  it('envía Bearer y conserva los errores por campo de la API', async () => {
    const value = session(); saveSession(value);
    const fetch = spyOn(window, 'fetch').and.callFake(() => response(400, { error: 'Stock inválido', fields: { stock: 'Debe ser positivo' } }));
    await expectAsync(api('/products', { method: 'POST', body: { stock: -1 } })).toBeRejectedWith(jasmine.objectContaining({ status: 400, fields: { stock: 'Debe ser positivo' } }));
    expect(fetch.calls.mostRecent().args[1].headers.Authorization).toBe(`Bearer ${value.accessToken}`);
  });

  it('renueva una sola vez ante llamadas simultáneas y reintenta con el token nuevo', async () => {
    saveSession({ ...session(), accessToken: token('access', -5) });
    const renewed = { ...session(), accessToken: token('access', 1800), refreshToken: token('refresh', 172800) };
    const fetch = spyOn(window, 'fetch').and.callFake(url => url.endsWith('/auth/refresh') ? response(200, renewed) : response(200, []));
    await Promise.all([api('/orders/mine'), api('/auth/me')]);
    expect(fetch.calls.allArgs().filter(args => args[0].endsWith('/auth/refresh')).length).toBe(1);
    expect(readSession().refreshToken).toBe(renewed.refreshToken);
    expect(fetch.calls.mostRecent().args[1].headers.Authorization).toBe(`Bearer ${renewed.accessToken}`);
  });

  it('borra la sesión cuando el servidor rechaza el refresh', async () => {
    saveSession(session());
    spyOn(window, 'fetch').and.callFake(() => response(401, { error: 'Token utilizado' }));
    await expectAsync(refreshTokens()).toBeRejectedWith(jasmine.any(ApiError));
    expect(readSession()).toBeNull();
  });

  it('conserva la sesión ante una caída temporal de red', async () => {
    const value = session(); saveSession(value);
    spyOn(window, 'fetch').and.rejectWith(new TypeError('offline'));
    await expectAsync(refreshTokens()).toBeRejectedWith(jasmine.objectContaining({ status: 0 }));
    expect(readSession()).toEqual(value);
  });

  it('no restaura una sesión cerrada mientras esperaba la renovación', async () => {
    saveSession(session());
    let resolveFetch;
    spyOn(window, 'fetch').and.callFake(() => new Promise(resolve => { resolveFetch = resolve; }));
    const pending = refreshTokens();
    while (!resolveFetch) await new Promise(resolve => setTimeout(resolve, 0));
    clearSession();
    resolveFetch(new Response(JSON.stringify(session()), { status: 200 }));
    await expectAsync(pending).toBeRejected();
    expect(readSession()).toBeNull();
  });

  it('reintenta una sola vez después de un 401', async () => {
    saveSession(session());
    const fetch = spyOn(window, 'fetch').and.callFake(url => url.endsWith('/auth/refresh') ? response(200, session()) : response(401, { error: 'Sin sesión' }));
    await expectAsync(api('/auth/me')).toBeRejectedWith(jasmine.objectContaining({ status: 401 }));
    expect(fetch.calls.count()).toBe(3);
    expect(readSession()).toBeNull();
  });
});
