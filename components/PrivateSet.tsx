import { Lock } from 'lucide-react';

interface PrivateSetProps {
  isLoggedIn: boolean;
}

export default function PrivateSet({ isLoggedIn }: PrivateSetProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <Lock className="mx-auto h-16 w-16 text-gray-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Private Flashcard Set</h2>
        <p className="text-gray-600 mb-4">
          This flashcard set is private and can only be accessed by its creator.
        </p>
        {!isLoggedIn && (
          <p className="text-sm text-gray-500">
            If this is your set, please log in to view it.
          </p>
        )}
      </div>
    </div>
  );
}