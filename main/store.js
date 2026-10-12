window.store=(function(){
var db;
function open(){return new Promise(function(res,rej){if(db)return res(db);var r=indexedDB.open('coolai',2);r.onupgradeneeded=function(){var d=r.result;if(!d.objectStoreNames.contains('chats'))d.createObjectStore('chats',{keyPath:'id'});if(!d.objectStoreNames.contains('meta'))d.createObjectStore('meta');if(!d.objectStoreNames.contains('files'))d.createObjectStore('files',{keyPath:'id'})};r.onsuccess=function(){db=r.result;res(db)};r.onerror=function(){rej(r.error)}})}
function tx(s,m,f){return open().then(function(d){return new Promise(function(res,rej){var t=d.transaction(s,m),q=f(t.objectStore(s));t.oncomplete=function(){res(q&&q.result)};t.onerror=function(){rej(t.error)}})})}
return{
chats:function(){return tx('chats','readonly',function(s){return s.getAll()})},
save:function(c){return tx('chats','readwrite',function(s){return s.put(c)})},
del:function(id){return tx('chats','readwrite',function(s){return s.delete(id)})},
get:function(k){return tx('meta','readonly',function(s){return s.get(k)})},
set:function(k,v){return tx('meta','readwrite',function(s){return s.put(v,k)})},
files:function(){return tx('files','readonly',function(s){return s.getAll()})},
file:function(id){return tx('files','readonly',function(s){return s.get(id)})},
putFile:function(f){return tx('files','readwrite',function(s){return s.put(f)})},
delFile:function(id){return tx('files','readwrite',function(s){return s.delete(id)})},
persist:function(){return navigator.storage&&navigator.storage.persist?navigator.storage.persist():Promise.resolve(false)}
}})();
