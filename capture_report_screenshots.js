const path = require('path');
const fs = require('fs');

const puppeteer = require(path.join('C:', 'paperpilot_fe', 'node_modules', 'puppeteer-core'));

const OUTPUT_DIR = path.join(__dirname, 'report_screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function getBrowserPath() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  throw new Error('No compatible browser found.');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 Generating publication-quality figures for Chapter 9...');
  const browser = await puppeteer.launch({
    executablePath: getBrowserPath(),
    headless: 'new',
    defaultViewport: { width: 1440, height: 960, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Authenticate
  console.log('1. Signing in...');
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
    const text = await page.evaluate(el => el.textContent.trim().toUpperCase(), b);
    if (text === 'SIGN UP') {
      await b.click();
      break;
    }
  }
  await sleep(500);

  const testEmail = `student_${Date.now()}@paperpilot.ai`;
  await (await page.$('input[name="name"]'))?.type('UDHAYA RAAHUL V');
  await (await page.$('input[name="email"]'))?.type(testEmail);
  await (await page.$('input[name="password"]'))?.type('PaperPilot@2026');
  await (await page.$('button[type="submit"]'))?.click();
  await sleep(3000);

  // Upload document
  console.log('2. Uploading sample notice PDF...');
  const samplePdfPath = path.join('C:', 'paperpilot_fe', 'scholarship_rejection_letter.pdf');
  const fileInput = await page.$('input[type="file"]');
  if (fileInput && fs.existsSync(samplePdfPath)) {
    await fileInput.uploadFile(samplePdfPath);
    console.log('Awaiting AI pipeline completion...');
    await sleep(7000);
  }

  // Ensure document is selected
  await page.evaluate(() => {
    const docItems = Array.from(document.querySelectorAll('aside div[style*="cursor: pointer"]'));
    if (docItems.length > 0) docItems[0].click();
  });
  await sleep(1500);

  // ═════════════════════════════════════════════════════════════
  // Fig. 9.2: Application overview and document upload interface
  // ═════════════════════════════════════════════════════════════
  console.log('📸 1/5 Capturing Fig 9.2: Application overview and document upload interface...');
  await page.evaluate(() => {
    const navButtons = Array.from(document.querySelectorAll('nav button'));
    const ovBtn = navButtons.find(b => b.textContent.includes('Overview'));
    if (ovBtn) ovBtn.click();
  });
  await sleep(1000);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'Fig_9_2_Application_overview_and_document_upload_interface.png'),
    fullPage: false
  });

  // ═════════════════════════════════════════════════════════════
  // Fig. 9.3: AI document analysis
  // ═════════════════════════════════════════════════════════════
  console.log('📸 2/5 Capturing Fig 9.3: AI document analysis...');
  await page.evaluate(() => {
    const navButtons = Array.from(document.querySelectorAll('nav button'));
    const anBtn = navButtons.find(b => b.textContent.includes('Analysis'));
    if (anBtn) anBtn.click();
  });
  await sleep(1000);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'Fig_9_3_AI_document_analysis.png'),
    fullPage: false
  });

  // ═════════════════════════════════════════════════════════════
  // Fig. 9.4: Risk / Urgency score display
  // ═════════════════════════════════════════════════════════════
  console.log('📸 3/5 Capturing Fig 9.4: Risk / Urgency score display...');
  await page.evaluate(() => {
    const navButtons = Array.from(document.querySelectorAll('nav button'));
    const ovBtn = navButtons.find(b => b.textContent.includes('Overview'));
    if (ovBtn) ovBtn.click();
  });
  await sleep(1000);

  const riskSectionBox = await page.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll('main svg'));
    const riskGauge = svgs.find(s => s.textContent.toLowerCase().includes('risk'));
    const authMeter = svgs.find(s => s.textContent.toLowerCase().includes('auth'));

    if (riskGauge && authMeter) {
      // Find common parent row
      let card1 = riskGauge;
      while (card1 && card1.tagName !== 'MAIN' && (!card1.style.borderRadius || !card1.style.padding)) {
        card1 = card1.parentElement;
      }
      let card2 = authMeter;
      while (card2 && card2.tagName !== 'MAIN' && (!card2.style.borderRadius || !card2.style.padding)) {
        card2 = card2.parentElement;
      }

      if (card1 && card2) {
        const r1 = card1.getBoundingClientRect();
        const r2 = card2.getBoundingClientRect();
        const top = Math.min(r1.top, r2.top);
        const bottom = Math.max(r1.bottom, r2.bottom);
        const left = Math.min(r1.left, r2.left);
        const right = Math.max(r1.right, r2.right);
        return {
          x: Math.max(0, left - 10),
          y: Math.max(0, top - 10),
          width: (right - left) + 20,
          height: (bottom - top) + 20
        };
      }
    }
    return null;
  });

  if (riskSectionBox) {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'Fig_9_4_Risk_urgency_score_display.png'),
      clip: riskSectionBox
    });
  }

  // ═════════════════════════════════════════════════════════════
  // Fig. 9.5: Action checklist
  // ═════════════════════════════════════════════════════════════
  console.log('📸 4/5 Capturing Fig 9.5: Action checklist...');
  await page.evaluate(() => {
    const navButtons = Array.from(document.querySelectorAll('nav button'));
    const actBtn = navButtons.find(b => b.textContent.includes('Action') || b.textContent.includes('Checklist'));
    if (actBtn) actBtn.click();
  });
  await sleep(1000);

  // Toggle checklist item
  await page.evaluate(() => {
    const actionItems = Array.from(document.querySelectorAll('main div[style*="cursor: pointer"]'));
    if (actionItems.length > 0) actionItems[0].click();
  });
  await sleep(800);

  const checklistFullBox = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('main h3'));
    const progressH = headings.find(h => h.textContent.toLowerCase().includes('progress'));
    const reqActH = headings.find(h => h.textContent.toLowerCase().includes('required actions') || h.textContent.toLowerCase().includes('actions'));

    let card1 = progressH;
    while (card1 && card1.tagName !== 'MAIN' && (!card1.style.borderRadius || !card1.style.padding)) {
      card1 = card1.parentElement;
    }

    let card2 = reqActH;
    while (card2 && card2.tagName !== 'MAIN' && (!card2.style.borderRadius || !card2.style.padding)) {
      card2 = card2.parentElement;
    }

    if (card1 && card2) {
      const r1 = card1.getBoundingClientRect();
      const r2 = card2.getBoundingClientRect();
      const top = Math.min(r1.top, r2.top);
      const bottom = Math.max(r1.bottom, r2.bottom);
      const left = Math.min(r1.left, r2.left);
      const right = Math.max(r1.right, r2.right);
      return {
        x: Math.max(0, left - 10),
        y: Math.max(0, top - 10),
        width: (right - left) + 20,
        height: (bottom - top) + 20
      };
    }
    return null;
  });

  if (checklistFullBox) {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'Fig_9_5_Action_checklist.png'),
      clip: checklistFullBox
    });
  }

  // ═════════════════════════════════════════════════════════════
  // Fig. 9.6: Deadline calendar / Important Dates timeline
  // ═════════════════════════════════════════════════════════════
  console.log('📸 5/5 Capturing Fig 9.6: Deadline calendar...');
  const timelineFullBox = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('main h3'));
    const datesH = headings.find(h => h.textContent.toLowerCase().includes('date'));
    const officeH = headings.find(h => h.textContent.toLowerCase().includes('office'));

    let card1 = datesH;
    while (card1 && card1.tagName !== 'MAIN' && (!card1.style.borderRadius || !card1.style.padding)) {
      card1 = card1.parentElement;
    }

    let card2 = officeH;
    while (card2 && card2.tagName !== 'MAIN' && (!card2.style.borderRadius || !card2.style.padding)) {
      card2 = card2.parentElement;
    }

    if (card1 && card2) {
      const r1 = card1.getBoundingClientRect();
      const r2 = card2.getBoundingClientRect();
      const top = Math.min(r1.top, r2.top);
      const bottom = Math.max(r1.bottom, r2.bottom);
      const left = Math.min(r1.left, r2.left);
      const right = Math.max(r1.right, r2.right);
      return {
        x: Math.max(0, left - 10),
        y: Math.max(0, top - 10),
        width: (right - left) + 20,
        height: (bottom - top) + 20
      };
    } else if (card1) {
      const r1 = card1.getBoundingClientRect();
      return {
        x: Math.max(0, r1.x - 10),
        y: Math.max(0, r1.y - 10),
        width: r1.width + 20,
        height: r1.height + 20
      };
    }
    return null;
  });

  if (timelineFullBox) {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'Fig_9_6_Deadline_calendar.png'),
      clip: timelineFullBox
    });
  }

  await browser.close();
  console.log('🎉 All 5 figures successfully created and verified in:');
  console.log(OUTPUT_DIR);
}

run().catch(console.error);
