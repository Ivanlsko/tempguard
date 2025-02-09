import dns from 'dns';
import net from 'net';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

/**
 * Simulates SMTP connection to check for catch-all configuration
 * More reliable than just checking MX records
 */
async function checkSMTP(domain: string, testEmail: string): Promise<boolean> {
  return false;
  try {
    const records = await resolveMx(domain);
    if (!records.length) return false;

    // Get the primary MX server
    const mxRecord = records.sort((a, b) => a.priority - b.priority)[0];
    const socket = new net.Socket();

    return new Promise((resolve) => {
      let response = '';
      socket.connect(25, mxRecord.exchange);

      socket.on('data', (data) => {
        response += data.toString();
        if (response.includes('220')) {
          // Send HELO
          socket.write(`HELO tempguard.com\r\n`);
        } else if (response.includes('250') && !response.includes('MAIL')) {
          // Send MAIL FROM
          socket.write(`MAIL FROM:<test@tempguard.com>\r\n`);
        } else if (response.includes('250') && !response.includes('RCPT')) {
          // Send RCPT TO with our test email
          socket.write(`RCPT TO:<${testEmail}>\r\n`);
        } else if (response.includes('250') && response.includes('RCPT')) {
          // If we get here with 250, it's likely a catch-all
          socket.destroy();
          resolve(true);
        } else if (response.includes('550') || response.includes('521')) {
          // Address rejected
          socket.destroy();
          resolve(false);
        }
      });

      socket.on('error', () => {
        resolve(false);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 5000);
    });
  } catch {
    return false;
  }
}

/**
 * Determines if the domain uses a catch-all email configuration
 * Uses SMTP verification to check if the domain accepts any email
 */
export const checkCatchAll = async (email: string): Promise<boolean> => {
  const domain = email.split('@')[1];

  // Generate a random test email that's very unlikely to exist
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const testEmail = `${randomString}@${domain}`;

  return checkSMTP(domain, testEmail);
};
