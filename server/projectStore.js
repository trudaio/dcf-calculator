import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
dotenv.config();

const PROJECTS_DIR = (process.env.PROJECTS_DIR || '~/FinancialDashboardProjects').replace('~', os.homedir());

function ensureDir() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  }
}

export function listProjects() {
  ensureDir();
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

export function loadProject(name) {
  ensureDir();
  const filePath = path.join(PROJECTS_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function saveProject(name, projectObject) {
  ensureDir();
  const filePath = path.join(PROJECTS_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(projectObject, null, 2), 'utf-8');
  return { saved: true, path: filePath };
}

export function deleteProject(name) {
  const filePath = path.join(PROJECTS_DIR, `${name}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}
