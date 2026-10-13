# 何玟叡 Wayne He｜個人履歷

Android 資深高階工程師的個人履歷與作品集，涵蓋技能、工作經歷、專利認證、專案成果及聯絡方式。

**[查看線上履歷](https://waynehe1221.github.io/)** · **[下載完整履歷 PDF](https://github.com/WayneHe1221/WayneHe1221.github.io/raw/refs/heads/master/output/pdf/Wayne-He-Resume.pdf)**

## 網站內容

- Android、Kotlin / Java、MVVM、Jetpack 與 Kotlin Multiplatform 開發技能
- 工作經歷、發明專利與相關認證
- 商業產品與個人專案介紹、截圖及產品連結
- Email、GitHub 與 LinkedIn 聯絡方式

## 專案結構

- `index.html`：履歷內容、網站樣式與互動功能
- `assets/`：專案圖示與截圖
- `output/pdf/Wayne-He-Resume.pdf`：供網站直接從 GitHub 下載的完整履歷
- `scripts/export-resume.mjs`：從目前網頁內容產生 A4 PDF

網站為 HTML、CSS 與 JavaScript 靜態頁面，透過 GitHub Pages 從 `master` 分支發布。

## 更新 PDF

PDF 是已產生的檔案。修改履歷內容後，請重新匯出並將 PDF 與網頁一起提交。

需要 Node.js 20 以上、Playwright，以及支援繁體中文的字型（例如 macOS 的 PingFang TC 或 Noto Sans TC）。

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node scripts/export-resume.mjs
```

也可設定 `CHROME_PATH`，使用本機 Chrome 執行匯出。匯出會等待全部圖片與字型載入，保留文字與可點擊連結，並套用專用的列印樣式。發布前請逐頁檢查 PDF 的中文、截圖及分頁。
