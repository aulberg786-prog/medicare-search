import { useState, useCallback } from 'react';
import { useSearchMedicine, useGetMedicineHistory, getGetMedicineHistoryQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from '@/components/header';
import { SearchHero } from '@/components/search-hero';
import { MedicineResultView } from '@/components/medicine-result';
import { RecentSearches } from '@/components/recent-searches';
import type { MedicineResult, MedicineNotFound } from '@workspace/api-client-react';

export default function Home() {
  const queryClient = useQueryClient();
  const searchMutation = useSearchMedicine();
  const { data: history, isLoading: isHistoryLoading } = useGetMedicineHistory({ limit: 5 });

  const [currentResult, setCurrentResult] = useState<MedicineResult | MedicineNotFound | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setCurrentResult(null); // Clear previous result

    searchMutation.mutate({ data: { query } }, {
      onSuccess: async (data) => {
        setCurrentResult(data);

        // If it's a valid medicine, save it to firebase and invalidate history
        if (data.isMedicine) {
          const medData = data as MedicineResult;

          // Invalidate postgres history query
          queryClient.invalidateQueries({ queryKey: getGetMedicineHistoryQueryKey() });

          // Save to Firebase if configured
          if (db) {
            try {
              await addDoc(collection(db, 'medicine_searches'), {
                query,
                medicineName: medData.medicineName,
                searchedAt: serverTimestamp()
              });
            } catch (err) {
              console.error("Error saving search to Firebase", err);
            }
          }
        }
      }
    });
  }, [searchMutation, queryClient]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-20">
        <SearchHero
          onSearch={handleSearch}
          isLoading={searchMutation.isPending}
        />

        {currentResult ? (
          <div className="mt-8 border-t border-border pt-8">
            <MedicineResultView result={currentResult} />
          </div>
        ) : (
          <div className="mt-4">
            <RecentSearches
              history={history || []}
              onSelect={handleSearch}
              isLoading={isHistoryLoading}
            />
          </div>
        )}
      </main>
    </div>
  );
}
