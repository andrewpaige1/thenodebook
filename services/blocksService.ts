import { BlocksScore } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export async function getBlocksLeaderboard(setID: string, token: string): Promise<BlocksScore | null> {
  try {
    const res = await fetch(`${API_URL}/api/blocks/leaderboard/${setID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    return await res.json();
  } catch (error) {
    //console.error(error);
    return null;
  }
}

export async function createBlockScore(setID: string, data: { CorrectAttempts: number; TotalAttempts: number; Time: number }, token: string): Promise<BlocksScore | null> {
  try {
    const res = await fetch(`${API_URL}/api/blocks/score/${setID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    //if (!res.ok) throw new Error("Failed to create block score");
    return await res.json();
  } catch (error) {
    //console.error(error);
    return null;
  }
}
