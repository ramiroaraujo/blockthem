import { writeFileSync, mkdirSync } from 'fs';

const SOURCES = [
  {
    id: 'adult',
    url: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts',
    category: 'adult',
  },
  {
    id: 'gambling',
    url: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/gambling-only/hosts',
    category: 'gambling',
  },
];

function parseDomains(hostsContent: string): string[] {
  return hostsContent
    .split('\n')
    .filter((line) => line.startsWith('0.0.0.0 '))
    .map((line) => line.split(/\s+/)[1])
    .filter((domain) => domain && domain !== '0.0.0.0');
}

interface DNRRule {
  id: number;
  priority: number;
  action: { type: string; redirect: { extensionPath: string } };
  condition: { urlFilter: string; resourceTypes: string[] };
}

function buildRules(domains: string[], category: string): DNRRule[] {
  return domains.map((domain, i) => ({
    id: i + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        extensionPath: `/src/blocked/index.html?category=${category}`,
      },
    },
    condition: {
      urlFilter: `||${domain}`,
      resourceTypes: ['main_frame'],
    },
  }));
}

async function main() {
  mkdirSync('rulesets', { recursive: true });

  for (const source of SOURCES) {
    console.log(`Fetching ${source.id} list from ${source.url}...`);
    const res = await fetch(source.url);
    const text = await res.text();
    const domains = parseDomains(text);
    const rules = buildRules(domains, source.category);
    const outPath = `rulesets/${source.id}.json`;
    writeFileSync(outPath, JSON.stringify(rules));
    const sizeMB = (Buffer.byteLength(JSON.stringify(rules)) / 1024 / 1024).toFixed(1);
    console.log(`  ${source.id}: ${domains.length} domains → ${outPath} (${sizeMB} MB)`);
  }

  console.log('Done.');
}

main();
