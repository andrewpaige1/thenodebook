"use client";

import { Flashcard } from '@/types'; // Assuming Flashcard type is in types

interface FlashcardListProps {
  cards: Flashcard[];
  expandedId: number | null;
  onToggleCard: (id: number) => void;
}

export default function FlashcardList({ cards, expandedId, onToggleCard }: FlashcardListProps) {
  if (cards.length === 0) {
    return (
      <div className="mt-8 text-center py-10">
        <p className="text-gray-500">No cards to display in the list.</p>
      </div>
    );
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        All Flashcards in This View
      </h2>
      
      {/* Large screens: Horizontal layout */}
      <div className="hidden lg:grid grid-cols-1 gap-4">
        {cards.map((card) => (
          <div key={card.ID} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="grid grid-cols-3 gap-4 items-start">
              <div className="min-w-0"><h3 className="font-semibold text-gray-900">Term</h3><p className="mt-1 text-gray-700">{card.Term}</p></div>
              <div className="min-w-0"><h3 className="font-semibold text-gray-900">Definition</h3><p className="mt-1 text-gray-700">{card.Solution}</p></div>
              <div className="min-w-0"><h3 className="font-semibold text-gray-900">Concept</h3><p className="mt-1 text-gray-700">{card.Concept || '-'}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Small/Medium screens: Expandable cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.ID} onClick={() => onToggleCard(card.ID)} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200">
            <div className="p-4">
              <div className="font-semibold text-lg text-gray-900 mb-2">{card.Term}</div>
              {expandedId === card.ID && (
                <div className="mt-4 space-y-3 border-t border-gray-200 pt-3">
                  <div><h3 className="text-sm font-semibold text-gray-900">Definition</h3><p className="mt-1 text-gray-700">{card.Solution}</p></div>
                  {card.Concept && (<div><h3 className="text-sm font-semibold text-gray-900">Concept</h3><p className="mt-1 text-gray-700">{card.Concept}</p></div>)}
                </div>
              )}
              <div className="mt-2 text-sm text-gray-500">{expandedId === card.ID ? 'Click to collapse' : 'Click to expand'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}