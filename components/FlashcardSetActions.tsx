"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { SetRepository } from '@/repositories/setRepository';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchAccessToken } from "@/services/authService";

interface FlashcardSetActionsProps {
  nickname: string | null | undefined;
  setName: string;
  setID: string
  onSetDeleted: () => void;
}

export default function FlashcardSetActions({ nickname, setName, onSetDeleted, setID }: FlashcardSetActionsProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/sets/${setID}/update`);
  };

  const handleDelete = async () => {
    try {
      const repo = new SetRepository();
      // Use setName as the PublicID for deletion
      // You may need to pass the user's token here if available in parent scope
      const token = await fetchAccessToken();
      await repo.delete(setID, token);
      onSetDeleted();
    } catch (error) {
     // console.error('Error deleting set:', error);
     return error
    }
  };

  if (!nickname) {
    return (
      <div className="flex items-center gap-2">
        <p>Cannot edit flashcard set</p>
      </div>
    );
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
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              flashcard set &ldquo;{setName}&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}