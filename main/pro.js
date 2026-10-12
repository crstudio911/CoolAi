(function(){
var $=function(i){return document.getElementById(i)},C=COOLAI,K=C.SESSION_KEY,S=getSession(),info=null,last=null;
if(!S||!S.token){location.replace('../log/login.html');return}
function mk(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function copy(x){if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(x).catch(function(){})}
function active(){var u=S.user;return u.role==='pro'&&(!u.proUntil||u.proUntil>Date.now())}
function canBuy(){return !active()||(S.user.proUntil&&S.user.proUntil-Date.now()<=3*864e5)}
function step(n){$('pay').hidden=n!==1;$('inv').hidden=n!==2;$('go').hidden=n!==0||!canBuy()}
function paint(){var pro=active(),left=pro&&S.user.proUntil?Math.max(0,Math.ceil((S.user.proUntil-Date.now())/864e5)):0;$('st-pro').hidden=!pro;if(pro)$('st-pro').textContent='حسابك Pro لحد '+INV.day(S.user.proUntil)+' (فاضل '+left+' يوم).'+(canBuy()?' تقدر تجدد دلوقتي وهتتضاف 30 يوم على مدتك.':' التجديد بيتفتح في آخر 3 أيام.');$('go').hidden=!canBuy();$('go').textContent=pro?'جدّد الاشتراك (شهر)':'اشترك الآن (شهر)'}
api('me').then(function(r){if(r.status===401){localStorage.removeItem(K);location.replace('../log/login.html');return}if(r.user){S.user=r.user;localStorage.setItem(K,JSON.stringify(S))}
return PUB.then(function(p){info=p.pro||{price:0,credits:0,refill:25,hours:12,features:[]};
$('pp').textContent=info.price;$('pcr').textContent=info.credits+' كريديت';$('prf').textContent=info.refill+' كريديت';$('ph').textContent=info.hours;
var l=$('pf');l.textContent='';(info.features||[]).forEach(function(f){l.appendChild(mk('li',0,f))});
$('pw').hidden=false;paint()})});
$('pi').textContent=C.INSTAPAY;$('ptd').textContent=C.TELDA;$('psp').href='https://wa.me/'+C.SUPPORT_WA;
$('pic').onclick=function(){copy(C.INSTAPAY);$('pic').textContent='تم النسخ'};
$('go').onclick=function(){$('ge').textContent='';$('pt').textContent=info.price;$('pck').checked=false;$('pe').textContent='';step(1)};
$('pb').onclick=function(){step(0)};
function rows(i){var u=S.user,T=INV.t;return[[T('no'),i.invoiceId],[T('date'),INV.date(i.ts)],[T('name'),u.name],[T('email'),u.email],[T('type'),T('proSub')],[T('duration'),T('month')],[T('total'),i.total+' '+T('cur')]]}
function txt(v){return[v.title,INV.t('status')+': '+INV.t('pending')].concat(v.rows.map(function(r){return r[0]+': '+r[1]}),v.notes).join('\n')}
function png(v){INV.png(v,{support:C.SUPPORT_TEXT,accent:'#d29922'})}
$('pn').onclick=function(){if(!$('pck').checked)return $('pe').textContent='أكد إنك حوّلت واحتفظت بسكرين التحويل';$('pn').disabled=true;
api('proinvoice',{}).then(function(r){$('pn').disabled=false;if(r.status===401){localStorage.removeItem(K);return location.replace('../log/login.html')}if(!r.invoice)return $('pe').textContent=r.error||'تعذر إنشاء الفاتورة';
var v={id:r.invoice.invoiceId,title:INV.t('proTitle'),status:'pending',notes:[INV.t('proNote')],rows:rows(r.invoice)};last=v;var b=$('ir');b.textContent='';b.classList.add('notranslate');b.dir=INV.rtl()?'rtl':'ltr';v.rows.forEach(function(x){var e=mk('div','invrow');e.appendChild(mk('span',0,x[0]));e.appendChild(mk('b',0,x[1]));b.appendChild(e)});
$('iwa').href='https://wa.me/'+C.SUPPORT_WA+'?text='+encodeURIComponent(txt(v)+'\n\n'+INV.t('attach'));step(2);png(v)})};
$('idl').onclick=function(){if(last)png(last)};
})();
