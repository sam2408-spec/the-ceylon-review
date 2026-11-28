import { Article } from '../types';

export const REGIONS = [
  { id: 'sri-lanka', label: 'Sri Lanka' },
  { id: 'palestine', label: 'Palestine' },
  { id: 'sudan', label: 'Sudan' },
  { id: 'congo', label: 'Congo' },
  { id: 'syria', label: 'Syria' },
  { id: 'lebanon', label: 'Lebanon' },
  { id: 'cuba', label: 'Cuba' },
  { id: 'yemen', label: 'Yemen' },
  { id: 'world', label: 'World' },
] as const;

export type RegionId = (typeof REGIONS)[number]['id'];

const KEYWORDS: Record<Exclude<RegionId, 'world'>, RegExp> = {
  palestine: /\b(gaza|palestin\w*|west bank|hamas|rafah|khan younis|zionis\w*|hasbara)\b/i,
  'sri-lanka': /\b(sri lanka\w*|colombo|ceylon|jaffna|aragalaya|tamil|psta|pta|prevention of terrorism)\b/i,
  sudan: /\b(sudan\w*|khartoum|darfur|el[- ]fasher|rsf)\b/i,
  congo: /\b(congo\w*|drc|kinshasa|goma|kivu|m23)\b/i,
  syria: /\b(syria\w*|damascus|aleppo|idlib)\b/i,
  lebanon: /\b(lebanon|lebanese|beirut|hezbollah)\b/i,
  cuba: /\b(cuba\w*|havana)\b/i,
  yemen: /\b(yemen\w*|houthi\w*|sanaa|hodeidah|aden)\b/i,
};

// Fixed tags for the articles published so far; editors can set their own in the Editorial Desk.
const KNOWN: Record<string, RegionId[]> = {
  'art-fergie-chambers': ['palestine'],
  'art-gaza-floods': ['palestine'],
  'art-saleh-aljafarawi': ['palestine'],
  'art-manufactured-silence': ['palestine'],
  'art-colonial-law': ['sri-lanka'],
  'art-behind-the-screen': ['sri-lanka'],
  'art-rohingya-genocide-icj': ['world'],
  'art-gaza-ceasefire-day-410': ['palestine'],
  'art-albanese-costa-rica': ['world'],
  'art-syu-maradana-solidarity': ['sri-lanka', 'palestine'],
  'art-un-solidarity-day-2026': ['palestine'],
  'art-sunflower-circle-fundraiser': ['sri-lanka', 'palestine'],
};

// Which regions an article belongs to: the editor's tags first, then the known list, then
// keywords found in the title and summary.
export function articleRegions(a: Article): RegionId[] {
  if (a.regions && a.regions.length > 0) return a.regions as RegionId[];
  if (KNOWN[a.id]) return KNOWN[a.id];
  const text = `${a.title} ${a.subtitle} ${a.summary}`;
  const found = (Object.keys(KEYWORDS) as (keyof typeof KEYWORDS)[]).filter((k) => KEYWORDS[k].test(text));
  return found as RegionId[];
}
