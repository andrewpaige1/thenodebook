import { FlashcardResponse } from '../types';

export async function uploadFlashcardFile(file: File, token: string): Promise<{ cards: FlashcardResponse[] } | null> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_AI_API_URL}/api/flashcards/upload`, {
      method: 'POST',
      headers: {
      "Authorization": `Bearer ${token}`,
    },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload file');
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    return null;
  }
}
