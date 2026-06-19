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

/* ── 3D CYLINDER CAROUSEL ──────────────── */
(function(){
  const scene=document.getElementById('terScene');
  if(!scene)return;
  const cards=Array.from(scene.querySelectorAll('.ter-3d-card'));
  const N=cards.length;
  if(!N)return;

  let prog=0;
  const mouse={x:0,y:0,tx:0,ty:0};
  const D=1350,GAP=36,PEEK=-55;
  // Card dimensions — read from CSS custom logic; keep in sync with CSS
  function cardH(){return window.innerWidth<=768?360:440;}

  window.addEventListener('mousemove',e=>{
    mouse.tx=Math.max(-1,Math.min(1,(e.clientX-innerWidth/2)/(innerWidth/2)));
    mouse.ty=Math.max(-1,Math.min(1,(e.clientY-innerHeight/2)/(innerHeight/2)));
  },{passive:true});
  document.addEventListener('mouseleave',()=>{mouse.tx=0;mouse.ty=0;});

  const ss=t=>t*t*(3-2*t);

  function render(){
    prog+=0.0016;
    mouse.x+=(mouse.tx-mouse.x)*0.08;
    mouse.y+=(mouse.ty-mouse.y)*0.08;

    const wrap=scene.closest('.ter-3d-wrap');
    const h=wrap?wrap.offsetHeight:520;
    const CH=cardH();

    const ri=Math.round(prog);
    const diff=prog-ri;
    const ed=Math.sign(diff)*Math.pow(Math.abs(diff)*2,4.2)/2;
    const va=ri+ed;

    cards.forEach((card,i)=>{
      let off=i-va;
      while(off>N/2)off-=N;
      while(off<-N/2)off+=N;
      const abs=Math.abs(off),sgn=Math.sign(off);

      if(abs>2.5){card.style.visibility='hidden';return;}
      card.style.visibility='visible';

      let y=0,z=0,rx=0;
      if(abs<=1){
        const et=ss(abs);
        y=-sgn*et*(CH+GAP);
        z=400+et*(220-400);
        rx=et*132;
      } else {
        const et=ss(Math.min(abs-1,1));
        const zE=-60, sE=D/(D-zE);
        const yE=(h/2-PEEK)/sE-CH/2;
        y=-sgn*((CH+GAP)+et*(yE-(CH+GAP)));
        z=220+et*(zE-220);
        rx=132+et*(175-132);
      }

      const lrx=-sgn*rx;
      const cf=Math.max(0,1-abs);
      card.style.zIndex=Math.round(z+500).toString();
      card.style.transform=`translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${(lrx-mouse.y*12*cf).toFixed(2)}deg) rotateY(${(mouse.x*15*cf).toFixed(2)}deg) rotateZ(-3deg)`;
    });
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();

/* ── INTERACTIVE GRID CANVAS (ter-3d-wrap) ─ */
(function(){
  const canvas=document.getElementById('terGridCanvas');
  if(!canvas)return;
  const wrap=canvas.closest('.ter-3d-wrap');
  const ctx=canvas.getContext('2d');
  const GS=44,TRAIL=5,IDLE_N=4,IDLE_SPEED=0.18;

  function resize(){canvas.width=wrap.offsetWidth;canvas.height=wrap.offsetHeight;}
  resize();
  window.addEventListener('resize',resize,{passive:true});

  let trail=[],lastMouse=Date.now();
  const idleTgt=[],idlePos=[];
  function randCell(){return{x:Math.floor(Math.random()*(canvas.width/GS)),y:Math.floor(Math.random()*(canvas.height/GS))};}
  for(let i=0;i<IDLE_N;i++){idleTgt.push(randCell());idlePos.push({...idleTgt[i]});}

  wrap.addEventListener('mousemove',e=>{
    lastMouse=Date.now();
    const r=wrap.getBoundingClientRect();
    const gx=Math.floor((e.clientX-r.left)/GS),gy=Math.floor((e.clientY-r.top)/GS);
    const last=trail[0];
    if(!last||last.x!==gx||last.y!==gy){trail.unshift({x:gx,y:gy});if(trail.length>TRAIL)trail.pop();}
  },{passive:true});

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Idle wandering
    if(Date.now()-lastMouse>2000){
      idlePos.forEach((pos,i)=>{
        const t=idleTgt[i],dx=t.x-pos.x,dy=t.y-pos.y;
        if(Math.abs(dx)<0.02&&Math.abs(dy)<0.02){idleTgt[i]=randCell();}
        else{pos.x+=dx*IDLE_SPEED;pos.y+=dy*IDLE_SPEED;}
        const rx=Math.round(pos.x),ry=Math.round(pos.y);
        const last=trail[0];
        if(!last||last.x!==rx||last.y!==ry){trail.unshift({x:rx,y:ry});if(trail.length>TRAIL*IDLE_N)trail.pop();}
      });
    }
    // Draw glowing trail cells
    trail.forEach((cell,idx)=>{
      const a=(1-idx/(TRAIL+1))*0.42;
      ctx.fillStyle=`rgba(199,255,77,${a})`;
      ctx.shadowColor=`rgba(199,255,77,${a})`;
      ctx.shadowBlur=22;
      ctx.fillRect(cell.x*GS,cell.y*GS,GS,GS);
    });
    ctx.shadowBlur=0;
    requestAnimationFrame(draw);
  }
  draw();
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