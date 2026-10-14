(function(){var h=document.documentElement,t=localStorage.getItem('coolai_theme');if(t!=='github'&&t!=='vscode')t='github';h.setAttribute('data-theme',t);
try{var l=localStorage.getItem('coolai_lang')||'ar';if(/^[a-z]{2}(-[A-Z]{2})?$/.test(l)&&l!=='ar'){h.setAttribute('dir',/^(ur|fa)$/.test(l)?'rtl':'ltr');h.setAttribute('lang',l==='zh-CN'?'zh':l);h.setAttribute('data-lang',l)}}catch(e){}
var d=document,no=function(e){e.preventDefault()};
d.addEventListener('gesturestart',no,{passive:false});d.addEventListener('gesturechange',no,{passive:false});d.addEventListener('gestureend',no,{passive:false});
d.addEventListener('touchmove',function(e){if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});
d.addEventListener('touchstart',function(e){if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});
var last=0;d.addEventListener('touchend',function(e){var n=Date.now();if(n-last<320&&e.changedTouches&&e.changedTouches.length===1){var x=e.target;if(!(x.closest&&x.closest('input,textarea,select,button,a,label,[contenteditable],[role=button]')))e.preventDefault()}last=n},{passive:false});
})();
function toggleTheme(){var h=document.documentElement,t=h.getAttribute('data-theme')==='github'?'vscode':'github';h.setAttribute('data-theme',t);localStorage.setItem('coolai_theme',t)}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-tt]');if(b)toggleTheme()});
