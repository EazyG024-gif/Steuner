import { type DailyLog } from '@/types/database';
import { PILLARS, type PijlerId } from '@/lib/pillars';

export interface CorrelatieData {
  pillar: PijlerId;
  correlation: number;
  richting: 'positief' | 'negatief';
}

export interface DrempelData {
  pillar: PijlerId;
  drempel: number;
  ondersGemiddeld: number;
  bovensGemiddeld: number;
  verschil: number;
}

export interface AanbevelingData {
  pillar: PijlerId;
  reden: string;
  actie: string;
  gemiddeldeScore: number;
}

function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((acc, xi, i) => acc + (xi - mx) * (y[i] - my), 0);
  const den = Math.sqrt(
    x.reduce((acc, xi) => acc + (xi - mx) ** 2, 0) *
      y.reduce((acc, yi) => acc + (yi - my) ** 2, 0)
  );
  return den === 0 ? 0 : num / den;
}

function pillarScores(logs: DailyLog[], pillarId: PijlerId): number[] {
  return logs.map((l) => ((l.pijler_scores as Record<string, number>)[pillarId] ?? 5));
}

export function berekenCorrelaties(logs: DailyLog[]): CorrelatieData[] {
  if (logs.length < 5) return [];
  const stemmingen = logs.map((l) => l.stemming);
  return PILLARS.map((pillar) => {
    const r = pearson(pillarScores(logs, pillar.id), stemmingen);
    return {
      pillar: pillar.id,
      correlation: Math.round(r * 100) / 100,
      richting: r >= 0 ? ('positief' as const) : ('negatief' as const),
    };
  })
    .filter((c) => Math.abs(c.correlation) >= 0.3)
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

/** All pillars ranked by correlation strength, no minimum threshold. */
export function berekenAlleCorrelaties(logs: DailyLog[]): CorrelatieData[] {
  if (logs.length < 5) return [];
  const stemmingen = logs.map((l) => l.stemming);
  return PILLARS.map((pillar) => {
    const r = pearson(pillarScores(logs, pillar.id), stemmingen);
    return {
      pillar: pillar.id,
      correlation: Math.round(r * 100) / 100,
      richting: r >= 0 ? ('positief' as const) : ('negatief' as const),
    };
  }).sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

export function detecteerDrempels(logs: DailyLog[]): DrempelData[] {
  if (logs.length < 7) return [];
  const results: DrempelData[] = [];

  for (const pillar of PILLARS) {
    for (const threshold of [4, 5, 6]) {
      const laag = logs.filter((l) => (pillarScores([l], pillar.id)[0]) < threshold);
      const hoog = logs.filter((l) => (pillarScores([l], pillar.id)[0]) >= threshold);
      if (laag.length < 2 || hoog.length < 2) continue;

      const laagGem = laag.reduce((a, l) => a + l.stemming, 0) / laag.length;
      const hoogGem = hoog.reduce((a, l) => a + l.stemming, 0) / hoog.length;
      const verschil = hoogGem - laagGem;

      if (verschil >= 1.5) {
        results.push({
          pillar: pillar.id,
          drempel: threshold,
          ondersGemiddeld: Math.round(laagGem * 10) / 10,
          bovensGemiddeld: Math.round(hoogGem * 10) / 10,
          verschil: Math.round(verschil * 10) / 10,
        });
        break;
      }
    }
  }
  return results.sort((a, b) => b.verschil - a.verschil);
}

const ACTIES: Record<PijlerId, string> = {
  savor:
    'Neem vandaag 5 minuten om bewust van iets kleins te genieten — je koffie, een mooie boom, of een goed gesprek.',
  connect:
    'Plan een betekenisvol gesprek met iemand die je al een tijdje niet gesproken hebt.',
  body: 'Ga vandaag 20 minuten bewegen, ook als het maar een wandeling is.',
  flow: 'Blokkeer 90 minuten voor een taak die je uitdaagt maar haalbaar is, en leg je telefoon weg.',
  gratitude:
    'Schrijf vanavond drie concrete dingen op die goed gingen — hoe specifieker hoe beter.',
  meaning: 'Doe vandaag iets kleins voor iemand anders, zonder dat erom gevraagd werd.',
};

export interface GewoontesEffectData {
  pillar: PijlerId;
  gemDoen: number;
  gemNietDoen: number;
  verschil: number;
  aantalDoen: number;
}

export function berekenGewoontesEffect(logs: DailyLog[]): GewoontesEffectData[] {
  if (logs.length < 5) return [];

  return PILLARS.map((pillar) => {
    const gedaan = logs.filter(
      (l) => (l.gedragschecks as Record<string, boolean>)?.[pillar.id] === true
    );
    const nietGedaan = logs.filter(
      (l) => (l.gedragschecks as Record<string, boolean>)?.[pillar.id] !== true
    );
    if (gedaan.length < 3 || nietGedaan.length < 2) return null;

    const gemDoen = gedaan.reduce((a, l) => a + l.stemming, 0) / gedaan.length;
    const gemNietDoen = nietGedaan.reduce((a, l) => a + l.stemming, 0) / nietGedaan.length;
    const verschil = gemDoen - gemNietDoen;

    return {
      pillar: pillar.id,
      gemDoen: Math.round(gemDoen * 10) / 10,
      gemNietDoen: Math.round(gemNietDoen * 10) / 10,
      verschil: Math.round(verschil * 10) / 10,
      aantalDoen: gedaan.length,
    };
  })
    .filter((e): e is GewoontesEffectData => e !== null && Math.abs(e.verschil) >= 0.5)
    .sort((a, b) => b.verschil - a.verschil);
}

export function genereerAanbeveling(logs: DailyLog[]): AanbevelingData | null {
  if (logs.length < 3) return null;
  const recent = logs.slice(0, 7);
  const gemiddelden = PILLARS.map((pillar) => {
    const scores = pillarScores(recent, pillar.id);
    return { pillar: pillar.id, gem: scores.reduce((a, b) => a + b, 0) / scores.length };
  }).sort((a, b) => a.gem - b.gem);

  const laagste = gemiddelden[0];
  return {
    pillar: laagste.pillar,
    reden: `Laagste gemiddelde afgelopen ${recent.length} dagen`,
    actie: ACTIES[laagste.pillar],
    gemiddeldeScore: Math.round(laagste.gem * 10) / 10,
  };
}
