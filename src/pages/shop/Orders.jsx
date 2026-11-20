import {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import {useCart} from '../../store/cart.jsx';
import {apiRequest} from '../../services/api.js';
import {money} from '../../components/shop/ProductCard.jsx';
import {BreadcrumbNavigation, EmptyState, ErrorState, LoadingState, OrderSummary, PremiumCard, SectionHeading, ShopPageHeader, StatusBadge} from '../../components/shop/ShopUI.jsx';
import {FiArrowLeft, FiArrowRight, FiMinus, FiPackage, FiPlus, FiShoppingBag, FiTrash2} from 'react-icons/fi';

const total = items => items.reduce((sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity, 0);
const originalTotal = items => items.reduce((sum, item) => sum + (item.originalPrice ?? item.price) * item.quantity, 0);
const orderErrorMessage = message => String(message || '').includes('Unexpected end of JSON input')
  ? 'Buyurtmalarni hozir yuklab bo‘lmadi. Keyinroq qayta urinib ko‘ring.'
  : message;

export function Cart() {
  const {items, change, remove} = useCart();
  return <section className="catalog-section aisha-inner-page is-cart">
    <ShopPageHeader eyebrow="XARID SAVATI" title="Savat" description="Tanlagan mahsulotlaringizni tekshirib, buyurtmani davom ettiring." breadcrumbs={[{label: 'Bosh sahifa', to: '/'}, {label: 'Savat'}]} />
    {!items.length ? <EmptyState icon={FiShoppingBag} eyebrow="KEYINGI QADAM" title="Savatingiz hozircha bo‘sh" description="Katalogdan o‘zingizga mos sochiqlarni tanlang. Tanlangan mahsulotlar shu yerda ko‘rinadi.">
      <Link className="btn btn-primary aisha-state-cta" to="/catalog">Katalogni ko‘rish <FiArrowRight aria-hidden="true" focusable="false" /></Link>
    </EmptyState> : <div className="aisha-cart-layout">
      <div className="aisha-cart-items"><SectionHeading eyebrow="TANLANGANLAR" title={`${items.length} ta mahsulot`} />
        {items.map(item => <PremiumCard as="article" className="aisha-cart-item" key={item.variantId}>
          <img src={item.imageUrl} alt="" width="640" height="640" loading="lazy" />
          <div className="aisha-cart-item-info"><p className="eyebrow">AISHA HOME · DEMO</p><h2>{item.name}</h2><p>{item.color} · {item.size}</p><p className="aisha-unit-price">Bir dona: {(item.discountPercent||0)>0&&<><del>{money(item.originalPrice??item.price)}</del> {item.discountPercent}% chegirma · </>}{money(item.finalPrice??item.price)}</p></div>
          <div className="aisha-cart-item-actions">
            <p className="aisha-line-total"><span>Mahsulot jami</span><strong>{money(item.price * item.quantity)}</strong></p>
            <div className="aisha-cart-control-row"><div className="join aisha-quantity-control" aria-label={`${item.name} miqdori`}>
              <button className="btn btn-ghost join-item" type="button" aria-label={`${item.name} miqdorini kamaytirish`} disabled={item.quantity <= 1} onClick={() => change(item.variantId, Math.max(1, item.quantity - 1))}><FiMinus aria-hidden="true" focusable="false" /></button>
              <input className="input input-bordered join-item" aria-label={`${item.name} miqdori`} type="number" min="1" max="100" value={item.quantity} onChange={e => { const quantity = Number(e.target.value); if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 100) change(item.variantId, quantity); }} />
              <button className="btn btn-ghost join-item" type="button" aria-label={`${item.name} miqdorini oshirish`} disabled={item.quantity >= 100} onClick={() => change(item.variantId, Math.min(100, item.quantity + 1))}><FiPlus aria-hidden="true" focusable="false" /></button>
            </div><button className="btn btn-ghost btn-square aisha-remove-item" type="button" aria-label={`${item.name} mahsulotini savatdan olib tashlash`} title="Savatdan olib tashlash" onClick={() => remove(item.variantId)}><FiTrash2 aria-hidden="true" focusable="false" /></button></div>
          </div>
        </PremiumCard>)}
      </div>
      <OrderSummary className="aisha-cart-summary">
        <div className="aisha-summary-row"><span>Mahsulotlar (asl narx)</span><strong>{money(originalTotal(items))}</strong></div>
        {total(items)!==originalTotal(items)&&<div className="aisha-summary-row"><span>Mahsulot chegirmasi</span><strong>−{money(originalTotal(items)-total(items))}</strong></div>}
        <div className="aisha-summary-row"><span>Chegirmadan keyin</span><strong>{money(total(items))}</strong></div>
        <div className="aisha-cart-summary-notes"><p className="aisha-summary-note">Yetkazib berish usuli keyingi bosqichda tanlanadi. Narx va qoldiq serverda qayta tekshiriladi.</p>
          <p className="aisha-demo-note">Yetkazib berish narxini sotuvchi mijoz bilan kelishadi; o‘zi olib ketish bepul.</p></div>
        <div className="aisha-summary-total"><span>Mahsulotlar jami</span><strong>{money(total(items))}</strong></div>
        <Link className="btn btn-primary aisha-checkout-cta" to="/checkout">Buyurtmani davom ettirish <FiArrowRight aria-hidden="true" focusable="false" /></Link>
      </OrderSummary>
    </div>}
  </section>;
}

export function Checkout() {
  const {items, clear} = useCart();
  const navigate = useNavigate();
  const lock = useRef(false);
  const [method, setMethod] = useState('delivery');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  function prepareSession() {
    setError('');
    apiRequest('/orders/session').then(() => setSessionReady(true)).catch(e => setError(e.message || 'Sessiya ochilmadi.'));
  }

  useEffect(() => { prepareSession(); }, []);

  async function submit(event) {
    event.preventDefault();
    if (lock.current || !sessionReady) return;
    lock.current = true;
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const body = {name: form.get('name'), phone: form.get('phone'), address: form.get('address') || '', method, consent: form.get('consent') === 'on', items: items.map(({variantId, quantity, price, originalPrice, discountPercent}) => ({variantId, quantity, expectedPrice: originalPrice ?? price, expectedDiscountPercent: discountPercent ?? 0}))};
    const signature = JSON.stringify(body);
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem('aisha-order-request') || 'null'); } catch {}
    if (!saved || saved.signature !== signature) {
      saved = {signature, key: crypto.randomUUID()};
      sessionStorage.setItem('aisha-order-request', JSON.stringify(saved));
    }
    try {
      const data = await apiRequest('/orders', {method: 'POST', headers: {'Content-Type': 'application/json', 'Idempotency-Key': saved.key}, body: signature});
      clear();
      sessionStorage.removeItem('aisha-order-request');
      navigate('/checkout/success', {replace: true, state: {id: data.orderId}});
    } catch (err) { setError(err.message || 'Buyurtma yuborilmadi.'); }
    finally { lock.current = false; setBusy(false); }
  }

  if (!items.length) return <section className="catalog-section aisha-inner-page is-checkout">
    <ShopPageHeader eyebrow="BUYURTMANI DAVOM ETTIRISH" title="Buyurtma berish" breadcrumbs={[{label: 'Savat', to: '/cart'}, {label: 'Checkout'}]} />
    <EmptyState icon={FiShoppingBag} title="Savatingiz bo‘sh" description="Buyurtma berish uchun avval katalogdan mahsulot tanlang."><Link className="btn btn-primary aisha-state-cta" to="/catalog">Katalogga o‘tish <FiArrowRight aria-hidden="true" focusable="false" /></Link></EmptyState>
  </section>;

  return <section className="catalog-section aisha-inner-page is-checkout">
    <ShopPageHeader eyebrow="BUYURTMANI RASMIYLASHTIRISH" title="Aloqa va yetkazib berish" description="Ma’lumotlarni kiriting va buyurtma xulosasini tekshiring." breadcrumbs={[{label: 'Savat', to: '/cart'}, {label: 'Checkout'}]} />
    <p className="notice aisha-demo-notice">DEMO: mahsulot va yetkazish narxlari namunaviy. Bu sahifa haqiqiy to‘lovni amalga oshirmaydi.</p>
    <div className="checkout-grid aisha-checkout-grid">
      <form className="aisha-checkout-form" onSubmit={submit}>
        <fieldset className="fieldset aisha-form-fieldset">
          <legend className="fieldset-legend">Xaridor ma’lumotlari</legend>
          <label className="aisha-form-field">Ism<input className="input input-bordered" name="name" required minLength="2" maxLength="100" autoComplete="name" /></label>
          <label className="aisha-form-field">Telefon<input className="input input-bordered" name="phone" required type="tel" inputMode="tel" minLength="9" maxLength="20" autoComplete="tel" /><span className="aisha-field-hint">Masalan: 99 123 45 67</span></label>
        </fieldset>
        <fieldset className="fieldset aisha-form-fieldset">
          <legend className="fieldset-legend">Qabul qilish</legend>
          <label className="aisha-form-field">Yetkazib berish usuli<select className="select select-bordered" value={method} onChange={event => setMethod(event.target.value)}><option value="delivery">Yetkazib berish — narx telefon orqali kelishiladi</option><option value="pickup">O‘zi olib ketish — bepul</option></select></label>
          {method === 'delivery' && <label className="aisha-form-field">To‘liq manzil<input className="input input-bordered" name="address" required minLength="5" maxLength="300" autoComplete="street-address" /><span className="aisha-field-hint">Ko‘cha, uy va xonadon ma’lumotini kiriting.</span></label>}
        </fieldset>
        <label className="aisha-consent-field"><input className="checkbox" name="consent" type="checkbox" required /> <span>Demo buyurtma uchun ma’lumotlarim qayta ishlanishiga roziman</span></label>
        {error && <ErrorState title="Sessiyani tayyorlab bo‘lmadi" message={error}>{!sessionReady && <button className="btn btn-outline" type="button" onClick={prepareSession}>Ulanishni qayta tekshirish</button>}</ErrorState>}
        <button className="btn btn-primary aisha-submit-order" type="submit" disabled={busy || !sessionReady}>{busy ? 'Yuborilmoqda…' : 'Demo buyurtmani tasdiqlash'}</button>
      </form>
      <OrderSummary className="aisha-checkout-summary">
        <div className="aisha-summary-lines">{items.map(item => <div className="aisha-summary-line" key={item.variantId}><span>{item.name} · {item.color} · {item.size} × {item.quantity}{(item.discountPercent||0)>0&&<> <del>{money((item.originalPrice??item.price)*item.quantity)}</del> · {item.discountPercent}% chegirma</>}</span><strong>{money((item.finalPrice??item.price) * item.quantity)}</strong></div>)}</div>
        <div className="aisha-summary-row"><span>Mahsulotlar (asl narx)</span><strong>{money(originalTotal(items))}</strong></div>
        {total(items)!==originalTotal(items)&&<div className="aisha-summary-row"><span>Mahsulot chegirmasi</span><strong>−{money(originalTotal(items)-total(items))}</strong></div>}
        <div className="aisha-summary-row"><span>Chegirmadan keyin</span><strong>{money(total(items))}</strong></div>
        <div className="aisha-summary-row"><span>Yetkazish</span><strong>{method === 'delivery' ? 'Sotuvchi bilan kelishiladi' : 'Bepul'}</strong></div>
        <div className="divider aisha-summary-divider" aria-hidden="true" />
        <div className="aisha-summary-total"><span>Umumiy summa</span><strong>{method === 'delivery' ? 'Hali aniqlanmagan' : money(total(items))}</strong></div>
        <p className="aisha-summary-note">Yetkazish haqi kelishilgandan keyingina yakuniy summa belgilanadi. Narx va qoldiq serverda qayta tekshiriladi.</p>
      </OrderSummary>
    </div>
  </section>;
}

export function Success() {
  const {state} = useLocation();
  return <section className="catalog-section aisha-inner-page is-success">
    <BreadcrumbNavigation items={[{label: 'Bosh sahifa', to: '/'}, {label: 'Buyurtma holati'}]} />
    <EmptyState icon={FiPackage} eyebrow="DEMO BUYURTMA" title={state?.id ? 'Demo buyurtmangiz qabul qilindi' : 'Buyurtma ma’lumoti yo‘q'} description={state?.id ? `Buyurtma raqami: ${state.id}. Bu haqiqiy savdo yoki to‘lov tasdig‘i emas.` : 'Buyurtma raqami ko‘rsatilmagan. Bu haqiqiy savdo yoki to‘lov tasdig‘i emas.'}>
      <Link className="btn btn-primary aisha-state-cta" to="/orders">Buyurtmalarim <FiArrowRight aria-hidden="true" focusable="false" /></Link><Link className="btn btn-ghost" to="/">Bosh sahifa</Link>
    </EmptyState>
  </section>;
}

export function Orders() {
  const [state, setState] = useState({loading: true});
  useEffect(() => { apiRequest('/orders').then(data => setState({orders: data.orders})).catch(error => setState({error: error.message})); }, []);
  return <section className="catalog-section aisha-inner-page is-orders">
    <ShopPageHeader eyebrow="XARIDLAR TARIXI" title="Buyurtmalarim" description="Oldingi buyurtmalaringizning holati va tafsilotlarini ko‘ring." breadcrumbs={[{label: 'Bosh sahifa', to: '/'}, {label: 'Buyurtmalarim'}]} />
    {state.loading ? <div className="aisha-order-loading" role="status" aria-label="Buyurtmalar yuklanmoqda">{[1, 2].map(key => <PremiumCard className="aisha-order-skeleton" key={key}><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /></PremiumCard>)}</div> : state.error ? <ErrorState title="Buyurtmalarni yuklab bo‘lmadi" message={orderErrorMessage(state.error)} /> : state.orders.length ? <div className="aisha-order-list">{state.orders.map(order => <PremiumCard as="article" className="aisha-order-card" key={order._id}>
      <div className="aisha-order-card-heading"><div><p className="eyebrow">BUYURTMA RAQAMI</p><h2>#{order._id}</h2></div><StatusBadge>{order.status}</StatusBadge></div>
      <div className="aisha-order-card-meta"><div><span>Jami</span><strong>{order.total == null ? 'Yakuniy summa kelishiladi' : money(order.total)}</strong></div></div>
      <Link className="btn btn-outline aisha-order-link" to={`/orders/${order._id}`}>Tafsilotlarni ko‘rish <FiArrowRight aria-hidden="true" focusable="false" /></Link>
    </PremiumCard>)}</div> : <EmptyState icon={FiPackage} eyebrow="XARIDLAR TARIXI" title="Hozircha buyurtmalaringiz yo‘q" description="Rasmiylashtirilgan buyurtmalar shu sahifada ko‘rinadi."><Link className="btn btn-primary aisha-state-cta" to="/catalog">Katalogni ko‘rish <FiArrowRight aria-hidden="true" focusable="false" /></Link></EmptyState>}
  </section>;
}

export function OrderDetail() {
  const {id} = useParams();
  const [state, setState] = useState({loading: true});
  useEffect(() => { apiRequest('/orders/' + encodeURIComponent(id)).then(data => setState({order: data.order})).catch(error => setState({error: error.message})); }, [id]);
  const order = state.order;
  return <section className="catalog-section aisha-inner-page is-order-detail">
    <BreadcrumbNavigation items={[{label: 'Buyurtmalarim', to: '/orders'}, {label: 'Tafsilotlar'}]} />
    {state.loading ? <LoadingState label="Buyurtma ma’lumotlari yuklanmoqda" rows={3} /> : state.error ? <ErrorState title="Buyurtma tafsilotlarini yuklab bo‘lmadi" message={orderErrorMessage(state.error)} /> : <>
      <ShopPageHeader eyebrow="BUYURTMA TAFSILOTLARI · DEMO" title={`Buyurtma #${order._id}`} description="Bu ma’lumot demo holatida, haqiqiy to‘lov bajarilmagan." />
      <div className="aisha-order-detail-layout"><PremiumCard className="aisha-detail-card"><div className="aisha-order-card-heading"><SectionHeading eyebrow="BUYURTMA HOLATI" title={order.status} /><StatusBadge>{order.status}</StatusBadge></div>
        <details className="collapse collapse-arrow aisha-order-items-collapse" open><summary className="collapse-title">Mahsulotlar va hisob</summary><div className="collapse-content">{order.items.map((item, index) => <div className="aisha-detail-line" key={index}><span>{item.name} · {item.color} · {item.size} × {item.quantity}{(item.discountPercent||0)>0&&<> · {item.discountPercent}% chegirma · asl narx {money((item.originalPrice??item.price)*item.quantity)}</>}</span><strong>{money(item.price * item.quantity)}</strong></div>)}<p>Chegirma: {money(order.discountTotal??0)}</p><p>Mahsulotlar jami: {money(order.subtotal)}</p></div></details>
        <dl className="aisha-shipping-details"><div><dt>Qabul qilish</dt><dd>{order.shippingSnapshot.method === 'pickup' ? 'Filialdan olish' : 'Yetkazib berish'}</dd></div>{order.shippingSnapshot.address && <div><dt>Manzil</dt><dd>{order.shippingSnapshot.address}</dd></div>}<div><dt>Yetkazish</dt><dd>{order.shippingSnapshot.method === 'delivery' && order.shippingSnapshot.fee == null ? 'Sotuvchi bilan kelishiladi' : money(order.shippingSnapshot.fee)}</dd></div><div><dt>Jami</dt><dd>{order.total == null ? 'Yakuniy summa kelishiladi' : money(order.total)}</dd></div></dl>
      </PremiumCard><Link className="btn btn-ghost aisha-back-link" to="/orders"><FiArrowLeft aria-hidden="true" focusable="false" /> Buyurtmalarga qaytish</Link></div>
    </>}
  </section>;
}
