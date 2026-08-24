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

  create(request: CreateAccountsStatementRequest, file: UploadableFile | null): Promise<AccountsStatementResponse> {
    if (file) {
      return accountsStatementApi.uploadFile<AccountsStatementResponse>('', new File(file.uri), {
        request: JSON.stringify(request),
      });
    }
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    return accountsStatementApi.post<AccountsStatementResponse>('', formData).then((response) => response.data);
  },

  upload(id: string, file: UploadableFile): Promise<AccountsStatementResponse> {
    return accountsStatementApi.uploadFile<AccountsStatementResponse>(`/${id}/upload`, new File(file.uri));
  },
};

export default AccountsStatementService;
