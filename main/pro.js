(function(){
var $=function(i){return document.getElementById(i)},C=COOLAI,K=C.SESSION_KEY,S=getSession(),info=null,last=null;
if(!S||!S.token){location.replace('../log/login.html');return}
function mk(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function copy(x){if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(x).catch(function(){})}
function step(n){$('pay').hidden=n!==1;$('inv').hidden=n!==2;$('go').hidden=n!==0||S.user.role==='pro'}
function paint(){var pro=S.user.role==='pro';$('st-pro').hidden=!pro;$('go').hidden=pro}
api('me').then(function(r){if(r.status===401){localStorage.removeItem(K);location.replace('../log/login.html');return}if(r.user){S.user=r.user;localStorage.setItem(K,JSON.stringify(S))}
return PUB.then(function(p){info=p.pro||{price:0,credits:0,refill:25,hours:12,features:[]};
$('pp').textContent=info.price;$('pcr').textContent=info.credits+' كريديت';$('prf').textContent=info.refill+' كريديت';$('ph').textContent=info.hours;
var l=$('pf');l.textContent='';(info.features||[]).forEach(function(f){l.appendChild(mk('li',0,f))});
$('pw').hidden=false;paint()})});
$('pi').textContent=C.INSTAPAY;$('ptd').textContent=C.TELDA;$('psp').href='https://wa.me/'+C.SUPPORT_WA;
$('pic').onclick=function(){copy(C.INSTAPAY);$('pic').textContent='تم النسخ'};
$('go').onclick=function(){$('ge').textContent='';$('pt').textContent=info.price;$('pck').checked=false;$('pe').textContent='';step(1)};
$('pb').onclick=function(){step(0)};
function rows(i){var u=S.user,d=new Date(i.ts).toLocaleString('ar-EG',{day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true});return[['رقم الفاتورة',i.invoiceId],['التاريخ',d],['الاسم',u.name],['البريد',u.email],['النوع','اشتراك Pro'],['الإجمالي',i.total+' جنيه']]}
function txt(v){return['فاتورة ترقية CoolAi Pro'].concat(v.rows.map(function(r){return r[0]+': '+r[1]})).join('\n')}
function png(v){var W=900,P=56,RH=60,H=240+v.rows.length*RH+110,c=document.createElement('canvas'),x=c.getContext('2d'),F='"IBM Plex Sans Arabic",Tahoma,sans-serif';c.width=W;c.height=H;
function draw(im){x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#d29922';x.fillRect(0,0,W,12);if(im)x.drawImage(im,W-P-56,46,56,56);
x.direction='rtl';x.textBaseline='middle';x.textAlign='right';x.fillStyle='#0d1117';x.font='700 40px '+F;x.fillText('فاتورة CoolAi Pro',W-P-72,74);
x.fillStyle='#9a6700';x.font='600 22px '+F;x.fillText('الحالة: قيد المراجعة',W-P,140);
v.rows.forEach(function(r,k){var y=210+k*RH;x.strokeStyle='#d0d7de';x.beginPath();x.moveTo(P,y+RH/2);x.lineTo(W-P,y+RH/2);x.stroke();x.textAlign='right';x.fillStyle='#57606a';x.font='500 24px '+F;x.fillText(r[0],W-P,y);x.textAlign='left';x.fillStyle='#0d1117';x.font='600 26px '+F;x.fillText(String(r[1]),P,y)});
x.textAlign='right';x.fillStyle='#57606a';x.font='500 20px '+F;x.fillText('الدعم على واتساب: '+C.SUPPORT_TEXT,W-P,H-45);
c.toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='CoolAi-'+v.id+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},4000)})}
var im=new Image();im.onload=function(){draw(im)};im.onerror=function(){draw(null)};(document.fonts?document.fonts.ready:Promise.resolve()).then(function(){im.src='../img/logo.png'})}
$('pn').onclick=function(){if(!$('pck').checked)return $('pe').textContent='أكد إنك حوّلت واحتفظت بسكرين التحويل';$('pn').disabled=true;
api('proinvoice',{}).then(function(r){$('pn').disabled=false;if(r.status===401){localStorage.removeItem(K);return location.replace('../log/login.html')}if(!r.invoice)return $('pe').textContent=r.error||'تعذر إنشاء الفاتورة';
var v={id:r.invoice.invoiceId,rows:rows(r.invoice)};last=v;var b=$('ir');b.textContent='';v.rows.forEach(function(x){var e=mk('div','invrow');e.appendChild(mk('span',0,x[0]));e.appendChild(mk('b',0,x[1]));b.appendChild(e)});
$('iwa').href='https://wa.me/'+C.SUPPORT_WA+'?text='+encodeURIComponent(txt(v)+'\n\nمرفق سكرين التحويل.');step(2);png(v)})};
$('idl').onclick=function(){if(last)png(last)};
})();
