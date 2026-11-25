#!/usr/bin/env node
/**
 * Write a local .env from a Firebase web config object.
 * Usage:
 *   npm run setup:env
 *   npm run setup:env -- '{"apiKey":"...","authDomain":"..."}'
 *   echo '{"apiKey":"..."}' | npm run setup:env
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const REQUIRED_KEYS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

function parseFirebaseConfig(raw) {
  const text = String(raw || '').trim();
  if (!text) {
    throw new Error('No Firebase config provided.');
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (!objectMatch) {
    throw new Error('Could not find a { ... } object in the pasted config.');
  }

  let jsonish = objectMatch[0]
    .replace(/(\w+)\s*:/g, '"$1":')
    .replace(/'/g, '"')
    .replace(/,\s*}/g, '}');

  const parsed = JSON.parse(jsonish);
  const missing = REQUIRED_KEYS.filter((key) => !parsed[key]);
  if (missing.length) {
    throw new Error(`Missing required keys: ${missing.join(', ')}`);
  }
  return parsed;
}

function toEnv(config) {
  return [
    `VITE_FIREBASE_API_KEY=${config.apiKey}`,
    `VITE_FIREBASE_AUTH_DOMAIN=${config.authDomain}`,
    `VITE_FIREBASE_PROJECT_ID=${config.projectId}`,
    `VITE_FIREBASE_STORAGE_BUCKET=${config.storageBucket}`,
    `VITE_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}`,
    `VITE_FIREBASE_APP_ID=${config.appId}`,
    config.measurementId ? `VITE_FIREBASE_MEASUREMENT_ID=${config.measurementId}` : null,
    ''
  ].filter((line) => line !== null).join('\n');
}

async function readConfig() {
  const arg = process.argv.slice(2).join(' ').trim();
  if (arg) return arg;

  if (!input.isTTY) {
    const chunks = [];
    for await (const chunk of input) chunks.push(chunk);
    return chunks.join('');
  }

  const rl = createInterface({ input, output });
  console.log('Paste your Firebase web config (JSON or the JS snippet from Firebase Console).');
  console.log('Press Enter, then Ctrl+D (or Ctrl+Z on Windows) when done.\n');
  const lines = [];
  for await (const line of rl) {
    lines.push(line);
  }
  return lines.join('\n');
}

const config = parseFirebaseConfig(await readConfig());
const envPath = resolve(process.cwd(), '.env');
writeFileSync(envPath, toEnv(config), 'utf8');
console.log(`Wrote ${envPath}`);
console.log('You can now run: npm run dev');
