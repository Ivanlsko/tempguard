import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

/**
 * Verifies the existence of MX (Mail Exchange) records
 * Ensures the domain is configured to receive email
 * Without valid MX records, emails cannot be delivered
 */
export const checkMX = async (email: string): Promise<boolean> => {
  const domain = email.split('@')[1];
  try {
    const records = await resolveMx(domain);
    return records.length === 0; // Return true if no MX records (indicating potential issue)
  } catch {
    return true; // Return true if error (indicating potential issue)
  }
};
