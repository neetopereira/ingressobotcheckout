import { useState, useMemo } from 'react';
import { CreditCard, Calendar, Lock, User, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from "sonner"; // Mantendo o toast do seu projeto

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
  amount: number;
  onSuccess: () => void;
}

export function CardForm({ amount, onSuccess }: CardFormProps) {
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

  // Handlers de Input
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
      case 'cardNumber':
        if (!cardNumber) newErrors.cardNumber = 'Obrigatório';
        else if (!validateCardNumber(cardNumber)) newErrors.cardNumber = 'Inválido';
        else delete newErrors.cardNumber;
        break;
      case 'cardHolder':
        if (!cardHolder.trim()) newErrors.cardHolder = 'Obrigatório';
        else if (cardHolder.trim().split(' ').length < 2) newErrors.cardHolder = 'Nome completo';
        else delete newErrors.cardHolder;
        break;
      case 'expiryDate':
        if (!expiryDate) newErrors.expiryDate = 'Obrigatório';
        else if (!validateExpiryDate(expiryDate)) newErrors.expiryDate = 'Inválido';
        else delete newErrors.expiryDate;
        break;
      case 'cvv':
        if (!cvv) newErrors.cvv = 'Obrigatório';
        else if (cvv.length < cardBrand.cvvLength) newErrors.cvv = 'Incompleto';
        else delete newErrors.cvv;
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- LÓGICA DE PAGAMENTO CORRIGIDA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validação Visual
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
      // 2. Tokenização via API Direta (Correção do Erro TypeScript)
      const [expMonth, expYear] = expiryDate.split('/');
      
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/card_tokens?public_key=${import.meta.env.VITE_MP_PUBLIC_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          card_number: cardNumber.replace(/\s/g, ''),
          cardholder: {
            name: cardHolder,
            identification: {
              type: "CPF",
              number: "00000000000" // Se você tiver input de CPF, coloque aqui. Se não, o MP pode aceitar genérico em testes.
            }
          },
          security_code: cvv,
          expiration_month: parseInt(expMonth),
          expiration_year: parseInt(`20${expYear}`)
        })
      });

      const tokenData = await mpResponse.json();

      if (tokenData.status && tokenData.status >= 400) {
        throw new Error(tokenData.message || "Erro ao validar cartão.");
      }

      if (!tokenData.id) throw new Error("Não foi possível gerar o token do cartão.");

      // 3. Envio para o Backend (Robô)
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/payment/card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenData.id,
          transaction_amount: amount,
          installments: installments,
          payment_method_id: cardBrand.brand, // ex: visa, master
          payer: { 
            email: "email@cliente.com",
            first_name: cardHolder.split(' ')[0] 
          },
          externalId: orderId
        }),
      });

      const result = await backendResponse.json();

      if (result.status === 'approved') {
        toast.success("Pagamento Confirmado!");
        onSuccess();
      } else {
        toast.error(`Pagamento não aprovado: ${result.status_detail || 'Tente outro cartão'}`);
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
      {/* Visualização 3D */}
      <CreditCard3D
        cardNumber={cardNumber}
        cardHolder={cardHolder}
        expiryDate={expiryDate}
        cvv={cvv}
        cardBrand={cardBrand}
        bankInfo={bankInfo}
        isFlipped={isCardFlipped}
      />

      {/* Input Número */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Número do Cartão</label>
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
          />
        </div>
        {touched.cardNumber && errors.cardNumber && (
          <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.cardNumber}
          </p>
        )}
      </div>

      {/* Input Nome */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Nome no Cartão</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            onBlur={() => handleBlur('cardHolder')}
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            className={`checkout-input pl-12 uppercase ${touched.cardHolder && errors.cardHolder ? 'border-destructive' : ''}`}
          />
        </div>
        {touched.cardHolder && errors.cardHolder && (
          <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.cardHolder}
          </p>
        )}
      </div>

      {/* Input Validade e CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Validade</label>
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
            />
          </div>
          {touched.expiryDate && errors.expiryDate && (
             <p className="mt-1.5 text-xs text-destructive">{errors.expiryDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">CVV</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              inputMode="numeric"
              value={cvv}
              onChange={handleCvvChange}
              onFocus={() => setIsCardFlipped(true)}
              onBlur={() => { setIsCardFlipped(false); handleBlur('cvv'); }}
              placeholder={cardBrand.brand === 'amex' ? '0000' : '000'}
              className={`checkout-input pl-12 ${touched.cvv && errors.cvv ? 'border-destructive' : ''}`}
            />
          </div>
          {touched.cvv && errors.cvv && (
             <p className="mt-1.5 text-xs text-destructive">{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* Seleção de Parcelas */}
      <InstallmentSelect
        options={installmentOptions}
        selectedInstallment={installments}
        onSelect={setInstallments}
      />

      {/* Selo de Segurança */}
      <div className="pt-2">
        <SecurityBadge variant="inline" />
      </div>

      {/* Botão de Pagar */}
      <button
        type="submit"
        disabled={isProcessing}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed h-12 text-base"
      >
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