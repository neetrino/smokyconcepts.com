import type { ProductFormFieldId } from '../constants/productFormFieldIds.constants';

const SCROLL_FOCUS_DELAY_MS = 350;

/** Scrolls to and focuses the invalid product pricing input itself. */
export function scrollToProductFormField(fieldId: ProductFormFieldId): void {
  const scrollToField = () => {
    const input = document.querySelector<HTMLInputElement>(`input[data-product-field="${fieldId}"]`);
    if (!input) {
      return;
    }

    input.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });

    window.setTimeout(() => {
      input.focus({ preventScroll: true });
    }, SCROLL_FOCUS_DELAY_MS);
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToField);
  });
}
