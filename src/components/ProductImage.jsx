import { useEffect, useState } from 'react';

// Foto del producto; si no tiene o no carga, muestra su emoji (comportamiento anterior).
export default function ProductImage({ product, className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [product.imageUrl]);
  const showPhoto = product.imageUrl && !failed;

  return <span className={`${className}${showPhoto ? ' has-photo' : ''}`} aria-hidden="true">
    {showPhoto
      ? <img src={product.imageUrl} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      : <span className="emoji">{product.emoji || '🐾'}</span>}
  </span>;
}
