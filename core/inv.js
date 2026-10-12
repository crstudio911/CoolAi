(function(){
var D={
ar:{title:'فاتورة CoolAi',proTitle:'فاتورة CoolAi Pro',status:'الحالة',pending:'قيد المراجعة',paid:'تم الدفع',rejected:'مرفوضة',no:'رقم الفاتورة',date:'التاريخ',name:'الاسم',email:'البريد',type:'النوع',proSub:'اشتراك Pro',duration:'المدة',month:'شهر واحد (30 يوم)',coins:'عدد Coins',coinPrice:'سعر الـ Coin',code:'كود الخصم',total:'الإجمالي',cur:'جنيه',policy:'سياسة الاسترجاع: لا يمكن الاسترجاع بعد إضافة Coins في حسابك',proNote:'الاشتراك بيبدأ أول ما الدفع يتأكد ومدته شهر واحد.',support:'الدعم على واتساب',attach:'مرفق سكرين التحويل.'},
en:{title:'CoolAi Invoice',proTitle:'CoolAi Pro Invoice',status:'Status',pending:'Under review',paid:'Paid',rejected:'Rejected',no:'Invoice No.',date:'Date',name:'Name',email:'Email',type:'Type',proSub:'Pro subscription',duration:'Duration',month:'1 month (30 days)',coins:'Coins',coinPrice:'Coin price',code:'Discount code',total:'Total',cur:'EGP',policy:'Refund policy: no refunds after Coins are added to your account',proNote:'The subscription starts once payment is confirmed and lasts one month.',support:'WhatsApp support',attach:'Transfer screenshot attached.'},
fr:{title:'Facture CoolAi',proTitle:'Facture CoolAi Pro',status:'Statut',pending:'En cours de vérification',paid:'Payée',rejected:'Refusée',no:'N° de facture',date:'Date',name:'Nom',email:'E-mail',type:'Type',proSub:'Abonnement Pro',duration:'Durée',month:'1 mois (30 jours)',coins:'Coins',coinPrice:'Prix du Coin',code:'Code promo',total:'Total',cur:'EGP',policy:'Politique de remboursement : aucun remboursement après l\'ajout des Coins',proNote:'L\'abonnement commence dès la confirmation du paiement et dure un mois.',support:'Support WhatsApp',attach:'Capture du virement jointe.'},
es:{title:'Factura CoolAi',proTitle:'Factura CoolAi Pro',status:'Estado',pending:'En revisión',paid:'Pagada',rejected:'Rechazada',no:'N.º de factura',date:'Fecha',name:'Nombre',email:'Correo',type:'Tipo',proSub:'Suscripción Pro',duration:'Duración',month:'1 mes (30 días)',coins:'Coins',coinPrice:'Precio del Coin',code:'Código de descuento',total:'Total',cur:'EGP',policy:'Política de reembolso: sin reembolsos tras añadir los Coins',proNote:'La suscripción empieza al confirmarse el pago y dura un mes.',support:'Soporte por WhatsApp',attach:'Captura de la transferencia adjunta.'},
de:{title:'CoolAi-Rechnung',proTitle:'CoolAi Pro-Rechnung',status:'Status',pending:'In Prüfung',paid:'Bezahlt',rejected:'Abgelehnt',no:'Rechnungsnr.',date:'Datum',name:'Name',email:'E-Mail',type:'Art',proSub:'Pro-Abo',duration:'Laufzeit',month:'1 Monat (30 Tage)',coins:'Coins',coinPrice:'Coin-Preis',code:'Rabattcode',total:'Gesamt',cur:'EGP',policy:'Rückerstattung: keine Erstattung nach Gutschrift der Coins',proNote:'Das Abo beginnt nach Zahlungsbestätigung und läuft einen Monat.',support:'WhatsApp-Support',attach:'Überweisungs-Screenshot angehängt.'},
tr:{title:'CoolAi Faturası',proTitle:'CoolAi Pro Faturası',status:'Durum',pending:'İnceleniyor',paid:'Ödendi',rejected:'Reddedildi',no:'Fatura No',date:'Tarih',name:'Ad',email:'E-posta',type:'Tür',proSub:'Pro abonelik',duration:'Süre',month:'1 ay (30 gün)',coins:'Coins',coinPrice:'Coin fiyatı',code:'İndirim kodu',total:'Toplam',cur:'EGP',policy:'İade politikası: Coins eklendikten sonra iade yapılmaz',proNote:'Abonelik ödeme onaylanınca başlar ve bir ay sürer.',support:'WhatsApp destek',attach:'Havale ekran görüntüsü ekte.'}
};
var LOC={ar:'ar-EG',en:'en-GB',fr:'fr-FR',es:'es-ES',de:'de-DE',tr:'tr-TR'};
function lang(){var c=(window.COOL_LANG?window.COOL_LANG():localStorage.getItem('coolai_lang'))||'ar';c=String(c).split('-')[0];return D[c]?c:(c==='ar'?'ar':'en')}
window.INV={
lang:lang,
t:function(k){return(D[lang()]||D.ar)[k]||D.ar[k]||k},
rtl:function(){return lang()==='ar'},
date:function(ts){try{return new Date(ts).toLocaleString(LOC[lang()],{day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit'})}catch(e){return new Date(ts).toISOString()}},
day:function(ts){try{return new Date(ts).toLocaleDateString(LOC[lang()],{day:'numeric',month:'long',year:'numeric'})}catch(e){return new Date(ts).toISOString().slice(0,10)}},
png:function(v,o){o=o||{};var t=INV.t,rtl=INV.rtl(),W=900,P=56,RH=60,foot=(v.notes||[]).length,H=240+v.rows.length*RH+60+foot*40+50,c=document.createElement('canvas'),x=c.getContext('2d'),F='"IBM Plex Sans Arabic",Tahoma,sans-serif',SC={pending:'#9a6700',paid:'#1a7f37',rejected:'#cf222e'};c.width=W;c.height=H;
var S=rtl?'right':'left',E=rtl?'left':'right',XS=rtl?W-P:P,XE=rtl?P:W-P;
function draw(im){x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle=o.accent||'#0d1117';x.fillRect(0,0,W,12);
if(im)x.drawImage(im,rtl?W-P-56:P,46,56,56);
x.direction=rtl?'rtl':'ltr';x.textBaseline='middle';x.textAlign=S;x.fillStyle='#0d1117';x.font='700 40px '+F;x.fillText(v.title,rtl?W-P-72:P+72,74);
var st=v.status||'pending';x.fillStyle=SC[st]||SC.pending;x.font='600 22px '+F;x.fillText(t('status')+': '+t(st),XS,140);
v.rows.forEach(function(r,k){var y=210+k*RH;x.strokeStyle='#d0d7de';x.beginPath();x.moveTo(P,y+RH/2);x.lineTo(W-P,y+RH/2);x.stroke();
x.textAlign=S;x.fillStyle='#57606a';x.font='500 24px '+F;x.fillText(r[0],XS,y);
x.textAlign=E;x.fillStyle='#0d1117';x.font='600 26px '+F;x.fillText(String(r[1]),XE,y)});
x.textAlign=S;x.fillStyle='#57606a';x.font='500 20px '+F;var yy=240+v.rows.length*RH+30;(v.notes||[]).forEach(function(n){x.fillText(n,XS,yy);yy+=40});x.fillText(t('support')+': '+(o.support||''),XS,yy);
c.toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='CoolAi-'+v.id+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},4000)})}
var im=new Image();im.onload=function(){draw(im)};im.onerror=function(){draw(null)};(document.fonts?document.fonts.ready:Promise.resolve()).then(function(){im.src='../img/logo.png'})}
};
})();
