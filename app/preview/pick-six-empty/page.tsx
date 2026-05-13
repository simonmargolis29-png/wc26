'use client';

import { PreviewNavbar } from '@/components/preview/PreviewNavbar';
import { PickSixClient } from '@/components/pick-six/PickSixClient';
import { mockProfile } from '@/lib/mock-data';

export default function PreviewPickSixEmpty() {
  return (
    <div className="min-h-screen">
      <PreviewNavbar profile={mockProfile} />
      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <PickSixClient
          profile={mockProfile}
          existingEntry={null}
          userId={mockProfile.id}
          entryCount={23}
        />
      </main>
    </div>
  );
}
