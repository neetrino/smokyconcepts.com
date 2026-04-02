interface HomeSectionTitleProps {
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

/**
 * Shared heading block for homepage sections.
 */
export function HomeSectionTitle({
  title,
  description,
  centered = true,
  className = '',
}: HomeSectionTitleProps) {
  const alignmentClassName = centered ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-4 ${alignmentClassName} ${className}`.trim()}>
      <h2 className="whitespace-pre-line text-[2.125rem] font-extrabold leading-[1.235] text-[#414141] sm:text-4xl sm:leading-tight">
        {title}
      </h2>
      {description ? (
        <p className="max-w-[52rem] whitespace-pre-line text-base font-medium leading-[1.375] text-[#414141] sm:leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
