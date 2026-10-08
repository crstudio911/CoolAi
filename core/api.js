window.getSession=function(){try{return JSON.parse(localStorage.getItem(COOLAI.SESSION_KEY))}catch(e){return null}};
function req(path,body){var s=getSession(),h={'Content-Type':'application/json'};if(s&&s.token)h.Authorization='Bearer '+s.token;return fetch(COOLAI.API_URL.replace(/\/+$/,'')+'/api/'+path,{method:'POST',headers:h,body:JSON.stringify(body||{})})}
window.api=function(path,body){return req(path,body).then(function(r){return r.json().catch(function(){return{}}).then(function(j){j.status=r.status;return j})}).catch(function(e){return{status:0,error:'تعذر الاتصال بالخادم'}})};
window.apiStream=function(path,body,on){
return req(path,body).then(function(r){
var ct=r.headers.get('Content-Type')||'';
if(ct.indexOf('ndjson')<0||!r.body)return r.json().catch(function(){return{}}).then(function(j){j.t='fail';j.status=r.status;on(j)});
var rd=r.body.getReader(),dec=new TextDecoder(),buf='';
function line(l){if(!l.trim())return;var ev;try{ev=JSON.parse(l)}catch(e){return}on(ev)}
function pump(){return rd.read().then(function(x){if(x.done){line(buf);return}buf+=dec.decode(x.value,{stream:true});var i;while((i=buf.indexOf('\n'))>-1){line(buf.slice(0,i));buf=buf.slice(i+1)}return pump()})}
return pump()}).catch(function(e){on({t:'fail',status:0,error:'تعذر الاتصال بالخادم'})})};
