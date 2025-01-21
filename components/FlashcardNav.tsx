import Link from 'next/link'
import { Book, Network, Pencil } from 'lucide-react'

export default function SecondaryNav({ 
  user, 
  setName 
}: { 
  user: string 
  setName: string 
}) {
  const flashcardsPath = user ? `/${user}/${setName}` : '#'
  const mindMapPath = user ? `/${user}/${setName}/mindmaps` : '#'
  const quizPath = user ? `/${user}/${setName}/quiz` : '#'

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-center">
          <div className="flex items-center space-x-8">
            <Link 
              href={flashcardsPath}
              className={`flex items-center space-x-2 py-3 border-b-2 transition-colors ${
                !window.location.pathname.includes('mindmap') && !window.location.pathname.includes('quiz')
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              <Book className="w-4 h-4" />
              <span className="font-medium">Flashcards</span>
            </Link>
            <Link 
              href={mindMapPath}
              className={`flex items-center space-x-2 py-3 border-b-2 transition-colors ${
                window.location.pathname.includes('mindmap') 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              <Network className="w-4 h-4" />
              <span className="font-medium">Mind Maps</span>
            </Link>
            <Link 
              href={quizPath}
              className={`flex items-center space-x-2 py-3 border-b-2 transition-colors ${
                window.location.pathname.includes('quiz') 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              <Pencil className="w-4 h-4" />
              <span className="font-medium">Quiz</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  )
}