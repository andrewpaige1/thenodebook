"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, XCircle, Lock } from 'lucide-react';
import { useUser } from "@auth0/nextjs-auth0/client";
import Menu from "@/components/Menu";
import SecondaryNav from "@/components/FlashcardNav";

interface Flashcard {
  ID: number;
  Term: string;
  Solution: string;
  Concept: string;
}

interface FlashcardSet {
  ID: number;
  Title: string;
  Flashcards: Flashcard[];
  IsPublic: boolean;
  UserID: number;
}

interface FlashcardExplorerProps {
  params: Promise<{ user: string, setName: string }>;
}

const MonochromeFlashcard = ({ params }: FlashcardExplorerProps) => {
  const { user, isLoading: isUserLoading } = useUser();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [visibleSections, setVisibleSections] = useState<string[]>(['term']);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ user: string, setName: string } | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(resolved => {
      setResolvedParams(resolved);
    });
  }, [params]);

  useEffect(() => {
    async function fetchSet() {
      if (resolvedParams) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/app/users/${resolvedParams.user}/sets/${decodeURIComponent(resolvedParams.setName)}`,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );

          if (!response.ok) {
            if (response.status === 403) {
              setError('private');
            } else {
              setError('general');
            }
            throw new Error('Failed to fetch flashcard set');
          }

          const data = await response.json();
          
          // Check if the set is private and if the current user is authorized
          if (!data.IsPublic && (!user || user.nickname !== resolvedParams.user)) {
            setError('private');
            setIsLoading(false);
            return;
          }

          setFlashcardSet(data);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching flashcard set:', error);
          setIsLoading(false);
        }
      }
    }

    if (resolvedParams) {
      fetchSet();
    }
  }, [resolvedParams, user]);

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 animate-pulse" />
          <p className="mt-4 text-xl text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // Private Set Error State
  if (error === 'private' && resolvedParams?.user !== user?.nickname) {
    return (
      <div>
        <Menu />
        {resolvedParams && <SecondaryNav user={resolvedParams.user} setName={resolvedParams.setName} />}
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <Lock className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Private Flashcard Set</h2>
            <p className="text-gray-600 mb-4">
              This flashcard set is private and can only be accessed by its creator.
            </p>
            {!user && (
              <p className="text-sm text-gray-500">
                If this is your set, please log in to view it.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // General Error State
  if (error === 'general' || (!flashcardSet && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="mx-auto h-16 w-16 text-gray-500 mb-4" />
          <p className="text-gray-800 text-2xl font-semibold">Could not load flashcard set</p>
        </div>
      </div>
    );
  }

  if (flashcardSet) {
  const currentCard = flashcardSet.Flashcards[currentCardIndex];

  const toggleSection = (section: string) => {
    if (section === 'term') return;
    setVisibleSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleCard = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const navigateCard = (direction: 'next' | 'prev') => {
    const totalCards = flashcardSet.Flashcards.length;
    setCurrentCardIndex(prev => 
      direction === 'next' 
        ? (prev + 1) % totalCards 
        : (prev - 1 + totalCards) % totalCards
    );
    setVisibleSections(['term']);
  };

  return (
    <div>
      <Menu />
      {resolvedParams && <SecondaryNav user={resolvedParams.user} setName={resolvedParams.setName} />}
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{flashcardSet.Title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Card {currentCardIndex + 1} of {flashcardSet.Flashcards.length}
          </p>
        </div>

        {/* Current Card */}
        <div className="space-y-6">
          {/* Term Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">Term</h2>
              <div className="mt-2 text-gray-700">
                {currentCard.Term}
              </div>
            </div>
          </div>

          {/* Solution Section */}
          <div 
            onClick={() => toggleSection('solution')}
            className="cursor-pointer bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">Definition</h2>
              <div className={`mt-2 text-gray-700 ${visibleSections.includes('solution') ? '' : 'blur-sm select-none'}`}>
                {currentCard.Solution}
              </div>
            </div>
          </div>

          {/* Concept Section */}
          <div 
            onClick={() => toggleSection('concept')}
            className="cursor-pointer bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">Concept</h2>
              <div className={`mt-2 text-gray-700 ${visibleSections.includes('concept') ? '' : 'blur-sm select-none'}`}>
                {currentCard.Concept || 'No concept provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 border-t border-gray-200 pt-4 mb-8">
          <button
            onClick={() => navigateCard('prev')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Click definition or concept to reveal
          </div>

          <button
            onClick={() => navigateCard('next')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Full Flashcard List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            All Flashcards in {flashcardSet.Title}
          </h2>
          
          {/* Large screens: Horizontal layout */}
          <div className="hidden lg:grid grid-cols-1 gap-4">
            {flashcardSet.Flashcards.map((card) => (
              <div
                key={card.ID}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">Term</h3>
                    <p className="mt-1 text-gray-700">{card.Term}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">Definition</h3>
                    <p className="mt-1 text-gray-700">{card.Solution}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">Concept</h3>
                    <p className="mt-1 text-gray-700">{card.Concept || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Small/Medium screens: Expandable cards */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {flashcardSet.Flashcards.map((card) => (
              <div
                key={card.ID}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200"
                onClick={() => toggleCard(card.ID)}
              >
                <div className="p-4">
                  <div className="font-semibold text-lg text-gray-900 mb-2">
                    {card.Term}
                  </div>
                  
                  {expandedId === card.ID && (
                    <div className="mt-4 space-y-3 border-t border-gray-200 pt-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Definition</h3>
                        <p className="mt-1 text-gray-700">{card.Solution}</p>
                      </div>
                      {card.Concept && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Concept</h3>
                          <p className="mt-1 text-gray-700">{card.Concept}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-500">
                    {expandedId === card.ID ? 'Click to collapse' : 'Click to expand'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
 }
};

export default MonochromeFlashcard;