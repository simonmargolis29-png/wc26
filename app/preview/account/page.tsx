'use client';

import { PreviewNavbar } from '@/components/preview/PreviewNavbar';
import { AccountClient } from '@/components/account/AccountClient';
import { mockProfile } from '@/lib/mock-data';

export default function PreviewAccount() {
  return (
    <div className="min-h-screen">
      <PreviewNavbar profile={mockProfile} />
      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-xl mx-auto">
        <AccountClient profile={mockProfile} />
      </main>
    </div>
  );
}
