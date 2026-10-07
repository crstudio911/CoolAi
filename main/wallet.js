(function(){
var $=function(i){return document.getElementById(i)},C=COOLAI,S=getSession();
if(!S||!S.token||!$('w-buy'))return;
var price=1,min=10,max=10000,off=0;
function usr(){var s=getSession();return s?s.user:S.user}
function paint(){$('wc').textContent=usr().coins;$('wk').textContent=usr().credits}
function n(){return Math.floor(+$('bn').value)||0}
function total(){return Math.max(0,n()*price-off)}
function calc(){$('bt').textContent=total();$('bd').textContent=off?'تم خصم '+off+' جنيه':''}
function promo(){var c=$('bc').value.trim();return api('promo',{code:c}).then(function(r){if(r.price){price=r.price;min=r.min;max=r.max}off=r.off||0;$('be').textContent=c&&!off?'كود الخصم غير صحيح':'';calc()})}
function go(s){['w-buy','w-pay','w-inv'].forEach(function(i,k){$(i).hidden=k!==s})}
$('bca').onclick=promo;$('bn').oninput=calc;
$('bgo').onclick=function(){var v=n();if(v<min||v>max)return $('be').textContent='العدد من '+min+' إلى '+max;promo().then(function(){if($('bc').value.trim()&&!off)return;$('wpt').textContent=total();$('wpck').checked=false;$('wpe').textContent='';go(1)})};
$('wpi').textContent=C.INSTAPAY;$('wptd').textContent=C.TELDA;$('wpsp').href='https://wa.me/'+C.SUPPORT_WA;$('wpst').textContent=C.SUPPORT_TEXT;
$('wpic').onclick=function(){navigator.clipboard.writeText(C.INSTAPAY);$('wpic').textContent='تم النسخ'};
$('wpb').onclick=function(){go(0)};
function inv(i){
var u=usr(),d=new Date(i.ts).toLocaleString('ar-EG',{day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true});
var rows=[['رقم الفاتورة',i.invoiceId],['التاريخ',d],['الاسم',u.name],['البريد',u.email],['عدد الكوينز',i.coins],['سعر الكوين',price+' جنيه']];
if(i.discount)rows.push(['كود الخصم ('+i.code+')','- '+i.discount+' جنيه']);
rows.push(['الإجمالي',i.total+' جنيه']);
var box=$('wirows'),tx=['فاتورة CoolAi'];box.textContent='';
rows.forEach(function(r){var e=document.createElement('div'),a=document.createElement('span'),b=document.createElement('b');e.className='invrow';a.textContent=r[0];b.textContent=r[1];e.appendChild(a);e.appendChild(b);box.appendChild(e);tx.push(r[0]+': '+r[1])});
var pol='سياسة الاسترجاع: لا يمكن الاسترجاع بعد إضافة الكريديت في حسابك';
$('wipol').textContent=pol;tx.push(pol);
var text=tx.join('\n');
$('wiwa').href='https://wa.me/'+C.SUPPORT_WA+'?text='+encodeURIComponent(text+'\n\nمرفق سكرين التحويل.');
$('wicp').onclick=function(){navigator.clipboard.writeText(text);$('wicp').textContent='تم النسخ'};
go(2)}
$('wpn').onclick=function(){
if(!$('wpck').checked)return $('wpe').textContent='أكد إنك حوّلت واحتفظت بسكرين التحويل';
$('wpn').disabled=true;
api('invoice',{coins:n(),code:$('bc').value.trim()}).then(function(r){$('wpn').disabled=false;if(!r.invoice)return $('wpe').textContent=r.error||'تعذر إنشاء الفاتورة';inv(r.invoice)})};
$('wiok').onclick=function(){go(0);$('bn').value=100;$('bc').value='';off=0;calc();$('wicp').textContent='نسخ نص الفاتورة'};
$('cvb').onclick=function(){
var v=Math.floor(+$('cvn').value);$('cve').textContent='';
if(!(v>=1))return $('cve').textContent='اكتب عدد صحيح';
api('convert',{n:v}).then(function(r){if(!r.user)return $('cve').textContent=r.error||'تعذر التحويل';window.dispatchEvent(new CustomEvent('userupdate',{detail:r.user}));$('cvn').value='';paint();$('cve').textContent='تم التحويل'})};
addEventListener('hashchange',paint);addEventListener('userupdate',paint);
promo();setTimeout(paint,800);
})();
