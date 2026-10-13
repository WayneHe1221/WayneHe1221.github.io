import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../', import.meta.url);
const output = new URL('output/pdf/Wayne-He-Resume.pdf', root);
await mkdir(new URL('output/pdf/', root), { recursive: true });

const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
});
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  await page.goto(new URL('index.html', root).href, { waitUntil: 'load' });
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await page.evaluate(async () => {
    document.documentElement.setAttribute('data-theme', 'light');
    const images = [...document.querySelectorAll('main img')];
    images.forEach(image => { image.loading = 'eager'; });
    await Promise.all(images.map(image => image.decode()));
    await document.fonts.ready;
    // 聯絡資訊放在第一頁摘要之後，讓專案頁集中呈現作品。
    document.querySelector('#skills').after(document.querySelector('#contact'));
    // PDF 專用的左右欄：截圖與成果共用高度，原始網頁的 DOM 與排版不變。
    document.querySelectorAll('.proj-card').forEach(card => {
      const gallery = card.querySelector(':scope > .shots-wrap, :scope > .shots');
      const details = card.querySelector(':scope > ul');
      if (!gallery || !details) return;
      const body = document.createElement('div');
      body.className = 'resume-project-body';
      gallery.before(body);
      body.append(gallery, details);
    });
  });
  await page.pdf({
    path: fileURLToPath(output),
    format: 'A4',
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-family:Arial,sans-serif;font-size:8px;color:#57606a;width:100%;padding:0 14mm;display:flex;justify-content:space-between"><span>Wayne He | waynehe1221.github.io</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    tagged: true,
    outline: true,
  });
  console.log(`PDF exported: ${fileURLToPath(output)}`);
} finally {
  await browser.close();
}
