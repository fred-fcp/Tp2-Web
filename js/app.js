/* ── PARALLAX BACKGROUND ─────────────────── */
(function(){
  const bg=document.getElementById('bg-parallax');
  const capas=document.getElementById('capas');
  if(!bg)return;
  /* scroll parallax — image drifts at 20% of scroll speed */
  let ticking=false;
  function onScroll(){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{
      bg.style.transform=`translateY(${window.scrollY*0.2}px)`;
      ticking=false;
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  /* fade out bg gradually as #capas scrolls in */
  if(capas){
    bg.style.transition='opacity .6s ease';
    window.addEventListener('scroll',()=>{
      const r=capas.getBoundingClientRect();
      const vh=window.innerHeight;
      /* start fading when capas top hits 80% of viewport, fully gone at 20% */
      const raw=Math.min(Math.max((vh*.8-r.top)/(vh*.6),0),1);
      bg.style.opacity=String((1-raw).toFixed(3));
    },{passive:true});
  }
})();

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

/* ── HERO CTA SMOOTH SCROLL ──────────── */
document.querySelectorAll('.h-ctas a[href^="#"]').forEach(btn=>{
  btn.addEventListener('click',e=>{
    e.preventDefault();
    const target=document.getElementById(btn.getAttribute('href').slice(1));
    if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
  });
});

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

/* ── CAPAS VIDEO BG — lazy load + parallax ── */
(function(){
  const sec=document.getElementById('capas');
  const vid=sec?.querySelector('.capas-vid-bg');
  if(!sec||!vid)return;
  let loaded=false,tick=false;
  /* lazy-load src on first intersection */
  new IntersectionObserver(([e])=>{
    if(!e.isIntersecting||loaded)return;
    loaded=true;
    vid.src=vid.dataset.src;
    vid.load();
  },{rootMargin:'200px'}).observe(sec);
  /* parallax: video drifts slower than scroll */
  window.addEventListener('scroll',()=>{
    if(tick)return;tick=true;
    requestAnimationFrame(()=>{
      tick=false;
      const r=sec.getBoundingClientRect(),vh=window.innerHeight;
      if(r.top>vh||r.bottom<0)return;
      const p=(vh-r.top)/(vh+r.height);
      const y=((p-.5)*80).toFixed(2);
      vid.style.transform=`scale(1.18) translateY(${y}px)`;
    });
  },{passive:true});
})();


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

/* ── NAV SWITCH — section-aware ────────── */
const navEl=document.getElementById('nav');
(function(){
  const LIGHT=new Set(['hallazgos']);
  const PHOTO=new Set(['rutas']);
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      navEl.classList.toggle('light',LIGHT.has(e.target.id));
      navEl.classList.toggle('nav-photo',PHOTO.has(e.target.id));
    });
  },{rootMargin:'-35% 0px -35% 0px',threshold:0});
  document.querySelectorAll('section[id]').forEach(s=>io.observe(s));
})();

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
    {img:d.al1,avatar:'assets/alexis-aramburu.jpg',coord:"Alexis Aramburu",quote:'"Descubrí que restaurar no era reparar."',name:'Sofía Aramburu',loc:'Buenos Aires · Cartografía de la Forma',feat:true},
    {img:d.al2,avatar:'assets/morgan-f.jpg',coord:"Morgan F.",name:'Martín F.',loc:'Córdoba'},
    {img:d.al3,avatar:'assets/sasha-g.jpg',coord:"Sasha G.",name:'Laura G.',loc:'Rosario'},
    {img:d.al4,avatar:'assets/river-m.jpg',coord:"River M.",name:'Diego M.',loc:'Montevideo'},
    {img:d.al5,avatar:'assets/sage-p.jpg',coord:"Sage P.",name:'Ana P.',loc:'Santiago'},
    {img:d.al6,avatar:'assets/quinn-v.jpg',coord:"Quinn V.",name:'Carolina V.',loc:'Buenos Aires · El Atlas Personal'},
    {img:d.al7,avatar:'assets/avery-r.jpg',coord:"Avery R.",name:'Tomás R.',loc:'Lima'},
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
    const profile=document.createElement('div');profile.className='slide-profile';
    const avatar=document.createElement('div');avatar.className='slide-avatar';
    const avatarImg=document.createElement('img');avatarImg.src=s.avatar||'';avatarImg.alt=s.name||'';
    avatar.appendChild(avatarImg);
    const coord=document.createElement('div');coord.className='slide-coord';coord.textContent=s.coord||'';
    profile.append(avatar,coord);
    const info=document.createElement('div');info.className='slide-info';
    let html='';
    if(s.quote)html+=`<div class="slide-quote">${s.quote}</div>`;
    html+=`<div class="slide-name">${s.name}</div><div class="slide-loc">${s.loc}</div>`;
    info.innerHTML=html;
    div.append(img,ov,profile,info);
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

/* ── MOBILE NAV DRAWER ─────────────────── */
(function(){
  const burger=document.getElementById('nBurger');
  const drawer=document.getElementById('nDrawer');
  const overlay=document.getElementById('nOverlay');
  const close=document.getElementById('nDrawerClose');
  function open(){drawer.classList.add('open');overlay.classList.add('open');document.body.style.overflow='hidden';}
  function shut(){drawer.classList.remove('open');overlay.classList.remove('open');document.body.style.overflow='';}
  burger?.addEventListener('click',open);
  close?.addEventListener('click',shut);
  overlay?.addEventListener('click',shut);
  drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',shut));
})();

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
/* ── HOTSPOT TAP — mobile touch ───────────────── */
(function(){
  if(window.matchMedia('(hover:none)').matches){
    const allHS=()=>document.querySelectorAll('.hotspot');
    document.querySelectorAll('.hotspot').forEach(hs=>{
      hs.addEventListener('click',e=>{
        e.stopPropagation();
        const wasActive=hs.classList.contains('active');
        allHS().forEach(h=>h.classList.remove('active'));
        if(!wasActive)hs.classList.add('active');
      });
    });
    document.addEventListener('click',()=>{
      allHS().forEach(h=>h.classList.remove('active'));
    });
  }
})();

/* ── LOGO SWAP BY SECTION ──────────────────── */
(function(){
  const logo=document.getElementById('navLogo');
  if(!logo)return;
  const map={
    'hero':       'assets/white logo.png',
    'rutas':      'assets/acid logo.png',
    'capas':      'assets/white logo.png',
    'hallazgos':  'assets/black logo.png',
    'comunidad':  'assets/white logo.png',
    'cursos':     'assets/acid logo.png',
  };
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const src=map[e.target.id];
      if(!src||logo.getAttribute('src')===src)return;
      logo.style.opacity='0';
      setTimeout(()=>{logo.src=src;logo.style.opacity='1';},150);
    });
  },{rootMargin:'-40% 0px -40% 0px',threshold:0});
  document.querySelectorAll('section[id],#hero').forEach(s=>io.observe(s));
})();

/* ── HALLAZGOS FLIP (mobile viewport) ─────────────── */
(function(){
  function initFlip(){
    if(window.innerWidth>768)return;
    document.querySelectorAll('#hallazgos .find').forEach(card=>{
      if(card._flipBound)return;
      card._flipBound=true;
      card.addEventListener('click',function(e){
        if(!this.classList.contains('flipped')){
          e.preventDefault();
          document.querySelectorAll('#hallazgos .find.flipped').forEach(c=>c.classList.remove('flipped'));
          this.classList.add('flipped');
        }
      });
    });
  }
  document.addEventListener('DOMContentLoaded',initFlip);
  window.addEventListener('resize',initFlip);
})();

/* ── PARALLAX DEPTH SHIFT — #rutas ────────────── */
(function(){
  const section   = document.getElementById('rutas');
  if(!section)return;

  const layers = [
    { el: section.querySelector('.rutas-text'),      speed: -0.08 },
    { el: section.querySelector('.rut-wallet-wrap'), speed:  0.12 },
    { el: section.querySelector('.rutas-foot'),      speed: -0.05 },
  ].filter(l => l.el);

  let ticking = false;

  function update(){
    const rect   = section.getBoundingClientRect();
    const vh     = window.innerHeight;
    const center = rect.top + rect.height / 2 - vh / 2;

    layers.forEach(({el, speed}) => {
      el.style.transform = `translateY(${(center * speed).toFixed(2)}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if(ticking)return;
    ticking = true;
    requestAnimationFrame(update);
  }, {passive:true});

  update();
})();

/* ── CARD CAROUSEL CONTROLS ──────────────────── */
(function(){
  const TOTAL = 4;
  const wrap  = document.querySelector('.wrap_card');
  const cards = document.querySelectorAll('.wrap_card .card');
  const dots  = document.querySelectorAll('.card-dot');
  const prev  = document.getElementById('cardPrev');
  const next  = document.getElementById('cardNext');
  if(!cards.length || !prev || !next) return;

  let current = 0;
  let autoTimer = null;

  function setActive(idx){
    cards.forEach((c,i) => c.classList.toggle('card-active', i === idx));
    dots.forEach((d,i) => d.classList.toggle('active', i === idx));
  }

  let rafId = null;
  let activeAt = 0;
  const PER_CARD = 6000;
  const EARLY   = 900;

  function setNext(idx){
    cards.forEach((c,i) => c.classList.toggle('card-next', i === idx));
  }

  function watchAnim(){
    function tick(){
      if(wrap.classList.contains('manual')){ rafId = null; return; }
      const now = performance.now();
      for(let i = 0; i < cards.length; i++){
        const z = parseInt(window.getComputedStyle(cards[i]).zIndex) || 0;
        if(z >= 2 && i !== current){
          current = i;
          activeAt = now;
          setActive(i);
          setNext(-1);
          break;
        }
      }
      if(now - activeAt > PER_CARD - EARLY){
        const next = (current + 1) % TOTAL;
        if(!cards[next].classList.contains('card-next')) setNext(next);
      }
      rafId = requestAnimationFrame(tick);
    }
    if(!rafId) rafId = requestAnimationFrame(tick);
  }

  function stopWatch(){
    if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
  }

  function step(idx){
    current = ((idx % TOTAL) + TOTAL) % TOTAL;
    wrap.classList.add('manual');
    cards.forEach(c => c.setAttribute('data-step', current + 1));
    setActive(current);
  }

  function startAutoSync(){
    wrap.classList.remove('manual');
    cards.forEach(c => c.setAttribute('data-step','1'));
    watchAnim();
  }

  function goTo(idx){
    stopWatch();
    step(idx);
  }

  function resume(){
    stopWatch();
    wrap.classList.remove('manual');
    cards.forEach(c => c.setAttribute('data-step','1'));
    current = 0;
    setActive(0);
  }

  setActive(0);

  const section = document.getElementById('cursos');
  if(section){
    new IntersectionObserver(([e]) => {
      if(e.isIntersecting){
        startAutoSync();
      } else {
        resume();
      }
    }, {threshold: 0.1}).observe(section);
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.idx)));
})();
