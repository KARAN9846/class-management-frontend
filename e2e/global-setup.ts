import { request, type APIRequestContext, type FullConfig } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const frontendOrigin = 'http://localhost:14200';
const expectedApiBaseUrl = 'http://localhost:18080/api/v1';
const backendIdentityUrl = 'http://localhost:18080/api/v1/browser-test/identity';
const environment = (globalThis as typeof globalThis & { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

function required(name: string): string {
  const value = environment[name];
  if (!value) throw new Error(`Missing required browser-test input: ${name}`);
  return value;
}

function resolveSameOrigin(specifier: string, importer: URL): URL {
  const resolved = new URL(specifier, importer);
  if (resolved.origin !== frontendOrigin) {
    throw new Error(`Browser-test frontend imports an unexpected origin: ${resolved.origin}`);
  }
  return resolved;
}

function moduleSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  const staticImport = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImport = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

  for (const expression of [staticImport, dynamicImport]) {
    for (let match = expression.exec(source); match; match = expression.exec(source)) {
      specifiers.push(match[1]);
    }
  }
  return specifiers;
}

function configuredApiValues(source: string, moduleUrl: URL): string[] {
  const values: string[] = [];
  const property = /(?:^|[,{;])\s*['"]?apiBaseUrl['"]?\s*:\s*(["'])(.*?)\1/g;

  for (let match = property.exec(source); match; match = property.exec(source)) {
    values.push(new URL(match[2], moduleUrl.origin + '/').toString().replace(/\/$/, ''));
  }
  return values;
}

async function verifyServedFrontendApi(frontend: APIRequestContext): Promise<void> {
  const root = new URL('/', frontendOrigin);
  const rootResponse = await frontend.get(root.toString());
  if (!rootResponse.ok()) {
    throw new Error(`Browser-test frontend is not reachable: HTTP ${rootResponse.status()}`);
  }

  const html = await rootResponse.text();
  const entrypoints = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map(match => match[1])
    .filter(Boolean);
  if (entrypoints.length === 0) throw new Error('Browser-test frontend has no JavaScript entrypoint');

  const queue = entrypoints.map(specifier => resolveSameOrigin(specifier, root));
  const visited = new Set<string>();
  const values: string[] = [];

  while (queue.length > 0) {
    const moduleUrl = queue.shift()!;
    const key = moduleUrl.toString();
    if (visited.has(key)) continue;
    visited.add(key);

    const response = await frontend.get(key);
    if (!response.ok()) throw new Error(`Unable to inspect frontend module: HTTP ${response.status()} ${key}`);
    const source = await response.text();
    values.push(...configuredApiValues(source, moduleUrl));

    for (const specifier of moduleSpecifiers(source)) {
      queue.push(resolveSameOrigin(specifier, moduleUrl));
    }
  }

  const resolved = [...new Set(values)];
  if (resolved.length === 0) throw new Error('Could not find the effective apiBaseUrl in the served module graph');
  if (resolved.length !== 1 || resolved[0] !== expectedApiBaseUrl) {
    throw new Error('Served frontend API configuration does not match the isolated browser-test backend');
  }
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  for (const name of [
    'LEAVE_BROWSER_ADMIN_EMAIL',
    'LEAVE_BROWSER_TEACHER_EMAIL',
    'LEAVE_BROWSER_RESTRICTED_TEACHER_EMAIL',
    'LEAVE_BROWSER_STUDENT_EMAIL',
    'LEAVE_BROWSER_TEST_PASSWORD',
    'LEAVE_BROWSER_RUN_MARKER',
    'LEAVE_BROWSER_DB_URL',
    'PGPASSFILE',
    'LEAVE_BROWSER_MANIFEST_DIR',
    'LEAVE_BROWSER_MANIFEST_FILE',
    'LEAVE_BROWSER_FIXTURE_SCRIPT',
  ]) required(name);

  const manifestFile = required('LEAVE_BROWSER_MANIFEST_FILE');
  const marker = required('LEAVE_BROWSER_RUN_MARKER');
  const manifestDir = required('LEAVE_BROWSER_MANIFEST_DIR');
  if (environment.LEAVE_BROWSER_DB_URL !== 'jdbc:postgresql://localhost:5432/cms_leave_test') {
    throw new Error('Browser-test datasource must be exactly cms_leave_test on localhost:5432.');
  }
  if (environment.DB_URL || environment.DATABASE_URL || environment.SPRING_DATASOURCE_URL) {
    throw new Error('Browser-test datasource override variables must be unset.');
  }
  if (manifestFile !== `${manifestDir}/${marker}.manifest`) {
    throw new Error('Browser-test manifest path is not the marker-derived path.');
  }

  const manifest = await readFile(manifestFile, 'utf8');
  if (!manifest.split('\n').includes(`v1|run|${marker}`)) {
    throw new Error('Browser-test manifest does not belong to the current run.');
  }

  const configuredBaseUrl = config.projects[0].use.baseURL;
  if (configuredBaseUrl !== frontendOrigin) {
    throw new Error(`Playwright baseURL must be exactly ${frontendOrigin}`);
  }

  const identity = await request.newContext({
    baseURL: backendIdentityUrl,
    extraHTTPHeaders: { Accept: 'application/json' },
  });
  try {
    const response = await identity.get('');
    if (!response.ok()) throw new Error(`Browser-test backend identity check failed: HTTP ${response.status()}`);
    const body = await response.json() as { database?: string; port?: number; address?: string };
    if (body.database !== 'cms_leave_test' || body.port !== 5432 || !['127.0.0.1', '::1'].includes(body.address ?? '')) {
      throw new Error('Browser-test backend identity did not match cms_leave_test on loopback:5432');
    }
  } finally {
    await identity.dispose();
  }

  const frontend = await request.newContext({ baseURL: configuredBaseUrl });
  try {
    await verifyServedFrontendApi(frontend);
  } finally {
    await frontend.dispose();
  }
}
