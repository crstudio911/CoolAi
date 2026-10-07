(function(){
var K=COOLAI.SESSION_KEY,$=function(i){return document.getElementById(i)},S=getSession();
if(!S||!S.token){location.replace('../log/login.html');return}
var u=S.user,V=['chat','posts','community','profile','wallet'],box=$('msgs'),chats=[],cur=null,mem=[],busy=false;
function route(){var h=location.hash.slice(1);if(V.indexOf(h)<0)h='chat';V.forEach(function(v){$('v-'+v).classList.toggle('on',v===h)});document.querySelectorAll('[data-v]').forEach(function(a){a.classList.toggle('on',a.dataset.v===h)})}
addEventListener('hashchange',route);route();
function logout(){api('logout').then(function(){localStorage.removeItem(K);location.replace('../')})}
$('out').onclick=logout;
function time(t){return new Date(t).toLocaleTimeString('ar-EG',{hour:'numeric',minute:'2-digit',hour12:true})}
function paint(){$('crv').textContent=u.credits;$('cr').classList.toggle('low',u.credits<=3);$('who').textContent=u.name;$('ic').textContent=u.inviteCode;S.user=u;localStorage.setItem(K,JSON.stringify(S))}paint();
$('cp').onclick=function(){navigator.clipboard.writeText(location.origin+location.pathname.replace('main/main.html','log/login.html')+'?ref='+u.inviteCode);$('cp').textContent='تم نسخ رابط الدعوة'};
function add(c,t){var d=document.createElement('div');d.className='m '+c;d.textContent=t;box.appendChild(d);box.scrollTop=box.scrollHeight;return d}
function status(){var d=document.createElement('div'),s=['يفكر','يبحث','يكتب'],i=0,t;d.className='m bot status';d.innerHTML='<span class="dots"><i></i><i></i><i></i></span><span></span>';t=d.lastChild;t.textContent=s[0]+'...';var id=setInterval(function(){i=Math.min(i+1,2);t.textContent=s[i]+'...'},1800);box.appendChild(d);box.scrollTop=box.scrollHeight;return function(){clearInterval(id);d.remove()}}
function drawMem(){var l=$('mem');l.textContent='';mem.forEach(function(f,i){var li=document.createElement('li'),b=document.createElement('button');li.textContent=f;b.textContent='حذف';b.onclick=function(){mem.splice(i,1);store.set('mem:'+u.userId,mem);drawMem()};li.appendChild(b);l.appendChild(li)})}
$('clrm').onclick=function(){mem=[];store.set('mem:'+u.userId,mem);drawMem()};
function drawSel(){var s=$('sel');s.textContent='';chats.forEach(function(c){var o=document.createElement('option');o.value=c.id;o.textContent=c.title;if(cur&&c.id===cur.id)o.selected=true;s.appendChild(o)})}
function drawMsgs(){box.textContent='';if(!cur.messages.length)add('bot','أهلاً '+u.name+'! اسألني أي حاجة.');cur.messages.forEach(function(m){add(m.role==='user'?'me':'bot',m.content)})}
function open(c){cur=c;store.set('cur:'+u.userId,c.id);drawSel();drawMsgs()}
function fresh(){var c={id:crypto.randomUUID(),uid:u.userId,title:'محادثة جديدة',updated:Date.now(),messages:[]};chats.unshift(c);store.save(c);open(c)}
$('newc').onclick=fresh;
$('sel').onchange=function(){open(chats.filter(function(c){return c.id===$('sel').value})[0])};
$('delc').onclick=function(){if(!confirm('حذف المحادثة؟'))return;store.del(cur.id);chats=chats.filter(function(c){return c!==cur});chats.length?open(chats[0]):fresh()};
store.persist();
Promise.all([store.chats(),store.get('mem:'+u.userId),store.get('cur:'+u.userId)]).then(function(r){
chats=(r[0]||[]).filter(function(c){return c.uid===u.userId}).sort(function(a,b){return b.updated-a.updated});mem=r[1]||[];drawMem();
var c=chats.filter(function(x){return x.id===r[2]})[0];c?open(c):chats.length?open(chats[0]):fresh()});
api('me').then(function(r){if(r.status===401)return logout();if(r.user){u=r.user;paint()}});
$('cf').onsubmit=function(e){
e.preventDefault();var t=$('ci').value.trim();if(!t||busy||!cur)return;
if(t.length>2000)return add('bot','الرسالة طويلة جداً، الحد الأقصى 2000 حرف.');
if(u.credits<1)return add('bot',u.freeRe?'الكريديت خلص. هيتجدد '+time(u.freeRe)+'، أو ادعي صحابك واكسب 40 كريديت.':'الكريديت خلص. ادعي صحابك واكسب 40 كريديت.');
busy=true;$('cs').disabled=true;$('ci').value='';
cur.messages.push({role:'user',content:t});if(cur.messages.length===1)cur.title=t.slice(0,30);
add('me',t);var stop=status(),n=cur.messages.filter(function(m){return m.role==='user'}).length;
api('chat',{messages:cur.messages.slice(-20),memory:mem,extract:n%3===0}).then(function(r){
stop();busy=false;$('cs').disabled=false;
if(r.status===401)return logout();
if(r.credits!==undefined){u.credits=r.credits;u.freeRe=r.freeRe||0;paint()}
if(!r.reply){cur.messages.pop();add('bot',r.error||'حصل خطأ، حاول تاني');return}
cur.messages.push({role:'assistant',content:r.reply});cur.updated=Date.now();add('bot',r.reply);store.save(cur);drawSel();
if(r.facts&&r.facts.length){r.facts.forEach(function(f){if(mem.indexOf(f)<0)mem.push(f)});mem=mem.slice(-40);store.set('mem:'+u.userId,mem);drawMem()}})};
$('ci').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('cf').requestSubmit()}});
})();
