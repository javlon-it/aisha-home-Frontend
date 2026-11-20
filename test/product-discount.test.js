import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {productPricing} from '../src/services/product-pricing.js';
import {filterCatalog} from '../src/services/catalog-filter.js';

test('discounted public product price is consistently available to UI and checkout',async()=>{
 assert.deepEqual(productPricing({price:1001,discountPercent:15}),{originalPrice:1001,discountPercent:15,discountAmount:150,finalPrice:851});
 const product={name:'Synthetic',category:'Test',variants:[{price:1001,finalPrice:851,discountPercent:15,isAvailable:true}]};
 assert.equal(filterCatalog([product],{query:'',category:'',color:'',size:'',material:'',gsm:'',min:'850',max:'900',available:false,sort:'price-asc'}).length,1);
 const [card,detail,cart]=await Promise.all(['../src/components/shop/ProductCard.jsx','../src/pages/shop/Product.jsx','../src/pages/shop/Orders.jsx'].map(path=>readFile(new URL(path,import.meta.url),'utf8')));
 assert.match(card,/productPricing/);assert.match(detail,/productPricing/);assert.match(cart,/expectedDiscountPercent/);assert.match(cart,/originalTotal/);assert.match(cart,/discountTotal/);
});
