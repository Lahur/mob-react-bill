import { File } from 'expo-file-system';

import type { PosTransactionResponse } from '@/models/dto/pos-transaction-response';

import { createApiClient } from './http-client';

const posTransactionApi = createApiClient('/pos-transaction');

export interface UploadableFile {
  uri: string;
  name: string;
}

const PosTransactionService = {
  async findAll(): Promise<PosTransactionResponse[]> {
    const response = await posTransactionApi.get<PosTransactionResponse[]>('');
    return response.data;
  },

  async upload(id: string, file: UploadableFile): Promise<PosTransactionResponse> {
    const formData = new FormData();
    formData.append('file', new File(file.uri), file.name);
    const response = await posTransactionApi.post<PosTransactionResponse>(`/${id}/upload`, formData);
    return response.data;
  },
};

export default PosTransactionService;