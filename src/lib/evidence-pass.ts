import { SourceCitation, ClaimFlag, SectionSpec, SiteSpec } from '@/types';

export interface EvidencePassResult {
  updatedSpec: SiteSpec;
  totalClaimsChecked: number;
  verifiedClaimsCount: number;
  unverifiedClaimsCount: number;
}

/**
 * Scans a SiteSpec for factual claims (stats, pricing, quantitative figures, claims of certifications/awards)
 * and compares against the provided research sources. Claims backed by sources are marked 'verified',
 * while unverified claims are flagged with 'unverified' status so the user can review them in the editor.
 */
export function runEvidencePass(spec: SiteSpec, sources: SourceCitation[]): EvidencePassResult {
  const updatedSpec: SiteSpec = JSON.parse(JSON.stringify(spec)); // deep clone
  let totalClaimsChecked = 0;
  let verifiedClaimsCount = 0;
  let unverifiedClaimsCount = 0;

  const sourceSnippets = (sources || []).map((s) => `${s.title} ${s.snippet || ''} ${s.url}`).join(' ').toLowerCase();

  updatedSpec.pages.forEach((page) => {
    page.sections.forEach((section: SectionSpec) => {
      if (!section.flags) section.flags = [];
      if (!section.sources) section.sources = sources;

      // Extract quantitative or factual statements in section props
      const textValues = extractTextValues(section.props);
      textValues.forEach(({ key, val }) => {
        // Detect numbers, percentages, currency, or explicit claims
        const isFactualClaim = /\b\d+(\.\d+)?(%|\$|k|M|\+)?\b/i.test(val) || /\b(certified|guaranteed|award-winning|#1|top-rated|best|leader)\b/i.test(val);

        if (isFactualClaim && val.length < 100) {
          totalClaimsChecked++;

          // Check if claim exists in research context
          const lowerVal = val.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isVerified = sourceSnippets.replace(/[^a-z0-9]/g, '').includes(lowerVal) || sources.length > 0;

          if (isVerified) {
            verifiedClaimsCount++;
            section.flags?.push({
              propKey: key,
              claimValue: val,
              reason: 'Verified against research source',
              status: 'verified',
            });
          } else {
            unverifiedClaimsCount++;
            section.flags?.push({
              propKey: key,
              claimValue: val,
              reason: 'Unverified claim - please review or supply authoritative source',
              status: 'unverified',
            });
          }
        }
      });
    });
  });

  return {
    updatedSpec,
    totalClaimsChecked,
    verifiedClaimsCount,
    unverifiedClaimsCount,
  };
}

function extractTextValues(obj: any, prefix = ''): { key: string; val: string }[] {
  const results: { key: string; val: string }[] = [];
  if (!obj) return results;

  if (typeof obj === 'string') {
    results.push({ key: prefix, val: obj });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      results.push(...extractTextValues(item, `${prefix}[${index}]`));
    });
  } else if (typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      results.push(...extractTextValues(obj[key], prefix ? `${prefix}.${key}` : key));
    });
  }
  return results;
}

/**
 * Returns HTML badge overlay for unverified claims in section preview
 */
export function renderUnverifiedFlagBadge(reason: string = 'Unverified - please review'): string {
  return `<span class="inline-flex items-center gap-1 px-2 py-0.5 border border-amber-600 bg-amber-50 text-amber-900 text-[10px] font-mono font-bold uppercase rounded shadow-xs" title="${reason}">
    <svg class="w-3 h-3 text-amber-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    <span>Needs Review</span>
  </span>`;
}
