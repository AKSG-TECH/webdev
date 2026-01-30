(function(){
  // Dark mode removed — theme toggle disabled
  // (theme colors now always use default variables from :root)  

  const nav = document.querySelector('.nav');
  const navLinks = nav ? nav.querySelector('.nav-links') : null;
  const navToggle = document.querySelector('.nav-toggle');

  if(nav && navLinks){
    // start closed for screen readers
    navLinks.setAttribute('aria-hidden', 'true');

    // Add click feedback and slight delay before navigating so users see the pressed state
    navLinks.querySelectorAll('a').forEach(link=>{
      link.addEventListener('click', (e)=>{
        e.preventDefault();
        const href = link.getAttribute('href');
        link.classList.add('clicked');
        // Close menu with animation and update accessibility attributes
        nav.classList.remove('open');
        if(navToggle) navToggle.setAttribute('aria-expanded', 'false');
        navLinks.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('nav-open');
        if(href && href !== '#'){
          setTimeout(()=> { window.location.href = href; }, 260);
        } else {
          setTimeout(()=> link.classList.remove('clicked'), 320);
        }
      });
      link.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); link.click(); } });
    });
  }

  // Create backdrop element for mobile nav and streamline open/close
  let navBackdrop = document.createElement('div');
  navBackdrop.className = 'nav-backdrop';
  navBackdrop.addEventListener('click', ()=>{
    // close nav when clicking backdrop
    if(!nav) return;
    nav.classList.remove('open');
    navToggle && navToggle.setAttribute('aria-expanded', 'false');
    navLinks && navLinks.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
    navBackdrop.classList.remove('visible');
    navToggle && navToggle.focus();
  });
  document.body.appendChild(navBackdrop);

  // Toggle navigation menu with ARIA updates and body scroll lock
  if(navToggle && nav){
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.addEventListener('click', () => {
      const willOpen = !nav.classList.contains('open');
      nav.classList.toggle('open', willOpen);
      navToggle.setAttribute('aria-expanded', String(willOpen));
      navLinks && navLinks.setAttribute('aria-hidden', String(!willOpen));
      document.body.classList.toggle('nav-open', willOpen);
      navBackdrop.classList.toggle('visible', willOpen);
      if(willOpen){
        const first = navLinks && navLinks.querySelector('a');
        first && first.focus();
      } else {
        navToggle && navToggle.focus();
      }
    });
  }

  // Close nav with Escape key when open
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && nav && nav.classList.contains('open')){
      nav.classList.remove('open');
      navToggle && navToggle.setAttribute('aria-expanded', 'false');
      navLinks && navLinks.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
      navBackdrop.classList.remove('visible');
      navToggle && navToggle.focus();
    }
  });

  // Hide toggle on desktop via CSS/JS when resizing
  function setToggleVisibility(){
    const isDesktop = window.matchMedia('(min-width:768px)').matches;
    if(isDesktop){
      if(navToggle){ navToggle.style.display = 'none'; navToggle.setAttribute('aria-hidden','true'); }
      nav && nav.classList.remove('open');
      navLinks && navLinks.setAttribute('aria-hidden','false');
      document.body.classList.remove('nav-open');
      navBackdrop.classList.remove('visible');
    } else {
      if(navToggle){ navToggle.style.display = ''; navToggle.setAttribute('aria-hidden','false'); }
    }
  }
  setToggleVisibility();
  window.addEventListener('resize', setToggleVisibility);

  // Convert card-level .show-prompt elements into real links to the post
  document.querySelectorAll('.cards-grid .show-prompt').forEach(el => {
    const card = el.closest('.card');
    const target = card ? card.querySelector('.card-link') : null;
    if(target && target.href){
      // Make it a proper link so middle-click / Ctrl+click works for new tab
      el.setAttribute('href', target.getAttribute('href'));
      // Ensure it behaves like a link even if it's an anchor without href in markup
      el.addEventListener('click', ()=>{});
    }
  });

  // Set current year
  document.getElementById('year').textContent = new Date().getFullYear();



  // Lazy-loading enhancement with IntersectionObserver
  const lazyImages = document.querySelectorAll('img.lazy');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img = entry.target; img.src = img.dataset.src; img.classList.remove('lazy'); obs.unobserve(img);
          img.addEventListener('load', ()=> img.style.opacity = 1);
        }
      })
    }, {rootMargin:'100px'});
    lazyImages.forEach(img=>{ img.style.opacity=0; io.observe(img); });
  } else {
    // fallback
    lazyImages.forEach(img=> img.src = img.dataset.src);
  }

  // Card category filter (click badge to filter / click again to clear)
  const cardBadges = document.querySelectorAll('.cards-grid .badge');
  let activeCategory = null;
  function clearCategoryFilter(){
    activeCategory = null;
    document.querySelectorAll('.card').forEach(card => card.style.display = '');
    cardBadges.forEach(b => b.classList.remove('active'));
  }
  function applyCategoryFilter(cat){
    if(activeCategory === cat){ clearCategoryFilter(); return; }
    activeCategory = cat;
    document.querySelectorAll('.card').forEach(card=>{
      const b = card.querySelector('.badge');
      card.style.display = (b && b.textContent.trim() === cat) ? '' : 'none';
    });
    cardBadges.forEach(b => b.classList.toggle('active', b.textContent.trim()===cat));
    const grid = document.getElementById('cardsGrid');
    grid && grid.scrollIntoView({behavior:'smooth', block:'start'});
  }
  cardBadges.forEach(b=>{
    b.setAttribute('role','button');
    b.setAttribute('tabindex','0');
    b.addEventListener('click', ()=> applyCategoryFilter(b.textContent.trim()));
    b.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); b.click(); } });
  });
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && activeCategory){ clearCategoryFilter(); } });

  // Simple search filter (client-side demo)
  const searchBtn = document.getElementById('searchBtn');
  searchBtn && searchBtn.addEventListener('click', ()=>{
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    document.querySelectorAll('.card').forEach(card=>{
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      card.style.display = title.includes(q) || q === '' ? '' : 'none';
    });
  });

  // Copy prompt buttons (cards and post pages)
  document.querySelectorAll('.copy-prompt').forEach(btn => {
    btn.addEventListener('click', async ()=>{
      let promptEl = btn.closest('.post') ? btn.closest('.post').querySelector('.prompt') : btn.closest('.card') ? btn.closest('.card').querySelector('.prompt') : null;
      if(!promptEl) return;
      const text = promptEl.textContent.trim();
      if(!text) return;
      try{
        await navigator.clipboard.writeText(text);
        const orig = btn.textContent; btn.textContent = 'Copied!';
        setTimeout(()=> btn.textContent = orig, 1800);
      }catch(e){
        // fallback
        const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
        try{ document.execCommand('copy'); }catch(err){}
        document.body.removeChild(ta);
        const orig = btn.textContent; btn.textContent = 'Copied!';
        setTimeout(()=> btn.textContent = orig, 1800);
      }
    });
  });

  // Accessibility: allow Enter key to toggle show prompt when focused
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && document.activeElement && document.activeElement.classList.contains('show-prompt')){
      document.activeElement.click();
    }
  });

})();