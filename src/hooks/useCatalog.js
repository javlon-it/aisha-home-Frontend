import {useEffect,useState} from 'react';
import {fetchCatalog} from '../services/catalog.js';
export function useCatalog(){
 const [state,setState]=useState({loading:true,products:[],error:''}),[attempt,setAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();setState({loading:true,products:[],error:''});fetchCatalog(controller.signal).then(data=>setState({loading:false,products:data.products,error:''})).catch(error=>{if(error.name!=='AbortError')setState({loading:false,products:[],error:error.code==='DATABASE_UNAVAILABLE'?'Mahsulotlar bazasiga ulanib bo‘lmadi.':'Katalogni yuklab bo‘lmadi. Serverni va ulanishni tekshiring.'})});return ()=>controller.abort()},[attempt]);
 return {...state,retry:()=>setAttempt(n=>n+1)};
}
