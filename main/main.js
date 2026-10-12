(function(){
var K=COOLAI.SESSION_KEY,$=function(i){return document.getElementById(i)},S=getSession();
if(!S||!S.token){location.replace('../log/login.html');return}
var stopFn=null,u=S.user,V=['chat','posts','community','profile','wallet'],TT={posts:'المنشورات',community:'المجتمع',wallet:'المحفظة',profile:'حسابي'},
box=$('msgs'),chats=[],cur=null,mem=[],busy=false,imgMode=false,CO={ecoChat:1,proChat:8,ecoImage:8,proImage:20},mode=localStorage.getItem('coolai_mode')||'';
function isPro(){return u.role==='pro'&&(!u.proUntil||u.proUntil>Date.now())}
function curMode(){return isPro()&&mode!=='eco'?'pro':'eco'}
function cost(){var p=curMode()==='pro';return imgMode?(p?CO.proImage:CO.ecoImage):(p?CO.proChat:CO.ecoChat)}
var HINT='coolAi نموذج ذكاء اصطناعي و قد ينتج عنه أخطاء';
function hint(){$('hint').textContent=imgMode?'تكلفة الصورة الحالية ('+(curMode()==='pro'?'Pro':'Eco')+'): '+cost()+' كريديت':HINT}
function paintMode(){var b=$('mode'),p=curMode()==='pro';b.textContent=p?'PRO':'Eco';b.classList.toggle('pro',p);b.classList.toggle('lock',!isPro());b.title=isPro()?'تبديل بين Eco و Pro':'وضع Pro للمشتركين فقط';hint()}
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
function paint(){$('upg').hidden=isPro();$('prob').hidden=!isPro();if($('pplan')){$('pplan').textContent=isPro()?'Pro'+(u.proUntil?' · لحد '+new Date(u.proUntil).toLocaleDateString('ar-EG',{day:'numeric',month:'long',year:'numeric'}):''):'مجانية';$('pupg').hidden=isPro()}paintMode();$('crv').textContent=u.credits;$('cr').classList.toggle('low',u.credits<=5);$('who').textContent=u.name;S.user=u;localStorage.setItem(K,JSON.stringify(S))}
addEventListener('userupdate',function(e){u=e.detail;paint()});paint();
$('imgm').onclick=function(){imgMode=!imgMode;this.classList.toggle('on',imgMode);$('ci').placeholder=imgMode?'صف الصورة اللي عايز ترسمها...':'اكتب رسالتك...';hint()};
$('mode').onclick=function(){if(!isPro()){location.href='pro.html';return}mode=curMode()==='pro'?'eco':'pro';localStorage.setItem('coolai_mode',mode);paintMode()};
PUB.then(function(r){if(r.cost)CO=r.cost;paintMode()});
$('ci').oninput=function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,180)+'px'};
function safeUrl(u){try{var x=new URL(u);return /^https?:$/.test(x.protocol)?x:null}catch(e){return null}}
function link(p,txt,u){var x=safeUrl(u);if(!x){p.appendChild(document.createTextNode(txt));return}var a=mk('a','lnk');a.href=x.href;a.target='_blank';a.rel='noopener noreferrer nofollow';a.title=x.href;var f=mk('img','fav');f.alt='';f.loading='lazy';f.referrerPolicy='no-referrer';f.src='https://www.google.com/s2/favicons?domain='+encodeURIComponent(x.hostname)+'&sz=32';f.onerror=function(){f.remove()};a.appendChild(f);a.appendChild(mk('span',0,txt===u?(x.hostname.replace(/^www\./,'')+(x.pathname.length>1?decodeURI(x.pathname).slice(0,40):'')):txt));p.appendChild(a)}
function inl(p,t){t.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]{1,200}\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<>"'\u0600-\u06FF]+)/).forEach(function(s){if(!s)return;var m;
if(s[0]==='`'&&s.length>2)p.appendChild(mk('code','ik',s.slice(1,-1)));
else if(s.slice(0,2)==='**'&&s.length>4){var b=mk('b');inl(b,s.slice(2,-2));p.appendChild(b)}
else if((m=/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(s)))link(p,m[1],m[2]);
else if(/^https?:\/\//.test(s)){var tr=(/[.,;:!?،؛)\]}'"]+$/.exec(s)||[''])[0],u2=tr?s.slice(0,-tr.length):s;link(p,u2,u2);if(tr)p.appendChild(document.createTextNode(tr))}
else p.appendChild(document.createTextNode(s))})}
var TSEP=/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
function cells(l){l=l.trim().replace(/^\|/,'').replace(/\|$/,'');return l.split('|').map(function(c){return c.trim()})}
function pick(x){if(busy)return;var ci=$('ci');ci.value=x;ci.dispatchEvent(new Event('input'));$('cf').requestSubmit()}
function md(root,t){var L=t.split('\n'),i=0,para=[];
function flush(){if(!para.length)return;var p=mk('div','tx');para.forEach(function(l,k){if(k)p.appendChild(document.createElement('br'));inl(p,l)});root.appendChild(p);para=[]}
while(i<L.length){var l=L[i],m;
if(l.indexOf('|')>=0&&i+1<L.length&&TSEP.test(L[i+1])){flush();var hd=cells(l),w=mk('div','tbw'),tb=mk('table','mdt'),th=mk('thead'),tr=mk('tr');hd.forEach(function(c){var e=mk('th');inl(e,c);tr.appendChild(e)});th.appendChild(tr);tb.appendChild(th);var bd=mk('tbody');i+=2;
while(i<L.length&&L[i].indexOf('|')>=0&&L[i].trim()){var r=mk('tr'),cs=cells(L[i]);for(var k=0;k<hd.length;k++){var td=mk('td');inl(td,cs[k]||'');r.appendChild(td)}bd.appendChild(r);i++}tb.appendChild(bd);w.appendChild(tb);root.appendChild(w);continue}
if(/^\s*\[\[[^\[\]\n]{1,200}\]\]\s*$/.test(l)){flush();var ch=mk('div','choices');while(i<L.length&&(m=/^\s*\[\[([^\[\]\n]{1,200})\]\]\s*$/.exec(L[i]))){(function(x){var b=mk('button','choice',x);b.type='button';b.onclick=function(){pick(x)};ch.appendChild(b)})(m[1].trim());i++}root.appendChild(ch);continue}
if((m=/^\s*(#{1,4})\s+(.+)$/.exec(l))){flush();var hh=mk('div','mh h'+m[1].length);inl(hh,m[2].replace(/\s*#+\s*$/,''));root.appendChild(hh);i++;continue}
if(/^\s*([-*•]|\d+[.)])\s+/.test(l)){flush();var ol=/^\s*\d/.test(l),ls=mk(ol?'ol':'ul','mdl');while(i<L.length&&(m=/^\s*([-*•]|\d+[.)])\s+(.*)$/.exec(L[i]))&&(/\d/.test(m[1])===ol)){var li=mk('li');inl(li,m[2]);ls.appendChild(li);i++}root.appendChild(ls);continue}
if(/^\s*(---+|\*\*\*+)\s*$/.test(l)){flush();root.appendChild(mk('hr','mhr'));i++;continue}
if(!l.trim()){flush();i++;continue}
para.push(l);i++}flush()}
function body(d,t,key){var segs=ccode.parse(t);segs.forEach(function(sg,i){
if(sg.t!=='text'&&ccode.big(sg)){d.appendChild(ccode.card(sg,key+':'+i));return}
if(sg.t!=='text'){var lang=sg.lang||sg.t,code=sg.code||sg.raw||'',w=mk('div','cb notranslate'),h=mk('div','ch'),b=mk('button','cc','نسخ'),p=mk('pre');
h.appendChild(mk('span',0,lang||'code'));b.type='button';b.onclick=function(){copy(code);b.textContent='تم النسخ';setTimeout(function(){b.textContent='نسخ'},1800)};h.appendChild(b);p.appendChild(mk('code',0,code));w.appendChild(h);w.appendChild(p);d.appendChild(w)}
else if(sg.v.trim()){var p2=mk('div','md');md(p2,sg.v.replace(/^\n+|\n+$/g,''));d.appendChild(p2)}});return segs}
function logo(){var a=mk('img','bav');a.src='../img/logo.png';a.alt='';return a}
function clr(){var e=box.querySelector('.empty');if(e)e.remove()}
function srcs(b,l){if(!l||!l.length)return;var d=mk('div','srcs');d.appendChild(mk('span',0,'المصادر:'));l.forEach(function(x){if(!/^https:\/\//.test(x.url||''))return;link(d,x.title||x.url,x.url)});if(d.children.length>1)b.appendChild(d)}
function actEl(a){if(!a||!a.length)return null;var d=mk('details','act'),s=mk('summary',0,'خطوات كوول ('+a.length+')');d.appendChild(s);a.forEach(function(x){var r=mk('div','as '+x.s);r.appendChild(mk('i','ck',x.s==='bad'?'!':'✓'));r.appendChild(mk('span',0,x.l));d.appendChild(r)});return d}
function fileRow(b,fl){if(!fl||!fl.length)return;var w=mk('div','mfiles');fl.forEach(function(r){var f=cfiles.get(r.id)||r,c=cfiles.chip(f);if(f.kind==='image'&&f.data){var im=c.querySelector('img');if(im){im.style.cursor='zoom-in';im.onclick=function(){if(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/.test(f.data))return;var w=window.open();if(!w)return;w.opener=null;var z=w.document.createElement('img');z.src=f.data;z.style.maxWidth='100%';w.document.body.appendChild(z)}}}w.appendChild(c)});b.appendChild(w)}
var LK=0;
function resCards(b,fl,pt){if(!fl||!fl.length)return;var w=mk('div','rcards');fl.forEach(function(f,i){w.appendChild(ccode.resultCard(f,function(id){return cfiles.load(id)},pt&&pt[i]))});b.appendChild(w)}
function add(c,t,g,sr,ac,fl){clr();var d=mk('div','m '+c),b=mk('div','mb');
if(c==='bot'){d.appendChild(logo());var ae=actEl(ac);if(ae)b.appendChild(ae);var bd=mk('div','bd');d.key='m'+(++LK);body(bd,t,d.key);b.appendChild(bd);d.bd=bd}else{fileRow(b,fl);if(t)b.appendChild(mk('div','mt',t))}d.appendChild(b);
if(g&&/^data:image\/(png|jpeg);base64,/.test(g)){var im=mk('img','gen');im.src=g;im.alt='';b.appendChild(im);var dl=mk('a','dl','تحميل الصورة');dl.href=g;dl.download='coolai-'+Date.now()+'.png';b.appendChild(dl)}
srcs(b,sr);box.appendChild(d);box.scrollTop=box.scrollHeight;return d}
function status(){var d=mk('div','m bot status'),b=mk('div','mb'),l=mk('div','steps'),a=[];
b.appendChild(l);d.appendChild(logo());d.appendChild(b);box.appendChild(d);box.scrollTop=box.scrollHeight;
function draw(){l.textContent='';a.forEach(function(x){var r=mk('div','as '+x.s);if(x.s==='run'){var o=mk('span','dots');o.innerHTML='<i></i><i></i><i></i>';r.appendChild(o)}else r.appendChild(mk('i','ck',x.s==='bad'?'!':'✓'));r.appendChild(mk('span',0,x.l));l.appendChild(r)});box.scrollTop=box.scrollHeight}
return{has:function(k){return a.some(function(x){return x.k===k})},step:function(k,t){a.forEach(function(x){if(x.s==='run')x.s='ok'});a.push({k:k,l:t,s:'run'});draw()},done:function(k,t,bad){a.forEach(function(x){if(x.k===k){x.l=t;x.s=bad?'bad':'ok'}});draw()},list:function(){return a.map(function(x){return{k:x.k,l:x.l,s:x.s==='run'?'ok':x.s}})},end:function(){d.remove()}}}
function empty(){var d=mk('div','empty'),l=mk('img','elogo'),s=mk('div','sug');l.src='../img/logo.png';l.alt='';d.appendChild(l);d.appendChild(mk('h2',0,'أهلاً '+u.name+'، أنا '+(curMode()==='pro'?'CoolPro':'Cool')));d.appendChild(mk('p',0,'اسألني أي حاجة، ابعتلي ملف أو صورة من زر الدبوس، أو اطلب مني أرسم صورة. محادثاتك وملفاتك وذاكرتك محفوظة على جهازك.'));
['اشرح لي الـ API ببساطة','اعملي صفحة HTML بسيطة','أخبار النهارده إيه؟','أفكار لمشروع جديد'].forEach(function(t){var b=mk('button','chip',t);b.type='button';b.onclick=function(){$('ci').value=t;$('ci').focus()};s.appendChild(b)});d.appendChild(s);box.appendChild(d)}
function drawMsgs(){box.textContent='';if(!cur.messages.length)empty();else cur.messages.forEach(function(m){var el=add(m.role==='user'?'me':'bot',m.content,m.image,m.src,m.act,m.files);if(m.role!=='user'&&m.files)resCards(el.querySelector('.mb'),m.files,m.patch)})}
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
function flash(e){var h=$('hint');h.textContent=e;h.classList.add('warn');clearTimeout(flash.t);flash.t=setTimeout(function(){h.classList.remove('warn');hint()},4500)}
ccode.init();
var FREADY=cfiles.init(u.userId,flash);
Promise.all([store.chats(),store.get('mem:'+u.userId),store.get('cur:'+u.userId),FREADY]).then(function(r){
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
e.preventDefault();if(busy){if(stopFn)stopFn();return}var t=$('ci').value.trim(),fa=cfiles.attached();if((!t&&!fa.length)||busy||!cur)return;
if(imgMode&&fa.length)return flash('وضع رسم الصورة مش بيستخدم الملفات. اقفل وضع الرسم عشان Cool يقرأ الملفات.');
if(!t)t=fa.some(function(f){return f.kind==='image'})?'شوف المرفقات دي وقولّي فيها إيه':'اقرأ الملفات دي وقولّي فيها إيه';
if(t.length>2000)return add('bot','الرسالة طويلة جداً، الحد الأقصى 2000 حرف.');
var need=cost(),md=curMode();
if(u.credits<need)return add('bot',(imgMode?'رسم الصورة بـ ':'الرسالة في الوضع ده بـ ')+need+' كريديت. رصيدك '+u.credits+' كريديت. '+(u.credits>0?'الرصيد المجاني بيتجدد بس لما يوصل صفر. ':'')+(u.freeRe?'هيتجدد '+time(u.freeRe)+'، أو ':'')+'اشحن Coins وحوّلها لكريديت من المحفظة، أو ادعُ صحابك.');
busy=true;$('cs').classList.add('stop');$('cs').title='إيقاف';var ctl=new AbortController();$('ci').value='';$('ci').style.height='auto';
var fm=fa.map(function(f){return{id:f.id,name:f.name,kind:f.kind,lang:f.lang||'',lines:f.lines||0,size:f.size}});cfiles.clear();
var um={role:'user',content:t};if(fm.length)um.files=fm;cur.messages.push(um);if(cur.messages.length===1){cur.title=(t||fm[0].name).slice(0,30);ttl();drawHist()}
var meEl=add('me',t,null,null,null,fm);var st=status(),n=cur.messages.filter(function(m){return m.role==='user'}).length,live=null,txt='',sr=[],fin=false,pend=0,isImg=imgMode,wait=false,retried=false,act=null,sq='';
ccode.reset();st.step('think',isImg?'يجهّز وصف الصورة':'يفكر في طلبك');
function paintLive(){pend=0;live.bd.textContent='';var sg=body(live.bd,txt,live.key);for(var i=sg.length-1;i>=0;i--){if(sg[i].t!=='text'&&ccode.big(sg[i])){if(sg[i].open||ccode.isOpen())ccode.stream(sg[i],live.key+':'+i);if(!sg[i].open)ccode.finishLive(live.key+':'+i);break}}box.scrollTop=box.scrollHeight}
function unlock(){busy=false;stopFn=null;$('cs').classList.remove('stop');$('cs').title='إرسال'}
stopFn=function(){if(fin)return;ctl.abort();wait=false;if(pend)cancelAnimationFrame(pend);if(live){paintLive();finish(txt+'\n\n_(اتوقف الرد)_')}else{fin=true;unlock();st.end();cur.messages.pop();store.save(cur);meEl.remove();$('ci').value=t;if(!cur.messages.length)drawMsgs();flash('وقفت الرد، رسالتك رجعت في خانة الكتابة')}};
function credits(ev){if(ev.credits!==undefined){u.credits=ev.credits;u.freeRe=ev.freeRe||0;paint()}}
function finish(content,img,nf,pt){fin=true;unlock();var rm={role:'assistant',content:content};if(img)rm.image=img;if(nf&&nf.length){rm.files=nf;rm.patch=pt}if(sr.length)rm.src=sr;if(act&&act.length)rm.act=act;cur.messages.push(rm);cur.updated=Date.now();store.save(cur);chats.sort(function(a,b){return b.updated-a.updated});drawHist()}
var FB=md==='pro'?160000:6000,FX=null;
function ctxFiles(){var out=[],seen={};for(var i=cur.messages.length-1;i>=0;i--){var m=cur.messages[i];(m.files||[]).forEach(function(f){if(f.kind==='text'&&!seen[f.name.toLowerCase()]){seen[f.name.toLowerCase()]=1;out.push(f)}})}return out}
function patchAll(t){var segs=ccode.parse(t).filter(function(x){return(x.t==='edit'||x.t==='func')&&!x.open});if(!segs.length)return Promise.resolve({files:[],res:[]});var pool=ctxFiles(),groups={},order=[];
segs.forEach(function(sg){var nm=(sg.file||'').split(/[\\/]/).pop().toLowerCase(),f=pool.filter(function(x){return x.name.toLowerCase()===nm})[0]||(pool.length===1||!nm?pool[0]:null);if(!f)return;if(!groups[f.id]){groups[f.id]={meta:f,segs:[]};order.push(f.id)}groups[f.id].segs.push(sg)});
return Promise.all(order.map(function(id){var g=groups[id];return cfiles.load(id).then(function(src){if(!src||src.text==null)return null;var text=src.text,ok=0,fail=0,rg=[];g.segs.forEach(function(sg){var r=ccode.apply(text,sg);text=r.text;ok+=r.ok;fail+=r.fail;rg=rg.concat(r.ranges)});if(!ok)return{fail:fail,none:true};return cfiles.saveText(src,text,rg).then(function(nf){return{meta:{id:nf.id,name:nf.name,kind:'text',lang:nf.lang,lines:nf.lines,size:nf.size},res:{ok:ok,fail:fail}}})}).catch(function(){return null})})).then(function(a){var files=[],res=[];a.forEach(function(x){if(x&&x.meta){files.push(x.meta);res.push(x.res)}else if(x&&x.none)flash('Cool كتب تعديل بس مقدرتش أركّبه على الملف تلقائياً. تقدر تنسخ التعديل من الرد.')});return{files:files,res:res}})}
function gather(){if(isImg)return Promise.resolve({files:[],image:''});var src=fm,cur0=true;if(!src.length){cur0=false;src=ctxFiles().slice(0,5)}
return Promise.all(src.map(function(r){return cfiles.load(r.id).catch(function(){return null})})).then(function(a){var out=[],img='',left=FB,cut=false;a.forEach(function(f){if(!f)return;if(f.kind==='image'){if(cur0&&!img&&f.data)img=f.data;return}var tx=f.text||'';if(tx.length>left){tx=tx.slice(0,Math.max(0,left));cut=true}left-=tx.length;if(tx)out.push({name:f.name,text:tx,lines:f.lines,full:(f.text||'').length})});return{files:out,image:img,cut:cut,ctx:!cur0}})}
var SP={google:'Google',bing:'Bing',brave:'Brave',ddg:'DuckDuckGo',wiki:'Wikipedia',news:'Google News',browser:'جهازك'};
function onEv(ev){if(fin&&ev.t!=='facts')return;
if(ev.t==='stage'){if(ev.v==='thinking'){if(!st.has('think'))st.step('think','يفكر في طلبك')}else if(ev.v==='reading'){if(!st.has('read'))st.step('read','يقرأ '+(ev.n>1?ev.n+' ملفات':'الملف')+(ev.lines?' ('+ev.lines+' سطر)':''))}else if(ev.v==='viewing'){if(!st.has('view'))st.step('view','يشوف الصورة')}else if(ev.v==='searching'){if(!retried){sq=String(ev.q||'');st.step('search','يبحث في الإنترنت: «'+sq.slice(0,60)+'»')}}else if(ev.v==='drawing'){st.step('draw','يرسم الصورة')}else if(ev.v==='writing'){st.step('write','يكتب الرد')}}
else if(ev.t==='searched'){if(!retried){var pv=String(ev.p||'').split('+').map(function(x){return SP[x]||x}).join('، ');st.done('search','بحث عن «'+String(ev.q||'').slice(0,60)+'»: '+(ev.n?'لقيت '+ev.n+' مصدر'+(pv?' ('+pv+')':''):'مفيش نتائج، هجاوب بحذر'),!ev.n)}}
else if(ev.t==='viewed'){st.done('view',ev.ok?'شاف الصورة':'مقدرش يشوف الصورة بوضوح',!ev.ok)}
else if(ev.t==='src'){sr=ev.v||[]}
else if(ev.t==='tok'){txt+=ev.v;if(!live){act=st.list();st.end();live=add('bot','',null,null,act);live.mb=live.querySelector('.mb')}if(!pend)pend=requestAnimationFrame(paintLive)}
else if(ev.t==='done'){credits(ev);if(pend)cancelAnimationFrame(pend);if(live){paintLive();srcs(live.mb,sr)}fin=true;patchAll(txt).then(function(r){if(r.files.length&&live){resCards(live.mb,r.files,r.res);box.scrollTop=box.scrollHeight;var x=r.files[r.files.length-1];cfiles.load(x.id).then(function(f){if(f)ccode.show({code:f.text,lang:f.lang,name:f.name,title:f.name,chg:f.ranges,note:'الأسطر المعدلة متعلّمة',line:f.ranges&&f.ranges[0]&&f.ranges[0][0]})})}finish(txt,null,r.files,r.res)})}
else if(ev.t==='image'){st.end();credits(ev);add('bot','تم رسم الصورة.',ev.image);finish('تم رسم الصورة: '+t.slice(0,80),ev.image)}
else if(ev.t==='needsearch'){credits(ev);wait=true;retried=true;sq=String(ev.q||t);st.done('search','السيرفر ملقاش نتائج لـ «'+sq.slice(0,60)+'»',true);st.step('bsearch','يبحث من جهازك: «'+sq.slice(0,60)+'»');csearch(sq).then(function(r){wait=false;st.done('bsearch','بحث من جهازك: '+(r.length?'لقيت '+r.length+' مصدر':'مفيش نتائج، هجاوب بحذر'),!r.length);run(r,true)})}
else if(ev.t==='facts'){if(ev.v&&ev.v.length){ev.v.forEach(function(f){if(mem.indexOf(f)<0)mem.push(f)});mem=mem.slice(-40);store.set('mem:'+u.userId,mem);drawMem()}}
else if(ev.t==='fail'){if(ev.status===401)return logout();if(ev.code==='notpro'){u.role='free';paint()}fin=true;unlock();st.end();if(pend)cancelAnimationFrame(pend);if(live)live.remove();credits(ev);cur.messages.pop();add('bot',ev.error||'حصل خطأ، حاول تاني')}}
function run(web,tried){(FX?Promise.resolve(FX):gather()).then(function(fx){FX=fx;if(fx.cut&&!tried)flash('الملفات أكبر من حد الوضع الحالي، Cool هيقرأ أول '+FB+' حرف بس'+(md==='pro'?'':'. وضع Pro بيقرأ ملفات أكبر بكتير'));return apiStream(isImg?'image':'chat',isImg?{prompt:t,mode:md}:{mode:md,messages:cur.messages.slice(-20).map(function(m){var c=m.content;if(m.role==='user'&&m.files&&m.files.length)c='['+m.files.map(function(f){return(f.kind==='image'?'صورة: ':'ملف: ')+f.name}).join('، ')+']\n'+c;return{role:m.role,content:c}}),files:fx.files,fileCtx:!!fx.ctx,image:fx.image,tz:(function(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){return''}})(),loc:navigator.language||'',memory:mem,extract:n%3===0||/(احفظ|إحفظ|تذكر|اتذكر|خليك فاكر|فكرني|remember|memorize|save this)/i.test(t),web:web||[],webTried:!!tried,q:sq},onEv,ctl.signal)}).then(function(){if(!fin&&!wait)onEv({t:'fail',error:'حصل خطأ، حاول تاني'})})}
run([],false)};
$('ci').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!/Mobi|Android/i.test(navigator.userAgent)){e.preventDefault();$('cf').requestSubmit()}});
})();
