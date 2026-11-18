import {createHash,createHmac,randomBytes} from 'node:crypto';
import {isIP} from 'node:net';

const hash=value=>createHash('sha256').update(value).digest('hex');
const unavailable=res=>res.status(503).json({error:{code:'ADMIN_UNAVAILABLE',message:'Admin xizmati vaqtincha mavjud emas.'}});
// Only production is enabled. Preview never forwards to any backend or receives the production secret.
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(process.env.VERCEL_ENV!=='production')return unavailable(res);
 const secret=process.env.ADMIN_PROXY_SECRET||'',base=process.env.ADMIN_PROXY_BACKEND_URL||'';
 let backend;try{backend=new URL(base)}catch{return unavailable(res)}
 if(!/^[a-f0-9]{64}$/i.test(secret)||backend.protocol!=='https:'||backend.origin!==base||backend.username||backend.password)return unavailable(res);
 const route=Array.isArray(req.query?.path)?req.query.path.join('/'):req.query?.path;
 if(!['login','session','logout'].includes(route)||!({login:'POST',session:'GET',logout:'POST'}[route]===req.method))return res.status(404).json({error:{code:'NOT_FOUND',message:'Manzil topilmadi.'}});
 let ip=req.headers['x-vercel-forwarded-for'];
 if(typeof ip!=='string')return unavailable(res);
 if(ip.startsWith('::ffff:'))ip=ip.slice(7);ip=ip.toLowerCase();
 if(!isIP(ip))return unavailable(res);
 let body=Buffer.alloc(0);
 if(route==='login'){
  if(!req.body||typeof req.body!=='object'||Array.isArray(req.body))return res.status(400).json({error:{code:'INVALID_JSON',message:'JSON noto‘g‘ri.'}});
  body=Buffer.from(JSON.stringify(req.body));if(body.length>4096)return res.status(413).json({error:{code:'TOO_LARGE',message:'So‘rov juda katta.'}});
 }
 const path='/api/admin/'+route,ts=String(Date.now()),nonce=randomBytes(16).toString('hex'),origin=typeof req.headers.origin==='string'?req.headers.origin:'',cookie=typeof req.headers.cookie==='string'?req.headers.cookie:'';
 const message=[ts,nonce,ip,req.method,path,origin,hash(cookie),hash(body)].join('\n');
 const signature=createHmac('sha256',Buffer.from(secret,'hex')).update(message).digest('hex');
 const headers={'X-Admin-Proxy-Time':ts,'X-Admin-Proxy-Nonce':nonce,'X-Admin-Proxy-IP':ip,'X-Admin-Proxy-Signature':signature};
 if(origin)headers.Origin=origin;if(cookie)headers.Cookie=cookie;
 if(req.headers['x-admin-request']==='1')headers['X-Admin-Request']='1';
 if(body.length)headers['Content-Type']='application/json';
 try{
  const upstream=await fetch(backend.origin+path,{method:req.method,headers,...(body.length?{body}:{}),redirect:'error',signal:AbortSignal.timeout(25000)});
  const setCookie=upstream.headers.get('set-cookie');if(setCookie)res.setHeader('Set-Cookie',setCookie);
  const retry=upstream.headers.get('retry-after');if(retry)res.setHeader('Retry-After',retry);
  res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(upstream.status).send(await upstream.text());
 }catch{return unavailable(res)}
}
