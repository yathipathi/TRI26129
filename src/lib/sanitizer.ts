import net from 'net';

// Allowed CSS property allowlist for safe tokenized styling
const ALLOWED_CSS_PROPERTIES = new Set([
  'color',
  'background-color',
  'border-color',
  'border-radius',
  'padding',
  'margin',
  'text-align',
  'font-size',
  'font-weight',
  'line-height',
  'opacity',
  'box-shadow',
  'max-width',
  'min-height',
  'gap',
]);

// Sanitize raw CSS string and scope to section ID
export function sanitizeAndScopeCSS(css: string, sectionId: string): string {
  if (!css || typeof css !== 'string') return '';

  // Block dangerous CSS patterns: url(), @import, expression, behavior, javascript:
  if (/\b(url|@import|expression|behavior|javascript|data):/i.test(css)) {
    console.warn(`[CSS Sanitizer] Blocked dangerous CSS pattern in section ${sectionId}`);
    return '';
  }

  // Parse lines and keep only allowed properties
  const sanitizedLines: string[] = [];
  const rules = css.split(';');

  for (const rule of rules) {
    const parts = rule.split(':');
    if (parts.length === 2) {
      const prop = parts[0].trim().toLowerCase();
      const val = parts[1].trim();

      if (ALLOWED_CSS_PROPERTIES.has(prop)) {
        // Additional value checks
        if (!/\b(expression|url|javascript|behavior)\b/i.test(val)) {
          sanitizedLines.push(`${prop}: ${val}`);
        }
      }
    }
  }

  if (sanitizedLines.length === 0) return '';
  return `#${sectionId} { ${sanitizedLines.join('; ')}; }`;
}

// Sanitize URL protocol (block javascript:, data:, etc.)
export function sanitizeLinkUrl(url: string): { isValid: boolean; sanitizedUrl: string } {
  if (!url || typeof url !== 'string') return { isValid: false, sanitizedUrl: '#' };

  const trimmed = url.trim();

  // Block javascript: and data: protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return { isValid: false, sanitizedUrl: '#' };
  }

  // Allow safe protocols & internal anchors
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('https://wa.me/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.endsWith('.html')
  ) {
    return { isValid: true, sanitizedUrl: trimmed };
  }

  // Default fallback for safe external links
  if (!trimmed.includes('://')) {
    return { isValid: true, sanitizedUrl: `https://${trimmed}` };
  }

  return { isValid: true, sanitizedUrl: trimmed };
}

// SSRF Safety: Block private / loopback IP addresses
export function isPrivateIP(ip: string): boolean {
  if (!ip) return true;
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') return true;

  // Check IPv4 private ranges
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
    if (parts[0] === 169 && parts[1] === 254) return true; // Link-local
    if (parts[0] === 0) return true;
  }

  return false;
}
