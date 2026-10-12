(function(){
var LS='coolai_lang',L=[['ar','العربية'],['en','English'],['fr','Français'],['es','Español'],['de','Deutsch'],['tr','Türkçe'],['it','Italiano'],['pt','Português'],['ru','Русский'],['zh-CN','中文'],['ja','日本語'],['hi','हिन्दी'],['ur','اردو'],['fa','فارسی'],['id','Indonesia']];
function ok(c){return L.some(function(x){return x[0]===c})}
function cur(){var m=/(?:^|;\s*)googtrans=\/[^\/]*\/([^;]+)/.exec(document.cookie),c=m?decodeURIComponent(m[1]):(localStorage.getItem(LS)||'ar');return ok(c)?c:'ar'}
function setCookie(v){var h=location.hostname,parts=h.split('.'),exp=v?'':';expires=Thu, 01 Jan 1970 00:00:00 GMT',val=v?'/ar/'+v:'';
document.cookie='googtrans='+val+';path=/'+exp;
if(parts.length>1&&!/^\d+$/.test(parts[parts.length-1])){document.cookie='googtrans='+val+';path=/;domain='+h+exp;document.cookie='googtrans='+val+';path=/;domain=.'+parts.slice(-2).join('.')+exp}}
function choose(c){if(!ok(c)||c===cur())return close();localStorage.setItem(LS,c);setCookie(c==='ar'?'':c);location.reload()}
window.COOL_LANG=cur;
var open=null;
function close(){if(open){open.classList.remove('open');var b=open.querySelector('.trb');if(b)b.setAttribute('aria-expanded','false');open=null}}
document.addEventListener('click',function(e){if(open&&!open.contains(e.target))close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
function build(box){box.removeAttribute('id');box.classList.add('notranslate','trx');box.textContent='';
var c=cur(),name=(L.filter(function(x){return x[0]===c})[0]||L[0])[1],b=document.createElement('button'),m=document.createElement('div');
b.type='button';b.className='trb';b.setAttribute('aria-haspopup','listbox');b.setAttribute('aria-expanded','false');b.title='اللغة / Language';
var s=document.createElement('span');s.textContent=name;b.appendChild(s);
m.className='trm';m.setAttribute('role','listbox');
L.forEach(function(x){var o=document.createElement('button');o.type='button';o.className='tro'+(x[0]===c?' on':'');o.textContent=x[1];o.lang=x[0];o.setAttribute('role','option');o.onclick=function(ev){ev.stopPropagation();choose(x[0])};m.appendChild(o)});
b.onclick=function(ev){ev.stopPropagation();if(open===box)return close();close();box.classList.add('open');b.setAttribute('aria-expanded','true');open=box};
box.appendChild(b);box.appendChild(m);box.addEventListener('click',function(e){if(e.target===box)b.click()})}
function init(){var boxes=document.querySelectorAll('#google_translate_element,.tr');for(var i=0;i<boxes.length;i++)build(boxes[i]);
var hid=document.createElement('div');hid.id='google_translate_element';hid.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9999px';document.body.appendChild(hid);
document.documentElement.setAttribute('data-lang',cur());
if(cur()==='ar')return;if(!/googtrans=/.test(document.cookie))setCookie(cur());
window.googleTranslateElementInit=function(){try{new google.translate.TranslateElement({pageLanguage:'ar',autoDisplay:false},'google_translate_element')}catch(e){}};
var sc=document.createElement('script');sc.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';sc.async=true;document.head.appendChild(sc)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
