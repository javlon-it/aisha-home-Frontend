import {Link} from 'react-router-dom';
import {useState} from 'react';
import {FiArrowRight} from 'react-icons/fi';
import {StatusBadge} from './ShopUI.jsx';
import {productPricing} from '../../services/product-pricing.js';

export const money = n => new Intl.NumberFormat('uz-UZ').format(n) + ' so‘m';

export default function ProductCard({product, variant = 'home'}) {
  const [failed, setFailed] = useState(false);
  const variants = product.matchingVariants || product.variants;
  const price = variants.length ? Math.min(...variants.map(item => productPricing(item).finalPrice)) : null;
  const deal = variants.length ? productPricing(variants.find(item => productPricing(item).finalPrice === price)) : null;
  const available = variants.some(item => item.isAvailable);
  const productLink = `/products/${product.id}`;

  if (variant === 'home') return <article className="catalog-card">
    <Link className="catalog-image" to={productLink} aria-label={`${product.name} tafsiloti`}>
      {!failed && product.imageUrl ? <img src={product.imageUrl} alt={`${product.name} — tasviriy demo surat`} width="720" height="720" loading="lazy" onError={() => setFailed(true)} /> : <span>Rasm mavjud emas</span>}
    </Link>
    <div className="catalog-copy">
      <span className="eyebrow">{product.category} · DEMO</span>
      <h3><Link to={productLink}>{product.name}</Link></h3>
      <p className="price">{price === null ? 'Narx ko‘rsatilmagan' : <>{deal.discountPercent > 0 && <><del>{money(deal.originalPrice)} dan</del> <span>{deal.discountPercent}% chegirma · </span></>}{money(price)} dan</>}</p>
      <p>{[...new Set(variants.map(item => item.size))].join(', ') || 'O‘lcham ko‘rsatilmagan'}</p>
      <p className={available ? 'available' : 'unavailable'}>{available ? 'Mavjud' : 'Sotuvda yo‘q'}</p>
      <Link className="button aisha-nav-button btn btn-outline" to={productLink}>Mahsulotni ko‘rish <FiArrowRight className="size-4 shrink-0" aria-hidden="true" focusable="false" /></Link>
    </div>
  </article>;

  return <article className="catalog-card card aisha-catalog-card">
    <Link className="catalog-image aisha-card-image" to={productLink} aria-label={`${product.name} tafsiloti`}>
      {!failed && product.imageUrl ? <img src={product.imageUrl} alt={`${product.name} — tasviriy demo surat`} width="720" height="720" loading="lazy" onError={() => setFailed(true)} /> : <span>Rasm mavjud emas</span>}
      <span className="aisha-image-caption">AISHA HOME · DEMO</span>
    </Link>
    <div className="card-body catalog-copy aisha-product-copy">
      <div className="aisha-product-meta"><span className="eyebrow">{product.category}</span><StatusBadge>{available ? 'Mavjud' : 'Sotuvda yo‘q'}</StatusBadge></div>
      <h2><Link to={productLink}>{product.name}</Link></h2>
      <p className="aisha-product-sizes">{[...new Set(variants.map(item => item.size))].join(' · ') || 'O‘lcham ko‘rsatilmagan'}</p>
      <div className="aisha-product-card-footer"><p className="price">{price === null ? 'Narx ko‘rsatilmagan' : <>{deal.discountPercent > 0 && <><del>{money(deal.originalPrice)} dan</del> <span>{deal.discountPercent}% chegirma · </span></>}{money(price)} dan</>}</p><Link className="btn btn-outline aisha-card-link" to={productLink} aria-label={`${product.name} mahsulotini ko‘rish`}><FiArrowRight aria-hidden="true" focusable="false" /></Link></div>
    </div>
  </article>;
}
