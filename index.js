/* ============================================================
   SKIAT SKUT — index.js  v7 (optimized, server-ready contact)
   ============================================================ */
(function(){
'use strict';
const $=(s,c)=>(c||document).querySelector(s);
const $$=(s,c)=>[...(c||document).querySelectorAll(s)];
const mob=()=>innerWidth<768;

// ── API Configuration ──
// Change this URL to your VPS backend endpoint
const API_URL = '/api/messages'; // e.g. 'https://your-vps.com/api/messages'

let gD=null,pD=null,galF=[],galA='Semua',pfA='Semua',lbI=-1;

/* ============================================================
   1. DATA LOADING
   ============================================================ */
function showSkel(){
  const g=$('#pfGrid');if(!g)return;let h='';
  for(let i=0;i<6;i++)h+='<div class="sk"><div class="sk-ph"></div><div class="sk-bd"><div class="sk-ln"></div><div class="sk-ln"></div><div class="sk-ln"></div></div></div>';
  g.innerHTML=h;
}

async function loadData(){
  try{
    const[a,b]=await Promise.all([fetch('index.json'),fetch('profile.json')]);
    if(!a.ok||!b.ok)throw 0;
    gD=await a.json();pD=await b.json();galF=gD.gallery||[];
    initApp();
  }catch(e){
    const g=$('#pfGrid');
    if(g)g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:3rem;border-radius:1rem;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.15)"><p style="font-size:2rem">⚠️</p><h3 style="font-family:var(--fd);margin-top:.5rem">Data tidak dapat dimuat</h3><p style="font-size:.8rem;color:var(--text3);margin-top:.3rem">Pastikan file JSON tersedia. Buka via Live Server.</p></div>';
  }
}

/* ============================================================
   2. INIT
   ============================================================ */
function initApp(){
  renderHero();
  buildPF();renderPF();
  renderWorks();
  buildGF();renderGal();
  renderTL();renderContact();renderFooter();
  initNav();initAnim();initForm();initModal();initLB();
  initTilt();initCounters();
  const bttBtn=$('#btt');if(bttBtn)bttBtn.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
}

function renderHero(){const d=$('#heroDesc');if(d&&gD)d.textContent=gD.description}

/* ============================================================
   3. SCROLL ANIMATIONS (.anim → .vis)
   ============================================================ */
function initAnim(){
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;

      entry.target.classList.add('vis');
      obs.unobserve(entry.target);
    });
  },{
    rootMargin:'-50px'
  });
  $$('.anim').forEach(el=>obs.observe(el));
  const obs2 = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;

      entry.target.classList.add('vis');
      obs2.unobserve(entry.target);
    });
  },{
    rootMargin:'-40px'
  });
  $$('.tli').forEach(el=>obs2.observe(el));
}

/* ============================================================
   4. COUNTERS
   ============================================================ */
function initCounters(){
  const obs=new IntersectionObserver(en=>{
    en.forEach(e=>{
      if(!e.isIntersecting)return;
      const el=e.target;if(el.dataset.done)return;el.dataset.done='1';
      const tgt=parseInt(el.dataset.count)||0;
      const suf=el.dataset.suf||'';
      const st=performance.now(),dur=1200;
      (function step(now){
        const t=Math.min((now-st)/dur,1);
        el.textContent=Math.round((1-Math.pow(1-t,3))*tgt)+suf;
        if(t<1)requestAnimationFrame(step);
      })(st);
      obs.unobserve(el);
    });
  },{rootMargin:'-40px'});
  $$('[data-count]').forEach(el=>obs.observe(el));
}

/* ============================================================
   5. PROFILE
   ============================================================ */
function buildPF(){
  const c=$('#pfFilt');if(!c||!pD)return;
  const roles=['Semua',...new Set(pD.map(m=>m.role))];
  c.innerHTML=roles.map(r=>`<button class="fbtn${r===pfA?' on':''}" data-f="${r}">${r}</button>`).join('');
  c.addEventListener('click',e=>{const b=e.target.closest('.fbtn');if(!b)return;pfA=b.dataset.f;$$('.fbtn',c).forEach(x=>x.classList.toggle('on',x.dataset.f===pfA));renderPF()});
}
function renderPF(){
  const g=$('#pfGrid');if(!g||!pD)return;
  const list=pfA==='Semua'?pD:pD.filter(m=>m.role===pfA);
  g.innerHTML=list.map((m,i)=>`
    <div class="pc anim" data-a="up" data-d="${Math.min(i,5)}" data-idx="${pD.indexOf(m)}" style="animation-delay:${i*.06}s">
      <div class="pc-iw"><img class="pc-img" src="${m.photo}" alt="${m.name}" loading="lazy" decoding="async" onerror="this.style.display='none';this.parentElement.style.background='rgba(255,255,255,.15)'"/><div class="pc-ov"><span>View Profile →</span></div></div>
      <div class="pc-bd"><h3 class="pc-nm">${m.name}</h3><p class="pc-rl">${m.role}</p><p class="pc-bi">${m.bio}</p></div>
    </div>`).join('');
  $$('.pc',g).forEach(c=>c.addEventListener('click',()=>openModal(pD[+c.dataset.idx])));
  initTilt();initAnim();
}
function initTilt(){
  if(mob())return;
  $$('.pc').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(800px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave',()=>{card.style.transform=''});
  });
}

/* ============================================================
   6. MODAL
   ============================================================ */
function initModal(){
  const m=$('#modal');if(!m)return;
  const close=()=>{m.classList.remove('open');document.body.style.overflow=''};
  $('.modal-bg',m).addEventListener('click',close);
  $('.modal-x',m).addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('open'))close()});
}
function openModal(mem){
  const m=$('#modal');
  if(!m||!mem)return;

  // ── FOTO ──
  $('#mImg').src=mem.photo||'';
  $('#mImg').alt=mem.name||'';

  // ── NAMA + ROLE ──
  $('#mName').textContent=mem.name||'-';
  $('#mRole').textContent=mem.role||'-';

  // ── BIO ──
  $('#mBio').textContent=mem.bio||'-';


  // =========================================================
  // CONTACT QUICK ACTIONS
  // =========================================================
  const contact=$('#mContact');

  if(contact){
    contact.innerHTML='';

    if(mem.email){
      const email=document.createElement('a');
      email.href=`mailto:${mem.email}`;
      email.innerHTML='✉ Email';
      contact.appendChild(email);
    }

    // WhatsApp hanya dibuat kalau nomor benar-benar tersedia
    if(mem.phone && !/[xX]/.test(mem.phone)){
      const wa=mem.phone.replace(/\D/g,'');

      if(wa){
        const whatsapp=document.createElement('a');
        whatsapp.href=`https://wa.me/${wa}`;
        whatsapp.target='_blank';
        whatsapp.rel='noopener noreferrer';
        whatsapp.innerHTML='💬 WhatsApp';
        contact.appendChild(whatsapp);
      }
    }
  }


  // =========================================================
  // EDUCATION TIMELINE
  // =========================================================
  const education=$('#mEducation');

  if(education){

    const list=Array.isArray(mem.educationTimeline)
      ? mem.educationTimeline
      : [];

    if(list.length){

      education.innerHTML=list.map(e=>`

        <div class="cv-edu">

          <span class="cv-edu-level">
            ${e.level||''}
          </span>

          <div class="cv-edu-school">
            ${e.school||''}
          </div>

          <div class="cv-edu-info">

            <span class="cv-edu-year">
              ${e.year||''}
            </span>

            ${
              e.major
                ? `<span class="cv-edu-major">
                    • ${e.major}
                   </span>`
                : ''
            }

          </div>

        </div>

      `).join('');

    }else{

      education.innerHTML=`
        <p style="color:var(--text3);font-size:.85rem">
          Data pendidikan belum tersedia.
        </p>
      `;

    }
  }


  // =========================================================
  // SKILLS
  // =========================================================
  const skills=$('#mSkills');

  if(skills){
    skills.innerHTML=(mem.skills||[])
      .map(s=>`<span>${s}</span>`)
      .join('');
  }


  // =========================================================
  // HOBBIES
  // =========================================================
  const hobbies=$('#mHobbies');

  if(hobbies){
    hobbies.innerHTML=(mem.hobbies||[])
      .map(h=>`<span>${h}</span>`)
      .join('');
  }


  // =========================================================
  // SOCIAL MEDIA
  // =========================================================
  const socials=$('#mSocials');
  if(socials){
    const list=Array.isArray(mem.socials)
      ? mem.socials
      : [];
    if(list.length){
      socials.innerHTML=list.map(s=>`
        <a
          class="cv-social"
          href="${s.url}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="cv-social-icon">
            ${
              s.platform==='Instagram'
                ? '◎'
                : s.platform==='TikTok'
                  ? '♪'
                  : '●'
            }
          </span>
          <span>
            ${s.platform}: ${s.username}
          </span>
       </a>
      `).join('');
    }else{
      socials.innerHTML=`
        <span style="color:var(--text3);font-size:.85rem">
          Social media belum tersedia.
        </span>
      `;
    }
  }

// =========================================================
// CV
// =========================================================
const cv=$('#mCV');

if(cv){
  if(mem.cv){
    cv.innerHTML=`
      <div class="cv-actions">

        <a
          class="cv-btn cv-btn-view"
          href="${mem.cv}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/>
            <circle cx="12" cy="12" r="2.5"/>
          </svg>
          <span>Lihat CV</span>
        </a>

        <a
          class="cv-btn cv-btn-download"
          href="${mem.cv}"
          download
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v11"/>
            <path d="M7.5 10.5 12 15l4.5-4.5"/>
            <path d="M4 20h16"/>
          </svg>
          <span>Unduh CV</span>
        </a>

      </div>
    `;
  }else{
    cv.innerHTML='';
  }
}


  // =========================================================
  // EMAIL
  // =========================================================
  const email=$('#mEmail');
  if(email){
    email.href=`mailto:${mem.email||''}`;
  }
  const emailText=$('#mEmailT');
  if(emailText){
    emailText.textContent=mem.email||'';
  }


  // =========================================================
  // OPEN MODAL
  // =========================================================
  m.classList.add('open');
  document.body.style.overflow='hidden';
}

/* ============================================================
   7. GALLERY
   ============================================================ */
function buildGF(){
  const c=$('#galFilt');if(!c||!gD)return;
  const cats=['Semua',...new Set((gD.gallery||[]).map(g=>g.category))];
  c.innerHTML=cats.map(x=>`<button class="fbtn${x==='Semua'?' on':''}" data-f="${x}">${x}</button>`).join('');
  c.addEventListener('click',e=>{const b=e.target.closest('.fbtn');if(!b)return;galA=b.dataset.f;$$('.fbtn',c).forEach(x=>x.classList.toggle('on',x.dataset.f===galA));galF=galA==='Semua'?gD.gallery:gD.gallery.filter(g=>g.category===galA);renderGal()});
}
function renderGal(){
  const g=$('#galGrid');if(!g)return;
  g.innerHTML=galF.map((img,i)=>`
    <div class="gi${i===0?' gi-big':''} anim" data-a="up" data-d="${Math.min(i,5)}" data-gi="${i}" style="animation-delay:${i*.05}s">
      <div class="gi-w"><img class="gi-img" src="${img.src}" alt="${img.alt}" loading="lazy" decoding="async" onerror="this.style.display='none';this.parentElement.style.background='rgba(255,255,255,.12)'"/><div class="gi-ov"><p>${img.alt}</p><p>${img.category}</p></div></div>
    </div>`).join('');
  $$('.gi',g).forEach(el=>el.addEventListener('click',()=>{lbI=+el.dataset.gi;openLB()}));
  initAnim();
}

/* ============================================================
   8. LIGHTBOX
   ============================================================ */
function initLB(){
  const lb=$('#lb');if(!lb)return;
  $('.lb-bg',lb).addEventListener('click',closeLB);
  $('.lb-close',lb).addEventListener('click',closeLB);
  $('.lb-prev',lb).addEventListener('click',()=>navLB(-1));
  $('.lb-next',lb).addEventListener('click',()=>navLB(1));
  document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')closeLB();if(e.key==='ArrowLeft')navLB(-1);if(e.key==='ArrowRight')navLB(1)});
}
function openLB(){upLB();$('#lb').classList.add('open');document.body.style.overflow='hidden'}
function closeLB(){$('#lb').classList.remove('open');document.body.style.overflow=''}
function navLB(d){lbI=(lbI+d+galF.length)%galF.length;upLB()}
function upLB(){const img=galF[lbI];if(!img)return;$('#lbImg').src=img.src;$('#lbImg').alt=img.alt;$('#lbCap').textContent=img.alt;$('#lbCnt').textContent=`${lbI+1} / ${galF.length}`}

/* ============================================================
   9. TIMELINE
   ============================================================ */
function renderTL(){
  const c=$('#tlWrap');if(!c||!gD)return;
  c.innerHTML=(gD.timeline||[]).map(t=>`
    <div class="tli"><div class="tli-dot"></div>
      <div class="tli-card"><span class="tli-date">${t.date}</span><h3 class="tli-title">${t.title}</h3><p class="tli-desc">${t.description}</p></div>
      <div class="tli-sp"></div>
    </div>`).join('');
}

/* ============================================================
   10. CONTACT (WhatsApp included)
   ============================================================ */
function renderContact(){
  if(!gD||!pD)return;
  const cg=$('#ctGrp');
  if(cg){
    const c=gD.contact||{};
    const wa=(c.whatsapp||'').replace(/[^0-9]/g,'');

    cg.innerHTML=`
      <a href="mailto:${c.email||''}" class="ci">
        <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
          <path d="M2.25 4.5l6.75 4.5 6.75-4.5M2.25 4.5v9h13.5v-9H2.25z"
            stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${c.email||'-'}
      </a>

      ${c.whatsapp?`
        <a href="https://wa.me/${wa}" target="_blank" rel="noopener" class="ci">
          ${c.whatsapp}
        </a>
      `:''}

      <div class="ci">${c.instagram||'-'}</div>
      <div class="ci">${c.github||'-'}</div>
    `;
  }

  const cm=$('#ctMem');

  if(cm){
    cm.innerHTML=pD.map(m=>`
      <a href="mailto:${m.email}" class="cm">
        <img
          src="${m.photo}"
          alt="${m.name}"
          loading="lazy"
          onerror="this.style.display='none'"
        />
        <div>
          <div class="cm-nm">${m.name}</div>
          <div class="cm-em">${m.email}</div>
        </div>
      </a>
    `).join('');
  }
}


/* ============================================================
   CONTACT FORM  SUPABASE
   ============================================================ */
function initForm(){
  const f=$('#ctForm');
  const ok=$('#ctOk');

  if(!f||!ok)return;

  f.addEventListener('submit',async e=>{
    e.preventDefault();

    const btn=f.querySelector('button[type="submit"]');
    const origText=btn.textContent;

    const name=$('#cN').value.trim();
    const email=$('#cE').value.trim();
    const message=$('#cM').value.trim();

    if(!name||!email||!message)return;

    btn.textContent='Mengirim...';
    btn.disabled=true;

    try{
      const res=await fetch(
        'https://xewpzqewtzatnrrxtmpm.supabase.co/rest/v1/messages',
        {
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'apikey':'sb_publishable_iL72bxNkOObuhG1i-XngSA_NRFrcvWq',
            'Authorization':'Bearer sb_publishable_iL72bxNkOObuhG1i-XngSA_NRFrcvWq',
            'Prefer':'return=minimal'
          },
          body:JSON.stringify({
            name:name,
            email:email,
            message:message
          })
        }
      );

      if(!res.ok){
        const errorText=await res.text();
        throw new Error(errorText||'Gagal mengirim pesan');
      }

      f.hidden=true;
      ok.hidden=false;

      setTimeout(()=>{
        ok.hidden=true;
        f.hidden=false;
        f.reset();
      },3000);

    }catch(err){
      console.error('Gagal mengirim pesan:',err);
      alert('Pesan gagal dikirim. Silakan coba lagi.');
    }

    btn.textContent=origText;
    btn.disabled=false;
  });
}

/* ============================================================
   11. FOOTER
   ============================================================ */
function renderFooter(){
  if(!pD||!gD)return;
  const ft=$('#ftTeam');
  if(ft)ft.innerHTML='<h4>Tim</h4>'+pD.map(m=>`<a href="mailto:${m.email}">${m.name}</a>`).join('');
  const fc=$('#ftCon');
  if(fc&&gD.contact){
    const c=gD.contact;const wa=(c.whatsapp||'').replace(/[^0-9]/g,'');
    fc.innerHTML=`<h4>Connect</h4><a href="mailto:${c.email}">Email</a>${c.whatsapp?`<a href="https://wa.me/${wa}" target="_blank">WhatsApp</a>`:''}<span>${c.instagram}</span><span>${c.github}</span>`;
  }
}

/* ============================================================
   12. NAV + UNIFIED SCROLL HANDLER (single rAF)
   ============================================================ */
function initNav(){
  const nav=$('#nav'),ham=$('#ham'),mobEl=$('#mob'),bg=$('#mobBg');
  const toggle=()=>{const o=mobEl.classList.toggle('open');ham.classList.toggle('open',o);document.body.style.overflow=o?'hidden':''};
  ham.addEventListener('click',toggle);bg.addEventListener('click',toggle);
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=$(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});if(mobEl.classList.contains('open'))toggle()}}));
  const ids=['home','profile','works','pictures','timeline','contact'];
  const obs=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){const id=e.target.id;$$('.nav-link').forEach(l=>l.classList.toggle('active',l.dataset.s===id));$$('.mob-link').forEach(l=>l.classList.toggle('active',l.dataset.s===id))}})},{rootMargin:'-30% 0px -60% 0px'});
  ids.forEach(id=>{const el=$(`#${id}`);if(el)obs.observe(el)});

  // ── Single unified scroll handler (batched in rAF) ──
  const bar=$('#prog');
  const btn=$('#btt');
  let scrollTicking=false;
  addEventListener('scroll',()=>{
    if(!scrollTicking){
      requestAnimationFrame(()=>{
        // Nav shadow
        nav.classList.toggle('scrolled',scrollY>40);
        // Progress bar
        if(bar){const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=h>0?`${(scrollY/h)*100}%`:'0'}
        // Back-to-top
        if(btn)btn.classList.toggle('vis',scrollY>600);
        scrollTicking=false;
      });
      scrollTicking=true;
    }
  },{passive:true});
}
// initProg and initBTT are now inside initNav's unified scroll handler

function renderWorks(){
  const g=$('#worksGrid');
  if(!g||!gD)return;

  const works=gD.works||[];

  g.innerHTML=works.map((w,i)=>{

    if(w.type==='image'){
      return `
        <article class="work-card anim" data-a="up" data-d="${Math.min(i,5)}">
          <div class="work-media">
            <img
              src="${w.src}"
              alt="${w.title}"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div class="work-body">
            <span class="work-type">IMAGE</span>
            <h3>${w.title}</h3>
            <p>${w.description}</p>
          </div>
        </article>
      `;
    }

    if(w.type==='video'){
      return `
        <article class="work-card anim" data-a="up" data-d="${Math.min(i,5)}">
          <div class="work-media">
            <video
              src="${w.src}"
              controls
              preload="metadata"
            ></video>
          </div>

          <div class="work-body">
            <span class="work-type">VIDEO</span>
            <h3>${w.title}</h3>
            <p>${w.description}</p>
          </div>
        </article>
      `;
    }

    if(w.type==='url'){
      return `
        <article class="work-card work-link-card anim" data-a="up" data-d="${Math.min(i,5)}">
          <div class="work-body">
            <span class="work-type">WEBSITE</span>
            <h3>${w.title}</h3>
            <p>${w.description}</p>

            <a
              class="btn btn-fill btn-sm"
              href="${w.url}"
              target="_blank"
              rel="noopener"
            >
              ${w.buttonText||'Kunjungi'}
            </a>
          </div>
        </article>
      `;
    }

    return '';
  }).join('');

  initAnim();
}

/* ============================================================
   BOOT
   ============================================================ */
showSkel();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadData);else loadData();
})();
