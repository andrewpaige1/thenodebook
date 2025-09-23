import { SetRepository } from "@/repositories/setRepository";
import { auth0 } from "@/lib/auth0";
import BlocksGame from "./BlocksGame";
import Menu from "@/components/Menu"; // Assuming Menu is in @/components

// Assuming these types are in @/types
import type { FlashcardSet } from '@/types';

export default async function Page({ params }: { params: Promise<{ setID: string }> }) {
  const { setID } = await params;
  const setRepo = new SetRepository();
  
  const { token } = await auth0.getAccessToken();
  const setWithFlashcards: FlashcardSet = await setRepo.getByID(setID, token);

  return (
    <div>
      <Menu />
      {/*<SecondaryNav setID={setID} />*/}
      
      <main className="container mx-auto px-4 py-8">
        {/* The BlocksGame component is now wrapped in the main layout */}
        <BlocksGame set={setWithFlashcards} />
      </main>
    </div>
  );
}