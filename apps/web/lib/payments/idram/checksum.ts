import { createHash } from 'node:crypto';

type IdramChecksumInput = {
  recAccount: string;
  amount: string;
  secretKey: string;
  billNo: string;
  payerAccount: string;
  transId: string;
  transDate: string;
};

export function buildIdramChecksumPayload(input: IdramChecksumInput): string {
  return [
    input.recAccount,
    input.amount,
    input.secretKey,
    input.billNo,
    input.payerAccount,
    input.transId,
    input.transDate,
  ].join(':');
}

export function computeIdramChecksum(input: IdramChecksumInput): string {
  return createHash('md5').update(buildIdramChecksumPayload(input), 'utf8').digest('hex');
}

export function isIdramChecksumValid(received: string, expected: string): boolean {
  const normalizedReceived = received.trim().toUpperCase();
  const normalizedExpected = expected.trim().toUpperCase();
  if (!normalizedReceived || !normalizedExpected) {
    return false;
  }
  return normalizedReceived === normalizedExpected;
}
