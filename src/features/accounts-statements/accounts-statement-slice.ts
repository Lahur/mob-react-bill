import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { AccountsStatementResponse } from '@/models/dto/accounts-statement-response';
import type { CreateAccountsStatementRequest } from '@/models/dto/create-accounts-statement-request';
import AccountsStatementService from '@/services/accounts-statement-service';
import type { UploadableFile } from '@/services/pos-transaction-service';

interface AccountsStatementState {
  statements: AccountsStatementResponse[];
}

const initialState: AccountsStatementState = {
  statements: [],
};

export const fetchAccountsStatements = createAsyncThunk('accountsStatement/fetchAll', () => AccountsStatementService.findAll());

export const createAccountsStatement = createAsyncThunk(
  'accountsStatement/create',
  ({ request, file }: { request: CreateAccountsStatementRequest; file: UploadableFile | null }) =>
    AccountsStatementService.create(request, file),
);

export const uploadAccountsStatementBill = createAsyncThunk(
  'accountsStatement/upload',
  ({ id, file }: { id: string; file: UploadableFile }) => AccountsStatementService.upload(id, file),
);

const accountsStatementSlice = createSlice({
  name: 'accountsStatement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountsStatements.fulfilled, (state, action) => {
        state.statements = action.payload;
      })
      .addCase(createAccountsStatement.fulfilled, (state, action) => {
        state.statements.unshift(action.payload);
      })
      .addCase(uploadAccountsStatementBill.fulfilled, (state, action) => {
        const statement = state.statements.find((s) => s.id === action.payload.id);
        if (statement) statement.hasBill = true;
      });
  },
});

export default accountsStatementSlice.reducer;
