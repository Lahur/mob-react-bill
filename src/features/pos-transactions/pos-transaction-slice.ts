import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { PosTransactionResponse } from '@/models/dto/pos-transaction-response';
import PosTransactionService, { type UploadableFile } from '@/services/pos-transaction-service';

interface PosTransactionState {
  transactions: PosTransactionResponse[];
}

const initialState: PosTransactionState = {
  transactions: [],
};

export const fetchPosTransactions = createAsyncThunk('posTransaction/fetchAll', () => PosTransactionService.findAll());

export const uploadPosTransactionBill = createAsyncThunk(
  'posTransaction/upload',
  ({ id, file }: { id: string; file: UploadableFile }) => PosTransactionService.upload(id, file),
);

const posTransactionSlice = createSlice({
  name: 'posTransaction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(uploadPosTransactionBill.fulfilled, (state, action) => {
        const transaction = state.transactions.find((t) => t.id === action.payload.id);
        if (transaction) transaction.hasBill = true;
      });
  },
});

export default posTransactionSlice.reducer;