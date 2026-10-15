window.getSession=function(){try{return JSON.parse(localStorage.getItem(COOLAI.SESSION_KEY))}catch(e){return null}};
(function(){var L=(COOLAI.API_URLS&&COOLAI.API_URLS.length?COOLAI.API_URLS:[COOLAI.API_URL]).map(function(u){return String(u).replace(/\/+$/,'')}),K='coolai_srv';
function day(){var d=new Date();return d.getUTCFullYear()+'-'+d.getUTCMonth()+'-'+d.getUTCDate()}
function cur(){try{var v=JSON.parse(localStorage.getItem(K));if(v&&v.d===day()&&v.i>0&&v.i<L.length)return v.i}catch(e){}return 0}
function mark(i){try{if(i>0)localStorage.setItem(K,JSON.stringify({i:i,d:day()}));else localStorage.removeItem(K)}catch(e){}}
COOLAI.API_URL=L[cur()];
function bad(r){var ct=r.headers.get('Content-Type')||'';if(r.status===429||r.status===408)return ct.indexOf('json')<0;if(r.status>=500)return ct.indexOf('ndjson')<0;return false}
window.apiFetch=function(path,opt,sig,tries){var st=cur(),N=L.length;tries=tries||{};
function next(k){for(var s2=1;s2<=N;s2++){var j=(k+s2)%N;if(!tries[j])return j}return -1}
function go(n){tries[n]=1;var c=new AbortController(),tm=null,stream=opt&&opt.stream;if(sig){if(sig.aborted)c.abort();else sig.addEventListener('abort',function(){c.abort()})}if(!stream)tm=setTimeout(function(){c.abort()},30000);var o=Object.assign({},opt,{signal:c.signal});delete o.stream;
return fetch(L[n]+path,o).then(function(r){if(tm)clearTimeout(tm);var nx=next(n);if(nx<0){r._srv=n;return r}if(bad(r)){mark(nx);COOLAI.API_URL=L[nx];return go(nx)}r._srv=n;return r},function(e){if(tm)clearTimeout(tm);if(sig&&sig.aborted)throw e;var nx=next(n);if(nx>=0&&navigator.onLine!==false){mark(nx);COOLAI.API_URL=L[nx];return go(nx)}throw e})}
return go(st)};
window.apiNext=function(n,tries){tries=tries||{};tries[n]=1;for(var s2=1;s2<=L.length;s2++){var j=(n+s2)%L.length;if(!tries[j]){mark(j);COOLAI.API_URL=L[j];return true}}return false};
window.apiBase=function(){return COOLAI.API_URL};
})();
function req(path,body,sig,tries,stream){var s=getSession(),h={'Content-Type':'application/json'};if(s&&s.token)h.Authorization='Bearer '+s.token;return apiFetch('/api/'+path,{method:'POST',headers:h,body:JSON.stringify(body||{}),stream:!!stream},sig,tries)}
var NETERR='حصل خطأ في الاتصال';
window.api=function(path,body){var T={};function one(){return req(path,body,null,T).then(function(r){return r.json().catch(function(){return{}}).then(function(j){j.status=r.status;if(j.code==='quota'&&apiNext(r._srv,T))return one();if(j.code==='quota')j.error=NETERR;return j})})}return one().catch(function(e){return{status:0,error:NETERR}})};
window.apiStream=function(path,body,on,sig){var T={};
function one(){return req(path,body,sig,T,true).then(function(r){
var ct=r.headers.get('Content-Type')||'',srv=r._srv,retry=false;
if(ct.indexOf('ndjson')<0||!r.body)return r.json().catch(function(){return{}}).then(function(j){if(j.code==='quota'&&apiNext(srv,T))return one();j.t='fail';j.status=r.status;if(j.code==='quota')j.error=NETERR;on(j)});
var rd=r.body.getReader(),dec=new TextDecoder(),buf='';
function line(l){if(!l.trim())return;var ev;try{ev=JSON.parse(l)}catch(e){return}if(ev&&ev.t==='fail'&&ev.code==='quota'){if(apiNext(srv,T)){retry=true;return}ev.error=NETERR}on(ev)}
function pump(){return rd.read().then(function(x){if(x.done){line(buf);if(retry)return one();return}buf+=dec.decode(x.value,{stream:true});var i;while((i=buf.indexOf('\n'))>-1){line(buf.slice(0,i));buf=buf.slice(i+1)}if(retry){try{rd.cancel()}catch(e){}return one()}return pump()})}
return pump()})}
return one().catch(function(e){if(sig&&sig.aborted)return;on({t:'fail',status:0,error:NETERR})})};
