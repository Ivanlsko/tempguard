import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the JSON file synchronously at startup
const disposableDomainsPath = join(__dirname, '../../../data/disposable-domains.json');
const disposableDomains: string[] = JSON.parse(fs.readFileSync(disposableDomainsPath, 'utf-8')).domains;

/**
 * Detects if the email is from a disposable/temporary email service
 * Examples: 10MinuteMail, Guerrilla Mail
 * These services are often used for throwaway accounts and spam
 */
export const checkDisposable = async (email: string): Promise<boolean> => {
  const domain = email.split('@')[1];
  return disposableDomains.includes(domain);
};
