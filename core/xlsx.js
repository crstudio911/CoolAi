window.cxlsx=(function(){
var te=new TextEncoder(),td=new TextDecoder('utf-8');
var CRC=(function(){var t=[],c,n,k;for(n=0;n<256;n++){c=n;for(k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){var c=-1;for(var i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return(c^-1)>>>0}
var BAD=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;
function esc(s){return String(s).replace(BAD,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function col(n){var s='';n++;while(n>0){var m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s}
function colIdx(r){var m=/^([A-Z]+)/.exec(r||''),n=0;if(!m)return -1;for(var i=0;i<m[1].length;i++)n=n*26+(m[1].charCodeAt(i)-64);return n-1}
/* ---------- writing ---------- */
function zip(files){var parts=[],cd=[],off=0;
files.forEach(function(f){var nm=te.encode(f.name),d=typeof f.data==='string'?te.encode(f.data):f.data,c=crc32(d),h=new Uint8Array(30+nm.length),v=new DataView(h.buffer);
v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(8,0,true);v.setUint16(10,0,true);v.setUint16(12,0x21,true);v.setUint32(14,c,true);v.setUint32(18,d.length,true);v.setUint32(22,d.length,true);v.setUint16(26,nm.length,true);v.setUint16(28,0,true);h.set(nm,30);parts.push(h,d);
var e=new Uint8Array(46+nm.length),w=new DataView(e.buffer);w.setUint32(0,0x02014b50,true);w.setUint16(4,20,true);w.setUint16(6,20,true);w.setUint16(8,0x0800,true);w.setUint16(10,0,true);w.setUint16(12,0,true);w.setUint16(14,0x21,true);w.setUint32(16,c,true);w.setUint32(20,d.length,true);w.setUint32(24,d.length,true);w.setUint16(28,nm.length,true);w.setUint32(42,off,true);e.set(nm,46);cd.push(e);off+=h.length+d.length});
var cdl=0;cd.forEach(function(x){cdl+=x.length});var end=new Uint8Array(22),z=new DataView(end.buffer);z.setUint32(0,0x06054b50,true);z.setUint16(8,files.length,true);z.setUint16(10,files.length,true);z.setUint32(12,cdl,true);z.setUint32(16,off,true);
return new Blob(parts.concat(cd,[end]),{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
var DANGER=/\b(WEBSERVICE|FILTERXML|CALL|REGISTER|EXEC|DDE|RTD|IMPORTXML|IMPORTDATA|IMPORTHTML|HYPERLINK)\s*\(|\|/i;
var NUM=/^-?(?:0|[1-9]\d{0,14})(?:\.\d+)?$/;
function cell(v,ref,head){var s=head?' s="1"':'';
if(v===null||v===undefined||v==='')return '';
if(typeof v==='boolean')return '<c r="'+ref+'" t="b"'+s+'><v>'+(v?1:0)+'</v></c>';
if(typeof v==='number'&&isFinite(v))return '<c r="'+ref+'"'+s+'><v>'+v+'</v></c>';
v=String(v).replace(BAD,'').slice(0,32000);
if(!head&&v[0]==='='&&v.length>1&&v.length<2000&&!DANGER.test(v))return '<c r="'+ref+'"'+s+'><f>'+esc(v.slice(1))+'</f></c>';
if(!head&&NUM.test(v.trim()))return '<c r="'+ref+'"'+s+'><v>'+(+v.trim())+'</v></c>';
return '<c r="'+ref+'" t="inlineStr"'+s+'><is><t xml:space="preserve">'+esc(v)+'</t></is></c>'}
function sheetName(n,used,i){n=String(n||'').replace(/[\[\]:*?\/\\]/g,' ').replace(BAD,'').trim().slice(0,31)||('Sheet'+(i+1));var b=n,k=2;while(used[n.toLowerCase()]){n=b.slice(0,28)+' ('+k+++')'}used[n.toLowerCase()]=1;return n}
function norm(sheets){if(!Array.isArray(sheets))sheets=[];var used={};return sheets.slice(0,20).map(function(s,i){var rows=(Array.isArray(s&&s.rows)?s.rows:[]).slice(0,20000).map(function(r){return Array.isArray(r)?r.slice(0,200):[r]});return{name:sheetName(s&&s.name,used,i),rows:rows,head:s&&s.header===false?false:true}}).filter(function(s){return s.rows.length})}
function write(sheets){sheets=norm(sheets);if(!sheets.length)sheets=[{name:'Sheet1',rows:[['']],head:false}];
var NS='xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',R='xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"',files=[];
var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>';
var wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook '+NS+' '+R+'><sheets>',rel='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
sheets.forEach(function(s,i){var n=i+1,w=[],rtl=false,x=[];
s.rows.forEach(function(r,ri){var cs='';r.forEach(function(v,ci){var t=v==null?'':String(v);if(/[\u0600-\u06FF]/.test(t))rtl=true;var L=Math.min(60,t.length+2);if(!w[ci]||w[ci]<L)w[ci]=L;cs+=cell(v,col(ci)+(ri+1),s.head&&ri===0)});x.push('<row r="'+(ri+1)+'">'+cs+'</row>')});
var cols=w.length?'<cols>'+w.map(function(v,ci){return '<col min="'+(ci+1)+'" max="'+(ci+1)+'" width="'+Math.max(8,v||8)+'" customWidth="1"/>'}).join('')+'</cols>':'';
var pane=s.head&&s.rows.length>1?'<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>':'';
files.push({name:'xl/worksheets/sheet'+n+'.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet '+NS+' '+R+'><sheetViews><sheetView workbookViewId="0"'+(rtl?' rightToLeft="1"':'')+(i===0?' tabSelected="1"':'')+'>'+pane+'</sheetView></sheetViews>'+cols+'<sheetData>'+x.join('')+'</sheetData></worksheet>'});
ct+='<Override PartName="/xl/worksheets/sheet'+n+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
wb+='<sheet name="'+esc(s.name)+'" sheetId="'+n+'" r:id="rId'+n+'"/>';rel+='<Relationship Id="rId'+n+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+n+'.xml"/>'});
var sid=sheets.length+1;
rel+='<Relationship Id="rId'+sid+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
wb+='</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>';ct+='</Types>';
var st='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet '+NS+'><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF238636"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
files.unshift({name:'[Content_Types].xml',data:ct},{name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},{name:'xl/workbook.xml',data:wb},{name:'xl/_rels/workbook.xml.rels',data:rel},{name:'xl/styles.xml',data:st});
return zip(files)}
function fname(n){n=String(n||'').replace(/[\\\/:*?"<>|\u0000-\u001F]/g,' ').trim().slice(0,80)||('coolai-'+Date.now());if(!/\.xlsx$/i.test(n))n=n.replace(/\.(xls|csv)$/i,'')+'.xlsx';return n}
function download(name,sheets){var b=write(sheets),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=fname(name);document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},30000)}
/* ---------- reading ---------- */
function inflate(u){if(typeof DecompressionStream!=='function')return Promise.reject('متصفحك قديم ومش بيقدر يفتح ملفات Excel. حدّث المتصفح أو احفظ الملف CSV.');
var ds=new DecompressionStream('deflate-raw'),w=ds.writable.getWriter();w.write(u);w.close();return new Response(ds.readable).arrayBuffer().then(function(b){return new Uint8Array(b)})}
function unzip(buf){var u=new Uint8Array(buf),v=new DataView(buf),e=-1;for(var i=u.length-22;i>=Math.max(0,u.length-70000);i--){if(v.getUint32(i,true)===0x06054b50){e=i;break}}
if(e<0)throw 'bad';var n=v.getUint16(e+10,true),p=v.getUint32(e+16,true),out={};
for(var k=0;k<n&&p+46<=u.length;k++){if(v.getUint32(p,true)!==0x02014b50)break;var meth=v.getUint16(p+10,true),cs=v.getUint32(p+20,true),nl=v.getUint16(p+28,true),xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),lo=v.getUint32(p+42,true),name=td.decode(u.subarray(p+46,p+46+nl));
var ds=lo+30+v.getUint16(lo+26,true)+v.getUint16(lo+28,true);out[name]={m:meth,d:u.subarray(ds,ds+cs)};p+=46+nl+xl+cl}return out}
function get(z,name){var f=z[name];if(!f)return Promise.resolve(null);if(f.m===0)return Promise.resolve(td.decode(f.d));if(f.m!==8)return Promise.resolve(null);return inflate(f.d).then(function(x){return td.decode(x)})}
function xml(s){return new DOMParser().parseFromString(s,'application/xml')}
function tags(el,n){return el?[].slice.call(el.getElementsByTagNameNS('*',n)):[]}
function txt(el){return tags(el,'t').map(function(t){return t.textContent}).join('')}
var DATEF={14:1,15:1,16:1,17:1,18:1,19:1,20:1,21:1,22:1,45:1,46:1,47:1};
function serial(n){var ms=Math.round((n-25569)*864e5),d=new Date(ms);if(isNaN(d))return String(n);var iso=d.toISOString();return n%1?iso.slice(0,16).replace('T',' '):iso.slice(0,10)}
function read(buf,maxRows){maxRows=maxRows||3000;var z;try{z=unzip(buf)}catch(e){return Promise.reject('الملف ده مش ملف Excel سليم (xlsx).')}
if(!z['xl/workbook.xml'])return Promise.reject('الملف ده مش ملف Excel سليم (xlsx).');
return Promise.all([get(z,'xl/workbook.xml'),get(z,'xl/_rels/workbook.xml.rels'),get(z,'xl/sharedStrings.xml'),get(z,'xl/styles.xml')]).then(function(a){
var wb=xml(a[0]),rels={},ss=[],dateXf={};
tags(xml(a[1]||'<r/>'),'Relationship').forEach(function(r){var t=r.getAttribute('Target')||'';t=t.charAt(0)==='/'?t.slice(1):'xl/'+t.replace(/^\.\//,'');rels[r.getAttribute('Id')]=t});
if(a[2])tags(xml(a[2]),'si').forEach(function(si){ss.push(txt(si))});
if(a[3]){var sx=xml(a[3]),cf={};tags(sx,'numFmt').forEach(function(f){var c=(f.getAttribute('formatCode')||'').replace(/"[^"]*"|\[[^\]]*\]/g,'');if(/[dy]/i.test(c)||/m.*[dy]|[dy].*m/i.test(c))cf[f.getAttribute('numFmtId')]=1});var cx=tags(sx,'cellXfs')[0];if(cx)[].slice.call(cx.children).forEach(function(x,i){var id=x.getAttribute('numFmtId');if(DATEF[id]||cf[id])dateXf[i]=1})}
var list=tags(wb,'sheet').slice(0,20).map(function(s){var id=s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||s.getAttribute('r:id');return{name:s.getAttribute('name')||'Sheet',path:rels[id]}}).filter(function(s){return s.path&&z[s.path]});
return Promise.all(list.map(function(s){return get(z,s.path).then(function(x){if(!x)return{name:s.name,rows:[],total:0};var d=xml(x),rows=[],total=0;
tags(d,'row').forEach(function(r){total++;if(rows.length>=maxRows)return;var ri=(+r.getAttribute('r')||rows.length+1)-1;if(ri>=maxRows)return;var row=[];
tags(r,'c').forEach(function(c){var ci=colIdx(c.getAttribute('r'));if(ci<0)ci=row.length;if(ci>=200)return;var t=c.getAttribute('t')||'',ve=tags(c,'v')[0],val=ve?ve.textContent:'';
if(t==='s')val=ss[+val]||'';else if(t==='inlineStr')val=txt(tags(c,'is')[0]);else if(t==='b')val=val==='1'?'TRUE':'FALSE';else if(t==='e')val=val||'#ERR';else if(t!=='str'&&val!==''&&dateXf[+c.getAttribute('s')]&&!isNaN(+val))val=serial(+val);
if(val===''){var fe=tags(c,'f')[0];if(fe&&fe.textContent)val='='+fe.textContent}
row[ci]=val});
for(var i=0;i<row.length;i++)if(row[i]===undefined)row[i]='';rows[ri]=row});
for(var j=0;j<rows.length;j++)if(!rows[j])rows[j]=[];
while(rows.length&&!rows[rows.length-1].some(function(v){return String(v).trim()}))rows.pop();
return{name:s.name,rows:rows,total:total}})})).then(function(sh){return{sheets:sh}})})}
function csvCell(v){v=v==null?'':String(v);return/[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function toText(book){return book.sheets.map(function(s){var w=0;s.rows.forEach(function(r){if(r.length>w)w=r.length});return'### Sheet: '+s.name+' ('+s.rows.length+' rows x '+w+' columns'+(s.total>s.rows.length?', only the first '+s.rows.length+' of '+s.total+' rows included':'')+')\n'+s.rows.map(function(r){return r.map(csvCell).join(',')}).join('\n')}).join('\n\n')}
function parseCsv(t){var rows=[],row=[],f='',q=false,i=0;t=String(t).replace(/\r\n?/g,'\n');for(;i<t.length;i++){var c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===','){row.push(f);f=''}else if(c==='\n'){row.push(f);rows.push(row);row=[];f=''}else f+=c}if(f||row.length){row.push(f);rows.push(row)}return rows}
return{write:write,download:download,read:read,toText:toText,parseCsv:parseCsv,fname:fname}
})();
