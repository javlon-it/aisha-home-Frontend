async function request(path,options={}){const response=await fetch('/api/admin'+path,{credentials:'same-origin',cache:'no-store',...options});const body=await response.json();if(!response.ok){const error=new Error(body.error?.message||'Server xatosi');error.status=response.status;throw error}return body}
export const adminSession=()=>request('/session');
export const adminLogin=(username,password)=>request('/login',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Request':'1'},body:JSON.stringify({username,password})});
export const adminLogout=()=>request('/logout',{method:'POST',headers:{'X-Admin-Request':'1'}});
