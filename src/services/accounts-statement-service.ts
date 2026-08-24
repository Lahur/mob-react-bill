import { File } from 'expo-file-system';

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
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (file) formData.append('file', new File(file.uri), file.name);
    const response = await accountsStatementApi.post<AccountsStatementResponse>('', formData);
    return response.data;
  },

  async upload(id: string, file: UploadableFile): Promise<AccountsStatementResponse> {
    const formData = new FormData();
    formData.append('file', new File(file.uri), file.name);
    const response = await accountsStatementApi.post<AccountsStatementResponse>(`/${id}/upload`, formData);
    return response.data;
  },
};

export default AccountsStatementService;
