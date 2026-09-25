import { orderItemHasSavedCustomize } from '@/lib/orders/order-item-has-saved-customize';
import type { CartItem } from '@/app/cart/types';

/** Figma cart line 1:2540 — Montserrat Medium, 12px, black. */
const CUSTOMIZED_LABEL_CLASS =
  'font-montserrat text-xs font-medium leading-normal text-black whitespace-nowrap';

const SIZE_LABEL_CLASS = 'text-[0.625rem] font-medium leading-none text-[#9d9d9d]';

const CATEGORY_BADGE_CLASS =
  'rounded-[0.375rem] bg-[#122a26] px-[0.375rem] py-[0.125rem] text-[0.625rem] font-medium leading-none text-white';

const FALLBACK_CATEGORY_LABEL = 'Classic';

type CartDrawerLineMetaProps = {
  item: CartItem;
  customizedLabel: string;
};

/**
 * Size, collection badge, and the customized label under a cart drawer line.
 * Customized lines show the Figma label instead of the collection badge.
 */
export function CartDrawerLineMeta({ item, customizedLabel }: CartDrawerLineMetaProps) {
  const sizeLabel = item.variant.sizeLabel?.trim() ?? '';
  const isCustomized = orderItemHasSavedCustomize(item.variant);
  const categoryLabel = item.variant.product.categoryLabel?.trim() || FALLBACK_CATEGORY_LABEL;
  const customizedClassName = sizeLabel ? `mt-6 ${CUSTOMIZED_LABEL_CLASS}` : CUSTOMIZED_LABEL_CLASS;

  return (
    <div className="mt-3 flex flex-col items-start">
      {sizeLabel || !isCustomized ? (
        <div className="flex flex-wrap items-center gap-2">
          {sizeLabel ? <span className={SIZE_LABEL_CLASS}>{sizeLabel}</span> : null}
          {isCustomized ? null : <span className={CATEGORY_BADGE_CLASS}>{categoryLabel}</span>}
        </div>
      ) : null}
      {isCustomized ? <p className={customizedClassName}>{customizedLabel}</p> : null}
    </div>
  );
}
