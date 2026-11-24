'use strict';

const menu = document.querySelector('.menu');
const nav = document.getElementById('navegacao');
const desktop = window.matchMedia('(min-width: 50rem)');

function updateMenu(open = false) {
  if (!menu || !nav) return;
  menu.hidden = desktop.matches;
  nav.hidden = !desktop.matches && !open;
  menu.setAttribute('aria-expanded', String(!desktop.matches && open));
}

updateMenu();
document.documentElement.classList.add('enhanced');

if (menu && nav) {
  desktop.addEventListener('change', () => {
    const active = document.activeElement;
    updateMenu(!desktop.matches && nav.contains(active));
    if (desktop.matches && active === menu) nav.querySelector('a')?.focus();
  });

  menu.addEventListener('click', () => updateMenu(nav.hidden));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      updateMenu();
      menu.focus();
    }
  });

  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || desktop.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById(link.hash.slice(1));
    updateMenu();
    if (section) {
      section.tabIndex = -1;
      section.focus({ preventScroll: true });
    }
  });
}

// A rolagem usa âncoras nativas e scroll-behavior, inclusive ao abrir um link direto.
const floatingLink = document.querySelector('.floating');
const whatsApp = floatingLink ? new URL(floatingLink.href) : null;

function conversationUrl(message) {
  if (!whatsApp) return '#';
  const url = new URL(whatsApp);
  url.searchParams.set('text', message);
  return url.href;
}

if (whatsApp) {
  document.querySelectorAll('[data-wa]').forEach((link) => {
    link.href = conversationUrl(link.dataset.wa);
  });
}

const questions = document.querySelectorAll('.faq details');
questions.forEach((question) => {
  question.addEventListener('toggle', () => {
    if (!question.open) return;
    questions.forEach((item) => {
      if (item !== question) item.open = false;
    });
  });
});

const form = document.getElementById('consulta');
if (form) {
  form.hidden = false;
  const fields = [form.elements.nome, form.elements.mensagem].filter(Boolean);
  fields.forEach((field) => {
    field.addEventListener('input', () => field.setCustomValidity(''));
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    fields.forEach((field) => {
      const minimum = field.minLength;
      field.setCustomValidity(field.value.trim().length < minimum ? `Preencha com pelo menos ${minimum} caracteres.` : '');
    });
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const message = [
      'Olá, Mercado Mady!',
      `Meu nome: ${String(data.get('nome') || '').trim()}`,
      `Categoria: ${String(data.get('categoria') || '')}`,
      `Consulta: ${String(data.get('mensagem') || '').trim()}`
    ].join('\n');
    window.location.assign(conversationUrl(message));
  });
}

const mapButton = document.querySelector('.map-button');
if (mapButton) {
  mapButton.hidden = false;
  mapButton.addEventListener('click', () => {
    const container = mapButton.closest('.map');
    if (!container || !container.dataset.map) return;
    const frame = document.createElement('iframe');
    frame.title = 'Mapa da localização do Mercado Mady';
    frame.src = container.dataset.map;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    mapButton.replaceWith(frame);
    container.querySelector('a')?.focus();
  });
}

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('enter');
      observer.unobserve(target);
    });
  }, { threshold: 0.13 });

  document.querySelectorAll('.hero-art, .products .card, .form-card').forEach((item) => observer.observe(item));
}
