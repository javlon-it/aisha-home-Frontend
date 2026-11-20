async function request(path,options={}){const response=await fetch('/api/admin'+path,{credentials:'same-origin',cache:'no-store',...options});const body=await response.json();if(!response.ok){const error=new Error(body.error?.message||'Server xatosi');error.status=response.status;throw error}return body}
export const adminSession=(options={})=>request('/session',options);
export const adminLogin=(username,password)=>request('/login',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Request':'1'},body:JSON.stringify({username,password})});
export const adminLogout=()=>request('/logout',{method:'POST',headers:{'X-Admin-Request':'1'}});
export const adminProducts=()=>request('/products');
export const adminOrders=(page=1)=>request(page===1?'/orders':'/orders/page/'+page);
export const adminOrderAction=(id,field,body)=>request('/orders/'+id+'/'+field,{method:'PATCH',headers:{'Content-Type':'application/json','X-Admin-Request':'1'},body:JSON.stringify(body)});
export const adminProductAction=(path,method,body,extraHeaders={})=>request(path,{method,headers:{'X-Admin-Request':'1',...(body instanceof ArrayBuffer?{'Content-Type':'application/octet-stream'}:body?{'Content-Type':'application/json'}:{}),...extraHeaders},...(body?{body:body instanceof ArrayBuffer?body:JSON.stringify(body)}:{})});
// Wake the backend with a safe session check; never retry a login POST.
export async function prepareAdminLogin({wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),now=Date.now}={}){
 const deadline=now()+100000;
 for(;;){
  const remaining=deadline-now();
  if(remaining<=0)throw new Error('Admin xizmati vaqtida ishga tushmadi.');
  try{await adminSession({signal:AbortSignal.timeout(Math.min(28000,remaining))});return}catch(error){
   if(error.status===401)return;
   if(error.status&&error.status!==503)throw error;
   const delay=Math.min(3000,deadline-now());
   if(delay<=0)throw error;
   await wait(delay);
  }
 }
}
