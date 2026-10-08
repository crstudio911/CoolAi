(function(){
var s=getSession();
window.PUB=(s&&s.token?api('pub'):Promise.resolve({})).then(function(r){return r&&r.status===200?r:{}});
function build(el,n){
var tr=document.createElement('div'),g=document.createElement('div');tr.className='tk-track';g.className='tk-grp';
function fill(){n.forEach(function(t,i){var d=document.createElement('i');d.className='tk-dot';d.textContent='•';g.appendChild(d);var x=document.createElement('span');x.className=i%2?'tk-r':'tk-b';x.textContent=t;g.appendChild(x)})}
tr.appendChild(g);el.textContent='';el.appendChild(tr);el.hidden=false;
var k=0;do{fill();k++}while(g.scrollWidth<el.clientWidth+40&&k<30);
tr.appendChild(g.cloneNode(true));
tr.style.animationDuration=Math.max(12,Math.round(g.scrollWidth/55))+'s'}
PUB.then(function(r){var el=document.getElementById('ticker');if(!el)return;var n=(r.news||[]).map(function(x){return String(x).trim()}).filter(Boolean);if(!n.length){el.hidden=true;return}build(el,n);var w=innerWidth;addEventListener('resize',function(){if(Math.abs(innerWidth-w)>80){w=innerWidth;build(el,n)}})});
})();
