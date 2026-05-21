import { Fragment, type ReactNode } from 'react';

const STRONG_SEGMENT = /(\*\*[^*]+\*\*)/g;

export function renderPillarTitleLines(text: string): ReactNode {
  const lines = text.split('\n');

  if (lines.length === 1) {
    return text;
  }

  return lines.map((line, index) => (
    <Fragment key={`pillar-title-${index}`}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

/**
 * Renders pillar/about copy from locale strings:
 * - Blank line (`\\n\\n`) starts a new `<p>`
 * - Single `\\n` inside a block becomes `<br />`
 * - `**text**` becomes `<strong className="font-black">`
 */
export function renderAboutRichParagraphs(text: string, keyBase: string): ReactNode[] {
  return text
    .trim()
    .split(/\n\n+/)
    .filter(Boolean)
    .map((block, paragraphIndex) => {
      const lines = block.split('\n');

      return (
        <p key={`${keyBase}-p-${paragraphIndex}`}>
          {lines.map((line, lineIndex) => (
            <Fragment key={`${keyBase}-p-${paragraphIndex}-l-${lineIndex}`}>
              {lineIndex > 0 ? <br /> : null}
              {line.split(STRONG_SEGMENT).map((segment, segmentIndex) => {
                const match = /^\*\*(.+)\*\*$/.exec(segment);

                if (match) {
                  return (
                    <strong
                      key={`${keyBase}-p-${paragraphIndex}-s-${segmentIndex}`}
                      className="font-black"
                    >
                      {match[1]}
                    </strong>
                  );
                }

                return segment;
              })}
            </Fragment>
          ))}
        </p>
      );
    });
}
