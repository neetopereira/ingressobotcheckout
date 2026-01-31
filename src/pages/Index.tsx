import { useState } from 'react';
import { Header } from '@/components/checkout/Header';
import { Footer } from '@/components/checkout/Footer';
import { CardForm, CardFormData } from '@/components/checkout/CardForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { TrustIndicators } from '@/components/checkout/TrustIndicators';
import { SuccessScreen } from '@/components/checkout/SuccessScreen';
import { calculateInstallments, formatCurrency } from '@/lib/cardUtils';

// Simulated order data (would come from URL params or API in production)
const mockOrderData = {
  eventName: 'BAILE DO DENNIS DJ',
  eventDate: 'Sábado, 15 de Fevereiro • 23h',
  eventLocation: 'Arena Club - São Paulo, SP',
  buyerName: 'João Silva',
  items: [
    { name: 'Pista Premium', quantity: 2, price: 150 },
    { name: 'Camarote VIP', quantity: 1, price: 350 },
  ],
};

export default function Index() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());
  const [selectedInstallments, setSelectedInstallments] = useState(1);

  const subtotal = mockOrderData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;
  const installmentOptions = calculateInstallments(total);

  const handleSubmit = async (data: CardFormData) => {
    setIsProcessing(true);
    setSelectedInstallments(data.installments);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsProcessing(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    const selectedOption = installmentOptions.find(opt => opt.installments === selectedInstallments) || installmentOptions[0];
    return (
      <SuccessScreen
        orderNumber={orderNumber}
        eventName={mockOrderData.eventName}
        total={selectedOption.total}
        installments={selectedInstallments}
        installmentValue={selectedOption.value}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-accent/5 blur-[100px] rounded-full" />
      </div>

      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Finalizar Pagamento
              </h1>
              <p className="text-muted-foreground">
                Preencha os dados do seu cartão para concluir a compra
              </p>
            </div>

            <div className="checkout-card p-6 md:p-8 animate-fade-in-up delay-100">
              <CardForm 
                total={total} 
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
              />
            </div>

            <div className="animate-fade-in-up delay-200">
              <TrustIndicators />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-8 h-fit animate-fade-in-up delay-100">
            <OrderSummary
              eventName={mockOrderData.eventName}
              eventDate={mockOrderData.eventDate}
              eventLocation={mockOrderData.eventLocation}
              items={mockOrderData.items}
              buyerName={mockOrderData.buyerName}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
