"use client"

import { useState, useEffect, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  RefreshCw,
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

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [blurtAttempt, setBlurtAttempt] = useState<string>('');
  const [showSolution, setShowSolution] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ user: string, setName: string } | null>(null);
  const [learnedCards, setLearnedCards] = useState<number[]>([]);
  const [, setAttemptFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleCard = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    params.then(resolved => {
      setResolvedParams(resolved);
    });
  }, [params]);

  useEffect(() => {
    if (!user && !isUserLoading) {
      router.push('/api/auth/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    async function fetchSet() {
      if (user?.nickname && resolvedParams) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/app/users/${user.nickname}/sets/${decodeURIComponent(resolvedParams.setName)}`, {
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

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <BookOpen className="mx-auto h-16 w-16 text-black animate-pulse" />
          <p className="mt-4 text-xl text-gray-700">Preparing your learning journey...</p>
        </div>
      </div>
    );
  }

  if (!flashcardSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <p className="text-red-600 text-2xl font-semibold">Could not load your flashcard set</p>
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
      
      const normalizeString = (str: string) => 
        str.toLowerCase().replace(/[^\w\s]/g, '').trim();
      
      const isCorrect = normalizeString(blurtAttempt).includes(
        normalizeString(currentCard.Solution)
      );

      setAttemptFeedback(isCorrect ? 'correct' : 'incorrect');

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
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{flashcardSet.Title}</h1>
              <p className="text-sm">
                Card {currentCardIndex + 1} of {flashcardSet.Flashcards.length}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-black">{currentCard.Term}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                What do you recall about this term?
              </label>
              <input
                ref={blurtInputRef}
                type="text"
                placeholder="Type your answer here"
                onChange={(e) => setBlurtAttempt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBlurtSubmit()}
                className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-black"
              />
              
              <button 
                onClick={handleBlurtSubmit}
                className={`w-full py-3 rounded-lg transition ${
                  showSolution 
                    ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-neutral-900'
                }`}
                disabled={showSolution}
              >
                {showSolution ? 'Solution Revealed' : 'Reveal Solution'}
              </button>
            </div>

            {showSolution && (
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-black text-center">Full Solution</h3>
                <p className="text-lg text-black text-center">{currentCard.Solution}</p>
                
                {currentCard.Concept && (
                  <div className="mt-4 p-3 bg-neutral-100 rounded-lg text-sm text-black">
                    <strong className="block mb-1">Key Concept:</strong> 
                    {currentCard.Concept}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between p-4 bg-neutral-100">
            <button 
              onClick={() => navigateCard('prev')}
              className="flex items-center text-black hover:bg-black hover:text-white bg-white px-4 py-2 rounded-lg transition"
            >
              <ChevronLeft className="mr-2" /> Previous
            </button>
            <button 
              onClick={resetCard}
              className="flex items-center text-black hover:bg-black hover:text-white bg-white px-4 py-2 rounded-lg transition"
            >
              <RefreshCw className="mr-2" /> Reset
            </button>
            <button 
              onClick={() => navigateCard('next')}
              className="flex items-center text-black hover:bg-black hover:text-white bg-white px-4 py-2 rounded-lg transition"
            >
              Next <ChevronRight className="ml-2" />
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">
            All Flashcards in {flashcardSet.Title}
          </h2>
          
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
                  
                  <div className="mt-2 text-sm text-black">
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