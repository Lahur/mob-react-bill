import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import DashboardService from '@/services/dashboard-service';

interface DashboardState {
  summary: {
    salesPaidTotal: number;
    salesUnpaidTotal: number;
    purchasesPaidTotal: number;
    purchasesUnpaidTotal: number;
  };
}

const initialState: DashboardState = {
  summary: {
    salesPaidTotal: 0,
    salesUnpaidTotal: 0,
    purchasesPaidTotal: 0,
    purchasesUnpaidTotal: 0,
  },
};

export const fetchDashboardSummary = createAsyncThunk('dashboard/fetchSummary', () =>
  DashboardService.getSummary(),
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDashboardSummary.fulfilled, (state, action) => {
      state.summary = action.payload;
    });
  },
});

export default dashboardSlice.reducer;
