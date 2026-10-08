(function(){
var $=function(i){return document.getElementById(i)},C=COOLAI,S=getSession();
if(!S||!S.token||!$('w-buy'))return;
var ST={pending:'قيد المراجعة',paid:'تم الدفع',rejected:'مرفوضة'},SC={pending:'#9a6700',paid:'#1a7f37',rejected:'#cf222e'},price=1,min=10,max=10000,off=0,PK=[50,100,250,500,1000],last=null,hist=[],POL='سياسة الاسترجاع: لا يمكن الاسترجاع بعد إضافة Coins في حسابك';
function usr(){var s=getSession();return s?s.user:S.user}
function mk(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function paint(){var u=usr();$('wc').textContent=u.coins||0;$('wk').textContent=u.credits;$('ic').textContent=u.inviteCode||'';$('wfree').textContent=u.freeRe&&u.credits<1?'كريديت مجاني بيتجدد '+new Date(u.freeRe).toLocaleTimeString('ar-EG',{hour:'numeric',minute:'2-digit',hour12:true}):''}
function n(){return Math.floor(+$('bn').value)||0}
function total(){return Math.max(0,n()*price-off)}
function calc(){$('bq').textContent=n();$('bt').textContent=total();$('bd').textContent='- '+off+' جنيه';$('bdr').hidden=!off;document.querySelectorAll('.pkb').forEach(function(b){b.classList.toggle('on',+b.dataset.v===n())})}
PK.forEach(function(v){var b=mk('button','pkb');b.type='button';b.dataset.v=v;b.appendChild(mk('b',0,v));b.appendChild(mk('span',0,'Coins'));b.appendChild(mk('small',0,v+' جنيه'));b.onclick=function(){$('bn').value=v;calc()};$('pk').appendChild(b)});
function promo(){var c=$('bc').value.trim();return api('promo',{code:c}).then(function(r){if(r.price){price=r.price;min=r.min;max=r.max}off=r.off||0;$('be').textContent=c&&!off?'كود الخصم غير صحيح':'';calc()})}
function go(s){['w-buy','w-pay','w-inv'].forEach(function(i,k){$(i).hidden=k!==s})}
$('bca').onclick=promo;$('bn').oninput=calc;
$('bgo').onclick=function(){var v=n();if(v<min||v>max)return $('be').textContent='العدد من '+min+' إلى '+max;promo().then(function(){if($('bc').value.trim()&&!off)return;$('wpt').textContent=total();$('wpck').checked=false;$('wpe').textContent='';go(1)})};
$('wpi').textContent=C.INSTAPAY;$('wptd').textContent=C.TELDA;$('wpsp').href='https://wa.me/'+C.SUPPORT_WA;$('wpst').textContent=C.SUPPORT_TEXT;
$('wpic').onclick=function(){(navigator.clipboard?navigator.clipboard.writeText.bind(navigator.clipboard):function(){})(C.INSTAPAY);$('wpic').textContent='تم النسخ'};
$('wpb').onclick=function(){go(0)};
$('cp').onclick=function(){(navigator.clipboard?navigator.clipboard.writeText.bind(navigator.clipboard):function(){})(location.origin+location.pathname.replace('main/main.html','log/login.html')+'?ref='+usr().inviteCode);$('cp').textContent='تم نسخ رابط الدعوة'};
function mkInv(i,u){var d=i.date||new Date(i.ts).toLocaleString('ar-EG',{day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true});
if(i.type==='pro'){var pr=[['رقم الفاتورة',i.invoiceId],['التاريخ',d],['الاسم',u.name],['البريد',u.email],['النوع','اشتراك Pro'],['الإجمالي',i.total+' جنيه']];return{id:i.invoiceId,rows:pr,status:i.status||'pending',sum:'اشتراك Pro · '+i.total+' جنيه'}}
var rows=[['رقم الفاتورة',i.invoiceId],['التاريخ',d],['الاسم',u.name],['البريد',u.email],['عدد Coins',i.coins],['سعر الـ Coin',(i.price||price)+' جنيه']];
if(i.discount)rows.push(['كود الخصم ('+i.code+')','- '+i.discount+' جنيه']);rows.push(['الإجمالي',i.total+' جنيه']);return{id:i.invoiceId,rows:rows,status:i.status||'pending',sum:i.coins+' Coins · '+i.total+' جنيه'}}
function text(v){return ['فاتورة CoolAi'].concat(v.rows.map(function(r){return r[0]+': '+r[1]}),[POL]).join('\n')}
function show(v){last=v;var b=$('wirows');b.textContent='';v.rows.forEach(function(r){var e=mk('div','invrow');e.appendChild(mk('span',0,r[0]));e.appendChild(mk('b',0,r[1]));b.appendChild(e)});$('wipol').textContent=POL;
$('wiwa').href='https://wa.me/'+C.SUPPORT_WA+'?text='+encodeURIComponent(text(v)+'\n\nمرفق سكرين التحويل.');go(2)}
function png(v){
var W=900,P=56,RH=60,H=240+v.rows.length*RH+150,c=document.createElement('canvas'),x=c.getContext('2d'),F='"IBM Plex Sans Arabic",Tahoma,sans-serif';c.width=W;c.height=H;
function draw(im){
x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#0d1117';x.fillRect(0,0,W,12);
if(im)x.drawImage(im,W-P-56,46,56,56);
x.direction='rtl';x.textBaseline='middle';x.textAlign='right';
x.fillStyle='#0d1117';x.font='700 40px '+F;x.fillText('فاتورة CoolAi',W-P-72,74);
x.fillStyle=SC[v.status]||SC.pending;x.font='600 22px '+F;x.fillText('الحالة: '+(ST[v.status]||ST.pending),W-P,140);
v.rows.forEach(function(r,k){var y=210+k*RH;x.strokeStyle='#d0d7de';x.beginPath();x.moveTo(P,y+RH/2);x.lineTo(W-P,y+RH/2);x.stroke();
x.textAlign='right';x.fillStyle='#57606a';x.font='500 24px '+F;x.fillText(r[0],W-P,y);
x.textAlign='left';x.fillStyle='#0d1117';x.font='600 26px '+F;x.fillText(String(r[1]),P,y)});
x.textAlign='right';x.fillStyle='#57606a';x.font='500 20px '+F;x.fillText(POL,W-P,H-85);x.fillText('الدعم على واتساب: '+C.SUPPORT_TEXT,W-P,H-45);
c.toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='CoolAi-'+v.id+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},4000)})}
var im=new Image();im.onload=function(){draw(im)};im.onerror=function(){draw(null)};
(document.fonts?document.fonts.ready:Promise.resolve()).then(function(){im.src='../img/logo.png'})}
function drawHis(){var l=$('wih');l.textContent='';$('w-his').hidden=!hist.length;hist.forEach(function(v){var r=mk('div','hrow'),a=mk('div'),z=mk('div','row'),b=mk('button','btn','تحميل'),g=mk('span','badge '+v.status,ST[v.status]||ST.pending);a.appendChild(mk('b',0,v.id));a.appendChild(mk('small',0,v.sum));a.appendChild(mk('small',0,v.rows[1][1]));b.onclick=function(){png(v)};z.appendChild(g);z.appendChild(b);r.appendChild(a);r.appendChild(z);l.appendChild(r)})}
function loadInv(){return api('invoices').then(function(r){if(r.invoices){hist=r.invoices.map(function(i){return mkInv(i,usr())});drawHis()}})}
var lastR=0;
function refresh(){if(location.hash!=='#wallet'||Date.now()-lastR<8000)return;lastR=Date.now();loadInv();api('me').then(function(r){if(r.user)dispatchEvent(new CustomEvent('userupdate',{detail:r.user}))})}
$('wpn').onclick=function(){
if(!$('wpck').checked)return $('wpe').textContent='أكد إنك حوّلت واحتفظت بسكرين التحويل';
$('wpn').disabled=true;
api('invoice',{coins:n(),code:$('bc').value.trim()}).then(function(r){$('wpn').disabled=false;if(!r.invoice){return $('wpe').textContent=r.error||'تعذر إنشاء الفاتورة'}
var v=mkInv(r.invoice,usr());show(v);png(v);loadInv()})};
$('widl').onclick=function(){if(last)png(last)};
$('wicp').onclick=function(){if(last){(navigator.clipboard?navigator.clipboard.writeText.bind(navigator.clipboard):function(){})(text(last));$('wicp').textContent='تم النسخ'}};
$('wiok').onclick=function(){go(0);$('bn').value=100;$('bc').value='';off=0;calc();$('wicp').textContent='نسخ نص الفاتورة'};
function sync(){paint()}
addEventListener('hashchange',sync);addEventListener('hashchange',refresh);addEventListener('userupdate',sync);
loadInv();refresh();
$('cvm').onclick=function(){$('cvn').value=usr().coins||''};
$('cvb').onclick=function(){var v=Math.floor(+$('cvn').value);$('cve').textContent='';if(!(v>=1))return $('cve').textContent='اكتب عدد صحيح';if(v>(usr().coins||0))return $('cve').textContent='رصيد Coins مش كفاية';
$('cvb').disabled=true;api('convert',{n:v}).then(function(r){$('cvb').disabled=false;if(!r.user){return $('cve').textContent=r.error||'تعذر التحويل'}
dispatchEvent(new CustomEvent('userupdate',{detail:r.user}));$('cvn').value='';$('cve').textContent='تم التحويل';$('cve').classList.add('ok');setTimeout(function(){$('cve').textContent='';$('cve').classList.remove('ok')},3000)})};
$('gcb').onclick=function(){var c=$('gc').value.trim(),e=$('gce');e.classList.remove('ok');if(c.length<2)return e.textContent='اكتب الكود';$('gcb').disabled=true;e.textContent='';api('redeem',{code:c}).then(function(r){$('gcb').disabled=false;if(!r.user)return e.textContent=r.error||'تعذر تفعيل الكود';dispatchEvent(new CustomEvent('userupdate',{detail:r.user}));$('gc').value='';e.classList.add('ok');e.textContent=[r.pro?'تمت ترقية حسابك إلى Pro':'',r.coins?'تمت إضافة '+r.coins+' Coins':''].filter(Boolean).join(' و ')})};
$('gc').onkeydown=function(ev){if(ev.key==='Enter'){ev.preventDefault();$('gcb').click()}};
promo();calc();setTimeout(sync,800);
})();
