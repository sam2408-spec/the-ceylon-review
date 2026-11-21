// Quotes for the blue statement band on the front page. One is shown at a time and
// the band moves to the next every five minutes. Wording and dates are from the cited sources.
export interface BandQuote {
  text: string;
  by?: string; // person
  source?: string; // where and when it was said or written
}

export const BAND_QUOTES: BandQuote[] = [
  {
    text: 'There is no shortage of commentary. What is in short supply is accountability.',
    source: 'Law, human rights and global justice, reported from Sri Lanka',
  },
  {
    text: 'We know too well that our freedom is incomplete without the freedom of the Palestinians.',
    by: 'Nelson Mandela',
    source: 'International Day of Solidarity with the Palestinian People, Pretoria, 4 December 1997',
  },
  {
    text: 'I have fought against white domination, and I have fought against black domination.',
    by: 'Nelson Mandela',
    source: 'Statement from the dock, Rivonia Trial, 20 April 1964',
  },
  {
    text: 'For to be free is not merely to cast off one’s chains, but to live in a way that respects and enhances the freedom of others.',
    by: 'Nelson Mandela',
    source: 'Long Walk to Freedom, 1994',
  },
  {
    text: 'Overcoming poverty is not a gesture of charity. It is an act of justice.',
    by: 'Nelson Mandela',
    source: 'Trafalgar Square, London, 3 February 2005',
  },
  {
    text: 'We declare our right on this earth to be a man, to be a human being, to be respected as a human being.',
    by: 'Malcolm X',
    source: 'Founding rally of the Organization of Afro-American Unity, 28 June 1964',
  },
  {
    text: 'Above all, always be capable of feeling deeply any injustice committed against anyone, anywhere in the world.',
    by: 'Che Guevara',
    source: 'Letter to his children, 1965',
  },
  {
    text: 'Injustice anywhere is a threat to justice everywhere.',
    by: 'Martin Luther King Jr.',
    source: 'Letter from Birmingham Jail, 16 April 1963',
  },
  {
    text: 'Power concedes nothing without a demand. It never did and it never will.',
    by: 'Frederick Douglass',
    source: 'West India Emancipation address, 3 August 1857',
  },
  {
    text: 'Freedom is always and exclusively freedom for the one who thinks differently.',
    by: 'Rosa Luxemburg',
    source: 'The Russian Revolution, 1918',
  },
];

export const BAND_INTERVAL_MS = 5 * 60 * 1000;
