(function(){
var K=COOLAI.SESSION_KEY,$=function(i){return document.getElementById(i)},mode='login';
if(getSession())location.replace('../main/main.html#chat');
function set(m){mode=m;$('t-login').classList.toggle('on',m==='login');$('t-signup').classList.toggle('on',m==='signup');$('g-name').hidden=$('g-code').hidden=m!=='signup';$('go').textContent=m==='login'?'دخول':'إنشاء الحساب';$('err').textContent='';$('password').autocomplete=m==='login'?'current-password':'new-password'}
$('t-login').onclick=function(){set('login')};$('t-signup').onclick=function(){set('signup')};
var q=new URLSearchParams(location.search);
if(q.get('m')==='signup'||q.get('ref')){set('signup');$('invite').value=(q.get('ref')||'').toUpperCase().slice(0,12)}
$('f').onsubmit=function(e){
e.preventDefault();var em=$('email').value.trim().toLowerCase(),pw=$('password').value,nm=$('name').value.trim();
if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))return $('err').textContent='البريد الإلكتروني غير صحيح';
if(pw.length<8)return $('err').textContent='كلمة السر لازم تكون 8 حروف على الأقل';
if(mode==='signup'&&nm.length<2)return $('err').textContent='اكتب اسمك';
$('go').disabled=true;$('err').textContent='';
api(mode,mode==='login'?{email:em,password:pw}:{email:em,password:pw,name:nm,invite:$('invite').value.trim()}).then(function(r){
$('go').disabled=false;
if(!r.token)return $('err').textContent=r.error||'حصل خطأ، حاول تاني';
localStorage.setItem(K,JSON.stringify({token:r.token,user:r.user}));location.replace('../main/main.html#chat')})};
})();
