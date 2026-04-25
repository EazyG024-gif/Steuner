import { LogoMark } from '@/components/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[480px] bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 text-white flex-col justify-between p-10 shrink-0">
        <div className="flex items-center gap-3">
          <LogoMark size={34} />
          <span className="font-bold text-xl tracking-tight">Steuner</span>
        </div>
        <div>
          <blockquote className="text-xl font-medium leading-relaxed text-white/90 mb-4">
            &ldquo;Het geluk zit niet in grote momenten, maar in bewuste aandacht voor kleine dingen.&rdquo;
          </blockquote>
          <p className="text-sm text-white/60">Gebaseerd op Yale&apos;s Science of Wellbeing</p>
        </div>
        <div className="flex gap-6 text-sm text-white/50">
          <span>Dagelijkse check-ins</span>
          <span>·</span>
          <span>Patroonherkenning</span>
          <span>·</span>
          <span>WOOP-doelen</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
