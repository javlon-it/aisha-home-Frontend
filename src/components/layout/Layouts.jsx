import {useEffect,useRef,useState} from 'react';
import {Link,NavLink,Outlet,useLocation} from 'react-router-dom';
import {FiInstagram,FiMapPin,FiMenu,FiPhone,FiX} from 'react-icons/fi';
import {adminLogout} from '../../services/admin.js';
import {useCart} from '../../store/cart.jsx';
import {useShopMotion} from '../shop/useShopMotion.js';
import {adminSections} from '../../config/admin-sections.js';
const defaultShopTitle='AISHA HOME — Uy uchun sochiqlar';
function shopPageTitle(pathname){
 if(pathname==='/catalog')return 'Sochiqlar katalogi | AISHA HOME';
 if(pathname==='/cart')return 'Savat | AISHA HOME';
 if(pathname==='/orders'||pathname.startsWith('/orders/'))return 'Buyurtmalarim | AISHA HOME';
 if(pathname==='/checkout')return 'Buyurtmani rasmiylashtirish | AISHA HOME';
 if(pathname.startsWith('/products/'))return 'Mahsulot | AISHA HOME';
 if(pathname==='/checkout/success')return 'Buyurtma holati | AISHA HOME';
 return defaultShopTitle;
}
export function ShopLayout(){
 const {items}=useCart();
 const [open,setOpen]=useState(false),header=useRef(null),toggle=useRef(null),location=useLocation();
 const motionRef=useShopMotion(location.pathname);
 useEffect(()=>{setOpen(false)},[location.pathname]);
 useEffect(()=>{
  const title=shopPageTitle(location.pathname);
  const description='AISHA HOME — uy uchun sochiqlar katalogi.';
  document.title=title;
  document.querySelector('meta[name="description"]')?.setAttribute('content',description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content',title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);
 },[location.pathname]);
 useEffect(()=>{function key(e){if(e.key==='Escape'&&open){setOpen(false);toggle.current?.focus()}}function outside(e){if(open&&!header.current?.contains(e.target))setOpen(false)}const media=window.matchMedia('(min-width: 701px)');function wide(e){if(e.matches)setOpen(false)}document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);media.addEventListener('change',wide);return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);media.removeEventListener('change',wide)}},[open]);
 return <><a className="skip-link" href="#shop-content">Asosiy kontentga o&#8217;tish</a><div className="demo-notice" role="note"><strong>DEMO KATALOG</strong> — rasmlar, xususiyatlar, narx va qoldiq namunaviy. Haqiqiy ma’lumotlar biznes tomonidan kiritiladi.</div><header data-theme="aisha" className="store-header-v2" ref={header}><Link to="/" className="brand"><img className="brand-logo" src="/brand/aisha-brand-lockup-display.png" alt="AISHA HOME — Uy uchun sochiqlar" width="1325" height="286" /></Link><nav className="shop-desktop-nav" aria-label="Asosiy navigatsiya"><NavLink className="aisha-nav-button btn btn-ghost" to="/">Bosh sahifa</NavLink><NavLink className="aisha-nav-button btn btn-ghost" to="/catalog">Sochiqlar</NavLink><NavLink className="aisha-nav-button btn btn-ghost" to="/orders">Buyurtmalarim</NavLink><NavLink className="aisha-nav-button btn btn-ghost" to="/cart">Savat ({items.reduce((n,i)=>n+i.quantity,0)})</NavLink></nav><button ref={toggle} className="shop-menu-toggle btn btn-ghost" type="button" aria-expanded={open} aria-controls="shop-mobile-menu" aria-label={open?'Menyuni yopish':'Menyuni ochish'} onClick={()=>setOpen(v=>!v)}>{open?<FiX className="size-5" aria-hidden="true" focusable="false"/>:<FiMenu className="size-5" aria-hidden="true" focusable="false"/>}</button><nav id="shop-mobile-menu" className="shop-mobile-nav" aria-label="Mobil navigatsiya" hidden={!open}><Link className="aisha-nav-button btn btn-ghost" to="/" onClick={()=>setOpen(false)}>Bosh sahifa</Link><Link className="aisha-nav-button btn btn-ghost" to="/catalog" onClick={()=>setOpen(false)}>Sochiqlar</Link><NavLink className="aisha-nav-button btn btn-ghost" to="/orders">Buyurtmalarim</NavLink><NavLink className="aisha-nav-button btn btn-ghost" to="/cart">Savat ({items.reduce((n,i)=>n+i.quantity,0)})</NavLink></nav></header><main id="shop-content" data-theme="aisha" className="shop-main" ref={motionRef}><Outlet/></main><footer data-theme="aisha" className="shop-footer"><div className="shop-footer-about"><p className="shop-footer-brand"><img src="/brand/aisha-brand-lockup-display.png" alt="AISHA HOME" width="1325" height="286" /></p><p>Uy uchun sochiqlar</p><p className="shop-footer-demo">Demo katalog · rasmlar va mahsulot ma’lumotlari namunaviy.</p></div><nav aria-label="Footer navigatsiyasi"><h2>Do‘kon</h2><Link className="shop-footer-link" to="/catalog">Sochiqlar</Link><Link className="shop-footer-link" to="/orders">Buyurtmalarim</Link><Link className="shop-footer-link" to="/cart">Savat</Link></nav><div className="shop-footer-contact"><h2>Aloqa</h2><a className="shop-footer-contact-link" href="tel:993500070"><FiPhone aria-hidden="true" focusable="false"/><span>99 350 00 70</span></a><p className="shop-footer-contact-link"><FiMapPin aria-hidden="true" focusable="false"/><span>улица Мукими, 20В, Tashkent</span></p><a className="shop-footer-contact-link" href="https://www.instagram.com/aishahome_uzb/" target="_blank" rel="noopener noreferrer"><FiInstagram aria-hidden="true" focusable="false"/><span>Instagram</span></a></div><div className="shop-footer-bottom"><span>© AISHA HOME</span><span>Katalog ma’lumotlari namunaviy</span></div></footer></>
}
export function AdminLayout(){return <div className="admin-layout"><aside className="sidebar"><Link className="admin-brand" to="/admin">AISHA <small>Do‘kon boshqaruvi</small></Link><nav aria-label="Admin bo‘limlari">{adminSections.map(({path,title})=><NavLink key={path} end={!path} to={path?`/admin/${path}`:'/admin'}>{title}</NavLink>)}</nav><button type="button" className="admin-logout" onClick={async()=>{try{await adminLogout();window.location.assign('/admin/login')}catch{alert('Chiqib bo’lmadi. Qayta urinib ko’ring.')}}}>Chiqish</button><Link to="/" className="store-link">Do‘konga o‘tish →</Link></aside><main className="admin-main"><header>Admin panel · V2 poydevori</header><Outlet/></main></div>}
