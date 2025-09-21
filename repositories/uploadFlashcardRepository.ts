import { uploadFlashcardFile } from '../services/uploadFlashcardService';
import { FlashcardResponse } from '../types';

export class UploadFlashcardRepository {
  async upload(file: File, token: string): Promise<{ cards: FlashcardResponse[] } | null> {
    return await uploadFlashcardFile(file, token);
  }
}
