"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

export default function FlashcardSetActions({ setId }: { setId: number }) {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    // Add edit functionality
    console.log(`Editing set ${setId}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    // Add delete functionality
    console.log(`Deleting set ${setId}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={handleEdit}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}