import { FlashcardSet } from "@/types";
import { FlashcardRepository } from "@/repositories/flashcardRepository";

export async function unifyFlashcardsWithSets(
  sets: FlashcardSet | FlashcardSet[],
  token: string
): Promise<FlashcardSet | FlashcardSet[]> {
  const flashcardRepo = new FlashcardRepository();
  const isArray = Array.isArray(sets);
  const setsArray = isArray ? sets : [sets];

  const setsWithFlashcards = await Promise.all(
    setsArray.map(async (set) => {
      try {
        const flashcards = await flashcardRepo.getAll(set.PublicID, token);
        return { ...set, Flashcards: flashcards };
      } catch (error) {
       // console.error(error);
        return { ...set, Flashcards: [] };
      }
    })
  );

  return isArray ? setsWithFlashcards : setsWithFlashcards[0];
}