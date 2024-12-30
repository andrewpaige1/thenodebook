"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
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

interface FlashcardSetActionsProps {
  nickname: string | null | undefined;
  setName: string;
  onSetDeleted: () => void;
}

export default function FlashcardSetActions({ nickname, setName, onSetDeleted }: FlashcardSetActionsProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/${nickname}/${setName}/updateSet`);
  };

  const handleDelete = async () => {
    const requestData = {
      nickname: nickname,
      setName: setName
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/deleteSet`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (response.ok) {
        onSetDeleted(); // Call the callback to refresh the parent's data
      } else {
        console.error('Failed to delete set:', data);
      }
    } catch (error) {
      console.error('Error deleting set:', error);
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
              flashcard set "{setName}".
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