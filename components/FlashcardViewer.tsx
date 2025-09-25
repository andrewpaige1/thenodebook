"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FlashcardSet } from '@/types'; // Ensure your types are correctly imported
import ConceptFilter from './ConceptFilter';
import FlashcardList from './FlashcardList';

// Define the props interface for type safety
interface FlashcardViewerProps {
  flashcardSet: FlashcardSet;
}

export default function FlashcardViewer({ flashcardSet }: FlashcardViewerProps) {
  // State for the interactive card viewer
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [visibleSections, setVisibleSections] = useState<string[]>(['term']);
  
  // State for the concept filter
  const [selectedConcept, setSelectedConcept] = useState<string>('all');
  
  // State for the expandable card list at the bottom
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Memoize the calculation of unique concepts to prevent re-running on every render
  const uniqueConcepts = useMemo(() => {
    if (!flashcardSet || !flashcardSet.Flashcards) return ['all'];
    const concepts = new Set(flashcardSet.Flashcards.map(card => card.Concept).filter(Boolean as any));
    return ['all', ...Array.from(concepts)];
  }, [flashcardSet]);

  // Memoize the filtered list of cards based on the selected concept
  const displayedCards = useMemo(() => {
    if (!flashcardSet || !flashcardSet.Flashcards) return [];
    if (selectedConcept === 'all') {
      return flashcardSet.Flashcards;
    }
    return flashcardSet.Flashcards.filter(card => card.Concept === selectedConcept);
  }, [flashcardSet, selectedConcept]);

  // Handler to change the active concept filter
  const handleConceptChange = (concept: string) => {
    setSelectedConcept(concept);
    setCurrentCardIndex(0); // Reset to the first card of the new list
    setVisibleSections(['term']); // Hide sections on change
  };
  
  // Handler for the previous/next navigation buttons
  const navigateCard = (direction: 'next' | 'prev') => {
    const totalCards = displayedCards.length;
    if (totalCards === 0) return;
    
    const newIndex = direction === 'next'
      ? (currentCardIndex + 1) % totalCards
      : (currentCardIndex - 1 + totalCards) % totalCards;
      
    setCurrentCardIndex(newIndex);
    setVisibleSections(['term']); // Reset visibility when changing cards
  };

  // Handler to reveal/hide the definition or concept sections
  const toggleSection = (section: string) => {
    if (section === 'term') return; // The term is always visible
    setVisibleSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };
  
  // Handler for expanding/collapsing cards in the list view
  const toggleCard = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  // Get the current card object from the filtered list
  const currentCard = displayedCards[currentCardIndex];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{flashcardSet.Title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Viewing {displayedCards.length} of {flashcardSet.Flashcards.length} cards
        </p>
      </div>

      {/* Concept Filter Component */}
      <ConceptFilter 
        uniqueConcepts={uniqueConcepts}
        selectedConcept={selectedConcept}
        onConceptChange={handleConceptChange}
      />

      {/* Main Interactive Viewer */}
      {displayedCards.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 my-4 text-center">
            Card {currentCardIndex + 1} of {displayedCards.length}
          </p>
          <div className="space-y-6">
            {/* Term */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900">Term</h2>
              <div className="mt-2 text-gray-700">{currentCard.Term}</div>
            </div>
            {/* Definition */}
            <div onClick={() => toggleSection('solution')} className="cursor-pointer bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900">Definition</h2>
              <div className={`mt-2 text-gray-700 ${visibleSections.includes('solution') ? '' : 'blur-sm select-none'}`}>{currentCard.Solution}</div>
            </div>
            {/* Concept */}
            <div onClick={() => toggleSection('concept')} className="cursor-pointer bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900">Concept</h2>
              <div className={`mt-2 text-gray-700 ${visibleSections.includes('concept') ? '' : 'blur-sm select-none'}`}>{currentCard.Concept || 'No concept provided'}</div>
            </div>
          </div>
          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-8 border-t border-gray-200 pt-4 mb-8">
            <button onClick={() => navigateCard('prev')} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><ChevronLeft className="w-5 h-5 mr-1" />Previous</button>
            <div className="text-sm text-gray-500 hidden sm:block">Click definition or concept to reveal</div>
            <button onClick={() => navigateCard('next')} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Next<ChevronRight className="w-5 h-5 ml-1" /></button>
          </div>
        </>
      ) : (
        // Fallback UI when no cards match the filter
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-600 font-medium">No flashcards found for the selected concept.</p>
        </div>
      )}

      {/* Full Card List Component */}
      <FlashcardList 
        cards={displayedCards} 
        expandedId={expandedId}
        onToggleCard={toggleCard}
      />
    </div>
  );
}