// sidebar.js - supports:
// - About & Resume anchors on index.html (smooth-scroll when on index).
// - Projects dropdown (expand/collapse); submenu links navigate to individual pages.
// - Highlights active top-level and submenu links.
// - Handles toggle/overlay, close on small screens, Escape key.

(function(){
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const closeBtn = document.getElementById('sidebarClose');
  const submenuButtons = Array.from(document.querySelectorAll('.submenu-toggle'));
  const overlayClass = 'sidebar-overlay';

  // Ensure overlay exists
  let overlay = document.querySelector('.' + overlayClass);
  if(!overlay){
    overlay = document.createElement('div');
    overlay.className = overlayClass;
    document.body.appendChild(overlay);
  }

  function openSidebar(){
    if(!sidebar) return;
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    if(toggle) toggle.setAttribute('aria-expanded','true');
    const firstLink = sidebar.querySelector('.sidebar-nav a, .submenu-toggle');
    if(firstLink) firstLink.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar(){
    if(!sidebar) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    if(toggle) toggle.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
    if(toggle) toggle.focus();
  }

  toggle && toggle.addEventListener('click', () => {
    if(!sidebar) return;
    if(sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
  });

  closeBtn && closeBtn.addEventListener('click', closeSidebar);
  overlay && overlay.addEventListener('click', closeSidebar);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // Submenu toggle behavior
  submenuButtons.forEach(btn => {
    const parentLi = btn.closest('.has-submenu');
    const submenu = parentLi ? parentLi.querySelector('.submenu') : null;
    btn.addEventListener('click', (e) => {
      const isOpen = parentLi.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      if(submenu){
        if(isOpen) submenu.classList.add('open');
        else submenu.classList.remove('open');
      }
    });
  });

  // Utility: returns true if current page is the index/home page
  function onIndexPage(){
    const p = window.location.pathname.split('/').pop();
    return p === '' || p === 'index.html' || p === '/';
  }

  // Handle mixed navigation for anchors pointing to index.html#...:
  const navLinks = Array.from(document.querySelectorAll('.sidebar-nav a'));
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = (link.getAttribute('href') || '').trim();
      const hashIndex = href.indexOf('#');
      const hasHash = hashIndex !== -1;
      const linkFile = hasHash ? href.slice(0, hashIndex) : href;
      const linkHash = hasHash ? href.slice(hashIndex + 1) : '';

      const isIndexAnchor =
        hasHash && (linkFile === '' || linkFile === 'index.html' || linkFile === './index.html');

      // If it's an index anchor and we're on the index -> smooth scroll
      if(isIndexAnchor && onIndexPage()){
        e.preventDefault();
        const targetId = linkHash;
        if(targetId){
          const target = document.getElementById(targetId);
          if(target){
            target.scrollIntoView({behavior:'smooth', block:'start'});
            history.replaceState(null, '', '#' + targetId);
          }
        }
        if(window.innerWidth < 900) closeSidebar();
        return;
      }

      // Otherwise allow normal navigation (new page). For small screens close immediately for UX.
      if(window.innerWidth < 900) closeSidebar();
    });
  });

  // Highlight active links (top-level and submenu) by filename or hash
  function highlightActiveLink(){
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash ? window.location.hash.slice(1) : '';
    navLinks.forEach(link => {
      const fullHref = (link.getAttribute('href') || '');
      const [linkFileRaw, linkHash] = fullHref.split('#');
      const linkFile = linkFileRaw ? linkFileRaw.split('/').pop() : '';
      const normalizedLinkFile = (linkFile === '' || linkFile === '/') ? 'index.html' : linkFile;
      const normalizedCurrent = (currentFile === '' || currentFile === '/') ? 'index.html' : currentFile;

      // If link points to index anchor and we're on index -> match by hash
      if((normalizedLinkFile === 'index.html' || fullHref.startsWith('#')) && normalizedCurrent === 'index.html' && linkHash){
        if(linkHash === currentHash) {
          link.classList.add('active');
          // also open submenu containing it (if any)
          const parent = link.closest('.has-submenu');
          if(parent) {
            parent.classList.add('open');
            const submenu = parent.querySelector('.submenu');
            if(submenu) submenu.classList.add('open');
            const btn = parent.querySelector('.submenu-toggle');
            if(btn) btn.setAttribute('aria-expanded','true');
          }
        } else link.classList.remove('active');
        return;
      }

      // Otherwise match by filename
      if(normalizedLinkFile === normalizedCurrent && (!linkHash || linkHash === '')) {
        link.classList.add('active');
        // open submenu if link is inside one
        const parent = link.closest('.has-submenu');
        if(parent) {
          parent.classList.add('open');
          const submenu = parent.querySelector('.submenu');
          if(submenu) submenu.classList.add('open');
          const btn = parent.querySelector('.submenu-toggle');
          if(btn) btn.setAttribute('aria-expanded','true');
        }
      } else {
        link.classList.remove('active');
      }
    });
  }

  // On load: if current page is a project page, open the Projects submenu so the active item is visible.
  document.addEventListener('DOMContentLoaded', () => {
    // If current page is one of the project pages, ensure the projects submenu is open
    const projectFiles = [
      'projects.html','board1.html','board2.html','board3.html','edl.html',
      'embedded-systems.html','embedded-ai.html','experimental-physics.html','power-electronics.html'
    ];
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    if(projectFiles.includes(currentFile)){
      // find the parent .has-submenu
      const parent = document.querySelector('.has-submenu');
      if(parent){
        parent.classList.add('open');
        const submenu = parent.querySelector('.submenu');
        if(submenu) submenu.classList.add('open');
        const btn = parent.querySelector('.submenu-toggle');
        if(btn) btn.setAttribute('aria-expanded','true');
      }
    }

    // If landing on index with hash, smooth-scroll to that section
    if(onIndexPage() && window.location.hash){
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if(el){
        setTimeout(() => el.scrollIntoView({behavior: 'smooth', block: 'start'}), 80);
      }
    }

    highlightActiveLink();
  });

  // React to hash changes (for index anchors)
  window.addEventListener('hashchange', highlightActiveLink);
})();
