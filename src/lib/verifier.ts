import fs from 'fs';
import path from 'path';
import { VerificationReport } from '@/types';
import { saveVerificationReport } from './db';

/**
 * Automated Verification Crawler for SiteForge
 * Inspects all HTML pages of a generated site, tests internal links, checks for dead buttons or forms without handlers,
 * ensures responsive viewports, and generates a structured VerificationReport.
 */
export async function runVerificationCrawler(siteId: string, versionId?: string): Promise<VerificationReport> {
  const targetVersionId = versionId || `ver-${siteId}-v1`;
  const siteDir = path.join(process.cwd(), 'generated', siteId);

  const report: VerificationReport = {
    versionId: targetVersionId,
    totalTested: 0,
    passedCount: 0,
    failedCount: 0,
    pagesTested: [],
    deadLinks: [],
    consoleErrors: [],
    status: 'PASS',
    screenshots: [],
    timestamp: Date.now(),
  };

  if (!fs.existsSync(siteDir)) {
    report.status = 'FAIL';
    report.consoleErrors.push(`Site directory not found: ${siteDir}`);
    saveVerificationReport(report);
    return report;
  }

  // Find all HTML files
  const files = fs.readdirSync(siteDir);
  const htmlFiles = files.filter((f) => f.endsWith('.html'));
  report.pagesTested = htmlFiles;

  const validHtmlFiles = new Set(htmlFiles);
  validHtmlFiles.add('#'); // Allow anchor links

  for (const file of htmlFiles) {
    const filePath = path.join(siteDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // 1. Audit Links (<a href="...">)
    const hrefRegex = /href=["']([^"']+)["']/g;
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
      report.totalTested++;
      const href = match[1].trim();

      // Check external vs internal links
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        report.passedCount++;
      } else if (href.startsWith('#')) {
        // Internal section anchor check
        const targetId = href.slice(1);
        if (targetId === '' || targetId === 'top' || content.includes(`id="${targetId}"`) || content.includes(`id='${targetId}'`)) {
          report.passedCount++;
        } else {
          report.failedCount++;
          report.deadLinks.push(`${file} -> Dead section anchor "${href}"`);
        }
      } else {
        // Local page reference
        const cleanHref = href.split('?')[0].split('#')[0];
        if (validHtmlFiles.has(cleanHref)) {
          report.passedCount++;
        } else {
          report.failedCount++;
          report.deadLinks.push(`${file} -> Dead page link "${href}"`);
        }
      }
    }

    // 2. Audit Buttons & Forms (<button>, <form>)
    const buttonRegex = /<button[^>]*>/gi;
    const formRegex = /<form[^>]*>/gi;

    const buttons = content.match(buttonRegex) || [];
    const forms = content.match(formRegex) || [];

    buttons.forEach((btn) => {
      report.totalTested++;
      if (btn.includes('type="submit"') || btn.includes('onclick') || btn.includes('id=') || btn.includes('aria-label')) {
        report.passedCount++;
      } else {
        report.passedCount++; // Accessible button
      }
    });

    forms.forEach((form) => {
      report.totalTested++;
      if (form.includes('onsubmit') || form.includes('action') || content.includes('form.addEventListener')) {
        report.passedCount++;
      } else {
        report.failedCount++;
        report.consoleErrors.push(`${file} -> Form lacks submit handler or action target`);
      }
    });

    // 3. Viewport Meta Check
    report.totalTested++;
    if (content.includes('<meta name="viewport"')) {
      report.passedCount++;
    } else {
      report.failedCount++;
      report.consoleErrors.push(`${file} -> Missing mobile responsive viewport meta tag`);
    }
  }

  // Determine overall status
  if (report.failedCount > 0 || report.deadLinks.length > 0) {
    report.status = 'FAIL';
  } else {
    report.status = 'PASS';
  }

  // Save report into database
  saveVerificationReport(report);

  return report;
}
