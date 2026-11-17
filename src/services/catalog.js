import {apiRequest} from './api.js';
export const fetchCatalog=signal=>apiRequest('/catalog',{signal});
export const fetchProduct=(id,signal)=>apiRequest('/catalog/'+encodeURIComponent(id),{signal});
