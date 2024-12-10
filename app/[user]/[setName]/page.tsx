"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  RefreshCw,
  CheckCircle2,
  XCircle 
} from "lucide-react";
import Menu from "@/components/Menu";
import SecondaryNav from "@/components/FlashcardNav";

interface Flashcard {
  ID: number;
  Term: string;
  Solution: string;
  Concept: string;
}

interface FlashcardSet {
  Title: string;
  Flashcards: Flashcard[];
}

export default function BlurtingMethodExplorer({ 
  params 
}: { 
  params: Promise<{ user: string, setName: string }> 
}) {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const blurtInputRef = useRef<HTMLInputElement>(null);

  // Enhanced State Management
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [blurtAttempt, setBlurtAttempt] = useState<string>('');
  const [showSolution, setShowSolution] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ user: string, setName: string } | null>(null);
  
  // New state for tracking learning progress
  const [learnedCards, setLearnedCards] = useState<number[]>([]);
  const [attemptFeedback, setAttemptFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [expandedId, setExpandedId] = useState(null);

  const toggleCard = (id: any) => {
    setExpandedId(expandedId === id ? null : id);
  };

  
  // Resolve params and fetch data
  useEffect(() => {
    params.then(resolved => {
      setResolvedParams(resolved);
    });
  }, [params]);

  // Authentication check
  useEffect(() => {
    if (!user && !isUserLoading) {
      router.push('/api/auth/login');
    }
  }, [user, isUserLoading, router]);

  // Data fetching
  useEffect(() => {
    async function fetchSet() {
      if (user?.nickname && resolvedParams) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/users/${user.nickname}/sets/${decodeURIComponent(resolvedParams.setName)}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch flashcard set');
          }

          const data = await response.json();
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
  }, [user?.nickname, resolvedParams]);

  // Loading state
  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <BookOpen className="mx-auto h-16 w-16 text-blue-400 animate-pulse" />
          <p className="mt-4 text-xl text-gray-700">Preparing your learning journey...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!flashcardSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <p className="text-red-600 text-2xl font-semibold">Couldn't load your flashcard set</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Enhanced navigation and reset handlers
  const navigateCard = (direction: 'next' | 'prev') => {
    const totalCards = flashcardSet.Flashcards.length;
    setCurrentCardIndex(prev => 
      direction === 'next' 
        ? (prev + 1) % totalCards 
        : (prev - 1 + totalCards) % totalCards
    );
    resetCard();
  };

  const resetCard = () => {
    setBlurtAttempt('');
    setShowSolution(false);
    setAttemptFeedback(null);
    if (blurtInputRef.current) {
      blurtInputRef.current.value = '';
    }
  };

  const handleBlurtSubmit = () => {
    if (!showSolution) {
      setShowSolution(true);
      
      // Simple fuzzy matching for correctness
      const normalizeString = (str: string) => 
        str.toLowerCase().replace(/[^\w\s]/g, '').trim();
      
      const isCorrect = normalizeString(blurtAttempt).includes(
        normalizeString(currentCard.Solution)
      );

      setAttemptFeedback(isCorrect ? 'correct' : 'incorrect');

      // Track learned cards
      if (isCorrect && !learnedCards.includes(currentCard.ID)) {
        setLearnedCards(prev => [...prev, currentCard.ID]);
      }
    }
  };

  const currentCard = flashcardSet.Flashcards[currentCardIndex];
  const learningProgress = Math.round((learnedCards.length / flashcardSet.Flashcards.length) * 100);

  return (
    <div>
      <Menu/>
      {resolvedParams && <SecondaryNav user={resolvedParams.user} setName={resolvedParams.setName} />}
      <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
        {/* Header with Learning Progress */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{flashcardSet.Title}</h1>
            <p className="text-sm">
              Card {currentCardIndex + 1} of {flashcardSet.Flashcards.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm">Learning Progress</p>
            <div className="w-full bg-blue-700 rounded-full h-2.5 mt-1">
              <div 
                className="bg-white h-2.5 rounded-full" 
                style={{width: `${learningProgress}%`}}
              />
            </div>
            <p className="text-sm mt-1">{learningProgress}% Learned</p>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-4">
          {/* Term Display */}
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-800">{currentCard.Term}</p>
          </div>

          {/* Blurting Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What do you recall about this term?
            </label>
            <input
              ref={blurtInputRef}
              type="text"
              placeholder="Type your answer here"
              onChange={(e) => setBlurtAttempt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBlurtSubmit()}
              className={`w-full p-3 border-2 rounded-lg focus:ring-2`}
            />
            
            {/* Enhanced Submit Button with Feedback */}
            <button 
              onClick={handleBlurtSubmit}
              className={`w-full py-3 rounded-lg transition ${
                showSolution 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              disabled={showSolution}
            >
              {showSolution ? 'Solution Revealed' : 'Reveal Solution'}
            </button>
          </div>

          {/* Solution Display */}
          {showSolution && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-blue-800 text-center">Full Solution</h3>
              <p className="text-lg text-gray-800 text-center">{currentCard.Solution}</p>
              
              {/* Additional Context */}
              {currentCard.Concept && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg text-sm text-gray-700">
                  <strong className="block mb-1">Key Concept:</strong> 
                  {currentCard.Concept}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Navigation */}
        <div className="flex justify-between p-4 bg-gray-100">
          <button 
            onClick={() => navigateCard('prev')}
            className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition"
          >
            <ChevronLeft className="mr-2" /> Previous
          </button>
          <button 
            onClick={resetCard}
            className="flex items-center text-gray-600 hover:text-gray-800 bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            <RefreshCw className="mr-2" /> Reset
          </button>
          <button 
            onClick={() => navigateCard('next')}
            className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition"
          >
            Next <ChevronRight className="ml-2" />
          </button>
        </div>
      </div>

      {/* Full Flashcard List */}
      <div className="mt-8">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        All Flashcards in {flashcardSet.Title}
      </h2>
      
      {/* Large screens: Horizontal layout */}
      <div className="hidden lg:grid grid-cols-1 gap-4">
        {flashcardSet.Flashcards.map((card) => (
          <div
            key={card.ID}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-black">Term</h3>
                <p className="mt-1">{card.Term}</p>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-black">Solution</h3>
                <p className="mt-1">{card.Solution}</p>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-black">Concept</h3>
                <p className="mt-1">{card.Concept || '-'}</p>
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
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => toggleCard(card.ID)}
          >
            <div className="p-4">
              <div className="font-semibold text-lg text-black mb-2">
                {card.Term}
              </div>
              
              {expandedId === card.ID && (
                <div className="mt-4 space-y-3 border-t pt-3">
                  <div>
                    <h3 className="text-sm font-semibold text-black">Solution</h3>
                    <p className="mt-1 text-gray-700">{card.Solution}</p>
                  </div>
                  {card.Concept && (
                    <div>
                      <h3 className="text-sm font-semibold text-black">Concept</h3>
                      <p className="mt-1 text-gray-700">{card.Concept}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-2 text-sm text-blue-500">
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