// Update node layouts for a mind map
export async function updateMindMapLayouts(setID: string, mindMapID: string, layouts: any[], token: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sets/${setID}/mindmaps/${mindMapID}/layouts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(layouts),
    });
    return res.ok;
  } catch (error) {
    console.error('Error updating mind map layouts:', error);
    return false;
  }
}

// Update connections for a mind map
export async function updateMindMapConnections(setID: string, mindMapID: string, connections: any[], token: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sets/${setID}/mindmaps/${mindMapID}/connections`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(connections),
    });
    return res.ok;
  } catch (error) {
    console.error('Error updating mind map connections:', error);
    return false;
  }
}
import { MindMap } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMindMapsForSet(setID: string, token: string): Promise<MindMap[] | null> {
  try {
    const res = await fetch(`${API_URL}/api/sets/${setID}/mindmaps`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to fetch mind maps: ${res.status} ${errorText}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    //console.error(error);
    return null;
  }
}

export async function getMindMapByID(setID: string, mindMapID: string, token: string): Promise<MindMap | null> {
  try {
    const res = await fetch(`${API_URL}/api/sets/${setID}/mindmaps/${mindMapID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch mind map");
    return await res.json();
  } catch (error) {
   // console.error(error);
    return null;
  }
}

export async function createMindMap(setID: string, data: Partial<MindMap>, token: string): Promise<MindMap | null> {
  try {
    const res = await fetch(`${API_URL}/api/sets/${setID}/mindmaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create mind map");
    return await res.json();
  } catch (error) {
    //console.error(error);
    return null;
  }
}

export async function updateMindMap(setID: string, mindMapID: string, data: Partial<MindMap>, token: string): Promise<MindMap | null> {
  try {
    const res = await fetch(`${API_URL}/api/sets/${setID}/mindmaps/${mindMapID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update mind map");
    return await res.json();
  } catch (error) {
    //console.error(error);
    return null;
  }
}

export async function deleteMindMap(setID: string, mindMapID: string, token: string): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/api/sets/${setID}/mindmaps/${mindMapID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to delete mind map");
  } catch (error) {
   // console.error(error);
  }
}
