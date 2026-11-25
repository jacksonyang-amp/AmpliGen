export const BASE_PATH = '/AmpliGen';

export function appPath(route: string): string {
  return `${BASE_PATH}${route.startsWith('/') ? route : `/${route}`}`;
}

export const ROUTES = {
  home: '/AmpliGen/',
  product: '/AmpliGen/product/',
  pricing: '/AmpliGen/pricing/',
  demoRequest: '/AmpliGen/demo-request/',
  demoRequestSuccess: '/AmpliGen/demo-request/success/',
  signUp: '/AmpliGen/sign-up/',
  welcome: '/AmpliGen/welcome/',
} as const;

export function normalizePagePath(pathname: string): string {
  const withoutIndex = pathname.replace(/index\.html$/, '');
  return withoutIndex.endsWith('/') ? withoutIndex : `${withoutIndex}/`;
}
