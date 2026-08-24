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

  upload(id: string, file: UploadableFile): Promise<PosTransactionResponse> {
    return posTransactionApi.uploadFile<PosTransactionResponse>(`/${id}/upload`, new File(file.uri));
  },
};

export default PosTransactionService;