import { Link, useLocation, useParams } from 'react-router-dom';
import { formatMoney } from '../components/ProductCard';
import Icon from '../components/Icon';

const CONFETTI = ['var(--terra)', 'var(--mustard)', 'var(--sage-mid)', 'var(--terra-soft)', 'var(--sage)'];

export default function Result() {
  const { status } = useParams();
  const { state } = useLocation();
  const ok = status === 'exito';

  return <section className="container py-4">
    <div className={`result ${ok ? 'ok' : 'bad'}`}>
      {ok && Array.from({ length: 14 }, (_, i) => <span key={i} className="confetti" aria-hidden="true" style={{
        left: `${6 + i * 6.5}%`, top: `${8 + (i % 4) * 7}%`, background: CONFETTI[i % CONFETTI.length], animationDelay: `${(i % 5) * 0.08}s`, borderRadius: i % 3 ? '4px' : '50%'
      }} />)}
      <div className="result-icon"><Icon name={ok ? 'check' : 'alert'} size={44} strokeWidth={2.5} /></div>
      <h1>{ok ? '¡Compra exitosa!' : 'No pudimos procesar el pago'}</h1>
      <p>{ok ? 'Tu pedido fue registrado y prepararemos tus productos con mucho cariño.' : (state?.error || 'Verifica los datos de pago e inténtalo nuevamente.')}</p>
      {ok && state?.order && <div className="receipt">
        <div><span>Pedido</span><span>#{state.order.id}</span></div>
        <div><span>Entrega</span><span>{state.order.customer.delivery}</span></div>
        <div><span>Total</span><span>{formatMoney(state.order.total)}</span></div>
      </div>}
      <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
        <Link className="btn btn-warm" to={ok ? '/categorias' : '/checkout'}>{ok ? 'Seguir comprando' : 'Volver al checkout'}</Link>
        {ok && <Link className="btn btn-line" to="/mis-pedidos">Ver mis pedidos</Link>}
      </div>
    </div>
  </section>;
}
