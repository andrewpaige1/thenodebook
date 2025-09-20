export interface BlocksScore {
  ID: number;
  FlashcardSetID: number;
  UserID: number;
  Score?: number;
  TimeSeconds?: number;
  CreatedAt?: string;
  // Extended fields for leaderboard rendering
  User?: {
    ID: number;
    Nickname: string;
    Auth0ID: string;
  };
  FlashcardSet?: {
    ID: number;
    Title: string;
    PublicID: string;
  };
  CorrectAttempts?: number;
  TotalAttempts?: number;
  PlayedAt?: string;
}
export interface Flashcard {
  ID: number;
  Term: string;
  Solution: string;
  Concept: string;
  PublicID?: string;
  SetID?: number;
}

export interface FlashcardResponse {
  id?: number;
  term: string;
  solution: string;
  concept: string;
}

export interface FlashcardSet {
  ID: number;
  Title: string;
  IsPublic: boolean;
  UserID: number;
  PublicID: string;
  Flashcards: Flashcard[];
  LastStudied?: string | null;
  CreatedAt?: string;
  IsOwner?: boolean;
}

export interface MindMap {
  ID: number;
  PublicID: string;
  Title: string;
  SetID: string;
  UserID: number;
  IsPublic: boolean;
  Connections: MindMapConnection[];
  NodeLayouts: MindMapNodeLayout[];
}

export interface MindMapConnection {
  ID: number;
  MindMapID: number;
  SourceID: number;
  TargetID: number;
  Source?: Flashcard;
  Target?: Flashcard;
}

export interface MindMapNodeLayout {
  ID: number;
  MindMapID: number;
  FlashcardID: number;
  x: number;
  y: number;
}
