import { PILLARS } from '@/lib/pillars';
import { Mail, MessageCircle } from 'lucide-react';
import { NotificationPrompt } from '@/components/notification-prompt';

export default function UitlegPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Uitleg</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Hoe werkt Steuner en wat kan je ermee?
        </p>
      </div>

      {/* Intro animatie */}
      <div className="-mx-4 bg-card border-y border-border shadow-card overflow-hidden lg:-mx-0 lg:rounded-2xl lg:border">
        <div className="aspect-video w-full">
          <iframe
            src="/steuner-intro.html"
            className="w-full h-full border-0"
            title="Steuner introductie"
            allow="autoplay"
            allowFullScreen
          />
        </div>
      </div>

      {/* Wat is Steuner */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-3">Wat is Steuner?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Steuner is een dagelijkse welzijnstracker gebaseerd op{' '}
          <span className="font-medium text-foreground">Yale&apos;s Science of Wellbeing</span> —
          een van de populairste cursussen ter wereld over geluk en welzijn. Door dagelijks
          je scores bij te houden ontdek je patronen: wat geeft jou energie, wat kost energie,
          en welke gewoontes écht verschil maken voor jouw stemming.
        </p>
      </div>

      {/* De 6 pijlers */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-4">De 6 pijlers van welzijn</h2>
        <div className="space-y-4">
          {PILLARS.map((pillar) => (
            <div key={pillar.id} className="flex gap-3">
              <span
                className="flex items-center justify-center w-9 h-9 rounded-xl text-lg shrink-0"
                style={{ backgroundColor: pillar.color + '20' }}
              >
                {pillar.emoji}
              </span>
              <div>
                <p className="font-medium text-foreground text-sm">{pillar.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hoe werkt het */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Hoe werkt het?</h2>
        <ol className="space-y-3">
          {[
            { n: '1', t: 'Dagelijkse check-in', d: 'Geef elke dag een score voor je stemming en de 6 pijlers. Dit duurt ongeveer 2 minuten.' },
            { n: '2', t: 'Stel doelen in', d: 'Gebruik de WOOP-methode om concrete gewoontes of projecten te koppelen aan je pijlers.' },
            { n: '3', t: 'Vink gewoontes af', d: 'Geef bij elke check-in aan of je aan je doel gewerkt hebt. Steuner onthoudt dit.' },
            { n: '4', t: 'Ontdek je patronen', d: 'Na een week zie je welke pijlers en gewoontes écht invloed hebben op jouw stemming.' },
          ].map((stap) => (
            <li key={stap.n} className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                {stap.n}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{stap.t}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stap.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Meldingen */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Meldingen</h2>
        <NotificationPrompt />
      </div>

      {/* Contact */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Contact</h2>
        <div className="space-y-3">
          <a
            href="mailto:contact@steuner.app"
            className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950/40">
              <Mail size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">E-mail</p>
              <p className="text-xs text-muted-foreground">contact@steuner.app</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950/40">
              <MessageCircle size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Feedback geven</p>
              <p className="text-xs text-muted-foreground">Deel je ervaringen of ideeën</p>
            </div>
          </a>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center pb-4">
        Steuner — gebaseerd op Yale&apos;s Science of Wellbeing
      </p>
    </div>
  );
}
