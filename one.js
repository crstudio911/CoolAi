(function(){
var $=function(i){return document.getElementById(i)},logged=!!localStorage.getItem('coolai_session');
var ta=$('askt'),sb=$('asks'),cn=$('askc'),mode='eco';
function sz(){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,260)+'px';cn.textContent=ta.value.length+' / 4000';sb.disabled=!ta.value.trim()}
ta.addEventListener('input',sz);
ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!/Mobi|Android/i.test(navigator.userAgent)){e.preventDefault();if(ta.value.trim())$('ask').requestSubmit()}});
document.querySelectorAll('.askm button').forEach(function(b){b.onclick=function(){mode=b.dataset.m;document.querySelectorAll('.askm button').forEach(function(x){x.classList.toggle('on',x===b)})}});
function go(p){p=String(p||'').trim();if(!p)return;localStorage.setItem('coolai_draft',p);if(mode==='pro')localStorage.setItem('coolai_mode','pro');location.href=logged?'main/main.html#chat':'log/login.html?m=signup'}
$('ask').onsubmit=function(e){e.preventDefault();go(ta.value)};
$('chips').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;ta.value=b.dataset.p;sz();ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)});
var T={
code:['اكتب دالة JavaScript تتحقق من صحة البريد الإلكتروني','<b class="at">التحقق من البريد الإلكتروني</b><p>إليك دالة بسيطة تعتمد على تعبير نمطي، وتعيد true إذا كان البريد صالحًا:</p><pre dir="ltr"><code>function isEmail(v) {\n  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(v.trim());\n}\n\nisEmail("user@mail.com"); // true</code></pre><p>هل تريد أن أضيف رسائل خطأ تظهر للمستخدم أسفل الحقل؟</p>'],
write:['اكتب رسالة بريد رسمية أطلب فيها إجازة يومين','<b class="at">طلب إجازة</b><p>السيد المدير المحترم،</p><p>تحية طيبة، وبعد،</p><p>أتقدّم إليكم بطلب إجازة لمدة يومين، بدءًا من يوم الأحد القادم، وذلك لظروف شخصية. وسأحرص على إنجاز المهام العاجلة قبل بدء الإجازة.</p><p>وتفضّلوا بقبول فائق الاحترام.</p>'],
research:['ما الفرق بين الطاقة الشمسية وطاقة الرياح؟','<b class="at">مقارنة سريعة</b><ul><li><b>الطاقة الشمسية:</b> تعمل نهارًا، وتناسب المنازل والأسطح، وصيانتها قليلة.</li><li><b>طاقة الرياح:</b> تعمل ليلًا ونهارًا عند توفر الرياح، وتحتاج إلى مساحات واسعة.</li></ul><p>المصادر: الوكالة الدولية للطاقة المتجددة، وويكيبيديا.</p>'],
data:['حلّل مبيعات هذا الملف واستخرج أفضل شهر','<b class="at">نتيجة التحليل</b><p>بعد قراءة الملف تبيّن ما يلي:</p><ul><li>أعلى مبيعات كانت في شهر <b>مارس</b> بقيمة 48,200.</li><li>متوسط المبيعات الشهرية 31,750.</li><li>نسبة النمو منذ يناير 22%.</li></ul><p>هل تريد رسمًا بيانيًا للأشهر أو ملف Excel بالنتائج؟</p>'],
learn:['اشرح لي مفهوم المتغيّر في البرمجة ببساطة','<b class="at">ما المتغيّر؟</b><p>المتغيّر صندوق له اسم، نضع فيه قيمة لنستخدمها لاحقًا. فعندما نكتب <code>age = 20</code> فإننا ننشئ صندوقًا اسمه age ونضع فيه الرقم 20، ويمكننا تغيير هذه القيمة متى شئنا.</p><p>هل تريد تمرينًا قصيرًا لتطبيق الفكرة؟</p>']};
var cur='code';
function show(k){cur=k;$('tq').textContent=T[k][0];$('ta').innerHTML=T[k][1];document.querySelectorAll('#tabs button').forEach(function(b){var on=b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)})}
$('tabs').addEventListener('click',function(e){var b=e.target.closest('button');if(b)show(b.dataset.k)});
$('ttry').onclick=function(){ta.value=T[cur][0];sz();window.scrollTo({top:0,behavior:'smooth'});setTimeout(function(){ta.focus()},400)};
show('code');sz();
if(logged){var a=document.querySelector('.nav-top a.btn.primary');if(a){a.textContent='افتح المحادثة';a.href='main/main.html#chat'}}
})();
