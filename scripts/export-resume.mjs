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
    // PDF 專用展示區：大圖、簡短圖說與成果文字分區，保留所有原始圖片。
    document.querySelectorAll('.proj-card').forEach(card => {
      const gallery = card.querySelector(':scope > .shots-wrap, :scope > .shots');
      const details = card.querySelector(':scope > ul');
      if (!gallery || !details) return;
      const panel = document.createElement('div');
      panel.className = 'resume-project-gallery';
      const label = document.createElement('div');
      label.className = 'resume-block-label';
      label.textContent = '產品畫面';
      const strip = document.createElement('div');
      strip.className = 'resume-gallery-strip';
      gallery.querySelectorAll('.shots button, button[data-src]').forEach((button, index) => {
        const figure = document.createElement('figure');
        const caption = document.createElement('figcaption');
        const title = (button.dataset.cap || '').split(' — ').slice(1).join(' — ').split('：')[0];
        caption.textContent = `${index + 1}. ${title || '應用程式畫面'}`;
        figure.append(button.querySelector('img'), caption);
        strip.append(figure);
      });
      strip.dataset.count = String(strip.children.length);
      panel.append(label, strip);
      const note = card.querySelector('.shots-note');
      if (note) panel.append(note);
      const layout = document.createElement('div');
      layout.className = 'resume-project-body';
      gallery.replaceWith(layout);
      const body = document.createElement('div');
      body.className = 'resume-project-details';
      const heading = document.createElement('div');
      heading.className = 'resume-block-label';
      heading.textContent = '開發成果';
      body.append(heading, details);
      layout.append(panel, body);
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
