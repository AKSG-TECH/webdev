(function(){
  // Dark mode removed — theme toggle disabled
  // (theme colors now always use default variables from :root)  

  const nav = document.querySelector('.nav');
  if(nav){
    // Add click feedback and slight delay before navigating so users see the pressed state
    nav.querySelectorAll('.nav-links a').forEach(link=>{
      link.addEventListener('click', (e)=>{
        e.preventDefault();
        const href = link.getAttribute('href');
        link.classList.add('clicked');
        nav.classList.remove('open'); // Close menu on link click
        if(href && href !== '#'){
          setTimeout(()=> { window.location.href = href; }, 140);
        } else {
          setTimeout(()=> link.classList.remove('clicked'), 260);
        }
      });
      link.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); link.click(); } });
    });
  }

  // Toggle navigation menu
  const navToggle = document.querySelector('.nav-toggle');
  if(navToggle && nav){
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

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