(function(){
  // Dark mode removed — theme toggle disabled
  // (theme colors now always use default variables from :root)  

  const nav = document.querySelector('.nav');
  const navLinks = nav ? nav.querySelector('.nav-links') : null;

  if(nav && navLinks){
    // start closed for screen readers
    navLinks.setAttribute('aria-hidden', 'false');

    // Add click feedback and slight delay before navigating so users see the pressed state
    navLinks.querySelectorAll('a').forEach(link=>{
      link.addEventListener('click', (e)=>{
        e.preventDefault();
        const href = link.getAttribute('href');
        link.classList.add('clicked');
        // Close menu with animation and update accessibility attributes
        nav.classList.remove('open');
        if(navLinks) navLinks.setAttribute('aria-hidden', 'false');
          setTimeout(()=> { window.location.href = href; }, 260);
        } else {
          setTimeout(()=> link.classList.remove('clicked'), 320);
        }
      });
      link.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); link.click(); } });
    });
  }

  // Mobile nav toggle removed — navigation always visible

  // Convert card-level .show-prompt elements into real links to the post
  document.querySelectorAll('.cards-grid .show-prompt').forEach(el => {
    const card = el.closest('.card');
    const target = card ? card.querySelector('.card-link') : null;
    if(target && target.href){
      // Make it a proper link so middle-click / Ctrl+click works for new tab
      el.setAttribute('href', target.getAttribute('href'));
      // No extra click handler needed — native link behavior suffices
    }
  });

  // Set current year
  document.getElementById('year').textContent = new Date().getFullYear();



  // Lazy-loading enhancement with IntersectionObserver and skeleton loading
  const lazyImages = document.querySelectorAll('img.lazy');
  
  // Initialize skeleton loaders for all lazy images
  lazyImages.forEach(img => {
    const thumb = img.closest('.thumb');
    if(thumb && !thumb.querySelector('.skeleton-loader')){
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-loader';
      thumb.appendChild(skeleton);
    }
    img.style.opacity = '0';
  });
  
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img = entry.target;
          const thumb = img.closest('.thumb');
          
          // Set image source
          img.src = img.dataset.src;
          img.classList.add('loading');
          obs.unobserve(img);
          
          // Remove skeleton and fade in image when loaded
          img.addEventListener('load', ()=> {
            const skeleton = thumb ? thumb.querySelector('.skeleton-loader') : null;
            if(skeleton) skeleton.style.display = 'none';
            img.classList.remove('loading');
            img.classList.remove('lazy');
            img.style.opacity = '1';
            img.style.transition = 'opacity 0.3s ease-in';
          });
          
          // Fallback: remove skeleton and show image after 2.5 seconds
          setTimeout(() => {
            if(img.src && img.dataset.src){
              const skeleton = thumb ? thumb.querySelector('.skeleton-loader') : null;
              if(skeleton) skeleton.style.display = 'none';
              img.classList.remove('loading');
              img.style.opacity = '1';
            }
          }, 2500);
        }
      })
    }, {rootMargin:'150px'});
    lazyImages.forEach(img => io.observe(img));
  } else {
    // fallback without IntersectionObserver
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.style.opacity = '1';
      const skeleton = img.closest('.thumb')?.querySelector('.skeleton-loader');
      if(skeleton) skeleton.style.display = 'none';
    });
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

  // Simple search filter removed — not used in current markup

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