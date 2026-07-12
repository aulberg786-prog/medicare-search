import { Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchHeroProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchHero({ onSearch, isLoading }: SearchHeroProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4">
        Know Your <span className="text-primary">Medicine</span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-medium">
        Kisi bhi dawai ka naam likhein aur uske fawaid, istamal, aur nuqsanat janiye.
      </p>

      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-2xl relative group"
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="h-6 w-6" />
        </div>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Panadol, Augmentin, Brufen..."
          className="w-full pl-12 pr-32 py-8 text-lg rounded-2xl border-2 border-muted shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all bg-white"
          disabled={isLoading}
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
          <Button 
            type="submit" 
            size="lg" 
            disabled={!query.trim() || isLoading}
            className="rounded-xl px-6 py-6 text-base font-semibold shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Searching
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
