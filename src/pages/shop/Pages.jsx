import {Link} from 'react-router-dom';
import {useCatalog} from '../../hooks/useCatalog.js';
import ProductCard from '../../components/shop/ProductCard.jsx';
import {FiArrowRight,FiCheck,FiDroplet,FiLayers,FiPackage} from 'react-icons/fi';
const homeCategories=[
 {title:'Hammom sochiqlari',image:'/demo/demo-bath.jpg',alt:'Hammom sochiqlari — tasviriy demo surat',icon:FiDroplet},
 {title:'Yuz sochiqlari',image:'/demo/demo-face.jpg',alt:'Yuz sochiqlari — tasviriy demo surat',icon:FiLayers},
 {title:'Sochiq to‘plamlari',image:'/demo/demo-set.jpg',alt:'Sochiq to‘plami — tasviriy demo surat',icon:FiPackage},
];
export function Home(){
 const {loading,products,error,retry}=useCatalog();
 return <div className="home-page">
  <section className="home-hero">
   <div className="home-hero-copy">
    <p className="eyebrow">AISHA HOME <span aria-hidden="true">/</span> UY TEKSTILI</p>
    <h1>Har kungi qulaylik, nafis tanlov bilan.</h1>
    <p className="home-hero-lede">Uy uchun sochiqlarni bir joyda ko‘rib chiqing. Rang, o‘lcham va mavjud variantlarni katalogda solishtiring.</p>
    <div className="home-hero-actions"><Link className="aisha-nav-button btn btn-primary" to="/catalog">Katalogni ko‘rish <FiArrowRight aria-hidden="true" focusable="false"/></Link><span className="home-demo-caption">Tasvirlar va katalog ma’lumotlari demo.</span></div>
   </div>
   <figure className="home-hero-visual"><img src="/demo/demo-bath.jpg" alt="Taxlangan hammom sochiqlari — tasviriy demo surat"/><figcaption><span>UY UCHUN TEKSTIL</span><span>01 / AISHA HOME</span></figcaption></figure>
   <div className="home-hero-index" aria-hidden="true">A<span>·</span>01</div>
  </section>

  <section className="home-section home-categories" aria-labelledby="home-categories-title">
   <div className="home-section-heading"><div><p className="eyebrow">KATALOG YO‘NALISHLARI</p><h2 id="home-categories-title">Uy uchun sochiqlar</h2></div><p>Kerakli turdan boshlang, so‘ng mavjud variantlarni katalogda ko‘ring.</p></div>
   <div className="home-category-grid">{homeCategories.map(({title,image,alt,icon:Icon},index)=><article className="home-category-card" key={title}><Link to="/catalog" aria-label={`${title} — katalogni ko‘rish`}><span className="home-category-image"><img src={image} alt={alt} loading="lazy"/><span className="home-category-index">0{index+1}</span></span><span className="home-category-title"><span><Icon aria-hidden="true" focusable="false"/>{title}</span><FiArrowRight aria-hidden="true" focusable="false"/></span></Link></article>)}</div>
   <p className="home-demo-note"><FiCheck aria-hidden="true" focusable="false"/> Rasmlar tasviriy; aniq mahsulot ko‘rinishini bildiruvchi foto emas.</p>
  </section>

  <section className="home-featured home-section" aria-labelledby="home-featured-title"><div className="home-section-heading"><div><p className="eyebrow">KATALOGDAN</p><h2 id="home-featured-title">Tanlab ko‘ring</h2></div><Link className="aisha-nav-button btn btn-ghost" to="/catalog">Barchasini ko‘rish <FiArrowRight className="size-4 shrink-0" aria-hidden="true" focusable="false"/></Link></div>{loading?<p className="loading-state" role="status">Mahsulotlar yuklanmoqda…</p>:error?<div className="home-error" role="alert"><p>{error}</p><button className="aisha-nav-button btn btn-outline" onClick={retry}>Qayta urinish</button></div>:products.length?<div className="catalog-grid">{products.slice(0,3).map(p=><ProductCard key={p.id} product={p}/>)}</div>:<p className="empty-state">Hozircha mahsulotlar yo‘q.</p>}</section>

  <section className="home-shopping" aria-labelledby="home-shopping-title"><div className="home-shopping-heading"><p className="eyebrow">QULAY TANLOV</p><h2 id="home-shopping-title">Mahsulotni tanlashdan buyurtmagacha</h2><p>Saytdagi mavjud ma’lumotlar orqali tanlovingizni bosqichma-bosqich tekshiring.</p></div><ol className="home-shopping-steps"><li><span>01</span><h3>Variantlarni ko‘ring</h3><p>Katalogda mahsulot, rang va o‘lcham ma’lumotlarini ko‘zdan kechiring.</p></li><li><span>02</span><h3>Savatchada tekshiring</h3><p>Tanlagan mahsulot va miqdorni buyurtmadan oldin ko‘rib chiqing.</p></li><li><span>03</span><h3>Shartlarni ko‘rib chiqing</h3><p>Checkout ekranidagi demo belgilari va ma’lumotlarni diqqat bilan tekshiring.</p></li></ol></section>

  <section className="home-brand-story"><div className="home-story-image"><img src="/demo/demo-set.jpg" alt="Taxlangan sochiqlar — tasviriy demo surat" loading="lazy"/><span>DEMO TASVIR</span></div><div className="home-story-copy"><p className="eyebrow">AISHA HOME HAQIDA</p><h2>Uy tekstilini tanlash uchun sodda va ravon manzil.</h2><p>AISHA Home katalogida hammom, yuz va sochiq to‘plamlarini ko‘rib, mavjud variantlarni o‘z ehtiyojingizga qarab solishtirishingiz mumkin.</p><Link className="aisha-nav-button btn btn-outline" to="/catalog">Katalogga o‘tish <FiArrowRight aria-hidden="true" focusable="false"/></Link></div></section>

  <section className="home-final-cta"><p className="eyebrow">KEYINGI QADAM</p><h2>O‘zingizga mos variantni toping.</h2><p>Katalogdagi mavjud mahsulotlarni ko‘rib chiqing.</p><Link className="aisha-nav-button btn btn-primary" to="/catalog">Katalogni ochish <FiArrowRight aria-hidden="true" focusable="false"/></Link></section>
 </div>
}
export function Foundation({title,admin=false}){return <section className={admin?'panel':'page'}><p className="eyebrow">AISHA HOME V2</p><h1>{title}</h1><p>Bu sahifaning tuzilishi tayyorlanmoqda. Ma’lumotlar va amallar keyingi bosqichda ulanadi.</p></section>}
