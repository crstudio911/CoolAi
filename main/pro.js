(function(){
var QP=(location.search.match(/[?&]plan=(pro|max)\b/)||[])[1],CMP=!QP,PL=QP||'pro',MX=PL==='max',$=function(i){return document.getElementById(i)},C=COOLAI,K=C.SESSION_KEY,S=getSession(),info=null,last=null;
if(!S||!S.token){location.replace('../log/login.html');return}
function MAXF(c){return['كل مميزات Pro ووضع Build مشمولة','CoolMax بموديل gpt-oss-120b، أقوى موديل في CoolAi','Max Build: منصة كاملة متعددة الصفحات (حتى 16 ملفًا و4 صور) من رسالة واحدة','تصحيح أخطاء الكود تلقائيًا بموديل Max، والصور بموديل Pro','بحث مع مصادر موثقة وتحقق من المعلومة قبل الرد','يقرأ ملفات أضخم (حتى 400 ألف حرف) وذاكرة محادثة أطول','ردود أطول وأعمق حتى 8000 توكن','سعر ثابت '+c+' كريديت للرسالة مهما طالت','ثيم أبيض وأسود فخم خاص بـ Max']}
if(CMP){document.title='باقات CoolAi'}
else if(MX){document.documentElement.setAttribute('data-max','');document.title='CoolAi Max';var hh=document.querySelector('.phero h1');if(hh)hh.innerHTML='CoolAi <span class="maxbadge">MAX</span>';var sb=document.querySelector('.phero .sub');if(sb)sb.textContent='القوة الكاملة: منصات كاملة من رسالة واحدة، بدقة وتحقق';var it=document.querySelector('#inv h3');if(it)it.textContent='فاتورة ترقية Max';var iw=document.querySelector('#inv .warn');if(iw)iw.textContent='سيتحول حسابك إلى Max لمدة شهر (30 يومًا) فور تأكيد الدفع.';var ok=$('st-pro');if(ok)ok.textContent='حسابك Max بالفعل.'}
else{var sw=document.createElement('a');sw.className='btn block';sw.href='pro.html';sw.style.marginTop='.6rem';sw.textContent='قارن الباقات';var ph=document.querySelector('.phero');if(ph)ph.appendChild(sw)}
function compare(p){var pr=p.pro||{},m=p.max||{},w=$('pw'),u=S.user,role=u.role,on=role&&(!u.proUntil||u.proUntil>Date.now());w.textContent='';w.classList.add('cmpw');
var hd=mk('section','card cmph');hd.appendChild(mk('h1',0,'اختار باقتك'));hd.appendChild(mk('p','sub','الباقتين اشتراك شهري لمدة 30 يومًا. اختار الباقة وكمّل الدفع في الصفحة الجاية.'));w.appendChild(hd);
var g=mk('div','plans');[['pro','PRO','probadge',pr.price||500,pr.credits||0,pr.refill||30,(pr.features||[])],['max','MAX','maxbadge',m.price||1000,m.credits||250,m.refill||70,(m.features&&m.features.length?m.features:MAXF(m.cost||70))]].forEach(function(x){var c=mk('section','card plan plan-'+x[0]),h=mk('h2');h.appendChild(document.createTextNode('CoolAi '));h.appendChild(mk('span',x[2],x[1]));c.appendChild(h);if(x[0]==='max')c.appendChild(mk('span','plan-tag','الأقوى'));var pz=mk('div','price');pz.appendChild(mk('b',0,String(x[3])));pz.appendChild(mk('span',0,'جنيه / شهر'));c.appendChild(pz);
var l=mk('ul','feat');l.appendChild(mk('li',0,x[4]+' كريديت مع الاشتراك'));l.appendChild(mk('li',0,'تجديد '+x[5]+' كريديت عند نفاد الرصيد'));x[6].forEach(function(f){l.appendChild(mk('li',0,f))});c.appendChild(l);
var mine=on&&role===x[0],b=mk('a','btn primary block',mine?'باقتك الحالية · جدّد أو تابع':(x[0]==='pro'&&on&&role==='max')?'مشمولة في Max':'اختار '+x[1]);b.href='pro.html?plan='+x[0];if(x[0]==='pro'&&on&&role==='max'){b.removeAttribute('href');b.className='btn block';b.setAttribute('aria-disabled','true')}c.appendChild(b);g.appendChild(c)});w.appendChild(g);w.hidden=false}
function mk(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function copy(x){if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(x).catch(function(){})}
function active(){var u=S.user;return(MX?u.role==='max':u.role==='pro'||u.role==='max')&&(!u.proUntil||u.proUntil>Date.now())}
function canBuy(){if(!MX&&S.user.role==='max'&&active())return false;return !active()||(S.user.proUntil&&S.user.proUntil-Date.now()<=3*864e5)}
function step(n){$('pay').hidden=n!==1;$('inv').hidden=n!==2;$('go').hidden=n!==0||!canBuy()}
function paint(){var pro=active(),left=pro&&S.user.proUntil?Math.max(0,Math.ceil((S.user.proUntil-Date.now())/864e5)):0;$('st-pro').hidden=!pro;if(pro)$('st-pro').textContent='حسابك '+(S.user.role==='max'?'Max':'Pro')+' حتى '+INV.day(S.user.proUntil)+' (فاضل '+left+' يوم).'+(!MX&&S.user.role==='max'?' باقة Max تشمل كل مميزات Pro.':canBuy()?' يمكنك التجديد الآن وستُضاف 30 يومًا إلى مدتك.':' يُتاح التجديد في آخر 3 أيام.');$('go').hidden=!canBuy();$('go').textContent=pro?'جدّد الاشتراك (شهر)':'اشترك الآن (شهر)'}
api('me').then(function(r){if(r.status===401){localStorage.removeItem(K);location.replace('../log/login.html');return}if(r.user){S.user=r.user;localStorage.setItem(K,JSON.stringify(S))}
return PUB.then(function(p){if(CMP)return compare(p);info=p.pro||{price:0,credits:0,refill:25,hours:12,features:[]};if(MX){var m=p.max||{};info={price:m.price||1000,credits:m.credits||250,refill:m.refill||70,hours:info.hours,features:(m.features&&m.features.length?m.features:MAXF(m.cost||70))}}
$('pp').textContent=info.price;$('pcr').textContent=info.credits+' كريديت';$('prf').textContent=info.refill+' كريديت';$('ph').textContent=info.hours;
var l=$('pf');l.textContent='';(info.features||[]).forEach(function(f){l.appendChild(mk('li',0,f))});
$('pw').hidden=false;paint()})});
$('pi').textContent=C.INSTAPAY;$('ptd').textContent=C.TELDA;$('psp').href='https://wa.me/'+C.SUPPORT_WA;
$('pic').onclick=function(){copy(C.INSTAPAY);$('pic').textContent='تم النسخ'};
$('go').onclick=function(){$('ge').textContent='';$('pt').textContent=info.price;$('pck').checked=false;$('pe').textContent='';step(1)};
$('pb').onclick=function(){step(0)};
function rows(i){var u=S.user,T=INV.t;return[[T('no'),i.invoiceId],[T('date'),INV.date(i.ts)],[T('name'),u.name],[T('email'),u.email],[T('type'),MX?T('proSub').replace('Pro','Max'):T('proSub')],[T('duration'),T('month')],[T('total'),i.total+' '+T('cur')]]}
function txt(v){return[v.title,INV.t('status')+': '+INV.t('pending')].concat(v.rows.map(function(r){return r[0]+': '+r[1]}),v.notes).join('\n')}
function png(v){INV.png(v,{support:C.SUPPORT_TEXT,accent:MX?'#111111':'#d29922'})}
$('pn').onclick=function(){if(!$('pck').checked)return $('pe').textContent='أكد إنك حوّلت واحتفظت بسكرين التحويل';$('pn').disabled=true;
api('proinvoice',{plan:PL}).then(function(r){$('pn').disabled=false;if(r.status===401){localStorage.removeItem(K);return location.replace('../log/login.html')}if(!r.invoice)return $('pe').textContent=r.error||'تعذر إنشاء الفاتورة';
var v={id:r.invoice.invoiceId,title:MX?INV.t('proTitle').replace('Pro','Max'):INV.t('proTitle'),status:'pending',notes:[MX?INV.t('proNote').replace(/Pro/g,'Max'):INV.t('proNote')],rows:rows(r.invoice)};last=v;var b=$('ir');b.textContent='';b.classList.add('notranslate');b.dir=INV.rtl()?'rtl':'ltr';v.rows.forEach(function(x){var e=mk('div','invrow');e.appendChild(mk('span',0,x[0]));e.appendChild(mk('b',0,x[1]));b.appendChild(e)});
$('iwa').href='https://wa.me/'+C.SUPPORT_WA+'?text='+encodeURIComponent(txt(v)+'\n\n'+INV.t('attach'));step(2);png(v)})};
$('idl').onclick=function(){if(last)png(last)};
})();
