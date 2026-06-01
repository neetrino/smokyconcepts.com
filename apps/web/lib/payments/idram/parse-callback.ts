import type { IdramCallbackParams } from './types';

function readParam(params: URLSearchParams, key: string): string {
  return params.get(key)?.trim() ?? '';
}

export function parseIdramCallbackParams(params: URLSearchParams): IdramCallbackParams {
  return {
    precheck: readParam(params, 'EDP_PRECHECK'),
    billNo: readParam(params, 'EDP_BILL_NO'),
    recAccount: readParam(params, 'EDP_REC_ACCOUNT'),
    amount: readParam(params, 'EDP_AMOUNT'),
    payerAccount: readParam(params, 'EDP_PAYER_ACCOUNT'),
    transId: readParam(params, 'EDP_TRANS_ID'),
    transDate: readParam(params, 'EDP_TRANS_DATE'),
    checksum: readParam(params, 'EDP_CHECKSUM'),
  };
}

export function isIdramPrecheckRequest(params: IdramCallbackParams): boolean {
  return params.precheck.toUpperCase() === 'YES';
}
