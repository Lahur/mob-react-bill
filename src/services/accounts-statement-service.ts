import type { AccountsStatementResponse } from '@/models/dto/accounts-statement-response';
import type { CreateAccountsStatementRequest } from '@/models/dto/create-accounts-statement-request';

import { createApiClient } from './http-client';
import type { UploadableFile } from './pos-transaction-service';

const accountsStatementApi = createApiClient('/accounts-statement');

const AccountsStatementService = {
  async findAll(): Promise<AccountsStatementResponse[]> {
    const response = await accountsStatementApi.get<AccountsStatementResponse[]>('');
    return response.data;
  },

  async create(request: CreateAccountsStatementRequest, file: UploadableFile | null): Promise<AccountsStatementResponse> {
    const formData = new FormData();
    // React Native's FormData can't send a real Blob part (its own-enumerable props
    // don't survive the internal spread), so pass a { string, type } part instead.
    formData.append('request', { string: JSON.stringify(request), type: 'application/json' } as unknown as Blob);
    if (file) formData.append('file', file as unknown as Blob);
    const response = await accountsStatementApi.post<AccountsStatementResponse>('', formData);
    return response.data;
  },

  async upload(id: string, file: UploadableFile): Promise<AccountsStatementResponse> {
    const formData = new FormData();
    formData.append('file', file as unknown as Blob);
    const response = await accountsStatementApi.post<AccountsStatementResponse>(`/${id}/upload`, formData);
    return response.data;
  },
};

export default AccountsStatementService;
