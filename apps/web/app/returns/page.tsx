'use client';

import { ReturnExchangePolicyContent } from '../../components/ReturnExchangePolicyContent';

/**
 * Returns page — same policy as `/refund-policy`, separate route for navigation
 */
export default function ReturnsPage() {
  return (
    <div className="policy-page">
      <div className="policy-page-inner">
        <ReturnExchangePolicyContent namespace="returns" />
      </div>
    </div>
  );
}
