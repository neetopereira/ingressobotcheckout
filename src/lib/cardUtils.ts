// Card brand detection and formatting utilities

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'diners' | 'unknown';

export interface CardBrandInfo {
  brand: CardBrand;
  name: string;
  color: string;
  cvvLength: number;
  numberLength: number[];
}

const cardBrands: Record<CardBrand, CardBrandInfo> = {
  visa: { brand: 'visa', name: 'Visa', color: '#1A1F71', cvvLength: 3, numberLength: [16] },
  mastercard: { brand: 'mastercard', name: 'Mastercard', color: '#EB001B', cvvLength: 3, numberLength: [16] },
  elo: { brand: 'elo', name: 'Elo', color: '#FFCB05', cvvLength: 3, numberLength: [16] },
  amex: { brand: 'amex', name: 'American Express', color: '#006FCF', cvvLength: 4, numberLength: [15] },
  hipercard: { brand: 'hipercard', name: 'Hipercard', color: '#B5121B', cvvLength: 3, numberLength: [16] },
  diners: { brand: 'diners', name: 'Diners Club', color: '#0079BE', cvvLength: 3, numberLength: [14, 16] },
  unknown: { brand: 'unknown', name: 'Cartão', color: '#6b7280', cvvLength: 3, numberLength: [16] },
};

// BIN ranges for card brand detection
const binRanges: Array<{ brand: CardBrand; ranges: Array<[number, number] | number> }> = [
  { brand: 'elo', ranges: [[401178, 401179], [431274, 431274], [438935, 438935], [451416, 451416], [457393, 457393], [457631, 457632], [504175, 504175], [506699, 506778], [509000, 509999], [627780, 627780], [636297, 636297], [636368, 636368], [650031, 650033], [650035, 650051], [650405, 650439], [650485, 650538], [650541, 650598], [650700, 650718], [650720, 650727], [650901, 650978], [651652, 651679], [655000, 655019], [655021, 655058]] },
  { brand: 'hipercard', ranges: [[606282, 606282], [637095, 637095], [637568, 637568], [637599, 637599], [637609, 637609], [637612, 637612]] },
  { brand: 'amex', ranges: [[34, 34], [37, 37]] },
  { brand: 'diners', ranges: [[300, 305], [36, 36], [38, 39]] },
  { brand: 'mastercard', ranges: [[51, 55], [2221, 2720]] },
  { brand: 'visa', ranges: [[4, 4]] },
];

export function detectCardBrand(cardNumber: string): CardBrandInfo {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  if (cleanNumber.length < 1) return cardBrands.unknown;

  for (const { brand, ranges } of binRanges) {
    for (const range of ranges) {
      if (typeof range === 'number') {
        const len = String(range).length;
        const prefix = parseInt(cleanNumber.slice(0, len));
        if (prefix === range) return cardBrands[brand];
      } else {
        const [start, end] = range;
        const len = String(start).length;
        const prefix = parseInt(cleanNumber.slice(0, len));
        if (prefix >= start && prefix <= end) return cardBrands[brand];
      }
    }
  }

  return cardBrands.unknown;
}

// Bank detection based on BIN (simplified)
export interface BankInfo {
  name: string;
  color: string;
}

const bankBins: Record<string, BankInfo> = {
  '4389': { name: 'Bradesco', color: '#CC092F' },
  '5425': { name: 'Bradesco', color: '#CC092F' },
  '4514': { name: 'Itaú', color: '#EC7000' },
  '5412': { name: 'Itaú', color: '#EC7000' },
  '4984': { name: 'Banco do Brasil', color: '#FFCC00' },
  '5434': { name: 'Banco do Brasil', color: '#FFCC00' },
  '4916': { name: 'Santander', color: '#EC0000' },
  '5276': { name: 'Santander', color: '#EC0000' },
  '5355': { name: 'Caixa', color: '#005CA9' },
  '4296': { name: 'Nubank', color: '#820AD1' },
  '5162': { name: 'Nubank', color: '#820AD1' },
  '4371': { name: 'Inter', color: '#FF7A00' },
  '5258': { name: 'C6 Bank', color: '#1A1A1A' },
};

export function detectBank(cardNumber: string): BankInfo | null {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  const bin4 = cleanNumber.slice(0, 4);
  
  return bankBins[bin4] || null;
}

// Format card number with spaces
export function formatCardNumber(value: string, brand: CardBrand = 'unknown'): string {
  const cleanValue = value.replace(/\D/g, '');
  
  if (brand === 'amex') {
    // Amex format: 4-6-5
    const parts = [cleanValue.slice(0, 4), cleanValue.slice(4, 10), cleanValue.slice(10, 15)].filter(Boolean);
    return parts.join(' ');
  }
  
  // Standard format: 4-4-4-4
  const parts = [];
  for (let i = 0; i < cleanValue.length; i += 4) {
    parts.push(cleanValue.slice(i, i + 4));
  }
  return parts.join(' ');
}

// Format expiry date
export function formatExpiryDate(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length >= 2) {
    return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4);
  }
  return cleanValue;
}

// Validate card number using Luhn algorithm
export function validateCardNumber(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Validate expiry date
export function validateExpiryDate(expiry: string): boolean {
  const cleanExpiry = expiry.replace(/\D/g, '');
  
  if (cleanExpiry.length !== 4) return false;
  
  const month = parseInt(cleanExpiry.slice(0, 2), 10);
  const year = parseInt('20' + cleanExpiry.slice(2, 4), 10);
  
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
}

// Calculate installment values
export interface InstallmentOption {
  installments: number;
  value: number;
  total: number;
  interestRate: number;
  hasInterest: boolean;
}

export function calculateInstallments(total: number, maxInstallments: number = 12): InstallmentOption[] {
  const options: InstallmentOption[] = [];
  
  for (let i = 1; i <= maxInstallments; i++) {
    let installmentTotal = total;
    let interestRate = 0;
    
    // Add interest for installments > 3
    if (i > 3) {
      interestRate = 1.99 + (i - 3) * 0.5; // Incremental interest
      installmentTotal = total * (1 + interestRate / 100);
    }
    
    options.push({
      installments: i,
      value: installmentTotal / i,
      total: installmentTotal,
      interestRate,
      hasInterest: i > 3,
    });
  }
  
  return options;
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
