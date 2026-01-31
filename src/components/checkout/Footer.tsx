import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full py-6 px-4 mt-auto border-t border-border/30">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-semibold text-sm">
            Ingresso<span className="text-primary">Bot</span>.Digital
          </span>
          <span className="text-xs text-muted-foreground">
            Todos os Direitos Reservados © {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Tecnologia inteligente para eventos
          </span>
          <a 
            href="#" 
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline transition-all"
          >
            Saiba Mais
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
