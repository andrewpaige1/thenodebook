
import * as blocksService from '../services/blocksService';
import { BlocksScore } from '../types';

export interface BlockScorePayload {
  CorrectAttempts: number;
  TotalAttempts: number;
  Time: number;
}

export class BlocksRepository {
  async getLeaderboard(setID: string, token: string): Promise<BlocksScore | null> {
    return await blocksService.getBlocksLeaderboard(setID, token);
  }

  async createScore(setID: string, data: BlockScorePayload, token: string): Promise<BlocksScore | null> {
    return await blocksService.createBlockScore(setID, data, token);
  }
}
