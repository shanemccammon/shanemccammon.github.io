// sidebar.js - supports:
// - Home, Resume, Projects, and Contact navigation
// - Resume and Contact anchors on index.html (smooth-scroll when on index)
// - Projects link navigates to projects.html page
// - Highlights active links
// - Handles toggle/overlay, close on small screens, Escape key
// - Ensures a single Military link is present in the sidebar nav (inserted before Contact)

// sidebar.js
// - Responsive off-canvas sidebar (toggle + overlay)
// - Optional Projects dropdown submenu
// - Smooth-scroll for same-page anchors (any page)
// - Active link highlighting (file + hash)

(function () {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const closeBtn = document.getElementById('sidebarClose');
  const overlayClass = 'sidebar-overlay';
  const DESKTOP_BREAKPOINT = 900;

  // Ensure overlay exists
  let overlay = document.querySelector('.' + overlayClass);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = overlayClass;
    document.body.appendChild(overlay);
  }

  function getCurrentFile() {
    const p = window.location.pathname.split('/').pop();
    return !p ? 'index.html' : p;
  }

  function normalizeFile(f) {
    if (!f || f === '/' || f === './') return 'index.html';
    return f.split('/').pop();
  }

  function closeProjectsSubmenu() {
    const projectsToggle = document.getElementById('projectsToggle');
    const projectsSubmenu = document.getElementById('projects-submenu');
    const projectsCaret = document.getElementById('projectsCaret');
    if (!projectsToggle || !projectsSubmenu) return;
    projectsSubmenu.classList.remove('open');
    projectsToggle.setAttribute('aria-expanded', 'false');
    if (projectsCaret) projectsCaret.classList.remove('open');
  }

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    const firstFocusable = sidebar.querySelector('a, button');
    if (firstFocusable) firstFocusable.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    closeProjectsSubmenu();
    if (toggle) toggle.focus();
  }

  toggle &&
    toggle.addEventListener('click', () => {
      if (!sidebar) return;
      if (sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    });

  closeBtn && closeBtn.addEventListener('click', closeSidebar);
  overlay && overlay.addEventListener('click', closeSidebar);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // Smooth-scroll for same-page anchors; close sidebar on small screens for any navigation.
  const navLinks = Array.from(document.querySelectorAll('.sidebar-nav a'));
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = (link.getAttribute('href') || '').trim();
      if (!href) return;

      // Parse file + hash (supports "#id" and "page.html#id")
      const parts = href.split('#');
      const linkFileRaw = parts[0] || '';
      const linkHash = parts.length > 1 ? parts.slice(1).join('#') : '';
      const currentFile = normalizeFile(getCurrentFile());
      const linkFile = normalizeFile(linkFileRaw);

      const isSamePageAnchor =
        Boolean(linkHash) &&
        (linkFile === currentFile || href.startsWith('#') || linkFileRaw === '');

      if (isSamePageAnchor) {
        const target = document.getElementById(linkHash);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + linkHash);
        }
      }

      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        closeSidebar();
      }
    });
  });

  // Highlight active links by filename + hash
  function highlightActiveLink() {
    const currentFile = normalizeFile(getCurrentFile());
    const currentHash = window.location.hash ? window.location.hash.slice(1) : '';

    navLinks.forEach((link) => {
      const href = (link.getAttribute('href') || '').trim();
      if (!href) return;

      const parts = href.split('#');
      const linkFileRaw = parts[0] || '';
      const linkHash = parts.length > 1 ? parts.slice(1).join('#') : '';
      const linkFile = normalizeFile(linkFileRaw);

      // Same-page anchor links: match hash
      if (linkHash && linkFile === currentFile) {
        link.classList.toggle('active', linkHash === currentHash);
        return;
      }

      // Non-anchor page links: match file and only when no hash is active
      const isPageMatch = linkFile === currentFile && !linkHash;
      link.classList.toggle('active', isPageMatch && !currentHash);
    });
  }

  // Projects dropdown: toggle behavior + keyboard focus handling
  (function initProjectsDropdown() {
    const projectsToggle = document.getElementById('projectsToggle');
    const projectsSubmenu = document.getElementById('projects-submenu');
    const projectsCaret = document.getElementById('projectsCaret');
    if (!projectsToggle || !projectsSubmenu) return;

    projectsToggle.addEventListener('click', () => {
      const isOpen = projectsToggle.getAttribute('aria-expanded') === 'true';
      projectsToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      projectsSubmenu.classList.toggle('open', !isOpen);
      if (projectsCaret) projectsCaret.classList.toggle('open', !isOpen);
    });

    // Close submenu if focus leaves it (better keyboard UX)
    projectsSubmenu.addEventListener('focusout', function (e) {
      const related = e.relatedTarget;
      if (!projectsSubmenu.contains(related) && related !== projectsToggle) {
        closeProjectsSubmenu();
      }
    });

    // Clicking a submenu link should collapse submenu on desktop; sidebar will close on mobile anyway.
    const submenuLinks = Array.from(projectsSubmenu.querySelectorAll('a'));
    submenuLinks.forEach((a) => {
      a.addEventListener('click', () => {
        if (window.innerWidth >= DESKTOP_BREAKPOINT) {
          closeProjectsSubmenu();
        }
      });
    });
  })();

  document.addEventListener('DOMContentLoaded', () => {
    // If landing with a hash, smooth-scroll to the section.
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      }
    }

    // If we're on projects.html with a hash that matches a submenu item, open the submenu.
    const currentFile = normalizeFile(getCurrentFile());
    const currentHash = window.location.hash ? window.location.hash.slice(1) : '';
    if (currentFile === 'projects.html' && currentHash) {
      const projectsToggle = document.getElementById('projectsToggle');
      const projectsSubmenu = document.getElementById('projects-submenu');
      const projectsCaret = document.getElementById('projectsCaret');
      if (projectsToggle && projectsSubmenu) {
        const hasMatch = Array.from(projectsSubmenu.querySelectorAll('a')).some((a) => {
          const h = (a.getAttribute('href') || '').split('#')[1] || '';
          return h === currentHash;
        });
        if (hasMatch) {
          projectsToggle.setAttribute('aria-expanded', 'true');
          projectsSubmenu.classList.add('open');
          if (projectsCaret) projectsCaret.classList.add('open');
        }
      }
    }

    highlightActiveLink();
  });

  window.addEventListener('hashchange', highlightActiveLink);
})();
