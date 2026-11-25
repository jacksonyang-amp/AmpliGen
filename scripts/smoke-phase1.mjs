import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const FIXTURE_PATH = join(ROOT, 'src', 'content', 'phase1.fixtures.json');

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};

const failures = [];
let passCount = 0;

function record(name, ok, detail = '') {
  if (ok) passCount += 1;
  else failures.push(name);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function textOf(fragment) {
  return decodeEntities(fragment.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function anchorsIn(fragment) {
  return [...fragment.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((match) => ({
    href: /href="([^"]*)"/.exec(match[1])?.[1] ?? '',
    current: /aria-current="page"/.test(match[1]),
    label: textOf(match[2]),
  }));
}

function hasAnchor(fragment, label, href) {
  return anchorsIn(fragment).some((anchor) => anchor.label === label && anchor.href === href);
}

function itemByAttribute(html, attribute, value) {
  const pattern = new RegExp(
    `<li\\b[^>]*data-${attribute}="${escapeRegExp(value)}"[^>]*>([\\s\\S]*?)</li>`,
  );
  return pattern.exec(html)?.[1] ?? null;
}

function elementByMarker(html, tag, marker) {
  const pattern = new RegExp(`<${tag}\\b[^>]*${marker}[^>]*>([\\s\\S]*?)</${tag}>`);
  return pattern.exec(html)?.[1] ?? null;
}

function primaryNav(html) {
  return /<nav\b[^>]*aria-label="Primary"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
}

function routeToFile(route, basePath) {
  const relative = route.slice(basePath.length);
  return join(DIST, relative, 'index.html');
}

function startServer(basePath) {
  return new Promise((resolveServer, rejectServer) => {
    const server = createServer(async (req, res) => {
      const { pathname } = new URL(req.url ?? '/', 'http://127.0.0.1');
      if (!pathname.startsWith(basePath)) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('not found');
        return;
      }
      let filePath = resolve(DIST, pathname.slice(basePath.length) || 'index.html');
      if (filePath !== DIST && !filePath.startsWith(DIST + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      try {
        const info = await stat(filePath);
        if (info.isDirectory()) filePath = join(filePath, 'index.html');
        const body = await readFile(filePath);
        res.writeHead(200, { 'content-type': CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('not found');
      }
    });
    server.once('error', rejectServer);
    server.listen(0, '127.0.0.1', () => resolveServer(server));
  });
}

async function fetchPage(origin, route) {
  const response = await fetch(`${origin}${route}`);
  const html = await response.text();
  return { status: response.status, type: response.headers.get('content-type') ?? '', html };
}

async function checkRoutes(origin, fixture) {
  const pages = {};
  for (const route of fixture.routes) {
    const page = await fetchPage(origin, route);
    pages[route] = page.html;
    record(`route ${route} returns HTTP 200`, page.status === 200, `status ${page.status}`);
    record(`route ${route} is text/html`, page.type.startsWith('text/html'), page.type);

    const refs = [...page.html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
    const assetRefs = [
      ...new Set(
        refs.filter((ref) => ref.startsWith(fixture.basePath) && /\.(js|css|svg)$/.test(ref)),
      ),
    ];
    record(`route ${route} references local assets`, assetRefs.length >= 2, `${assetRefs.length} assets`);
    for (const ref of assetRefs) {
      const asset = await fetch(`${origin}${ref}`);
      await asset.arrayBuffer();
      const expected = CONTENT_TYPES[extname(ref)];
      const actual = asset.headers.get('content-type') ?? '';
      record(
        `route ${route} asset ${ref} returns 200 with ${expected}`,
        asset.status === 200 && actual.startsWith(expected),
        `status ${asset.status}, ${actual}`,
      );
    }
    record(
      `route ${route} has no asset references outside the base path`,
      refs.every((ref) => !ref.startsWith('/') || ref.startsWith(fixture.basePath)),
    );
  }
  return pages;
}

const FORBIDDEN_TERMS = [
  { name: 'Lumora', pattern: /lumora/i },
  { name: 'fictional', pattern: /fictional/i },
  { name: 'demonstration', pattern: /demonstration/i },
  { name: 'Fictional demo', pattern: /fictional demo/i },
  { name: 'API Platform Demo', pattern: /api platform demo/i },
  { name: 'demo-banner', pattern: /demo-banner/ },
];

function checkSharedPageContent(pages, fixture) {
  for (const [route, html] of Object.entries(pages)) {
    for (const term of FORBIDDEN_TERMS) {
      record(`route ${route} has no "${term.name}" in text or markup`, !term.pattern.test(html));
    }

    const pageTitle = decodeEntities(/<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? '');
    const titleOk =
      route === fixture.basePath ? pageTitle === fixture.home.title : pageTitle.endsWith(` | ${fixture.platformName}`);
    record(`route ${route} title uses the ${fixture.platformName} brand`, titleOk, pageTitle);

    const pageFooter = /<footer\b[^>]*>([\s\S]*?)<\/footer>/.exec(html)?.[1] ?? '';
    record(`route ${route} footer matches the fixture`, textOf(pageFooter) === fixture.footer);

    const anchors = anchorsIn(primaryNav(html));
    const navMatches =
      anchors.length === fixture.nav.length &&
      fixture.nav.every((item, index) => anchors[index].label === item.label && anchors[index].href === item.href);
    record(`route ${route} primary nav matches the fixture links and order`, navMatches);

    const current = anchors.filter((anchor) => anchor.current).map((anchor) => anchor.href);
    record(`route ${route} marks only its own nav link as current`, current.length === 1 && current[0] === route);

    const brand = /<span class="brand-name">([\s\S]*?)<\/span>/.exec(html)?.[1];
    record(`route ${route} header brand is "${fixture.platformName}"`, brand !== undefined && textOf(brand) === fixture.platformName);

    if (!fixture.formRoutes.includes(route)) {
      record(
        `route ${route} has no form controls`,
        !/<(form|input|textarea|select)\b/i.test(html),
      );
    }
  }
}

function checkHomePage(html, fixture) {
  const { home } = fixture;
  const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1];
  record(`home page title is exactly "${home.title}"`, title !== undefined && decodeEntities(title) === home.title);

  const description = /<meta\s+name="description"\s+content="([^"]*)"/.exec(html)?.[1] ?? '';
  record(`home page meta description uses the ${home.brand} brand`, decodeEntities(description).includes(home.brand));

  const heading = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1];
  record(`home page h1 is "${home.brand}"`, heading !== undefined && textOf(heading) === home.brand);

  const eyebrow = elementByMarker(html, 'p', 'class="eyebrow"');
  record('home page eyebrow matches the fixture', eyebrow !== null && textOf(eyebrow) === home.eyebrow);

  const lede = elementByMarker(html, 'p', 'class="lede"');
  record('home page lede matches the fixture', lede !== null && textOf(lede) === home.lede);

  const aboutLink = anchorsIn(/<nav\b[^>]*aria-label="On this page"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '').find(
    (anchor) => anchor.href === '#about',
  );
  record('home page in-page nav about link matches the fixture', aboutLink?.label === home.about.navLabel);

  const aboutSection = /<section id="about"[^>]*>([\s\S]*?)<\/section>/.exec(html)?.[1] ?? '';
  const aboutHeading = /<h2\b[^>]*>([\s\S]*?)<\/h2>/.exec(aboutSection)?.[1];
  record('home page about heading matches the fixture', aboutHeading !== undefined && textOf(aboutHeading) === home.about.heading);
  const aboutCopy = /<p\b[^>]*>([\s\S]*?)<\/p>/.exec(aboutSection)?.[1];
  record('home page about copy matches the fixture', aboutCopy !== undefined && textOf(aboutCopy) === home.about.copy);

  const ctas = elementByMarker(html, 'p', 'data-home-ctas') ?? '';
  const anchors = anchorsIn(ctas);
  record(
    'home page hero has exactly the fixture CTAs in order',
    anchors.length === home.ctas.length &&
      home.ctas.every((cta, index) => anchors[index].label === cta.label && anchors[index].href === cta.href),
  );
  for (const cta of home.ctas) {
    record(`home page hero CTA "${cta.label}" goes to ${cta.href}`, hasAnchor(ctas, cta.label, cta.href));
  }

  record(`home page does not contain "${home.forbiddenText}"`, !textOf(html).includes(home.forbiddenText));
}

function checkProductPage(html, fixture) {
  const lede = elementByMarker(html, 'p', 'class="lede"');
  record('product page lede matches the fixture', lede !== null && textOf(lede) === fixture.productPageLede);
  for (const product of fixture.products) {
    const item = itemByAttribute(html, 'product', product.name);
    record(`product page lists ${product.name}`, item !== null);
    if (item === null) continue;
    const text = textOf(item);
    record(`product page ${product.name} name matches the fixture`, text.includes(product.name));
    record(`product page ${product.name} description matches the fixture`, text.includes(product.description));
    record(
      `product page ${product.name} CTA "${product.ctaLabel}" goes to ${product.ctaHref}`,
      hasAnchor(item, product.ctaLabel, product.ctaHref),
    );
  }
  const ctas = elementByMarker(html, 'p', 'data-product-ctas') ?? '';
  for (const cta of fixture.productPageCtas) {
    record(`product page CTA "${cta.label}" goes to ${cta.href}`, hasAnchor(ctas, cta.label, cta.href));
  }
}

function checkPricingPage(html, fixture) {
  const label = elementByMarker(html, 'p', 'data-pricing-label');
  record('pricing page shows the illustrative pricing label', label !== null && textOf(label) === fixture.pricingLabel);
  for (const plan of fixture.plans) {
    const item = itemByAttribute(html, 'plan', plan.name);
    record(`pricing page lists the ${plan.name} plan`, item !== null);
    if (item === null) continue;
    const price = elementByMarker(item, 'p', 'class="price"');
    record(
      `pricing page ${plan.name} price is "${plan.price}"`,
      price !== null && textOf(price) === plan.price,
    );
    record(
      `pricing page ${plan.name} CTA "${plan.ctaLabel}" goes to ${plan.ctaHref}`,
      hasAnchor(item, plan.ctaLabel, plan.ctaHref),
    );
  }
}

function checkFormNotices(pages, fixture) {
  const base = fixture.basePath;
  const demo = elementByMarker(pages[`${base}demo-request/`], 'div', 'data-form-notice');
  record(
    'demo-request page shows the form notice from the fixture',
    demo !== null && textOf(demo) === fixture.demoRequest.copy,
  );

  const signUpHtml = pages[`${base}sign-up/`];
  const signUp = elementByMarker(signUpHtml, 'div', 'data-form-notice');
  record(
    'sign-up page shows the form notice from the fixture',
    signUp !== null && textOf(signUp) === fixture.signUp.copy,
  );
  record(
    `sign-up page links back to pricing with "${fixture.signUp.backLink.label}"`,
    hasAnchor(signUpHtml, fixture.signUp.backLink.label, fixture.signUp.backLink.href),
  );
}

async function checkPhaseBoundaries() {
  const assetDir = join(DIST, 'assets');
  const scripts = (await readdir(assetDir)).filter((name) => name.endsWith('.js'));
  const sdkInBundle = [];
  for (const name of scripts) {
    const source = await readFile(join(assetDir, name), 'utf8');
    if (/amplitude|statsig|initAll/i.test(source)) sdkInBundle.push(name);
  }
  record('built scripts include no Amplitude or Statsig SDK code', scripts.length > 0 && sdkInBundle.length === 0);

  const sourceDir = join(ROOT, 'src');
  const sourceFiles = (await readdir(sourceDir, { recursive: true })).filter((name) => /\.(ts|js)$/.test(name));
  const networkCalls = [];
  for (const name of sourceFiles) {
    const source = await readFile(join(sourceDir, name), 'utf8');
    if (/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/.test(source)) networkCalls.push(name);
  }
  record('app source makes no network calls', sourceFiles.length > 0 && networkCalls.length === 0);

  const manifest = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  const dependencyNames = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies });
  record(
    'package.json declares no Amplitude or Statsig packages',
    !dependencyNames.some((name) => /amplitude|statsig/i.test(name)),
  );
  record('package.json has no runtime dependencies', Object.keys(manifest.dependencies ?? {}).length === 0);
}

async function main() {
  const fixture = JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));

  let missing = 0;
  for (const route of fixture.routes) {
    const file = routeToFile(route, fixture.basePath);
    try {
      const info = await stat(file);
      record(`build output exists for ${route}`, info.isFile());
    } catch {
      missing += 1;
      record(`build output exists for ${route}`, false, 'run npm run build first');
    }
  }
  if (missing > 0) {
    console.log(`\nSmoke failed: ${failures.length} check(s) failed.`);
    process.exit(1);
  }

  const server = await startServer(fixture.basePath);
  try {
    const { port } = server.address();
    const origin = `http://127.0.0.1:${port}`;
    const pages = await checkRoutes(origin, fixture);
    checkSharedPageContent(pages, fixture);
    checkHomePage(pages[fixture.basePath], fixture);
    checkProductPage(pages[`${fixture.basePath}product/`], fixture);
    checkPricingPage(pages[`${fixture.basePath}pricing/`], fixture);
    checkFormNotices(pages, fixture);
    await checkPhaseBoundaries();
  } finally {
    await new Promise((done) => server.close(done));
  }

  console.log(`\n${passCount} passed, ${failures.length} failed.`);
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('Smoke check crashed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
