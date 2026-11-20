const unavailable=res=>res.status(503).json({error:{code:'API_UNAVAILABLE',message:'Xizmat vaqtincha mavjud emas.'}});

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(process.env.VERCEL_ENV!=='production')return unavailable(res);
 let backend;try{backend=new URL(process.env.ADMIN_PROXY_BACKEND_URL||'')}catch{return unavailable(res)}
 if(backend.protocol!=='https:'||backend.origin!==process.env.ADMIN_PROXY_BACKEND_URL||backend.username||backend.password)return unavailable(res);
 const route=Array.isArray(req.query?.path)?req.query.path.join('/'):req.query?.path;
 const allowed=(['health','catalog','store-settings','orders','orders/session'].includes(route)&&req.method==='GET')||
  (/^catalog\/[a-f0-9]{24}$/i.test(route)&&req.method==='GET')||
  (/^orders\/[a-f0-9]{24}$/i.test(route)&&req.method==='GET')||
  (route==='orders'&&req.method==='POST');
 if(!allowed)return res.status(404).json({error:{code:'NOT_FOUND',message:'Manzil topilmadi.'}});
 if(Object.keys(req.query||{}).some(key=>key!=='path'))return res.status(400).json({error:{code:'INVALID_QUERY',message:'So‘rov parametrlarini tekshiring.'}});
 let body;
 if(req.method==='POST'){
  if(!req.body||typeof req.body!=='object'||Array.isArray(req.body))return res.status(400).json({error:{code:'INVALID_JSON',message:'JSON noto‘g‘ri.'}});
  body=JSON.stringify(req.body);if(Buffer.byteLength(body)>64*1024)return res.status(413).json({error:{code:'TOO_LARGE',message:'So‘rov juda katta.'}});
 }
 const headers={};
 for(const [source,target] of [['origin','Origin'],['cookie','Cookie'],['content-type','Content-Type'],['idempotency-key','Idempotency-Key']])if(typeof req.headers[source]==='string')headers[target]=req.headers[source];
 try{
  const upstream=await fetch(backend.origin+'/api/'+route,{method:req.method,headers,...(body?{body}:{}),redirect:'error',signal:AbortSignal.timeout(25000)});
  const setCookie=upstream.headers.get('set-cookie');if(setCookie)res.setHeader('Set-Cookie',setCookie);
  const retry=upstream.headers.get('retry-after');if(retry)res.setHeader('Retry-After',retry);
  res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(upstream.status).send(await upstream.text());
 }catch{return unavailable(res)}
}
