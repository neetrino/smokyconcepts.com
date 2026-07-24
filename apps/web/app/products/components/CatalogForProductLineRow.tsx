import Image from 'next/image';

/** Figma: Group 1321315375 — Smoky Covers product line row. */
const CATALOG_FOR_CIGARETTE_PACK_IMAGE = '/assets/home/products/compact-figma.svg';
/** Same asset + placement pattern as home “Will it fit mine?” Compact (`PackFitCard`). */
const CATALOG_FOR_CIGARETTE_MARK_IMAGE = '/assets/home/icons/pack-mark-figma.webp';
/** `money-wallet.png` is not in repo; home wallet art matches “Money” intent (Figma blur/crop still applies). */
const CATALOG_FOR_MONEY_IMAGE = '/assets/home/products/wallet.webp';
const CATALOG_FOR_PHONE_CASE_IMAGE = '/assets/products/catalog-for/phone-case.png';

const CARD_SHELL =
  'flex h-[112px] min-w-0 flex-1 basis-0 max-w-[110px] flex-col items-center overflow-hidden lg:h-[129px] lg:w-[126px] lg:max-w-none lg:flex-none lg:shrink-0';

function CatalogForCigarettePacksCard() {
  return (
    <div
      className={`${CARD_SHELL} rounded-xl border-2 border-solid border-[#dcc090] bg-white px-1 pt-2 lg:rounded-[14px] lg:border-[3px] lg:pt-[10px]`}
    >
      <div className="relative h-[64px] w-[34px] shrink-0 lg:h-[74px] lg:w-[38.542px]">
        <Image
          src={CATALOG_FOR_CIGARETTE_PACK_IMAGE}
          alt=""
          width={39}
          height={74}
          className="h-[64px] w-[34px] object-contain lg:h-[74px] lg:w-[39px]"
          unoptimized
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- match home PackFitCard overlay (plain img) */}
        <img
          src={CATALOG_FOR_CIGARETTE_MARK_IMAGE}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[62%] h-8 w-7 origin-center object-contain opacity-90 [transform:translate(-50%,-50%)_scale(0.36)] lg:[transform:translate(-50%,-50%)_scale(0.41)]"
          aria-hidden
        />
      </div>
      <p className="mt-auto mb-2 w-[76px] text-center text-[11px] font-medium leading-tight text-[#414141] lg:mb-3 lg:w-[86px] lg:text-[12px]">
        Cigarette
        <br />
        Packs
      </p>
    </div>
  );
}

function CatalogForMoneyCard() {
  return (
    <div className={`${CARD_SHELL} rounded-xl bg-white/50 px-1 pt-3 lg:rounded-[14px] lg:pt-[17px]`}>
      <div className="flex h-[53px] w-[78px] shrink-0 items-center justify-center lg:h-[61px] lg:w-[90px]">
        <div className="flex-none [transform:scaleY(-1)]">
          <div className="relative h-[53px] w-[78px] overflow-hidden blur-[2px] opacity-50 lg:h-[61px] lg:w-[90px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- Figma crop + blur match */}
            <img
              alt=""
              src={CATALOG_FOR_MONEY_IMAGE}
              className="pointer-events-none absolute left-[-38.17%] top-[-81.52%] h-[263.04%] w-[178.78%] max-w-none select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
      <p className="mt-auto mb-2 w-[76px] text-center text-[11px] font-medium leading-none text-[#414141] opacity-50 lg:mb-3 lg:w-[86px] lg:text-[12px]">
        Money
      </p>
    </div>
  );
}

function CatalogForPhoneCasesCard() {
  return (
    <div className={`${CARD_SHELL} rounded-xl bg-white/50 px-1 pt-2 lg:rounded-[14px] lg:pt-[10px]`}>
      <div className="relative h-[64px] w-[50px] shrink-0 overflow-hidden blur-[2px] opacity-50 lg:h-[74px] lg:w-[58px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- Figma crop + blur match */}
        <img
          alt=""
          src={CATALOG_FOR_PHONE_CASE_IMAGE}
          className="pointer-events-none absolute left-[-26.92%] top-[-10.51%] h-[119.11%] w-[151.42%] max-w-none select-none"
          draggable={false}
        />
      </div>
      <p className="mt-auto mb-2 w-[76px] text-center text-[11px] font-medium leading-none text-[#414141] opacity-50 lg:mb-3 lg:w-[86px] lg:text-[12px]">
        Phone Cases
      </p>
    </div>
  );
}

export function CatalogForProductLineRow() {
  return (
    <div
      className="flex w-full flex-nowrap items-start justify-center gap-3 sm:gap-4 lg:flex-wrap lg:justify-start lg:gap-5"
      aria-label="Product line"
    >
      <CatalogForCigarettePacksCard />
      <CatalogForMoneyCard />
      <CatalogForPhoneCasesCard />
    </div>
  );
}
