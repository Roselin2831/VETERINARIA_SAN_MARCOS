import Icon from './Icon';

export default function Loader({ label = 'Cargando…' }) {
  return <div className="loader" role="status">
    <span className="paws"><Icon name="paw" size={22} /><Icon name="paw" size={22} /><Icon name="paw" size={22} /></span>
    {label}
  </div>;
}
