import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/checkout/Header';
import { Footer } from '@/components/checkout/Footer';
import { CardForm } from '@/components/checkout/CardForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { TrustIndicators } from '@/components/checkout/TrustIndicators';
import { SuccessScreen } from '@/components/checkout/SuccessScreen';
import { Loader2, AlertCircle } from 'lucide-react'; 
import { Button } from '@/components/ui/button';

interface OrderData {
  id: string;
  status: string; // O campo essencial para o bloqueio
  eventName: string;
  eventDate: string;
  eventLocation: string;
  buyerName: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export default function Index() {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}`)
      .then(res => {
        if (!res.ok) throw new Error('Falha ao buscar');
        return res.json();
      })
      .then(data => {
        setOrderData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [orderId]);

  // Cálculo da Taxa
  const subTotal = orderData?.total || 0;
  const serviceFee = subTotal * 0.10; 
  const finalTotal = subTotal + serviceFee;

  // --- TRAVA DE SEGURANÇA 🔒 ---
  // Se o robô disser que está PAID, mostramos a tela de sucesso direto.
  if (orderData?.status === 'PAID' || isSuccess) {
    return (
      <SuccessScreen
        orderNumber={orderData?.id?.slice(0, 8).toUpperCase() || orderId?.slice(0, 8).toUpperCase() || "OK"}
        eventName={orderData?.eventName || "Evento"}
        total={finalTotal}
        installments={1}
        installmentValue={finalTotal}
      />
    );
  }
  // -------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Buscando seu pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Link inválido. Retorne ao WhatsApp.
        </p>
      </div>
    );
  }

  // Se o pedido foi cancelado
  if (orderData.status === 'CANCELED') {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-gray-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Pedido Expirado</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Este pedido não está mais disponível.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-accent/5 blur-[100px] rounded-full" />
      </div>

      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8 lg:gap-12">
          
          <div className="space-y-8 order-2 lg:order-1">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Finalizar Pagamento
              </h1>
              <p className="text-muted-foreground">
                Preencha os dados do cartão para garantir seus ingressos para 
                <span className="font-semibold text-primary"> {orderData.eventName}</span>.
              </p>
            </div>

            <div className="checkout-card p-6 md:p-8 animate-fade-in-up delay-100">
              <CardForm 
                amount={finalTotal} 
                items={orderData.items} 
                onSuccess={() => setIsSuccess(true)}
              />
            </div>

            <div className="animate-fade-in-up delay-200">
              <TrustIndicators />
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-8 h-fit animate-fade-in-up delay-100">
            <OrderSummary
              eventName={orderData.eventName}
              eventDate={orderData.eventDate}
              eventLocation={orderData.eventLocation}
              items={orderData.items}
              buyerName={orderData.buyerName}
            />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}