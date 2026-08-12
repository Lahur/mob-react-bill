import { configureStore } from '@reduxjs/toolkit';

import accountsStatementReducer from '@/features/accounts-statements/accounts-statement-slice';
import dashboardReducer from '@/features/dashboard/dashboard-slice';
import posTransactionReducer from '@/features/pos-transactions/pos-transaction-slice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    posTransaction: posTransactionReducer,
    accountsStatement: accountsStatementReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
