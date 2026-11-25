import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const BASE = '/AmpliGen/';
const WORKFLOW = join(ROOT, '.github', 'workflows', 'deploy-pages.yml');

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

const failures = [];
const passes = [];

function record(name, ok, detail = '') {
  (ok ? passes : failures).push(name);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
}

function startServer() {
  return new Promise((resolveServer, rejectServer) => {
    const server = createServer(async (req, res) => {
      const { pathname } = new URL(req.url ?? '/', 'http://127.0.0.1');
      if (!pathname.startsWith(BASE)) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('not found');
        return;
      }
      const relative = pathname.slice(BASE.length);
      let filePath = resolve(DIST, relative || 'index.html');
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

async function checkBuildOutput() {
  try {
    const info = await stat(join(DIST, 'index.html'));
    record('build output dist/index.html exists', info.isFile());
  } catch {
    record('build output dist/index.html exists', false, 'run npm run build first');
  }
}

async function checkServedSite(origin) {
  const homeUrl = `${origin}${BASE}`;
  const home = await fetch(homeUrl);
  const html = await home.text();
  record(
    'home page returns HTTP 200 under base path',
    home.status === 200,
    `status ${home.status}`,
  );
  record(
    'home page content type is text/html',
    (home.headers.get('content-type') ?? '').startsWith('text/html'),
  );
  record('home page shows AmpliGen title', html.includes('<title>AmpliGen</title>'));
  record('home page includes the AmpliGen brand', html.includes('<span class="brand-name">AmpliGen</span>'));
  record(
    'home page has in-page navigation targets',
    html.includes('href="#overview"') && html.includes('id="capabilities"') && html.includes('id="about"'),
  );

  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  const localRefs = [...new Set(refs.filter((ref) => ref.startsWith('/') && !ref.startsWith('//')))];
  const externalRefs = refs.filter((ref) => /^(https?:)?\/\//.test(ref));
  record('home page references local assets', localRefs.length > 0, `${localRefs.length} local refs`);
  record(
    'all local asset references are under the base path',
    localRefs.every((ref) => ref.startsWith(BASE) || ref.startsWith('#')),
  );
  record('home page references no external assets', externalRefs.length === 0);

  for (const ref of localRefs) {
    const assetUrl = `${origin}${ref}`;
    const res = await fetch(assetUrl);
    await res.arrayBuffer();
    const ext = extname(new URL(assetUrl).pathname);
    const expected = CONTENT_TYPES[ext];
    const actual = res.headers.get('content-type') ?? '';
    const typeOk = expected ? actual.startsWith(expected) : true;
    record(`asset ${ref} returns HTTP 200`, res.status === 200, `status ${res.status}`);
    if (expected) record(`asset ${ref} content type ${expected}`, typeOk, actual);
  }

  const hasScript = localRefs.some((ref) => ref.endsWith('.js'));
  const hasStyle = localRefs.some((ref) => ref.endsWith('.css'));
  record('built page includes a module script and stylesheet', hasScript && hasStyle);
}

async function checkWorkflow() {
  let workflow;
  try {
    workflow = await readFile(WORKFLOW, 'utf8');
  } catch {
    record('workflow file exists', false, '.github/workflows/deploy-pages.yml');
    return;
  }
  record('workflow file exists', true);

  const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  record(
    'package build script is the workflow build command',
    pkg.scripts?.build === 'vite build' && /run:\s*npm run build\s*$/m.test(workflow),
  );

  const buildStep =
    /- name: Build\s*\n\s*run: npm run build\s*\n\s*env:\s*\n\s*VITE_AMPLITUDE_API_KEY: \$\{\{ secrets\.NEXT_PUBLIC_AMPLITUDE_API_KEY \}\}\s*\n\s*VITE_STATSIG_CLIENT_KEY: \$\{\{ secrets\.NEXT_PUBLIC_STATSIG_CLIENT_KEY \}\}/.test(
      workflow,
    );
  record('workflow build step has both exact secret-to-Vite mappings', buildStep);

  const uploadsDist = /uses: actions\/upload-pages-artifact@v\d+\s*\n\s*with:\s*\n\s*path: dist\s*$/m.test(workflow);
  record('workflow uploads the dist output to Pages', uploadsDist);

  const buildBeforeUpload =
    workflow.indexOf('run: npm run build') !== -1 &&
    workflow.indexOf('run: npm run build') < workflow.indexOf('upload-pages-artifact');
  record('workflow builds before uploading', buildBeforeUpload);

  record('workflow does not trigger on pull requests', !/^\s*pull_request/m.test(workflow));
  record('workflow deploys only from the pages environment job', /environment:\s*\n\s*name: github-pages/.test(workflow));
}

async function main() {
  await checkBuildOutput();
  await checkWorkflow();

  if (failures.includes('build output dist/index.html exists')) {
    console.log(`\nSmoke failed: ${failures.length} check(s) failed.`);
    process.exit(1);
  }

  const server = await startServer();
  try {
    const { port } = server.address();
    await checkServedSite(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((done) => server.close(done));
  }

  console.log(`\n${passes.length} passed, ${failures.length} failed.`);
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('Smoke check crashed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
