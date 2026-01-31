import { CardBrandIcon } from '@/components/icons/CardBrandIcon';
import { CardBrandInfo, BankInfo } from '@/lib/cardUtils';

interface CreditCard3DProps {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  cardBrand: CardBrandInfo;
  bankInfo: BankInfo | null;
  isFlipped: boolean;
}

export function CreditCard3D({
  cardNumber,
  cardHolder,
  expiryDate,
  cvv,
  cardBrand,
  bankInfo,
  isFlipped,
}: CreditCard3DProps) {
  const displayNumber = cardNumber || '•••• •••• •••• ••••';
  const displayHolder = cardHolder || 'NOME DO TITULAR';
  const displayExpiry = expiryDate || 'MM/AA';
  const displayCvv = cvv ? cvv.replace(/./g, '•') : '•••';

  return (
    <div className="perspective-1000 w-full max-w-[340px] mx-auto mb-6">
      <div
        className={`relative w-full aspect-[1.586/1] transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of Card */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-secondary"
            style={{
              background: bankInfo 
                ? `linear-gradient(135deg, ${bankInfo.color}20, hsl(var(--card)), ${bankInfo.color}10)`
                : undefined
            }}
          />
          
          {/* Holographic effect */}
          <div className="absolute inset-0 opacity-30 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
          
          {/* Card content */}
          <div className="relative h-full p-5 flex flex-col justify-between">
            {/* Top row - Bank & Chip */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {/* Chip */}
                <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-400/80 to-yellow-600/80 flex items-center justify-center">
                  <div className="w-6 h-5 rounded-sm border border-yellow-700/50 bg-gradient-to-br from-yellow-300/50 to-yellow-500/50" />
                </div>
                {/* Contactless */}
                <svg className="w-6 h-6 text-muted-foreground/50" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6c3.866 0 7 3.134 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 10c1.657 0 3 1.343 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="13" r="1" fill="currentColor"/>
                </svg>
              </div>
              
              {bankInfo && (
                <span 
                  className="text-xs font-semibold px-2 py-1 rounded-md"
                  style={{ color: bankInfo.color, backgroundColor: `${bankInfo.color}20` }}
                >
                  {bankInfo.name}
                </span>
              )}
            </div>

            {/* Card Number */}
            <div className="space-y-1">
              <p className="text-lg md:text-xl font-mono tracking-[0.2em] text-foreground">
                {displayNumber}
              </p>
            </div>

            {/* Bottom row - Holder, Expiry, Brand */}
            <div className="flex items-end justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Titular do Cartão
                </p>
                <p className="text-sm font-medium text-foreground truncate pr-4">
                  {displayHolder}
                </p>
              </div>
              
              <div className="flex items-end gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Validade
                  </p>
                  <p className="text-sm font-medium text-foreground font-mono">
                    {displayExpiry}
                  </p>
                </div>
                
                <CardBrandIcon brand={cardBrand.brand} className="w-12 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-secondary" />
          
          {/* Magnetic stripe */}
          <div className="absolute top-8 left-0 right-0 h-12 bg-black/80" />
          
          {/* Signature & CVV */}
          <div className="absolute top-24 left-0 right-0 px-5">
            <div className="flex items-center gap-3">
              {/* Signature panel */}
              <div className="flex-1 h-10 bg-white/90 rounded-sm relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="text-[8px] text-blue-600 italic whitespace-nowrap"
                      style={{ transform: `translateX(${i * 20}px)` }}
                    >
                      IngressoBot IngressoBot IngressoBot
                    </div>
                  ))}
                </div>
              </div>
              
              {/* CVV box */}
              <div className="w-16 h-10 bg-white rounded-sm flex items-center justify-center">
                <span className="text-black font-mono font-bold tracking-widest">
                  {displayCvv}
                </span>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground mt-2 text-right">
              Código de Segurança (CVV)
            </p>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-[9px] text-muted-foreground/70 leading-relaxed">
              Este cartão é propriedade do banco emissor. O uso não autorizado 
              é proibido. Se encontrado, devolva ao banco emissor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
