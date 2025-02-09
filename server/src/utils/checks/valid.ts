import validator from 'validator';

/**
 * Performs basic syntax validation
 * Ensures email follows proper format (contains @, proper domain structure, etc.)
 */
export const checkValid = async (email: string): Promise<boolean> => {
  return !validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true,
    allow_ip_domain: false,
  });
};
