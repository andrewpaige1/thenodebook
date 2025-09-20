import * as setService from '../services/setService';
import { FlashcardSet } from '../types';

export class SetRepository {
  async getAll(nickname: string, token: string): Promise<FlashcardSet[]> {
    const sets = await setService.getSetsForUser(nickname, token);
    return sets ?? [];
  }

  async getByID(setID: string, token: string): Promise<FlashcardSet> {
      const set = await setService.getSetByID(setID, token);
      if (!set) {
        throw new Error('Set not found');
      }
      return set;
  }

  async create(data: Omit<FlashcardSet, 'ID' | 'UserID' | 'PublicID' | 'Flashcards' | 'LastStudied' | 'CreatedAt' | 'IsOwner' >, token: string): Promise<FlashcardSet> {
      const created = await setService.createSet(data, token);
      if (!created) {
        throw new Error('Failed to create set');
      }
      return created;
  }

  async update(setID: string, data: Partial<FlashcardSet>, token: string): Promise<FlashcardSet> {
      console.log(setID)
    const updated = await setService.updateSet(setID, data, token);
      if (!updated) {
        throw new Error('Failed to update set');
      }
      return updated;
  }

  async delete(setID: string, token: string): Promise<void> {
    return await setService.deleteSet(setID, token);
  }
}
