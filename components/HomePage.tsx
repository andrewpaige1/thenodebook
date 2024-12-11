import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import FlashcardSetActions from "./FlashcardSetActions";
import { cookies } from "next/headers";

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

async function fetchUserFlashcardSets(nickname: string) {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/api/users/${nickname}/flashcard-sets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStore.toString()
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch flashcard sets');
    }

    return response.json() as Promise<FlashcardSet[]>;
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    return [];
  }
}

export default async function UserFlashcardSets() {
  // Get user session
  const session = await getSession();

  // Redirect if not authenticated
  if (!session || !session.user?.nickname) {
    redirect('/api/auth/login');
  }

  const nickname = session.user.nickname;
  const flashcardSets = await fetchUserFlashcardSets(nickname);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Flashcard Sets</h1>

      {flashcardSets.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <Book className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>You have not created any flashcard sets yet.</p>
          <Button className="mt-4" asChild>
            <Link href="/create-flashcards">Create First Set</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => (
            <Card key={set.ID} className="hover:shadow-lg transition-shadow">
              <Link href={`/${nickname}/${set.Title}`}>
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
      )}
    </div>
  );
}