'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoMark } from '@/components/logo';

export default function OnboardingPage() {
  const [naam, setNaam] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim()) return;
    setLoading(true);
    await updateProfile(naam.trim());
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-3">
          <LogoMark size={52} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Welkom bij Steuner
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Hoe mogen we je noemen? We gebruiken dit voor een persoonlijke ervaring.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Jouw naam"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            autoFocus
            className="h-11 text-base"
          />
          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={!naam.trim() || loading}
          >
            {loading ? 'Even geduld...' : 'Aan de slag →'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Gebaseerd op Yale&apos;s Science of Wellbeing
        </p>
      </div>
    </div>
  );
}
