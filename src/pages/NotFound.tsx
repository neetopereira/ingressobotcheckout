import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[200px] bg-destructive/10 blur-[100px] rounded-full" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Icon */}
          <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full bg-muted/50 border border-border flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center">
              <Search className="w-4 h-4 text-destructive" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-7xl font-bold bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-xl font-semibold text-foreground">
              Página não encontrada
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              O link que você tentou acessar não existe ou foi movido. 
              Verifique se o endereço está correto.
            </p>
          </div>

          {/* Path Display */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
            <code className="text-sm text-muted-foreground font-mono">
              {location.pathname}
            </code>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Página Inicial
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground pt-8">
            Precisa de ajuda? Entre em contato pelo{" "}
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              WhatsApp
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground relative z-10">
        <p>IngressoBot.Digital © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default NotFound;
