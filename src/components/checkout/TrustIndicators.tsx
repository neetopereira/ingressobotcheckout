import { Shield, Zap, Users, Award } from 'lucide-react';

export function TrustIndicators() {
  const indicators = [
    {
      icon: Shield,
      title: 'Pagamento Seguro',
      description: 'Criptografia de ponta a ponta',
    },
    {
      icon: Zap,
      title: 'Entrega Instantânea',
      description: 'Ingresso direto no WhatsApp',
    },
    {
      icon: Users,
      title: '+50.000 Ingressos',
      description: 'Vendidos com sucesso',
    },
    {
      icon: Award,
      title: 'Garantia Total',
      description: 'Evento cancelado, dinheiro de volta',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {indicators.map((item, index) => (
        <div
          key={index}
          className="trust-indicator animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <item.icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
