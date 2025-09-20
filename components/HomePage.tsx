'use client';

import { useState, useEffect } from 'react';
import { SetRepository } from '@/repositories/setRepository';
import { fetchAccessToken } from '@/services/authService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import Link from "next/link";
import FlashcardSetActions from "./FlashcardSetActions";
import { useUser } from "@auth0/nextjs-auth0";
import { useRouter } from 'next/navigation';
import { FlashcardSet } from '@/types';

export default function UserFlashcardSets() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (isLoading) return;   // Wait until done loading
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Fetch flashcard sets when user is authenticated
    const doAddAndFetch = async () => {
      try {
        const repo = new SetRepository();
        const token = await fetchAccessToken();
        const sets = await repo.getAll(user.nickname ?? '', token);
      //  const flashcardRepo = new FlashcardRepository()

        /*for (const set of sets) {
            const flashcards = await flashcardRepo.getAll(set.PublicID, token)
            set.Flashcards = flashcards;
        }*/
        setFlashcardSets(sets);
      } catch {
        setFlashcardSets([]);
      } finally {
        setIsLoadingData(false);
      }
    };
  
    doAddAndFetch();
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
          <Link href="/sets/new">Create First Set</Link>
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
              <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-0">
                <CardTitle>{set.Title}</CardTitle>
                <FlashcardSetActions 
                nickname={user?.nickname} 
                setName={set.Title}       
                setID={set.PublicID}  
                onSetDeleted={() => {
                  setFlashcardSets(prevSets => prevSets.filter(s => s.ID !== set.ID));
                }}/>
              </CardHeader>
              <Link href={`/sets/${set.PublicID}`}>
              <CardContent className="p-4 pt-2">
                <div className="text-sm text-muted-foreground mb-2">
                  {set.Flashcards.length} Cards
                  {set.IsPublic ? (
                    <span className="ml-2 px-2 py-1x rounded-full text-xs">
                      Public
                    </span>
                  ) : (
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      Private
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