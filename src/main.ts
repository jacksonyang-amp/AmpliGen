import './style.css';

const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link');
const main = document.querySelector<HTMLElement>('#main');

skipLink?.addEventListener('click', () => {
  main?.focus();
});
