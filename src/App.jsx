import {Routes,Route,Navigate} from 'react-router-dom';
import {ShopLayout,AdminLayout} from './components/layout/Layouts.jsx';
import {Home,Foundation} from './pages/shop/Pages.jsx';
import Catalog from './pages/shop/Catalog.jsx';
import Product from './pages/shop/Product.jsx';
import {CartProvider} from './store/cart.jsx';
import {Cart,Checkout,Success,Orders,OrderDetail} from './pages/shop/Orders.jsx';
const shopPages=[];
const adminPages=[['crm','CRM'],['orders','Buyurtmalar'],['products','Mahsulot va ombor'],['settings','Sozlamalar']];
export default function App(){return <CartProvider><Routes><Route element={<ShopLayout/>}><Route index element={<Home/>}/><Route path="catalog" element={<Catalog/>}/><Route path="products/:id" element={<Product/>}/><Route path="cart" element={<Cart/>}/><Route path="checkout" element={<Checkout/>}/><Route path="checkout/success" element={<Success/>}/><Route path="orders" element={<Orders/>}/><Route path="orders/:id" element={<OrderDetail/>}/>{shopPages.map(([path,title])=><Route key={path} path={path} element={<Foundation title={title}/>}/>)}</Route><Route path="admin" element={<AdminLayout/>}><Route index element={<Foundation title="Bosh sahifa"/>}/>{adminPages.map(([path,title])=><Route key={path} path={path} element={<Foundation title={title} admin/>}/>)}</Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></CartProvider>}
