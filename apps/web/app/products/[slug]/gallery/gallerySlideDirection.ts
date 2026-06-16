/** Resolves carousel direction when index wraps (e.g. last → first). */
export function resolveGallerySlideDirection(
  previousIndex: number,
  nextIndex: number,
  totalImages: number,
): 'next' | 'previous' {
  if (totalImages <= 1 || previousIndex === nextIndex) {
    return 'next';
  }

  const forwardSteps = (nextIndex - previousIndex + totalImages) % totalImages;
  const backwardSteps = (previousIndex - nextIndex + totalImages) % totalImages;

  return forwardSteps <= backwardSteps ? 'next' : 'previous';
}
