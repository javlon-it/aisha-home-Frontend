import {useEffect,useState} from 'react';
import {adminDashboard} from '../../services/admin.js';
import './dashboard.css';

const periods=[['daily','Kunlik'],['weekly','Haftalik'],['monthly','Oylik'],['yearly','Yillik']];
const money=value=>value===null||!Number.isFinite(value)?'Aniqlanmagan':new Intl.NumberFormat('uz-UZ').format(value)+' so‘m';
export default function Dashboard(){
 const [period,setPeriod]=useState('monthly'),[date,setDate]=useState(()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tashkent'}).format(new Date())),[state,setState]=useState({loading:true});
 useEffect(()=>{let active=true;setState({loading:true});adminDashboard(period,date).then(data=>{if(active)setState({data})}).catch(error=>{if(active)setState({error:error.message||'Statistika olinmadi.'})});return()=>{active=false}},[period,date]);
 const data=state.data,summary=data?.summary;
 return <section className="panel admin-dashboard"><p className="eyebrow">BOSHQARUV PANELI</p><h1>Bosh sahifa</h1><p>Hisoblar faqat bazadagi yakunlangan savdo va qaytarishlardan olinadi.</p>
  <div className="dashboard-filters"><label>Davr<select value={period} onChange={e=>setPeriod(e.target.value)}>{periods.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label>Sanasi<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></div>
  {state.loading?<p role="status">Statistika yuklanmoqda…</p>:state.error?<p role="alert">{state.error}</p>:<>
   <p className="dashboard-range">Vaqt zonasi: {data.range.timeZone} · {data.range.startDate} – {data.range.endDateExclusive} (oxirgi sana kiritilmaydi)</p>
   <div className="dashboard-cards">
    <article><span>Sof savdo tushumi</span><strong>{money(summary.netSales)}</strong><small>Yakunlangan savdo minus qaytarishlar</small></article>
    <article><span>Sotilgan mahsulot tannarxi</span><strong>{money(summary.costOfGoodsSold)}</strong><small>{summary.missingCostRecords?`${summary.missingCostRecords} ta savdo/qaytarishda tannarx tarixi yetishmaydi`:'Tarixiy tannarx nusxalari asosida'}</small></article>
    <article><span>Yalpi foyda</span><strong>{money(summary.grossProfit)}</strong><small>Sof savdo − mahsulot tannarxi</small></article>
    <article><span>Chegirmalar</span><strong>{money(summary.discounts)}</strong><small>Internet va jismoniy savdolarda qayd etilgan</small></article>
    <article><span>Qaytarishlar</span><strong>{money(summary.returns)}</strong><small>{summary.returnRecords} ta qaytarish yozuvi</small></article>
    <article><span>Mijozlar</span><strong>{summary.customers.new} yangi · {summary.customers.repeat} takroriy</strong><small>CRM profiliga bog‘langan yakunlangan savdolar</small></article>
   </div>
   <h2>Savdo kanallari</h2><div className="dashboard-cards"><article><span>Internet, yakunlangan buyurtma</span><strong>{money(summary.onlineSales)}</strong><small>{summary.onlineOrders} ta buyurtma · yetkazish: {money(summary.deliveryFees)}</small></article><article><span>Jismoniy do‘kon, chegirmadan keyin</span><strong>{money(summary.physicalSalesAfterDiscount)}</strong><small>{summary.physicalSales} ta savdo</small></article></div>
   <h2>Eng ko‘p sotilgan mahsulotlar</h2>{data.topProducts.length?<div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Mahsulot</th><th>Internet</th><th>Do‘kon</th><th>Qaytarilgan dona</th><th>Sotilgan dona</th></tr></thead><tbody>{data.topProducts.map(row=><tr key={row.productId||row.name}><th>{row.name}</th><td>{row.onlineUnits}</td><td>{row.physicalUnits}</td><td>{row.returnedUnits}</td><td>{row.units}</td></tr>)}</tbody></table></div>:<p>Tanlangan davrda yakunlangan savdo yo‘q.</p>}
   <h2>Ombor holati</h2><div className="dashboard-cards"><article><span>Faol variantlar</span><strong>{summary.inventory.variants}</strong></article><article><span>Jami qoldiq, dona</span><strong>{summary.inventory.units}</strong></article><article><span>Qoldiqsiz variantlar</span><strong>{summary.inventory.outOfStockVariants}</strong></article><article><span>Tannarx bo‘yicha ombor qiymati</span><strong>{money(summary.inventory.inventoryValue)}</strong><small>{summary.inventory.missingCostVariants?`${summary.inventory.missingCostVariants} ta variant tannarxi noma’lum`:'Joriy o‘rtacha tannarx asosida'}</small></article></div>
   {summary.unlinkedCustomers>0&&<p className="dashboard-range">{summary.unlinkedCustomers} ta yakunlangan internet buyurtmasi CRM profiliga bog‘lanmagan.</p>}
   <h2>Davr bo‘yicha savdo</h2><div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Vaqt</th><th>Internet</th><th>Do‘kon</th><th>Qaytarish</th><th>Sof savdo</th></tr></thead><tbody>{data.series.map(row=><tr key={row.key}><th>{row.label}</th><td>{money(row.onlineSales)}</td><td>{money(row.physicalSales)}</td><td>{money(row.returns)}</td><td>{money(row.netSales)}</td></tr>)}</tbody></table></div>
  </>}
 </section>
}
