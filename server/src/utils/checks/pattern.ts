export const checkPattern = (email: string): boolean => {
  const localPart = email.split('@')[0].toLowerCase();

  const suspiciousPatterns = [
    /^\d{8,}$/, // Only numbers
    /^[a-z]\d{7,}[a-z]?$/, // Letter followed by many numbers
    /^[a-z0-9]{16,}$/, // Very long random string
    /(.)\1{4,}/, // Character repeated many times
    /^[a-z0-9]{8,}[._-][a-z0-9]{8,}$/, // Long random parts with separator
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(localPart));
};
