import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InstallmentOption, formatCurrency } from '@/lib/cardUtils';

interface InstallmentSelectProps {
  options: InstallmentOption[];
  selectedInstallment: number;
  onSelect: (installments: number) => void;
}

export function InstallmentSelect({ options, selectedInstallment, onSelect }: InstallmentSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-foreground">
        Parcelas
      </label>
      
      <Select 
        value={selectedInstallment.toString()} 
        onValueChange={(value) => onSelect(Number(value))}
      >
        <SelectTrigger className="w-full h-12 bg-background border-input focus:ring-primary/20">
           <SelectValue placeholder="Selecione o parcelamento" />
        </SelectTrigger>
        
        <SelectContent className="max-h-[300px] z-[9999]">
          {options.map((option) => (
            <SelectItem 
              key={option.installments} 
              value={option.installments.toString()}
              className="py-3 cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-medium">
                  {option.installments}x de {formatCurrency(option.value)}
                </span>
                
                {option.hasInterest ? (
                  <span className="text-xs text-muted-foreground">
                    (Total: {formatCurrency(option.total)})
                  </span>
                ) : option.installments > 1 && (
                  <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                    Sem Juros
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}