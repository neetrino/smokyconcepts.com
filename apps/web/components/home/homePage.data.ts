import type {
  HomePackFitItem,
  HomeProductItem,
  HomeRitualStep,
  HomeSimpleCardItem,
} from './homePage.types';

export const HOME_ASSET_PATHS = {
  bagIcon: '/assets/home/icons/bag.svg',
  compactPack: '/assets/home/products/compact-figma.svg',
  craftTools: '/assets/home/concepts/craft-tools.webp',
  heroBanner: '/assets/home/concepts/hero-banner.webp',
  instagramIcon: '/assets/home/icons/instagram.svg',
  logo: '/assets/home/icons/logo.svg',
  notebook: '/assets/home/products/notebook.webp',
  packMark: '/assets/home/icons/pack-mark-figma.webp',
  phone: '/assets/home/products/phone.webp',
  playIcon: '/assets/home/icons/play.svg',
  ritualBanner: '/assets/home/concepts/ritual-banner.webp',
  /** Public path; filename contains spaces — keep percent-encoded for reliable loading */
  neetrinoPartnerLogo: '/assets/home/concepts/Asset%201%20(1).svg',
  studioLogo: '/assets/home/icons/gazar-logo.svg',
  tiktokIcon: '/assets/home/icons/tiktok.svg',
  youtubeIcon: '/assets/home/icons/youtube.svg',
} as const;

export const COVER_COLLECTIONS: HomeSimpleCardItem[] = [
  { title: 'Classic', imageSrc: '/assets/products/catalog-for/classic-green.webp' },
  { title: 'Premium', imageSrc: '/assets/products/catalog-for/premium-red.webp' },
  { title: 'Atelier', imageSrc: '/assets/home/packs/atelier-black.png' },
  { title: 'Special Edition', imageSrc: '/assets/home/packs/special-black.png' },
];

export const PACK_FIT_ITEMS: HomePackFitItem[] = [
  {
    title: 'Ultra Slims',
    subtitle: '3 versions',
    heightClassName: 'h-40',
    widthClassName: 'w-28',
  },
  {
    title: 'Compact',
    subtitle: '3 versions',
    heightClassName: 'h-44',
    widthClassName: 'w-24',
    useCompactImage: true,
  },
  {
    title: 'Super Slims',
    subtitle: '3 versions',
    heightClassName: 'h-48',
    widthClassName: 'w-28',
  },
  {
    title: 'Slims',
    subtitle: '3 versions',
    heightClassName: 'h-48',
    widthClassName: 'w-24',
  },
  {
    title: 'King Size',
    heightClassName: 'h-40',
    widthClassName: 'w-28',
  },
  {
    title: 'Sticks',
    heightClassName: 'h-28',
    widthClassName: 'w-36',
  },
];

export const RITUAL_STEPS: HomeRitualStep[] = [
  { step: '1', title: 'Apply', description: 'Submit the form.' },
  { step: '2', title: 'Consultation', description: 'We reach out to refine your vision.' },
  { step: '3', title: 'Design & Materials', description: 'You define, we turn imagination into form.' },
  { step: '4', title: 'Packaging & Delivery', description: 'Your 1 of 1, crafted and delivered.' },
];

export const TRENDING_PRODUCTS: HomeProductItem[] = [
  {
    name: 'Mystique Black',
    size: 'King Size',
    price: '$48',
    imageSrc: '/assets/home/packs/atelier-black.png',
    badge: 'Special',
    badgeTone: 'gold',
    actionLabel: 'Buy',
    compact: true,
    faded: true,
  },
  {
    name: 'Forest Green',
    size: 'King Size',
    price: '$48',
    imageSrc: '/assets/products/catalog-for/classic-green.webp',
    badge: 'Classic',
    badgeTone: 'dark',
    actionLabel: 'Buy',
  },
  {
    name: 'Deep Red',
    size: 'Compact',
    price: '$52',
    imageSrc: '/assets/products/catalog-for/premium-red.webp',
    badge: 'Classic',
    badgeTone: 'dark',
    actionLabel: 'Buy',
  },
  {
    name: 'Mystique Black',
    size: 'King Size',
    price: '$48',
    imageSrc: '/assets/home/packs/atelier-black.png',
    badge: 'Classic',
    badgeTone: 'dark',
    actionLabel: 'Buy',
  },
  {
    name: 'Deep Red',
    size: 'Compact',
    price: '$52',
    imageSrc: '/assets/products/catalog-for/premium-red.webp',
    badge: 'Premium',
    badgeTone: 'charcoal',
    actionLabel: 'Buy',
    compact: true,
    faded: true,
  },
];

export const UPCOMING_PRODUCTS: HomeProductItem[] = [
  {
    name: 'Forest Green',
    size: 'King Size',
    price: '$48',
    imageSrc: '/assets/products/catalog-for/classic-green.webp',
    badge: 'Special',
    badgeTone: 'gold',
    actionLabel: 'Order',
  },
  {
    name: 'Deep Red',
    size: 'Compact',
    price: '$52',
    imageSrc: '/assets/products/catalog-for/premium-red.webp',
    badge: 'Classic',
    badgeTone: 'dark',
    actionLabel: 'Order',
  },
  {
    name: 'Mystique Black',
    size: 'King Size',
    price: '$48',
    imageSrc: '/assets/home/packs/atelier-black.png',
    badge: 'Atelier',
    badgeTone: 'wine',
    actionLabel: 'Order',
  },
  {
    name: 'Forest Green',
    size: 'King Size',
    price: '$48',
    imageSrc: '/assets/products/catalog-for/classic-green.webp',
    badge: 'Premium',
    badgeTone: 'charcoal',
    actionLabel: 'Order',
  },
  {
    name: 'Deep Red',
    size: 'Compact',
    price: '$52',
    imageSrc: '/assets/products/catalog-for/premium-red.webp',
    badge: 'Classic',
    badgeTone: 'dark',
    actionLabel: 'Order',
  },
  {
    name: 'Mystique Black',
    size: 'King Size',
    price: '$48',
    imageSrc: '/assets/home/packs/atelier-black.png',
    badge: 'Atelier',
    badgeTone: 'wine',
    actionLabel: 'Order',
  },
];

export const CULTURE_PRODUCTS: HomeProductItem[] = [
  {
    name: 'Forest Green',
    size: 'King Size',
    price: '',
    imageSrc: '/assets/products/catalog-for/classic-green.webp',
    badge: 'Special',
    badgeTone: 'gold',
    actionLabel: 'Early Access',
  },
  {
    name: 'Deep Red',
    size: 'King Size',
    price: '',
    imageSrc: '/assets/products/catalog-for/premium-red.webp',
    badge: 'Classic',
    badgeTone: 'dark',
    actionLabel: 'Explore',
  },
  {
    name: 'Mystique Black',
    size: 'King Size',
    price: '',
    imageSrc: '/assets/home/packs/atelier-black.png',
    badge: 'Atelier',
    badgeTone: 'wine',
    actionLabel: 'Explore',
  },
];

export const UPCOMING_LINES: HomeSimpleCardItem[] = [
  { title: 'Notebooks', imageSrc: '/assets/home/products/notebook.webp' },
  { title: 'Knifes', imageSrc: '/assets/home/products/knife.webp' },
  { title: 'Phones', imageSrc: '/assets/home/products/phone.webp' },
  { title: 'Wallets', imageSrc: '/assets/home/products/wallet.webp' },
  { title: 'Documents', imageSrc: '/assets/home/products/keys.webp' },
  { title: 'Keys', imageSrc: '/assets/home/products/documents.webp' },
];

export const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms and conditions', href: '/terms' },
  { label: 'Delivery Terms', href: '/delivery-terms' },
  { label: 'Refund Policy', href: '/refund-policy' },
] as const;

export const FOOTER_SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', iconSrc: '/assets/home/icons/instagram.svg' },
  { label: 'TikTok', href: 'https://tiktok.com', iconSrc: '/assets/home/icons/tiktok.svg' },
  { label: 'YouTube', href: 'https://youtube.com', iconSrc: '/assets/home/icons/youtube.svg' },
] as const;

export const NEETRINO_PARTNER_HREF = 'https://neetrino.com/' as const;
export const GAZZAR_STUDIO_HREF = 'https://gazzarstudio.com/studio' as const;
