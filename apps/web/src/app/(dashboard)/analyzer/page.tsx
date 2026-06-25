import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AnalyzerPage from './analyzer-content';

export default function AnalyzerPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AnalyzerPage />
    </Suspense>
  );
}
