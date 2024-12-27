"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from "@auth0/nextjs-auth0/client";
import { 
  BookOpen, 
  XCircle,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
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
  const [, setShowSolution] = useState(false);
  const [confidence, setConfidence] = useState<'high' | 'low' | null>(null);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
  const [strugglingCards, setStrugglingCards] = useState<Set<number>>(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [studyMode, setStudyMode] = useState<'all' | 'struggling' | 'mastered'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ user: string, setName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedProgress, setSavedProgress] = useState(false);

  // Resolve params from the promise
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch flashcard data
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
        
        // Check if private set is accessible
        if (!data.IsPublic && (!user || user.nickname !== resolvedParams.user)) {
          setError('private');
          return;
        }

        setFlashcardSet(data);
        
        // Load saved progress from localStorage
        const savedMastered = localStorage.getItem(`mastered-${data.ID}`);
        const savedStruggling = localStorage.getItem(`struggling-${data.ID}`);
        
        if (savedMastered) {
          setMasteredCards(new Set(JSON.parse(savedMastered)));
        }
        if (savedStruggling) {
          setStrugglingCards(new Set(JSON.parse(savedStruggling)));
        }
      } catch (error) {
        console.error('Error:', error);
        setError('general');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFlashcards();
  }, [resolvedParams, user]);

  // Save progress to localStorage
  useEffect(() => {
    if (flashcardSet) {
      if (masteredCards.size > 0) {
        localStorage.setItem(`mastered-${flashcardSet.ID}`, JSON.stringify(Array.from(masteredCards)));
      }
      if (strugglingCards.size > 0) {
        localStorage.setItem(`struggling-${flashcardSet.ID}`, JSON.stringify(Array.from(strugglingCards)));
      }
      if (masteredCards.size > 0 || strugglingCards.size > 0) {
        setSavedProgress(true);
        const timer = setTimeout(() => setSavedProgress(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [masteredCards, strugglingCards, flashcardSet]);

  const handleConfidenceRating = (rating: 'high' | 'low') => {
    const currentCard = flashcardSet?.Flashcards[currentIndex];
    if (!currentCard) return;

    setConfidence(rating);
    if (rating === 'high') {
      setMasteredCards(prev => new Set([...prev, currentCard.ID]));
      setStrugglingCards(prev => {
        const updated = new Set(prev);
        updated.delete(currentCard.ID);
        return updated;
      });
    } else {
      setStrugglingCards(prev => new Set([...prev, currentCard.ID]));
      setMasteredCards(prev => {
        const updated = new Set(prev);
        updated.delete(currentCard.ID);
        return updated;
      });
    }
  };

  const getFilteredCards = () => {
    if (!flashcardSet) return [];
    switch (studyMode) {
      case 'struggling':
        return flashcardSet.Flashcards.filter(card => strugglingCards.has(card.ID));
      case 'mastered':
        return flashcardSet.Flashcards.filter(card => masteredCards.has(card.ID));
      default:
        return flashcardSet.Flashcards;
    }
  };

  const resetCard = () => {
    setUserAnswer("");
    setShowSolution(false);
    setConfidence(null);
    setIsFlipped(false);
    inputRef.current?.focus();
  };

  // Loading state
  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600 animate-pulse" />
          <p className="mt-4 text-lg">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !flashcardSet) {
    return (
      <div className="min-h-screen">
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
  const masteryPercentage = (masteredCards.size / flashcardSet.Flashcards.length) * 100;
  const filteredCards = getFilteredCards();

  return (
    <div className="min-h-screen">
      <Menu />
      {resolvedParams && <SecondaryNav user={resolvedParams.user} setName={resolvedParams.setName} />}
      
      <div className="container mx-auto px-4 py-8">
        {savedProgress && (
          <Alert className="max-w-2xl mx-auto mb-4 bg-green-50">
            <AlertDescription>Progress saved!</AlertDescription>
          </Alert>
        )}

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{flashcardSet.Title}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm bg-blue-100 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {flashcardSet.Flashcards.length}
                  </span>
                  <span className="text-sm bg-green-100 px-3 py-1 rounded-full">
                    {masteredCards.size} Mastered
                  </span>
                  <span className="text-sm bg-red-100 px-3 py-1 rounded-full">
                    {strugglingCards.size} Struggling
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStudyMode(studyMode === 'struggling' ? 'all' : 'struggling')}
                  className={studyMode === 'struggling' ? 'bg-red-50' : ''}
                >
                  Need Review ({strugglingCards.size})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowOverview(!showOverview)}
                >
                  {showOverview ? 'Hide Overview' : 'Show Overview'}
                </Button>
              </div>
            </div>
            <Progress value={masteryPercentage} className="h-2" />
          </div>

          <div className="perspective-1000">
            <Card 
              className={`transform-gpu transition-all duration-700 ${
                isFlipped ? 'rotate-y-180' : ''
              } mb-8 hover:shadow-lg`}
            >
              <CardContent className="p-8">
                <div className={`transform-gpu ${isFlipped ? 'rotate-y-180 hidden' : ''}`}>
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-gray-900">{currentCard.Term}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        ref={inputRef}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsFlipped(true)}
                        placeholder="Type your answer and press Enter..."
                        className="text-lg p-4"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setIsFlipped(true)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className={`transform-gpu ${!isFlipped ? 'rotate-y-180 hidden' : ''}`}>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Solution</h3>
                    <p className="text-xl mt-4">{currentCard.Solution}</p>
                  </div>

                  {currentCard.Concept && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Key Concept</h3>
                      </div>
                      <p>{currentCard.Concept}</p>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={() => handleConfidenceRating('high')}
                        variant="outline"
                        className={`flex items-center gap-2 ${
                          confidence === 'high' ? 'bg-green-100' : ''
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" /> Got it!
                      </Button>
                      <Button
                        onClick={() => handleConfidenceRating('low')}
                        variant="outline"
                        className={`flex items-center gap-2 ${
                          confidence === 'low' ? 'bg-red-100' : ''
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4" /> Need Review
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                onClick={() => {
                  setCurrentIndex(prev => 
                    prev > 0 ? prev - 1 : flashcardSet.Flashcards.length - 1
                  );
                  resetCard();
                }}
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
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
                      <Button
                        onClick={() => {
                          setCurrentIndex(prev => 
                            (prev + 1) % flashcardSet.Flashcards.length
                          );
                          resetCard();
                        }}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
        
                  {showOverview && (
                    <div className="mt-8 space-y-4">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">All Cards</h2>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStudyMode('all')}
                            className={studyMode === 'all' ? 'bg-blue-100' : ''}
                          >
                            All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStudyMode('mastered')}
                            className={studyMode === 'mastered' ? 'bg-green-100' : ''}
                          >
                            Mastered
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStudyMode('struggling')}
                            className={studyMode === 'struggling' ? 'bg-red-100' : ''}
                          >
                            Need Review
                          </Button>
                        </div>
                      </div>
        
                      {filteredCards.map((card) => (
                        <Card 
                          key={card.ID}
                          className={`transition-all ${
                            currentIndex === flashcardSet.Flashcards.indexOf(card) ? 'border-blue-500 shadow-md' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <button
                              className="w-full text-left"
                              onClick={() => {
                                setCurrentIndex(flashcardSet.Flashcards.indexOf(card));
                                resetCard();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm text-gray-500">
                                    Card {flashcardSet.Flashcards.indexOf(card) + 1}
                                  </span>
                                  <h3 className="font-semibold text-gray-900">{card.Term}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  {masteredCards.has(card.ID) && (
                                    <span className="bg-green-100 px-2 py-1 rounded text-sm">
                                      Mastered
                                    </span>
                                  )}
                                  {strugglingCards.has(card.ID) && (
                                    <span className="bg-red-100 px-2 py-1 rounded text-sm">
                                      Need Review
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          </CardContent>
                        </Card>
                      ))}
        
                      {filteredCards.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            {studyMode === 'mastered' 
                              ? "No mastered cards yet. Keep studying!"
                              : studyMode === 'struggling'
                              ? "No cards marked for review. Great job!"
                              : "No cards found."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }