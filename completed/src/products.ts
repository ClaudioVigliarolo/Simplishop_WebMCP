export type Product = { id:string; name:string; description:string; price:number; category:string; badge?:string; icon:string; color:string; rating:number };
export const products: Product[] = [
{id:'nova-air-14',name:'Nova Air 14',description:'A featherlight laptop for big ideas, with a vivid 14-inch display and all-day battery.',price:899,category:'Computers',badge:'Bestseller',icon:'💻',color:'lavender',rating:4.8},
{id:'nova-pro-16',name:'Nova Pro 16',description:'Creator-grade performance, brilliant color and a precision aluminum chassis.',price:1499,category:'Computers',icon:'💻',color:'blue',rating:4.9},
{id:'pixelbook-go',name:'Pixelbook Go',description:'A quiet, capable Chromebook made for work, study and the spaces in between.',price:649,category:'Computers',icon:'💻',color:'peach',rating:4.6},
{id:'soundwave-pro',name:'Soundwave Pro',description:'Immersive wireless headphones with adaptive noise cancellation and 40-hour playtime.',price:249,category:'Audio',badge:'Popular',icon:'🎧',color:'mint',rating:4.8},
{id:'soundwave-lite',name:'Soundwave Lite',description:'Lightweight everyday headphones with balanced sound and a fold-flat design.',price:89,category:'Audio',icon:'🎧',color:'pink',rating:4.5},
{id:'studio-buds',name:'Studio Buds+',description:'Pocket-sized wireless earbuds with clear calls and a snug all-day fit.',price:129,category:'Audio',icon:'🎵',color:'yellow',rating:4.7},
{id:'orbit-watch',name:'Orbit Watch 3',description:'A bright AMOLED smartwatch with health tracking, GPS and five-day battery.',price:329,category:'Wearables',icon:'⌚',color:'blue',rating:4.6},
{id:'orbit-band',name:'Orbit Band',description:'A slim activity tracker that keeps your steps, sleep and recovery in view.',price:79,category:'Wearables',icon:'⌚',color:'pink',rating:4.4},
{id:'lumen-phone',name:'Lumen Phone 12',description:'A pocket-friendly flagship with a gorgeous camera system and vivid OLED screen.',price:799,category:'Phones',badge:'New',icon:'📱',color:'mint',rating:4.7},
{id:'lumen-phone-mini',name:'Lumen Phone Mini',description:'Big camera energy in a compact, one-hand-friendly design.',price:599,category:'Phones',icon:'📱',color:'peach',rating:4.5},
{id:'frame-27',name:'Frame 27 Monitor',description:'A crisp 4K display with accurate color and a clean, adjustable stand.',price:529,category:'Accessories',icon:'🖥️',color:'lavender',rating:4.8},
{id:'keychron-air',name:'Keychron Air Keyboard',description:'A low-profile mechanical keyboard with a satisfying, quiet typing feel.',price:119,category:'Accessories',icon:'⌨️',color:'yellow',rating:4.6},
{id:'arc-mouse',name:'Arc Wireless Mouse',description:'An ergonomic precision mouse with silent clicks and USB-C charging.',price:59,category:'Accessories',icon:'🖱️',color:'blue',rating:4.3},
{id:'beam-speaker',name:'Beam Portable Speaker',description:'Room-filling sound, waterproof build and a surprisingly small footprint.',price:139,category:'Audio',icon:'🔊',color:'peach',rating:4.6},
{id:'pulse-charger',name:'Pulse 65W Charger',description:'One compact GaN charger for your laptop, tablet and phone.',price:49,category:'Accessories',icon:'🔌',color:'mint',rating:4.4},
{id:'snap-camera',name:'Snap Instant Camera',description:'Capture colorful instant prints with simple controls and a playful design.',price:179,category:'Cameras',icon:'📷',color:'pink',rating:4.5}
];
export const categories = ['All','Computers','Phones','Audio','Wearables','Accessories','Cameras'];
export const searchProducts = (filters:{query?:unknown;category?:unknown;maxPrice?:unknown}={}) => {
 const query=filters.query===undefined?'':typeof filters.query==='string'?filters.query.trim().toLowerCase():(()=>{throw new Error('query must be a string')})();
 const category=filters.category===undefined?'':typeof filters.category==='string'?filters.category.trim():(()=>{throw new Error('category must be a string')})();
 const max=filters.maxPrice;
 if(max!==undefined&&(typeof max!=='number'||!Number.isFinite(max)||max<0)) throw new Error('maxPrice must be a non-negative number');
 if(category&&!categories.includes(category)) throw new Error(`Unknown category: ${category}`);
 return products.filter(p=>(!query||`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query))&&(!category||category==='All'||p.category===category)&&(max===undefined||p.price<=max));
};
export const getProductDetails=(productId:unknown):Product=>{if(typeof productId!=='string'||!productId.trim()) throw new Error('productId must be a non-empty string'); const p=products.find(x=>x.id===productId); if(!p) throw new Error(`Product not found: ${productId}`); return p;};
