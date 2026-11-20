import {createHash,createHmac,randomBytes} from 'node:crypto';
import {isIP} from 'node:net';

const hash=value=>createHash('sha256').update(value).digest('hex');
const unavailable=res=>res.status(503).json({error:{code:'ADMIN_UNAVAILABLE',message:'Admin xizmati vaqtincha mavjud emas.'}});
const validCivilDate=value=>{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [year,month,day]=value.split('-').map(Number),date=new Date(0);date.setUTCHours(0,0,0,0);date.setUTCFullYear(year,month-1,day);return date.getUTCFullYear()===year&&date.getUTCMonth()+1===month&&date.getUTCDate()===day};
// Only production is enabled. Preview never forwards to any backend or receives the production secret.
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(process.env.VERCEL_ENV!=='production')return unavailable(res);
 const secret=process.env.ADMIN_PROXY_SECRET||'',base=process.env.ADMIN_PROXY_BACKEND_URL||'';
 let backend;try{backend=new URL(base)}catch{return unavailable(res)}
 if(!/^[a-f0-9]{64}$/i.test(secret)||backend.protocol!=='https:'||backend.origin!==base||backend.username||backend.password)return unavailable(res);
 const route=Array.isArray(req.query?.path)?req.query.path.join('/'):req.query?.path;
 const settingsAllowed=/^settings\/(branch|shipping)$/.test(route)&&['GET','PATCH'].includes(req.method);
 const allowed=settingsAllowed||({login:'POST',session:'GET',logout:'POST',products:'GET',dashboard:'GET'})[route]===req.method||
  (route==='products'&&req.method==='POST')||
  (route==='orders'&&req.method==='GET')||
  (route==='orders-summary'&&req.method==='GET')||
  (route==='sales'&&['GET','POST'].includes(req.method))||
  (route==='customers'&&req.method==='GET')||
  (/^customers\/[a-f0-9]{24}$/i.test(route)&&req.method==='GET')||
  (/^customers\/[a-f0-9]{24}\/notes$/i.test(route)&&req.method==='POST')||
  (route==='returns'&&req.method==='GET')||
  (/^sales\/[a-f0-9]{24}\/returns$/i.test(route)&&req.method==='POST')||
  (/^orders\/page\/[1-9][0-9]*$/.test(route)&&req.method==='GET')||
  (/^orders\/[a-f0-9]{24}$/i.test(route)&&req.method==='GET')||
  (/^orders\/[a-f0-9]{24}\/(status|delivery-fee)$/i.test(route)&&req.method==='PATCH')||
  (/^products\/[a-f0-9]{24}$/i.test(route)&&req.method==='PATCH')||
  (/^products\/[a-f0-9]{24}\/archive$/i.test(route)&&req.method==='POST')||
  (/^products\/[a-f0-9]{24}\/variants$/i.test(route)&&req.method==='POST')||
  (/^products\/[a-f0-9]{24}\/image$/i.test(route)&&['PUT','DELETE'].includes(req.method))||
  (/^variants\/[a-f0-9]{24}$/i.test(route)&&req.method==='PATCH')||
  (/^variants\/[a-f0-9]{24}\/receipts$/i.test(route)&&req.method==='POST');
 if(!allowed)return res.status(404).json({error:{code:'NOT_FOUND',message:'Manzil topilmadi.'}});
 let query='';if(route==='customers'&&req.method==='GET'){const q=req.query?.q;if(q!==undefined){if(typeof q!=='string'||q.length>100)return res.status(400).json({error:{code:'INVALID_SEARCH',message:'Qidiruv matnini tekshiring.'}});query='?q='+encodeURIComponent(q)}}else if(route==='dashboard'&&req.method==='GET'){const {period,date,...extra}=req.query||{};if(Object.keys(extra).some(key=>key!=='path')||typeof period!=='string'||!['daily','weekly','monthly','yearly'].includes(period)||!validCivilDate(date))return res.status(400).json({error:{code:'INVALID_RANGE',message:'Davr yoki sanani tekshiring.'}});query='?period='+encodeURIComponent(period)+'&date='+encodeURIComponent(date)}else if(Object.keys(req.query||{}).some(key=>key!=='path'))return res.status(400).json({error:{code:'INVALID_QUERY',message:'So‘rov parametrlarini tekshiring.'}});
 let ip=req.headers['x-vercel-forwarded-for'];
 if(typeof ip!=='string')return unavailable(res);
 if(ip.startsWith('::ffff:'))ip=ip.slice(7);ip=ip.toLowerCase();
 if(!isIP(ip))return unavailable(res);
 let body=Buffer.alloc(0);
 const isImage=/^products\/[a-f0-9]{24}\/image$/i.test(route)&&req.method==='PUT';
 if(isImage){
  if(req.headers['content-type']!=='application/octet-stream'||!Buffer.isBuffer(req.body)||req.body.length===0||req.body.length>4*1024*1024)return res.status(400).json({error:{code:'INVALID_IMAGE',message:'Rasmni tekshiring.'}});
  body=req.body;
 }else if(['POST','PATCH'].includes(req.method)&&route!=='logout'&&!route.endsWith('/archive')){
  if(!req.body||typeof req.body!=='object'||Array.isArray(req.body))return res.status(400).json({error:{code:'INVALID_JSON',message:'JSON noto‘g‘ri.'}});
  body=Buffer.from(JSON.stringify(req.body));if(body.length>4096)return res.status(413).json({error:{code:'TOO_LARGE',message:'So‘rov juda katta.'}});
 }
 const path='/api/admin/'+route,ts=String(Date.now()),nonce=randomBytes(16).toString('hex'),origin=typeof req.headers.origin==='string'?req.headers.origin:'',cookie=typeof req.headers.cookie==='string'?req.headers.cookie:'';
 const message=[ts,nonce,ip,req.method,path,origin,hash(cookie),hash(body)].join('\n');
 const signature=createHmac('sha256',Buffer.from(secret,'hex')).update(message).digest('hex');
 const headers={'X-Admin-Proxy-Time':ts,'X-Admin-Proxy-Nonce':nonce,'X-Admin-Proxy-IP':ip,'X-Admin-Proxy-Signature':signature};
 if(isImage)headers['X-Admin-Body-Hash']=hash(body);
 if(origin)headers.Origin=origin;if(cookie)headers.Cookie=cookie;
 if(req.headers['x-admin-request']==='1')headers['X-Admin-Request']='1';
 if(body.length)headers['Content-Type']=isImage?'application/octet-stream':'application/json';
 if(typeof req.headers['idempotency-key']==='string')headers['Idempotency-Key']=req.headers['idempotency-key'];
 try{
  const upstream=await fetch(backend.origin+path+query,{method:req.method,headers,...(body.length?{body}:{}),redirect:'error',signal:AbortSignal.timeout(25000)});
  const setCookie=upstream.headers.get('set-cookie');if(setCookie)res.setHeader('Set-Cookie',setCookie);
  const retry=upstream.headers.get('retry-after');if(retry)res.setHeader('Retry-After',retry);
  res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(upstream.status).send(await upstream.text());
 }catch{return unavailable(res)}
}
