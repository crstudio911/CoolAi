// CoolAi PDF maker — no libraries, no eval. Pages are drawn on canvas (so Arabic shaping is perfect) then packed as JPEG pages in a real PDF.
(function(){
var W=1240,H=1754,M=96,CW=W-2*M,AR=/[\u0590-\u08FF\uFB1D-\uFEFC]/,FONT="'Segoe UI','Noto Sans Arabic','Tahoma','Arial',sans-serif",MAXP=40,MAXT=200000;
function str(v){return v==null?'':String(v).replace(/[\u0000-\u0008\u000B-\u001F\u202A-\u202E\u2066-\u2069]/g,'').slice(0,MAXT)}
function fname(n){n=str(n).replace(/\.pdf$/i,'').replace(/[\\\/:*?"<>|\u0000-\u001F]+/g,' ').replace(/\s+/g,' ').trim().slice(0,80);return(n||'coolai-document')+'.pdf'}
function rtl(s){var a=(s.match(/[\u0590-\u08FF]/g)||[]).length,l=(s.match(/[A-Za-z]/g)||[]).length;return a>0&&a>=l*0.3}
function clean(s){return str(s).replace(/\*\*(.+?)\*\*/g,'$1').replace(/__(.+?)__/g,'$1').replace(/`([^`]+)`/g,'$1').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'$1 ($2)')}
function fromMd(t){var out=[],L=str(t).split(/\r?\n/),i=0,m;while(i<L.length){var l=L[i];
if(/^\s*\|.*\|\s*$/.test(l)){var rows=[];while(i<L.length&&/^\s*\|.*\|\s*$/.test(L[i])){if(!/^\s*\|[\s:|-]+\|\s*$/.test(L[i]))rows.push(L[i].trim().replace(/^\||\|$/g,'').split('|').map(function(c){return clean(c.trim())}));i++}out.push({table:rows});continue}
if((m=/^\s*(#{1,3})\s+(.*)$/.exec(l))){out.push(m[1].length===1?{h:clean(m[2])}:{h2:clean(m[2])});i++;continue}
if(/^\s*([-*•+]|\d+[.)])\s+/.test(l)){var ol=/^\s*\d/.test(l),it=[];while(i<L.length&&(m=/^\s*([-*•+]|\d+[.)])\s+(.*)$/.exec(L[i]))){it.push(clean(m[2]));i++}out.push(ol?{ol:it}:{list:it});continue}
if(/^\s*(---+|\*\*\*+)\s*$/.test(l)){out.push({hr:1});i++;continue}
if(!l.trim()){i++;continue}var p=[];while(i<L.length&&L[i].trim()&&!/^\s*(#{1,3}\s|\||[-*•+]\s|\d+[.)]\s|---)/.test(L[i])){p.push(L[i].trim());i++}if(!p.length){p.push(l);i++}out.push({p:clean(p.join(' '))})}return out}
function norm(spec){var b=[];if(typeof spec==='string')return{title:'',blocks:fromMd(spec)};spec=spec||{};
if(Array.isArray(spec.blocks))spec.blocks.forEach(function(x){if(typeof x==='string')b=b.concat(fromMd(x));else if(x&&typeof x==='object')b.push(x)});
if(typeof spec.content==='string')b=b.concat(fromMd(spec.content));if(typeof spec.markdown==='string')b=b.concat(fromMd(spec.markdown));
if(!b.length)throw new Error('empty');return{title:clean(spec.title||''),subtitle:clean(spec.subtitle||''),blocks:b.slice(0,800)}}
function wrap(c,t,w){var out=[];str(t).split('\n').forEach(function(par){var ws=par.split(/\s+/),line='';ws.forEach(function(x){if(!x)return;var tr=line?line+' '+x:x;if(c.measureText(tr).width<=w){line=tr;return}if(line)out.push(line);if(c.measureText(x).width<=w){line=x;return}var ch='';for(var k=0;k<x.length;k++){if(c.measureText(ch+x[k]).width>w){out.push(ch);ch=''}ch+=x[k]}line=ch});out.push(line)});return out}
function make(spec){var d=norm(spec),pages=[],cv,c,y,pn=0;
function css(n,d){try{return getComputedStyle(document.documentElement).getPropertyValue(n).trim()||d}catch(e){return d}}
var BR='#4b5dff',AC='#a35cff';
function page(){if(pages.length>=MAXP)throw new Error('too long');cv=document.createElement('canvas');cv.width=W;cv.height=H;c=cv.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,W,H);
var g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'#2f7bff');g.addColorStop(1,AC);c.fillStyle=g;c.fillRect(0,0,W,14);pn++;pages.push(cv);y=M;
c.fillStyle='#8a90a6';c.font='22px '+FONT;c.textAlign='center';c.direction='ltr';c.fillText('CoolAi  \u00b7  '+pn,W/2,H-48)}
function need(h){if(y+h>H-M)page()}
function text(t,size,opt){opt=opt||{};c.font=(opt.bold?'700 ':'400 ')+size+'px '+FONT;var r=rtl(t),ind=opt.indent||0,lh=Math.round(size*(opt.lh||1.55)),ls=wrap(c,t,CW-ind);
ls.forEach(function(l,i){need(lh);c.direction=r?'rtl':'ltr';c.textAlign=opt.center?'center':r?'right':'left';c.fillStyle=opt.color||'#1b1f2e';var x=opt.center?W/2:r?W-M-ind:M+ind;c.fillText(l,x,y+size);
if(i===0&&opt.bullet){c.textAlign='center';c.fillStyle=BR;c.fillText(opt.bullet,r?W-M-ind/2:M+ind/2,y+size)}y+=lh});}
function table(rows){rows=rows.filter(Array.isArray).slice(0,300);if(!rows.length)return;var n=Math.min(12,Math.max.apply(null,rows.map(function(r){return r.length}))),cw=CW/n,pad=12,fs=n>6?18:22,r0=rtl(rows.map(function(r){return r.join(' ')}).join(' '));
rows.forEach(function(r,ri){c.font=(ri===0?'700 ':'400 ')+fs+'px '+FONT;var cells=[],mh=0;for(var k=0;k<n;k++){var ls=wrap(c,clean(r[k]==null?'':r[k]),cw-2*pad);cells.push(ls);mh=Math.max(mh,ls.length)}var h=mh*fs*1.45+2*pad;
if(y+h>H-M){page();}c.fillStyle=ri===0?BR:ri%2?'#f4f5fb':'#ffffff';c.fillRect(M,y,CW,h);c.strokeStyle='#dfe2ef';c.lineWidth=1;c.strokeRect(M,y,CW,h);
cells.forEach(function(ls,k){var col=r0?n-1-k:k,x0=M+col*cw;c.font=(ri===0?'700 ':'400 ')+fs+'px '+FONT;ls.forEach(function(l,j){var rr=rtl(l)||r0&&!/[A-Za-z]/.test(l);c.direction=rr?'rtl':'ltr';c.textAlign=rr?'right':'left';c.fillStyle=ri===0?'#ffffff':'#1b1f2e';c.fillText(l,rr?x0+cw-pad:x0+pad,y+pad+fs+j*fs*1.45)})});y+=h});y+=20}
page();
if(d.title){text(d.title,52,{bold:1,center:1,color:'#141832',lh:1.3});if(d.subtitle)text(d.subtitle,26,{center:1,color:'#5d6380'});y+=10;need(30);var g=c.createLinearGradient(W/2-120,0,W/2+120,0);g.addColorStop(0,'#2f7bff');g.addColorStop(1,AC);c.fillStyle=g;c.fillRect(W/2-120,y,240,5);y+=40}
d.blocks.forEach(function(b){try{
if(b.h!=null){need(90);y+=14;text(clean(b.h),40,{bold:1,color:'#141832',lh:1.35});y+=6}
else if(b.h2!=null){need(70);y+=10;text(clean(b.h2),31,{bold:1,color:BR,lh:1.4});y+=2}
else if(b.p!=null){text(clean(b.p),25);y+=14}
else if(Array.isArray(b.list)||Array.isArray(b.ol)){(b.list||b.ol).slice(0,300).forEach(function(x,i){text(clean(x),25,{indent:44,bullet:b.ol?(i+1)+'.':'\u2022'})});y+=14}
else if(Array.isArray(b.table)){table(b.table)}
else if(b.note!=null){c.font='400 24px '+FONT;var ls=wrap(c,clean(b.note),CW-60),h=ls.length*37+36;need(h);c.fillStyle='#eef0ff';c.fillRect(M,y,CW,h);c.fillStyle=BR;var r=rtl(b.note);c.fillRect(r?W-M-8:M,y,8,h);y+=18;text(clean(b.note),24,{indent:30,color:'#272c45'});y+=26}
else if(b.hr){need(30);c.fillStyle='#dfe2ef';c.fillRect(M,y+10,CW,2);y+=34}
}catch(e){if(/too long/.test(e.message))throw e}});
return pages}
function b64(s){var bin=atob(s),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u}
function pack(pages){var enc=function(s){var u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;return u},parts=[],off=0,xref=[],n=2+pages.length*3;
function put(x){var u=typeof x==='string'?enc(x):x;parts.push(u);off+=u.length}
function obj(id,body){xref[id]=off;put(id+' 0 obj\n');if(Array.isArray(body))body.forEach(put);else put(body);put('\nendobj\n')}
put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');var kids=[];for(var i=0;i<pages.length;i++)kids.push((3+i*3)+' 0 R');
obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+pages.length+' >>');
pages.forEach(function(cv,i){var id=3+i*3,jpg=b64(cv.toDataURL('image/jpeg',0.9).split(',')[1]),cs='q 595.28 0 0 841.89 0 0 cm /Im0 Do Q';
obj(id,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 '+(id+2)+' 0 R >> >> /Contents '+(id+1)+' 0 R >>');
obj(id+1,'<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream');
obj(id+2,['<< /Type /XObject /Subtype /Image /Width '+cv.width+' /Height '+cv.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n',jpg,'\nendstream'])});
var xo=off,x='xref\n0 '+(n+1)+'\n0000000000 65535 f \n';for(var k=1;k<=n;k++)x+=('0000000000'+xref[k]).slice(-10)+' 00000 n \n';put(x+'trailer\n<< /Size '+(n+1)+' /Root 1 0 R >>\nstartxref\n'+xo+'\n%%EOF');
return new Blob(parts,{type:'application/pdf'})}
function build(spec){return pack(make(spec))}
function deliver(blob,name){var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},30000)}
function download(spec,name){var b=build(spec);deliver(b,fname(name||spec&&(spec.name||spec.title)));return b}
function preview(spec){var p=make(spec);return{pages:p,count:p.length}}
window.cpdf={build:build,download:download,preview:preview,fname:fname,norm:norm};
})();
