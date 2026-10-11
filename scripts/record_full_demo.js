const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const googleTTS = require('google-tts-api');
const { execSync } = require('child_process');

let ffmpegPath;
try {
  ffmpegPath = require('ffmpeg-static');
} catch (e) {
  ffmpegPath = 'ffmpeg';
}

function getAudioDurationSeconds(filePath) {
  try {
    const cmd = `"${ffmpegPath}" -i "${filePath}" 2>&1`;
    const output = execSync(cmd, { encoding: 'utf8' });
    const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = parseFloat(match[1]);
      const minutes = parseFloat(match[2]);
      const seconds = parseFloat(match[3]);
      return hours * 3600 + minutes * 60 + seconds;
    }
  } catch (e) {
    // FFmpeg outputs duration in stderr which causes execSync to exit with code 1, but output is captured
    const output = e.output ? e.output.join('\n') : e.message;
    const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = parseFloat(match[1]);
      const minutes = parseFloat(match[2]);
      const seconds = parseFloat(match[3]);
      return hours * 3600 + minutes * 60 + seconds;
    }
  }
  return 15; // fallback
}

async function runPerfectSelfRecording() {
  console.log('=== STARTING PERFECTLY SYNCHRONIZED 2:20 MIN RECORDING ===');
  const outputDir = path.join(__dirname, '..', 'generated', 'video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // -------------------------------------------------------------
  // STEP 1: Generate High-Quality Synchronized Voice Narration
  // Target: ~2 Minutes 20 Seconds (140s)
  // -------------------------------------------------------------
  console.log('[1/4] Generating synchronized scene-by-scene voice narration...');

  const scenes = [
    {
      id: 'scene1_intro',
      title: 'Header & Language Switching',
      narration: [
        "Welcome to SiteForge, the autonomous verified AI website builder.",
        "Notice our sticky app header featuring real-time multi-language support for English, Telugu, and Hindi, along with instant light and dark theme mode toggles."
      ]
    },
    {
      id: 'scene2_studio',
      title: 'Interactive Studio Sandbox & Viewports',
      narration: [
        "In our live interactive studio playground, SiteForge scrapes real-time web sources and synthesizes a validated site specification.",
        "You can switch viewports on the fly to inspect live responsive previews across desktop, tablet, and mobile 375 pixel viewports."
      ]
    },
    {
      id: 'scene3_evidence',
      title: 'Evidence & Grounded RAG Claims',
      narration: [
        "Every generated business claim is backed by grounded RAG citations.",
        "In the Evidence tab, SiteForge links claims directly to knowledge sources like Telangana culinary guides, PDF notes, or web research with 98% confidence scores."
      ]
    },
    {
      id: 'scene4_workflow',
      title: '4-Step Autonomous Workflow',
      narration: [
        "SiteForge executes a structured four-step workflow: starting from prompt research, moving to visual studio editing, automated Playwright browser crawl testing, and 1-click offline ZIP export."
      ]
    },
    {
      id: 'scene5_comparison',
      title: 'The Problem Solved',
      narration: [
        "We solve traditional AI website builder flaws: eliminating hallucinations with grounded RAG citations, preventing dead links with automated Playwright browser tests, and stopping overwrite damage using SHA-256 section hash proofs."
      ]
    },
    {
      id: 'scene6_deepdives',
      title: 'Engine Output & Student Knowledge Library',
      narration: [
        "Our Playwright engine verifies 100% of links, contact forms, and contrast ratios before export.",
        "For students and researchers, the Knowledge Library ingests study notes to generate flashcards and revision sites grounded strictly in uploaded documents."
      ]
    },
    {
      id: 'scene7_faq_outro',
      title: 'FAQ Search & Outro',
      narration: [
        "Explore our interactive FAQ search, multi-language support, and zero vendor lock-in HTML export.",
        "Thank you for exploring SiteForge."
      ]
    }
  ];

  const sceneDurations = [];
  const concatenatedAudioFiles = [];

  for (let sIdx = 0; sIdx < scenes.length; sIdx++) {
    const scene = scenes[sIdx];
    console.log(` -> Processing Audio for ${scene.title} (${sIdx + 1}/${scenes.length})...`);
    
    const segmentBuffers = [];
    for (const textLine of scene.narration) {
      try {
        const results = await googleTTS.getAllAudioBase64(textLine, {
          lang: 'en',
          slow: false,
          host: 'https://translate.google.com',
          timeout: 10000,
        });
        for (const res of results) {
          segmentBuffers.push(Buffer.from(res.base64, 'base64'));
        }
      } catch (err) {
        console.warn(`    Warning on TTS: ${err.message}`);
      }
    }

    const sceneAudioPath = path.join(outputDir, `${scene.id}.mp3`);
    fs.writeFileSync(sceneAudioPath, Buffer.concat(segmentBuffers));
    
    const duration = getAudioDurationSeconds(sceneAudioPath);
    sceneDurations.push(duration);
    concatenatedAudioFiles.push(sceneAudioPath);
    console.log(`    ✓ ${scene.id}.mp3 duration: ${duration.toFixed(2)}s`);
  }

  // Create combined master voiceover file
  const concatListPath = path.join(outputDir, 'audio_concat.txt');
  const concatContent = concatenatedAudioFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  const masterVoiceoverPath = path.join(outputDir, 'voiceover_synced.mp3');
  execSync(`"${ffmpegPath}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${masterVoiceoverPath}"`, { stdio: 'ignore' });
  
  const totalAudioDuration = getAudioDurationSeconds(masterVoiceoverPath);
  console.log(` ✓ Master Synchronized Audio Created: ${masterVoiceoverPath}`);
  console.log(`   Total Audio Duration: ${totalAudioDuration.toFixed(2)} seconds (${Math.floor(totalAudioDuration/60)}m ${(totalAudioDuration%60).toFixed(0)}s)`);

  // -------------------------------------------------------------
  // STEP 2: Launch Playwright & Record High-FPS Smooth Walkthrough
  // -------------------------------------------------------------
  console.log('[2/4] Launching Playwright browser & starting high-FPS self-recording...');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-gpu-rasterization',
      '--enable-zero-copy',
      '--ignore-gpu-blocklist'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  console.log(' -> Opening http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Helper function for smooth scrolling without stutter
  async function smoothScrollTo(selectorOrId, durationMs) {
    await page.evaluate(async ({ selectorOrId, durationMs }) => {
      const el = document.getElementById(selectorOrId) || document.querySelector(selectorOrId);
      if (!el) return;
      const targetY = el.getBoundingClientRect().top + window.pageYOffset - 80;
      const startY = window.pageYOffset;
      const diff = targetY - startY;
      const startTime = performance.now();

      return new Promise(resolve => {
        function step(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / durationMs, 1);
          // Ease in-out quad
          const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
          window.scrollTo(0, startY + diff * ease);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    }, { selectorOrId, durationMs });
  }

  // ── SCENE 1: Header, Language & Theme Toggle ──
  console.log(' -> Recording Scene 1 (Header & Languages)...');
  const dur1 = sceneDurations[0];
  await page.hover('header');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("తెలుగు")').catch(() => {});
  await page.waitForTimeout(Math.max(1000, (dur1 * 1000) / 4));
  await page.click('button:has-text("हिन्दी")').catch(() => {});
  await page.waitForTimeout(Math.max(1000, (dur1 * 1000) / 4));
  await page.click('button:has-text("EN")').catch(() => {});
  await page.waitForTimeout(Math.max(1000, (dur1 * 1000) / 4));
  await page.click('header button[title*="Theme"]').catch(() => {});
  await page.waitForTimeout(1000);
  await page.click('header button[title*="Theme"]').catch(() => {});
  await page.waitForTimeout(1000);

  // ── SCENE 2: Interactive Studio Sandbox & Viewports ──
  console.log(' -> Recording Scene 2 (Studio Playground & Breakpoints)...');
  const dur2 = sceneDurations[1];
  await smoothScrollTo('studio-demo', 1200);
  await page.waitForTimeout(1000);

  await page.click('button:has-text("1. Prompt & Research")').catch(() => {});
  await page.waitForTimeout(1500);
  await page.click('button:has-text("Synthesize Spec")').catch(() => {});
  await page.waitForTimeout(2500);

  await page.click('button:has-text("768px")').catch(() => {});
  await page.waitForTimeout(2000);
  await page.click('button:has-text("375px")').catch(() => {});
  await page.waitForTimeout(2000);
  await page.click('button:has-text("1280px")').catch(() => {});
  await page.waitForTimeout(Math.max(1000, (dur2 * 1000) - 10200));

  // ── SCENE 3: Evidence & RAG Claims ──
  console.log(' -> Recording Scene 3 (Evidence & Grounded RAG)...');
  const dur3 = sceneDurations[2];
  await page.click('button:has-text("3. Evidence & RAG Claims")').catch(() => {});
  await page.waitForTimeout(Math.max(2000, dur3 * 1000));

  // ── SCENE 4: 4-Step Autonomous Workflow ──
  console.log(' -> Recording Scene 4 (4-Step Workflow)...');
  const dur4 = sceneDurations[3];
  await smoothScrollTo('workflow', 1500);
  await page.waitForTimeout(Math.max(2000, (dur4 * 1000) - 1500));

  // ── SCENE 5: The Problem Solved ──
  console.log(' -> Recording Scene 5 (Problem Comparison)...');
  const dur5 = sceneDurations[4];
  await smoothScrollTo('comparison', 1500);
  await page.waitForTimeout(Math.max(2000, (dur5 * 1000) - 1500));

  // ── SCENE 6: Deep Dives & Student Knowledge Library ──
  console.log(' -> Recording Scene 6 (Deep Dives & Student Library)...');
  const dur6 = sceneDurations[5];
  await smoothScrollTo('deep-dives', 1500);
  await page.waitForTimeout((dur6 * 1000) / 2);
  await smoothScrollTo('students', 1500);
  await page.waitForTimeout((dur6 * 1000) / 2);

  // ── SCENE 7: FAQ & Outro ──
  console.log(' -> Recording Scene 7 (FAQ Accordion & Outro)...');
  const dur7 = sceneDurations[6];
  await smoothScrollTo('faq', 1500);
  await page.waitForTimeout(1500);

  const faqButtons = await page.$$('button:has-text("?")');
  if (faqButtons.length > 0) {
    await faqButtons[0].click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  // Smooth scroll to bottom footer
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
  await page.waitForTimeout(Math.max(2000, (dur7 * 1000) - 5000));

  // Close context to finalize WebM video stream
  await context.close();
  await browser.close();

  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm'));
  if (files.length === 0) {
    console.error('ERROR: No webm video file found!');
    return;
  }

  const rawVideoPath = path.join(outputDir, files[files.length - 1]);
  console.log(` ✓ Raw WebM video recorded: ${rawVideoPath}`);

  // -------------------------------------------------------------
  // STEP 3: Combine Video & Master Synchronized Audio with FFmpeg
  // -------------------------------------------------------------
  console.log('[3/4] Merging Video and Synchronized Audio with High-Quality FFmpeg settings...');
  const finalVideoPath = path.join(outputDir, 'siteforge_demo_perfect_2m20s.mp4');

  try {
    // Recode to H.264 @ 30 FPS, CRF 18 (visually lossless), aligned audio length
    const cmd = `"${ffmpegPath}" -y -i "${rawVideoPath}" -i "${masterVoiceoverPath}" -c:v libx264 -preset medium -crf 18 -r 30 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${finalVideoPath}"`;
    
    console.log(` Executing: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    console.log(` ✓ Perfect MP4 video created: ${finalVideoPath}`);
  } catch (err) {
    console.warn(` FFmpeg merge notice: ${err.message}`);
  }

  console.log('\n=== PERFECT SELF-RECORDING PIPELINE COMPLETE ===');
  console.log(`Final Video File: ${finalVideoPath}`);
  console.log(`Final Voiceover File: ${masterVoiceoverPath}`);
  console.log(`Target Duration: ~2 minutes 20 seconds`);
}

runPerfectSelfRecording().catch(err => {
  console.error('Self-recording failed:', err);
  process.exit(1);
});
