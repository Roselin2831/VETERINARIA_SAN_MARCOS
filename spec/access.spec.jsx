import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { saveSession, clearSession } from '../src/services/session';

const jwt = () => `a.${btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000)+3600 }))}.c`;
const mount = () => render(<AuthProvider><MemoryRouter initialEntries={['/admin']}><Routes>
  <Route path="/ingresar" element={<p>Debe iniciar sesión</p>} />
  <Route path="/no-autorizado" element={<p>Acceso denegado</p>} />
  <Route element={<ProtectedRoute roles={['ADMIN']} />}><Route path="/admin" element={<p>Administración autorizada</p>} /></Route>
</Routes></MemoryRouter></AuthProvider>);

describe('Restricciones de interfaz con validación del backend', () => {
  afterEach(() => { cleanup(); clearSession(); });
  it('redirige al login cuando no hay sesión', async () => {
    clearSession(); mount();
    await waitFor(() => expect(screen.getByText('Debe iniciar sesión')).toBeTruthy());
  });
  for (const role of ['CLIENTE', 'VENDEDOR', 'ADMIN']) {
    it(`usa el rol ${role} del servidor al recargar aunque localStorage diga ADMIN`, async () => {
      saveSession({ accessToken: jwt(), refreshToken: jwt(), user: { id: 1, role: 'ADMIN' } });
      spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({ id: 1, name: 'Prueba', role }), { status: 200 }));
      mount();
      await waitFor(() => expect(screen.getByText(role === 'ADMIN' ? 'Administración autorizada' : 'Acceso denegado')).toBeTruthy());
    });
  }
});
