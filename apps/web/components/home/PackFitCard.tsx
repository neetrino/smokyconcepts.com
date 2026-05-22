import Image from 'next/image';

import { HOME_ASSET_PATHS, PACK_FIT_ITEMS } from './homePage.data';

export function PackFitCard({
  title,
  subtitle,
  heightClassName,
  widthClassName,
  useCompactImage,
}: (typeof PACK_FIT_ITEMS)[number]) {
  return (
    <div className="flex shrink-0 snap-center scale-[0.88] flex-col items-center gap-2 sm:scale-100 sm:gap-3">
      <div className={`relative flex items-end justify-center ${heightClassName} ${widthClassName}`}>
        {useCompactImage ? (
          <>
            <Image
              src={HOME_ASSET_PATHS.compactPack}
              alt={title}
              fill
              className="object-contain"
              sizes="144px"
            />
            <img
              src={HOME_ASSET_PATHS.packMark}
              alt=""
              className="absolute left-1/2 top-[62%] h-8 w-7 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className={`relative overflow-hidden rounded-b-[0.25rem] rounded-t-[0.25rem] bg-[#731818] ${heightClassName} ${widthClassName}`}>
            <div className="h-[28%] rounded-t-[0.25rem] border-b-2 border-white/80 bg-[#731818]" />
            <img
              src={HOME_ASSET_PATHS.packMark}
              alt=""
              className="absolute left-1/2 top-[58%] h-8 w-7 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      <div className="flex min-h-[2.75rem] flex-col justify-end text-center">
        <h3 className="text-xs font-black leading-none text-[#414141]">{title}</h3>
        {subtitle ? <p className="mt-1 text-[0.5rem] font-semibold text-black">{subtitle}</p> : null}
      </div>
    </div>
  );
}
