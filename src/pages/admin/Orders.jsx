import {useCallback,useEffect,useRef,useState} from 'react';
import {adminOrders,adminOrderAction} from '../../services/admin.js';
import './products.css';
import './orders.css';
import SalesAdmin from './Sales.jsx';

const money=value=>Number.isFinite(value)?new Intl.NumberFormat('uz-UZ').format(value)+' so‘m':'Aniqlanmagan';
const nextStatuses={Yangi:['Jarayonda','Bekor qilingan'],Jarayonda:['Yakunlangan','Bekor qilingan']};

export default function OrdersAdmin(){
 const [orders,setOrders]=useState([]),[page,setPage]=useState(1),[hasMore,setHasMore]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const lock=useRef(false);
 const refresh=useCallback(async()=>{const result=await adminOrders(page);setOrders(result.orders);setHasMore(result.hasMore)},[page]);
 useEffect(()=>{let active=true;setLoading(true);setError('');setOrders([]);setHasMore(false);adminOrders(page).then(result=>{if(active){setOrders(result.orders);setHasMore(result.hasMore)}}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[page]);
 async function run(action,success){if(lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');try{await action();await refresh();setNotice(success)}catch(e){setError(e.message||'Amalni bajarib bo‘lmadi.')}finally{lock.current=false;setBusy(false)}}
 function statusChange(order,status){if(!status)return;if(status==='Bekor qilingan'&&!window.confirm('Buyurtma bekor qilinadi va band qilingan mahsulot omborga qaytariladi. Davom etasizmi?'))return;run(()=>adminOrderAction(order._id,'status',{status}),'Buyurtma holati yangilandi.')}
 function saveFee(e,order){e.preventDefault();const fee=Number(new FormData(e.currentTarget).get('fee'));run(()=>adminOrderAction(order._id,'delivery-fee',{fee}),'Yetkazish narxi saqlandi.')}
 return <section className="panel inventory admin-orders"><p className="eyebrow">BOSHQARUV PANELI</p><h1>Buyurtmalar</h1><SalesAdmin/><p>Internet buyurtmalari va ularning holati.</p>
 {error&&<p role="alert" className="admin-error">{error}</p>}{notice&&<p role="status">{notice}</p>}
 {loading?<p role="status">Yuklanmoqda...</p>:error&&!orders.length?null:!orders.length?<p>Buyurtmalar yo‘q.</p>:orders.map(order=><article className="admin-order" key={order._id}>
  <div className="inventory-heading"><h2>Buyurtma #{order._id}</h2><strong>{order.status}</strong></div>
  <p>Mijoz: {order.customerSnapshot?.name||'Ko‘rsatilmagan'}</p><p>Telefon: {order.customerSnapshot?.phone||'Ko‘rsatilmagan'}</p>
  <p>Qabul qilish: {order.shippingSnapshot?.method==='pickup'?'O‘zi olib ketish':'Yetkazib berish'}</p>{order.shippingSnapshot?.address&&<p>Manzil: {order.shippingSnapshot.address}</p>}
  <h3>Mahsulotlar</h3><ul>{(order.items||[]).map((item,index)=><li key={String(item.variantId)+index}>{item.name} · {item.color} · {item.size} × {item.quantity} — {money(item.price*item.quantity)}</li>)}</ul>
  <p>Mahsulotlar: {money(order.subtotal)}</p><p>Yetkazish: {order.shippingSnapshot?.method==='delivery'&&order.shippingSnapshot?.fee==null?'Mijoz bilan kelishiladi':money(order.shippingSnapshot?.fee)}</p><p><strong>Jami: {order.total==null?'Hali tasdiqlanmagan':money(order.total)}</strong></p>
  {order.status==='Yangi'&&<p>24 soatdan so‘ng buyurtmani tasdiqlab bo‘lmaydi; tizim ishlaganda u bekor qilinadi.</p>}
  {nextStatuses[order.status]&&<><label className="admin-order-status">Holatni o‘zgartirish<select disabled={busy} value="" onChange={e=>statusChange(order,e.target.value)}><option value="">Tanlang</option>{nextStatuses[order.status].map(status=><option key={status} value={status}>{status}</option>)}</select></label>
  {order.shippingSnapshot?.method==='delivery'&&<form className="inventory-form" key={order._id+'-'+order.shippingSnapshot?.fee} onSubmit={e=>saveFee(e,order)}><label>Mijoz bilan kelishilgan yetkazish narxi, so‘m<input name="fee" type="number" min="0" max="1000000000" step="1" defaultValue={order.shippingSnapshot?.fee??''} required/></label><button disabled={busy}>Kelishilgan narxni saqlash</button></form>}</>}
 </article>)}
 <nav className="admin-orders-pages" aria-label="Buyurtmalar sahifalari"><button disabled={busy||loading||page===1} onClick={()=>setPage(p=>p-1)}>Oldingi</button><span>{page}-sahifa</span><button disabled={busy||loading||!hasMore} onClick={()=>setPage(p=>p+1)}>Keyingi</button></nav></section>;
}
