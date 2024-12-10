"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Book, 
  RefreshCcw, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Target 
} from "lucide-react";

interface Flashcard {
  ID: number;
  Term: string;
  Solution: string;
  Concept: string;
}

interface FlashcardSetDetailProps {
  set: {
    ID: number;
    Title: string;
    IsPublic: boolean;
    Flashcards: Flashcard[];
  };
}

const FlashcardSetDetail: React.FC<FlashcardSetDetailProps> = ({ set }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardView, setCardView] = useState<'term' | 'solution' | 'concept'>('term');
  const [isRevealed, setIsRevealed] = useState(false);

  const currentCard = set.Flashcards[currentCardIndex];

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => 
      prev < set.Flashcards.length - 1 ? prev + 1 : 0
    );
    resetCardView();
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => 
      prev > 0 ? prev - 1 : set.Flashcards.length - 1
    );
    resetCardView();
  };

  const resetCardView = () => {
    setCardView('term');
    setIsRevealed(false);
  };

  const renderCardContent = () => {
    switch (cardView) {
      case 'term':
        return currentCard.Term;
      case 'solution':
        return currentCard.Solution;
      case 'concept':
        return currentCard.Concept;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Subnav */}
      <div className="flex justify-center mb-6 space-x-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Book className="h-4 w-4" /> Flashcards
        </Button>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
        >
          <Layers className="h-4 w-4" /> MindMap
        </Button>
      </div>

      {/* Flashcard View */}
      <Card 
        className={`
          relative overflow-hidden 
          transition-all duration-500 
          transform 
          ${isRevealed ? 'scale-105' : 'scale-100'}
          hover:shadow-xl
        `}
      >
        <CardHeader className="bg-gray-50 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Card {currentCardIndex + 1} of {set.Flashcards.length}
            </span>
            {set.IsPublic && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Public Set
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetCardView}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent 
          className={`
            p-6 min-h-[300px] flex flex-col justify-center items-center 
            text-center text-2xl font-semibold transition-colors duration-300
            ${cardView === 'term' ? 'bg-blue-50 text-blue-800' : 
              cardView === 'solution' ? 'bg-green-50 text-green-800' : 
              'bg-purple-50 text-purple-800'}
          `}
          onClick={() => {
            if (!isRevealed) {
              setIsRevealed(true);
              setCardView('solution');
            }
          }}
        >
          {renderCardContent()}
        </CardContent>

        {/* Navigation Controls */}
        <div className="absolute inset-0 pointer-events-none">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-auto"
            onClick={handlePrevCard}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-auto"
            onClick={handleNextCard}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Card Type Selector */}
        <div className="flex justify-center space-x-2 p-2 bg-gray-100">
          {['term', 'solution', 'concept'].map((type) => (
            <Button
              key={type}
              variant={cardView === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCardView(type as 'term' | 'solution' | 'concept');
                setIsRevealed(true);
              }}
              className="capitalize"
            >
              {type}
              {type === 'term' && <Target className="ml-2 h-4 w-4" />}
              {type === 'solution' && <Book className="ml-2 h-4 w-4" />}
              {type === 'concept' && <Layers className="ml-2 h-4 w-4" />}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FlashcardSetDetail;