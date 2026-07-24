export type IdramLanguageCode = 'EN' | 'AM' | 'RU';

export type IdramCallbackParams = {
  precheck: string;
  billNo: string;
  recAccount: string;
  amount: string;
  payerAccount: string;
  transId: string;
  transDate: string;
  checksum: string;
};

export type IdramFormFields = {
  EDP_LANGUAGE: IdramLanguageCode;
  EDP_REC_ACCOUNT: string;
  EDP_DESCRIPTION: string;
  EDP_AMOUNT: string;
  EDP_BILL_NO: string;
  EDP_EMAIL?: string;
};
