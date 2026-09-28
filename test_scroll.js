const path = require('path');
const fs = require('fs');
const puppeteer = require(path.join('C:', 'paperpilot_fe', 'node_modules', 'puppeteer-core'));

async function checkScroll() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    defaultViewport: { width: 1400, height: 860, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  
  // Sign up
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
    const text = await page.evaluate(el => el.textContent.trim().toUpperCase(), b);
    if (text === 'SIGN UP') { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 500));
  const testEmail = `student_${Date.now()}@paperpilot.ai`;
  await (await page.$('input[name="name"]'))?.type('UDHAYA RAAHUL V');
  await (await page.$('input[name="email"]'))?.type(testEmail);
  await (await page.$('input[name="password"]'))?.type('PaperPilot@2026');
  await (await page.$('button[type="submit"]'))?.click();
  await new Promise(r => setTimeout(r, 2500));

  // Upload
  const samplePdfPath = path.join('C:', 'paperpilot_fe', 'scholarship_rejection_letter.pdf');
  const fileInput = await page.$('input[type="file"]');
  if (fileInput && fs.existsSync(samplePdfPath)) {
    await fileInput.uploadFile(samplePdfPath);
    await new Promise(r => setTimeout(r, 7000));
  }

  const scrollInfo = await page.evaluate(() => {
    const main = document.querySelector('main');
    const body = document.body;
    const docEl = document.documentElement;
    return {
      mainScrollHeight: main?.scrollHeight,
      mainClientHeight: main?.clientHeight,
      mainScrollTop: main?.scrollTop,
      windowScrollHeight: docEl.scrollHeight,
      windowClientHeight: docEl.clientHeight,
    };
  });
  console.log('Scroll Info:', JSON.stringify(scrollInfo));
  await browser.close();
}
checkScroll().catch(console.error);
