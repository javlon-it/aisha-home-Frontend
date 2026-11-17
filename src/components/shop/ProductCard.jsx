import {Link} from 'react-router-dom';
import {useState} from 'react';
export const money=n=>new Intl.NumberFormat('uz-UZ').format(n)+' so‘m';
export default function ProductCard({product}){
 const [failed,setFailed]=useState(false),vs=product.matchingVariants||product.variants,price=vs.length?Math.min(...vs.map(v=>v.price)):null;
 return <article className="catalog-card"><Link className="catalog-image" to={'/products/'+product.id} aria-label={product.name+' tafsiloti'}>{!failed&&product.imageUrl?<img src={product.imageUrl} alt={product.name+' — tasviriy demo surat'} loading="lazy" onError={()=>setFailed(true)}/>:<span>Rasm mavjud emas</span>}</Link><div className="catalog-copy"><span className="eyebrow">{product.category} · DEMO</span><h3><Link to={'/products/'+product.id}>{product.name}</Link></h3><p className="price">{price===null?'Narx ko‘rsatilmagan':money(price)+' dan'}</p><p>{[...new Set(vs.map(v=>v.size))].join(', ')||'O‘lcham ko‘rsatilmagan'}</p><p className={vs.some(v=>v.isAvailable)?'available':'unavailable'}>{vs.some(v=>v.isAvailable)?'Mavjud':'Sotuvda yo‘q'}</p><Link className="button" to={'/products/'+product.id}>Mahsulotni ko‘rish →</Link></div></article>
}
