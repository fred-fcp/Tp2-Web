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
  const mobile=window.innerWidth<=768;
  let raf=null,fadingOut=false;
  vid.src=src;
  if(mobile){
    vid.style.opacity=1;
    vid.muted=true;
    vid.load();
    const tryPlay=()=>vid.play().catch(()=>{});
    vid.addEventListener('canplay',tryPlay,{once:true});
    setTimeout(tryPlay,500);
    return;
  }
  vid.style.opacity=0;
  vid.loop=true;
  vid.addEventListener('loadeddata',()=>{
    vid.classList.add('rdy');
    vid.play().catch(()=>{});
    vid.style.transition='opacity 1.2s ease';
    vid.style.opacity=1;
  });
}

/* ── HERO CTA SMOOTH SCROLL ──────────── */
document.addEventListener('click',e=>{
  const btn=e.target.closest('.h-ctas a[href^="#"]');
  if(!btn)return;
  e.preventDefault();
  const target=document.getElementById(btn.getAttribute('href').slice(1));
  if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
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
  if(window.innerWidth<=768){
    heroParallaxRoot.style.setProperty('--hero-video-scale','1');
    heroParallaxRoot.style.setProperty('--hero-video-y','0px');
    return;
  }
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
  heroParallaxRoot.style.setProperty('--hero-video-scale',(1.25+raw*.035).toFixed(3));
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
function spawnDust(el,count){
  for(let i=0;i<count;i++){
    const p=document.createElement('div');p.className='particle';
    const s=Math.random()*2.5+1;
    p.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;bottom:0;animation-duration:${Math.random()*16+14}s;animation-delay:${Math.random()*-20}s;opacity:${Math.random()*.5+.2}`;
    el.appendChild(p);
  }
}
const dustEl=document.getElementById('dust');
if(dustEl) spawnDust(dustEl,28);
const nlDust=document.getElementById('nl-dust');
if(nlDust){
  for(let i=0;i<45;i++){
    const p=document.createElement('div');p.className='particle';
    const s=Math.random()*4+1.5;
    p.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;bottom:0;animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*-20}s;opacity:${Math.random()*.5+.4}`;
    nlDust.appendChild(p);
  }
}

/* ── SLIDER ────────────────────────────── */
function buildSlider(){
  const d=window.__D__;
  const slides=[
    {img:d.al1,avatar:'assets/alexis-aramburu.jpg',coord:"Alexis Aramburu",quote:'"Descubrí que restaurar no era reparar."',name:'Alexis Aramburu',loc:'Buenos Aires · Cartografía de la Forma',feat:true},
    {img:d.al2,avatar:'assets/morgan-f.jpg',coord:"Morgan F.",quote:'"Cada pieza me enseñó algo que ningún libro pudo."',name:'Morgan F.',loc:'Córdoba'},
    {img:d.al3,avatar:'assets/sasha-g.jpg',coord:"Sasha G.",quote:'"Aprendí a leer un mueble como si fuera un texto."',name:'Sasha G.',loc:'Rosario'},
    {img:d.al4,avatar:'assets/river-m.jpg',coord:"River M.",quote:'"El método me dio un lenguaje que antes no tenía."',name:'River M.',loc:'Montevideo'},
    {img:d.al5,avatar:'assets/sage-p.jpg',coord:"Sage P.",quote:'"Transformé mi taller y mi manera de ver los objetos."',name:'Sage P.',loc:'Santiago'},
    {img:d.al6,avatar:'assets/quinn-v.jpg',coord:"Quinn V.",quote:'"No vine a aprender un oficio. Vine a encontrar uno."',name:'Quinn V.',loc:'Buenos Aires · El Atlas Personal'},
    {img:d.al7,avatar:'assets/avery-r.jpg',coord:"Avery R.",quote:'"Lo que parecía roto tenía más historia que lo nuevo."',name:'Avery R.',loc:'Lima'},
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
  const capasEl=document.getElementById('capasImg');
  function loadCapasImg(){
    const src=window.innerWidth<=768&&d.capasMobile?d.capasMobile:d.capas;
    if(capasEl&&capasEl.src!==new URL(src,location.href).href)capasEl.src=src;
  }
  loadCapasImg();
  set('h1','h1');set('h2','h2');set('h3','h3');set('h4','h4');
  set('cursosImg','cursos');
  set('terCard01','card01');set('terCard02','card02');set('terCard03','card03');
  const vid=document.getElementById('heroVid');
  function loadHeroVideo(){
    const isMobile=window.innerWidth<=768;
    const mobileSrc='assets/herovid_mobile.mp4';
    const desktopSrc=d.heroVid||'assets/heroVid.mp4';
    const src=isMobile?(d.heroVidMobile||mobileSrc):desktopSrc;
    if(src&&vid.dataset.loadedSrc!==src){
      vid.dataset.loadedSrc=src;
      setupVideo(vid,src);
    }
  }
  loadHeroVideo();
  let resizeTimer;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{loadHeroVideo();loadCapasImg();},200);
  },{passive:true});
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
    'hero':          'assets/white logo.png',
    'rutas':         'assets/acid logo.png',
    'capas':         'assets/white logo.png',
    'hallazgos':     'assets/black logo.png',
    'comunidad':     'assets/white logo.png',
    'cursos':        'assets/acid logo.png',
    'capsula':       'assets/white logo.png',
    'aprender-leer': 'assets/white logo.png',
    'atlas-mental':  'assets/white logo.png',
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
  const capsula=document.getElementById('capsula');
  if(capsula)io.observe(capsula);
})();

/* ── HALLAZGOS MOBILE ─────────────── */
(function(){
  const finds = Array.from(document.querySelectorAll('.hall-find-1, .hall-find-2'));
  if(!finds.length) return;

  // Store original positions of find-caps for desktop restore
  const capData = finds.map(find => {
    const cap = find.querySelector('.find-cap');
    return { find, cap, origParent: cap ? cap.parentElement : null };
  });

  let mobileOn = false;
  const playBtns = [];

  function makeSvg(playing){
    return playing
      ? `<svg viewBox="0 0 40 40" width="40" height="40" fill="none"><circle cx="20" cy="20" r="19" fill="rgba(0,0,0,.5)" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/><rect x="13" y="12" width="5" height="16" rx="2" fill="#fff"/><rect x="22" y="12" width="5" height="16" rx="2" fill="#fff"/></svg>`
      : `<svg viewBox="0 0 40 40" width="40" height="40" fill="none"><circle cx="20" cy="20" r="19" fill="rgba(0,0,0,.5)" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/><polygon points="15,11 32,20 15,29" fill="#fff"/></svg>`;
  }

  function initMobile(){
    capData.forEach(({ find, cap, origParent }) => {
      // Move cap outside: insert after find element
      if(cap && origParent) find.after(cap);

      // Add play/pause button
      const vid = find.querySelector('.hall-vid');
      const img = find.querySelector('img');
      const btn = document.createElement('button');
      btn.className = 'hall-play-btn';
      btn.setAttribute('aria-label', 'Reproducir');
      btn.innerHTML = makeSvg(false);
      find.appendChild(btn);
      playBtns.push(btn);

      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if(!vid) return;
        if(vid.paused){
          vid.play().catch(()=>{});
          if(vid) vid.style.opacity = '1';
          if(img) img.style.opacity = '0';
          btn.innerHTML = makeSvg(true);
        } else {
          vid.pause();
          if(vid) vid.style.opacity = '0';
          if(img) img.style.opacity = '1';
          btn.innerHTML = makeSvg(false);
        }
      });
    });

    mobileOn = true;
  }

  function destroyMobile(){
    // Restore caps inside their original parents
    capData.forEach(({ find, cap, origParent }) => {
      if(cap && origParent && cap.parentElement !== origParent) origParent.appendChild(cap);
      const vid = find.querySelector('.hall-vid');
      const img = find.querySelector('img');
      if(vid){ vid.pause(); vid.style.opacity = ''; }
      if(img) img.style.opacity = '';
    });
    playBtns.forEach(b => b.remove());
    playBtns.length = 0;
    mobileOn = false;
  }

  function setup(){
    if(window.innerWidth <= 768){ if(!mobileOn) initMobile(); }
    else { if(mobileOn) destroyMobile(); }
  }

  setup();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(setup, 200); }, { passive: true });

  document.addEventListener('DOMContentLoaded', ()=>{});
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

/* ── CURSOS · PARTÍCULAS ─────── */
(function(){
  const canvas = document.getElementById('xctParticles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize(){
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function rand(a,b){ return a + Math.random()*(b-a); }

  function createParticles(){
    particles = [];
    const count = Math.floor(W * H / 14000);
    for(let i=0;i<count;i++){
      const depth = rand(0.1, 1);       // profundidad: lejano=pequeño/opaco
      particles.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.4, 2) * depth,
        opacity: rand(0.04, 0.18) * depth,
        speedX: rand(-0.08, 0.08) * (1 - depth * 0.5),
        speedY: rand(-0.12, -0.03) * (1 - depth * 0.4),
        depth
      });
    }
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(199,255,77,${p.opacity})`;
      ctx.fill();

      p.x += p.speedX;
      p.y += p.speedY;

      if(p.y < -4) p.y = H + 4;
      if(p.x < -4) p.x = W + 4;
      if(p.x > W + 4) p.x = -4;
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  const ro = new ResizeObserver(() => { resize(); createParticles(); });
  ro.observe(canvas.parentElement);
})();

/* ── HALLAZGOS · VIDEO SWAP ─────── */
(function(){
  const row = document.getElementById('hallRow1');
  const f1  = row && row.querySelector('.hall-find-1');
  const f2  = row && row.querySelector('.hall-find-2');
  if(!row || !f1 || !f2) return;
  const v1  = f1.querySelector('.hall-vid');
  const v2  = f2.querySelector('.hall-vid');

  function playVid(v){ if(v){ v.currentTime=0; v.play().catch(()=>{}); } }
  function stopVid(v){ if(v){ v.pause(); v.currentTime=0; } }

  let t1, t2;
  f1.addEventListener('mouseenter', ()=>{ clearTimeout(t1); playVid(v1); f1.classList.add('cap-active'); });
  f1.addEventListener('mouseleave', ()=>{ stopVid(v1); t1=setTimeout(()=>f1.classList.remove('cap-active'), 100); });

  f2.addEventListener('mouseenter', ()=>{ clearTimeout(t2); playVid(v2); f2.classList.add('cap-active'); row.classList.add('swapped'); });
  f2.addEventListener('mouseleave', ()=>{ stopVid(v2); t2=setTimeout(()=>{ f2.classList.remove('cap-active'); row.classList.remove('swapped'); }, 100); });
})();

/* ── CURSOS · CAROUSEL ─────── */
(function(){
  const track   = document.querySelector('.xct-content');
  const items   = document.querySelectorAll('.xct-item');
  const dotsWrap= document.querySelector('.xct-dots');
  const prevBtn = document.querySelector('.xct-prev');
  const nextBtn = document.querySelector('.xct-next');
  if(!track || !items.length) return;

  let current = 0;
  const total  = items.length;

  /* Dots */
  const dots = Array.from({length:total}, (_,i) => {
    const d = document.createElement('span');
    d.className = 'xct-dot' + (i===0?' active':'');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
    return d;
  });

  function getItemWidth(){
    return items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
  }

  function setFocus(idx){
    const mobile = window.innerWidth <= 768;
    items.forEach((item,i) => {
      const vid = item.querySelector('.xct-vid');
      const avatar = item.querySelector('.xct-avatar');
      const cta = item.querySelector('.xct-cta-preview');
      const active = i === idx;
      item.classList.toggle('xct-focused', active);
      item.classList.toggle('is-active', active);
      item.classList.toggle('is-playing', active);
      if(vid){
        if(active) vid.play().catch(()=>{});
        else { vid.pause(); vid.currentTime = 0; }
      }
      if(mobile){
        if(avatar) avatar.style.opacity = active ? '1' : '0.35';
        if(cta){ cta.style.opacity = active ? '1' : '0.3'; cta.style.pointerEvents = active ? 'auto' : 'none'; }
      } else {
        if(avatar){ avatar.style.opacity = ''; }
        if(cta){ cta.style.opacity = ''; cta.style.pointerEvents = ''; }
      }
    });
    dots.forEach((d,i) => d.classList.toggle('active', i===idx));
  }

  function goTo(idx){
    current = Math.max(0, Math.min(idx, total-1));
    const itemW  = getItemWidth();
    const offset = current * itemW;
    track.style.transform = `translateX(-${offset}px)`;
    setFocus(current);
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));

  /* Hover mantiene foco visual */
  items.forEach((item,i) => {
    item.addEventListener('mouseenter', () => goTo(i));
  });

  /* Animación de entrada */
  function initXctAnim(){
    if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined'){
      setTimeout(initXctAnim, 150); return;
    }
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.xct-hero > *', {
      opacity:0, y:28, duration:1, ease:'power2.out', stagger:.14,
      scrollTrigger:{ trigger:'.xct-hero', start:'top 82%' }
    });
  }
  if(document.readyState === 'complete') initXctAnim();
  else window.addEventListener('load', initXctAnim);

  /* Init */
  goTo(0);
  window.addEventListener('resize', () => {
    if(window.innerWidth<=768) initMobileScroll();
    else goTo(current);
  });

  /* ── MOBILE: scroll-based active card ── */
  let mobileObserver = null;
  function initMobileScroll(){
    if(mobileObserver) mobileObserver.disconnect();
    // reset carousel transform
    track.style.transform = 'none';
    mobileObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const idx = [...items].indexOf(entry.target);
          setFocus(idx);
        }
      });
    },{threshold:0.55});
    items.forEach(item => mobileObserver.observe(item));
  }

  if(window.innerWidth<=768) initMobileScroll();
})();

/* ── COMUNIDAD SLIDER DOTS ── */
(function(){
  const dots = Array.from(document.querySelectorAll('.slider-dot'));
  const track = document.getElementById('sliderTrack');
  if(!dots.length || !track) return;

  const TOTAL = 7;
  let activeDot = 0;
  let desktopTimer = null;

  function setDot(i){
    activeDot = ((i % TOTAL) + TOTAL) % TOTAL;
    dots.forEach((d,j) => d.classList.toggle('active', j === activeDot));
  }

  /* ── DESKTOP: timer cycling dots alongside CSS animation ── */
  function startDesktopCycle(){
    clearInterval(desktopTimer);
    desktopTimer = setInterval(() => setDot(activeDot + 1), 35000 / TOTAL);
  }

  /* ── MOBILE: RAF transform-driven infinite scroll ── */
  let offset = 0;       // px scrolled into the track
  let halfW = 0;        // width of one full set (7 slides)
  let slideW = 0;       // width of one slide
  let speed = 0;        // px per tick (0.5s per slide @ ~60fps = slideW/30)
  let paused = false;
  let touchStartX = 0;
  let offsetAtTouch = 0;
  let mobileInited = false;
  let mobileTicker = null;

  function calcSizes(){
    const slide = track.querySelector('.slide');
    const gap = slide ? parseInt(getComputedStyle(track).gap) || 0 : 0;
    slideW = slide ? slide.offsetWidth + gap : window.innerWidth;
    halfW = slideW * TOTAL;
    speed = slideW / 210;
  }

  function syncDot(){
    setDot(Math.floor(((offset % halfW) + halfW) % halfW / slideW));
  }

  function stopMobileTicker(){
    if(mobileTicker){ clearInterval(mobileTicker); mobileTicker = null; }
  }

  function initMobile(){
    stopMobileTicker();
    calcSizes();
    offset = 0;
    paused = false;
    track.style.transform = 'translateX(0px)';

    if(!mobileInited){
      mobileInited = true;

      track.addEventListener('touchstart', e => {
        paused = true;
        touchStartX = e.touches[0].clientX;
        offsetAtTouch = offset;
      }, { passive: true });

      track.addEventListener('touchmove', e => {
        const dx = touchStartX - e.touches[0].clientX;
        offset = ((offsetAtTouch + dx) % halfW + halfW) % halfW;
        track.style.transform = `translateX(-${offset}px)`;
        syncDot();
      }, { passive: true });

      track.addEventListener('touchend', () => {
        const nearest = Math.round(offset / slideW);
        offset = ((nearest * slideW) % halfW + halfW) % halfW;
        track.style.transform = `translateX(-${offset}px)`;
        syncDot();
        paused = false;
      }, { passive: true });

      dots.forEach((dot, i) => {
        dot.style.cursor = 'pointer';
        dot.addEventListener('click', () => {
          offset = i * slideW;
          track.style.transform = `translateX(-${offset}px)`;
          syncDot();
        });
      });
    }

    mobileTicker = setInterval(() => {
      if(paused) return;
      offset += speed;
      if(offset >= halfW) offset -= halfW;
      track.style.transform = `translateX(-${offset}px)`;
      syncDot();
    }, 16);
  }

  function initDesktop(){
    stopMobileTicker();
    track.style.transform = '';
    clearInterval(desktopTimer);
    setDot(0);
    startDesktopCycle();
  }

  function setup(){
    clearInterval(desktopTimer);
    if(window.innerWidth <= 768) initMobile();
    else initDesktop();
  }

  setup();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(setup, 200); }, { passive: true });
})();

/* ── CARDS CAROUSEL DOTS ── */
(function(){
  const grid = document.querySelector('.xct-cards-grid');
  const dots = document.querySelectorAll('.xct-cards-dot');
  if(!grid || !dots.length) return;
  const cards = grid.querySelectorAll('.xct-card');

  function getCardStep(){
    return cards[0] ? cards[0].offsetWidth + parseInt(getComputedStyle(grid).gap) : 1;
  }

  function updateCardActive(){
    const mobile = window.innerWidth <= 768;
    const idx = mobile ? Math.round(grid.scrollLeft / getCardStep()) : -1;
    dots.forEach((d,i) => d.classList.toggle('active', i === idx));
    cards.forEach((c,i) => {
      c.classList.toggle('is-active', mobile && i === idx);
      c.style.borderColor = (mobile && i === idx) ? 'var(--acid)' : '';
    });
  }

  grid.addEventListener('scroll', updateCardActive, {passive:true});
  updateCardActive();

  dots.forEach((dot,i) => {
    dot.style.cursor = 'pointer';
    dot.addEventListener('click', () => {
      grid.scrollTo({left: i * getCardStep(), behavior:'smooth'});
    });
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateCardActive, 200);
  }, {passive:true});
  window.addEventListener('resize', () => {
    const show = window.innerWidth <= 768;
    const dotsWrap = document.querySelector('.xct-cards-dots');
    if(dotsWrap) dotsWrap.style.display = show ? 'flex' : 'none';
  });
})();

/* ── OLD CAROUSEL (inactivo — HTML eliminado) ── */
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
        const nxt = (current + 1) % TOTAL;
        if(!cards[nxt].classList.contains('card-next')) setNext(nxt);
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

/* ── OLD CARD CAROUSEL (disabled) ── */
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

/* ── WORD SWAP SCROLL EFFECT ────────────────── */
(function(){
  const section = document.getElementById('rutas');
  if(!section) return;
  const swaps = section.querySelectorAll('.word-swap');
  if(!swaps.length) return;

  function update(){
    const rect = section.getBoundingClientRect();
    const vh   = window.innerHeight;
    const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.55)));

    swaps.forEach(ws => {
      const oldW = ws.querySelector('.old-word');
      const newW = ws.querySelector('.new-word');
      if(!oldW || !newW) return;
      const h = oldW.offsetHeight;
      ws.style.width  = Math.max(oldW.offsetWidth, newW.offsetWidth) + 'px';
      oldW.style.transform = `translateY(${-progress * h}px)`;
      oldW.style.opacity   = String(1 - progress * 1.8);
      newW.style.transform = `translateY(${h - progress * h}px)`;
    });
  }

  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update, {passive:true});
  update();
})();

/* ── ARCHIVO BOOKS TAP (mobile) ─────────────── */
(function(){
  if(window.matchMedia('(hover:hover)').matches) return;
  document.querySelectorAll('.archivo-book').forEach(book => {
    book.addEventListener('click', function(e){
      const isOpen = this.classList.contains('open');
      document.querySelectorAll('.archivo-book.open').forEach(b => b.classList.remove('open'));
      if(!isOpen) this.classList.add('open');
    });
  });
})();

/* ── COMPASS PIN ────────────────────────────── */
(function(){
  const wrap = document.getElementById('compass-wrap');
  const img  = document.getElementById('compass-img');
  const text = document.getElementById('compass-text');
  if(!wrap || !img) return;

  img.style.willChange = 'transform';

  let target = 0, current = 0, rafId = null;
  const EASE = 0.07; // inercia similar a scrub:1.5

  function getProgress(){
    const rect    = wrap.getBoundingClientRect();
    const travelH = wrap.offsetHeight - window.innerHeight;
    if(travelH <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / travelH));
  }

  function tick(){
    current += (target - current) * EASE;
    const diff = Math.abs(target - current);

    img.style.transform = `rotate(${current * 720}deg)`;

    if(text){
      const pt = Math.max(0, Math.min(1, current / 0.4));
      text.style.opacity   = pt;
      text.style.transform = `translateX(${(1 - pt) * 40}px)`;
    }

    if(diff > 0.0001) rafId = requestAnimationFrame(tick);
    else rafId = null;
  }

  function onScroll(){
    target = getProgress();
    if(!rafId) rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
