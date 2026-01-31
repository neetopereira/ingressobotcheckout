import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { InstallmentOption, formatCurrency } from '@/lib/cardUtils';

interface InstallmentSelectProps {
  options: InstallmentOption[];
  selectedInstallment: number;
  onSelect: (installments: number) => void;
}

export function InstallmentSelect({ options, selectedInstallment, onSelect }: InstallmentSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.installments === selectedInstallment) || options[0];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        Parcelas
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full checkout-input flex items-center justify-between cursor-pointer"
      >
        <span>
          {selectedOption.installments}x de {formatCurrency(selectedOption.value)}
          {selectedOption.hasInterest && (
            <span className="text-muted-foreground ml-1">
              ({selectedOption.interestRate.toFixed(2)}% a.m.)
            </span>
          )}
          {!selectedOption.hasInterest && selectedOption.installments > 1 && (
            <span className="text-success ml-1">sem juros</span>
          )}
        </span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 top-full left-0 right-0 mt-2 py-2 rounded-xl bg-card border border-border shadow-lg max-h-64 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.installments}
                type="button"
                onClick={() => {
                  onSelect(option.installments);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors hover:bg-secondary/50 ${
                  option.installments === selectedInstallment ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {option.installments}x de {formatCurrency(option.value)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {option.hasInterest ? (
                      <>Total: {formatCurrency(option.total)} ({option.interestRate.toFixed(2)}% a.m.)</>
                    ) : option.installments > 1 ? (
                      <span className="text-success">sem juros</span>
                    ) : (
                      <>Total: {formatCurrency(option.total)}</>
                    )}
                  </span>
                </div>
                {option.installments === selectedInstallment && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
