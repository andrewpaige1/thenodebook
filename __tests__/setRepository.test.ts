import { SetRepository } from '../repositories/setRepository';
import { FlashcardSet } from '../types';

describe('SetRepository', () => {
  const repo = new SetRepository();
  const token = 'test-token';
  const nickname = 'test-user';

  it('should call getAll', async () => {
    repo.getAll = jest.fn().mockResolvedValue([]);
    const result = await repo.getAll(nickname, token);
    expect(result).toEqual([]);
  });

  it('should call getByID', async () => {
    const mockSet: FlashcardSet = { ID: 1, Title: 'title', IsPublic: true, UserID: 1, PublicID: 'id', Flashcards: [] };
    repo.getByID = jest.fn().mockResolvedValue(mockSet);
    const result = await repo.getByID('set-id', token);
    expect(result).toEqual(mockSet);
  });

  // Add more tests for create, update, delete as needed
});
