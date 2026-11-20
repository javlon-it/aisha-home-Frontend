import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import handler from '../api/admin-proxy.js';
const hash=x=>createHash('sha256').update(x).digest('hex');
function response(){return {headers:{},statusCode:0,setHeader(k,v){this.headers[k]=v},status(n){this.statusCode=n;return this},json(x){this.body=x;return this},send(x){this.body=x;return this}}}
test('preview and missing proxy config fail closed; production signs trusted IP and body',async()=>{
 const old={...process.env},originalFetch=globalThis.fetch;let calls=0,captured;
 try{
  process.env.VERCEL_ENV='preview';process.env.ADMIN_PROXY_SECRET='ab'.repeat(32);process.env.ADMIN_PROXY_BACKEND_URL='https://backend.invalid';
  globalThis.fetch=async(...args)=>{calls++;captured=args;return new Response('{"ok":true}',{status:200,headers:{'set-cookie':'test=1; HttpOnly'}})};
  const req={method:'POST',query:{path:'login'},headers:{origin:'https://frontend.invalid','x-vercel-forwarded-for':'192.0.2.2','x-forwarded-for':'203.0.113.4','x-admin-request':'1'},body:{username:'synthetic',password:'synthetic'}};
  let res=response();await handler(req,res);assert.equal(res.statusCode,503);assert.equal(calls,0);
  process.env.VERCEL_ENV='production';delete process.env.ADMIN_PROXY_SECRET;res=response();await handler(req,res);assert.equal(res.statusCode,503);assert.equal(calls,0);
  process.env.ADMIN_PROXY_SECRET='ab'.repeat(32);res=response();await handler(req,res);assert.equal(res.statusCode,200);assert.equal(calls,1);assert.equal(captured[0],'https://backend.invalid/api/admin/login');
  const h=captured[1].headers,body=captured[1].body;assert.equal(h['X-Admin-Proxy-IP'],'192.0.2.2');assert.equal(h['X-Forwarded-For'],undefined);
  const message=[h['X-Admin-Proxy-Time'],h['X-Admin-Proxy-Nonce'],'192.0.2.2','POST','/api/admin/login',req.headers.origin,hash(''),hash(body)].join('\n');
  assert.equal(h['X-Admin-Proxy-Signature'],createHmac('sha256',Buffer.from(process.env.ADMIN_PROXY_SECRET,'hex')).update(message).digest('hex'));
  assert.match(res.headers['Set-Cookie'],/HttpOnly/);
 }finally{globalThis.fetch=originalFetch;for(const k of ['VERCEL_ENV','ADMIN_PROXY_SECRET','ADMIN_PROXY_BACKEND_URL']){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k]}}
});

test('product image uses signed binary body and enforces the 4 MiB boundary',async()=>{
 const old={...process.env},originalFetch=globalThis.fetch;let captured,calls=0;
 try{
  process.env.VERCEL_ENV='production';process.env.ADMIN_PROXY_SECRET='ab'.repeat(32);process.env.ADMIN_PROXY_BACKEND_URL='https://backend.invalid';
  globalThis.fetch=async(...args)=>{captured=args;calls++;return new Response('{}',{status:200})};
  const productId='0123456789abcdef01234567',route='products/'+productId+'/image',bytes=Buffer.alloc(4*1024*1024,7);
  const req={method:'PUT',query:{path:['products',productId,'image']},headers:{origin:'https://frontend.invalid','x-vercel-forwarded-for':'192.0.2.2','x-admin-request':'1','content-type':'application/octet-stream'},body:bytes};
  let res=response();await handler(req,res);assert.equal(res.statusCode,200);assert.equal(calls,1);assert.equal(captured[0],'https://backend.invalid/api/admin/'+route);assert.equal(captured[1].headers['Content-Type'],'application/octet-stream');assert.equal(captured[1].body.length,bytes.length);
  const h=captured[1].headers,message=[h['X-Admin-Proxy-Time'],h['X-Admin-Proxy-Nonce'],'192.0.2.2','PUT','/api/admin/'+route,req.headers.origin,hash(''),hash(bytes)].join('\n');assert.equal(h['X-Admin-Body-Hash'],hash(bytes));assert.equal(h['X-Admin-Proxy-Signature'],createHmac('sha256',Buffer.from(process.env.ADMIN_PROXY_SECRET,'hex')).update(message).digest('hex'));
  res=response();await handler({...req,body:Buffer.alloc(4*1024*1024+1)},res);assert.equal(res.statusCode,400);assert.equal(calls,1);
  res=response();await handler({...req,query:{path:['products',productId,'unexpected']}},res);assert.equal(res.statusCode,404);assert.equal(calls,1);
 }finally{globalThis.fetch=originalFetch;for(const k of ['VERCEL_ENV','ADMIN_PROXY_SECRET','ADMIN_PROXY_BACKEND_URL']){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k]}}
});

test('admin order routes are signed and unrelated methods remain closed',async()=>{
 const old={...process.env},originalFetch=globalThis.fetch;let captured,calls=0;
 try{
  process.env.VERCEL_ENV='production';process.env.ADMIN_PROXY_SECRET='ab'.repeat(32);process.env.ADMIN_PROXY_BACKEND_URL='https://backend.invalid';
  globalThis.fetch=async(...args)=>{captured=args;calls++;return new Response('{}',{status:200})};
  const id='0123456789abcdef01234567',headers={origin:'https://frontend.invalid','x-vercel-forwarded-for':'192.0.2.2','x-admin-request':'1'};
  for(const [method,path,body] of [['GET','orders',undefined],['GET','orders/page/2',undefined],['GET','orders/'+id,undefined],['PATCH','orders/'+id+'/status',{status:'Jarayonda'}],['PATCH','orders/'+id+'/delivery-fee',{fee:5000}]]){
   const res=response();await handler({method,query:{path:path.split('/')},headers,body},res);assert.equal(res.statusCode,200);assert.equal(captured[0],'https://backend.invalid/api/admin/'+path);
   const h=captured[1].headers,message=[h['X-Admin-Proxy-Time'],h['X-Admin-Proxy-Nonce'],'192.0.2.2',method,'/api/admin/'+path,headers.origin,hash(''),hash(body?JSON.stringify(body):'')].join('\n');assert.equal(h['X-Admin-Proxy-Signature'],createHmac('sha256',Buffer.from(process.env.ADMIN_PROXY_SECRET,'hex')).update(message).digest('hex'));
  }
  const denied=response();await handler({method:'DELETE',query:{path:['orders',id]},headers},denied);assert.equal(denied.statusCode,404);assert.equal(calls,5);
 }finally{globalThis.fetch=originalFetch;for(const k of ['VERCEL_ENV','ADMIN_PROXY_SECRET','ADMIN_PROXY_BACKEND_URL']){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k]}}
});

test('shop sale proxy signs the body and forwards the idempotency key',async()=>{
 const old={...process.env},originalFetch=globalThis.fetch;let captured,calls=0;
 try{
  process.env.VERCEL_ENV='production';process.env.ADMIN_PROXY_SECRET='ab'.repeat(32);process.env.ADMIN_PROXY_BACKEND_URL='https://backend.invalid';
  globalThis.fetch=async(...args)=>{captured=args;calls++;return new Response('{}',{status:200})};
  const headers={origin:'https://frontend.invalid','x-vercel-forwarded-for':'192.0.2.2','x-admin-request':'1','idempotency-key':'synthetic-key-12345678'},body={name:'Synthetic',phone:'901234567',paymentMethod:'cash',discount:0,items:[]};
  let res=response();await handler({method:'POST',query:{path:'sales'},headers,body},res);assert.equal(res.statusCode,200);assert.equal(captured[0],'https://backend.invalid/api/admin/sales');assert.equal(captured[1].headers['Idempotency-Key'],headers['idempotency-key']);
  const h=captured[1].headers,message=[h['X-Admin-Proxy-Time'],h['X-Admin-Proxy-Nonce'],'192.0.2.2','POST','/api/admin/sales',headers.origin,hash(''),hash(JSON.stringify(body))].join('\n');assert.equal(h['X-Admin-Proxy-Signature'],createHmac('sha256',Buffer.from(process.env.ADMIN_PROXY_SECRET,'hex')).update(message).digest('hex'));
  res=response();await handler({method:'GET',query:{path:'sales'},headers},res);assert.equal(res.statusCode,200);res=response();await handler({method:'DELETE',query:{path:'sales'},headers},res);assert.equal(res.statusCode,404);assert.equal(calls,2);
 }finally{globalThis.fetch=originalFetch;for(const k of ['VERCEL_ENV','ADMIN_PROXY_SECRET','ADMIN_PROXY_BACKEND_URL']){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k]}}
});

test('shop return routes are signed and preserve return idempotency',async()=>{
 const old={...process.env},originalFetch=globalThis.fetch;let calls=0,captured;
 try{process.env.VERCEL_ENV='production';process.env.ADMIN_PROXY_SECRET='ab'.repeat(32);process.env.ADMIN_PROXY_BACKEND_URL='https://backend.example';globalThis.fetch=async(...args)=>{calls++;captured=args;return new Response('{}',{status:200})};
  const id='65f000000000000000000001',headers={'x-vercel-forwarded-for':'192.0.2.10','idempotency-key':'synthetic-return-key-001','content-type':'application/json','x-admin-request':'1'},body={reason:'Synthetic reason',items:[{saleItemIndex:0,quantity:1,condition:'sellable'}]};
  let res=response();await handler({method:'GET',query:{path:'returns'},headers},res);assert.equal(res.statusCode,200);
  res=response();await handler({method:'POST',query:{path:`sales/${id}/returns`},headers,body},res);assert.equal(res.statusCode,200);assert.equal(captured[0],`https://backend.example/api/admin/sales/${id}/returns`);assert.equal(captured[1].headers['Idempotency-Key'],headers['idempotency-key']);
  const h=captured[1].headers,message=[h['X-Admin-Proxy-Time'],h['X-Admin-Proxy-Nonce'],'192.0.2.10','POST',`/api/admin/sales/${id}/returns`,'',hash(''),hash(JSON.stringify(body))].join('\n');assert.equal(h['X-Admin-Proxy-Signature'],createHmac('sha256',Buffer.from(process.env.ADMIN_PROXY_SECRET,'hex')).update(message).digest('hex'));
  res=response();await handler({method:'DELETE',query:{path:`sales/${id}/returns`},headers},res);assert.equal(res.statusCode,404);assert.equal(calls,2);
 }finally{globalThis.fetch=originalFetch;for(const k of ['VERCEL_ENV','ADMIN_PROXY_SECRET','ADMIN_PROXY_BACKEND_URL']){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k]}}
});
