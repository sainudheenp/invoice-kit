import type { Currency } from '@/types/currency'

export const CUR_PRESETS: Record<string, Currency> = {
  OMR: { code: 'OMR', symbol: '\u0631.\u0639.', name: 'Omani Rial', namePl: 'Omani Rials', sub: 'Baisa', subPl: 'Baisa', subPer: 1000 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', namePl: 'US Dollars', sub: 'Cent', subPl: 'Cents', subPer: 100 },
  EUR: { code: 'EUR', symbol: '\u20AC', name: 'Euro', namePl: 'Euros', sub: 'Cent', subPl: 'Cents', subPer: 100 },
  GBP: { code: 'GBP', symbol: '\u00A3', name: 'Pound Sterling', namePl: 'Pounds Sterling', sub: 'Pence', subPl: 'Pence', subPer: 100 },
  SAR: { code: 'SAR', symbol: '\uFDFC', name: 'Saudi Riyal', namePl: 'Saudi Riyals', sub: 'Halala', subPl: 'Halalas', subPer: 100 },
  AED: { code: 'AED', symbol: '\u062F.\u0625', name: 'UAE Dirham', namePl: 'UAE Dirhams', sub: 'Fils', subPl: 'Fils', subPer: 100 },
  KWD: { code: 'KWD', symbol: '\u062F.\u0643', name: 'Kuwaiti Dinar', namePl: 'Kuwaiti Dinars', sub: 'Fils', subPl: 'Fils', subPer: 1000 },
  QAR: { code: 'QAR', symbol: '\uFDFC', name: 'Qatari Riyal', namePl: 'Qatari Riyals', sub: 'Dirham', subPl: 'Dirhams', subPer: 100 },
  BHD: { code: 'BHD', symbol: '\u062F.\u0628', name: 'Bahraini Dinar', namePl: 'Bahraini Dinars', sub: 'Fils', subPl: 'Fils', subPer: 1000 },
  EGP: { code: 'EGP', symbol: '\u062C.\u0645', name: 'Egyptian Pound', namePl: 'Egyptian Pounds', sub: 'Piastre', subPl: 'Piastres', subPer: 100 },
}
