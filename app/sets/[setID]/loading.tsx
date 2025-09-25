import { BookOpen } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <BookOpen className="mx-auto h-16 w-16 text-gray-400 animate-pulse" />
        <p className="mt-4 text-xl text-gray-600">Loading flashcards...</p>
      </div>
    </div>
  );
}