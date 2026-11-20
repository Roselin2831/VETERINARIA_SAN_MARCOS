import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function Forbidden() {
  return <section className="container py-4">
    <div className="result bad">
      <div className="result-icon"><Icon name="lock" size={40} strokeWidth={2.5} /></div>
      <h1>Acceso restringido</h1>
      <p>Tu cuenta no tiene permisos para ver esta sección. Si crees que es un error, pide ayuda a un administrador.</p>
      <Link className="btn btn-warm mt-3" to="/">Volver al inicio</Link>
    </div>
  </section>;
}
