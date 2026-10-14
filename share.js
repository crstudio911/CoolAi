(function(){
var $=function(i){return document.getElementById(i)};
function mk(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function math(src,disp){var e=mk(disp?'div':'span',disp?'mxd':'mx');if(window.katex){try{katex.render(src,e,{displayMode:!!disp,throwOnError:false,strict:'ignore',trust:false});return e}catch(x){}}e.textContent=src;return e}
function inl(p,t){var re=/(\$\$[^$]+\$\$|\\\([\s\S]+?\\\)|\$[^$\n]+\$|`[^`]+`|\*\*[^*]+\*\*)/g,i=0,m;while((m=re.exec(t))){if(m.index>i)p.appendChild(document.createTextNode(t.slice(i,m.index)));var x=m[0];if(x[0]==='`')p.appendChild(mk('code',0,x.slice(1,-1)));else if(x.slice(0,2)==='**')p.appendChild(mk('b',0,x.slice(2,-2)));else if(x.slice(0,2)==='$$')p.appendChild(math(x.slice(2,-2),false));else if(x.slice(0,2)==='\\(')p.appendChild(math(x.slice(2,-2),false));else p.appendChild(math(x.slice(1,-1),false));i=m.index+x.length}if(i<t.length)p.appendChild(document.createTextNode(t.slice(i)))}
function render(el,t){var L=String(t).split('\n'),i=0,list=null;
while(i<L.length){var l=L[i];
if(/^\s*```/.test(l)){var c=[];i++;while(i<L.length&&!/^\s*```/.test(L[i]))c.push(L[i++]);i++;var pr=mk('pre');pr.appendChild(mk('code',0,c.join('\n')));el.appendChild(pr);list=null;continue}
if(/^\s*(\$\$|\\\[)\s*$/.test(l)){var q=[];i++;while(i<L.length&&!/^\s*(\$\$|\\\])\s*$/.test(L[i]))q.push(L[i++]);i++;el.appendChild(math(q.join('\n'),true));list=null;continue}
if(/^\s*\|.*\|\s*$/.test(l)){var tb=mk('table');while(i<L.length&&/^\s*\|.*\|\s*$/.test(L[i])){var r=L[i++];if(/^\s*\|?\s*:?-{2,}/.test(r))continue;var tr=mk('tr');r.trim().replace(/^\||\|$/g,'').split('|').forEach(function(cl){var td=mk('td');td.dir='auto';inl(td,cl.trim());tr.appendChild(td)});tb.appendChild(tr)}el.appendChild(tb);list=null;continue}
var h=/^\s*(#{1,6})\s+(.*)$/.exec(l);if(h){var e=mk(h[1].length<=2?'h3':'h4');inl(e,h[2]);el.appendChild(e);list=null;i++;continue}
var li=/^\s*([-*•]|\d+[.)])\s+(.*)$/.exec(l);if(li){var o=/\d/.test(li[1]);if(!list||list.o!==o){list=mk(o?'ol':'ul');list.o=o;el.appendChild(list)}var it=mk('li');inl(it,li[2]);list.appendChild(it);i++;continue}
list=null;if(l.trim()){var p=mk('p');p.dir='auto';inl(p,l);el.appendChild(p)}i++}}
var id=(new URLSearchParams(location.search).get('id')||'').replace(/[^A-Za-z0-9_-]/g,'');
function fail(m){$('st').textContent='تعذر فتح المحادثة';$('sn').textContent=m}
if(!id)return fail('الرابط غير مكتمل.');
fetch(COOLAI.API_URL.replace(/\/+$/,'')+'/api/shared',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id})}).then(function(r){return r.json()}).then(function(j){if(!j||!j.messages)return fail((j&&j.error)||'هذه المحادثة غير موجودة.');$('st').textContent=j.title||'محادثة مشتركة';document.title=(j.title||'محادثة مشتركة')+' — CoolAi';$('sn').textContent='محادثة للقراءة فقط'+(j.at?' · '+new Date(j.at).toLocaleDateString('ar-EG',{day:'numeric',month:'long',year:'numeric'}):'');var box=$('sm');j.messages.forEach(function(m){var w=mk('div','sm '+(m.r==='u'?'u':'a')),b=mk('div','b');if(m.r==='u'){b.dir='auto';b.style.whiteSpace='pre-wrap';b.textContent=m.c}else render(b,m.c);w.appendChild(b);box.appendChild(w)})}).catch(function(){fail('تعذر فتح المحادثة الآن، حاول لاحقًا.')})
})();
