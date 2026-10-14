window.cvoice=(function(){
var SR=window.SpeechRecognition||window.webkitSpeechRecognition,UA=navigator.userAgent,FF=/firefox|fxios/i.test(UA),BRAVE=!!(navigator.brave),native=!!SR&&!FF&&!BRAVE;
var AR=/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,LAT=/[A-Za-z\u00C0-\u024F]/;
var note=function(){},MAXS=45;
function uiLang(){var l=window.COOL_LANG?COOL_LANG():'ar';return l||'ar'}
function recLang(){var l=uiLang();return l==='ar'?'ar-EG':{en:'en-US',fr:'fr-FR',es:'es-ES',de:'de-DE',tr:'tr-TR',it:'it-IT',pt:'pt-BR',ru:'ru-RU','zh-CN':'zh-CN',ja:'ja-JP',hi:'hi-IN',ur:'ur-PK',fa:'fa-IR',id:'id-ID'}[l]||'ar-EG'}
var mic={on:false,stop:null};
function setMic(btn,ta,s){btn.classList.toggle('rec',s==='rec');btn.classList.toggle('wait',s==='wait');btn.title=s==='rec'?'إيقاف الاستماع':s==='wait'?'جارٍ تحويل الصوت إلى نص':'تحدث بدل الكتابة';btn.setAttribute('aria-label',btn.title);if(s==='rec'){ta.dataset.ph=ta.dataset.ph||ta.placeholder;ta.placeholder='أستمع إليك الآن...'}else if(s==='wait')ta.placeholder='جارٍ تحويل الصوت إلى نص...';else if(ta.dataset.ph)ta.placeholder=ta.dataset.ph}
function put(ta,base,t){var v=(base&&t&&!/\s$/.test(base)?base+' ':base)+t;ta.value=v.slice(0,2000);ta.dispatchEvent(new Event('input',{bubbles:true}))}
function startNative(btn,ta){var r=new SR(),base=ta.value,fin='',stopped=false,failed=false;r.lang=recLang();r.continuous=true;r.interimResults=true;r.maxAlternatives=1;
r.onresult=function(e){var it='';for(var i=e.resultIndex;i<e.results.length;i++){var x=e.results[i][0].transcript;if(e.results[i].isFinal)fin+=x;else it+=x}put(ta,base,(fin+it).trim())};
r.onerror=function(e){var c=e.error;if(c==='no-speech'||c==='aborted')return;if(c==='not-allowed'){failed=true;note('اسمح للموقع باستخدام الميكروفون من إعدادات المتصفح ثم حاول مرة أخرى.');return}if(c==='network'||c==='service-not-allowed'||c==='language-not-supported'){failed=true;native=false;mic.on=false;setMic(btn,ta,'');startRec(btn,ta);return}note('تعذر الاستماع الآن، حاول مرة أخرى.')};
r.onend=function(){if(!stopped&&!failed&&mic.on){try{r.start();return}catch(x){}}if(!failed||!mic.on){mic.on=false;setMic(btn,ta,'')}};
mic.on=true;mic.stop=function(){stopped=true;mic.on=false;try{r.stop()}catch(x){}setMic(btn,ta,'')};
try{r.start();setMic(btn,ta,'rec')}catch(x){native=false;mic.on=false;startRec(btn,ta)}}
function wav(buf){var rate=16000,len=Math.ceil(buf.duration*rate),off=new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,len,rate),src=off.createBufferSource();src.buffer=buf;src.connect(off.destination);src.start(0);
return off.startRendering().then(function(r){var d=r.getChannelData(0),n=d.length,ab=new ArrayBuffer(44+n*2),v=new DataView(ab);function s(o,t){for(var i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))}
s(0,'RIFF');v.setUint32(4,36+n*2,true);s(8,'WAVE');s(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);s(36,'data');v.setUint32(40,n*2,true);
for(var i=0;i<n;i++){var x=Math.max(-1,Math.min(1,d[i]));v.setInt16(44+i*2,x<0?x*32768:x*32767,true)}return ab})}
function b64(ab){var u=new Uint8Array(ab),s='',k=0x8000;for(var i=0;i<u.length;i+=k)s+=String.fromCharCode.apply(null,u.subarray(i,i+k));return btoa(s)}
function startRec(btn,ta){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder)return note('متصفحك لا يسمح بتسجيل الصوت. حدّث المتصفح أو استخدم متصفحًا أحدث.');
navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(function(st){var ty=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus','audio/ogg'].filter(function(t){return MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t)})[0],mr=ty?new MediaRecorder(st,{mimeType:ty}):new MediaRecorder(st),ch=[],tm,base=ta.value;
mr.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data)};
mr.onstop=function(){clearTimeout(tm);st.getTracks().forEach(function(t){t.stop()});mic.on=false;if(!ch.length){setMic(btn,ta,'');return}setMic(btn,ta,'wait');
new Blob(ch,{type:mr.mimeType||ty||'audio/webm'}).arrayBuffer().then(function(a){var C=window.AudioContext||window.webkitAudioContext,c=new C();return new Promise(function(res,rej){c.decodeAudioData(a,res,rej)}).then(function(b){try{c.close()}catch(x){}return wav(b)})}).then(function(w){return api('stt',{audio:b64(w),lang:uiLang()})}).then(function(r){setMic(btn,ta,'');if(r&&r.text){put(ta,base,r.text);ta.focus()}else note((r&&r.error)||'لم أسمع كلامًا واضحًا، حاول مرة أخرى.')}).catch(function(){setMic(btn,ta,'');note('تعذر تحويل الصوت إلى نص، حاول مرة أخرى.')})};
mr.start(250);mic.on=true;mic.stop=function(){if(mr.state!=='inactive')mr.stop()};setMic(btn,ta,'rec');tm=setTimeout(function(){note('الحد الأقصى للتسجيل '+MAXS+' ثانية في المرة الواحدة.');mic.stop()},MAXS*1000)}).catch(function(){note('اسمح للموقع باستخدام الميكروفون من إعدادات المتصفح ثم حاول مرة أخرى.')})}
function initMic(btn,ta,n){if(n)note=n;if(!btn||!ta)return;btn.onclick=function(){if(btn.classList.contains('wait'))return;if(mic.on){mic.stop&&mic.stop();return}stopSpeak();if(native)startNative(btn,ta);else startRec(btn,ta)}}
var TTS='speechSynthesis' in window,cur=null,keep=0;
function vlist(){return TTS?speechSynthesis.getVoices()||[]:[]}
function ready(){return new Promise(function(res){if(!TTS)return res([]);var v=vlist();if(v.length)return res(v);var t=setTimeout(function(){res(vlist())},1200);speechSynthesis.addEventListener('voiceschanged',function f(){clearTimeout(t);speechSynthesis.removeEventListener('voiceschanged',f);res(vlist())})})}
function pick(vs,l){var p=l.split('-')[0],best=null,bs=-1;vs.forEach(function(v){var vl=(v.lang||'').replace('_','-');if(vl.toLowerCase().indexOf(p)!==0)return;var s=1;if(/natural|neural|online|premium|enhanced|wavenet/i.test(v.name))s+=4;if(l==='ar'&&/ar-(EG|SA)/i.test(vl))s+=2;if(l==='en'&&/en-(US|GB)/i.test(vl))s+=2;if(v.localService===false)s+=1;if(s>bs){bs=s;best=v}});return best}
function scr(w){return AR.test(w)?'ar':LAT.test(w)?'en':''}
function runs(t){var ws=t.split(/(\s+)/),out=[],c=null;ws.forEach(function(w){var s=scr(w);if(!c){c={l:s,t:w};out.push(c);return}if(s&&c.l&&s!==c.l){c={l:s,t:w};out.push(c)}else{c.t+=w;if(!c.l)c.l=s}});return out.filter(function(r){return /[^\s\p{P}\p{S}]/u.test(r.t)}).map(function(r){return{l:r.l||'ar',t:r.t.trim()}})}
function sents(t){return(t.match(/[^.!?؟\n]+[.!?؟]*|[.!?؟]+/g)||[]).map(function(s){return s.trim()}).filter(Boolean)}
function tidy(t){return t.replace(/https?:\/\/\S+/g,' رابط ').replace(/[*_#`>|~]+/g,' ').replace(/\s+/g,' ').trim()}
function plain(el){var c=el.cloneNode(true);[].forEach.call(c.querySelectorAll('.katex-html,.acts,.bacts,.nexts,button,.cut-note'),function(x){x.remove()});return tidy(c.textContent||'')}
function blocks(bd,arMain){var out=[],L=arMain?{code:'يوجد كود هنا.',tab:'يوجد جدول هنا.',eq:'توجد معادلة هنا.',ch:'يوجد رسم بياني هنا.',file:'يوجد ملف هنا.'}:{code:'There is code here.',tab:'There is a table here.',eq:'There is an equation here.',ch:'There is a chart here.',file:'There is a file here.'};
function walk(p){[].forEach.call(p.children,function(el){if(el.matches('.acts,.bacts,.nexts,.srcs,.steps,button,.cut-note'))return;if(el.matches('pre,.cb')||(el.querySelector('pre')&&!el.matches('ul,ol')))return out.push({el:el,t:L.code});if(el.matches('table,.tbw')&&!el.closest('.xcard'))return out.push({el:el,t:L.tab});if(el.matches('.mxd,.mxw'))return out.push({el:el,t:L.eq});if(el.matches('.xcard,.pcard,.acard'))return out.push({el:el,t:L.file});if(el.matches('canvas,svg,.chart,[class*=chart]'))return out.push({el:el,t:L.ch});if(el.matches('ul,ol')&&el.children.length)return walk(el);var t=plain(el);if(t)out.push({el:el,t:t})})}
walk(bd);if(!out.length){var t=plain(bd);if(t)out.push({el:bd,t:t})}return out}
var IC={spk:'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',stop:'M7 7h10v10H7z'};
function ico(d){var s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');var p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);s.appendChild(p);return s}
function mark(b,on){b.textContent='';b.appendChild(ico(on?IC.stop:IC.spk));b.classList.toggle('on',on);b.title=on?'إيقاف القراءة':'قراءة الرد بصوت عالٍ';b.setAttribute('aria-label',b.title)}
function stopSpeak(){if(!cur)return;var c=cur;cur=null;clearInterval(keep);try{speechSynthesis.cancel()}catch(x){}if(c.hl)c.hl.classList.remove('speaking');mark(c.btn,false)}
function speak(bd,btn){if(!TTS)return note('متصفحك لا يدعم القراءة بصوت عالٍ.');if(cur&&cur.btn===btn)return stopSpeak();stopSpeak();if(mic.on&&mic.stop)mic.stop();
var arMain=AR.test(bd.textContent||''),bl=blocks(bd,arMain),q=[];bl.forEach(function(b){sents(b.t).forEach(function(s){runs(s).forEach(function(r){q.push({el:b.el,l:r.l,t:r.t})})})});if(!q.length)return;
var me={btn:btn,hl:null};cur=me;mark(btn,true);
ready().then(function(vs){if(cur!==me)return;var va=pick(vs,'ar'),ve=pick(vs,'en');if(arMain&&!va)note('لا يوجد صوت عربي مثبت على جهازك، فقد يُقرأ النص العربي بشكل غير صحيح. يمكنك إضافة اللغة العربية من إعدادات الكلام في نظام التشغيل.');
var i=0;function next(){if(cur!==me)return;if(i>=q.length)return stopSpeak();var it=q[i++];if(me.hl!==it.el){if(me.hl)me.hl.classList.remove('speaking');me.hl=it.el;it.el.classList.add('speaking');if(it.el.scrollIntoView)try{it.el.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(x){}}
var u=new SpeechSynthesisUtterance(it.t),v=it.l==='ar'?va:ve;u.lang=v?v.lang:(it.l==='ar'?'ar-EG':'en-US');if(v)u.voice=v;u.rate=it.l==='ar'?0.95:1;var done=false;u.onend=u.onerror=function(){if(done)return;done=true;next()};speechSynthesis.speak(u)}
if(!/android|iphone|ipad/i.test(UA))keep=setInterval(function(){if(speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();speechSynthesis.resume()}},9000);
try{speechSynthesis.cancel()}catch(x){}setTimeout(next,60)})}
function speakBtn(bd){var b=document.createElement('button');b.type='button';b.className='ab spk';mark(b,false);b.onclick=function(){speak(bd,b)};return b}
window.addEventListener('pagehide',stopSpeak);
return{initMic:initMic,speakBtn:speakBtn,stop:stopSpeak,canSpeak:TTS}})();
