import { FlashcardRepository } from '../repositories/flashcardRepository';
import { Flashcard } from '../types';

describe('FlashcardRepository', () => {
  const repo = new FlashcardRepository();
  const setID = 'test-set-id';
  const token = 'test-token';

  it('should call getAll', async () => {
    // Mock service
    repo.getAll = jest.fn().mockResolvedValue([]);
    const result = await repo.getAll(setID, token);
    expect(result).toEqual([]);
  });

  it('should call getByID', async () => {
    const mockCard: Flashcard = { ID: 1, Term: 'term', Solution: 'solution', Concept: 'concept' };
    repo.getByID = jest.fn().mockResolvedValue(mockCard);
    const result = await repo.getByID(setID, 'card-id', token);
    expect(result).toEqual(mockCard);
  });

  // Add more tests for create, update, delete as needed
});
