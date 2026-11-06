import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
await page.goto('http://127.0.0.1:3411/de/contact', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const actions = await page.$$eval('dl a, dl button', (els) =>
  els.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      href: el.getAttribute('href'),
      rel: el.getAttribute('rel'),
      target: el.getAttribute('target'),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  }),
);

const overflow = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));

const labelWraps = await page.$$eval('dl a, dl button', (els) =>
  els.map((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = range.getClientRects().length;
    return { text: (el.textContent || '').trim().slice(0, 20), lines: rects };
  }),
);

console.log(JSON.stringify({ actions, overflow, labelWraps }, null, 2));

const section = await page.$('dl');
if (section) await section.scrollIntoViewIfNeeded();
await page.screenshot({ path: '/tmp/opencode/contact-buttons.png', fullPage: true });
await browser.close();
