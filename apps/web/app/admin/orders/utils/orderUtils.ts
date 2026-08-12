/**
 * Order utilities - helper functions for order status colors and formatting
 */

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getPaymentStatusColor(paymentStatus: string): string {
  switch (paymentStatus.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-slate-100 text-slate-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

type AdminOrderSelectTone = {
  summaryTone: string;
  rowSelect: string;
};

const ORDER_STATUS_SELECT_UI: Record<string, AdminOrderSelectTone> = {
  pending: {
    summaryTone: 'bg-[#fff4cc] text-[#7a5a00] ring-[#f0d98a] focus:ring-[#e1c259]',
    rowSelect:
      'border-[#e1c259]/80 bg-[#fff4cc] text-[#7a5a00] hover:border-[#e1c259] hover:bg-[#ffecb3] focus:ring-[#e1c259]',
  },
  processing: {
    summaryTone: 'bg-[#dbeafe] text-[#1e40af] ring-[#93c5fd] focus:ring-[#60a5fa]',
    rowSelect:
      'border-[#93c5fd] bg-[#dbeafe] text-[#1e40af] hover:border-[#60a5fa] hover:bg-[#bfdbfe] focus:ring-[#60a5fa]',
  },
  completed: {
    summaryTone: 'bg-[#dcfce7] text-[#166534] ring-[#9ee4b6] focus:ring-[#64cb8e]',
    rowSelect:
      'border-[#86efac] bg-[#dcfce7] text-[#166534] hover:border-[#4ade80] hover:bg-[#bbf7d0] focus:ring-[#64cb8e]',
  },
  cancelled: {
    summaryTone: 'bg-[#fee2e2] text-[#991b1b] ring-[#fca5a5] focus:ring-[#f87171]',
    rowSelect:
      'border-[#fca5a5] bg-[#fee2e2] text-[#991b1b] hover:border-[#f87171] hover:bg-[#fecaca] focus:ring-[#f87171]',
  },
};

const PAYMENT_STATUS_SELECT_UI: Record<string, AdminOrderSelectTone> = {
  pending: {
    summaryTone: 'bg-[#fff4cc] text-[#7a5a00] ring-[#f0d98a] focus:ring-[#e1c259]',
    rowSelect:
      'border-[#e1c259]/80 bg-[#fff4cc] text-[#7a5a00] hover:border-[#e1c259] hover:bg-[#ffecb3] focus:ring-[#e1c259]',
  },
  paid: {
    summaryTone: 'bg-[#dcfce7] text-[#166534] ring-[#9ee4b6] focus:ring-[#64cb8e]',
    rowSelect:
      'border-[#86efac] bg-[#dcfce7] text-[#166534] hover:border-[#4ade80] hover:bg-[#bbf7d0] focus:ring-[#64cb8e]',
  },
  failed: {
    summaryTone: 'bg-[#fee2e2] text-[#991b1b] ring-[#fca5a5] focus:ring-[#f87171]',
    rowSelect:
      'border-[#fca5a5] bg-[#fee2e2] text-[#991b1b] hover:border-[#f87171] hover:bg-[#fecaca] focus:ring-[#f87171]',
  },
  refunded: {
    summaryTone: 'bg-[#e2e8f0] text-[#334155] ring-[#cbd5e1] focus:ring-[#94a3b8]',
    rowSelect:
      'border-[#cbd5e1] bg-[#e2e8f0] text-[#334155] hover:border-[#94a3b8] hover:bg-[#cbd5e1] focus:ring-[#94a3b8]',
  },
};

function resolveOrderStatusSelectUi(status: string): AdminOrderSelectTone {
  const key = status.toLowerCase();
  return ORDER_STATUS_SELECT_UI[key] ?? ORDER_STATUS_SELECT_UI.pending;
}

function resolvePaymentStatusSelectUi(paymentStatus: string): AdminOrderSelectTone {
  const key = paymentStatus.toLowerCase();
  return PAYMENT_STATUS_SELECT_UI[key] ?? PAYMENT_STATUS_SELECT_UI.pending;
}

const ADMIN_ORDER_ROW_SELECT_BASE =
  'w-full cursor-pointer rounded-lg border px-2 py-1.5 text-xs font-bold shadow-sm outline-none transition-colors duration-200 focus:ring-2 focus:outline-none';

const ADMIN_ORDER_SUMMARY_SELECT_BASE =
  'mt-1 w-full rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset focus:outline-none focus:ring-2';

/** Admin orders table: full class names for the order status select. */
export function getAdminOrderStatusRowSelectClassNames(status: string): string {
  return `${ADMIN_ORDER_ROW_SELECT_BASE} ${resolveOrderStatusSelectUi(status).rowSelect}`;
}

/** Admin orders table: full class names for the payment status select. */
export function getAdminOrderPaymentRowSelectClassNames(paymentStatus: string): string {
  return `${ADMIN_ORDER_ROW_SELECT_BASE} ${resolvePaymentStatusSelectUi(paymentStatus).rowSelect}`;
}

/** Order details summary card: full class names for the order status select. */
export function getAdminOrderStatusSummarySelectClassNames(status: string): string {
  return `${ADMIN_ORDER_SUMMARY_SELECT_BASE} ${resolveOrderStatusSelectUi(status).summaryTone}`;
}

/** Order details summary card: full class names for the payment status select. */
export function getAdminOrderPaymentSummarySelectClassNames(paymentStatus: string): string {
  return `${ADMIN_ORDER_SUMMARY_SELECT_BASE} ${resolvePaymentStatusSelectUi(paymentStatus).summaryTone}`;
}

/**
 * Helper function to get color hex/rgb from color name
 */
export function getColorValue(colorName: string): string {
  const colorMap: Record<string, string> = {
    'beige': '#F5F5DC', 'black': '#000000', 'blue': '#0000FF', 'brown': '#A52A2A',
    'gray': '#808080', 'grey': '#808080', 'green': '#008000', 'red': '#FF0000',
    'white': '#FFFFFF', 'yellow': '#FFFF00', 'orange': '#FFA500', 'pink': '#FFC0CB',
    'purple': '#800080', 'navy': '#000080', 'maroon': '#800000', 'olive': '#808000',
    'teal': '#008080', 'cyan': '#00FFFF', 'magenta': '#FF00FF', 'lime': '#00FF00',
    'silver': '#C0C0C0', 'gold': '#FFD700',
  };
  const normalizedName = colorName.toLowerCase().trim();
  return colorMap[normalizedName] || '#CCCCCC';
}

