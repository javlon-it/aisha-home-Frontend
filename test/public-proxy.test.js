import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/public-proxy.js';

function response(){return {headers:{},statusCode:0,setHeader(k,v){this.headers[k]=v},status(n){this.statusCode=n;return this},json(x){this.body=x;return this},send(x){this.body=x;return this}}}

test('public proxy keeps customer cookie first-party and closes unrelated routes',async()=>{
 const old={...process.env},originalFetch=globalThis.fetch;let calls=0,captured;
 try{
  process.env.VERCEL_ENV='production';process.env.ADMIN_PROXY_BACKEND_URL='https://backend.example';
  globalThis.fetch=async(...args)=>{calls++;captured=args;return new Response('{"orders":[]}',{status:200,headers:{'set-cookie':'aisha_demo_owner=synthetic; Path=/api; HttpOnly; Secure; SameSite=None'}})};
  const headers={origin:'https://shop.example',cookie:'aisha_demo_owner=synthetic'};
  let res=response();await handler({method:'GET',query:{path:'orders'},headers},res);assert.equal(res.statusCode,200);assert.equal(captured[0],'https://backend.example/api/orders');assert.equal(captured[1].headers.Cookie,headers.cookie);assert.match(res.headers['Set-Cookie'],/aisha_demo_owner=/);
  res=response();await handler({method:'DELETE',query:{path:'orders'},headers},res);assert.equal(res.statusCode,404);assert.equal(calls,1);
  process.env.VERCEL_ENV='preview';res=response();await handler({method:'GET',query:{path:'orders'},headers},res);assert.equal(res.statusCode,503);assert.equal(calls,1);
 }finally{globalThis.fetch=originalFetch;for(const key of ['VERCEL_ENV','ADMIN_PROXY_BACKEND_URL']){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key]}}
});
