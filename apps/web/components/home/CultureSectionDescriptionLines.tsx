/** One block per `\n` in locale so culture copy does not reflow from flex shrink. */
const STACK_CLASS_NAME =
  'mx-auto flex w-full max-w-[min(100%,400px)] flex-col gap-0 font-montserrat text-[15px] font-medium leading-[22px] text-[#414141] sm:max-w-[38rem] sm:text-base sm:font-semibold sm:leading-[1.42]';

const LINE_CLASS_NAME = 'block w-full min-w-0';

function parseLines(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function CultureSectionDescriptionLines({ body }: { body: string }) {
  const lines = parseLines(body);
  return (
    <div className={STACK_CLASS_NAME}>
      {lines.map((line, index) => (
        <span key={`culture-desc-${index}`} className={LINE_CLASS_NAME}>
          {line}
        </span>
      ))}
    </div>
  );
}
