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
      <h2 className="text-4xl font-extrabold leading-tight text-[#414141] sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-[52rem] text-lg font-medium leading-[1.65] text-[#414141]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
