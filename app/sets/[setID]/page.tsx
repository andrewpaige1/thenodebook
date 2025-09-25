import { auth0 } from '@/lib/auth0'; // Server-side session helper
import { SetRepository } from '@/repositories/setRepository';

// Import the new components
import FlashcardViewer from '@/components/FlashcardViewer';
import PrivateSet from '@/components/PrivateSet';

// This is now an async Server Component
export default async function FlashcardPage({ 
  params }: {
    params: Promise<{ setID: string }>
}) {
  const { setID } = await params;
  const session = await auth0.getSession();
  const user = session?.user;

  try {
    const repo = new SetRepository();
    
    // Note: Server-side token fetching might differ slightly.
    // This assumes fetchAccessToken can be adapted for server use.
    const { token } = await auth0.getAccessToken()
    const flashcardSet = await repo.getByID(setID, token);

    // Authorization check is now on the server
    if (!flashcardSet.IsOwner) {
      return <PrivateSet isLoggedIn={!!user} />;
    }

    // If everything is okay, render the Client Component with data
    return <FlashcardViewer flashcardSet={flashcardSet} />;

  } catch (error) {
    // Next.js will catch this error and show the error.tsx boundary
    console.error("Failed to fetch flashcard set:", error);
    throw new Error('Could not load the flashcard set. Please try again later.');
  }
}