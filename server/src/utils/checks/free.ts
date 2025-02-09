/**
 * Identifies if the email is from a free email provider
 * Examples: Gmail, Yahoo, Hotmail
 * Helps distinguish between free and professional/business email addresses
 */
export const checkFree = async (email: string): Promise<boolean> => {
  const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'mail.com', 'zoho.com', 'yandex.com'];

  const domain = email.split('@')[1];
  return freeDomains.includes(domain.toLowerCase());
};
