import Image from 'next/image';

import { HOME_ASSET_PATHS } from './homePage.data';
import type { HomeBadgeTone, HomeProductItem } from './homePage.types';

interface HomeProductCardProps {
  item: HomeProductItem;
}

const BADGE_CLASS_NAMES: Record<HomeBadgeTone, string> = {
  charcoal: 'bg-[#414141] text-white',
  dark: 'bg-[#122a26] text-white',
  gold: 'bg-[#dcc090] text-white',
  wine: 'bg-[#731818] text-white',
};

/**
 * Product card reused across trending, upcoming, and culture sections.
 */
export function HomeProductCard({ item }: HomeProductCardProps) {
  const cardClassName = item.compact
    ? 'w-[10.75rem] rounded-[1.125rem] p-3'
    : 'w-full max-w-[15rem] rounded-3xl p-4';
  const imageWrapperClassName = item.compact ? 'h-44' : 'h-56';
  const opacityClassName = item.faded ? 'opacity-50' : '';

  return (
    <article className={`rounded-3xl bg-white ${cardClassName} ${opacityClassName}`.trim()}>
      <div className="mb-4 flex gap-1">
        {Array.from({ length: 7 }).map((_, index) => (
          <span
            key={`${item.name}-${index}`}
            className={`h-1 w-6 rounded-full ${index === 0 ? 'bg-[#122a26]' : 'bg-[#d9d9d9]'}`}
          />
        ))}
      </div>
      <div className={`relative mb-4 ${imageWrapperClassName}`}>
        <Image
          src={item.imageSrc}
          alt={item.name}
          fill
          className="object-contain"
          sizes="240px"
        />
      </div>
      <h3 className="text-[1.6rem] font-extrabold leading-none text-[#414141]">{item.name}</h3>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs font-medium text-[#9d9d9d]">{item.size}</span>
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${BADGE_CLASS_NAMES[item.badgeTone]}`}>
          {item.badge}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-2xl font-extrabold leading-none text-black">{item.price || '\u00A0'}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border-2 border-[#dcc090] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10"
          >
            {item.actionLabel}
          </button>
          <img src={HOME_ASSET_PATHS.bagIcon} alt="" className="h-5 w-5 object-contain" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}
