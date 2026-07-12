import { format } from 'date-fns';
import { History, Clock, ChevronRight } from 'lucide-react';
import type { SearchHistoryItem } from '@workspace/api-client-react';

interface RecentSearchesProps {
  history: SearchHistoryItem[];
  onSelect: (query: string) => void;
  isLoading: boolean;
}

export function RecentSearches({ history, onSelect, isLoading }: RecentSearchesProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 w-full bg-white border border-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <History className="w-5 h-5" />
        <h2 className="text-lg font-semibold text-foreground">Recent Searches</h2>
      </div>

      <div className="grid gap-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.query)}
            className="flex items-center justify-between p-4 bg-white border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group text-left"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.medicineName}
              </span>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{format(new Date(item.searchedAt), 'MMM d, yyyy • h:mm a')}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
