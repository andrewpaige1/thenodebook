"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Book, Upload, FileText, Lightbulb, Tag, ArrowLeft, ArrowRight, Trash2, Send, Globe2, Lock, CloudUpload, GripVertical, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SetRepository } from '@/repositories/setRepository';
import { FlashcardRepository } from '@/repositories/flashcardRepository';
import { fetchAccessToken } from '@/services/authService';
import { UploadFlashcardRepository } from '@/repositories/uploadFlashcardRepository';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// --- Interfaces & Types ---
interface FlashCard {
  id: string;
  term: string;
  solution: string;
  concept: string;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';
const UNCATEGORIZED_GROUP = "Uncategorized";


// --- Smart Concept Input with Auto-Complete ---
const SmartConceptInput = ({
  value,
  onChange,
  concepts,
  className = "",
  placeholder = "Enter concept...",
  onEnter
}: {
  value: string;
  onChange: (newValue: string) => void;
  concepts: string[];
  className?: string;
  placeholder?: string;
  onEnter?: () => void;
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredConcepts = concepts
    .filter(c => c !== UNCATEGORIZED_GROUP)
    .filter(c => c.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 5);

  const isNewConcept = value.trim() && !concepts.some(c => c.toLowerCase() === value.toLowerCase());

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredConcepts.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredConcepts[selectedIndex]) {
        onChange(filteredConcepts[selectedIndex]);
      } else if (value.trim()) {
        onChange(value.trim());
      }
      setShowSuggestions(false);
      setSelectedIndex(-1);
      onEnter?.();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Tab') {
      if (selectedIndex >= 0 && filteredConcepts[selectedIndex]) {
        e.preventDefault();
        onChange(filteredConcepts[selectedIndex]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }
  };

  const handleSelect = (concept: string) => {
    onChange(concept);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => { setTimeout(() => setShowSuggestions(false), 200); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && (value.length > 0) && (filteredConcepts.length > 0 || isNewConcept) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredConcepts.map((concept, index) => (
            <div
              key={concept}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${index === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'}`}
              onClick={() => handleSelect(concept)}
            >
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>{concept}</span>
            </div>
          ))}
          {isNewConcept && (
            <div
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-primary border-t ${selectedIndex === filteredConcepts.length ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
              onClick={() => handleSelect(value.trim())}
            >
              <Plus className="h-4 w-4" />
              <span>Create &quot;{value.trim()}&quot;</span>
            </div>
          )}
        </div>
      )}
      {isNewConcept && value.length > 0 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded">
            <Plus className="h-3 w-3" />New
          </div>
        </div>
      )}
    </div>
  );
};


// --- Flashcard Edit Modal Component (MODIFIED) ---
const FlashcardEditModal = ({
  card,
  isOpen,
  onClose,
  onSave,
  allConcepts,
}: {
  card: FlashCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: FlashCard) => void;
  allConcepts: string[];
}) => {
  const [editedCard, setEditedCard] = useState<FlashCard | null>(card);

  useEffect(() => {
    setEditedCard(card);
  }, [card]);

  if (!isOpen || !editedCard) {
    return null;
  }

  const handleSave = () => {
    onSave(editedCard);
  };

  const handleFieldChange = (field: keyof Omit<FlashCard, 'id'>, value: string) => {
    setEditedCard((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="term-modal" className="text-right">Term</Label>
            <Input
              id="term-modal"
              value={editedCard.term}
              onChange={(e) => handleFieldChange('term', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="solution-modal" className="text-right pt-2">Solution</Label>
            <Textarea
              id="solution-modal"
              value={editedCard.solution}
              onChange={(e) => handleFieldChange('solution', e.target.value)}
              className="col-span-3 min-h-[120px]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="concept-modal" className="text-right">Concept</Label>
            <div className="col-span-3">
               <SmartConceptInput
                value={editedCard.concept}
                onChange={(val) => handleFieldChange('concept', val)}
                concepts={allConcepts}
                placeholder="Search or create new..."
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// --- Draggable Card Item Component ---
const SortableCardItem = ({ card, removeCard, onCardClick, isOverlay = false }: {
  card: FlashCard;
  removeCard: (id: string) => void;
  onCardClick: (card: FlashCard) => void;
  isOverlay?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "card", card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.5 : 1,
    boxShadow: isOverlay ? "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" : "none",
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-manipulation">
      <Card className="group relative hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onCardClick(card)}>
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20" 
          onClick={(e) => { e.stopPropagation(); removeCard(card.id); }} 
          aria-label="Delete card"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <div 
          {...attributes} 
          {...listeners} 
          className="absolute top-2 left-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Book className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="flex-1 font-medium truncate">{card.term || <span className="text-muted-foreground italic">No term</span>}</span>
          </div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="flex-1 text-sm text-muted-foreground truncate">{card.solution || <span className="text-muted-foreground italic">No solution</span>}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="flex-1 text-sm text-muted-foreground truncate">{card.concept || <span className="text-muted-foreground italic">No concept</span>}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Concept Column Component ---
const ConceptColumn = ({ concept, cards, removeCard, onCardClick }: {
  concept: string;
  cards: FlashCard[];
  removeCard: (id: string) => void;
  onCardClick: (card: FlashCard) => void;
}) => {
  const { setNodeRef } = useSortable({ id: `column-${concept}`, data: { type: "column", concept } });
  
  return (
    <div ref={setNodeRef} className="w-full md:w-[350px] flex-shrink-0">
      <div className="bg-muted p-3 rounded-t-lg">
        <h3 className="font-semibold text-center">{concept} ({cards.length})</h3>
      </div>
      <div className="bg-gray-100 p-2 rounded-b-lg h-full space-y-3">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <SortableCardItem 
              key={card.id} 
              card={card} 
              removeCard={removeCard} 
              onCardClick={onCardClick}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};


// --- Main FlashCard Creator Component ---
const FlashCardCreator = () => {
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [setName, setSetName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [concepts, setConcepts] = useState<string[]>([UNCATEGORIZED_GROUP]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [currentCard, setCurrentCard] = useState<Partial<FlashCard>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [activeCard, setActiveCard] = useState<FlashCard | null>(null);
  const [, setDuplicateWarnings] = useState<string[]>([]);
  const router = useRouter();
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const steps = [{ name: 'Term', key: 'term', icon: Book, placeholder: 'e.g., Photosynthesis' }, { name: 'Solution', key: 'solution', icon: Lightbulb, placeholder: 'The process by which green plants use sunlight...' }, { name: 'Concept', key: 'concept', icon: Tag, placeholder: 'e.g., Biology' }];
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // --- Modal Handlers ---
  const handleCardClick = (card: FlashCard) => { setEditingCard(card); };
  const handleCloseModal = () => { setEditingCard(null); };
  const handleSaveChanges = (updatedCard: FlashCard) => {
    setCards(prevCards => prevCards.map(card => card.id === updatedCard.id ? updatedCard : card));
    if (updatedCard.concept && !concepts.includes(updatedCard.concept)) {
        setConcepts(prev => [...prev, updatedCard.concept]);
    }
    handleCloseModal();
  };

  const groupedCards = useMemo(() => {
    return concepts.reduce((acc: Record<string, FlashCard[]>, concept: string) => {
      acc[concept] = cards.filter((card: FlashCard) => (card.concept || UNCATEGORIZED_GROUP) === concept);
      return acc;
    }, {} as Record<string, FlashCard[]>);
  }, [cards, concepts]);

  const addCard = () => {
    const term = currentCard.term?.trim();
    if (!term) return;
    if (cards.some(c => c.term.toLowerCase() === term.toLowerCase())) {
      setShowDuplicateAlert(true);
      setDuplicateWarnings([term]);
      return;
    }
    const newCard: FlashCard = { id: uuidv4(), term, solution: currentCard.solution || '', concept: currentCard.concept || '' };
    setCards(prev => [newCard, ...prev]);
    if (newCard.concept && !concepts.includes(newCard.concept)) {
        setConcepts(prev => [...prev, newCard.concept]);
    }
    setCurrentCard({ concept: newCard.concept || '' });
    setActiveStep(0);
    setDuplicateWarnings([]);
  };

  const updateCardField = (cardId: string, field: keyof FlashCard, value: string) => {
    setCards(prev => prev.map(card => card.id === cardId ? { ...card, [field]: value } : card));
  };

  useEffect(() => {
    const allConceptsInUse = new Set([...cards.map(c => c.concept || UNCATEGORIZED_GROUP), UNCATEGORIZED_GROUP]);
    const newConcepts = Array.from(allConceptsInUse);
    if (newConcepts.length !== concepts.length || newConcepts.some(concept => !concepts.includes(concept))) {
      setConcepts(newConcepts);
    }
  }, [cards, concepts]);

  const removeCard = (id: string) => { setCards(prev => prev.filter(card => card.id !== id)); };
  const addNewGroup = () => {
    const newGroupName = prompt("Enter new group name:");
    if (newGroupName && !concepts.includes(newGroupName)) {
        setConcepts(prev => [...prev, newGroupName]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = await fetchAccessToken();
      if (!token) throw new Error('No access token');
      const setRepo = new SetRepository();
      const flashcardRepo = new FlashcardRepository();
      const setPayload = { Title: setName, IsPublic: isPublic };
      const createdSet = await setRepo.create(setPayload, token);
      if (!createdSet || !createdSet.ID) throw new Error('Failed to create set');
      for (const card of cards) {
        const cardPayload = { Term: card.term, Solution: card.solution, Concept: card.concept };
        await flashcardRepo.create(createdSet.PublicID, cardPayload, token);
      }
      setIsSubmitting(false);
      router.push(`/sets/${createdSet.PublicID}`);
    } catch {
      setIsSubmitting(false);
      alert('Error saving set or flashcards.');
    }
  };
  
  const handleFileUpload = async () => { 
    if (!selectedFile) return;
    setUploadStatus('uploading');
    const uploadRepo = new UploadFlashcardRepository();
    try {
      const token = await fetchAccessToken();
      const result = await uploadRepo.upload(selectedFile, token);
      if (!result || !result.cards) throw new Error('Upload failed');
      const newCards = result.cards.map(card => ({ id: uuidv4(), term: card.term, solution: card.solution, concept: card.concept || '' }));
      setCards(prev => [...newCards, ...prev]);
      setUploadStatus('success');
    } catch {
      setUploadStatus('error');
    } finally {
      setSelectedFile(null);
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };
  
  const handlePasteConvert = () => { 
    const lines = pasteText.split('\n').filter(line => line.trim() !== '');
    const newCards: FlashCard[] = lines.map(line => {
      const parts = line.split(',');
      return { id: uuidv4(), term: parts[0]?.trim() || '', solution: parts[1]?.trim() || '', concept: 'Pasted' };
    }).filter(card => card.term);
    setCards(prev => [...newCards, ...prev]);
    if (!concepts.includes('Pasted')) setConcepts(prev => [...prev, 'Pasted']);
    setPasteText('');
  };

  const handleDragStart = (event: DragStartEvent) => {
     if (event.active.data.current?.type === "card") { setActiveCard(event.active.data.current.card); }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const isActiveACard = active.data.current?.type === "card";
    const isOverACard = over.data.current?.type === "card";
    const isOverAColumn = over.data.current?.type === "column";

    if (isActiveACard && isOverACard) {
      const activeCardData = cards.find(c => c.id === activeId);
      const overCardData = cards.find(c => c.id === overId);
      if (activeCardData && overCardData && (activeCardData.concept || UNCATEGORIZED_GROUP) === (overCardData.concept || UNCATEGORIZED_GROUP)) {
        setCards(items => {
          const oldIndex = items.findIndex(item => item.id === activeId);
          const newIndex = items.findIndex(item => item.id === overId);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
    
    if (isActiveACard && (isOverAColumn || isOverACard)) {
      const activeCardData = cards.find(c => c.id === activeId);
      let newConcept = "";
      if (isOverAColumn) { newConcept = over.data.current?.concept; } 
      else if (isOverACard) { newConcept = cards.find(c => c.id === overId)?.concept || UNCATEGORIZED_GROUP; }
      if (activeCardData && (activeCardData.concept || UNCATEGORIZED_GROUP) !== newConcept) {
        updateCardField(activeId, 'concept', newConcept === UNCATEGORIZED_GROUP ? '' : newConcept);
      }
    }
  };
  
  const handleManualStepChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && activeStep < steps.length - 1) setActiveStep(p => p + 1);
    else if (direction === 'prev' && activeStep > 0) setActiveStep(p => p - 1);
  };
  
  const handleManualInputChange = (value: string) => {
    const fieldKey = steps[activeStep].key as keyof FlashCard;
    setCurrentCard(prev => ({ ...prev, [fieldKey]: value }));
  };
  
  const currentManualValue = currentCard[steps[activeStep].key as keyof FlashCard] || '';
  const StepIcon = steps[activeStep].icon;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {showDuplicateAlert && (
        <Alert variant="destructive" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-fit">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <AlertDescription>You already have this term in your set!</AlertDescription>
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setShowDuplicateAlert(false)}>Dismiss</Button>
        </Alert>
      )}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-1 min-w-0">
              <Input id="set-title" value={setName} onChange={(e) => setSetName(e.target.value)} placeholder="Enter set title, e.g. 'Biology Chapter 4'" className="text-xl font-bold border-none shadow-none focus-visible:ring-0 px-0 bg-transparent" aria-label="Set Title" />
            </div>
            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-2">
                <Switch id="public-switch" checked={isPublic} onCheckedChange={setIsPublic} /><label htmlFor="public-switch" className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">{isPublic ? <Globe2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}<span>{isPublic ? "Public" : "Private"}</span></label>
              </div>
              <Button onClick={handleSubmit} disabled={isSubmitting || !setName.trim() || cards.length === 0}>{isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />} {isSubmitting ? 'Saving...' : 'Save Set'}</Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-full mx-auto p-6 space-y-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader><CardTitle>Create Flashcards</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manual"><Book className="h-4 w-4 mr-2" />Manual</TabsTrigger>
                <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-2" />Upload</TabsTrigger>
                <TabsTrigger value="paste"><FileText className="h-4 w-4 mr-2" />Import</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="pt-6">
                <div className="relative text-center">
                    <h3 className="text-lg font-semibold flex items-center justify-center gap-2"><StepIcon className="h-5 w-5" />{steps[activeStep].name}</h3>
                    <div className="w-full h-1 bg-muted my-4 rounded-full overflow-hidden"><div className="h-full bg-primary transition-all duration-300" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} /></div>
                    <div className="space-y-4">
                        {steps[activeStep].key === 'concept' ? (
                          <SmartConceptInput value={currentManualValue} onChange={handleManualInputChange} concepts={concepts} placeholder={steps[activeStep].placeholder} onEnter={addCard} className="h-auto p-6 text-center text-2xl font-semibold tracking-tight placeholder:text-slate-400 placeholder:font-normal" />
                        ) : (
                          <Input value={currentManualValue} onChange={(e) => handleManualInputChange(e.target.value)} placeholder={steps[activeStep].placeholder} className="h-auto p-6 text-center text-2xl font-semibold tracking-tight placeholder:text-slate-400 placeholder:font-normal" onKeyPress={(e) => {
                            if (e.key === 'Enter') { if (activeStep === steps.length - 1) addCard(); else handleManualStepChange('next'); }
                          }}/>
                        )}
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => handleManualStepChange('prev')} disabled={activeStep === 0}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
                            {activeStep === steps.length - 1 ? (<Button onClick={addCard} disabled={!currentCard.term?.trim()}><Plus className="h-4 w-4 mr-2" />Add Card</Button>) : (<Button onClick={() => handleManualStepChange('next')}>Next<ArrowRight className="h-4 w-4 ml-2" /></Button>)}
                        </div>
                    </div>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="pt-6">
                <div
                  className={`relative flex flex-col items-center justify-center space-y-4 text-center border-2 border-dashed rounded-xl p-8 transition-colors duration-200 ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 bg-white'}`}
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                  onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]); }}
                >
                  <CloudUpload className="h-12 w-12 text-primary mb-2" />
                  <h3 className="text-lg font-semibold">Drag & drop or select a file</h3>
                  <p className="text-sm text-muted-foreground mb-2">Supports .txt, .csv, .ppt, .pptx, and .pdf files.</p>
                  <input type="file" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="hidden" accept=".txt,.csv,.ppt,.pptx,.pdf" />
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />{selectedFile ? `Selected: ${selectedFile.name}` : 'Choose File'}
                  </Button>
                  <Button onClick={handleFileUpload} disabled={!selectedFile || uploadStatus !== 'idle'} className="w-full">
                    {uploadStatus !== 'idle' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Create Cards
                  </Button>
                  {uploadStatus !== 'idle' && (
                    <Alert className="mt-4 w-full">
                      <AlertDescription className="flex items-center justify-center">
                        {uploadStatus === 'uploading' && <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>}
                        {uploadStatus === 'processing' && <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing file...</>}
                        {uploadStatus === 'success' && <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Success! Cards added.</>}
                        {uploadStatus === 'error' && <><AlertCircle className="mr-2 h-4 w-4 text-red-500" /> Error processing file.</>}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="paste" className="pt-6">
                <div className="space-y-4">
                  <p className="text-center text-sm text-muted-foreground mb-2">Paste your text below. Separate terms from solutions with a comma. Put each flashcard on a new line.</p>
                  <Textarea value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder={"Term 1, Solution 1\nTerm 2, Solution 2..."} className="min-h-[180px] font-mono" />
                  <Button onClick={handlePasteConvert} disabled={!pasteText.trim()} className="w-full"><FileText className="mr-2 h-4 w-4" /> Convert Text to Cards</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Your Study Board</h3>
            <Button variant="outline" onClick={addNewGroup}><Plus className="h-4 w-4 mr-2" />Add Group</Button>
          </div>
          {cards.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                    <SortableContext items={concepts} strategy={verticalListSortingStrategy}>
                    {concepts.map(concept => (
                        <ConceptColumn
                            key={concept} concept={concept} cards={groupedCards[concept] || []}
                            removeCard={removeCard} onCardClick={handleCardClick}
                        />
                    ))}
                    </SortableContext>
                    <DragOverlay>
                        {activeCard ? <SortableCardItem card={activeCard} removeCard={()=>{}} onCardClick={()=>{}} isOverlay={true} /> : null}
                    </DragOverlay>
                </DndContext>
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Book className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Your board is empty</h3>
                <p className="mt-1 text-sm text-gray-500">Add a card above to get started.</p>
            </div>
          )}
        </div>
      </main>

      <FlashcardEditModal
        isOpen={!!editingCard}
        card={editingCard}
        onClose={handleCloseModal}
        onSave={handleSaveChanges}
        allConcepts={concepts}
      />
    </div>
  );
};

export default FlashCardCreator;