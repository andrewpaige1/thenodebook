"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Book, Lightbulb, Tag, ArrowLeft, ArrowRight, Trash2, Edit2, Check, X, Send } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect } from "next/navigation";
import Menu from '@/components/Menu';

interface FlashCard {
  id: string;
  term: string;
  solution: string;
  concept: string;
}

const FlashCardCreator = () => {
  const { user } = useUser();
  const [setName, setSetName] = useState('');
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentCard, setCurrentCard] = useState<Partial<FlashCard>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [editingField, setEditingField] = useState<{ cardId: string; field: keyof FlashCard } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { name: 'Term', icon: Book, placeholder: 'Enter the term...' },
    { name: 'Solution', icon: Lightbulb, placeholder: 'Enter the solution...' },
    { name: 'Concept', icon: Tag, placeholder: 'Enter the concept or category...' }
  ];

  const handleSubmit = async () => {
    if (!setName.trim() || !user?.nickname) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Transform the cards data to match the API's expected format
      const transformedCards = cards.map(card => ({
        term: card.term,
        solution: card.solution,
        concept: card.concept
      }));

      const requestData = {
        name: setName,
        nickname: user.nickname,
        cards: transformedCards
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/createSet`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit flashcards');
      }

      const result = await response.json();
      console.log('Flashcard set created:', result);

      // Clear the form after successful submission
      setCards([]);
      setSetName('');
      
    } catch (error) {
      console.error('Error submitting flashcards:', error);
      // You might want to show an error message here
      
    } finally {
      setIsSubmitting(false);
      redirect("/")
    }
  };

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

  const startEditing = (cardId: string, field: keyof FlashCard) => {
    setEditingField({ cardId, field });
  };

  const stopEditing = () => {
    setEditingField(null);
  };

  const currentValue = currentCard[steps[activeStep].name.toLowerCase() as keyof FlashCard] || '';
  const StepIcon = steps[activeStep].icon;

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
        stopEditing();
      } else if (e.key === 'Escape') {
        stopEditing();
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
                stopEditing();
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={stopEditing}
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
          onClick={() => startEditing(card.id, field)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  return (
    <div>
      <Menu/>
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Set Name Input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Create Flashcard Set</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            placeholder="Enter your flashcard set name..."
            className="text-lg"
          />
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
      {cards.length > 0 && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || !setName.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Flashcard Set'}
          </Button>
        </div>
      )}
    </div>
  </div>
  );
};

export default FlashCardCreator;