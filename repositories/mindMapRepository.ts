import { MindMap } from "@/types";
import {
  getMindMapsForSet,
  getMindMapByID,
  createMindMap,
  updateMindMap,
  deleteMindMap,
  updateMindMapLayouts,
  updateMindMapConnections
} from "@/services/mindMapService";

export class MindMapRepository {
  async getAllForSet(setID: string, token: string): Promise<MindMap[]> {
    const result = await getMindMapsForSet(setID, token);
    return result ?? [];
  }

  async getByID(setID: string, mindMapID: string, token: string): Promise<MindMap> {
    const result = await getMindMapByID(setID, mindMapID, token);
    if (!result) throw new Error('Mind map not found');
    return result;
  }

  async create(setID: string, data: Partial<MindMap>, token: string): Promise<MindMap> {
    const result = await createMindMap(setID, data, token);
    if (!result) {
      //console.error('Failed to create mind map. Server response:', result);
      // Return an empty MindMap object
      return {
        ID: 0,
        Title: '',
        PublicID: '',
        SetID: '',
        UserID: 0,
        IsPublic: false,
        Connections: [],
        NodeLayouts: [],
      };
    }
    return result;
  }

  async update(setID: string, mindMapID: string, data: Partial<MindMap>, token: string): Promise<MindMap> {
    const result = await updateMindMap(setID, mindMapID, data, token);
    if (!result) throw new Error('Failed to update mind map');
    return result;
  }

  async delete(setID: string, mindMapID: string, token: string): Promise<void> {
    await deleteMindMap(setID, mindMapID, token);
    // No need to handle null, just await completion
  }

  async updateLayouts(setID: string, mindMapID: string, layouts: any[], token: string): Promise<boolean> {
    return await updateMindMapLayouts(setID, mindMapID, layouts, token);
  }

  async updateConnections(setID: string, mindMapID: string, connections: any[], token: string): Promise<boolean> {
    return await updateMindMapConnections(setID, mindMapID, connections, token);
  }
}