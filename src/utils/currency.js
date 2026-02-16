/**
 * Currency Utilities
 * Maps currency symbols to ISO 4217 currency codes for payment gateways
 */

export const CURRENCY_MAP = {
  '₹': { code: 'INR', name: 'Indian Rupee' },
  '$': { code: 'USD', name: 'US Dollar' },
  '€': { code: 'EUR', name: 'Euro' },
  '£': { code: 'GBP', name: 'British Pound' },
  '¥': { code: 'JPY', name: 'Japanese Yen' },
  'د.إ': { code: 'AED', name: 'UAE Dirham' },
  'SR': { code: 'SAR', name: 'Saudi Riyal' }
};

/**
 * Get the ISO currency code for a given currency symbol
 * @param {string} symbol - Currency symbol (e.g. '₹', '$', 'د.إ')
 * @returns {string} ISO currency code (e.g. 'INR', 'USD', 'AED')
 */
export function getCurrencyCode(symbol) {
  return CURRENCY_MAP[symbol]?.code || 'INR';
}

/**
 * Get the currency symbol for a given ISO currency code
 * @param {string} code - ISO currency code (e.g. 'INR', 'AED')
 * @returns {string} Currency symbol (e.g. '₹', 'د.إ')
 */
export function getCurrencySymbol(code) {
  const entry = Object.entries(CURRENCY_MAP).find(([, val]) => val.code === code);
  return entry ? entry[0] : '₹';
}
