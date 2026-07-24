import { CheckoutPlacingOrderGlassSpinner } from '../components/CheckoutPlacingOrderOverlay';

export default function ThankYouLoading() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 py-16">
      <CheckoutPlacingOrderGlassSpinner />
    </div>
  );
}
