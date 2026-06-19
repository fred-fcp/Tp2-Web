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
  set('rutasImg','rutas');
  set('capasImg','capas');
  set('h1','h1');set('h2','h2');set('h3','h3');set('h4','h4');
  set('cursosImg','cursos');
  set('terCard01','card01');set('terCard02','card02');set('terCard03','card03');
  const vid=document.getElementById('heroVid');
  if(d.heroVid)setupVideo(vid,d.heroVid);
  buildSlider();
}
initImages();

/* ── TERRITORIOS PARALLAX ──────────────── */
(function(){
  const cards=document.querySelectorAll('.ter-card');
  if(!cards.length)return;
  let tick=false;
  const offsets=[0,-18,10];
  function update(){
    tick=false;
    cards.forEach((c,i)=>{
      const r=c.getBoundingClientRect();
      const vh=window.innerHeight;
      if(r.top<vh&&r.bottom>0){
        const p=(vh-r.top)/(vh+r.height);
        const img=c.querySelector('img');
        if(img)img.style.transform=`scale(1.07) translateY(${((p-.5)*offsets[i]||0).toFixed(2)}px)`;
      }
    });
  }
  window.addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(update);}},{passive:true});
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