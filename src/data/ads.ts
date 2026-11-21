// Sponsor panel content. To add a sponsor, add an entry below.
// image: a full https:// image URL (or a file in /public, e.g. '/ads/acme.jpg'). Suggested size 600x500.
// Leave the list empty to show only the "Advertise here" box.
export interface Ad {
  id: string;
  sponsor: string;
  image: string;
  link: string;
  caption?: string;
}

export const ADS: Ad[] = [];

export const ADVERTISE_EMAIL = 'theceylonreview@proton.me';
