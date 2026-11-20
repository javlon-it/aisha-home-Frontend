import {useEffect, useMemo, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {fetchProduct} from '../../services/catalog.js';
import {money} from '../../components/shop/ProductCard.jsx';
import {useCart} from '../../store/cart.jsx';
import {BreadcrumbNavigation, ErrorState, LoadingState, PremiumCard, ShopPageHeader, StatusBadge} from '../../components/shop/ShopUI.jsx';
import {FiArrowLeft, FiArrowRight, FiShoppingBag} from 'react-icons/fi';
import {productPricing} from '../../services/product-pricing.js';

export default function Product() {
  const {add} = useCart();
  const [added, setAdded] = useState(false);
  const {id} = useParams();
  const [state, setState] = useState({loading: true});
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({loading: true});
    setFailed(false);
    fetchProduct(id, controller.signal).then(({product}) => {
      const first = product.variants.find(variant => variant.isAvailable) || product.variants[0];
      setColor(first?.color || '');
      setSize(first?.size || '');
      setState({loading: false, product});
    }).catch(error => {
      if (error.name !== 'AbortError') setState({loading: false, error: error.code === 'NOT_FOUND' ? 'Mahsulot topilmadi.' : error.code === 'DATABASE_UNAVAILABLE' ? 'Mahsulotlar bazasiga ulanib bo‘lmadi.' : 'Mahsulotni yuklab bo‘lmadi. Server ulanishini tekshiring.'});
    });
    return () => controller.abort();
  }, [id, attempt]);

  const product = state.product;
  const colors = useMemo(() => [...new Set((product?.variants || []).map(variant => variant.color))], [product]);
  const sizes = useMemo(() => [...new Set((product?.variants || []).filter(variant => variant.color === color).map(variant => variant.size))], [product, color]);
  const variant = product?.variants.find(item => item.color === color && item.size === size);

  if (state.loading) return <section className="catalog-section aisha-inner-page is-product"><LoadingState label="Mahsulot yuklanmoqda" rows={3} /></section>;
  if (state.error) return <section className="catalog-section aisha-inner-page is-product">
    <BreadcrumbNavigation items={[{label: 'Katalog', to: '/catalog'}, {label: 'Mahsulot'}]} />
    <ErrorState title="Mahsulotni ochib bo‘lmadi" message={state.error}><button className="btn btn-outline" type="button" onClick={() => setAttempt(value => value + 1)}>Qayta urinish</button><Link className="btn btn-ghost" to="/catalog"><FiArrowLeft aria-hidden="true" focusable="false" /> Katalogga qaytish</Link></ErrorState>
  </section>;

  return <section className="catalog-section aisha-inner-page is-product">
    <BreadcrumbNavigation items={[{label: 'Bosh sahifa', to: '/'}, {label: 'Katalog', to: '/catalog'}, {label: product.name}]} />
    <div className="product-layout aisha-product-layout">
      <PremiumCard className="product-photo aisha-product-photo">
        {product.imageUrl && !failed ? <img src={product.imageUrl} alt={`${product.name} — tasviriy demo surat`} width="1200" height="1200" fetchPriority="high" onError={() => setFailed(true)} /> : <span>Rasm mavjud emas</span>}
        <span className="aisha-image-caption">AISHA HOME · DEMO TASVIR</span>
      </PremiumCard>
      <div className="aisha-product-information">
        <ShopPageHeader eyebrow={`${product.category} · DEMO`} title={product.name} description={product.description} />
        {product.variants.length ? <>
          <fieldset className="fieldset aisha-variant-fields"><legend className="fieldset-legend">Variantni tanlang</legend>
            <label className="aisha-form-field">Rang<select className="select select-bordered" value={color} onChange={event => { setAdded(false); const next = event.target.value; setColor(next); const candidates = product.variants.filter(item => item.color === next); setSize((candidates.find(item => item.size === size) || candidates.find(item => item.isAvailable) || candidates[0])?.size || ''); }}>
              {colors.map(value => <option key={value}>{value}</option>)}
            </select></label>
            <label className="aisha-form-field">O‘lcham<select className="select select-bordered" value={size} onChange={event => { setAdded(false); setSize(event.target.value); }}>
              {sizes.map(value => <option key={value}>{value}</option>)}
            </select></label>
          </fieldset>
          {variant ? <div className="aisha-variant-summary"><p className="price">{productPricing(variant).discountPercent>0&&<><del>{money(productPricing(variant).originalPrice)}</del> <span>{productPricing(variant).discountPercent}% chegirma · </span></>}{money(productPricing(variant).finalPrice)}</p><StatusBadge>{variant.isAvailable ? 'Mavjud' : 'Sotuvda yo‘q'}</StatusBadge></div> : <p className="aisha-variant-unavailable" role="status">Bu variant mavjud emas.</p>}
          <details className="collapse collapse-arrow aisha-product-details" open>
            <summary className="collapse-title">Mahsulot xususiyatlari</summary>
            <div className="collapse-content"><dl>{[['O‘lcham', variant?.size], ['Rang', variant?.color], ['Material', variant?.material], ['GSM', variant?.gsm]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{typeof value === 'string' && value.trim() ? value : 'Ma’lumot kiritilmagan'}</dd></div>)}</dl></div>
          </details>
        </> : <p className="aisha-variant-unavailable">Variantlar hali kiritilmagan.</p>}
        <button className="btn btn-primary aisha-add-to-cart" type="button" disabled={!variant || !variant.isAvailable} onClick={() => { add(product, variant); setAdded(true); }}><FiShoppingBag aria-hidden="true" focusable="false" /> Savatga qo‘shish</button>
        {added && <p className="aisha-added-message" role="status">Mahsulot savatda. <Link className="btn btn-secondary" to="/cart">Savatni ko‘rish <FiArrowRight aria-hidden="true" focusable="false" /></Link></p>}
      </div>
    </div>
    <Link className="btn btn-ghost aisha-back-link" to="/catalog"><FiArrowLeft aria-hidden="true" focusable="false" /> Katalogga qaytish</Link>
  </section>;
}
