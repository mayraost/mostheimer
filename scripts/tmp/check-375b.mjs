import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
// Decided consent: keeps the banner out of the measurement and the screenshot.
await page.addInitScript(() => {
  localStorage.setItem(
    'mayraostheimer.consent.v1',
    JSON.stringify({
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
      version: 1,
    }),
  );
});
await page.goto('http://127.0.0.1:3411/de/contact', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('dl a, dl button', { timeout: 20000 });
await page.waitForTimeout(1200);

const report = await page.$$eval('dl a, dl button', (els) =>
  els.map((el) => {
    const r = el.getBoundingClientRect();
    const visible = [...el.childNodes]
      .filter((n) => !(n.nodeType === 1 && n.classList.contains('sr-only')))
      .map((n) => n.textContent || '')
      .join('')
      .trim();
    const probe = document.createElement('span');
    probe.style.cssText = getComputedStyle(el).cssText;
    probe.textContent = visible;
    const cs = getComputedStyle(el);
    return {
      text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      href: el.getAttribute('href'),
      target: el.getAttribute('target'),
      rel: el.getAttribute('rel'),
      w: Math.round(r.width),
      h: Math.round(r.height),
      fontPx: cs.fontSize,
      lineHeight: cs.lineHeight,
      labelLines: Math.round(r.height / parseFloat(cs.lineHeight || '14')),
    };
  }),
);

const overflow = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));

// Reserved height check: hovering must not change geometry (no CLS).
const before = await page.$eval('dl', (el) => el.getBoundingClientRect().height);
const first = await page.$('dl a');
await first.hover();
await page.waitForTimeout(300);
const after = await page.$eval('dl', (el) => el.getBoundingClientRect().height);

console.log(JSON.stringify({ report, overflow, hoverDelta: after - before }, null, 2));

await page.$eval('dl', (el) => el.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/opencode/contact-buttons.png' });
await browser.close();
