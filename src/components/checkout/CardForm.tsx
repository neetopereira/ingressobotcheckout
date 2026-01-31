import { useState, useMemo } from 'react';
import { CreditCard, Calendar, Lock, User } from 'lucide-react';
import { CardBrandIcon } from '@/components/icons/CardBrandIcon';
import { InstallmentSelect } from './InstallmentSelect';
import { SecurityBadge } from './SecurityBadge';
import { CreditCard3D } from './CreditCard3D';
import {
  detectCardBrand,
  detectBank,
  formatCardNumber,
  formatExpiryDate,
  validateCardNumber,
  validateExpiryDate,
  calculateInstallments,
  CardBrandInfo,
  BankInfo,
} from '@/lib/cardUtils';

interface CardFormProps {
  total: number;
  onSubmit: (data: CardFormData) => void;
  isProcessing: boolean;
}

export interface CardFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  installments: number;
}

export function CardForm({ total, onSubmit, isProcessing }: CardFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const cardBrand: CardBrandInfo = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);
  const bankInfo: BankInfo | null = useMemo(() => detectBank(cardNumber), [cardNumber]);
  const installmentOptions = useMemo(() => calculateInstallments(total), [total]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value, cardBrand.brand);
    const maxLength = cardBrand.brand === 'amex' ? 17 : 19; // Include spaces
    setCardNumber(formatted.slice(0, maxLength));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted.slice(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.slice(0, cardBrand.cvvLength));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'cardNumber':
        if (!cardNumber) {
          newErrors.cardNumber = 'Número do cartão é obrigatório';
        } else if (!validateCardNumber(cardNumber)) {
          newErrors.cardNumber = 'Número do cartão inválido';
        } else {
          delete newErrors.cardNumber;
        }
        break;
      case 'cardHolder':
        if (!cardHolder.trim()) {
          newErrors.cardHolder = 'Nome do titular é obrigatório';
        } else if (cardHolder.trim().split(' ').length < 2) {
          newErrors.cardHolder = 'Digite o nome completo';
        } else {
          delete newErrors.cardHolder;
        }
        break;
      case 'expiryDate':
        if (!expiryDate) {
          newErrors.expiryDate = 'Data de validade é obrigatória';
        } else if (!validateExpiryDate(expiryDate)) {
          newErrors.expiryDate = 'Data inválida ou expirada';
        } else {
          delete newErrors.expiryDate;
        }
        break;
      case 'cvv':
        if (!cvv) {
          newErrors.cvv = 'CVV é obrigatório';
        } else if (cvv.length < cardBrand.cvvLength) {
          newErrors.cvv = `CVV deve ter ${cardBrand.cvvLength} dígitos`;
        } else {
          delete newErrors.cvv;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const fields = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'];
    fields.forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
    });

    let isValid = true;
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    if (isValid) {
      onSubmit({
        cardNumber,
        cardHolder,
        expiryDate,
        cvv,
        installments,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 3D Credit Card Preview */}
      <CreditCard3D
        cardNumber={cardNumber}
        cardHolder={cardHolder}
        expiryDate={expiryDate}
        cvv={cvv}
        cardBrand={cardBrand}
        bankInfo={bankInfo}
        isFlipped={isCardFlipped}
      />

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Número do Cartão
        </label>
        <div className="relative">
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={handleCardNumberChange}
            onBlur={() => handleBlur('cardNumber')}
            placeholder="0000 0000 0000 0000"
            className={`checkout-input pl-12 ${touched.cardNumber && errors.cardNumber ? 'border-destructive' : ''}`}
            autoComplete="cc-number"
          />
        </div>
        {touched.cardNumber && errors.cardNumber && (
          <p className="mt-1.5 text-xs text-destructive">{errors.cardNumber}</p>
        )}
      </div>

      {/* Card Holder */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Nome no Cartão
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            onBlur={() => handleBlur('cardHolder')}
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            className={`checkout-input pl-12 uppercase ${touched.cardHolder && errors.cardHolder ? 'border-destructive' : ''}`}
            autoComplete="cc-name"
          />
        </div>
        {touched.cardHolder && errors.cardHolder && (
          <p className="mt-1.5 text-xs text-destructive">{errors.cardHolder}</p>
        )}
      </div>

      {/* Expiry & CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Validade
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              inputMode="numeric"
              value={expiryDate}
              onChange={handleExpiryChange}
              onBlur={() => handleBlur('expiryDate')}
              placeholder="MM/AA"
              className={`checkout-input pl-12 ${touched.expiryDate && errors.expiryDate ? 'border-destructive' : ''}`}
              autoComplete="cc-exp"
            />
          </div>
          {touched.expiryDate && errors.expiryDate && (
            <p className="mt-1.5 text-xs text-destructive">{errors.expiryDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            CVV
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              inputMode="numeric"
              value={cvv}
              onChange={handleCvvChange}
              onFocus={() => setIsCardFlipped(true)}
              onBlur={() => {
                setIsCardFlipped(false);
                handleBlur('cvv');
              }}
              placeholder={cardBrand.brand === 'amex' ? '0000' : '000'}
              className={`checkout-input pl-12 ${touched.cvv && errors.cvv ? 'border-destructive' : ''}`}
              autoComplete="cc-csc"
            />
          </div>
          {touched.cvv && errors.cvv && (
            <p className="mt-1.5 text-xs text-destructive">{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* Installments */}
      <InstallmentSelect
        options={installmentOptions}
        selectedInstallment={installments}
        onSelect={setInstallments}
      />

      {/* Security Info */}
      <div className="pt-2">
        <SecurityBadge variant="inline" />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processando...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Pagar com Segurança</span>
          </>
        )}
      </button>
    </form>
  );
}
