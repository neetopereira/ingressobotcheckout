import { Calendar, MapPin, User, Ticket } from 'lucide-react';
import { formatCurrency } from '@/lib/cardUtils';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummaryProps {
  eventName: string;
  eventDate: string;
  eventLocation: string;
  items: OrderItem[];
  buyerName: string;
}

export function OrderSummary({ eventName, eventDate, eventLocation, items, buyerName }: OrderSummaryProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const serviceFee = subtotal * 0.1; // 10% taxa de serviço
  const total = subtotal + serviceFee;

  return (
    <div className="checkout-card p-6 space-y-6">
      {/* Event Info */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">{eventName}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{eventDate}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{eventLocation}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Buyer Info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Comprador</p>
          <p className="font-medium text-sm">{buyerName}</p>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Items */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Ingressos</h4>
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary">{item.quantity}x</span>
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-border/50" />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxa de serviço</span>
          <span>{formatCurrency(serviceFee)}</span>
        </div>
        <div className="h-px bg-border/50 my-2" />
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
