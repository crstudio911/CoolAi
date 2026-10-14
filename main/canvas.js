window.ccode=(function(){
var $=function(i){return document.getElementById(i)},S={code:'',lang:'',name:'',live:false,tab:'code',chg:null,closedBy:null,key:null},PREV='preview.html';
var EXT={javascript:'js',js:'js',typescript:'ts',ts:'ts',tsx:'tsx',jsx:'jsx',html:'html',htm:'html',css:'css',scss:'scss',json:'json',python:'py',py:'py',php:'php',java:'java',c:'c',cpp:'cpp','c++':'cpp',csharp:'cs',cs:'cs',go:'go',rust:'rs',rs:'rs',ruby:'rb',rb:'rb',sql:'sql',bash:'sh',sh:'sh',shell:'sh',xml:'xml',yaml:'yml',yml:'yml',markdown:'md',md:'md',kotlin:'kt',swift:'swift',dart:'dart',lua:'lua',svg:'svg',gs:'gs',vue:'vue',txt:'txt',text:'txt'};
function mk(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function extOf(n){var i=(n||'').lastIndexOf('.');return i>-1?n.slice(i+1).toLowerCase():''}
function info(line){var p=line.trim().split(/\s+/),o={lang:'',file:'',fn:''};p.forEach(function(x,i){var m=/^(file|filename|path|function|fn|name)=["']?([^"']+)["']?$/i.exec(x);if(m){var k=m[1].toLowerCase();if(k==='function'||k==='fn'||k==='name')o.fn=m[2];else o.file=m[2]}else if(i===0)o.lang=x.toLowerCase()});return o}
var PAIR=/<{3,}\s*FIND[^\n]*\n([\s\S]*?)\n?={3,}[^\n]*\n([\s\S]*?)(?:\n?>{3,}\s*REPLACE[^\n]*|$)/g;
function pairs(c){var a=[],m;PAIR.lastIndex=0;while((m=PAIR.exec(c))){a.push({find:m[1],rep:m[2].replace(/\n?>{1,}\s*R?E?P?L?A?C?E?\s*$/,'')});if(!m[0].length)break}return a}
function parse(t){var out=[],parts=t.split('```'),openLast=parts.length%2===0;
parts.forEach(function(s,i){if(i%2===0){if(s.trim())out.push({t:'text',v:s});return}
var nl=s.indexOf('\n'),head=nl>-1?s.slice(0,nl):s,code=nl>-1?s.slice(nl+1):'',o=info(head),open=openLast&&i===parts.length-1;if(!open)code=code.replace(/\n$/,'');
if(o.lang==='edit'||o.lang==='patch'||/<{3,}\s*FIND/.test(code))out.push({t:'edit',file:o.file,pairs:pairs(code),raw:code,open:open,lang:extOf(o.file)});
else if(o.lang==='replace'||o.fn)out.push({t:'func',file:o.file,name:o.fn,code:code,open:open,lang:o.lang==='replace'?extOf(o.file):o.lang});
else out.push({t:'code',lang:o.lang,file:o.file,code:code,open:open})});return out}
function big(seg){return seg.t!=='code'||(!/^(chart|graph|network|xlsx|excel)$/.test(seg.lang||'')&&seg.code.split('\n').length>=12)}
function skipStr(s,i){var q=s[i],j=i+1;while(j<s.length){var c=s[j];if(c==='\\'){j+=2;continue}if(q==='`'&&c==='$'&&s[j+1]==='{'){j=scanBlock(s,j+1)+1;continue}if(c===q)return j+1;if(q!=='`'&&c==='\n')return j;j++}return j}
function regexOk(s,i){var k=i-1;while(k>=0&&/\s/.test(s[k]))k--;return k<0||/[(,=:\[!&|?{};+\-*%<>~^]/.test(s[k])||/\b(return|typeof|case|in|of)$/.test(s.slice(Math.max(0,k-6),k+1))}
function skipRe(s,i){var j=i+1,cls=false;while(j<s.length){var c=s[j];if(c==='\\'){j+=2;continue}if(c==='\n')return j;if(c==='[')cls=true;else if(c===']')cls=false;else if(c==='/'&&!cls){j++;while(/[a-z]/i.test(s[j]||''))j++;return j}j++}return j}
function scanBlock(s,i){var d=0,j=i;while(j<s.length){var c=s[j],n=s[j+1];if(c==='"'||c==="'"||c==='`'){j=skipStr(s,j);continue}if(c==='/'&&n==='/'){var e=s.indexOf('\n',j);j=e<0?s.length:e;continue}if(c==='/'&&n==='*'){var e2=s.indexOf('*/',j+2);j=e2<0?s.length:e2+2;continue}if(c==='/'&&regexOk(s,j)){j=skipRe(s,j);continue}if(c==='{')d++;else if(c==='}'){d--;if(d===0)return j}j++}return -1}
function endOf(s,from,decl){var d=0,j=from,sawBrace=false;while(j<s.length){var c=s[j],n=s[j+1];
if(c==='"'||c==="'"||c==='`'){j=skipStr(s,j);continue}
if(c==='/'&&n==='/'){var e=s.indexOf('\n',j);j=e<0?s.length:e;continue}
if(c==='/'&&n==='*'){var e2=s.indexOf('*/',j+2);j=e2<0?s.length:e2+2;continue}
if(c==='/'&&regexOk(s,j)){j=skipRe(s,j);continue}
if(c==='('||c==='['||c==='{'){if(c==='{'&&d===0)sawBrace=true;d++}
else if(c===')'||c===']'||c==='}'){d--;if(d<0)return j;if(d===0&&c==='}'&&(decl||sawBrace)){return j+1}}
else if(d===0&&!decl&&(c===';'||(c===','&&!sawBrace)))return j;
else if(d===0&&!decl&&c==='\n'&&!sawBrace){var r=s.slice(j).match(/^\s*([^\s])/);if(r&&!/[.?:+\-*\/&|=,(]/.test(r[1]))return j}
j++}return s.length}
function reEsc(x){return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function findFn(s,name,py){var N=reEsc(name),m;
if(py){m=new RegExp('(^|\\n)([ \\t]*)(?:async\\s+)?(?:def|class)\\s+'+N+'\\b').exec(s);if(!m)return null;var st=m.index+m[1].length,ind=m[2].length,lines=s.slice(st).split('\n'),len=lines[0].length+1,i=1;
for(;i<lines.length;i++){var L=lines[i];if(L.trim()&&(L.match(/^[ \t]*/)[0].length<=ind)&&!/^[ \t]*[)\]}]/.test(L))break;len+=L.length+1}
var en=Math.min(s.length,st+len);while(en>st&&/\s/.test(s[en-1]))en--;return{s:st,e:en}}
var P=[[new RegExp('(?:export\\s+(?:default\\s+)?)?(?:async\\s+)?function\\s*\\*?\\s*'+N+'\\s*\\(','g'),1],
[new RegExp('(?:export\\s+)?(?:const|let|var)\\s+'+N+'\\s*=(?!=)','g'),0],
[new RegExp('(?:[\\w$]+\\.)*'+N+'\\s*(?::|=(?!=))\\s*(?:async\\s+)?(?:function\\b|\\([^()]*\\)\\s*=>|[\\w$]+\\s*=>)','g'),0],
[new RegExp('(?:(?:static|async|get|set|public|private|protected)\\s+)*'+N+'\\s*\\([^()]*\\)\\s*\\{','g'),1]];
for(var k=0;k<P.length;k++){var re=P[k][0];re.lastIndex=0;while((m=re.exec(s))){var b=s[m.index-1];if(b&&/[\w$.]/.test(b)&&k!==2)continue;if(k===3&&/\b(if|for|while|switch|catch|function|return)\s*$/.test(s.slice(Math.max(0,m.index-12),m.index)))continue;var st2=m.index;if(k===2){var pre=s.slice(Math.max(0,st2-12),st2).match(/(?:const|let|var)\s+$/);if(pre)st2-=pre[0].length}
var en2=endOf(s,m.index+m[0].length-(k===3||k===0?1:0),!!P[k][1]);if(k===3){var bb=scanBlock(s,m.index+m[0].length-1);if(bb>-1)en2=bb+1}if(en2>st2)return{s:st2,e:en2}}}return null}
function lineRange(s,a,b){var l1=s.slice(0,a).split('\n').length,l2=l1+s.slice(a,b).split('\n').length-1;return[l1,l2]}
function applyPair(s,p){var f=p.find,r=p.rep;if(!f.trim())return null;var i=s.indexOf(f);if(i>-1)return{t:s.slice(0,i)+r+s.slice(i+f.length),a:i,b:i+r.length};
var SL=s.split('\n'),FL=f.split('\n').map(function(x){return x.trim()}).filter(function(x){return x});if(FL.length){for(var a=0;a<SL.length;a++){if(SL[a].trim()!==FL[0])continue;var j=a,k=0;while(j<SL.length&&k<FL.length){if(!SL[j].trim()){j++;continue}if(SL[j].trim()!==FL[k])break;j++;k++}if(k===FL.length){var ind=SL[a].match(/^\s*/)[0],fi=(f.split('\n').filter(function(x){return x.trim()})[0]||'').match(/^\s*/)[0],RL=r.split('\n').map(function(x){return fi&&x.indexOf(fi)===0?ind+x.slice(fi.length):(!fi&&ind&&x.trim()?ind+x:x)});var pre=SL.slice(0,a).join('\n'),st=pre.length+(a?1:0),out=SL.slice(0,a).concat(RL,SL.slice(j)).join('\n');return{t:out,a:st,b:st+RL.join('\n').length}}}}
try{var re=new RegExp(reEsc(f.trim()).replace(/\s+/g,'\\s*'));var m=re.exec(s);if(m)return{t:s.slice(0,m.index)+r.trim()+s.slice(m.index+m[0].length),a:m.index,b:m.index+r.trim().length}}catch(e){}return null}
function apply(s,seg){var res={text:s,ok:0,fail:0,ranges:[]};
if(seg.t==='edit'){seg.pairs.forEach(function(p){var x=applyPair(res.text,p);if(x){res.text=x.t;res.ok++;res.ranges.push(lineRange(x.t,x.a,x.b))}else res.fail++});if(!seg.pairs.length)res.fail++}
else if(seg.t==='func'){var py=/^(py|python)$/.test(seg.lang)||/\.py$/i.test(seg.file||''),nm=seg.name||((seg.code.match(/(?:function\s*\*?\s*|def\s+|class\s+|(?:const|let|var)\s+)([\w$]+)/)||[])[1])||'';var r=nm?findFn(res.text,nm,py):null,c=seg.code.replace(/^\n+|\s+$/g,'');
if(r){if(!py&&/;\s*$/.test(c)&&res.text[r.e]===';')c=c.replace(/;\s*$/,'');res.text=res.text.slice(0,r.s)+c+res.text.slice(r.e);res.ok++;res.ranges.push(lineRange(res.text,r.s,r.s+c.length))}else res.fail++}return res}
function isHtml(c,l){return/^(html|htm|svg)$/.test(l||'')||/^\s*(<!doctype html|<html|<svg)/i.test(c||'')}
function render(){var el=$('cvcode'),pre=el.parentNode,follow=S.live&&pre.scrollHeight-pre.scrollTop-pre.clientHeight<80,L=S.code.split('\n'),chg={};(S.chg||[]).forEach(function(r){for(var i=r[0];i<=r[1];i++)chg[i]=1});
var h=new Array(L.length);for(var i=0;i<L.length;i++)h[i]='<span class="ln'+(chg[i+1]?' chg':'')+'">'+(esc(L[i])||' ')+'</span>';el.innerHTML=h.join('');
if(follow)pre.scrollTop=pre.scrollHeight;$('cvs').textContent=(S.live?'يكتب... ':'')+L.length+' سطر'+(S.note?' · '+S.note:'');$('cv').classList.toggle('live',S.live);
var hv=isHtml(S.code,S.lang);$('cvtv').hidden=!hv;if(!hv&&S.tab==='view')tab('code')}
function preview(){var f=$('cvf');f.onload=function(){try{f.contentWindow.postMessage({coolPreview:S.code},'*')}catch(e){}};f.src=PREV+'?t='+Date.now()}
function tab(t){S.tab=t;document.querySelectorAll('#cv [data-cv]').forEach(function(b){b.classList.toggle('on',b.dataset.cv===t)});$('cvp').hidden=t!=='code';$('cvf').hidden=t!=='view';if(t==='view')preview()}
function fname(){if(S.name)return S.name;var e=EXT[S.lang]||(isHtml(S.code)?'html':'txt');return'coolai-'+Date.now()+'.'+e}
function download(name,text){var a=document.createElement('a'),u=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)}
function show(o){var cv=$('cv');S.code=o.code||'';S.lang=o.lang||'';S.name=o.name||'';S.live=!!o.live;S.chg=o.chg||null;S.note=o.note||'';S.key=o.key||null;$('cvname').textContent=o.title||S.name||(S.lang?S.lang.toUpperCase():'كود');cv.hidden=false;document.body.classList.add('cv-on');render();if(S.tab==='view'&&!S.live)preview();if(o.line)setTimeout(function(){var ln=$('cvcode').children[o.line-1];if(ln)ln.scrollIntoView({block:'center'})},30)}
function close(){$('cv').hidden=true;document.body.classList.remove('cv-on');if(S.live)S.closedBy=S.key;S.live=false}
function fallbackCopy(x){var a=document.createElement('textarea');a.value=x;a.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()}
function copy(x){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(x).catch(function(){fallbackCopy(x)});fallbackCopy(x);return Promise.resolve()}
function init(){
$('cvx').onclick=close;
$('cvc').onclick=function(){var b=this;copy(S.code).then(function(){b.classList.add('ok');setTimeout(function(){b.classList.remove('ok')},1500)})};
$('cvd').onclick=function(){download(fname(),S.code)};
document.querySelectorAll('#cv [data-cv]').forEach(function(b){b.onclick=function(){tab(b.dataset.cv)}});
$('cvr').onclick=function(){if(S.tab==='view')preview()}}
function segText(seg){if(seg.t==='edit')return seg.pairs.map(function(p,i){return'@@ تعديل '+(i+1)+'\n'+p.find.split('\n').map(function(x){return'- '+x}).join('\n')+'\n'+p.rep.split('\n').map(function(x){return'+ '+x}).join('\n')}).join('\n\n')||seg.raw;return seg.code}
function segTitle(seg){if(seg.t==='edit')return'تعديل'+(seg.file?' · '+seg.file:'');if(seg.t==='func')return'الدالة '+(seg.name||'')+(seg.file?' · '+seg.file:'');return seg.file||(seg.lang?seg.lang.toUpperCase():'كود')}
function card(seg,key){var c=mk('div','acard notranslate'+(seg.open?' live':'')),ic=mk('div','aic',seg.t==='code'?'</>':seg.t==='edit'?'±':'ƒ'),m=mk('div','ameta'),n=segText(seg).split('\n').length;
m.appendChild(mk('b',0,segTitle(seg)));m.appendChild(mk('small',0,seg.open?'يكتب...':(seg.t==='edit'?seg.pairs.length+' مكان':n+' سطر')));c.appendChild(ic);c.appendChild(m);
var o=mk('button','btn','فتح');o.type='button';o.onclick=function(){show({code:segText(seg),lang:seg.t==='edit'?'diff':seg.lang||seg.t,name:seg.t==='code'?seg.file:'',title:segTitle(seg),live:false,key:key})};c.appendChild(o);c.onclick=function(e){if(e.target===c||e.target.parentNode===c&&e.target!==o)o.click()};
if(seg.t==='edit'&&!seg.open){var d=mk('div','adiff');seg.pairs.slice(0,3).forEach(function(p){p.find.split('\n').slice(0,6).forEach(function(x){d.appendChild(mk('div','dl-',x||' '))});p.rep.split('\n').slice(0,6).forEach(function(x){d.appendChild(mk('div','dl+',x||' '))})});var w=mk('div','awrap');w.appendChild(c);w.appendChild(d);return w}
return c}
function stream(seg,key){if(S.closedBy===key)return;show({code:segText(seg),lang:seg.t==='edit'?'diff':seg.lang||'',name:seg.t==='code'?seg.file:'',title:segTitle(seg),live:seg.open,key:key})}
function resultCard(f,load,res){var c=mk('div','rcard notranslate'),ic=mk('div','aic ok','+'),m=mk('div','ameta');m.appendChild(mk('b',0,f.name));m.appendChild(mk('small',0,'نسخة معدلة · '+(f.lines||0)+' سطر'+(res&&res.fail?' · '+res.fail+' تعديل لم يُطبَّق':'')));c.appendChild(ic);c.appendChild(m);
function get(cb){load(f.id).then(function(x){if(x&&x.text!=null)cb(x)})}
var b1=mk('button','btn','فتح');b1.type='button';b1.onclick=function(){get(function(x){show({code:x.text,lang:x.lang,name:x.name,title:x.name,chg:x.ranges,note:'الأسطر المعدلة متعلّمة',line:x.ranges&&x.ranges[0]&&x.ranges[0][0]})})};
var b2=mk('button','btn primary','تحميل');b2.type='button';b2.onclick=function(){get(function(x){download(x.name,x.text)})};
var b3=mk('button','btn','نسخ');b3.type='button';b3.onclick=function(){get(function(x){copy(x.text).then(function(){b3.textContent='تم';setTimeout(function(){b3.textContent='نسخ'},1500)})})};
var r=mk('div','row');r.appendChild(b1);r.appendChild(b3);r.appendChild(b2);c.appendChild(r);return c}
return{init:init,parse:parse,big:big,apply:apply,card:card,stream:stream,show:show,close:close,resultCard:resultCard,isOpen:function(){return!$('cv').hidden},finishLive:function(key){if(S.key===key&&S.live){S.live=false;render()}},reset:function(){S.closedBy=null}}
})();
