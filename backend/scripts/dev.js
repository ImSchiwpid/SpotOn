import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');
const frontendDir = path.resolve(backendDir, '..', 'frontend');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm' : 'npm';

const backendProc = spawn(npmCmd, ['run', 'dev:api'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: isWindows
});

const frontendProc = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: isWindows
});

let isShuttingDown = false;

const shutdown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  if (backendProc && !backendProc.killed) backendProc.kill('SIGINT');
  if (frontendProc && !frontendProc.killed) frontendProc.kill('SIGINT');
};

backendProc.on('error', (error) => {
  console.error('Failed to start backend process:', error.message);
  shutdown();
  process.exit(1);
});

frontendProc.on('error', (error) => {
  console.error('Failed to start frontend process:', error.message);
  shutdown();
  process.exit(1);
});

backendProc.on('exit', (code) => {
  if (!isShuttingDown) {
    console.error(`Backend process exited with code ${code ?? 0}. Stopping frontend.`);
    shutdown();
  }
  process.exit(code ?? 0);
});

frontendProc.on('exit', (code) => {
  if (!isShuttingDown) {
    console.error(`Frontend process exited with code ${code ?? 0}. Stopping backend.`);
    shutdown();
  }
  process.exit(code ?? 0);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
