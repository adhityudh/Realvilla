export interface LetterConfig {
  svg: string;
  width: number;
  colorClass: 'text-gold' | 'text-black';
}

export const REALVILLA_LETTERS: LetterConfig[] = [
  { svg: '/letters/r.svg', width: 1.06, colorClass: 'text-gold' },
  { svg: '/letters/e.svg', width: 0.88, colorClass: 'text-gold' },
  { svg: '/letters/a.svg', width: 1.05, colorClass: 'text-gold' },
  { svg: '/letters/l.svg', width: 0.90, colorClass: 'text-gold' },
  { svg: '/letters/v.svg', width: 1.05, colorClass: 'text-black' },
  { svg: '/letters/i.svg', width: 0.51, colorClass: 'text-black' },
  { svg: '/letters/l.svg', width: 0.90, colorClass: 'text-black' },
  { svg: '/letters/l.svg', width: 0.90, colorClass: 'text-black' },
  { svg: '/letters/a.svg', width: 1.05, colorClass: 'text-black' },
];

export const HEADER_LETTERS = [
  { svg: '/letters/r.svg', width: 1.06 },
  { svg: '/letters/e.svg', width: 0.88 },
  { svg: '/letters/a.svg', width: 1.05 },
  { svg: '/letters/l.svg', width: 0.90 },
  { svg: '/letters/v.svg', width: 1.05 },
  { svg: '/letters/i.svg', width: 0.51 },
  { svg: '/letters/l.svg', width: 0.90 },
  { svg: '/letters/l.svg', width: 0.90 },
  { svg: '/letters/a.svg', width: 1.05 },
];

export const NAV_LINKS = [
  { label: 'Buy', href: '#' },
  { label: 'Sell', href: '#' },
  { label: 'Invest', href: '#' },
  { label: 'Mortgages', href: '#' },
];

export const HERO_CTAS = [
  { label: 'Buy', icon: '/icons/arrows_more_down.svg' },
  { label: 'Sell', icon: '/icons/arrows_more_up.svg' },
  { label: 'Invest', icon: '/icons/euro.svg' },
  { label: 'Mortgages', icon: '/icons/contract.svg' },
];
