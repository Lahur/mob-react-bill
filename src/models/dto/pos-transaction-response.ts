export interface PosTransactionResponse {
  id: string;
  bankTransactionId: string;
  amount: number;
  senderIban: string;
  receiverIban: string;
  reference: string;
  additionalRemittanceInfo: string;
  transactionDate: string;
  hasBill: boolean;
}