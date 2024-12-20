"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function FlashcardSetActions({ nickname, setName }: { nickname: string | null | undefined, setName: string }) {
  
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/${nickname}/${setName}/updateSet`);
  };

  if(!nickname) {
    return (
      <div className="flex items-center gap-2">
        <p>Caannot edit flashcard set</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={handleClick}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant="ghost" 
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}