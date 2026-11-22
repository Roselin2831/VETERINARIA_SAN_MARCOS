import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Auth({ mode }) {
  const registering = mode === 'register'; const [form, setForm] = useState({ name: '', email: '', password: '' }); const [error, setError] = useState(''); const [sending, setSending] = useState(false);
  const { login, register, user, loading } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  if (!loading && user) return <Navigate to={location.state?.from || (user.role === 'ADMIN' ? '/admin' : '/')} replace />;
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSending(true);
    try {
      const logged = registering ? await register(form) : await login(form.email, form.password);
      const from = location.state?.from;
      navigate(from || (logged.role === 'ADMIN' ? '/admin' : '/'), { replace: true });
    } catch (err) { setError(err.message); } finally { setSending(false); }
  };
  return <main className="auth-page d-flex align-items-center py-5"><section className="auth-card card border-0 shadow mx-auto"><div className="card-body p-4 p-md-5"><Link className="text-decoration-none text-success" to="/">← Volver a la tienda</Link><h1 className="serif mt-4">{registering ? 'Crear una cuenta' : 'Bienvenido nuevamente'}</h1><p className="text-secondary">{registering ? 'Regístrate para agilizar tus compras.' : 'Ingresa a Veterinaria San Marcos.'}</p>{location.state?.from && !registering && <div className="alert alert-info small">Inicia sesión para continuar.</div>}{error && <div className="alert alert-danger" role="alert">{error}</div>}<form onSubmit={submit} className="mt-4">{registering && <div className="mb-3"><label className="form-label">Nombre completo</label><input required className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>}<div className="mb-3"><label className="form-label">Correo electrónico</label><input required type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div><div className="mb-3"><label className="form-label">Contraseña</label><input required minLength="6" type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div><button className="btn btn-success w-100" disabled={sending}>{sending ? 'Procesando…' : registering ? 'Crear cuenta' : 'Iniciar sesión'}</button></form><p className="text-center small mt-4">{registering ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'} <Link to={registering ? '/ingresar' : '/registro'} state={location.state}>{registering ? 'Inicia sesión' : 'Regístrate'}</Link></p>{!registering && <p className="text-secondary small mb-0">Demo: admin@sanmarcos.cl / Admin123! · cliente@sanmarcos.cl / Cliente123!</p>}</div></section></main>;
}
