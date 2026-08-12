export interface AccountsStatementResponse {
  id: string;
  date: string;
  amount: number;
  description: string;
  hasBill: boolean;
  cashWithdrawalBalanceIds: string[];
}
