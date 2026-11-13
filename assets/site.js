(function(){
  "use strict";
  var doc=document, raiz=doc.documentElement;
  var ZAP=raiz.getAttribute("data-zap")||"5511972446638";
  var reduz=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s,c){return (c||doc).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}
  function guarda(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}

  /* topo e menu */
  var topo=$(".topo");
  function rolar(){if(topo)topo.classList.toggle("rolou",scrollY>8)}
  addEventListener("scroll",rolar,{passive:true});rolar();
  var abre=$(".abre-menu");
  if(abre)abre.addEventListener("click",function(){
    var a=doc.body.classList.toggle("menu-aberto");abre.setAttribute("aria-expanded",a?"true":"false");
  });
  $$(".menu a").forEach(function(a){a.addEventListener("click",function(){doc.body.classList.remove("menu-aberto");if(abre)abre.setAttribute("aria-expanded","false")})});

  /* revelar */
  var io=("IntersectionObserver" in window)?new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("vista");io.unobserve(e.target)}})
  },{rootMargin:"0px 0px -8% 0px",threshold:.12}):null;
  function observa(el){if(io)io.observe(el);else el.classList.add("vista")}

  /* carrossel no formato de post */
  function carrossel(post){
    var qs=$$(".quadro",post),pts=$(".pontos",post),i=0,t=null,x0=null;
    if(!qs.length)return;
    qs.forEach(function(q,k){
      var b=doc.createElement("button");b.type="button";b.setAttribute("aria-label","Imagem "+(k+1)+" de "+qs.length);
      b.addEventListener("click",function(){vai(k,true)});pts.appendChild(b);
    });
    var bs=$$("button",pts);
    function vai(n,manual){
      i=(n+qs.length)%qs.length;
      qs.forEach(function(q,k){q.classList.toggle("ativo",k===i);q.setAttribute("aria-hidden",k===i?"false":"true")});
      bs.forEach(function(b,k){b.setAttribute("aria-current",k===i?"true":"false")});
      if(manual)roda();
    }
    function roda(){clearInterval(t);if(!reduz)t=setInterval(function(){vai(i+1)},5600)}
    var a=$(".ant",post),p=$(".prox",post);
    if(a)a.addEventListener("click",function(){vai(i-1,true)});
    if(p)p.addEventListener("click",function(){vai(i+1,true)});
    post.addEventListener("mouseenter",function(){clearInterval(t)});
    post.addEventListener("mouseleave",roda);
    post.addEventListener("pointerdown",function(e){x0=e.clientX});
    post.addEventListener("pointerup",function(e){if(x0===null)return;var d=e.clientX-x0;if(Math.abs(d)>40)vai(i+(d<0?1:-1),true);x0=null});
    post.addEventListener("keydown",function(e){if(e.key==="ArrowRight")vai(i+1,true);if(e.key==="ArrowLeft")vai(i-1,true)});
    vai(0);roda();
  }

  /* vídeo do tour */
  function tour(el){
    var v=$("video",el),b=$(".tocar",el),barra=$(".barra i",el),visto=false;
    if(!v)return;
    function toca(){var p=v.play();if(p&&p.catch)p.catch(function(){});}
    b.addEventListener("click",function(){if(v.paused){toca()}else{v.pause()}});
    v.addEventListener("play",function(){el.classList.add("tocando");b.setAttribute("aria-label","Pausar vídeo")});
    v.addEventListener("pause",function(){el.classList.remove("tocando");b.setAttribute("aria-label","Tocar vídeo")});
    v.addEventListener("timeupdate",function(){if(v.duration)barra.style.width=(v.currentTime/v.duration*100)+"%"});
    if("IntersectionObserver" in window&&!reduz){
      new IntersectionObserver(function(es){es.forEach(function(e){
        if(e.isIntersecting&&!visto){visto=true;toca()}
        if(!e.isIntersecting&&!v.paused)v.pause();
      })},{threshold:.5}).observe(el);
    }
  }

  /* trilha que se desenha */
  function trilha(cam){
    var svg=$("svg.trilha",cam),es=$$(".etapa",cam);
    if(!svg||!es.length)return;
    function desenha(){
      var r=cam.getBoundingClientRect(),pts=es.map(function(e){var ic=$(".icone",e).getBoundingClientRect();return [ic.left-r.left+ic.width/2,ic.top-r.top+ic.height/2]});
      var w=svg.getBoundingClientRect().width;svg.setAttribute("viewBox","0 0 "+w+" "+r.height);
      var d="M"+pts[0][0]+" "+pts[0][1];
      for(var k=1;k<pts.length;k++){var a=pts[k-1],b=pts[k],my=(a[1]+b[1])/2;d+=" C"+a[0]+" "+my+" "+b[0]+" "+my+" "+b[0]+" "+b[1]}
      var u=pts[pts.length-1];d+=" L"+u[0]+" "+(u[1]+60);
      var p=$("path",svg);p.setAttribute("d",d);
      var L=p.getTotalLength();p.style.strokeDasharray=L;p.dataset.l=L;anda();
    }
    function anda(){
      var p=$("path",svg),L=+p.dataset.l||0,r=cam.getBoundingClientRect(),vh=innerHeight;
      var f=Math.min(1,Math.max(0,(vh*.8-r.top)/(r.height)));if(reduz)f=1;
      p.style.strokeDashoffset=L*(1-f);
      es.forEach(function(e){var ic=$(".icone",e).getBoundingClientRect();e.classList.toggle("vista",ic.top<vh*.8)});
    }
    desenha();addEventListener("resize",desenha);addEventListener("scroll",anda,{passive:true});
    if(doc.fonts&&doc.fonts.ready)doc.fonts.ready.then(desenha);
    cam._redesenha=desenha;
  }

  /* faixa arrastável */
  function faixa(f){
    var ini=null,sx=0,moveu=false;
    f.addEventListener("pointerdown",function(e){if(e.pointerType!=="mouse")return;ini=e.clientX;sx=f.scrollLeft;moveu=false;f.classList.add("arrastando")});
    addEventListener("pointermove",function(e){if(ini===null)return;var d=e.clientX-ini;if(Math.abs(d)>4)moveu=true;f.scrollLeft=sx-d});
    addEventListener("pointerup",function(){if(ini===null)return;ini=null;f.classList.remove("arrastando")});
    var ctl=f.parentNode.querySelector(".faixa-ctl");
    if(ctl)$$("button",ctl).forEach(function(b){b.addEventListener("click",function(){f.scrollBy({left:(+b.dataset.d)*f.clientWidth*.6,behavior:"smooth"})})});
  }

  /* avaliações */
  function avaliacoes(sec){
    var bs=$$(".quem-avaliou button",sec),qs=$$(".depoimento .q",sec);
    bs.forEach(function(b,k){b.addEventListener("click",function(){
      bs.forEach(function(x,j){x.setAttribute("aria-selected",j===k?"true":"false")});
      qs.forEach(function(q,j){q.hidden=j!==k});
    })});
  }

  /* galeria com visor */
  var visor=null,lista=[],atual=0;
  function abreVisor(imgs,n){
    lista=imgs;atual=n;
    if(!visor){
      visor=doc.createElement("div");visor.className="visor";visor.setAttribute("role","dialog");visor.setAttribute("aria-label","Foto ampliada");
      visor.innerHTML='<img alt=""><button class="fecha" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg></button><button class="ant" aria-label="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg></button><button class="prox" aria-label="Próxima"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg></button><div class="conta"></div>';
      doc.body.appendChild(visor);
      $(".fecha",visor).onclick=fechaVisor;$(".ant",visor).onclick=function(){mostra(atual-1)};$(".prox",visor).onclick=function(){mostra(atual+1)};
      visor.addEventListener("click",function(e){if(e.target===visor)fechaVisor()});
      var x0=null;visor.addEventListener("pointerdown",function(e){x0=e.clientX});visor.addEventListener("pointerup",function(e){if(x0!==null&&Math.abs(e.clientX-x0)>50)mostra(atual+(e.clientX<x0?1:-1));x0=null});
      doc.addEventListener("keydown",function(e){if(!visor.classList.contains("aberto"))return;if(e.key==="Escape")fechaVisor();if(e.key==="ArrowRight")mostra(atual+1);if(e.key==="ArrowLeft")mostra(atual-1)});
    }
    visor.classList.add("aberto");doc.body.style.overflow="hidden";mostra(n);$(".fecha",visor).focus();
  }
  function mostra(n){atual=(n+lista.length)%lista.length;var it=lista[atual],im=$("img",visor);im.src=it.src;im.alt=it.alt;$(".conta",visor).textContent=(atual+1)+" / "+lista.length}
  function fechaVisor(){visor.classList.remove("aberto");doc.body.style.overflow=""}
  function galeria(g){
    var bs=$$("button",g),imgs=bs.map(function(b){return {src:b.dataset.full,alt:$("img",b).alt}});
    bs.forEach(function(b,k){b.addEventListener("click",function(){abreVisor(imgs,k)})});
  }

  /* formulários que abrem o WhatsApp ou o e-mail */
  function abreLink(url,form){
    var r=$(".retorno",form);
    var a=doc.createElement("a");a.href=url;a.target="_blank";a.rel="noopener";doc.body.appendChild(a);
    try{a.click()}catch(e){}
    a.remove();
    if(r){r.innerHTML='Se a conversa não abriu sozinha, <a href="'+url+'" target="_blank" rel="noopener">toque aqui para continuar</a>.';r.classList.add("ver")}
  }
  $$("form[data-zap],form[data-email]").forEach(function(f){
    f.addEventListener("submit",function(e){
      e.preventDefault();
      if(!f.reportValidity())return;
      var linhas=[f.getAttribute("data-abre")||"Olá!"];
      $$("[name]",f).forEach(function(c){var v=(c.value||"").trim();if(v)linhas.push(c.getAttribute("data-rotulo")+": "+v)});
      var txt=linhas.join("\n");
      if(f.hasAttribute("data-email")){
        abreLink("mailto:"+f.getAttribute("data-email")+"?subject="+encodeURIComponent(f.getAttribute("data-assunto")||"Contato pelo site")+"&body="+encodeURIComponent(txt),f);
      }else{
        abreLink("https://wa.me/"+ZAP+"?text="+encodeURIComponent(txt),f);
      }
    });
  });

  /* cookies */
  var ck=$(".cookies");
  if(ck&&!guarda("vlv-cookies")){ck.classList.add("ver");$(".ok",ck).addEventListener("click",function(){guarda("vlv-cookies","ok");ck.classList.remove("ver")})}

  /* modo revisão: uma página com várias vistas pelo hash */
  var vistas=$$("[data-vista]");
  function ativa(){
    $$(".rv",doc).forEach(observa);
    $$(".post").forEach(function(p){if(!p._ok){p._ok=1;carrossel(p)}});
    $$(".tour").forEach(function(p){if(!p._ok){p._ok=1;tour(p)}});
    $$(".caminho").forEach(function(p){if(!p._ok){p._ok=1;trilha(p)}else if(p._redesenha)p._redesenha()});
    $$(".faixa").forEach(function(p){if(!p._ok){p._ok=1;faixa(p)}});
    $$(".avaliacoes").forEach(function(p){if(!p._ok){p._ok=1;avaliacoes(p)}});
    $$(".galeria").forEach(function(p){if(!p._ok){p._ok=1;galeria(p)}});
  }
  if(vistas.length){
    function rota(){
      var h=(location.hash||"#inicio").slice(1),alvo=null;
      vistas.forEach(function(v){if(v.getAttribute("data-vista")===h)alvo=v});
      if(!alvo)alvo=vistas[0];
      vistas.forEach(function(v){v.hidden=v!==alvo;$$("video",v).forEach(function(x){if(v!==alvo)x.pause()})});
      var nome=alvo.getAttribute("data-vista"),pagina=alvo.getAttribute("data-menu")||nome;
      $$(".menu a").forEach(function(a){a.toggleAttribute("aria-current",a.getAttribute("href")==="#"+pagina);if(a.getAttribute("href")==="#"+pagina)a.setAttribute("aria-current","page")});
      doc.title=alvo.getAttribute("data-titulo")||doc.title;
      scrollTo(0,0);ativa();
    }
    addEventListener("hashchange",rota);rota();
  }else{ativa()}
})();
