import { PreviewNavbar } from '@/components/preview/PreviewNavbar';
import { AdminClient } from '@/components/admin/AdminClient';
import {
  mockProfile, mockPickSixEntry, mockAllProfiles,
  mockSweepEntries, mockLeaderboard,
  mockCountryCount, mockTeamPickCount,
} from '@/lib/mock-data';

const paidSweepCount = mockSweepEntries.filter(e => e.payment_status === 'paid').length;
const paidPickSixCount = mockLeaderboard.filter(e => e.payment_status === 'paid').length;

export default function PreviewAdmin() {
  return (
    <div className="min-h-screen">
      <PreviewNavbar profile={mockProfile} pickSixEntry={mockPickSixEntry} />
      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <AdminClient
          totalUsers={mockAllProfiles.length}
          sweepEntries={mockSweepEntries.length}
          pickSixEntries={mockLeaderboard.length}
          paidSweepCount={paidSweepCount}
          paidPickSixCount={paidPickSixCount}
          revenue={(paidSweepCount * 5) + (paidPickSixCount * 10)}
          allProfiles={mockAllProfiles}
          allSweepEntries={mockSweepEntries}
          allPickSixEntries={mockLeaderboard}
          countryCount={mockCountryCount}
          teamPickCount={mockTeamPickCount}
          sweepstakeId={null}
          sweepstakeDrawn={false}
        />
      </main>
    </div>
  );
}
