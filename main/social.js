(function(){
var $=function(i){return document.getElementById(i)},S=getSession();
if(!S||!S.token)return;
var uid=S.user.userId,likes={},posts=[],loaded=false,seen={},img=null,pb=false;
function usr(){var s=getSession();return s?s.user:S.user}
function when(t){return new Date(t).toLocaleString('ar-EG',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit',hour12:true})}
function av(n){return(n||'?').trim().charAt(0).toUpperCase()}
function mk(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function avEl(n,u){var d=mk('div','avatar',av(n));if(/^https:\/\/i\.ibb\.co\//.test(u||'')){d.textContent='';var i=document.createElement('img');i.src=u;i.alt='';d.appendChild(i)}return d}
function card(p){
var d=mk('article','post rise'),h=mk('div','ph'),w=mk('div'),n=mk('b',0,p.name),s=mk('small',0,when(p.ts));
w.appendChild(n);w.appendChild(s);h.appendChild(avEl(p.name,p.avatar));h.appendChild(w);d.appendChild(h);
if(p.text)d.appendChild(mk('p',0,p.text));
if(/^https:\/\/i\.ibb\.co\//.test(p.image||'')){var i=document.createElement('img');i.src=p.image;i.loading='lazy';i.alt='';d.appendChild(i)}
var b=mk('button','like');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.500 5.500 0 0 0-7.800 0L12 5.700l-1-1.100a5.500 5.500 0 0 0-7.800 7.800l1 1.100L12 21l7.800-7.500 1-1.100a5.500 5.500 0 0 0 0-7.800z"/></svg><span></span>';
var c=b.lastChild;
function paint(){c.textContent=p.likes;b.classList.toggle('on',!!likes[p.postId])}paint();
b.onclick=function(){var on=!likes[p.postId];if(on)likes[p.postId]=1;else delete likes[p.postId];p.likes=Math.max(0,p.likes+(on?1:-1));paint();store.set('likes:'+uid,likes);
api('like',{postId:p.postId,delta:on?1:-1}).then(function(r){if(r.likes!==undefined){p.likes=r.likes;paint()}})};
d.appendChild(b);if(p.uid===uid){var x=mk('button','like','حذف');x.style.marginInlineStart='.5rem';x.onclick=function(){if(!confirm('حذف المنشور؟'))return;api('delpost',{postId:p.postId}).then(function(r){if(r.ok){posts=posts.filter(function(q){return q!==p});draw()}})};d.appendChild(x)}return d}
function draw(){var l=$('pl');l.textContent='';if(!posts.length){l.appendChild(mk('p','soon','لسه مفيش منشورات. كن أول واحد!'));return}posts.forEach(function(p){l.appendChild(card(p))})}
function load(){var l=$('pl');if(!loaded){l.textContent='';l.appendChild(mk('div','skel'));l.appendChild(mk('div','skel'))}
api('posts').then(function(r){loaded=true;posts=r.posts||[];draw()})}
function shrink(f){return new Promise(function(res,rej){var i=new Image(),u=URL.createObjectURL(f);i.onload=function(){var s=Math.min(1,1280/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.8))};i.onerror=rej;i.src=u})}
$('pf').onchange=function(){var f=this.files[0];if(!f)return;if(f.type.indexOf('image/')!==0||f.size>12e6){$('perr').textContent='صورة غير صالحة';return}
shrink(f).then(function(d){img=d;$('pprev').src=d;$('pprev').hidden=false;$('perr').textContent=''}).catch(function(){$('perr').textContent='تعذر قراءة الصورة'})};
$('pgo').onclick=function(){
var t=$('pt').value.trim();if((!t&&!img)||pb)return;pb=true;$('pgo').disabled=true;$('perr').textContent='';
function send(url){return api('post',{text:t,image:url||''}).then(function(r){
if(!r.post){$('perr').textContent=r.error||'تعذر النشر';return}
posts.unshift(r.post);draw();$('pt').value='';img=null;$('pprev').hidden=true;$('pf').value=''})}
(img?api('upload',{image:img.split(',')[1]}).then(function(r){if(!r.url){$('perr').textContent=r.error||'فشل رفع الصورة';return}return send(r.url)}):send()).then(function(){pb=false;$('pgo').disabled=false})};
var cm=$('cm');
function addMsg(m){if(seen[m.msgId])return;seen[m.msgId]=1;var me=m.uid===uid,near=cm.scrollHeight-cm.scrollTop-cm.clientHeight<120,d=mk('div','cmm'+(me?' me':'')),b=mk('div','b');
b.appendChild(mk('small',0,m.name+' · '+when(m.ts)));b.appendChild(mk('span',0,m.text));d.appendChild(avEl(m.name,m.avatar));d.appendChild(b);cm.appendChild(d);if(near||me)cm.scrollTop=cm.scrollHeight}
function poll(){if(location.hash!=='#community'||document.hidden)return;api('msgs').then(function(r){(r.msgs||[]).forEach(addMsg)})}
setInterval(poll,4000);
$('cmf').onsubmit=function(e){e.preventDefault();var t=$('cmi').value.trim();if(!t)return;$('cmi').value='';api('msg',{text:t}).then(function(r){if(r.msg)addMsg(r.msg);else addMsg({msgId:'x'+Date.now(),uid:uid,name:usr().name,text:r.error||'تعذر الإرسال',ts:Date.now()})})};
function profile(){var u=usr();var pv=$('pav');pv.textContent='';if(/^https:\/\/i\.ibb\.co\//.test(u.avatar||'')){var im=document.createElement('img');im.src=u.avatar;im.alt='';pv.appendChild(im)}else pv.textContent=av(u.name);$('pn').textContent=u.name;$('pe').textContent=u.email||'';$('pd').textContent=u.createdAt?'عضو منذ '+u.createdAt:'';$('pc').textContent=u.inviteCode||'';$('pr').textContent=u.referredBy||'لا يوجد'}
$('pcp').onclick=function(){(navigator.clipboard?navigator.clipboard.writeText.bind(navigator.clipboard):function(){})(location.origin+location.pathname.replace('main/main.html','log/login.html')+'?ref='+usr().inviteCode);$('pcp').textContent='تم نسخ رابط الدعوة'};
function sq(f){return new Promise(function(res,rej){var i=new Image(),u=URL.createObjectURL(f);i.onload=function(){var m=Math.min(i.width,i.height),c=document.createElement('canvas');c.width=c.height=256;c.getContext('2d').drawImage(i,(i.width-m)/2,(i.height-m)/2,m,m,0,0,256,256);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.85))};i.onerror=rej;i.src=u})}
$('pav-f').onchange=function(){var f=this.files[0];if(!f||f.type.indexOf('image/')!==0||f.size>12e6){$('pverr').textContent='صورة غير صالحة';return}
$('pverr').textContent='جاري الرفع...';
sq(f).then(function(d){return api('upload',{image:d.split(',')[1]})}).then(function(r){if(!r.url)throw r;return api('avatar',{url:r.url})}).then(function(r){if(!r.user)throw r;window.dispatchEvent(new CustomEvent('userupdate',{detail:r.user}));profile();$('pverr').textContent=''}).catch(function(e){$('pverr').textContent=(e&&e.error)||'تعذر رفع الصورة'})};
function route(){var h=location.hash;if(h==='#posts'&&!loaded)load();if(h==='#community')poll();if(h==='#profile')profile()}
addEventListener('hashchange',route);
store.get('likes:'+uid).then(function(l){likes=l||{};route()});
setTimeout(profile,800);
})();
