// Per-site visual themes for the TV welcome screen.
// A site picks one via SITES.theme; anything unrecognised falls back to 'neuro'.

export interface ScreenTheme {
  logoSrc: string;
  logoAlt: string;
  logoHeight: number;
  cardBorder: string;
  text: string;
  textSoft: string;
  textFaint: string;
  footer: [string, string, string];
}

export const THEMES: Record<string, ScreenTheme> = {
  // Active Neuro — plum and gold
  neuro: {
    logoSrc: '/anlogo.jfif',
    logoAlt: 'Active Neuro',
    logoHeight: 71,
    cardBorder: 'rgba(175,135,85,0.5)',
    text: '#6B1E3C',
    textSoft: 'rgba(107,30,60,0.5)',
    textFaint: 'rgba(107,30,60,0.45)',
    footer: ['#E0CFA8', '#E06020', '#6B1E3C'],
  },
  // Active Care Group — orange and aubergine
  acg: {
    logoSrc: '/acglogo-wide.jpg',
    logoAlt: 'Active Care Group',
    logoHeight: 71,
    cardBorder: '#E06020',
    text: '#2E1022',
    textSoft: 'rgba(46,16,34,0.5)',
    textFaint: 'rgba(46,16,34,0.45)',
    footer: ['#E8DCCB', '#E06020', '#2E1022'],
  },
};

export const DEFAULT_THEME = 'neuro';

export function resolveTheme(name?: string | null): ScreenTheme {
  return THEMES[(name || '').toLowerCase()] ?? THEMES[DEFAULT_THEME];
}
