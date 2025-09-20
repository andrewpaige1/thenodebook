import { Flashcard } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getFlashcardsForSet(setID: string, token: string): Promise<Flashcard[] | null> {
  
  try {
  
  const res = await fetch(`${API_URL}/api/sets/${setID}/flashcards`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  //if (!res.ok) throw new Error("Failed to fetch flashcards");
  return res.json();
  } catch (error) {
    //console.error(error)
    return null
  }
}

export async function getFlashcardByID(setID: string, flashcardID: string, token: string): Promise<Flashcard | null> {
  
  try {
  const res = await fetch(`${API_URL}/api/sets/${setID}/flashcards/${flashcardID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  //if (!res.ok) throw new Error("Failed to fetch flashcard");
  return await res.json();
 } catch (error) {
    //console.error(error)
    return null
 }
}

export async function createFlashcard(setID: string, data: Omit<Flashcard, "ID">, token: string): Promise<Flashcard | null> {
  
  try {
  const res = await fetch(`${API_URL}/api/sets/${setID}/flashcards/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  //if (!res.ok) throw new Error("Failed to create flashcard");
  return await res.json();
  } catch (error) {
    return null
  }
}

export async function updateFlashcard(setID: string, flashcardID: string, data: Partial<Flashcard>, token: string): Promise<Flashcard | null> {
  
  try {
  const res = await fetch(`${API_URL}/api/sets/${setID}/flashcards/${flashcardID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
 // if (!res.ok) throw new Error("Failed to update flashcard");
  return await res.json();
  } catch (error) {
    //console.error(error)
    return null
  }
}

export async function deleteFlashcard(setID: string, flashcardID: string, token: string): Promise<void | null> {
  
  try {
  const res = await fetch(`${API_URL}/api/sets/${setID}/flashcards/${flashcardID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  //if (!res.ok) throw new Error("Failed to delete flashcard");
  } catch(error) {
   // console.error(error)
  }
}
