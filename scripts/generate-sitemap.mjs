import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOME = 'https://www.nexhse.co.ke';
const SHOP = 'https://shop.nexhse.co.ke';
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const lastMod = new Date().toISOString().slice(0, 10);

const publicPages = [
  { url: `${HOME}/`, changefreq: 'weekly', priority: '1.0' },
  { url: `${HOME}/about`, changefreq: 'monthly', priority: '0.8' },
  { url: `${HOME}/services`, changefreq: 'weekly', priority: '0.9' },
  { url: `${HOME}/training`, changefreq: 'weekly', priority: '0.9' },
  { url: `${HOME}/projects`, changefreq: 'monthly', priority: '0.7' },
  { url: `${HOME}/accreditations`, changefreq: 'monthly', priority: '0.7' },
  { url: `${HOME}/testimonials`, changefreq: 'monthly', priority: '0.6' },
  { url: `${HOME}/knowledge`, changefreq: 'weekly', priority: '0.8' },
  { url: `${HOME}/faqs`, changefreq: 'monthly', priority: '0.7' },
  { url: `${HOME}/blog`, changefreq: 'weekly', priority: '0.8' },
  { url: `${HOME}/contact`, changefreq: 'monthly', priority: '0.8' },
  { url: `${HOME}/request-a-quote`, changefreq: 'monthly', priority: '0.9' },
  { url: `${SHOP}/`, changefreq: 'weekly', priority: '0.9' },
  { url: `${SHOP}/industrial-safety-helmet`, changefreq: 'weekly', priority: '0.7' },
  { url: `${SHOP}/safety-helmet-white`, changefreq: 'weekly', priority: '0.7' },
  { url: `${SHOP}/safety-boots`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/safety-boots-field`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/safety-boots-industrial`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/high-vis-vest`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/protective-work-gloves`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/eye-protection`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/protective-coverall`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/ppe-starter-kit`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/reflective-safety-strip`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/9kg-fire-extinguisher`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/12kg-fire-extinguisher`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/fire-extinguisher`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/fire-blanket`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/foam-fire-suppression-agent`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/fire-powder`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/fire-safety-cabinet`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/fire-safety-drill-kit`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/safety-ladder`, changefreq: 'weekly', priority: '0.6' },
  { url: `${SHOP}/workplace-safety-kit`, changefreq: 'weekly', priority: '0.6' },
];

const articlePages = [
  { url: `${HOME}/knowledge/article-1`, changefreq: 'monthly', priority: '0.5' },
  { url: `${HOME}/knowledge/article-2`, changefreq: 'monthly', priority: '0.5' },
  { url: `${HOME}/knowledge/article-3`, changefreq: 'monthly', priority: '0.5' },
  { url: `${HOME}/knowledge/article-4`, changefreq: 'monthly', priority: '0.5' },
  { url: `${HOME}/blog/why-risk-assessments-matter-before-incidents`, changefreq: 'monthly', priority: '0.6' },
  { url: `${HOME}/blog/building-fire-ready-workplaces`, changefreq: 'monthly', priority: '0.6' },
  { url: `${HOME}/blog/training-that-changes-workplace-behaviour`, changefreq: 'monthly', priority: '0.6' },
  { url: `${HOME}/blog/environmental-management-as-operational-discipline`, changefreq: 'monthly', priority: '0.6' },
  { url: `${HOME}/blog/ppe-selection-that-works-on-site`, changefreq: 'monthly', priority: '0.6' },
  { url: `${HOME}/blog/what-a-useful-safety-audit-should-leave-behind`, changefreq: 'monthly', priority: '0.6' },
  { url: `${HOME}/blog/first-aid-readiness-starts-before-the-injury`, changefreq: 'monthly', priority: '0.6' },
  { url: `${HOME}/blog/confined-space-planning-and-the-permit-to-work`, changefreq: 'monthly', priority: '0.6' },
];

const servicePages = [
  `${HOME}/services/osh-training`,
  `${HOME}/services/fire-safety-training`,
  `${HOME}/services/first-aid-training`,
  `${HOME}/services/work-at-height-confined-space-training`,
  `${HOME}/services/emergency-response-training`,
  `${HOME}/services/alcohol-drug-abuse-training`,
  `${HOME}/services/ppe-training`,
  `${HOME}/services/risk-assessments`,
  `${HOME}/services/health-safety-audits`,
  `${HOME}/services/fire-safety-inspections-audits`,
  `${HOME}/services/osh-policies`,
  `${HOME}/services/asbestos-containing-materials-surveys`,
  `${HOME}/services/chemical-mechanical-safety`,
  `${HOME}/services/disaster-preparedness-management`,
  `${HOME}/services/construction-site-safety-management-monitoring`,
  `${HOME}/services/firefighting-equipment-supply-maintenance`,
  `${HOME}/services/ppe-supply`,
  `${HOME}/services/first-aid-appliances-supply`,
  `${HOME}/services/environmental-impact-assessment-audits`,
  `${HOME}/services/environmental-education-training`,
  `${HOME}/services/environmental-policies-management-plans`,
  `${HOME}/services/environmental-management-systems`,
  `${HOME}/services/waste-management`,
  `${HOME}/services/effluent-emissions-management`,
];

const allUrls = [...publicPages, ...articlePages, ...servicePages.map((url) => ({ url, changefreq: 'monthly', priority: '0.5' }))];

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(({ url, changefreq, priority }) => `
  <url>
    <loc>${xmlEscape(url)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${xmlEscape(changefreq)}</changefreq>
    <priority>${xmlEscape(priority)}</priority>
  </url>`).join('')}
</urlset>
`;

const outputDirs = [
  path.join(projectRoot, 'public'),
  path.join(projectRoot, 'artifacts/nexhse-africa/public'),
];

for (const dir of outputDirs) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'sitemap.xml'), xml, 'utf8');
}

console.log(`Generated sitemap.xml with ${allUrls.length} URLs in ${outputDirs.join(', ')}`);
