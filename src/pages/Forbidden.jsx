import { Link } from 'react-router-dom';
export default function Forbidden() {
  return <section className="container py-5"><div className="result-card failure text-center mx-auto shadow-sm"><div className="display-2">⛔</div><h1 className="serif">Acceso restringido</h1><p>Tu cuenta no tiene permisos para ver esta sección.</p><Link className="btn btn-success mt-3" to="/">Volver al inicio</Link></div></section>;
}
