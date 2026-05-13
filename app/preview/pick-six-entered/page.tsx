'use client';

import { PreviewNavbar } from '@/components/preview/PreviewNavbar';
import { PickSixClient } from '@/components/pick-six/PickSixClient';
import { mockProfile, mockPickSixEntry } from '@/lib/mock-data';

export default function PreviewPickSixEntered() {
  return (
    <div className="min-h-screen">
      <PreviewNavbar profile={mockProfile} pickSixEntry={mockPickSixEntry} />
      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <PickSixClient
          profile={mockProfile}
          existingEntry={mockPickSixEntry}
          userId={mockProfile.id}
        />
      </main>
    </div>
  );
}
