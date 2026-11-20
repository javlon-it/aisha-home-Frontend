import {useEffect,useRef,useState} from 'react';
import {adminProductAction} from '../../services/admin.js';
import './products.css';
const sections=[['branch','Do‘kon va olib ketish',[['name','Do‘kon nomi',120],['address','Do‘kon manzili',500],['phone','Aloqa telefoni',40],['email','Email',120],['hours','Ish vaqti',200],['pickupAddress','Olib ketish manzili',500]]],['shipping','Yetkazib berish',[['deliveryArea','Yetkazib berish hududlari',2000],['terms','Yetkazib berish shartlari',3000]]]];
function SettingsForm({kind,title,fields}){
 const [data,setData]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);const lock=useRef(false);
 useEffect(()=>{let active=true;adminProductAction('/settings/'+kind,'GET').then(r=>{if(active)setData(r.settings)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[kind]);
 async function save(e){e.preventDefault();if(lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');try{const r=await adminProductAction('/settings/'+kind,'PATCH',data);setData(r.settings);setNotice('Saqlandi.')}catch(e){setError(e.message)}finally{lock.current=false;setBusy(false)}}
 return <section><h2>{title}</h2>{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}{data?<form className="inventory-form" onSubmit={save}>{fields.map(([key,label,max])=><label key={key}>{label}<textarea maxLength={max} value={data[key]} disabled={busy} onChange={e=>setData({...data,[key]:e.target.value})}/></label>)}<button disabled={busy}>{busy?'Saqlanmoqda...':'Saqlash'}</button></form>:!error&&<p role="status">Yuklanmoqda...</p>}</section>;
}
export default function SettingsAdmin(){return <section className="panel inventory"><p className="eyebrow">BOSHQARUV PANELI</p><h1>Sozlamalar</h1><p>Faqat tasdiqlangan ma’lumotlarni kiriting. Noma’lum maydonlar bo‘sh qolishi mumkin. Yetkazish narxi har bir buyurtmada mijoz bilan kelishiladi.</p>{sections.map(([kind,title,fields])=><SettingsForm key={kind} kind={kind} title={title} fields={fields}/>)}</section>}
