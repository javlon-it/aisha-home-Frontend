import {createContext,useContext,useState} from 'react';
const Context=createContext(null);
export function CartProvider({children}){
 const [items,setItems]=useState(()=>{try{const v=JSON.parse(localStorage.getItem('aisha-v2-cart')||'[]');if(!Array.isArray(v))return [];const clean=v.filter(i=>i&&typeof i==='object').map(({stock,...item})=>item);localStorage.setItem('aisha-v2-cart',JSON.stringify(clean));return clean}catch{return []}});
 function update(fn){setItems(old=>{const next=fn(old);localStorage.setItem('aisha-v2-cart',JSON.stringify(next));return next})}
 function add(p,v){if(!v?.isAvailable)return;update(old=>old.some(i=>i.variantId===v.id)?old.map(i=>i.variantId===v.id?{...i,quantity:Math.min(100,i.quantity+1),price:v.price}:i):[...old,{variantId:v.id,name:p.name,imageUrl:p.imageUrl,color:v.color,size:v.size,price:v.price,quantity:1}])}
 return <Context.Provider value={{items,add,change:(id,n)=>update(a=>a.map(i=>i.variantId===id?{...i,quantity:n}:i)),remove:id=>update(a=>a.filter(i=>i.variantId!==id)),clear:()=>update(()=>[])}}>{children}</Context.Provider>;
}
export const useCart=()=>useContext(Context);