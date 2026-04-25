import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar, MobileNav } from '@/components/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-[var(--sidebar-width)] pt-14 lg:pt-0">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
