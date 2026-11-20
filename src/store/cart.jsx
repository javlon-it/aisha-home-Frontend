import {createContext,useContext,useState} from 'react';
import {productPricing} from '../services/product-pricing.js';
const Context=createContext(null);
export function CartProvider({children}){
 const [items,setItems]=useState(()=>{try{const v=JSON.parse(localStorage.getItem('aisha-v2-cart')||'[]');if(!Array.isArray(v))return [];const clean=v.filter(i=>i&&typeof i==='object').map(({stock,...item})=>item);localStorage.setItem('aisha-v2-cart',JSON.stringify(clean));return clean}catch{return []}});
 function update(fn){setItems(old=>{const next=fn(old);localStorage.setItem('aisha-v2-cart',JSON.stringify(next));return next})}
 function add(p,v){if(!v?.isAvailable)return;const pricing=productPricing({...v,discountPercent:p.discountPercent??v.discountPercent});update(old=>old.some(i=>i.variantId===v.id)?old.map(i=>i.variantId===v.id?{...i,...pricing,price:pricing.finalPrice,quantity:Math.min(100,i.quantity+1)}:i):[...old,{variantId:v.id,name:p.name,imageUrl:p.imageUrl,color:v.color,size:v.size,...pricing,price:pricing.finalPrice,quantity:1}])}
 return <Context.Provider value={{items,add,change:(id,n)=>update(a=>a.map(i=>i.variantId===id?{...i,quantity:n}:i)),remove:id=>update(a=>a.filter(i=>i.variantId!==id)),clear:()=>update(()=>[])}}>{children}</Context.Provider>;
}
export const useCart=()=>useContext(Context);
