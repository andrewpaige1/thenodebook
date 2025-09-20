import { FlashcardSet } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getSetsForUser(nickname: string, token: string): Promise<FlashcardSet[] | null> {
  try {
    const res = await fetch(`${API_URL}/api/users/${nickname}/sets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to fetch sets: ${res.status} ${errorText}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    //console.error(error);
    return null;
  }
}

export async function getSetByID(setID: string, token: string): Promise<FlashcardSet | null> {
  try {
  const res = await fetch(`${API_URL}/api/sets/${setID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  //if (!res.ok) throw new Error("Failed to fetch set");
  return await res.json();

} catch(error) {
    //console.error(error)
    return null
  }
}

export async function createSet(data: Omit<FlashcardSet, "ID" | 'ID' | 'UserID' | 'PublicID' | 'Flashcards' | 'LastStudied' | 'CreatedAt' | 'IsOwner'>, token: string): Promise<FlashcardSet | null> {
  
  try {
  const res = await fetch(`${API_URL}/api/sets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  //if (!res.ok) throw new Error("Failed to create set");
  return await res.json();
  } catch (error) {
    //console.error(error)
    return null
  }
}

export async function updateSet(setID: string, data: Partial<FlashcardSet>, token: string): Promise<FlashcardSet | null> {
  try {
  const res = await fetch(`${API_URL}/api/sets/${setID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update set");
  return await res.json();
  } catch (error) {
    //console.error(error)
    return null
  }
}

export async function deleteSet(setID: string, token: string): Promise<void> {
  try {
  const res = await fetch(`${API_URL}/api/sets/${setID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete set");
} catch(error) {
 // console.error(error)
}
}
