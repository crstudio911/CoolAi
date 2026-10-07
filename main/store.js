window.store=(function(){
var db;
function open(){return new Promise(function(res,rej){if(db)return res(db);var r=indexedDB.open('coolai',1);r.onupgradeneeded=function(){r.result.createObjectStore('chats',{keyPath:'id'});r.result.createObjectStore('meta')};r.onsuccess=function(){db=r.result;res(db)};r.onerror=function(){rej(r.error)}})}
function tx(s,m,f){return open().then(function(d){return new Promise(function(res,rej){var t=d.transaction(s,m),q=f(t.objectStore(s));t.oncomplete=function(){res(q&&q.result)};t.onerror=function(){rej(t.error)}})})}
return{
chats:function(){return tx('chats','readonly',function(s){return s.getAll()})},
save:function(c){return tx('chats','readwrite',function(s){return s.put(c)})},
del:function(id){return tx('chats','readwrite',function(s){return s.delete(id)})},
get:function(k){return tx('meta','readonly',function(s){return s.get(k)})},
set:function(k,v){return tx('meta','readwrite',function(s){return s.put(v,k)})},
persist:function(){return navigator.storage&&navigator.storage.persist?navigator.storage.persist():Promise.resolve(false)}
}})();
