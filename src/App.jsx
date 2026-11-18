import {Routes,Route,Navigate} from 'react-router-dom';
import {ShopLayout,AdminLayout} from './components/layout/Layouts.jsx';
import {Home,Foundation} from './pages/shop/Pages.jsx';
import Catalog from './pages/shop/Catalog.jsx';
import Product from './pages/shop/Product.jsx';
import {AdminGate,AdminLogin} from './pages/admin/Auth.jsx';
import {CartProvider} from './store/cart.jsx';
import {Cart,Checkout,Success,Orders,OrderDetail} from './pages/shop/Orders.jsx';
import {adminSections} from './config/admin-sections.js';
export default function App(){return <CartProvider><Routes><Route element={<ShopLayout/>}><Route index element={<Home/>}/><Route path="catalog" element={<Catalog/>}/><Route path="products/:id" element={<Product/>}/><Route path="cart" element={<Cart/>}/><Route path="checkout" element={<Checkout/>}/><Route path="checkout/success" element={<Success/>}/><Route path="orders" element={<Orders/>}/><Route path="orders/:id" element={<OrderDetail/>}/></Route><Route path="admin/login" element={<AdminLogin/>}/><Route element={<AdminGate/>}><Route path="admin" element={<AdminLayout/>}><Route index element={<Foundation title={adminSections[0].title}/>}/>{adminSections.slice(1).map(({path,title})=><Route key={path} path={path} element={<Foundation title={title} admin/>}/>)}</Route></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></CartProvider>}
