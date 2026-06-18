import { chromium } from 'playwright';
import fs from 'fs';

const OUT = '/tmp/preview';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1320, height: 1400 }, deviceScaleFactor: 2 });

await page.goto('http://localhost:5188/', { waitUntil: 'networkidle' });

// Load a ticker
await page.fill('input[placeholder="MSFT"]', 'AAPL');
await page.click('button:has-text("Load")');
await page.waitForSelector('text=DCF Fair Value', { timeout: 15000 });
await page.waitForTimeout(1200);

const tabs = [
  ['Overview', '01-overview'],
  ['FCF & CAPEX', '02-fcf'],
  ['Profitability', '03-profitability'],
  ['Valuation (DCF)', '04-dcf'],
  ['Sensitivity', '05-sensitivity'],
];

for (const [label, file] of tabs) {
  await page.click(`.tab:has-text("${label}")`);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${file}.png`, fullPage: true });
  console.log('captured', file);
}

// Peers tab needs input
await page.click('.tab:has-text("Peers")');
await page.waitForTimeout(500);
await page.fill('input[placeholder="e.g. AAPL, GOOGL, META, AMZN"]', 'MSFT, GOOGL, NVDA, AMZN');
await page.click('button:has-text("Load Peers")');
await page.waitForSelector('text=Implied Price', { timeout: 15000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/06-peers.png`, fullPage: true });
console.log('captured 06-peers');

await browser.close();
console.log('done');
