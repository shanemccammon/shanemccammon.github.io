// sidebar.js - minimal interactive behavior: toggle, smooth scroll, active link on scroll

(function(){
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const closeBtn = document.getElementById('sidebarClose');

  // Create overlay for small screens
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function openSidebar(){
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    toggle.setAttribute('aria-expanded', 'true');
    // autofocus first link for keyboard users
    const firstLink = sidebar.querySelector('.sidebar-nav a');
    if(firstLink) firstLink.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar(){
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    toggle.focus();
  }

  toggle.addEventListener('click', () => {
    if(sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
  });

  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // Smooth scroll behavior for nav links
  const navLinks = Array.from(document.querySelectorAll('.sidebar-nav a'));
  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = a.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if(target){
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
      // On narrow screens close sidebar after navigating
      if(window.innerWidth < 900) closeSidebar();
    });
  });

  // Active link highlighting based on scroll
  const sections = navLinks
    .map(link => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  // Throttle utility
  function throttle(fn, wait=100){
    let last = 0;
    return function(...args){
      const now = Date.now();
      if(now - last >= wait){
        last = now;
        return fn.apply(this, args);
      }
    }
  }

  function onScroll(){
    const scrollPos = window.scrollY + window.innerHeight * 0.18; // small offset for earlier highlight
    let currentId = null;
    for(let section of sections){
      if(section.offsetTop <= scrollPos) currentId = section.id;
    }
    navLinks.forEach(link => {
      const target = link.getAttribute('href').slice(1);
      if(target === currentId) link.classList.add('active');
      else link.classList.remove('active');
    });
  }

  document.addEventListener('scroll', throttle(onScroll, 120));
  window.addEventListener('resize', throttle(onScroll, 200));
  // initial highlight
  onScroll();
})();
