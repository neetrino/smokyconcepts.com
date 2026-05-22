'use client';

import { Suspense } from 'react';
import { AddProductPageContent } from './components/AddProductPageContent';

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#efefef] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AddProductPageContent />
    </Suspense>
  );
}
