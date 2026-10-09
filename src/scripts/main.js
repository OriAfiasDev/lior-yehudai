// Small progressive enhancements. The page is complete without this file.

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Header gets a hairline once the page moves.
const header = document.querySelector('[data-header]');
if (header) {
  let ticking = false;
  const update = () => {
    header.toggleAttribute('data-scrolled', scrollY > 8);
    ticking = false;
  };
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

// Mobile dock: visible once the hero's own buttons are above the viewport, hidden
// again while the contact section is on screen.
const dock = document.querySelector('[data-dock]');
const heroActions = document.querySelector('[data-hero-actions]');
const contact = document.querySelector('[data-contact]');
if (dock && heroActions && 'IntersectionObserver' in window) {
  let heroPassed = false;
  let contactInView = false;
  const sync = () => {
    const show = heroPassed && !contactInView;
    dock.classList.toggle('is-visible', show);
    dock.inert = !show;
  };
  new IntersectionObserver(([entry]) => {
    heroPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    sync();
  }).observe(heroActions);
  if (contact) {
    new IntersectionObserver(([entry]) => {
      contactInView = entry.isIntersecting;
      sync();
    }).observe(contact);
  }
}

// "What worries you": pin the stage and show one sentence per scroll step. Skipped with
// reduced motion and on very short screens, where the plain list reads better.
const worries = document.querySelector('[data-worries]');
if (worries) {
  const track = worries.querySelector('.worries-track');
  const stage = worries.querySelector('.worries-stage');
  const items = [...worries.querySelectorAll('.worry')];
  const current = worries.querySelector('[data-worries-current]');
  let active = -1;
  let frame = 0;

  const update = () => {
    frame = 0;
    const rect = track.getBoundingClientRect();
    const range = rect.height - stage.offsetHeight;
    const progress = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
    worries.style.setProperty('--progress', progress.toFixed(4));
    const index = Math.min(items.length - 1, Math.floor(progress * items.length));
    if (index === active) return;
    active = index;
    items.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
      item.classList.toggle('is-past', i < index);
    });
    jumps.forEach((btn, i) => btn.setAttribute('aria-current', String(i === index)));
    if (current) current.textContent = index + 1;
  };

  // Index (desktop): jump straight to a topic's scroll step.
  const jumps = [...worries.querySelectorAll('[data-worries-jump]')];
  jumps.forEach((btn) =>
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.worriesJump);
      const range = track.offsetHeight - stage.offsetHeight;
      const top = track.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + (range * (i + 0.5)) / items.length, behavior: 'instant' });
    }),
  );
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const setMode = () => {
    const pin = !reduceMotion && innerHeight >= 520 && items.length > 1;
    if (pin === worries.classList.contains('is-pinned')) return;
    worries.classList.toggle('is-pinned', pin);
    active = -1;
    if (pin) {
      update();
      addEventListener('scroll', onScroll, { passive: true });
    } else {
      removeEventListener('scroll', onScroll);
      items.forEach((item) => item.classList.remove('is-active', 'is-past'));
    }
  };
  setMode();
  addEventListener('resize', setMode, { passive: true });
}

// Reveal fallback for browsers without scroll-driven animations.
if (!root.classList.contains('sdt') && !reduceMotion && 'IntersectionObserver' in window) {
  root.classList.add('no-sdt');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  document.querySelectorAll('[data-reveal], [data-draw]').forEach((el) => io.observe(el));
}

// Contact clicks are the site's success metric. If an analytics layer is added later
// (GTM, Plausible...), it receives these without touching the markup.
document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-cta]');
  if (!link) return;
  const detail = { cta: link.dataset.cta, section: link.closest('section')?.id ?? 'chrome' };
  window.dataLayer?.push({ event: 'contact_click', ...detail });
  document.dispatchEvent(new CustomEvent('contact:click', { detail }));
});
