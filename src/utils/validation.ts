/**
 * Comprehensive client-side validation utilities for the Pluto Thank-You Card Generator
 */

// List of free consumer webmail domains that should not be used as corporate emails
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.fr',
  'yahoo.ca',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'zoho.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'yandex.com',
  'gmx.com',
  'fastmail.com',
]);

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateRecipientName = (name: string): ValidationResult => {
  const trimmed = name?.trim().replace(/\s+/g, ' ') || '';
  if (!trimmed) {
    return { isValid: false, error: 'Recipient name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Recipient name must be at least 2 characters.' };
  }
  if (trimmed.length > 16) {
    return { isValid: false, error: 'Please keep the name to 16 characters or fewer.' };
  }
  return { isValid: true };
};

export const validateName = (name: string, label = 'Name'): ValidationResult => {
  const trimmed = name?.trim().replace(/\s+/g, ' ') || '';
  if (!trimmed) {
    return { isValid: false, error: `${label} is required.` };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: `${label} must be at least 2 characters.` };
  }
  const isRecipient = label.toLowerCase().includes('recipient') || label.toLowerCase().includes('first') || label.toLowerCase().includes('last');
  if (isRecipient && trimmed.length > 16) {
    return { isValid: false, error: 'Please keep the name to 16 characters or fewer.' };
  }
  return { isValid: true };
};

export const validateRelationship = (
  relationship: string,
  customRelationship?: string
): ValidationResult => {
  if (!relationship) {
    return { isValid: false, error: 'Please select a relationship.' };
  }
  if (relationship === 'Other') {
    const trimmedCustom = customRelationship?.trim() || '';
    if (!trimmedCustom) {
      return { isValid: false, error: 'Please enter a custom relationship.' };
    }
    if (trimmedCustom.length < 2) {
      return { isValid: false, error: 'Custom relationship must be at least 2 characters.' };
    }
  }
  return { isValid: true };
};

export const validatePhoto = (photoUrl?: string): ValidationResult => {
  if (!photoUrl || !photoUrl.trim()) {
    return { isValid: false, error: 'Please upload a photo of the recipient.' };
  }
  return { isValid: true };
};

/** Most traits a card can show. */
export const MAX_TRAITS = 4;

export const validateTraits = (traits: string[]): ValidationResult => {
  if (!traits || traits.length < 2) {
    return { isValid: false, error: 'Please select at least 2 appreciation attributes.' };
  }
  if (traits.length > MAX_TRAITS) {
    return { isValid: false, error: `You can select up to ${MAX_TRAITS} appreciation attributes.` };
  }
  return { isValid: true };
};

export const validateMessage = (message: string): ValidationResult => {
  const trimmed = message?.trim() || '';
  if (!trimmed) {
    return { isValid: false, error: 'A thank-you message is required.' };
  }
  if (trimmed.length < 10) {
    return { isValid: false, error: 'Message should be at least 10 characters long.' };
  }
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount > 40) {
    return {
      isValid: false,
      error: 'Your message is too long. Please shorten it to keep the card readable.',
    };
  }
  return { isValid: true };
};

export const validateCorporateEmail = (email: string): ValidationResult => {
  const trimmed = email?.trim().toLowerCase() || '';
  if (!trimmed) {
    return { isValid: false, error: 'Corporate email is required.' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@company.com).' };
  }

  const domain = trimmed.split('@')[1];
  if (domain && FREE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Please use a valid corporate email address (free webmail domains like gmail.com are not accepted).',
    };
  }

  return { isValid: true };
};

export const validateCompany = (val: string): ValidationResult => {
  if (!val || !val.trim()) {
    return { isValid: false, error: 'Company name is required.' };
  }
  return { isValid: true };
};

export const validateIndustry = (val: string): ValidationResult => {
  if (!val || !val.trim()) {
    return { isValid: false, error: 'Industry is required.' };
  }
  return { isValid: true };
};

export const validateJobTitle = (val: string): ValidationResult => {
  if (!val || !val.trim()) {
    return { isValid: false, error: 'Job title is required.' };
  }
  return { isValid: true };
};

export const validatePhone = (val: string): ValidationResult => {
  return { isValid: true };
};
