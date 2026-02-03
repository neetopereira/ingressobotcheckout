import { useState, useMemo } from 'react';
import { CreditCard, Calendar, Lock, User, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from "sonner";
import { initMercadoPago, createCardToken } from "@mercadopago/sdk-react"; 

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

// Inicializa o Mercado Pago
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);

interface CardFormProps {
  amount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  onSuccess: () => void;
}

export function CardForm({ amount, items, onSuccess }: CardFormProps) {
  const { orderId } = useParams();
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const cardBrand: CardBrandInfo = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);
  const bankInfo: BankInfo | null = useMemo(() => detectBank(cardNumber), [cardNumber]);
  const installmentOptions = useMemo(() => calculateInstallments(amount), [amount]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value, cardBrand.brand);
    const maxLength = cardBrand.brand === 'amex' ? 17 : 19;
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
        case 'cardNumber': if (!cardNumber || !validateCardNumber(cardNumber)) newErrors.cardNumber = 'Inválido'; else delete newErrors.cardNumber; break;
        case 'cardHolder': if (!cardHolder.trim() || cardHolder.trim().split(' ').length < 2) newErrors.cardHolder = 'Nome completo'; else delete newErrors.cardHolder; break;
        case 'expiryDate': if (!expiryDate || !validateExpiryDate(expiryDate)) newErrors.expiryDate = 'Inválido'; else delete newErrors.expiryDate; break;
        case 'cvv': if (!cvv || cvv.length < cardBrand.cvvLength) newErrors.cvv = 'Incompleto'; else delete newErrors.cvv; break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fields = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'];
    let isValid = true;
    fields.forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      toast.error("Verifique os dados em vermelho.");
      return;
    }

    if (!orderId) {
      toast.error("Erro: Pedido não identificado.");
      return;
    }

    setIsProcessing(true);

    try {
      const [expMonth, expYear] = expiryDate.split('/');
      
      // --- AQUI ESTÁ A CORREÇÃO (as any) ---
      const mpResponse = await createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName: cardHolder,
        cardExpirationMonth: expMonth,
        cardExpirationYear: `20${expYear}`,
        securityCode: cvv,
        identificationType: "CPF",
        identificationNumber: "00000000000", 
      } as any); // <--- O "as any" resolve o erro de tipagem

      if (!mpResponse?.id) throw new Error("Falha ao validar cartão com o banco.");

      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/payment/card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: mpResponse.id,
          transaction_amount: amount,
          installments: installments,
          payment_method_id: cardBrand.brand,
          payer: { 
            email: "email@cliente.com",
            first_name: cardHolder.split(' ')[0] 
          },
          externalId: orderId,
          items: items.map(i => ({
             title: i.name,
             description: i.name,
             quantity: i.quantity,
             unit_price: i.price,
             id: `item-${Date.now()}`
          }))
        }),
      });

      const result = await backendResponse.json();

      if (result.status === 'approved') {
        toast.success("Pagamento Confirmado!");
        onSuccess();
      } else {
        toast.error(`Não aprovado: ${result.status_detail || 'Verifique o cartão'}`);
      }

    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao processar: " + (error.message || "Tente novamente."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CreditCard3D
        cardNumber={cardNumber} cardHolder={cardHolder} expiryDate={expiryDate}
        cvv={cvv} cardBrand={cardBrand} bankInfo={bankInfo} isFlipped={isCardFlipped}
      />

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Número do Cartão</label>
        <div className="relative">
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" inputMode="numeric" value={cardNumber} onChange={handleCardNumberChange} onBlur={() => handleBlur('cardNumber')} placeholder="0000 0000 0000 0000" className={`checkout-input pl-12 ${touched.cardNumber && errors.cardNumber ? 'border-destructive' : ''}`} />
        </div>
        {touched.cardNumber && errors.cardNumber && <p className="mt-1.5 text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.cardNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Nome no Cartão</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" value={cardHolder} onChange={(e) => setCardHolder(e.target.value.toUpperCase())} onBlur={() => handleBlur('cardHolder')} placeholder="NOME COMO ESTÁ NO CARTÃO" className={`checkout-input pl-12 uppercase ${touched.cardHolder && errors.cardHolder ? 'border-destructive' : ''}`} />
        </div>
        {touched.cardHolder && errors.cardHolder && <p className="mt-1.5 text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.cardHolder}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Validade</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" inputMode="numeric" value={expiryDate} onChange={handleExpiryChange} onBlur={() => handleBlur('expiryDate')} placeholder="MM/AA" className={`checkout-input pl-12 ${touched.expiryDate && errors.expiryDate ? 'border-destructive' : ''}`} />
          </div>
          {touched.expiryDate && errors.expiryDate && <p className="mt-1.5 text-xs text-destructive">{errors.expiryDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">CVV</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" inputMode="numeric" value={cvv} onChange={handleCvvChange} onFocus={() => setIsCardFlipped(true)} onBlur={() => { setIsCardFlipped(false); handleBlur('cvv'); }} placeholder={cardBrand.brand === 'amex' ? '0000' : '000'} className={`checkout-input pl-12 ${touched.cvv && errors.cvv ? 'border-destructive' : ''}`} />
          </div>
          {touched.cvv && errors.cvv && <p className="mt-1.5 text-xs text-destructive">{errors.cvv}</p>}
        </div>
      </div>

      <InstallmentSelect options={installmentOptions} selectedInstallment={installments} onSelect={setInstallments} />
      <div className="pt-2"><SecurityBadge variant="inline" /></div>

      <button type="submit" disabled={isProcessing} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed h-12 text-base">
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processando Pagamento...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Pagar {installments}x de {installmentOptions.find(i => i.installments === installments)?.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </>
        )}
      </button>
    </form>
  );
}