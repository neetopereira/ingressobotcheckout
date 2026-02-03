import { Bot } from 'lucide-react';
import { SecurityBadge } from './SecurityBadge';

export function Header() {
  return (
    <header className="w-full py-4 px-4 md:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          {/* Container do ícone com gradiente */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Bot className="w-5 h-5 text-white" />
          </div>
          
          {/* Texto do Logo */}
          <div>
            <span className="font-bold text-lg tracking-tight">
              Ingresso<span className="text-primary">Bot</span>
            </span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">.Digital</span>
          </div>
        </div>

        {/* Security Badge - Mantido igual */}
        <SecurityBadge variant="compact" />
      </div>
    </header>
  );
}