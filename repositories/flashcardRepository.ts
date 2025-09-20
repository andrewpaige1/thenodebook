import * as flashcardService from '../services/flashcardService';
import { Flashcard } from '../types';

export class FlashcardRepository {
  async getAll(setID: string, token: string): Promise<Flashcard[]> {
    const result = await flashcardService.getFlashcardsForSet(setID, token);
    if (!result) return [];
    return result;
  }

  async getByID(setID: string, flashcardID: string, token: string): Promise<Flashcard> {
    const result = await flashcardService.getFlashcardByID(setID, flashcardID, token);
    if (!result) throw new Error('Flashcard not found');
    return result;
  }

  async create(setID: string, data: Omit<Flashcard, 'ID'>, token: string): Promise<Flashcard> {
    const result = await flashcardService.createFlashcard(setID, data, token);
    if (!result) throw new Error('Failed to create flashcard');
    return result;
  }

  async update(setID: string, flashcardID: string, data: Partial<Flashcard>, token: string): Promise<Flashcard> {
    const result = await flashcardService.updateFlashcard(setID, flashcardID, data, token);
    if (!result) throw new Error('Failed to update flashcard');
    return result;
  }

  async delete(setID: string, flashcardID: string, token: string): Promise<void> {
    await flashcardService.deleteFlashcard(setID, flashcardID, token);
    // No need to handle null, just await completion
  }
}
