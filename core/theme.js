(function(){var t=localStorage.getItem('coolai_theme');if(t!=='github'&&t!=='vscode')t='github';document.documentElement.setAttribute('data-theme',t)})();
function toggleTheme(){var h=document.documentElement,t=h.getAttribute('data-theme')==='github'?'vscode':'github';h.setAttribute('data-theme',t);localStorage.setItem('coolai_theme',t)}
