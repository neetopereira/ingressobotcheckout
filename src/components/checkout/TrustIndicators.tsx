import { LockKeyhole } from 'lucide-react';

export function TrustIndicators() {
  return (
    <div className="w-full mt-6">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/20 border border-border/50">
        <div className="mt-0.5 p-1.5 bg-background rounded-md shadow-sm border border-border">
           <LockKeyhole className="w-4 h-4 text-primary" />
        </div>
        
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground">
            Ambiente Verificado e Seguro
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Suas informações estão protegidas por criptografia de ponta a ponta (SSL). 
            Nenhum dado sensível do seu cartão é armazenado em nossos servidores.
          </p>
        </div>
      </div>
    </div>
  );
}