(function(){
var LS='coolai_lang',L=[['ar','العربية'],['en','English'],['fr','Français'],['es','Español'],['de','Deutsch'],['tr','Türkçe'],['it','Italiano'],['pt','Português'],['ru','Русский'],['zh-CN','中文'],['ja','日本語'],['hi','हिन्दी'],['ur','اردو'],['fa','فارسی'],['id','Indonesia']];
var RTL={ar:1,ur:1,fa:1},AR=/[\u0600-\u06FF]/,API='https://translate.googleapis.com/translate_a/t?client=gtx&sl=ar&dt=t&tl=';
var SKIP='script,style,noscript,code,pre,textarea,input,select,svg,.notranslate,[translate="no"],.bd,.mt,.hist,.post p,.ph b,.cmm .b,.cmm small,#who,#pn,#pe,.mem li,.edbox,.fmeta b,.cvb,.chart,.xcard';
var ATTR=['placeholder','title','aria-label'];
function ok(c){return L.some(function(x){return x[0]===c})}
function cur(){var c='ar';try{c=localStorage.getItem(LS)||'ar'}catch(e){}return ok(c)?c:'ar'}
window.COOL_LANG=cur;
var lang=cur(),cache={},queue={},timer=0,busy=0,failed=0,obs=null,orig=new WeakMap(),done=new WeakMap(),attrO=new WeakMap();
try{document.cookie='googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT'}catch(e){}
function loadCache(){try{cache=JSON.parse(localStorage.getItem('coolai_tr_'+lang)||'{}')||{}}catch(e){cache={}}}
function saveCache(){try{var k=Object.keys(cache);if(k.length>3000){var n={};k.slice(-2000).forEach(function(x){n[x]=cache[x]});cache=n}localStorage.setItem('coolai_tr_'+lang,JSON.stringify(cache))}catch(e){}}
function skip(el){return !el||!el.closest||!!el.closest(SKIP)}
function key(s){return s.replace(/\s+/g,' ').trim()}
function want(s){var k=key(s);if(!k||!AR.test(k)||k.length>1500)return'';if(!(k in cache))queue[k]=1;return k}
function applyText(n){var o=orig.get(n),v=n.nodeValue;if(o===undefined||(v!==done.get(n)&&v!==o)){o=v;orig.set(n,o)}var k=want(o);if(!k||!(k in cache))return;var lead=/^\s*/.exec(o)[0],trail=/\s*$/.exec(o)[0],t=lead+cache[k]+trail;if(n.nodeValue!==t){done.set(n,t);n.nodeValue=t}}
function applyAttr(el){ATTR.forEach(function(a){var v=el.getAttribute(a);if(!v)return;var m=attrO.get(el)||{};if(m[a]===undefined||(v!==m[a+'_t']&&v!==m[a])){m[a]=v;attrO.set(el,m)}var k=want(m[a]);if(k&&k in cache){var t=cache[k];m[a+'_t']=t;if(v!==t)el.setAttribute(a,t)}})}
function walk(root){if(lang==='ar'||!root)return;if(root.nodeType===3){if(!skip(root.parentNode))applyText(root);return}if(root.nodeType!==1||skip(root))return;
applyAttr(root);var w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode:function(n){if(n.nodeType===1){if(skip(n)){if(/^(INPUT|TEXTAREA)$/.test(n.tagName)&&!n.closest('.notranslate,.edbox,.bd'))applyAttr(n);return NodeFilter.FILTER_REJECT}return NodeFilter.FILTER_ACCEPT}return NodeFilter.FILTER_ACCEPT}}),n;
while((n=w.nextNode())){if(n.nodeType===3){if(n.nodeValue&&AR.test(n.nodeValue))applyText(n)}else applyAttr(n)}}
function xhr(m,u,b){return new Promise(function(res,rej){try{var x=new XMLHttpRequest();x.open(m,u,true);x.timeout=12000;x.withCredentials=false;if(b)x.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');x.onload=function(){if(x.status!==200)return rej(x.status);try{res(JSON.parse(x.responseText))}catch(e){rej(0)}};x.onerror=x.ontimeout=function(){rej(0)};x.send(b||null)}catch(e){rej(e)}})}
var ONE='https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&dt=t&tl=';
function req(body,batch){return xhr('POST',API+encodeURIComponent(lang),body).catch(function(){batch.slice(15).forEach(function(k){queue[k]=1});return Promise.all(batch.slice(0,15).map(function(k){return xhr('GET',ONE+encodeURIComponent(lang)+'&q='+encodeURIComponent(k)).then(function(j){return(j&&j[0]||[]).map(function(p){return p&&p[0]||''}).join('')})}))})}
function flushQ(){timer=0;if(busy||failed>3)return;var ks=Object.keys(queue).filter(function(k){return!(k in cache)});if(!ks.length)return;var batch=[],len=0;for(var i=0;i<ks.length&&batch.length<60&&len<4500;i++){batch.push(ks[i]);len+=ks[i].length}
batch.forEach(function(k){delete queue[k]});busy=1;var body=batch.map(function(k){return'q='+encodeURIComponent(k)}).join('&'),to=0;
req(body,batch).then(function(j){if(!Array.isArray(j))throw 0;if(batch.length===1&&typeof j[0]==='string'&&j.length!==1)j=[j[0]];
batch.forEach(function(k,i){var v=j[i];if(Array.isArray(v))v=v[0];if(typeof v==='string'&&v.trim())cache[k]=v.replace(/[\u0000-\u001F]/g,' ')});failed=0;saveCache()}).catch(function(){failed++;batch.forEach(function(k){if(failed<=3)queue[k]=1});if(failed>3)note()}).then(function(){busy=0;stop();pend=[];walk(document.body);start();if(Object.keys(queue).length)schedule(failed?2500*failed:30)})}
function schedule(ms){if(!timer)timer=setTimeout(flushQ,ms||60)}
var pend=[],pt=0;
function onMut(list){list.forEach(function(m){if(m.type==='characterData')pend.push(m.target);else if(m.type==='attributes')pend.push(m.target);else for(var i=0;i<m.addedNodes.length;i++)pend.push(m.addedNodes[i])});if(!pt)pt=setTimeout(function(){pt=0;stop();var a=pend;pend=[];a.forEach(function(n){if(n.isConnected)walk(n)});start();schedule()},40)}
function start(){if(obs)obs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR})}
function stop(){if(obs){var r=obs.takeRecords();obs.disconnect();onMutQ(r)}}
function onMutQ(r){r.forEach(function(m){if(m.type==='childList')for(var i=0;i<m.addedNodes.length;i++)pend.push(m.addedNodes[i]);else pend.push(m.target)})}
function note(){if(document.getElementById('trnote'))return;var d=document.createElement('div');d.id='trnote';d.className='trnote notranslate';d.textContent='Translation is not available right now. Check your connection and reload.';document.body.appendChild(d);setTimeout(function(){d.remove()},6000)}
function setDir(){var h=document.documentElement;h.setAttribute('lang',lang==='zh-CN'?'zh':lang);h.setAttribute('dir',RTL[lang]?'rtl':'ltr');h.setAttribute('data-lang',lang)}
var open=null;
function close(){if(open){open.classList.remove('open');var b=open.querySelector('.trb');if(b)b.setAttribute('aria-expanded','false');open=null}}
document.addEventListener('click',function(e){if(open&&!open.contains(e.target))close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
function choose(c){close();if(!ok(c)||c===lang)return;try{localStorage.setItem(LS,c)}catch(e){}location.reload()}
function build(box){box.removeAttribute('id');box.classList.add('notranslate','trx');box.textContent='';
var name=(L.filter(function(x){return x[0]===lang})[0]||L[0])[1],b=document.createElement('button'),m=document.createElement('div'),s=document.createElement('span');
b.type='button';b.className='trb';b.setAttribute('aria-haspopup','listbox');b.setAttribute('aria-expanded','false');b.title='اللغة / Language';b.setAttribute('aria-label','Language');s.textContent=name;b.appendChild(s);
m.className='trm';m.setAttribute('role','listbox');
L.forEach(function(x){var o=document.createElement('button');o.type='button';o.className='tro'+(x[0]===lang?' on':'');o.textContent=x[1];o.lang=x[0];o.dir=RTL[x[0]]?'rtl':'ltr';o.setAttribute('role','option');o.onclick=function(ev){ev.stopPropagation();choose(x[0])};m.appendChild(o)});
b.onclick=function(ev){ev.stopPropagation();if(open===box)return close();close();box.classList.add('open');b.setAttribute('aria-expanded','true');open=box};
box.appendChild(b);box.appendChild(m);box.addEventListener('click',function(e){if(e.target===box)b.click()})}
function init(){var boxes=document.querySelectorAll('#google_translate_element,.tr');for(var i=0;i<boxes.length;i++)build(boxes[i]);setDir();
if(lang==='ar')return;loadCache();if(typeof MutationObserver==='function')obs=new MutationObserver(onMut);walk(document.body);start();schedule(10);
var t0=document.title;if(AR.test(t0)){var k=want(t0);var tick=setInterval(function(){if(k in cache){document.title=cache[k];clearInterval(tick)}},300);setTimeout(function(){clearInterval(tick)},15000)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
