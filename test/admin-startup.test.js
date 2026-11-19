import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareAdminLogin,adminLogin} from '../src/services/admin.js';

test('a sleeping backend can recover before the login is sent once',async()=>{
 const original=globalThis.fetch;const calls=[];let waits=0;
 try{
  globalThis.fetch=async(url,options)=>{calls.push({url,method:options.method||'GET',hasBody:options.body!==undefined});if(calls.length===1)throw new TypeError('offline');if(calls.length===2)return new Response(JSON.stringify({error:{message:'unavailable'}}),{status:503});if(url.endsWith('/session'))return new Response(JSON.stringify({error:{message:'unauthenticated'}}),{status:401});return new Response(JSON.stringify({authenticated:true}),{status:200});};
  await prepareAdminLogin({wait:async()=>{waits++}});await adminLogin('synthetic','a7b8c9');
  assert.deepEqual(calls.map(x=>x.method),['GET','GET','GET','POST']);assert.equal(waits,2);
  assert.ok(calls.slice(0,3).every(x=>!x.hasBody));
  assert.ok(calls.slice(0,3).every(x=>x.url==='/api/admin/session'));assert.equal(calls[3].url,'/api/admin/login');
 }finally{globalThis.fetch=original}
});

test('a failed login is sent once and its error remains visible to the caller',async()=>{
 const original=globalThis.fetch;let calls=0;
 try{globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({error:{message:'invalid'}}),{status:401})};await assert.rejects(adminLogin('synthetic','wrong!'),e=>e.status===401);assert.equal(calls,1)}finally{globalThis.fetch=original}
});

test('unavailable server stops at the deadline; authorization errors are not retried',async()=>{
 const original=globalThis.fetch;
 try{
  let calls=0,time=0;globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({error:{message:'unavailable'}}),{status:503})};
  await assert.rejects(prepareAdminLogin({now:()=>time,wait:async(ms)=>{time+=ms}}));assert.equal(time,100000);assert.equal(calls,34);
  calls=0;globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({error:{message:'denied'}}),{status:403})};
  await assert.rejects(prepareAdminLogin({wait:async()=>{}}),e=>e.status===403);assert.equal(calls,1);
 }finally{globalThis.fetch=original}
});

for(const wakeSeconds of [60,90])test(`backend wakes after ${wakeSeconds}s without repeating login`,async()=>{
 const original=globalThis.fetch;let time=0,loginPosts=0,checks=0;
 try{
  globalThis.fetch=async(url,options)=>{
   if(url.endsWith('/login')){loginPosts++;return new Response('{"authenticated":true}',{status:200})}
   assert.equal(options.method,undefined);assert.equal(options.body,undefined);checks++;
   if(time<wakeSeconds*1000){time=Math.min(time+25000,wakeSeconds*1000);return new Response('{"error":{"message":"unavailable"}}',{status:503})}
   return new Response('{"error":{"message":"unauthenticated"}}',{status:401});
  };
  await prepareAdminLogin({now:()=>time,wait:async(ms)=>{time+=ms}});await adminLogin('synthetic','a7b8c9');
  assert.equal(loginPosts,1);assert.ok(checks>=3);assert.ok(time>=wakeSeconds*1000&&time<=100000);
 }finally{globalThis.fetch=original}
});
