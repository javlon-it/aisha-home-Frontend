import {normalizeApiBase} from './api-url.js';
// VITE_ qiymatlari ommaviy. Maxfiy ma'lumotlarni bu yerga kiritmang.
export function getApiBase(){
  const configured=import.meta.env.VITE_API_URL;
  if(!configured && import.meta.env.PROD) throw new Error('VITE_API_URL production uchun sozlanmagan');
  return normalizeApiBase(configured || '/api');
}
export async function apiRequest(path, options={}){
  if(!path.startsWith('/') || path.startsWith('//') || path==='/api' || path.startsWith('/api/')) throw new Error('API yo‘li /api qo‘shimchasisiz boshlansin');
  const response=await fetch(getApiBase()+path,{credentials:'include',...options});
  const body=await response.json();
  if(!response.ok){const error=new Error(body.error?.message || 'Server xatosi');error.status=response.status;error.code=body.error?.code;throw error}
  return body;
}
export const getHealth=()=>apiRequest('/health');
