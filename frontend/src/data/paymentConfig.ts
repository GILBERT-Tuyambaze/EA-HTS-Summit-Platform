export type ParticipantType = 'Local' | 'International';

export type PaymentDetailField = {
  key: string;
  label: string;
  value: string;
};

export type PaymentConfigEntry = {
  label: string;
  currency: string;
  instructionTitle: string;
  details: PaymentDetailField[];
};

export const paymentConfig: Record<ParticipantType, PaymentConfigEntry> = {
  Local: {
    label: 'Local (Rwanda — RWF)',
    currency: 'RWF',
    instructionTitle: 'Mobile Money Payment Information',
    details: [
      { key: 'mtn', label: 'MTN MoMo number', value: '+250 788 123 456' },
      { key: 'airtel', label: 'Airtel Money number', value: '+250 730 123 456' },
      { key: 'reference', label: 'Payment reference instructions', value: 'Use your full name and registration email as the reference in the wallet transaction message.' },
    ],
  },
  International: {
    label: 'International (USD)',
    currency: 'USD',
    instructionTitle: 'Bank Transfer Information',
    details: [
      { key: 'bankName', label: 'Bank Name', value: 'Bank of Kigali' },
      { key: 'accountName', label: 'Account Name', value: 'IEEE East Africa Humanitarian Technology Summit 2027' },
      { key: 'accountNumber', label: 'Account Number', value: '1002 345 678 901' },
      { key: 'swift', label: 'SWIFT/BIC Code', value: 'BKIGRWKX' },
    ],
  },
};

export const participantOptions = [
  { value: 'Local', label: 'Local (Rwanda — RWF)' },
  { value: 'International', label: 'International (USD)' },
] as const;
