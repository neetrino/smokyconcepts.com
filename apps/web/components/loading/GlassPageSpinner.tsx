import {
  GLASS_PAGE_SPINNER_INSET_CLASS,
  GLASS_PAGE_SPINNER_LOGO_CLASS,
  GLASS_PAGE_SPINNER_LOGO_SRC,
  GLASS_PAGE_SPINNER_SIZE_CLASS,
} from './glass-page-spinner.constants';

/** Circular loader with frosted-glass center disc, brand mark, and gold progress ring. */
export function GlassPageSpinner() {
  return (
    <div className={`relative shrink-0 ${GLASS_PAGE_SPINNER_SIZE_CLASS}`} aria-hidden>
      <div className="absolute inset-0 rounded-full border-2 border-[#dcc090]/22" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#c9a96e] border-r-[#dcc090]/55" />
      <div
        className={`absolute ${GLASS_PAGE_SPINNER_INSET_CLASS} flex items-center justify-center rounded-full border border-white/55 bg-white/25 shadow-[0_8px_32px_rgba(18,42,38,0.1),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-2xl backdrop-saturate-150`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- R2-backed static brand mark */}
        <img
          src={GLASS_PAGE_SPINNER_LOGO_SRC}
          alt=""
          className={GLASS_PAGE_SPINNER_LOGO_CLASS}
        />
      </div>
    </div>
  );
}
