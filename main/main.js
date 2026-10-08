(function(){
var K=COOLAI.SESSION_KEY,$=function(i){return document.getElementById(i)},S=getSession();
if(!S||!S.token){location.replace('../log/login.html');return}
var u=S.user,V=['chat','posts','community','profile','wallet'],TT={posts:'المنشورات',community:'المجتمع',wallet:'المحفظة',profile:'حسابي'},
box=$('msgs'),chats=[],cur=null,mem=[],busy=false,imgMode=false,IMG_COST=6;
function fb(x){var a=document.createElement('textarea');a.value=x;a.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()}
function copy(x){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(x).catch(function(){fb(x)});fb(x);return Promise.resolve()}
function mk(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function hv(){var h=location.hash.slice(1);return V.indexOf(h)<0?'chat':h}
function ttl(){var h=hv();$('ttl').textContent=h==='chat'?(cur?cur.title:'CoolAi'):TT[h]}
function side(o){$('side').classList.toggle('open',o);$('scrim').classList.toggle('on',o)}
function route(){var h=hv();V.forEach(function(v){$('v-'+v).classList.toggle('on',v===h)});document.querySelectorAll('.nav a').forEach(function(a){a.classList.toggle('on',a.dataset.v===h)});ttl();drawHist();side(false)}
addEventListener('hashchange',route);
$('menu').onclick=function(){side(true)};$('sx').onclick=$('scrim').onclick=function(){side(false)};
function logout(){api('logout').then(function(){localStorage.removeItem(K);location.replace('../')})}
$('out').onclick=logout;
function time(t){return new Date(t).toLocaleTimeString('ar-EG',{hour:'numeric',minute:'2-digit',hour12:true})}
function paint(){$('crv').textContent=u.credits;$('cr').classList.toggle('low',u.credits<=5);$('who').textContent=u.name;S.user=u;localStorage.setItem(K,JSON.stringify(S))}
addEventListener('userupdate',function(e){u=e.detail;paint()});paint();
$('imgm').onclick=function(){imgMode=!imgMode;this.classList.toggle('on',imgMode);$('ci').placeholder=imgMode?'صف الصورة اللي عايز ترسمها...':'اكتب رسالتك...';$('hint').textContent=imgMode?'وضع الرسم مفعّل: كل صورة بـ '+IMG_COST+' كريديت':'Enter للإرسال · Shift+Enter سطر جديد · رسم صورة = '+IMG_COST+' كريديت'};
$('ci').oninput=function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,180)+'px'};
function inl(p,t){t.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/).forEach(function(s){if(!s)return;if(s[0]==='`'&&s.length>2)p.appendChild(mk('code','ik',s.slice(1,-1)));else if(s.slice(0,2)==='**'&&s.length>4)p.appendChild(mk('b',0,s.slice(2,-2)));else p.appendChild(document.createTextNode(s))})}
function body(d,t){t.split('```').forEach(function(s,i){
if(i%2){var nl=s.indexOf('\n'),lang=nl>-1?s.slice(0,nl).trim():'',code=(nl>-1?s.slice(nl+1):s).replace(/\n$/,''),w=mk('div','cb'),h=mk('div','ch'),b=mk('button','cc','نسخ'),p=mk('pre');
h.appendChild(mk('span',0,lang||'code'));b.type='button';b.onclick=function(){copy(code);b.textContent='تم النسخ';setTimeout(function(){b.textContent='نسخ'},1800)};h.appendChild(b);p.appendChild(mk('code',0,code));w.appendChild(h);w.appendChild(p);d.appendChild(w)}
else if(s.trim()){var p2=mk('div','tx');inl(p2,s.replace(/^\n+|\n+$/g,''));d.appendChild(p2)}})}
function logo(){var a=mk('img','bav');a.src='../img/logo.png';a.alt='';return a}
function clr(){var e=box.querySelector('.empty');if(e)e.remove()}
function srcs(b,l){if(!l||!l.length)return;var d=mk('div','srcs');d.appendChild(mk('span',0,'المصادر:'));l.forEach(function(x){if(!/^https:\/\//.test(x.url||''))return;var a=mk('a',0,x.title||x.url);a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';d.appendChild(a)});if(d.children.length>1)b.appendChild(d)}
function add(c,t,g,sr){clr();var d=mk('div','m '+c),b=mk('div','mb');
if(c==='bot'){d.appendChild(logo());body(b,t)}else b.textContent=t;d.appendChild(b);
if(g&&/^data:image\/(png|jpeg);base64,/.test(g)){var im=mk('img','gen');im.src=g;im.alt='';b.appendChild(im);var dl=mk('a','dl','تحميل الصورة');dl.href=g;dl.download='coolai-'+Date.now()+'.png';b.appendChild(dl)}
srcs(b,sr);box.appendChild(d);box.scrollTop=box.scrollHeight;return d}
function status(){var d=mk('div','m bot status'),b=mk('div','mb'),t=mk('span');b.innerHTML='<span class="dots"><i></i><i></i><i></i></span> ';b.appendChild(t);d.appendChild(logo());d.appendChild(b);box.appendChild(d);box.scrollTop=box.scrollHeight;
return{set:function(x){t.textContent=x;box.scrollTop=box.scrollHeight},end:function(){d.remove()}}}
function empty(){var d=mk('div','empty'),l=mk('img','elogo'),s=mk('div','sug');l.src='../img/logo.png';l.alt='';d.appendChild(l);d.appendChild(mk('h2',0,'أهلاً '+u.name+'، أنا كوول'));d.appendChild(mk('p',0,'اسألني أي حاجة أو اطلب مني أرسم صورة. محادثاتك وذاكرتك محفوظة على جهازك.'));
['اشرح لي الـ API ببساطة','ساعدني أكتب كود JavaScript','أفكار لمشروع جديد'].forEach(function(t){var b=mk('button','chip',t);b.type='button';b.onclick=function(){$('ci').value=t;$('ci').focus()};s.appendChild(b)});d.appendChild(s);box.appendChild(d)}
function drawMsgs(){box.textContent='';if(!cur.messages.length)empty();else cur.messages.forEach(function(m){add(m.role==='user'?'me':'bot',m.content,m.image,m.src)})}
function drawHist(){var h=$('hist');h.textContent='';chats.forEach(function(c){var on=cur&&c.id===cur.id&&hv()==='chat',r=mk('div','hi'+(on?' on':'')),t=mk('button','ht',c.title),x=mk('button','hx');
x.title='حذف';x.innerHTML='<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>';
t.onclick=function(){open(c);if(location.hash!=='#chat')location.hash='#chat'};x.onclick=function(){del(c)};r.appendChild(t);r.appendChild(x);h.appendChild(r)})}
function open(c){cur=c;store.set('cur:'+u.userId,c.id);drawMsgs();drawHist();ttl();side(false)}
function fresh(){if(chats[0]&&!chats[0].messages.length)return open(chats[0]);var c={id:crypto.randomUUID(),uid:u.userId,title:'محادثة جديدة',updated:Date.now(),messages:[]};chats.unshift(c);store.save(c);open(c)}
function del(c){if(!confirm('حذف المحادثة؟'))return;store.del(c.id);chats=chats.filter(function(x){return x!==c});if(c===cur)chats.length?open(chats[0]):fresh();else drawHist()}
$('newc').onclick=function(){fresh();if(location.hash!=='#chat')location.hash='#chat'};
function drawMem(){var l=$('mem');l.textContent='';if(!mem.length)l.appendChild(mk('li',0,'لسه مفيش حاجة محفوظة. كوول بيتعلم عنك كل كام رسالة.'));mem.forEach(function(f,i){var li=mk('li',0,f),b=mk('button',0,'حذف');b.onclick=function(){mem.splice(i,1);store.set('mem:'+u.userId,mem);drawMem()};li.appendChild(b);l.appendChild(li)})}
$('clrm').onclick=function(){mem=[];store.set('mem:'+u.userId,mem);drawMem()};
store.persist();
Promise.all([store.chats(),store.get('mem:'+u.userId),store.get('cur:'+u.userId)]).then(function(r){
chats=(r[0]||[]).filter(function(c){return c.uid===u.userId}).sort(function(a,b){return b.updated-a.updated});mem=r[1]||[];drawMem();
var c=chats.filter(function(x){return x.id===r[2]})[0];c?open(c):chats.length?open(chats[0]):fresh();route()});
route();
api('me').then(function(r){if(r.status===401)return logout();if(r.user){u=r.user;paint();route();dispatchEvent(new CustomEvent('userupdate',{detail:u}))}});
function csearch(q){
var L=/[\u0600-\u06FF]/.test(q)?'ar':'en';
function jf(u){var c=new AbortController();setTimeout(function(){c.abort()},6000);return fetch(u,{signal:c.signal}).then(function(r){return r.json()})}
var dd=jf('https://api.duckduckgo.com/?q='+encodeURIComponent(q)+'&format=json&no_html=1&skip_disambig=1').then(function(j){var o=[];if(j.AbstractText&&/^https:/.test(j.AbstractURL||''))o.push({title:j.Heading||q,url:j.AbstractURL,snippet:j.AbstractText});(j.RelatedTopics||[]).slice(0,3).forEach(function(x){if(x.FirstURL&&/^https:/.test(x.FirstURL)&&x.Text)o.push({title:x.Text.slice(0,80),url:x.FirstURL,snippet:x.Text})});return o}).catch(function(){return[]});
var wk=jf('https://'+L+'.wikipedia.org/w/api.php?action=query&list=search&srsearch='+encodeURIComponent(q)+'&srlimit=4&format=json&origin=*').then(function(j){return((j.query&&j.query.search)||[]).map(function(x){return{title:x.title,url:'https://'+L+'.wikipedia.org/wiki/'+encodeURIComponent(x.title.replace(/ /g,'_')),snippet:x.snippet.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#0?39;/g,"'")}})}).catch(function(){return[]});
return Promise.all([dd,wk]).then(function(a){return a[0].concat(a[1]).slice(0,5)})}
$('cf').onsubmit=function(e){
e.preventDefault();var t=$('ci').value.trim();if(!t||busy||!cur)return;
if(t.length>2000)return add('bot','الرسالة طويلة جداً، الحد الأقصى 2000 حرف.');
var cost=imgMode?IMG_COST:1;
if(u.credits<cost)return add('bot',(imgMode?'رسم الصورة بـ '+IMG_COST+' كريديت. ':'')+'رصيدك '+u.credits+' كريديت. '+(u.freeRe?'هتتجدد كريديت مجانية '+time(u.freeRe)+'، أو ':'')+'اشحن Coins وحوّلها لكريديت من المحفظة، أو ادعُ صحابك.');
busy=true;$('cs').disabled=true;$('ci').value='';$('ci').style.height='auto';
cur.messages.push({role:'user',content:t});if(cur.messages.length===1){cur.title=t.slice(0,30);ttl();drawHist()}
add('me',t);var st=status(),n=cur.messages.filter(function(m){return m.role==='user'}).length,live=null,txt='',sr=[],fin=false,pend=0,isImg=imgMode,wait=false;
st.set('يفكر...');
function paintLive(){pend=0;live.mb.textContent='';body(live.mb,txt);box.scrollTop=box.scrollHeight}
function unlock(){busy=false;$('cs').disabled=false}
function credits(ev){if(ev.credits!==undefined){u.credits=ev.credits;u.freeRe=ev.freeRe||0;paint()}}
function finish(content,img){fin=true;unlock();var rm={role:'assistant',content:content};if(img)rm.image=img;if(sr.length)rm.src=sr;cur.messages.push(rm);cur.updated=Date.now();store.save(cur);chats.sort(function(a,b){return b.updated-a.updated});drawHist()}
function onEv(ev){
if(ev.t==='stage'){st.set(ev.v==='searching'?'يبحث في الإنترنت: '+String(ev.q||'').slice(0,60)+'...':ev.v==='drawing'?'يرسم الصورة...':ev.v==='writing'?'يكتب...':'يفكر...')}
else if(ev.t==='src'){sr=ev.v||[]}
else if(ev.t==='tok'){txt+=ev.v;if(!live){st.end();live=add('bot','');live.mb=live.querySelector('.mb')}if(!pend)pend=requestAnimationFrame(paintLive)}
else if(ev.t==='done'){credits(ev);if(pend)cancelAnimationFrame(pend);if(live){paintLive();srcs(live.mb,sr)}finish(txt)}
else if(ev.t==='image'){st.end();credits(ev);add('bot','تم رسم الصورة.',ev.image);finish('تم رسم الصورة: '+t.slice(0,80),ev.image)}
else if(ev.t==='needsearch'){credits(ev);wait=true;st.set('يبحث من جهازك: '+String(ev.q||'').slice(0,60)+'...');csearch(String(ev.q||t)).then(function(r){wait=false;run(r,true)})}
else if(ev.t==='facts'){if(ev.v&&ev.v.length){ev.v.forEach(function(f){if(mem.indexOf(f)<0)mem.push(f)});mem=mem.slice(-40);store.set('mem:'+u.userId,mem);drawMem()}}
else if(ev.t==='fail'){if(ev.status===401)return logout();fin=true;unlock();st.end();if(pend)cancelAnimationFrame(pend);if(live)live.remove();credits(ev);cur.messages.pop();add('bot',ev.error||'حصل خطأ، حاول تاني')}}
function run(web,tried){apiStream(isImg?'image':'chat',isImg?{prompt:t}:{messages:cur.messages.slice(-20).map(function(m){return{role:m.role,content:m.content}}),memory:mem,extract:n%3===0||/(احفظ|إحفظ|تذكر|اتذكر|خليك فاكر|فكرني|remember|memorize|save this)/i.test(t),web:web||[],webTried:!!tried},onEv).then(function(){if(!fin&&!wait)onEv({t:'fail',error:'حصل خطأ، حاول تاني'})})}
run([],false)};
$('ci').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!/Mobi|Android/i.test(navigator.userAgent)){e.preventDefault();$('cf').requestSubmit()}});
})();
