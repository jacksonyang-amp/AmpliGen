import './style.css';
import { recordPageView } from './identity/navigation.ts';
import { getBrowserContext } from './ui/runtime.ts';

const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link');
const main = document.querySelector<HTMLElement>('#main');

skipLink?.addEventListener('click', () => {
  main?.focus();
});

recordPageView(getBrowserContext().navigationStorage, window.location.pathname);
