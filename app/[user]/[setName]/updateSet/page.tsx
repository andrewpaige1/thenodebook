"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Book, Lightbulb, Tag, ArrowLeft, ArrowRight, Trash2, Edit2, Check, X, Send, Globe2, Lock } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect } from "next/navigation";
import Menu from '@/components/Menu';
import { Switch } from "@/components/ui/switch";
import { useParams } from 'next/navigation'
import ErrorAlert from '@/components/ErrorAlert';

interface FlashCard {
  id: string;
  term: string;
  solution: string;
  concept: string;
}

  const UpdateFlashCardSet = () => {
  const { user, isLoading: userLoading } = useUser();
  const params = useParams<{ user: string; setName: string }>()
  const [setName, setSetName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentCard, setCurrentCard] = useState<Partial<FlashCard>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [editingField, setEditingField] = useState<{ cardId: string; field: keyof FlashCard } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalSetName, setOriginalSetName] = useState('');
  interface ErrorState {
    message: string | null;
  }
  
  // Update your state declaration
  const [updateError, setUpdateError] = useState<ErrorState['message']>(null);

  const steps = [
    { name: 'Term', icon: Book, placeholder: 'Enter the term...' },
    { name: 'Solution', icon: Lightbulb, placeholder: 'Enter the solution...' },
    { name: 'Concept', icon: Tag, placeholder: 'Enter the concept or category...' }
  ];

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!userLoading && !user) {
      redirect('/api/auth/login');
      return;
    }

    async function fetchSet() {
      if (!params?.user || !params?.setName) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/app/users/${params.user}/sets/${decodeURIComponent(params.setName)}`,
          {
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
        
        // Only allow editing if user owns the set
        if (user?.nickname !== params.user) {
          redirect('/');
        }

        setSetName(data.Title);
        setOriginalSetName(data.Title);
        setIsPublic(data.IsPublic);
        
        // Transform the flashcards to match our format
        const transformedCards = data.Flashcards.map((card: { ID: any; Term: any; Solution: any; Concept: any; }) => ({
          id: String(card.ID),
          term: card.Term,
          solution: card.Solution,
          concept: card.Concept || ''
        }));
        
        setCards(transformedCards);
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchSet();
    }
  }, [user, userLoading, params]);

  const handleUpdate = async () => {
    if (!setName.trim() || !user?.nickname) return;

    try {
      setIsSubmitting(true);
      
      const transformedCards = cards.map(card => ({
        term: card.term,
        solution: card.solution,
        concept: card.concept
      }));

      const requestData = {
        name: setName,
        originalName: originalSetName,
        nickname: user.nickname,
        cards: transformedCards,
        isPublic: isPublic
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/updateSet`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        if (response.status === 409) {
          setUpdateError("You already have a set with this name")
        }
      }
      redirect(`/${user.nickname}/${setName}`);
    } catch (error) {
      if (error instanceof Response) {
        if (error.status === 409) {
          setUpdateError("You already have a set with this name");
        } else {
          setUpdateError("Failed to update flashcard set");
        }      
      }
      return error
    } 
    finally {
      setIsSubmitting(false);
    }
  };

  // Reuse the same helper functions from FlashCardCreator
  const addCard = () => {
    if (!currentCard.term?.trim()) return;
    
    setCards(prev => [...prev, {
      id: crypto.randomUUID(),
      term: currentCard.term || '',
      solution: currentCard.solution || '',
      concept: currentCard.concept || ''
    }]);
    
    setCurrentCard({});
    setActiveStep(0);
  };

  const updateCardField = (cardId: string, field: keyof FlashCard, value: string) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
  };

  const handleStepChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else if (direction === 'prev' && activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleInputChange = (value: string) => {
    const field = steps[activeStep].name.toLowerCase() as keyof FlashCard;
    setCurrentCard(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading flashcard set...</p>
      </div>
    );
  }

  const CardField = ({ 
    card, 
    field, 
    icon: FieldIcon,
    className = "" 
  }: { 
    card: FlashCard; 
    field: keyof FlashCard; 
    icon: React.ElementType;
    className?: string;
  }) => {
    const isEditing = editingField?.cardId === card.id && editingField?.field === field;
    const [tempValue, setTempValue] = useState(card[field]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        updateCardField(card.id, field, tempValue);
        setEditingField(null);
      } else if (e.key === 'Escape') {
        setEditingField(null);
      }
    };

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <FieldIcon className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex-1 flex gap-2">
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
              className="flex-1"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                updateCardField(card.id, field, tempValue);
                setEditingField(null);
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditingField(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group/field">
        <FieldIcon className="h-4 w-4 text-primary flex-shrink-0" />
        <span className={className}>{card[field]}</span>
        <Button
          size="icon"
          variant="ghost"
          className="opacity-0 group-hover/field:opacity-100 transition-opacity"
          onClick={() => setEditingField({ cardId: card.id, field })}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const currentValue = currentCard[steps[activeStep].name.toLowerCase() as keyof FlashCard] || '';
  const StepIcon = steps[activeStep].icon;

  return (
    <div>
      <Menu />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Set Name Input and Privacy Toggle */}
        {updateError && (
          <ErrorAlert 
            message={updateError}
            onClose={() => setUpdateError(null)}
            duration={4000}
            position="bottom-right"
          />
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Edit Flashcard Set</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="Enter your flashcard set name..."
              className="text-lg"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isPublic ? (
                  <Globe2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {isPublic ? 'Public - Anyone can view this set' : 'Private - Only you can view this set'}
                </span>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="ml-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Card Creation Interface */}
        <Card className="relative overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2">
              <StepIcon className="h-6 w-6" />
              {steps[activeStep].name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="w-full h-1 bg-muted mb-6">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Input Area */}
            <div className="space-y-4">
              <Input
                value={currentValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={steps[activeStep].placeholder}
                className="text-lg p-6"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (activeStep === steps.length - 1) {
                      addCard();
                    } else {
                      handleStepChange('next');
                    }
                  }
                }}
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleStepChange('prev')}
                  disabled={activeStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button onClick={addCard} disabled={!currentCard.term?.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Card
                  </Button>
                ) : (
                  <Button onClick={() => handleStepChange('next')}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <Card key={card.id} className="group relative hover:shadow-lg transition-shadow">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeCard(card.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardContent className="p-4 space-y-2">
                <CardField card={card} field="term" icon={Book} className="font-medium" />
                <CardField card={card} field="solution" icon={Lightbulb} />
                <CardField card={card} field="concept" icon={Tag} className="text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleUpdate}
            disabled={isSubmitting || !setName.trim() || cards.length === 0}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Updating...' : 'Update Flashcard Set'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateFlashCardSet;