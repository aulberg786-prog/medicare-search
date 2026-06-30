import { Pill } from 'lucide-react';
import { useLanguage, Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const { language, setLanguage } = useLanguage();

  const langOptions: { value: Language; label: string }[] = [
    { value: 'english', label: 'English' },
    { value: 'romanUrdu', label: 'Roman Urdu' },
    { value: 'urduScript', label: 'اردو' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Pill className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            MediCare <span className="text-primary font-semibold">Search</span>
          </span>
        </div>

        <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
          {langOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLanguage(opt.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                language === opt.value
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
