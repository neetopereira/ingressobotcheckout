import { CheckCircle, MessageCircle, Ticket, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/cardUtils';

interface SuccessScreenProps {
  orderNumber: string;
  eventName: string;
  total: number;
  installments: number;
  installmentValue: number;
}

export function SuccessScreen({ 
  orderNumber, 
  eventName, 
  total, 
  installments, 
  installmentValue 
}: SuccessScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <div className="absolute inset-0 rounded-full bg-success/10 animate-ping" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Pagamento Confirmado!
          </h1>
          <p className="text-muted-foreground">
            Seu pedido foi processado com sucesso
          </p>
        </div>

        {/* Order Details Card */}
        <div className="checkout-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Pedido</span>
            <span className="font-mono font-semibold text-primary">#{orderNumber}</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{eventName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {installments > 1 
                  ? `${installments}x de ${formatCurrency(installmentValue)}`
                  : formatCurrency(total)
                }
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Notice */}
        <div className="checkout-card p-5 border-success/30 bg-success/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Ingresso via WhatsApp
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Seu ingresso será enviado automaticamente para o WhatsApp cadastrado em instantes.
              </p>
            </div>
          </div>
        </div>

        {/* Timer Notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Tempo estimado: até 5 minutos</span>
        </div>

        {/* Support Info */}
        <p className="text-center text-xs text-muted-foreground">
          Dúvidas? Fale conosco pelo mesmo WhatsApp
        </p>
      </div>
    </div>
  );
}
