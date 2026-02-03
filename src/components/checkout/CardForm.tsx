import { useState, useEffect, useRef, useCallback } from 'react';
import { User, AlertCircle, Lock, Shield, CreditCard } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from "sonner";

import { InstallmentSelect } from './InstallmentSelect';
import { SecurityBadge } from './SecurityBadge';
import { CreditCard3D } from './CreditCard3D';
import {
  detectCardBrand,
  detectBank,
  formatCardNumber,
  formatExpiryDate,
  CardBrandInfo,
  BankInfo,
} from '@/lib/cardUtils';

// Types
interface MercadoPagoInstance {
  fields: {
    create: (type: string, options?: object) => MercadoPagoField;
    createCardToken: (options: object) => Promise<{ id: string }>;
  };
  getIdentificationTypes: () => Promise<IdentificationType[]>;
  getPaymentMethods: (options: { bin: string }) => Promise<{ results: PaymentMethod[] }>;
  getIssuers: (options: { paymentMethodId: string; bin: string }) => Promise<Issuer[]>;
  getInstallments: (options: { amount: string; bin: string; paymentTypeId?: string }) => Promise<InstallmentResponse[]>;
}

interface MercadoPagoField {
  mount: (containerId: string) => void;
  unmount: () => void;
  on: (event: string, callback: (data: any) => void) => void;
}

interface IdentificationType {
  id: string;
  name: string;
  min_length: number;
  max_length: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  payment_type_id: string;
  thumbnail: string;
  secure_thumbnail: string;
}

interface Issuer {
  id: string;
  name: string;
  thumbnail: string;
  secure_thumbnail: string;
}

interface InstallmentResponse {
  payment_method_id: string;
  payment_type_id: string;
  issuer: { id: string; name: string };
  payer_costs: PayerCost[];
}

interface PayerCost {
  installments: number;
  installment_rate: number;
  discount_rate: number;
  labels: string[];
  installment_amount: number;
  total_amount: number;
  recommended_message: string;
}

interface CardFormProps {
  amount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  onSuccess: () => void;
}

// SDK Loader
const loadMercadoPagoSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load MercadoPago SDK'));
    document.body.appendChild(script);
  });
};

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance;
  }
}

export function CardForm({ amount, items, onSuccess }: CardFormProps) {
  const { orderId } = useParams();
  
  // SDK & Fields Refs
  const mpRef = useRef<MercadoPagoInstance | null>(null);
  const cardNumberFieldRef = useRef<MercadoPagoField | null>(null);
  const expirationFieldRef = useRef<MercadoPagoField | null>(null);
  const securityCodeFieldRef = useRef<MercadoPagoField | null>(null);

  // State
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [cardHolder, setCardHolder] = useState('');
  const [docType, setDocType] = useState('CPF');
  const [docNumber, setDocNumber] = useState('');
  const [installments, setInstallments] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Detected Data
  const [detectedBin, setDetectedBin] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [issuerId, setIssuerId] = useState('');
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [payerCosts, setPayerCosts] = useState<PayerCost[]>([]);
  const [identificationTypes, setIdentificationTypes] = useState<IdentificationType[]>([]);

  // Visual State for 3D Card
  const [displayCardNumber, setDisplayCardNumber] = useState('');
  const [displayExpiry, setDisplayExpiry] = useState('');
  const [displayCvv, setDisplayCvv] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Derived
  const cardBrand: CardBrandInfo = detectCardBrand(detectedBin);
  const bankInfo: BankInfo | null = detectBank(detectedBin);

  // Field Styles
  const fieldStyle = {
    height: '56px',
    padding: '0 16px',
    fontSize: '16px',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#f4f4f5',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
  };

  // Initialize SDK
  useEffect(() => {
    let mounted = true;

    const initSDK = async () => {
      try {
        await loadMercadoPagoSDK();
        
        if (!mounted) return;

        const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
        if (!publicKey) {
          toast.error('Chave pública do Mercado Pago não configurada');
          return;
        }

        const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
        mpRef.current = mp;

        // Load Identification Types
        const idTypes = await mp.getIdentificationTypes();
        if (mounted) {
          setIdentificationTypes(idTypes);
          if (idTypes.length > 0) {
            setDocType(idTypes[0].id);
          }
        }

        // Create Secure Fields
        const cardNumberField = mp.fields.create('cardNumber', {
          placeholder: '0000 0000 0000 0000',
          style: fieldStyle,
        });

        const expirationField = mp.fields.create('expirationDate', {
          placeholder: 'MM/AA',
          style: fieldStyle,
        });

        const securityCodeField = mp.fields.create('securityCode', {
          placeholder: '123',
          style: fieldStyle,
        });

        // Mount fields
        cardNumberField.mount('cardNumber-container');
        expirationField.mount('expirationDate-container');
        securityCodeField.mount('securityCode-container');

        cardNumberFieldRef.current = cardNumberField;
        expirationFieldRef.current = expirationField;
        securityCodeFieldRef.current = securityCodeField;

        // Event: BIN Change (Brand Detection)
        cardNumberField.on('binChange', async (data: { bin: string }) => {
          if (!data.bin || data.bin.length < 6) {
            setDetectedBin('');
            setPaymentMethodId('');
            setIssuerId('');
            setIssuers([]);
            setPayerCosts([]);
            return;
          }

          setDetectedBin(data.bin);

          try {
            // Get Payment Method
            const paymentMethods = await mp.getPaymentMethods({ bin: data.bin });
            if (paymentMethods.results.length > 0) {
              const pm = paymentMethods.results[0];
              setPaymentMethodId(pm.id);

              // Get Issuers
              const issuersList = await mp.getIssuers({
                paymentMethodId: pm.id,
                bin: data.bin,
              });
              setIssuers(issuersList);
              if (issuersList.length > 0) {
                setIssuerId(issuersList[0].id);
              }

              // Get Installments
              const installmentsData = await mp.getInstallments({
                amount: String(amount),
                bin: data.bin,
              });
              if (installmentsData.length > 0) {
                setPayerCosts(installmentsData[0].payer_costs);
              }
            }
          } catch (error) {
            console.error('Error fetching payment data:', error);
          }
        });

        // Visual updates for 3D card
        cardNumberField.on('change', (data: { cardNumber?: string }) => {
          if (data.cardNumber) {
            setDisplayCardNumber(formatCardNumber(data.cardNumber));
          }
        });

        expirationField.on('change', (data: { expirationDate?: string }) => {
          if (data.expirationDate) {
            setDisplayExpiry(formatExpiryDate(data.expirationDate.replace('/', '')));
          }
        });

        securityCodeField.on('focus', () => setIsCardFlipped(true));
        securityCodeField.on('blur', () => setIsCardFlipped(false));
        securityCodeField.on('change', (data: { securityCode?: string }) => {
          if (data.securityCode) {
            setDisplayCvv(data.securityCode);
          }
        });

        if (mounted) setSdkLoaded(true);

      } catch (error) {
        console.error('SDK Init Error:', error);
        toast.error('Erro ao carregar sistema de pagamento');
      }
    };

    initSDK();

    return () => {
      mounted = false;
      cardNumberFieldRef.current?.unmount();
      expirationFieldRef.current?.unmount();
      securityCodeFieldRef.current?.unmount();
    };
  }, [amount]);

  // Handle Issuer Change
  const handleIssuerChange = useCallback(async (newIssuerId: string) => {
    setIssuerId(newIssuerId);
    
    if (mpRef.current && detectedBin) {
      try {
        const installmentsData = await mpRef.current.getInstallments({
          amount: String(amount),
          bin: detectedBin,
        });
        if (installmentsData.length > 0) {
          const issuerInstallments = installmentsData.find(
            (item) => item.issuer.id === newIssuerId
          );
          if (issuerInstallments) {
            setPayerCosts(issuerInstallments.payer_costs);
          }
        }
      } catch (error) {
        console.error('Error fetching installments:', error);
      }
    }
  }, [amount, detectedBin]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mpRef.current) {
      toast.error('Sistema de pagamento não inicializado');
      return;
    }

    // Validation
    if (!cardHolder.trim() || cardHolder.trim().split(' ').length < 2) {
      toast.error('Digite o nome completo como está no cartão');
      return;
    }

    if (!docNumber.trim()) {
      toast.error('Digite o número do documento');
      return;
    }

    if (!paymentMethodId) {
      toast.error('Digite um número de cartão válido');
      return;
    }

    setIsProcessing(true);

    try {
      // Create Card Token
      const tokenResponse = await mpRef.current.fields.createCardToken({
        cardholderName: cardHolder,
        identificationType: docType,
        identificationNumber: docNumber.replace(/\D/g, ''),
      });

      const selectedInstallment = payerCosts.find(pc => pc.installments === installments);

      // Send to Backend (Orders API structure)
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/payment/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenResponse.id,
          transaction_amount: selectedInstallment?.total_amount || amount,
          installments: installments,
          payment_method_id: paymentMethodId,
          issuer_id: issuerId,
          payer: {
            email: 'cliente@email.com',
            first_name: cardHolder.split(' ')[0],
            last_name: cardHolder.split(' ').slice(1).join(' '),
            identification: {
              type: docType,
              number: docNumber.replace(/\D/g, ''),
            },
          },
          external_reference: orderId,
          items: items.map((item, idx) => ({
            id: `item-${idx}`,
            title: item.name,
            description: item.name,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      });

      const result = await backendResponse.json();

      if (result.status === 'approved') {
        toast.success('Pagamento Confirmado!');
        onSuccess();
      } else {
        toast.error(`Pagamento não aprovado: ${result.status_detail || 'Verifique os dados do cartão'}`);
      }

    } catch (error: any) {
      console.error('Payment Error:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format Document Number
  const formatDocNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (docType === 'CPF') {
      return digits
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    if (docType === 'CNPJ') {
      return digits
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    return digits;
  };

  // Installment Options for InstallmentSelect component
  const installmentOptions = payerCosts.map((pc) => ({
    installments: pc.installments,
    value: pc.installment_amount,
    total: pc.total_amount,
    interestRate: pc.installment_rate,
    hasInterest: pc.installment_rate > 0,
  }));

  if (!sdkLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando pagamento seguro...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 3D Card Preview */}
      <CreditCard3D
        cardNumber={displayCardNumber}
        cardHolder={cardHolder}
        expiryDate={displayExpiry}
        cvv={displayCvv}
        cardBrand={cardBrand}
        bankInfo={bankInfo}
        isFlipped={isCardFlipped}
      />

      {/* Secure Field: Card Number */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Número do Cartão
        </label>
        <div className="relative">
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
          <div
            id="cardNumber-container"
            className="checkout-input pl-12 min-h-[56px] flex items-center"
          />
        </div>
        {detectedBin && paymentMethodId && (
          <p className="mt-1.5 text-xs text-primary flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {cardBrand.name} detectado
          </p>
        )}
      </div>

      {/* Cardholder Name */}
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
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            className="checkout-input pl-12 uppercase min-h-[56px]"
          />
        </div>
      </div>

      {/* Expiry & CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Validade
          </label>
          <div
            id="expirationDate-container"
            className="checkout-input min-h-[56px] flex items-center px-4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            CVV
          </label>
          <div
            id="securityCode-container"
            className="checkout-input min-h-[56px] flex items-center px-4"
          />
        </div>
      </div>

      {/* Document */}
      <div className="grid grid-cols-[120px,1fr] gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Documento
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="checkout-input min-h-[56px] bg-card"
          >
            {identificationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Número
          </label>
          <input
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(formatDocNumber(e.target.value))}
            placeholder={docType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
            className="checkout-input min-h-[56px]"
          />
        </div>
      </div>

      {/* Issuer Select (if multiple) */}
      {issuers.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Banco Emissor
          </label>
          <select
            value={issuerId}
            onChange={(e) => handleIssuerChange(e.target.value)}
            className="checkout-input min-h-[56px] bg-card"
          >
            {issuers.map((issuer) => (
              <option key={issuer.id} value={issuer.id}>
                {issuer.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Installments */}
      {installmentOptions.length > 0 ? (
        <InstallmentSelect
          options={installmentOptions}
          selectedInstallment={installments}
          onSelect={setInstallments}
        />
      ) : (
        <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            Digite o número do cartão para ver as opções de parcelamento
          </p>
        </div>
      )}

      {/* Security Badge */}
      <div className="pt-2">
        <SecurityBadge variant="inline" />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || !paymentMethodId}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed h-14 text-base"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processando Pagamento...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>
              Pagar{' '}
              {installmentOptions.length > 0
                ? `${installments}x de ${installmentOptions
                    .find((i) => i.installments === installments)
                    ?.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                : amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </>
        )}
      </button>
    </form>
  );
}
