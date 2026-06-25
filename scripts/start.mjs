#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import { existsSync, copyFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = process.argv.slice(2);
const skipDocker = args.includes('--skip-docker');
const skipDb = args.includes('--skip-db');

const log = {
  info: (msg) => console.log(`\x1b[36m→\x1b[0m ${msg}`),
  ok: (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m!\x1b[0m ${msg}`),
  err: (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  title: (msg) => console.log(`\n\x1b[1m${msg}\x1b[0m\n`),
};

function run(command, options = {}) {
  execSync(command, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    ...options,
  });
}

function runSilent(command) {
  try {
    execSync(command, { cwd: ROOT, stdio: 'ignore', shell: true });
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureEnvFiles() {
  const apiEnv = join(ROOT, 'apps/api/.env');
  const webEnv = join(ROOT, 'apps/web/.env.local');
  const exampleEnv = join(ROOT, '.env.example');

  if (!existsSync(apiEnv) && existsSync(exampleEnv)) {
    copyFileSync(exampleEnv, apiEnv);
    log.ok('Criado apps/api/.env');
  }

  if (!existsSync(webEnv)) {
    const content = 'NEXT_PUBLIC_API_URL=http://localhost:3001\n';
    writeFileSync(webEnv, content);
    log.ok('Criado apps/web/.env.local');
  }
}

function isDockerRunning() {
  return runSilent('docker info');
}

function isPostgresReady() {
  return runSilent(
    'docker exec soccer-postgres pg_isready -U soccer -d soccer_analytics',
  );
}

async function waitForPostgres(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    if (isPostgresReady()) return true;
    await sleep(1000);
  }
  return false;
}

async function setupDatabase() {
  log.info('Gerando Prisma client...');
  run('pnpm db:generate');

  log.info('Aplicando schema no banco...');
  run('pnpm db:push');

  log.info('Populando dados iniciais...');
  run('pnpm db:seed');
}

function startDev() {
  log.title('Soccer Analytics — ambiente pronto');
  console.log('  Frontend  → http://localhost:3000');
  console.log('  API       → http://localhost:3001');
  console.log('  Swagger   → http://localhost:3001/api/docs');
  console.log('  Login     → admin@soccer-analytics.local / change-me-in-production');
  console.log('\n  Pressione Ctrl+C para parar.\n');

  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const child = spawn(pnpm, ['dev'], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  child.on('exit', (code) => process.exit(code ?? 0));
}

async function main() {
  log.title('⚽ Soccer Analytics do ATM — Iniciando...');

  ensureEnvFiles();

  let dbReady = false;

  if (!skipDocker) {
    if (!isDockerRunning()) {
      log.warn('Docker não está rodando. API e login funcionam, mas jogos precisam do banco.');
      log.warn('Abra o Docker Desktop e rode `pnpm start` novamente.');
    } else {
      log.info('Subindo PostgreSQL + Redis...');
      run('docker compose up -d');

      log.info('Aguardando PostgreSQL...');
      dbReady = await waitForPostgres();

      if (dbReady) {
        log.ok('PostgreSQL pronto');
      } else {
        log.warn('PostgreSQL não respondeu a tempo. Continuando sem banco...');
      }
    }
  }

  if (!skipDb && dbReady) {
    try {
      await setupDatabase();
      log.ok('Banco configurado');
    } catch {
      log.warn('Falha ao configurar banco. API sobe sem dados de jogos.');
    }
  }

  startDev();
}

main().catch((err) => {
  log.err(err.message);
  process.exit(1);
});
