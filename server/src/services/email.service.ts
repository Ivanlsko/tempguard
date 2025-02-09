import { checkDisposable, checkDNS, checkMX, checkValid, checkBlacklist, checkFree, checkCatchAll, checkPattern } from '../utils/checks/index.js';

class EmailValidationService {
  async isTemporaryEmail(email: string): Promise<{
    isTemporary: boolean;
    failedChecks: string[];
  }> {
    const checksFailed: string[] = [];

    // Run all checks and collect failures
    await Promise.all(
      Object.entries(this.checks).map(async ([checkName, checkFn]) => {
        try {
          if (await checkFn(email)) {
            checksFailed.push(checkName);
          }
        } catch (error) {
          console.error(`Check ${checkName} failed with error:`, error);
        }
      })
    );

    const score = this.calculateScore(checksFailed);

    return {
      isTemporary: score > 10,
      failedChecks: checksFailed,
    };
  }

  calculateScore(checksFailed: string[]): number {
    const score = checksFailed.reduce((acc, check) => acc + this.scoreMap[check], 0);
    console.log('Score:', score);
    return score;
  }

  /**
   * Email Validation Score Map
   * Scores are weighted based on reliability and risk level:
   * 0-30: Low risk
   * 31-60: Medium risk
   * 61-90: High risk
   * 91-100: Critical risk
   */
  scoreMap: Record<string, number> = {
    // Critical Risk (91-100)
    valid: 100, // Invalid format means email cannot work

    // High Risk (61-90)
    disposable: 85, // Temporary email services
    dns: 80, // Domain doesn't exist
    mx: 75, // No mail server configured

    // Medium Risk (31-60)
    blacklist: 60, // Known problematic domains (lower because list might be outdated)
    pattern: 40, // Suspicious patterns but could be legitimate

    // Low Risk (0-30)
    catchAll: 25, // Catch-all configuration (common in business)
    free: 10, // Free email provider (very common for legitimate users)
  };

  /**
   * Email Validation Checks
   * A collection of functions to perform comprehensive email validation
   */
  checks = {
    /**
     * Checks if the email domain is on a known blacklist
     * Prevents registrations from domains associated with spam or abuse
     */
    blacklist(email: string) {
      return checkBlacklist(email);
    },

    /**
     * Verifies the existence of MX (Mail Exchange) records
     * Ensures the domain is configured to receive email
     * Without valid MX records, emails cannot be delivered
     */
    async mx(email: string): Promise<boolean> {
      return checkMX(email);
    },

    /**
     * Checks if the domain has valid DNS records
     * Verifies that the domain exists and is properly configured
     */
    async dns(email: string): Promise<boolean> {
      return checkDNS(email);
    },

    /**
     * Detects if the email is from a disposable/temporary email service
     * Examples: 10MinuteMail, Guerrilla Mail
     * These services are often used for throwaway accounts and spam
     */
    disposable(email: string) {
      return checkDisposable(email);
    },

    /**
     * Identifies if the email is from a free email provider
     * Examples: Gmail, Yahoo, Hotmail
     * Helps distinguish between free and professional/business email addresses
     */
    free(email: string) {
      return checkFree(email);
    },

    /**
     * Determines if the domain uses a catch-all email configuration
     * Catch-all emails accept any email sent to the domain regardless of the specific address
     * Can be a sign of less reliable email addresses
     */
    catchAll(email: string) {
      return checkCatchAll(email);
    },

    /**
     * Performs basic syntax validation
     * Ensures email follows proper format (contains @, proper domain structure, etc.)
     */
    valid(email: string) {
      return checkValid(email);
    },

    /**
     * Checks for suspicious patterns in the email address
     * Detects patterns that are often used for spam or abuse
     */
    pattern(email: string) {
      return checkPattern(email);
    },
  };
}

export const emailValidationService = new EmailValidationService();
