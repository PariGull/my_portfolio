/* ==========================================================================
   PARI GULL — PORTFOLIO · main.js
   Navigation · scroll reveal · project rendering · lightbox · forms · modals
   Vanilla JS, no dependencies.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   *  CONFIG
   * ------------------------------------------------------------------ */
  const CONFIG = {
    // Leave empty to fall back to the visitor's email client (mailto).
    // To enable real submissions, create a form at https://formspree.io and
    // paste the endpoint here, e.g. 'https://formspree.io/f/xxxxxxxx'.
    formEndpoint: '',
    email: 'parigull111094@gmail.com',
  };

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   *  1. PROJECTS — edit this array to add or reorder projects
   *     category: 'web' | 'data' | 'ml' | 'math'
   *     status:   'live' | 'demo' | 'soon'
   *     demos:    in-page tools that open a modal
   * ------------------------------------------------------------------ */
  const PROJECTS = [
    {
      title: 'Personal Finance Tracker & Forecasting',
      category: 'data',
      year: '2025',
      status: 'live',
      featured: true,
      description:
        'A full-stack finance dashboard: transaction ledger with parameterised SQL queries, category budgets with threshold warnings, CSV import/export, and one-to-three month expense forecasts.',
      problem:
        'Monthly spending is easy to lose track of — and budgets fail quietly when nothing warns you before the limit is crossed.',
      tech: ['Python', 'Streamlit', 'SQLite', 'pandas', 'Plotly', 'statsmodels'],
      image: 'assets/img/projects/finance-tracker.jpg',
      links: [
        { label: 'Live site', href: 'https://parigull.github.io/personal_finance_tracker/', primary: true, external: true },
        { label: 'Source code', href: 'https://github.com/Parigull/personal_finance_tracker', external: true },
      ],
    },
    {
      title: 'Interactive Mathematics Lab',
      category: 'math',
      year: '2025',
      status: 'demo',
      description:
        'Six browser-native tools built with vanilla JavaScript and the Canvas API: scientific calculator, function grapher, statistics playground, linear programming solver, population models and Monte Carlo estimation.',
      problem:
        'Mathematical intuition is hard to build from static formulas. These tools let you change a parameter and watch the result immediately.',
      tech: ['JavaScript', 'Canvas API', 'HTML', 'CSS'],
      image: 'assets/img/projects/math-lab.jpg',
      links: [
        { label: 'Source code', href: 'https://github.com/PariGull/my_portfolio', external: true },
      ],
      demos: [
        { label: 'Calculator', modal: 'calcModal' },
        { label: 'Graphing', modal: 'mathModal1' },
        { label: 'Statistics', modal: 'mathModal2' },
        { label: 'Linear programming', modal: 'mathModal3' },
        { label: 'Population', modal: 'mathModal4' },
        { label: 'Monte Carlo', modal: 'mathModal5' },
      ],
    },
    {
      title: 'Linear Algebra Playground',
      category: 'math',
      year: '2025',
      status: 'live',
      description:
        'An interactive visualiser for 2D linear transformations, matrix operations and eigenvectors, with presets for common transformations and live matrix properties.',
      problem:
        'Matrix transformations stay abstract on paper — until you can see the plane stretch, rotate and shear.',
      tech: ['JavaScript', 'HTML', 'CSS', 'Linear Algebra'],
      image: 'assets/img/projects/linear-algebra.jpg',
      links: [
        { label: 'Live demo', href: 'https://linearalgebraplayground-blond.vercel.app', primary: true, external: true },
        { label: 'Preview build', href: 'https://linearalgebraplayground-2me63e575-pari-gull.vercel.app', external: true, requiresLogin: true },
        { label: 'Source code', href: 'https://github.com/Parigull/Linear_Algebra_-playground-', external: true },
      ],
    },
    {
      title: 'Department Website',
      category: 'web',
      year: '2025',
      status: 'live',
      description:
        'A multi-page departmental website with dedicated pages for courses, faculty, laboratories, gallery and contact — built as a consistent, navigable information structure.',
      problem:
        'Department information was scattered across unrelated pages. Visitors needed one coherent, easy-to-scan structure.',
      tech: ['HTML', 'CSS', 'Responsive layout'],
      image: 'assets/img/projects/department-site.jpg',
      links: [
        { label: 'Source code', href: 'https://github.com/PariGull/Department-website', external: true },
      ],
    },
    {
      title: 'Math Quiz App',
      category: 'web',
      year: '2024',
      status: 'live',
      description:
        'A browser-based arithmetic quiz that generates questions on the fly and gives immediate feedback on answers.',
      problem:
        'Practising arithmetic needs instant feedback. A static worksheet can\u2019t tell you where you went wrong.',
      tech: ['JavaScript', 'HTML', 'CSS'],
      image: 'assets/img/projects/math-quiz.jpg',
      links: [
        { label: 'Source code', href: 'https://github.com/PariGull/math-quiz-app', external: true },
      ],
    },
    {
      title: 'Predictive Modelling Sandbox',
      category: 'ml',
      year: '2026',
      status: 'soon',
      description:
        'A work-in-progress space for supervised learning experiments — regression, classification and model evaluation on small public datasets, with the reasoning behind each metric documented.',
      problem:
        'Most beginner machine-learning examples stop at a single accuracy number. The interesting part is knowing when that number lies.',
      tech: ['Python', 'scikit-learn', 'pandas'],
      links: [],
      demoNote: 'Under development',
    },
  ];

  const CATEGORY_LABEL = {
    web: 'Web Development',
    data: 'Data Analytics',
    ml: 'Machine Learning',
    math: 'Mathematical',
  };

  const ICON = {
    external: '#i-external',
    code: '#i-github',
    play: '#i-spark',
  };

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  /* ------------------------------------------------------------------ *
   *  2. PROJECT RENDERING + FILTERING
   * ------------------------------------------------------------------ */
  const grid = $('#projectGrid');
  const countEl = $('#projectCount');

  function projectCard(p) {
    const isSoon = p.status === 'soon';
    const badgeClass = isSoon ? 'project__badge--soon' : p.status === 'live' ? 'project__badge--live' : '';
    const badgeText = isSoon ? 'Coming soon' : p.status === 'live' ? 'Live' : 'In-page demo';

    const media = p.image
      ? `<img src="${p.image}" alt="${escapeHtml(p.title)} — project preview" loading="lazy" decoding="async" width="1200" height="675" />`
      : `<span class="project__glyph project__glyph--mono">
           <svg class="icon" aria-hidden="true"><use href="${p.category === 'ml' ? '#i-brain' : '#i-code'}"/></svg>
           ${escapeHtml(CATEGORY_LABEL[p.category])}
         </span>`;

    const mediaTag = p.links.length && p.status !== 'soon' && p.image
      ? `<a class="project__media" href="${p.links[0].href}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(p.title)} — open project">${badge(p.badge || badgeText, badgeClass)}${media}</a>`
      : `<button class="project__media" type="button" ${p.image ? `data-shot="${p.image}" data-caption="${escapeHtml(p.title)}"` : 'disabled'} aria-label="${escapeHtml(p.title)} — preview">${badge(badgeText, badgeClass)}${media}</button>`;

    const demoButtons = (p.demos || [])
      .map((d) => `<button class="pill-link" type="button" data-open-modal="${d.modal}">${escapeHtml(d.label)}</button>`)
      .join('');

    const links = (p.links || [])
      .map(
        (l) => `<a class="pill-link${l.primary ? ' pill-link--primary' : ''}" href="${l.href}"
          ${l.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
          ${l.requiresLogin ? 'title="Opens a Vercel sign-in screen — a Vercel account is required to view this preview build"' : ''}>
          <svg class="icon" aria-hidden="true"><use href="${l.label.toLowerCase().includes('source') ? ICON.code : ICON.external}"/></svg>
          ${escapeHtml(l.label)}${l.requiresLogin ? '<svg class="icon pill-link__lock" aria-hidden="true"><use href="#i-lock"/></svg>' : ''}</a>`
      )
      .join('');

    const soonNote = p.demoNote ? `<span class="mono" style="font-size:.62rem;color:var(--text-dim)">${escapeHtml(p.demoNote)}</span>` : '';

    const actions = links || demoButtons || soonNote
      ? `<div class="project__actions">
           ${demoButtons ? `<div class="project__demos">${demoButtons}</div>` : ''}
           ${links}
           ${soonNote}
         </div>`
      : '';

    return `
      <article class="project${p.featured ? ' project--featured' : ''}${isSoon ? ' project--soon' : ''}" data-category="${p.category}" data-reveal>
        ${mediaTag}
        <div class="project__body">
          <div class="project__top">
            <h3 class="project__title">${escapeHtml(p.title)}</h3>
            <span class="project__year">${escapeHtml(p.year || '')}</span>
          </div>
          <p class="project__desc">${escapeHtml(p.description)}</p>
          <div class="project__problem">
            <span>Problem</span>
            ${escapeHtml(p.problem)}
          </div>
          <ul class="chips chips--sm">${p.tech.map((t) => `<li class="chip">${escapeHtml(t)}</li>`).join('')}</ul>
          ${actions}
        </div>
      </article>`;
  }

  const badge = (text, cls) => `<span class="project__badge ${cls}">${escapeHtml(text)}</span>`;

  function renderProjects(filter = 'all') {
    if (!grid) return;
    const list = filter === 'all' ? PROJECTS : PROJECTS.filter((p) => p.category === filter);
    grid.innerHTML = list.map(projectCard).join('');
    if (countEl) {
      countEl.textContent = `${String(list.length).padStart(2, '0')} project${list.length === 1 ? '' : 's'}`;
    }
    // Reveal newly rendered cards immediately if they are already in view
    observeReveals(grid);
    observeSpotlight(grid);
    bindDataAttributes(grid);
  }

  $$('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.filter').forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      renderProjects(btn.dataset.filter);
    });
  });

  /* ------------------------------------------------------------------ *
   *  3. SCROLL REVEAL
   * ------------------------------------------------------------------ */
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
      )
    : null;

  function observeReveals(root = document) {
    $$('[data-reveal]', root).forEach((el) => {
      if (el.classList.contains('is-revealed')) return;
      const delay = el.dataset.revealDelay;
      if (delay) el.style.setProperty('--rd', delay);
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-revealed');
    });
  }

  /* ------------------------------------------------------------------ *
   *  4. HEADER: scroll state · active section · mobile menu
   * ------------------------------------------------------------------ */
  const header = $('#siteHeader');
  const navLinks = $$('.nav__link');
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href');
      const section = id && id.startsWith('#') ? $(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 12);
      const toTop = $('#toTop');
      if (toTop) toTop.classList.toggle('is-visible', y > 620);

      // Active section
      const probe = y + window.innerHeight * 0.32;
      let current = sections[0];
      sections.forEach((item) => {
        if (item.section.offsetTop <= probe) current = item;
      });
      navLinks.forEach((l) => l.classList.toggle('is-active', current && l === current.link));

      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.hidden = !open;
    document.body.classList.toggle('is-locked', open);
    if (open) {
      const first = $('a', mobileMenu);
      if (first) first.focus({ preventScroll: true });
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => setMenu(mobileMenu.hidden));
    $$('a', mobileMenu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.hidden) setMenu(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && !mobileMenu.hidden) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------ *
   *  5. MODAL CONTROLLER (used by every tool + lightboxes)
   * ------------------------------------------------------------------ */
  let lastFocused = null;

  function focusableIn(el) {
    return $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', el)
      .filter((n) => n.offsetParent !== null || n === document.activeElement);
  }

  window.openModal = function openModal(id) {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`[portfolio] Modal "${id}" not found.`);
      return;
    }
    lastFocused = document.activeElement;
    el.style.display = 'flex';
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');

    const target = $('.modal__close', el) || focusableIn(el)[0];
    if (target) target.focus({ preventScroll: true });

    document.dispatchEvent(new CustomEvent('modal:open', { detail: { id } }));
  };

  window.closeModal = function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');

    const anyOpen = $$('.modal').some((m) => m.style.display === 'flex');
    if (!anyOpen) document.body.classList.remove('is-locked');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
      lastFocused = null;
    }
  };

  // Overlay click + Escape + focus trap
  $$('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeModal(modal.id);
    });
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const items = focusableIn(modal);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = $$('.modal').filter((m) => m.style.display === 'flex').pop();
    if (open) window.closeModal(open.id);
  });

  /* ------------------------------------------------------------------ *
   *  6. LIGHTBOXES + data-open-modal buttons
   * ------------------------------------------------------------------ */
  function openLightbox(modalId, imgId, captionId, src, caption) {
    const img = document.getElementById(imgId);
    const cap = document.getElementById(captionId);
    if (!img) return;
    img.src = src;
    img.alt = caption || 'Preview';
    if (cap) cap.textContent = caption || '';
    window.openModal(modalId);
  }

  function bindDataAttributes(root = document) {
    $$('[data-lightbox]', root).forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () =>
        openLightbox('lightboxModal', 'lightboxImage', 'lightboxCaption', btn.dataset.lightbox, btn.dataset.caption)
      );
    });

    $$('[data-shot]', root).forEach((el) => {
      if (el.dataset.bound) return;
      el.dataset.bound = '1';
      el.addEventListener('click', () =>
        openLightbox('shotModal', 'shotImage', 'shotCaption', el.dataset.shot, el.dataset.caption)
      );
    });

    $$('[data-open-modal]', root).forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => window.openModal(btn.dataset.openModal));
    });
  }

  /* ------------------------------------------------------------------ *
   *  7. SPOTLIGHT HOVER (cards)
   * ------------------------------------------------------------------ */
  function observeSpotlight(root = document) {
    $$('.skill, .project', root).forEach((card) => {
      if (card.dataset.spot) return;
      card.dataset.spot = '1';
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ------------------------------------------------------------------ *
   *  8. CONTACT: copy email + form
   * ------------------------------------------------------------------ */
  const copyBtn = $('#copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = copyBtn.dataset.email || CONFIG.email;
      const label = $('.copy-btn__text', copyBtn);
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const tmp = document.createElement('textarea');
        tmp.value = text;
        tmp.setAttribute('readonly', '');
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        tmp.remove();
      }
      copyBtn.classList.add('is-copied');
      if (label) label.textContent = 'Copied';
      setTimeout(() => {
        copyBtn.classList.remove('is-copied');
        if (label) label.textContent = 'Copy';
      }, 2000);
    });
  }

  const form = $('#contactForm');
  if (form) {
    const status = $('#formStatus');

    const showError = (name, message) => {
      const field = form.querySelector(`[name="${name}"]`)?.closest('.field');
      if (!field) return;
      field.classList.toggle('has-error', Boolean(message));
      const slot = field.querySelector(`[data-error-for="${name}"]`);
      if (slot) slot.textContent = message || '';
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);

      // Honeypot — silently drop obvious bots
      if (String(data.get('company') || '').trim()) return;

      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();
      const subject = String(data.get('subject') || '').trim() || `Portfolio enquiry from ${name || 'a visitor'}`;

      let valid = true;
      if (name.length < 2) {
        showError('name', 'Please enter your name.');
        valid = false;
      } else showError('name', '');

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        showError('email', 'Please enter a valid email address.');
        valid = false;
      } else showError('email', '');

      if (message.length < 10) {
        showError('message', 'A little more detail helps — at least 10 characters.');
        valid = false;
      } else showError('message', '');

      if (!valid) {
        if (status) {
          status.textContent = 'Please fix the highlighted fields.';
          status.classList.add('is-error');
        }
        form.querySelector('.has-error input, .has-error textarea')?.focus();
        return;
      }

      if (!CONFIG.formEndpoint) {
        // Honest fallback: hand the message to the visitor's mail client.
        const body = `${message}\n\n— ${name}\n${email}`;
        const mailto = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
        if (status) {
          status.classList.remove('is-error');
          status.textContent = `Opening your email app with this message ready to send. If nothing happens, email ${CONFIG.email} directly.`;
        }
        return;
      }

      if (status) {
        status.classList.remove('is-error');
        status.textContent = 'Sending…';
      }
      const submitBtn = form.querySelector('.form__submit');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        form.reset();
        if (status) status.textContent = 'Message sent. I\u2019ll reply as soon as I can.';
      } catch (err) {
        if (status) {
          status.classList.add('is-error');
          status.textContent = `Could not send that. Please email ${CONFIG.email} directly.`;
        }
        console.error('[portfolio] form error', err);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    $$('input, textarea', form).forEach((input) => {
      input.addEventListener('input', () => {
        const field = input.closest('.field');
        if (field && field.classList.contains('has-error')) {
          field.classList.remove('has-error');
          const slot = field.querySelector(`[data-error-for="${field.querySelector('input, textarea')?.name}"]`);
          if (slot) slot.textContent = '';
        }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   *  9. BACK TO TOP + YEAR
   * ------------------------------------------------------------------ */
  const toTop = $('#toTop');
  if (toTop) {
    toTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    );
  }

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------ *
   *  10. CURSOR GLOW (desktop, decorative)
   * ------------------------------------------------------------------ */
  const glow = $('#cursorGlow');
  if (glow && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
    let gx = 0, gy = 0, cx = 0, cy = 0, active = false;
    window.addEventListener(
      'pointermove',
      (e) => {
        gx = e.clientX;
        gy = e.clientY;
        if (!active) {
          active = true;
          glow.style.opacity = '1';
          cx = gx;
          cy = gy;
          requestAnimationFrame(loop);
        }
      },
      { passive: true }
    );
    window.addEventListener('pointerleave', () => {
      active = false;
      glow.style.opacity = '0';
    });

    function loop() {
      if (!active) return;
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
  }

  /* ------------------------------------------------------------------ *
   *  11. HERO CANVAS — lightweight node constellation
   * ------------------------------------------------------------------ */
  const canvas = $('#heroCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let raf = null;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(64, Math.max(22, (width * height) / 26000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.7,
        c: Math.random() > 0.62 ? '34, 211, 238' : '139, 92, 246',
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < -20) a.x = width + 20;
        if (a.x > width + 20) a.x = -20;
        if (a.y < -20) a.y = height + 20;
        if (a.y > height + 20) a.y = -20;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - dist / 130) * 0.22})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = `rgba(${a.c}, 0.75)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    function start() {
      if (raf) return;
      raf = requestAnimationFrame(draw);
    }
    function stop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = null;
    }

    resize();
    start();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    });

    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { threshold: 0.01 }
      ).observe(canvas);
    }
  }

  /* ------------------------------------------------------------------ *
   *  12. INIT
   * ------------------------------------------------------------------ */
  renderProjects('all');
  observeReveals();
  bindDataAttributes();
  observeSpotlight();
  onScroll();

  // Custom event used by the math tools after a modal opens
  document.dispatchEvent(new CustomEvent('portfolio:ready'));
})();
