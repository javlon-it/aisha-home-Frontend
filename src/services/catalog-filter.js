export const emptyFilters={query:'',category:'',color:'',size:'',material:'',gsm:'',min:'',max:'',available:false,sort:'name'};
const lower=value=>String(value||'').trim().toLocaleLowerCase('uz');
const salePrice=v=>Number.isSafeInteger(v.finalPrice)?v.finalPrice:Number.isSafeInteger(v.discountedPrice)?v.discountedPrice:v.price;
export function filterCatalog(products,f){
 const q=lower(f.query),min=f.min===''?null:Number(f.min),max=f.max===''?null:Number(f.max);
 const hasVariantFilters=Boolean(f.color||f.size||f.material||f.gsm||f.available||min!==null||max!==null);
 const result=products.flatMap(p=>{
  if(q&&!lower(p.name).includes(q))return [];
  if(f.category&&p.category!==f.category)return [];
  const variants=p.variants.filter(v=>(!f.color||v.color===f.color)&&(!f.size||v.size===f.size)&&(!f.material||v.material===f.material)&&(!f.gsm||v.gsm===f.gsm)&&(!f.available||v.isAvailable)&&(min===null||salePrice(v)>=min)&&(max===null||salePrice(v)<=max));
  if(!variants.length&&(p.variants.length||hasVariantFilters))return [];
  return [{...p,matchingVariants:variants,displayPrice:variants.length?Math.min(...variants.map(salePrice)):null}];
 });
 return result.sort((a,b)=>{
  if(f.sort==='price-asc'||f.sort==='price-desc'){
   if(a.displayPrice===null)return b.displayPrice===null?0:1;
   if(b.displayPrice===null)return -1;
   return f.sort==='price-asc'?a.displayPrice-b.displayPrice:b.displayPrice-a.displayPrice;
  }
  return a.name.localeCompare(b.name,'uz');
 });
}
export function facets(products){
 const vals=key=>[...new Set(products.flatMap(p=>p.variants.map(v=>v[key])).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'uz'));
 return {category:[...new Set(products.map(p=>p.category).filter(Boolean))].sort(),color:vals('color'),size:vals('size'),material:vals('material'),gsm:vals('gsm')};
}
