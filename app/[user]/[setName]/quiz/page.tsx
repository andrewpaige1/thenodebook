"use client"

import { useState, useEffect, useRef } from 'react';
import { useUser } from "@auth0/nextjs-auth0/client";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  XCircle, 
  Lock,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Menu from "@/components/Menu";
import SecondaryNav from "@/components/FlashcardNav";
import { Progress } from "@/components/ui/progress";

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

export default function FlashcardStudy({ 
  params 
}: { 
  params: Promise<{ user: string, setName: string }> 
}) {
  const { user, isLoading: isUserLoading } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [showAllCards, setShowAllCards] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ user: string, setName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedProgress, setSavedProgress] = useState<boolean>(false);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    async function fetchFlashcards() {
      if (!resolvedParams) return;

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
          setError(response.status === 403 ? 'private' : 'general');
          throw new Error('Failed to fetch flashcards');
        }

        const data = await response.json();
        
        if (!data.IsPublic && (!user || user.nickname !== resolvedParams.user)) {
          setError('private');
          return;
        }

        setFlashcardSet(data);
        
        // Load saved progress
        const savedMastered = localStorage.getItem(`mastered-${data.ID}`);
        if (savedMastered) {
          setMastered(new Set(JSON.parse(savedMastered)));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFlashcards();
  }, [resolvedParams, user]);

  // Save progress to localStorage
  useEffect(() => {
    if (flashcardSet && mastered.size > 0) {
      localStorage.setItem(`mastered-${flashcardSet.ID}`, JSON.stringify(Array.from(mastered)));
      setSavedProgress(true);
      const timer = setTimeout(() => setSavedProgress(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [mastered, flashcardSet]);

  const handleAnswer = () => {
    if (showSolution || !flashcardSet) return;
    
    const currentCard = flashcardSet.Flashcards[currentIndex];
    const correct = userAnswer.toLowerCase().includes(currentCard.Solution.toLowerCase());
    
    setShowSolution(true);
    setIsCorrect(correct);

    if (correct) {
      setMastered(prev => new Set([...prev, currentCard.ID]));
    }
  };

  const resetCard = () => {
    setUserAnswer("");
    setShowSolution(false);
    setIsCorrect(null);
    inputRef.current?.focus();
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!flashcardSet) return;
    
    const total = flashcardSet.Flashcards.length;
    setCurrentIndex(prev => 
      direction === 'next' 
        ? (prev + 1) % total 
        : (prev - 1 + total) % total
    );
    resetCard();
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600 animate-pulse" />
          <p className="mt-4 text-lg">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error || !flashcardSet) {
    return (
      <div className="min-h-screen bg-white">
        <Menu />
        {resolvedParams && <SecondaryNav user={resolvedParams.user} setName={resolvedParams.setName} />}
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="w-96 p-6">
            {error === 'private' ? (
              <>
                <Lock className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-center">Private Set</h2>
                <p className="text-gray-600 text-center">
                  This flashcard set is private and can only be accessed by its creator.
                </p>
              </>
            ) : (
              <>
                <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-center">Error</h2>
                <p className="text-gray-600 text-center">Could not load flashcard set</p>
              </>
            )}
          </Card>
        </div>
      </div>
    );
  }

  const currentCard = flashcardSet.Flashcards[currentIndex];
  const masteryPercentage = (mastered.size / flashcardSet.Flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      <Menu />
      {resolvedParams && <SecondaryNav user={resolvedParams.user} setName={resolvedParams.setName} />}
      
      <div className="container mx-auto px-4 py-8">
        {savedProgress && (
          <Alert className="max-w-2xl mx-auto mb-4 bg-green-50">
            <AlertDescription>Progress saved!</AlertDescription>
          </Alert>
        )}

        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{flashcardSet.Title}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-500">
                    Card {currentIndex + 1} of {flashcardSet.Flashcards.length}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    {mastered.size} Mastered
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAllCards(!showAllCards)}
              >
                {showAllCards ? "Hide All Cards" : "Show All Cards"}
              </Button>
            </div>
            <Progress value={masteryPercentage} className="h-2" />
          </div>

          <Card className="mb-8 border-t-4">
            <CardContent className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{currentCard.Term}</h2>
              </div>

              <div className="space-y-4">
                <Input
                  ref={inputRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                  placeholder="Type your answer here..."
                  className="text-lg p-4"
                  disabled={showSolution}
                  autoFocus
                />

                <Button
                  onClick={handleAnswer}
                  disabled={showSolution}
                  className="w-full h-12 text-lg"
                  variant={showSolution ? "secondary" : "default"}
                >
                  {showSolution ? "Solution Shown" : "Check Answer"}
                </Button>
              </div>

              {showSolution && (
                <div className="mt-6 space-y-4">
                  <div className={`p-4 rounded-lg ${
                    isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      <h3 className="font-semibold">
                        {isCorrect ? "Correct!" : "Not quite right"}
                      </h3>
                    </div>
                    <p className="text-lg font-medium">{currentCard.Solution}</p>
                  </div>
                  
                  {currentCard.Concept && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Key Concept</h3>
                      <p>{currentCard.Concept}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-6">
                <Button
                  onClick={() => handleNavigation('prev')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>

                <Button
                  onClick={resetCard}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Try Again
                </Button>

                <Button
                  onClick={() => handleNavigation('next')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {showAllCards && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center mb-6">
                All Cards ({flashcardSet.Flashcards.length})
              </h2>
              
              {flashcardSet.Flashcards.map((card, index) => (
                <Card 
                  key={card.ID}
                  className={`transition-all ${
                    currentIndex === index ? 'border-blue-500 shadow-md' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <button
                      className="w-full text-left"
                      onClick={() => {
                        setCurrentIndex(index);
                        resetCard();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-500">Card {index + 1}</span>
                          <h3 className="font-semibold text-gray-900">{card.Term}</h3>
                        </div>
                        {mastered.has(card.ID) && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}