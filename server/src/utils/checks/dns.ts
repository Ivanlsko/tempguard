import dns from 'dns';
import { promisify } from 'util';
const resolve = promisify(dns.resolve);
/**
 * Checks if the domain has valid DNS records
 * Verifies that the domain exists and is properly configured
 */
export const checkDNS = async (email: string): Promise<boolean> => {
  const domain = email.split('@')[1];
  try {
    // Set a timeout of 100ms for DNS resolution
    const dnsPromise = resolve(domain);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('DNS Timeout')), 100);
    });

    // Race between DNS resolution and timeout
    await Promise.race([dnsPromise, timeoutPromise]);
    return false; // Domain exists, no issue
  } catch (error: any) {
    // If it's a timeout, we'll assume the domain is valid to avoid false positives
    if (error.message === 'DNS Timeout') {
      console.log('DNS Timeout');
      return false;
    }
    return true; // Domain doesn't exist or DNS error, indicating an issue
  }
};
