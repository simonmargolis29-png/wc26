'use client';

import { PreviewNavbar } from '@/components/preview/PreviewNavbar';
import { SweepstakeClient } from '@/components/sweepstake/SweepstakeClient';
import { mockProfile, mockSweepstake, mockSweepstakeEntryWithTeam } from '@/lib/mock-data';

export default function PreviewSweepstakeEntered() {
  return (
    <div className="min-h-screen">
      <PreviewNavbar profile={mockProfile} />
      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <SweepstakeClient
          profile={mockProfile}
          sweepstake={mockSweepstake}
          existingEntry={mockSweepstakeEntryWithTeam}
          entryCount={35}
          userId={mockProfile.id}
        />
      </main>
    </div>
  );
}
