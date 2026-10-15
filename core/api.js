window.getSession=function(){try{return JSON.parse(localStorage.getItem(COOLAI.SESSION_KEY))}catch(e){return null}};
(function(){var L=(COOLAI.API_URLS&&COOLAI.API_URLS.length?COOLAI.API_URLS:[COOLAI.API_URL]).map(function(u){return String(u).replace(/\/+$/,'')}),K='coolai_srv';
function day(){var d=new Date();return d.getUTCFullYear()+'-'+d.getUTCMonth()+'-'+d.getUTCDate()}
function cur(){try{var v=JSON.parse(localStorage.getItem(K));if(v&&v.d===day()&&v.i>0&&v.i<L.length)return v.i}catch(e){}return 0}
function mark(i){try{if(i>0)localStorage.setItem(K,JSON.stringify({i:i,d:day()}));else localStorage.removeItem(K)}catch(e){}}
COOLAI.API_URL=L[cur()];
function bad(r){if(r.status===429||r.status>=500){var ct=r.headers.get('Content-Type')||'';return ct.indexOf('json')<0&&ct.indexOf('ndjson')<0}return false}
window.apiFetch=function(path,opt,sig){var i=cur();
function go(n){return fetch(L[n]+path,Object.assign({},opt,{signal:sig})).then(function(r){if(bad(r)&&n+1<L.length){mark(n+1);COOLAI.API_URL=L[n+1];return go(n+1)}r._srv=n;return r},function(e){if(sig&&sig.aborted)throw e;if(n+1<L.length&&navigator.onLine!==false){mark(n+1);COOLAI.API_URL=L[n+1];return go(n+1)}throw e})}
return go(i)};
window.apiNext=function(n){if(n+1<L.length){mark(n+1);COOLAI.API_URL=L[n+1];return true}return false};
window.apiBase=function(){return COOLAI.API_URL};
})();
function req(path,body,sig){var s=getSession(),h={'Content-Type':'application/json'};if(s&&s.token)h.Authorization='Bearer '+s.token;return apiFetch('/api/'+path,{method:'POST',headers:h,body:JSON.stringify(body||{})},sig)}
var NETERR='حصل خطأ في الاتصال';
window.api=function(path,body){function one(){return req(path,body).then(function(r){return r.json().catch(function(){return{}}).then(function(j){j.status=r.status;if(j.code==='quota'&&apiNext(r._srv))return one();if(j.code==='quota')j.error=NETERR;return j})})}return one().catch(function(e){return{status:0,error:NETERR}})};
window.apiStream=function(path,body,on,sig){
function one(){return req(path,body,sig).then(function(r){
var ct=r.headers.get('Content-Type')||'',srv=r._srv,retry=false;
if(ct.indexOf('ndjson')<0||!r.body)return r.json().catch(function(){return{}}).then(function(j){if(j.code==='quota'&&apiNext(srv))return one();j.t='fail';j.status=r.status;if(j.code==='quota')j.error=NETERR;on(j)});
var rd=r.body.getReader(),dec=new TextDecoder(),buf='';
function line(l){if(!l.trim())return;var ev;try{ev=JSON.parse(l)}catch(e){return}if(ev&&ev.t==='fail'&&ev.code==='quota'){if(apiNext(srv)){retry=true;return}ev.error=NETERR}on(ev)}
function pump(){return rd.read().then(function(x){if(x.done){line(buf);if(retry)return one();return}buf+=dec.decode(x.value,{stream:true});var i;while((i=buf.indexOf('\n'))>-1){line(buf.slice(0,i));buf=buf.slice(i+1)}if(retry){try{rd.cancel()}catch(e){}return one()}return pump()})}
return pump()})}
return one().catch(function(e){if(sig&&sig.aborted)return;on({t:'fail',status:0,error:NETERR})})};
