import { Shield, Lock, CheckCircle } from 'lucide-react';

interface SecurityBadgeProps {
  variant?: 'default' | 'compact' | 'inline';
}

export function SecurityBadge({ variant = 'default' }: SecurityBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Lock className="w-3.5 h-3.5 text-success" />
        <span className="text-xs font-medium">Pagamento Seguro</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-success" />
          <span>SSL 256-bit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-success" />
          <span>PCI Compliant</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="security-badge">
        <Lock className="w-3.5 h-3.5 text-success" />
        <span>SSL 256-bit</span>
      </div>
      <div className="security-badge">
        <Shield className="w-3.5 h-3.5 text-success" />
        <span>PCI Compliant</span>
      </div>
      <div className="security-badge">
        <CheckCircle className="w-3.5 h-3.5 text-success" />
        <span>Dados Criptografados</span>
      </div>
    </div>
  );
}
