"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Book, Upload, FileText, Lightbulb, Tag, ArrowLeft, ArrowRight, Trash2, Send, Globe2, Lock, CloudUpload, GripVertical, Loader2, AlertCircle, CheckCircle, ChevronsUpDown } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
import {UploadFlashcardRepository} from '@/repositories/uploadFlashcardRepository'

// --- Interfaces & Types ---
interface FlashCard {
  id: string;
  term: string;
  solution: string;
  concept: string;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';
const UNCATEGORIZED_GROUP = "Uncategorized";

// --- Re-usable Click-to-Edit Field Component (Unchanged) ---
const EditableField = ({ 
  value, 
  onSave, 
  icon: FieldIcon,
  placeholder = "Click to add...",
  className = "" 
}: { 
  value: string;
  onSave: (newValue: string) => void;
  icon: React.ElementType;
  placeholder?: string;
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);
  
  const handleSave = () => {
    if (tempValue.trim() !== value.trim()) {
      onSave(tempValue);
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <FieldIcon className="h-4 w-4 text-primary flex-shrink-0" />
        <Input ref={inputRef} value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className="h-8" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 group/field cursor-text p-1 rounded-md hover:bg-muted ${className}`} onClick={() => setIsEditing(true)}>
      <FieldIcon className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="flex-1 truncate">{value || <span className="text-muted-foreground italic">{placeholder}</span>}</span>
    </div>
  );
};

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
    .slice(0, 5); // Limit to 5 suggestions

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
        setShowSuggestions(false);
        setSelectedIndex(-1);
      } else if (value.trim()) {
        onChange(value.trim());
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
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
        onBlur={() => {
          // Delay hiding suggestions to allow clicks
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && (value.length > 0) && (filteredConcepts.length > 0 || isNewConcept) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredConcepts.map((concept, index) => (
            <div
              key={concept}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
                index === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(concept)}
            >
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>{concept}</span>
            </div>
          ))}
          {isNewConcept && (
            <div
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-primary border-t ${
                selectedIndex === filteredConcepts.length ? 'bg-primary/10' : 'hover:bg-primary/5'
              }`}
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
            <Plus className="h-3 w-3" />
            New
          </div>
        </div>
      )}
    </div>
  );
};

// --- Re-usable Concept Combobox Component ---
const ConceptCombobox = ({
  value,
  onChange,
  concepts,
  className = ""
}: {
  value: string;
  onChange: (newValue: string) => void;
  concepts: string[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Support fast add via Enter key
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredConcepts = concepts.filter(c => c !== UNCATEGORIZED_GROUP);
  const showCreateOption = inputValue && !concepts.some(c => c.toLowerCase() === inputValue.toLowerCase());

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showCreateOption) {
        handleSelect(inputValue);
      } else if (inputValue && filteredConcepts.includes(inputValue)) {
        handleSelect(inputValue);
      } else if (filteredConcepts.length > 0 && !inputValue) {
        handleSelect(filteredConcepts[0]);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between font-normal ${className}`}
        >
          <span className="truncate">
            {value || <span className="text-muted-foreground">Select concept...</span>}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            ref={inputRef}
            placeholder="Search or create new..." 
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {showCreateOption ? ' ' : 'No concept found.'}
            </CommandEmpty>
            <CommandGroup>
              {filteredConcepts.map((concept) => (
                <CommandItem key={concept} value={concept} onSelect={() => handleSelect(concept)}>
                  <CheckCircle className={`mr-2 h-4 w-4 ${value === concept ? "opacity-100" : "opacity-0"}`} />
                  {concept}
                </CommandItem>
              ))}
              {showCreateOption && (
                 <CommandItem
                    value={inputValue}
                    onSelect={() => handleSelect(inputValue)}
                    className="text-primary hover:!bg-primary/10"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create &quot;{inputValue}&quot;
                  </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};


// --- Editable Field specifically for Concepts ---
const EditableConceptField = ({ 
  value, 
  onSave, 
  concepts 
}: { 
  value: string;
  onSave: (newValue: string) => void;
  concepts: string[];
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing) {
    return (
        <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary flex-shrink-0" />
            <ConceptCombobox 
              value={value} 
              onChange={(val) => {
                onSave(val);
                setIsEditing(false);
              }} 
              concepts={concepts}
            />
        </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group/field cursor-text p-1 rounded-md hover:bg-muted text-sm" onClick={() => setIsEditing(true)}>
      <Tag className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="flex-1 truncate">{value || <span className="text-muted-foreground italic">Add concept...</span>}</span>
    </div>
  );
};


// --- Draggable Card Item Component ---
const SortableCardItem = ({ card, updateCardField, removeCard, allConcepts }: { card: FlashCard; updateCardField: Function; removeCard: Function; allConcepts: string[] }) => {
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
  };
  
  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="h-[128px] bg-muted rounded-lg border-2 border-dashed" />;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <Card className="group relative hover:shadow-lg transition-shadow touch-manipulation cursor-grab">
          <Button size="icon" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => removeCard(card.id)} aria-label="Delete card"><Trash2 className="h-4 w-4" /></Button>
          <div className="absolute top-2 left-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-label="Drag to reorder"><GripVertical className="h-4 w-4 text-muted-foreground" /></div>
          <CardContent className="p-4 space-y-2">
            <EditableField value={card.term} onSave={(val) => updateCardField(card.id, 'term', val)} icon={Book} className="font-medium" placeholder="Enter term..." />
            <EditableField value={card.solution} onSave={(val) => updateCardField(card.id, 'solution', val)} icon={Lightbulb} placeholder="Enter solution..." />
            <EditableConceptField 
              value={card.concept} 
              onSave={(val) => updateCardField(card.id, 'concept', val)} 
              concepts={allConcepts} 
            />
          </CardContent>
        </Card>
    </div>
  );
};

// --- Concept Column Component ---
const ConceptColumn = ({ concept, cards, updateCardField, removeCard, allConcepts }: { concept: string, cards: FlashCard[], updateCardField: Function, removeCard: Function, allConcepts: string[] }) => {
  const { setNodeRef } = useSortable({ id: `column-${concept}`, data: { type: "column", concept } });
  
  return (
    <div ref={setNodeRef} className="w-full md:w-[350px] flex-shrink-0">
      <div className="bg-muted p-3 rounded-t-lg">
        <h3 className="font-semibold text-center">{concept} ({cards.length})</h3>
      </div>
      <div className="bg-gray-100 p-2 rounded-b-lg h-full space-y-3">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <SortableCardItem key={card.id} card={card} updateCardField={updateCardField} removeCard={removeCard} allConcepts={allConcepts} />
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

  // Drag-and-drop state for file upload
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const steps = [
    { name: 'Term', key: 'term', icon: Book, placeholder: 'e.g., Photosynthesis' },
    { name: 'Solution', key: 'solution', icon: Lightbulb, placeholder: 'The process by which green plants use sunlight...' },
    { name: 'Concept', key: 'concept', icon: Tag, placeholder: 'e.g., Biology' }
  ];

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

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

// Update concepts whenever cards change - Fixed version
useEffect(() => {
  const allConceptsInUse = new Set([
    ...cards.map(c => c.concept || UNCATEGORIZED_GROUP),
    UNCATEGORIZED_GROUP
  ]);
  const newConcepts = Array.from(allConceptsInUse);
  
  // Only update if concepts actually changed
  const conceptsChanged = newConcepts.length !== concepts.length || 
    newConcepts.some(concept => !concepts.includes(concept));
    
  if (conceptsChanged) {
    setConcepts(newConcepts);
  }
}, [cards, concepts]); // Add concepts as dependency

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
  };
  
  const addNewGroup = () => {
      const newGroupName = prompt("Enter new group name:");
      if (newGroupName && !concepts.includes(newGroupName)) {
          setConcepts(prev => [...prev, newGroupName]);
      }
  };

  // --- Placeholder Function Definitions ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = await fetchAccessToken();
      if (!token) throw new Error('No access token');
      const setRepo = new SetRepository();
      const flashcardRepo = new FlashcardRepository();
      // Create the set
      const setPayload = {
        Title: setName,
        IsPublic: isPublic,
      };
      const createdSet = await setRepo.create(setPayload, token);
      if (!createdSet || !createdSet.ID) throw new Error('Failed to create set');
      // Create flashcards for the set
      for (const card of cards) {
        const cardPayload = {
          Term: card.term,
          Solution: card.solution,
          Concept: card.concept,
        };
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
      const result = await uploadRepo.upload(selectedFile);
      if (!result || !result.cards) throw new Error('Upload failed');
      // Map API response to local FlashCard type
      const newCards = result.cards.map(card => ({
        id: String(card.id),
        term: card.term,
        solution: card.solution,
        concept: card.concept || '',
      }));
      setCards(prev => [...newCards, ...prev]);
      // Update concepts to include all unique concepts from cards
      const allConcepts = [UNCATEGORIZED_GROUP, ...Array.from(new Set([
        ...concepts.filter(c => c !== UNCATEGORIZED_GROUP),
        ...newCards.map(card => card.concept).filter(Boolean)
      ]))];
      setConcepts(allConcepts);
      setUploadStatus('success');
    } catch {
      setUploadStatus('error');
      return;
    }
    setSelectedFile(null);
    setTimeout(() => setUploadStatus('idle'), 3000);
  };
  
  const handlePasteConvert = () => { 
    // Add logic to parse `pasteText` and create cards.
    // Example: splitting by line, then by comma.
    const lines = pasteText.split('\n').filter(line => line.trim() !== '');
    const newCards: FlashCard[] = lines.map(line => {
      const parts = line.split(',');
      return {
        id: uuidv4(),
        term: parts[0]?.trim() || '',
        solution: parts[1]?.trim() || '',
        concept: 'Pasted'
      };
    }).filter(card => card.term);
    
    setCards(prev => [...newCards, ...prev]);
    if (!concepts.includes('Pasted')) setConcepts(prev => [...prev, 'Pasted']);
    setPasteText('');
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (event: DragStartEvent) => {
     if (event.active.data.current?.type === "card") {
        setActiveCard(event.active.data.current.card);
     }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === "card";
    const isOverACard = over.data.current?.type === "card";
    const isOverAColumn = over.data.current?.type === "column";

    if (isActiveACard && isOverACard) {
      const activeCard = cards.find(c => c.id === activeId);
      const overCard = cards.find(c => c.id === overId);
      if (activeCard && overCard && (activeCard.concept || UNCATEGORIZED_GROUP) === (overCard.concept || UNCATEGORIZED_GROUP)) {
        setCards(items => {
          const oldIndex = items.findIndex(item => item.id === activeId);
          const newIndex = items.findIndex(item => item.id === overId);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
    
    if (isActiveACard && (isOverAColumn || isOverACard)) {
      const activeCard = cards.find(c => c.id === activeId);
      let newConcept = "";
      if (isOverAColumn) newConcept = over.data.current?.concept;
      else if (isOverACard) newConcept = cards.find(c => c.id === overId)?.concept || UNCATEGORIZED_GROUP;
      if (activeCard && (activeCard.concept || UNCATEGORIZED_GROUP) !== newConcept) {
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
                          <SmartConceptInput 
                            value={currentManualValue}
                            onChange={handleManualInputChange}
                            concepts={concepts}
                            placeholder={steps[activeStep].placeholder}
                            className="h-auto p-6 text-center text-2xl font-semibold tracking-tight placeholder:text-slate-400 placeholder:font-normal"
                            onEnter={addCard}
                          />
                        ) : (
                          <Input value={currentManualValue} onChange={(e) => handleManualInputChange(e.target.value)} placeholder={steps[activeStep].placeholder} className="h-auto p-6 text-center text-2xl font-semibold tracking-tight placeholder:text-slate-400 placeholder:font-normal" onKeyPress={(e) => { if (e.key === 'Enter') { activeStep === steps.length - 1 ? addCard() : handleManualStepChange('next'); }}}/>
                        )}
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => handleManualStepChange('prev')} disabled={activeStep === 0}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
                            {activeStep === steps.length - 1 ? (<Button onClick={addCard} disabled={!currentCard.term?.trim()}><Plus className="h-4 w-4 mr-2" />Add Card</Button>) : (<Button onClick={() => handleManualStepChange('next')}>Next<ArrowRight className="h-4 w-4 ml-2" /></Button>)}
                        </div>
                    </div>
                </div>
              </TabsContent>

              {/* --- MODIFIED: Fully functional Upload Tab --- */}
              <TabsContent value="upload" className="pt-6">
                <div
                  className={`relative flex flex-col items-center justify-center space-y-4 text-center border-2 border-dashed rounded-xl p-8 transition-colors duration-200 ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 bg-white'}`}
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                  onDrop={e => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setSelectedFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <CloudUpload className="h-12 w-12 text-primary mb-2" />
                  <h3 className="text-lg font-semibold">Drag & drop or select a file</h3>
                  <p className="text-sm text-muted-foreground mb-2">Supports .txt, .csv, .ppt, .pptx, and .pdf files.</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                    accept=".txt,.csv,.ppt,.pptx,.pdf"
                  />
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose File'}
                  </Button>
                  <Button onClick={handleFileUpload} disabled={!selectedFile || uploadStatus !== 'idle'} className="w-full">
                    {uploadStatus === 'uploading' || uploadStatus === 'processing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Create Cards
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
                  <p className="text-center text-sm text-muted-foreground mb-2">
                    Paste your text below. Separate terms from solutions with a comma. Put each flashcard on a new line.
                  </p>
                  <Textarea
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    placeholder={"Term 1, Solution 1\nTerm 2, Solution 2..."}
                    className="min-h-[180px] font-mono border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-base"
                  />
                  <Button onClick={handlePasteConvert} disabled={!pasteText.trim()} className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Convert Text to Cards
                  </Button>
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
                            key={concept}
                            concept={concept}
                            cards={groupedCards[concept] || []}
                            updateCardField={updateCardField}
                            removeCard={removeCard}
                            allConcepts={concepts}
                        />
                    ))}
                    </SortableContext>
                    <DragOverlay>
                        {activeCard ? <SortableCardItem card={activeCard} updateCardField={()=>{}} removeCard={()=>{}} allConcepts={concepts} /> : null}
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
    </div>
  );
};

export default FlashCardCreator;