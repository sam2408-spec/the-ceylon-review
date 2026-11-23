// Flash news from Gaza: shown as a rotating carousel at the top of the front page.
// Newest first. Update this list each day; only items whose date is today or within
// FLASH_MAX_AGE_DAYS are shown, so old flashes drop off by themselves.
export interface FlashItem {
  date: string; // YYYY-MM-DD (Sri Lanka date)
  label: string; // heading shown on the card
  text: string;
  source?: string;
}

export const FLASH_MAX_AGE_DAYS = 2;

export const FLASH_ITEMS: FlashItem[] = [
  {
    date: '2026-11-23',
    label: 'Breaking news from Gaza',
    text: 'Two Palestinians were killed and several others injured, some in critical condition, after an Israeli drone targeted a vehicle near the Ansar Junction, west of Gaza City.',
  },
  {
    date: '2026-11-23',
    label: 'Report from GSF correspondent in Gaza',
    text: '12 deaths from meningitis have been recorded in Gaza over the past two months, amid warnings of a potential outbreak, particularly among children, due to overcrowding, contaminated water and malnutrition.',
    source: 'GSF correspondent in Gaza',
  },
  {
    date: '2026-11-23',
    label: 'Breaking news from Gaza',
    text: 'One Palestinian was injured by Israeli army gunfire near the Asdaa City area, northwest of Khan Younis.',
  },
];
