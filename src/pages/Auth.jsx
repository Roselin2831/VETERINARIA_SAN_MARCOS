import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brand } from '../components/Layout';
import Icon from '../components/Icon';
import { PHOTOS } from '../data/photos';

export default function Auth({ mode }) {
  const registering = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, register, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!loading && user) return <Navigate to={location.state?.from || (user.role === 'ADMIN' ? '/admin' : user.role === 'VENDEDOR' ? '/vendedor' : '/')} replace />;

  const submit = async (event) => {
    event.preventDefault(); setError(''); setSending(true);
    try {
      const logged = registering ? await register(form) : await login(form.email, form.password);
      const from = location.state?.from;
      navigate(from || (logged.role === 'ADMIN' ? '/admin' : logged.role === 'VENDEDOR' ? '/vendedor' : '/'), { replace: true });
    } catch (err) { setError(err.message); } finally { setSending(false); }
  };
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return <main className="auth">
    <section className="auth-art">
      <img className="auth-photo" src={PHOTOS.login} alt="" aria-hidden="true" />
      <div className="position-relative"><Brand /></div>
      <div className="auth-quote" aria-hidden="true">
        <p>{registering ? 'Únete a la familia San Marcos.' : 'Qué bueno verte de nuevo.'}</p>
        <small>Cuidamos perros, gatos, conejos y aves desde 2009.</small>
      </div>
    </section>

    <section className="auth-main">
      <div className="auth-box">
        <Link className="link-arrow" to="/"><Icon name="back" size={18} />Volver a la tienda</Link>
        <h1>{registering ? 'Crear una cuenta' : 'Bienvenido nuevamente'}</h1>
        <p className="lead-sm">{registering ? 'Regístrate para agilizar tus compras y seguir tus pedidos.' : 'Ingresa a tu cuenta de Veterinaria San Marcos.'}</p>

        {location.state?.from && !registering && <div className="alert alert-info small"><Icon name="lock" size={18} />Inicia sesión para continuar.</div>}
        {error && <div className="alert alert-danger" role="alert"><Icon name="alert" size={18} />{error}</div>}

        <form onSubmit={submit}>
          {registering && <div className="mb-3">
            <label className="form-label" htmlFor="au-name">Nombre completo</label>
            <div className="input-icon"><Icon name="user" size={18} /><input id="au-name" required autoComplete="name" className="form-control" value={form.name} onChange={set('name')} /></div>
          </div>}
          <div className="mb-3">
            <label className="form-label" htmlFor="au-email">Correo electrónico</label>
            <div className="input-icon"><Icon name="mail" size={18} /><input id="au-email" required type="email" autoComplete="email" className="form-control" placeholder="tu@correo.cl" value={form.email} onChange={set('email')} /></div>
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="au-pass">Contraseña</label>
            <div className="input-icon">
              <Icon name="lock" size={18} />
              <input id="au-pass" required minLength="6" type={showPass ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} className="form-control" value={form.password} onChange={set('password')} />
              <button className="reveal" type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPass}><Icon name={showPass ? 'eyeOff' : 'eye'} size={18} /></button>
            </div>
            {registering && <small className="text-secondary d-block mt-1">Mínimo 6 caracteres.</small>}
          </div>
          <button className="btn btn-warm btn-lg w-100" disabled={sending}>{sending ? 'Procesando…' : registering ? 'Crear cuenta' : 'Iniciar sesión'}</button>
        </form>

        <div className="or-line">{registering ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}</div>
        <Link className="btn btn-line w-100" to={registering ? '/ingresar' : '/registro'} state={location.state}>{registering ? 'Inicia sesión' : 'Regístrate gratis'}</Link>

        {/* Las cuentas demo solo existen en desarrollo local; en producción la clave de admin es aleatoria. */}
        {!registering && import.meta.env.DEV && <p className="demo-hint mb-0">Demo local: admin@sanmarcos.cl / Admin123! · vendedor@sanmarcos.cl / Vendedor123! · cliente@sanmarcos.cl / Cliente123!</p>}
      </div>
    </section>
  </main>;
}
