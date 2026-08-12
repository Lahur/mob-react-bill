import type { DashboardSummaryResponse } from '@/models/dto/dashboard-summary-response';

import { createApiClient } from './http-client';

const dashboardApi = createApiClient('/dashboard');

const DashboardService = {
  async getSummary(): Promise<DashboardSummaryResponse> {
    const response = await dashboardApi.get<DashboardSummaryResponse>('/summary');
    return response.data;
  },
};

export default DashboardService;
