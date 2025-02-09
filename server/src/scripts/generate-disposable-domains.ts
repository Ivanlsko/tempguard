import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateDisposableDomainsList() {
  const sources = [
    {
      name: 'mailchecker',
      url: 'https://raw.githubusercontent.com/FGRibreau/mailchecker/master/list.txt',
    },
    {
      name: 'disposableEmailDetector',
      url: 'https://raw.githubusercontent.com/ivolo/disposable-email-domains/master/index.json',
    },
    {
      name: 'validEmail',
      url: 'https://raw.githubusercontent.com/micke/valid_email2/refs/heads/main/config/disposable_email_domains.txt',
    },
    {
      name: 'fakeFilter',
      url: 'https://raw.githubusercontent.com/7c/fakefilter/1ef7e6471ff574c3c8478f93a21b94b3f063f8c7/txt/data.txt',
    },
    {
      name: 'burnerEmailProviders',
      url: 'https://raw.githubusercontent.com/wesbos/burner-email-providers/refs/heads/master/emails.txt',
    },
    {
      name: 'disposableEmailDomains',
      url: 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/refs/heads/main/disposable_email_blocklist.conf',
    },
  ];

  const domains = new Set<string>();

  // Initialize metadata properly
  const metadata = {
    lastUpdated: new Date().toISOString(),
    sources: {} as Record<
      string,
      {
        count: number;
        status: 'success' | 'failed';
        overlap: number; // Domains that were already in the set
        skippedCount: number; // Invalid or skipped entries
      }
    >,
    processing: {
      totalDomains: 0,
      totalSkipped: 0,
    },
  };

  function cleanDomain(domain: string): string | null {
    // Skip lines that are clearly not domains
    if (domain.startsWith('http') || domain.startsWith('last update:') || domain.includes(' ') || !domain.includes('.')) {
      return null;
    }

    const cleaned = domain
      .trim()
      .toLowerCase()
      .replace(/^#+\s*/, '') // Remove ## prefixes
      .replace(/^[.@]+/, '') // Remove leading dots or @ symbols
      .replace(/[,\s#@]+$/, ''); // Remove trailing commas, spaces, #, @

    // Strict domain validation
    if (
      cleaned &&
      /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(cleaned) && // Must start with alphanumeric
      !cleaned.includes('..') && // No consecutive dots
      !cleaned.startsWith('.') && // Don't start with dot
      !cleaned.endsWith('.') && // Don't end with dot
      !cleaned.startsWith('-') && // Don't start with hyphen
      !cleaned.endsWith('-') // Don't end with hyphen
    ) {
      return cleaned;
    }
    return null;
  }

  for (const source of sources) {
    try {
      console.log(`\nFetching from ${source.name}...`);
      const response = await axios.get(source.url);
      const data = response.data;
      let sourceCount = 0;
      let sourceOverlap = 0;
      let sourceSkipped = 0;

      if (typeof data === 'string') {
        // Handle text files
        const lines = data.split('\n').filter(Boolean);
        lines.forEach((line) => {
          const cleanedDomain = cleanDomain(line);
          if (cleanedDomain) {
            if (domains.has(cleanedDomain)) {
              sourceOverlap++;
            }
            domains.add(cleanedDomain);
            sourceCount++;
          } else {
            sourceSkipped++;
          }
        });
      } else if (Array.isArray(data)) {
        // Handle JSON arrays
        data.forEach((domain) => {
          const cleanedDomain = cleanDomain(domain);
          if (cleanedDomain) {
            if (domains.has(cleanedDomain)) {
              sourceOverlap++;
            }
            domains.add(cleanedDomain);
            sourceCount++;
          } else {
            sourceSkipped++;
          }
        });
      }

      // Update metadata for this source
      metadata.sources[source.name] = {
        count: sourceCount,
        status: 'success',
        overlap: sourceOverlap,
        skippedCount: sourceSkipped,
      };

      console.log(`✓ Added ${sourceCount} domains from ${source.name}`);
      console.log(`  Overlap with other sources: ${sourceOverlap}`);
      console.log(`  Skipped entries: ${sourceSkipped}`);
    } catch (error) {
      console.error(`✗ Failed to fetch from ${source.name}:`, error);
      metadata.sources[source.name] = {
        count: 0,
        status: 'failed',
        overlap: 0,
        skippedCount: 0,
      };
    }
  }

  // Update final processing statistics
  metadata.processing.totalDomains = domains.size;
  metadata.processing.totalSkipped = Object.values(metadata.sources).reduce((total, source) => total + source.skippedCount, 0);

  console.log('\nProcessing Statistics:');
  console.log(`- Total unique domains: ${domains.size}`);
  console.log(`- Total skipped entries: ${metadata.processing.totalSkipped}`);
  console.log('\nSource Statistics:');
  Object.entries(metadata.sources).forEach(([name, stats]) => {
    console.log(`\n${name}:`);
    console.log(`- Total processed: ${stats.count}`);
    console.log(`- Overlap: ${stats.overlap}`);
    console.log(`- Skipped: ${stats.skippedCount}`);
    console.log(`- Status: ${stats.status}`);
  });

  // Sort domains alphabetically
  const sortedDomains = Array.from(domains).sort((a, b) => a.localeCompare(b));

  const formattedDomains = sortedDomains.map((domain) => {
    return domain
      .trim()
      .toLowerCase()
      .replace(/^#+\s*/, '') // Remove ## prefixes
      .replace(/^[.@]+/, '') // Remove leading dots or @ symbols
      .replace(/[,\s#@]+$/, ''); // Remove trailing commas, spaces, #, @
  });

  // Save to file
  const outputPath = path.join(__dirname, '..', '..', 'data', 'disposable-domains.json');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify({ domains: formattedDomains, metadata }, null, 2));

  console.log(`\nSaved ${formattedDomains.length} unique domains to ${outputPath}`);
}

generateDisposableDomainsList();
