'use client';

import { ReturnExchangePolicyContent } from '../../components/ReturnExchangePolicyContent';

/**
 * Refund / return & exchange policy page
 */
export default function RefundPolicyPage() {
  return (
    <div className="policy-page">
      <div className="policy-page-inner">
        <ReturnExchangePolicyContent namespace="refund-policy" />
      </div>
    </div>
  );
}
