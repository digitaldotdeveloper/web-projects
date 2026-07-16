/* =====================================================
   EMBER NOIR — script.js
   GSAP + ScrollTrigger + Lenis + canvas ember particles
   ===================================================== */

(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  /* ---------------- PRELOADER ---------------- */
  const preloader = $('#preloader');
  const pctEl     = $('#preloader-pct');
  const barEl     = $('.preloader__bar span');

  function runPreloader(){
    let p = 0;
    const tick = () => {
      p += Math.random() * 7 + 1.5;
      if (p > 100) p = 100;
      pctEl.textContent = String(Math.floor(p)).padStart(2,'0');
      barEl.style.width = p + '%';
      if (p < 100) setTimeout(tick, 60 + Math.random()*100);
      else setTimeout(hidePreloader, 380);
    };
    tick();
  }

  function hidePreloader(){
    preloader.classList.add('is-hidden');
    startIntro();
  }

  /* ---------------- INTRO ANIMATION ---------------- */
  function startIntro(){
    const tl = gsap.timeline({defaults:{ease:'expo.out'}});
    tl.from('.hero__eyebrow .line', {scaleX:0, duration:1.2, transformOrigin:'center', stagger:.05}, 0)
      .from('.hero__eyebrow .kicker', {y:18, opacity:0, duration:1}, .15)
      .from('.hero__title .word', {yPercent:110, opacity:0, duration:1.4, stagger:.13, ease:'expo.out'}, .2)
      .from('.hero__sub', {y:30, opacity:0, duration:1.1}, .9)
      .from('.hero__cta-row .btn', {y:20, opacity:0, duration:.9, stagger:.1}, 1.1)
      .from('.hero__marquee', {y:30, opacity:0, duration:1}, 1.3)
      .from('.hero__scroll', {opacity:0, duration:1}, 1.5)
      .from('.nav', {y:-30, opacity:0, duration:.9}, .1);
  }

  /* ---------------- LENIS SMOOTH SCROLL ---------------- */
  let lenis;
  if (typeof Lenis !== 'undefined'){
    lenis = new Lenis({
      duration: 1.25,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      lerp: .08,
    });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (typeof ScrollTrigger !== 'undefined'){
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------------- NAV SCROLLED STATE ---------------- */
  const navEl = $('.nav');
  const updateNav = () => {
    if (window.scrollY > 60) navEl.classList.add('is-scrolled');
    else navEl.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', updateNav, {passive:true});
  updateNav();

  /* ---------------- EMBER PARTICLES (canvas) ---------------- */
  const cvs = $('#embers');
  const ctx = cvs.getContext('2d');
  let W, H, DPR=Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let glowParticles = [];

  function resizeCanvas(){
    W = window.innerWidth; H = window.innerHeight;
    cvs.width  = W * DPR;
    cvs.height = H * DPR;
    cvs.style.width  = W + 'px';
    cvs.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', () => { resizeCanvas(); seedParticles(); });

  function rand(a,b){ return a + Math.random()*(b-a); }

  function seedParticles(){
    particles = [];
    glowParticles = [];
    const N = Math.floor( (W*H) / 28000 ); // density
    for (let i=0;i<N;i++){
      particles.push(makeEmber());
    }
    for (let i=0;i<Math.max(4, Math.floor(N/12));i++){
      glowParticles.push(makeGlow());
    }
  }

  function makeEmber(){
    return {
      x: rand(0, W),
      y: rand(H, H + 200),
      vx: rand(-0.15, 0.15),
      vy: rand(-1.6, -0.4),
      r: rand(0.6, 2.2),
      life: rand(0, 1),
      maxLife: rand(2.5, 7.5),
      flick: rand(0, Math.PI*2),
      flickSpeed: rand(0.04, 0.12),
      hue: rand(14, 34),
    };
  }
  function makeGlow(){
    return {
      x: rand(0, W),
      y: rand(H*.4, H),
      vx: rand(-0.05, 0.05),
      vy: rand(-0.25, -0.08),
      r: rand(40, 110),
      a: rand(0.025, 0.07),
      life: rand(0, 1),
      maxLife: rand(8, 18),
    };
  }

  function tickParticles(){
    ctx.clearRect(0,0,W,H);

    // soft warm glow blobs
    ctx.globalCompositeOperation = 'lighter';
    for (const g of glowParticles){
      g.x += g.vx; g.y += g.vy;
      g.life += 0.012;
      if (g.life > g.maxLife || g.y < -120){
        Object.assign(g, makeGlow(), {y: H + 30, life:0});
      }
      const fade = Math.sin((g.life/g.maxLife)*Math.PI);
      const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
      grd.addColorStop(0, `rgba(255,140,60,${g.a*fade})`);
      grd.addColorStop(.4, `rgba(255,90,30,${g.a*.5*fade})`);
      grd.addColorStop(1, 'rgba(255,90,30,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI*2);
      ctx.fill();
    }

    // ember sparks
    for (const p of particles){
      p.x += p.vx + Math.sin(p.flick)*0.4;
      p.y += p.vy;
      p.flick += p.flickSpeed;
      p.life += 0.016;

      if (p.life > p.maxLife || p.y < -20){
        Object.assign(p, makeEmber(), {y: H + rand(10, 200), life:0});
      }
      const fade  = Math.sin((p.life/p.maxLife)*Math.PI);
      const flick = (Math.sin(p.flick)*0.5 + 0.5);
      const alpha = (0.45 + flick*0.55) * fade;

      // halo
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*7);
      halo.addColorStop(0, `hsla(${p.hue}, 100%, 60%, ${alpha*0.55})`);
      halo.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r*7, 0, Math.PI*2);
      ctx.fill();

      // core
      ctx.fillStyle = `hsla(${p.hue}, 100%, ${65 + flick*25}%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(tickParticles);
  }

  resizeCanvas();
  seedParticles();
  tickParticles();

  /* ---------------- PARALLAX ---------------- */
  const parallaxItems = $$('[data-parallax]').map(el => ({
    el,
    speed: parseFloat(el.dataset.speed || '0.15'),
  }));

  function updateParallax(){
    const y = window.scrollY;
    for (const p of parallaxItems){
      const rect = p.el.getBoundingClientRect();
      const inView = rect.bottom > -300 && rect.top < window.innerHeight + 300;
      if (!inView) continue;
      const offset = (rect.top + y - window.innerHeight*0.5) * p.speed;
      p.el.style.transform = `translate3d(0, ${-offset}px, 0) scale(1.05)`;
    }
    requestAnimationFrame(updateParallax);
  }
  updateParallax();

  /* ---------------- GSAP ScrollTrigger setup ---------------- */
  if (typeof ScrollTrigger !== 'undefined'){
    gsap.registerPlugin(ScrollTrigger);

    // Manifesto reveal
    gsap.utils.toArray('.manifesto h2 [data-line] > *').forEach((el,i)=>{
      gsap.from(el, {
        y:'120%', duration:1.1, ease:'expo.out', delay:i*0.1,
        scrollTrigger:{trigger:'.manifesto', start:'top 70%'}
      });
    });
    gsap.from('.manifesto .lede, .manifesto p, .manifesto__sig', {
      y:30, opacity:0, duration:1, stagger:.12, ease:'power3.out',
      scrollTrigger:{trigger:'.manifesto', start:'top 60%'}
    });
    gsap.from('.manifesto__visual', {
      yPercent:8, opacity:0, scale:.94, duration:1.4, ease:'expo.out',
      scrollTrigger:{trigger:'.manifesto', start:'top 70%'}
    });

    // tilt on manifesto visual using mouse
    const tiltEl = $('.manifesto__visual');
    if (tiltEl){
      const tiltInner = tiltEl.querySelector('.manifesto__visual-inner');
      tiltEl.addEventListener('mousemove', (e)=>{
        const r = tiltEl.getBoundingClientRect();
        const cx = (e.clientX - r.left)/r.width - .5;
        const cy = (e.clientY - r.top)/r.height - .5;
        gsap.to(tiltEl, {rotateX:-cy*6, rotateY:cx*8, duration:.6, ease:'power2.out', transformPerspective:1200});
        gsap.to(tiltInner, {x:cx*-30, y:cy*-30, duration:.8, ease:'power2.out'});
      });
      tiltEl.addEventListener('mouseleave', ()=>{
        gsap.to(tiltEl, {rotateX:0, rotateY:0, duration:1, ease:'expo.out'});
        gsap.to(tiltInner, {x:0, y:0, duration:1, ease:'expo.out'});
      });
    }

    // COLLECTION — 3D cigar rotation + vintage slides
    const cigarsImg = $('.collection__cigars img');
    if (cigarsImg){
      gsap.fromTo(cigarsImg,
        { rotateY:-25, rotateX:18, rotateZ:0, scale:.9 },
        {
          rotateY:25, rotateX:-12, rotateZ:0, scale:1.05,
          ease:'none',
          scrollTrigger:{
            trigger:'.collection__stage',
            start:'top top',
            end:'bottom bottom',
            scrub:.6,
          }
        }
      );
    }

    const slides = $$('.vintage');
    const dots   = $$('.collection__nav .dot');
    slides.forEach((slide, i) => {
      const enter = i / slides.length;
      const exit  = (i+1) / slides.length;
      ScrollTrigger.create({
        trigger:'.collection__stage',
        start: 'top top',
        end:   'bottom bottom',
        onUpdate: (st) => {
          const p = st.progress;
          let opacity, y;
          if (p >= enter && p <= exit){
            const local = (p - enter) / (exit - enter);
            opacity = Math.sin(local * Math.PI);
            y = (local - .5) * 40;
            dots.forEach((d,di)=> d.classList.toggle('active', di===i));
          } else {
            opacity = 0; y = 30;
          }
          slide.style.opacity = opacity;
          slide.style.transform =
            (slide.dataset.vintage === '2') ? `translateY(calc(-50% + ${y}px))` :
            (slide.dataset.vintage === '3') ? `translate(-50%, calc(-50% + ${y}px))` :
                                              `translateY(calc(-50% + ${y}px))`;
        }
      });
    });
    // dot jump
    dots.forEach((d,i)=>{
      d.addEventListener('click', ()=>{
        const stage = $('.collection__stage');
        const st = ScrollTrigger.getAll().find(s=>s.trigger===stage);
        if (!st) return;
        const target = st.start + ( (i+0.5)/slides.length ) * (st.end - st.start);
        if (lenis) lenis.scrollTo(target, {duration:1.4});
        else window.scrollTo({top:target, behavior:'smooth'});
      });
    });

    // RITUAL steps
    gsap.from('.step', {
      y:60, opacity:0, duration:1.1, stagger:.16, ease:'expo.out',
      scrollTrigger:{trigger:'.ritual__steps', start:'top 80%'}
    });
    gsap.from('.ritual__head .section-kicker, .ritual__head h2', {
      y:40, opacity:0, duration:1.1, stagger:.12, ease:'expo.out',
      scrollTrigger:{trigger:'.ritual__head', start:'top 80%'}
    });

    // ATELIER text
    gsap.from('.atelier__text > *', {
      y:40, opacity:0, duration:1.1, stagger:.1, ease:'expo.out',
      scrollTrigger:{trigger:'.atelier__text', start:'top 75%'}
    });
    // atelier humidor extra scroll movement
    gsap.fromTo('.atelier__layer--humidor',
      { scale:1.12, x:-30 },
      { scale:1.05, x:30, ease:'none',
        scrollTrigger:{trigger:'.atelier', start:'top bottom', end:'bottom top', scrub:.8} });

    // counters
    $$('.atelier__stats b').forEach(b=>{
      const raw = b.textContent.trim();
      const m = raw.match(/^(\d+)(.*)$/);
      if (!m) return;
      const target = parseInt(m[1],10);
      const suffix = m[2] || '';
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration:2, ease:'power3.out',
        onUpdate: () => { b.textContent = Math.round(obj.v) + suffix; },
        scrollTrigger:{trigger:b, start:'top 85%'}
      });
    });

    // HORIZON box reveal
    gsap.fromTo('.horizon__box',
      { y:120, scale:.5, rotate:-8, opacity:0 },
      {
        y:0, scale:1, rotate:0, opacity:1,
        ease:'none',
        scrollTrigger:{
          trigger:'.horizon', start:'top top', end:'+=60%', scrub:.6,
        }
      }
    );
    ScrollTrigger.create({
      trigger:'.horizon', start:'top -25%', end:'bottom top',
      onEnter:() => $('.horizon__copy').classList.add('is-on'),
      onLeaveBack:() => $('.horizon__copy').classList.remove('is-on'),
    });
    gsap.to('.horizon__box', {
      y: -60, scale:1.04, ease:'none',
      scrollTrigger:{trigger:'.horizon', start:'top -40%', end:'bottom top', scrub:.6}
    });

    // NOTES quotes
    $$('[data-q]').forEach((q,i)=>{
      ScrollTrigger.create({
        trigger:q, start:'top 85%',
        onEnter:()=>{ setTimeout(()=>q.classList.add('in'), i*120); }
      });
    });

    // RESERVE
    gsap.from('.reserve__inner > *', {
      y:40, opacity:0, duration:1, stagger:.1, ease:'expo.out',
      scrollTrigger:{trigger:'.reserve', start:'top 75%'}
    });

    // FOOTER
    gsap.from('.foot__brand, .foot__cols > div', {
      y:30, opacity:0, duration:1, stagger:.1, ease:'power3.out',
      scrollTrigger:{trigger:'.foot', start:'top 85%'}
    });

    // Ritual hero parallax fix override (we use our own loop above for data-parallax)

    ScrollTrigger.refresh();
  }

  /* ---------------- SMOOTH ANCHOR LINKS (lenis) ---------------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, {duration:1.4, offset:-40});
      else target.scrollIntoView({behavior:'smooth'});
    });
  });

  /* ---------------- KICK OFF ---------------- */
  if (document.readyState === 'complete') runPreloader();
  else window.addEventListener('load', runPreloader);

})();
