// Instagram accounts shown under the front-page articles.
// To add or remove one, edit this list. "handle" is the Instagram username without the @.
export interface SocialGroup {
  title: string;
  handles: { handle: string; name: string }[];
}

export const SOCIAL_GROUPS: SocialGroup[] = [
  {
    title: 'Flotillas and Sri Lanka',
    handles: [
      { handle: 'globalsumudflotilla', name: 'Global Sumud Flotilla' },
      { handle: 'sumudnusantaraofficial', name: 'Sumud Nusantara' },
      { handle: 'freepalestinesl', name: 'FreePalestineSL' },
    ],
  },
  {
    title: 'Palestine',
    handles: [{ handle: 'eye.on.palestine', name: 'Eye on Palestine' }],
  },
  {
    title: 'Sudan',
    handles: [
      { handle: 'mutual.aid.sudan', name: 'Mutual Aid Sudan Coalition' },
      { handle: 'unhcrsudan', name: 'UNHCR Sudan' },
    ],
  },
  {
    title: 'Congo',
    handles: [
      { handle: 'freecongo.now', name: 'Free Congo' },
      { handle: 'easterncongo', name: 'Eastern Congo Initiative' },
    ],
  },
  {
    title: 'Rohingya',
    handles: [{ handle: 'rohingyatographer', name: 'Rohingyatographer' }],
  },
  {
    title: 'Cuba',
    handles: [{ handle: 'cubasolidarity', name: 'Cuba Solidarity Campaign' }],
  },
];
