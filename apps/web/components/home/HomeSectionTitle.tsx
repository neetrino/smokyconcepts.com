interface HomeSectionTitleDescriptionTwoLine {
  line1Bold: string;
  line1Rest: string;
  line2: string;
}

/** Inline emphasis (e.g. hero tagline): two bold spans, rest regular. Takes precedence over `description` when set. */
interface HomeSectionTitleDescriptionEmphasis {
  lead: string;
  bold1: string;
  mid: string;
  bold2: string;
  tail: string;
}

interface HomeSectionTitleProps {
  title: string;
  /** When set, shown below `sm` with `whitespace-pre-line`; `title` is used from `sm` up (natural wrap). */
  titleMobile?: string;
  description?: string;
  /** When set, shown below `sm` instead of `description` (use `\n` for line breaks; `whitespace-pre-line` on the paragraph). */
  descriptionMobile?: string;
  /** Two-line description: first word bold, rest of line 1 + line 2 regular. Takes precedence over `description`. */
  descriptionTwoLine?: HomeSectionTitleDescriptionTwoLine;
  /** Extra Tailwind classes for the bold segment (`line1Bold`) only. */
  descriptionTwoLineBoldClassName?: string;
  /** Single-line (or pre-line) copy with two emphasized words — same weight as `descriptionTwoLine` bold span. */
  descriptionEmphasis?: HomeSectionTitleDescriptionEmphasis;
  centered?: boolean;
  /** Below `sm`: centered; from `sm` up: left-aligned. Ignores `centered` when true. */
  centerOnMobileOnly?: boolean;
  className?: string;
  titleClassName?: string;
}

/**
 * Shared heading block for homepage sections.
 */
export function HomeSectionTitle({
  title,
  titleMobile,
  description,
  descriptionMobile,
  descriptionTwoLine,
  descriptionTwoLineBoldClassName = '',
  descriptionEmphasis,
  centered = true,
  centerOnMobileOnly = false,
  className = '',
  titleClassName = '',
}: HomeSectionTitleProps) {
  const alignmentClassName = centerOnMobileOnly
    ? 'items-center text-center sm:items-start sm:text-left'
    : centered
      ? 'text-center items-center'
      : 'text-left items-start';
  const titleClass = `whitespace-pre-line text-[2.125rem] font-extrabold leading-[1.235] text-[#414141] sm:text-4xl sm:leading-tight ${titleClassName}`.trim();

  return (
    <div className={`flex flex-col gap-4 ${alignmentClassName} ${className}`.trim()}>
      <h2 className={titleClass} aria-label={titleMobile ? title : undefined}>
        {titleMobile ? (
          <>
            <span className="sm:hidden">{titleMobile}</span>
            <span className="hidden sm:inline">{title}</span>
          </>
        ) : (
          title
        )}
      </h2>
      {descriptionTwoLine ? (
        <p className="max-w-[52rem] text-base font-normal leading-[1.375] text-[#414141] sm:leading-relaxed">
          <span className={`font-bold ${descriptionTwoLineBoldClassName}`.trim()}>{descriptionTwoLine.line1Bold}</span>
          {descriptionTwoLine.line1Rest ? (
            <>
              {' '}
              {descriptionTwoLine.line1Rest}
            </>
          ) : null}
          <br />
          {descriptionTwoLine.line2}
        </p>
      ) : descriptionEmphasis ? (
        <p className="max-w-[52rem] whitespace-nowrap text-[15px] font-normal leading-[1.375] text-[#414141] sm:whitespace-pre-line sm:text-base sm:leading-relaxed">
          {descriptionEmphasis.lead}
          <span className="font-black">{descriptionEmphasis.bold1}</span>
          {descriptionEmphasis.mid}
          <span className="font-black">{descriptionEmphasis.bold2}</span>
          {descriptionEmphasis.tail}
        </p>
      ) : description || descriptionMobile ? (
        <p className="max-w-[52rem] whitespace-pre-line text-base font-medium leading-[1.375] text-[#414141] sm:leading-relaxed">
          {descriptionMobile ? (
            <>
              <span className="sm:hidden">{descriptionMobile}</span>
              {description ? <span className="hidden sm:inline">{description}</span> : null}
            </>
          ) : (
            description
          )}
        </p>
      ) : null}
    </div>
  );
}
