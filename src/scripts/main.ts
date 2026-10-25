// The page's one script: mobile nav, solution tabs, reveal on scroll, stat count-up and the contact form.
// Everything here is an enhancement: with JS off the page is fully readable and the form posts normally.
// Copy shown by the script (form messages, nav labels) comes from data-* attributes rendered from en.ts.

// First thing: tell the inline <head> script that this module runs. Without this flag it removes the
// `js` class at DOMContentLoaded and the page falls back to the no-JS layout (see Base.astro).
document.documentElement.classList.add('js-ready');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasObserver = 'IntersectionObserver' in window;

// ---------- Mobile nav ----------
function initNav(): void {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');
  if (!nav || !burger) return;

  const setOpen = (open: boolean): void => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', (open ? burger.dataset.labelClose : burger.dataset.labelOpen) ?? '');
  };

  burger.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  links?.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      burger.focus();
    }
  });
  // MediaQueryList.addEventListener is Safari 14+; older engines only have addListener.
  const wide = matchMedia('(min-width: 901px)');
  const closeOnWide = (event: MediaQueryListEvent): void => {
    if (event.matches) setOpen(false);
  };
  if ('addEventListener' in wide) wide.addEventListener('change', closeOnWide);
  else (wide as MediaQueryList).addListener(closeOnWide);
}

// ---------- Solution tabs ----------
// Click, ArrowLeft/ArrowRight (wraps), Home/End, roving tabindex. `data-ready` switches the CSS from
// "all panels stacked" (no JS) to "one panel at a time".
function initTabs(): void {
  const root = document.querySelector<HTMLElement>('[data-tabs]');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));

  const select = (index: number, focus = false): void => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls') ?? '')?.classList.toggle('is-active', on);
    });
    if (focus) tabs[index]?.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      let next: number;
      if (event.key === 'ArrowRight') next = i === last ? 0 : i + 1;
      else if (event.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = last;
      else return;
      event.preventDefault();
      select(next, true);
    });
  });

  root.dataset.ready = '';
}

// ---------- Reveal on scroll ----------
const showAllReveals = (): void => {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('in'));
};

function initReveal(): void {
  const items = document.querySelectorAll<HTMLElement>('.reveal');
  if (!hasObserver || reduceMotion) {
    showAllReveals();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    },
    // Fire as soon as the top edge is 8% into the viewport; works for elements taller than the screen too.
    { rootMargin: '0px 0px -8% 0px' },
  );
  items.forEach((item) => observer.observe(item));
}

// ---------- Stat count-up ----------
// The final value is already in the markup; here it restarts from 0 once the stat is on screen.
function initCounters(): void {
  const counters = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!counters.length || !hasObserver || reduceMotion) return;

  const show = (el: HTMLElement, value: number): void => {
    el.textContent = `${value}${el.dataset.suffix ?? ''}`;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const el = entry.target as HTMLElement;
        const end = Number(el.dataset.count);
        const start = performance.now();
        const tick = (now: number): void => {
          const progress = Math.min(1, (now - start) / 1200);
          show(el, Math.round(end * (1 - Math.pow(1 - progress, 3)))); // ease-out
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => {
    show(el, 0);
    observer.observe(el);
  });
}

// ---------- Contact form (Web3Forms) ----------
type Field = HTMLInputElement | HTMLTextAreaElement;

function initForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const status = form?.querySelector<HTMLElement>('[data-form-status]');
  const submit = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  const label = submit?.querySelector<HTMLElement>('[data-submit-label]');
  if (!form || !status || !submit || !label) return;

  const messages = {
    sending: form.dataset.sending ?? '',
    success: form.dataset.success ?? '',
    error: form.dataset.error ?? '',
    required: form.dataset.required ?? '',
  };
  const idleLabel = label.textContent ?? '';
  const say = (state: 'success' | 'error', text: string): void => {
    status.dataset.state = state;
    status.textContent = text;
  };

  form.noValidate = true; // the script shows its own message; without JS the browser validates natively

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const required = Array.from(form.querySelectorAll<Field>('[required]'));
    const missing = required.filter((field) => !field.value.trim() || !field.checkValidity());
    required.forEach((field) => field.setAttribute('aria-invalid', String(missing.includes(field))));
    if (missing.length) {
      say('error', messages.required);
      missing[0].focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    if (!data.access_key) {
      say('error', messages.error); // no Web3Forms key configured (see src/data/site.ts): don't send
      return;
    }

    submit.disabled = true;
    label.textContent = messages.sending;
    status.textContent = '';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { success?: boolean };
      if (response.ok && result.success) {
        form.reset();
        say('success', messages.success);
      } else {
        say('error', messages.error);
      }
    } catch {
      say('error', messages.error);
    } finally {
      submit.disabled = false;
      label.textContent = idleLabel;
    }
  });
}

// Each feature runs on its own, so one failing (e.g. a missing browser API) can't stop the others.
// If reveal fails, everything is shown rather than left hidden.
const run = (init: () => void, fallback?: () => void): void => {
  try {
    init();
  } catch (error) {
    console.error(error);
    fallback?.();
  }
};

run(initNav);
run(initTabs);
run(initReveal, showAllReveals);
run(initCounters);
run(initForm);
