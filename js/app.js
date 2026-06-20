/* ── FADING VIDEO ───────────────────────── */
const FADE_MS=500, FADE_LEAD=0.55;
function setupVideo(vid,src){
  if(!vid||!src)return;
  let raf=null,fadingOut=false;
  vid.src=src;vid.style.opacity=0;
  function fadeTo(t,ms){
    if(raf)cancelAnimationFrame(raf);
    const s=performance.now(),from=parseFloat(vid.style.opacity)||0;
    function step(n){const p=Math.min((n-s)/ms,1);vid.style.opacity=from+(t-from)*p;if(p<1)raf=requestAnimationFrame(step);}
    raf=requestAnimationFrame(step);
  }
  vid.addEventListener('loadeddata',()=>{vid.classList.add('rdy');vid.style.opacity=0;vid.play().catch(()=>{});fadeTo(1,FADE_MS);});
  vid.addEventListener('timeupdate',()=>{if(!fadingOut&&vid.duration&&(vid.duration-vid.currentTime)<=FADE_LEAD&&(vid.duration-vid.currentTime)>0){fadingOut=true;fadeTo(0,FADE_MS);}});
  vid.addEventListener('ended',()=>{vid.style.opacity=0;setTimeout(()=>{vid.currentTime=0;vid.play().catch(()=>{});fadingOut=false;fadeTo(1,FADE_MS);},100);});
}

/* ── SCROLL REVEAL ─────────────────────── */
const rvEls=document.querySelectorAll('.rv');
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('on');}),{threshold:.07,rootMargin:'0px 0px -25px 0px'});
rvEls.forEach(el=>io.observe(el));

/* ── PARALLAX CAPAS ────────────────────── */
const capasEl=document.getElementById('capasImg');
window.addEventListener('scroll',()=>{
  if(!capasEl)return;
  const r=capasEl.getBoundingClientRect(),vh=window.innerHeight;
  if(r.top<vh&&r.bottom>0){const p=(vh-r.top)/(vh+r.height);capasEl.style.transform=`scale(${1+p*.05})`;}
},{passive:true});


/* ── HERO PARALLAX ON SCROLL ─────────────────── */
const heroParallaxRoot=document.documentElement;
const heroSection=document.getElementById('hero');
let heroParallaxTick=false;
function updateHeroParallax(){
  heroParallaxTick=false;
  if(!heroSection)return;
  const rect=heroSection.getBoundingClientRect();
  const vh=window.innerHeight||1;
  const raw=Math.min(Math.max((0-rect.top)/(vh*1.25),0),1);
  const videoY=(raw*128).toFixed(2)+'px';
  const posterY=(raw*72).toFixed(2)+'px';
  const mediaY=(raw*28).toFixed(2)+'px';
  const contentY=(raw*-54).toFixed(2)+'px';
  heroParallaxRoot.style.setProperty('--hero-video-y',videoY);
  heroParallaxRoot.style.setProperty('--hero-poster-y',posterY);
  heroParallaxRoot.style.setProperty('--hero-media-y',mediaY);
  heroParallaxRoot.style.setProperty('--hero-content-y',contentY);
  heroParallaxRoot.style.setProperty('--hero-video-scale',(1.02+raw*.035).toFixed(3));
}
function requestHeroParallax(){
  if(heroParallaxTick)return;
  heroParallaxTick=true;
  requestAnimationFrame(updateHeroParallax);
}
window.addEventListener('scroll',requestHeroParallax,{passive:true});
window.addEventListener('resize',requestHeroParallax,{passive:true});
requestHeroParallax();

/* ── NAV SWITCH ────────────────────────── */
const navEl=document.getElementById('nav');
window.addEventListener('scroll',()=>navEl.classList.toggle('light',window.scrollY>window.innerHeight*.82),{passive:true});

/* ── DUST PARTICLES ────────────────────── */
const dustEl=document.getElementById('dust');
for(let i=0;i<28;i++){
  const p=document.createElement('div');p.className='particle';
  const s=Math.random()*2.5+1;
  p.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;bottom:0;animation-duration:${Math.random()*16+14}s;animation-delay:${Math.random()*-20}s;opacity:${Math.random()*.5+.2}`;
  dustEl.appendChild(p);
}

/* ── SLIDER ────────────────────────────── */
function buildSlider(){
  const d=window.__D__;
  const slides=[
    {img:d.al1,coord:"ENTRADA-07 · 34°36'S",quote:'"Descubrí que restaurar no era reparar."',name:'Sofía Aramburu',loc:'Buenos Aires · Cartografía de la Forma',feat:true},
    {img:d.al2,coord:"ENTRADA-12",name:'Martín F.',loc:'Córdoba'},
    {img:d.al3,coord:"ENTRADA-18",name:'Laura G.',loc:'Rosario'},
    {img:d.al4,coord:"ENTRADA-23",name:'Diego M.',loc:'Montevideo'},
    {img:d.al5,coord:"ENTRADA-29",name:'Ana P.',loc:'Santiago'},
    {img:d.al6,coord:"ENTRADA-31",name:'Carolina V.',loc:'Buenos Aires · El Atlas Personal'},
    {img:d.al7,coord:"ENTRADA-34",name:'Tomás R.',loc:'Lima'},
  ];
  const track=document.getElementById('sliderTrack');
  // Duplicate for seamless loop
  const allSlides=[...slides,...slides];
  allSlides.forEach(s=>{
    const div=document.createElement('div');
    div.className='slide'+(s.feat?' feat':'');
    const img=document.createElement('img');
    if(s.img)img.src=s.img;
    img.alt=s.name||'';
    const ov=document.createElement('div');ov.className='slide-ov';
    const coord=document.createElement('div');coord.className='slide-coord';coord.textContent=s.coord||'';
    const info=document.createElement('div');info.className='slide-info';
    let html='';
    if(s.quote)html+=`<div class="slide-quote">${s.quote}</div>`;
    html+=`<div class="slide-name">${s.name}</div><div class="slide-loc">${s.loc}</div>`;
    info.innerHTML=html;
    div.append(img,ov,coord,info);
    track.appendChild(div);
  });

  // Pause/resume on hover handled by CSS (animation-play-state)
  // Manual drag scroll
  let isDown=false,startX,scrollLeft,animPaused=false;
  track.addEventListener('mousedown',e=>{isDown=true;startX=e.pageX-track.offsetLeft;scrollLeft=track.scrollLeft;track.style.animationPlayState='paused';});
  document.addEventListener('mouseup',()=>{isDown=false;});
  track.addEventListener('mousemove',e=>{if(!isDown)return;e.preventDefault();const x=e.pageX-track.offsetLeft;const walk=(x-startX)*2;track.scrollLeft=scrollLeft-walk;});

  // Buttons just nudge animation speed temporarily
  const prev=document.getElementById('slPrev');
  const next=document.getElementById('slNext');
  let nudgeTimer=null;
  function nudge(dir){
    track.style.animationPlayState='paused';
    const current=parseInt(track.style.transform?.match(/translateX\((-?\d+)/)?.[1]||'0');
    track.style.transition='transform .6s cubic-bezier(.16,1,.3,1)';
    track.style.animationName='none';
    const newX=current+(dir*356);
    track.style.transform=`translateX(${newX}px)`;
    clearTimeout(nudgeTimer);
    nudgeTimer=setTimeout(()=>{track.style.transition='';track.style.animationName='';track.style.transform='';track.style.animationPlayState='running';},800);
  }
  if(prev)prev.addEventListener('click',()=>nudge(1));
  if(next)next.addEventListener('click',()=>nudge(-1));
}

/* ── INJECT IMAGES ─────────────────────── */
function initImages(){
  const d=window.__D__;
  const set=(id,key)=>{const el=document.getElementById(id);if(el&&d[key])el.src=d[key];};
  set('heroPoster','hero');
  set('rutasBRA','bra01');set('rutasSU','su02');set('rutasDI','di03');
  set('capasImg','capas');
  set('h1','h1');set('h2','h2');set('h3','h3');set('h4','h4');
  set('cursosImg','cursos');
  set('terCard01','card01');set('terCard02','card02');set('terCard03','card03');
  const vid=document.getElementById('heroVid');
  if(d.heroVid)setupVideo(vid,d.heroVid);
  buildSlider();
}
initImages();

/* ── PIXEL REVEAL (rutas triptych) ───────────── */
(function(){
  const COLS=6,ROWS=4;

  function buildGrid(panel){
    const grid=panel.querySelector('.rut-pixel-grid');
    if(!grid||grid.childElementCount)return;
    for(let i=0;i<ROWS*COLS;i++){
      const c=document.createElement('div');
      c.className='rut-px-cell';
      grid.appendChild(c);
    }
  }

  function reveal(panel){
    if(panel.classList.contains('pix-done'))return;
    panel.classList.add('pix-done');
    const cells=Array.from(panel.querySelectorAll('.rut-px-cell'));
    // shuffle for random dissolve
    cells.sort(()=>Math.random()-.5);
    cells.forEach((c,i)=>{
      setTimeout(()=>c.classList.add('gone'), i*38+80);
    });
  }

  document.querySelectorAll('.rut-panel').forEach(panel=>{
    buildGrid(panel);
    const img=panel.querySelector('.rut-img');
    const io=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting)return;
      io.disconnect();
      const fire=()=>reveal(panel);
      if(img&&img.complete&&img.naturalWidth)fire();
      else if(img)img.addEventListener('load',fire,{once:true});
      else fire();
    },{threshold:.2});
    io.observe(panel);
  });
})();

/* ── BLOB CARD SLIDER ─────────────────────────── */
(function(){
  const track=document.getElementById('terBlobTrack');
  if(!track)return;

  function cardStep(){
    const outer=track.querySelector('.ter-blob-outer');
    return outer?(outer.offsetWidth+parseInt(getComputedStyle(track).gap)||32):332;
  }

  document.getElementById('terPrev')?.addEventListener('click',()=>{
    track.scrollBy({left:-cardStep(),behavior:'smooth'});
  });
  document.getElementById('terNext')?.addEventListener('click',()=>{
    track.scrollBy({left:cardStep(),behavior:'smooth'});
  });

  /* drag to scroll */
  let drag=false,startX=0,sl=0;
  track.addEventListener('mousedown',e=>{drag=true;startX=e.pageX-track.offsetLeft;sl=track.scrollLeft;track.style.cursor='grabbing';});
  track.addEventListener('mousemove',e=>{if(!drag)return;e.preventDefault();track.scrollLeft=sl-(e.pageX-track.offsetLeft-startX);});
  ['mouseup','mouseleave'].forEach(ev=>track.addEventListener(ev,()=>{drag=false;track.style.cursor='grab';}));
})();


/* ── CURSOS PARALLAX ───────────────────── */
(function(){
  const curLib=document.querySelector('.cur-lib');
  const curCourseList=document.querySelector('.course-list');
  const curSection=document.getElementById('cursos');
  let curTick=false;
  function updateCursosParallax(){
    curTick=false;
    if(!curSection)return;
    const r=curSection.getBoundingClientRect();
    const vh=window.innerHeight;
    if(r.top<vh&&r.bottom>0){
      const p=(vh-r.top)/(vh+r.height);
      const offset=+(p*60-30).toFixed(2);
      if(curLib)curLib.style.transform=`translateY(${-offset*.7}px)`;
      if(curCourseList)curCourseList.style.transform=`translateY(${offset*.45}px)`;
    }
  }
  window.addEventListener('scroll',()=>{if(!curTick){curTick=true;requestAnimationFrame(updateCursosParallax);}},{passive:true});
  updateCursosParallax();
})();

/* ── COURSE CLICK HIGHLIGHT ────────────── */
document.querySelectorAll('.course').forEach(c=>{
  c.addEventListener('click',()=>{
    c.classList.add('acid-click');
    setTimeout(()=>c.classList.remove('acid-click'),420);
  });
});

/* ── LOADER DISMISS ────────────────────── */
const loader=document.getElementById('loader');
function dismissLoader(){
  loader.classList.add('hidden');
  setTimeout(()=>loader.style.display='none',900);
}
// Dismiss after images settle or 2.5s max
let loaderDone=false;
function tryDismiss(){if(loaderDone)return;loaderDone=true;dismissLoader();}
window.addEventListener('load',()=>setTimeout(tryDismiss,400));
setTimeout(tryDismiss,2500);
/* ── RUTAS DOTTED MAP ─────────────────────────── */
(async function(){
  const el=document.getElementById('rutasMap');
  if(!el)return;
  try{
    const{default:DM}=await import('https://esm.sh/dotted-map@2');
    const map=new DM({height:70,grid:'diagonal'});

    /* ── Highlight country territories with acid pins ── */
    // Brazil — scatter pins across territory
    const bra=[
      [-5,-60],[-10,-55],[-15,-52],[-20,-47],[-25,-52],[-30,-53],
      [-3,-43],[-8,-38],[-12,-48],[-2,-60],[-20,-56],[-28,-49]
    ];
    bra.forEach(([lat,lng])=>map.addPin({lat,lng,svgOptions:{color:'#c7ff4d',radius:.38}}));

    // Sweden — elongated strip north-south
    const swe=[
      [56,13],[58,15],[60,16],[62,16],[64,18],[66,20],[68,20]
    ];
    swe.forEach(([lat,lng])=>map.addPin({lat,lng,svgOptions:{color:'#c7ff4d',radius:.38}}));

    // Denmark — Jutland peninsula + islands
    const dnk=[
      [55.5,9.5],[56,9],[56.5,10],[57,10],[55,12],[55,15]
    ];
    dnk.forEach(([lat,lng])=>map.addPin({lat,lng,svgOptions:{color:'#c7ff4d',radius:.38}}));

    /* ── Main markers (larger) ── */
    map.addPin({lat:-14.2,lng:-51.9,svgOptions:{color:'#A66A44',radius:.65}});  // Brazil
    map.addPin({lat:62.0, lng:16.0, svgOptions:{color:'#A66A44',radius:.65}});  // Sweden
    map.addPin({lat:56.0, lng:10.0, svgOptions:{color:'#A66A44',radius:.65}});  // Denmark

    const svg=map.getSVG({
      radius:.2,
      color:'rgba(166,106,68,.16)',
      shape:'circle',
      backgroundColor:'transparent'
    });
    el.innerHTML=svg;
    const s=el.querySelector('svg');
    if(s){s.setAttribute('preserveAspectRatio','xMidYMid slice');}

    /* ── Map hotspot overlays ─────────────────────── */
    const MHS=[
      {pct:[35,68],label:'23°S · Brasil',name:'Fluidez',
       desc:'Curvas orgánicas, libertad formal, materiales cálidos. La forma como movimiento vivo — el mueble como organismo que respira y guarda memoria de quién lo habitó.',
       tags:['Expresividad','Materialidad cálida','Forma orgánica']},
      {pct:[54,14],label:'59°N · Suecia',name:'Claridad',
       desc:'Líneas limpias, geometría depurada, vacío como decisión de diseño. Lo que no está también comunica: la síntesis escandinava como idioma del rigor y la elegancia desnuda.',
       tags:['Geometría funcional','Síntesis','Vacío como forma']},
      {pct:[53,22],label:'55°N · Dinamarca',name:'Materialidad',
       desc:'Uniones visibles, detalle constructivo, refinamiento artesanal. Cada ensamble es una firma — la arqueología del objeto revela quién lo construyó y cómo pensaba el mundo.',
       tags:['Craft','Ensambles','Precisión constructiva']},
    ];
    MHS.forEach(h=>{
      const w=document.createElement('div');
      w.className='map-hs';
      w.style.cssText=`left:${h.pct[0]}%;top:${h.pct[1]}%`;
      w.innerHTML=`<div class="map-hs-dot"></div><div class="map-hs-card"><div class="map-hs-label">${h.label}</div><div class="map-hs-name">${h.name}</div><div class="map-hs-desc">${h.desc}</div><div class="map-hs-tags">${h.tags.map(t=>`<span class="map-hs-tag">${t}</span>`).join('')}</div></div>`;
      el.appendChild(w);
    });
  }catch(e){console.warn('dotted-map CDN unavailable',e);}
})();

/* ── HOTSPOT TAP — mobile touch ───────────────── */
(function(){
  if(window.matchMedia('(hover:none)').matches){
    const allHS=()=>document.querySelectorAll('.hotspot,.map-hs');
    document.querySelectorAll('.hotspot').forEach(hs=>{
      hs.addEventListener('click',e=>{
        e.stopPropagation();
        const wasActive=hs.classList.contains('active');
        allHS().forEach(h=>h.classList.remove('active'));
        if(!wasActive)hs.classList.add('active');
      });
    });
    /* map-hs tap — injected async, so delegate via #rutasMap */
    const rm=document.getElementById('rutasMap');
    if(rm){
      rm.addEventListener('click',e=>{
        const mh=e.target.closest('.map-hs');
        if(!mh)return;
        e.stopPropagation();
        const wasActive=mh.classList.contains('active');
        allHS().forEach(h=>h.classList.remove('active'));
        if(!wasActive)mh.classList.add('active');
      });
    }
    document.addEventListener('click',()=>{
      allHS().forEach(h=>h.classList.remove('active'));
    });
  }
})();
