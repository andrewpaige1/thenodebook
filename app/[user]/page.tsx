"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Clock, Bookmark, Share2, Check } from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import Menu from "@/components/Menu";
import { useToast } from "@/hooks/use-toast"

interface Flashcard {
  ID: number;
  Term: string;
  Solution: string;
  Concept: string;
  Difficulty: number;
  TimesReviewed: number;
  LastReviewed: string | null;
  Mastered: boolean;
}

interface FlashcardSet {
  ID: number;
  Title: string;
  IsPublic: boolean;
  Flashcards: Flashcard[];
  CreatedAt: string;
  LastStudied: string | null;
}

const ProfileFlashcardSets = () => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSets = async () => {
      if (!user?.nickname) return;
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/users/${user.nickname}/flashcard-sets`, {
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch sets');
        
        const data = await response.json();
        setSets(data);
      } catch (error) {
        console.error('Error fetching sets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSets();
  }, [user]);

  const handleCopyLink = async () => {
    if (!user?.nickname) return;
    
    const shareUrl = `${window.location.origin}/${user.nickname}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast({
        description: "Link copied to clipboard!",
        duration: 2000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy link",
        duration: 2000,
      });
      return err
    }
  };

  if (isLoading) {
    return (
      <div>
        <Menu />
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Loading your flashcard sets...</p>
        </div>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div>
        <Menu />
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <Book className="w-12 h-12 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No flashcard sets found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Menu />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Study Sets</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {sets.length} Sets
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {sets.reduce((acc, set) => acc + set.Flashcards.length, 0)} Cards
              </span>
            </div>
          </div>
        </div>

        <div 
          className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={handleCopyLink}
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Share2 className="w-4 h-4 text-blue-500" />
          )}
          <p className="text-sm text-blue-600">
          Share this link to show people what you&apos;re studying!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => (
            <Card key={set.ID} className="hover:shadow-lg transition-all duration-200">
              <Link href={`/${user?.nickname}/${set.Title}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold truncate">
                      {set.Title}
                    </CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      set.IsPublic 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {set.IsPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{set.Flashcards.length} cards</span>
                      <span>•</span>
                      <span>Created {new Date(set.CreatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {set.Flashcards.slice(0, 3).map((card) => (
                        <div 
                          key={card.ID}
                          className="p-2 bg-gray-50 rounded-md text-sm truncate"
                        >
                          {card.Term}
                        </div>
                      ))}
                      {set.Flashcards.length > 3 && (
                        <p className="text-xs text-center text-muted-foreground pt-1">
                          + {set.Flashcards.length - 3} more cards
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {set.LastStudied 
                            ? `Last studied ${new Date(set.LastStudied).toLocaleDateString()}`
                            : 'Not studied yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileFlashcardSets;