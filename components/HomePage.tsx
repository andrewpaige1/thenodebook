'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import Link from "next/link";
import FlashcardSetActions from "./FlashcardSetActions";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from 'next/navigation';

interface FlashcardSet {
  ID: number;
  Title: string;
  IsPublic: boolean;
  Flashcards: {
    ID: number;
    Term: string;
    Solution: string;
    Concept: string;
  }[];
  CreatedAt: string;
  LastStudied: string | null;
}

export default function UserFlashcardSets() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push('/api/auth/login');
      return;
    }

    // Fetch flashcard sets when user is authenticated
    async function fetchUserFlashcardSets() {
      if (!user?.nickname) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/users/${user.nickname}/flashcard-sets`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flashcard sets');
        }

        const data: FlashcardSet[] = await response.json();
        setFlashcardSets(data);
      } catch (error) {
        console.error('Error fetching flashcard sets:', error);
        setFlashcardSets([]);
      } finally {
        setIsLoadingData(false);
      }
    }

    if (user) {
      fetchUserFlashcardSets();
    }
  }, [user, isLoading, router]);

  // Loading state
  if (isLoading || isLoadingData) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Loading your flashcard sets...</p>
      </div>
    );
  }

  // No flashcard sets
  if (flashcardSets.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6 text-center text-muted-foreground py-12">
        <Book className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>You have not created any flashcard sets yet.</p>
        <Button className="mt-4" asChild>
          <Link href="/create-set">Create First Set</Link>
        </Button>
      </div>
    );
  }

  // Render flashcard sets
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Flashcard Sets</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcardSets.map((set) => (
          <Card key={set.ID} className="hover:shadow-lg transition-shadow">
            <Link href={`/${user?.nickname}/${set.Title}`}>
              <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-0">
                <CardTitle>{set.Title}</CardTitle>
                <FlashcardSetActions setId={set.ID} />
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-sm text-muted-foreground mb-2">
                  {set.Flashcards.length} Cards
                  {set.IsPublic ? (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Public
                    </span>
                  ) : (
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      Public
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {set.Flashcards.slice(0, 3).map((card) => (
                    <div 
                      key={card.ID} 
                      className="text-sm border-b last:border-b-0 py-1 truncate"
                    >
                      {card.Term}
                    </div>
                  ))}
                  {set.Flashcards.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      + {set.Flashcards.length - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}