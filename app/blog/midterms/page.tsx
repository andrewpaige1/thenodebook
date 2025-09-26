
export default function BlogPost() {
  return (
  <article className="max-w-4xl mx-auto px-6 py-12 bg-white rounded-xl shadow-2xl prose prose-xl dark:prose-invert">
      {/* Header Section */}
      <header className="mb-8 border-b pb-6">
  <h1 className="text-4xl font-bold mb-2">Beyond Flashcards: How to Truly Learn for Midterms</h1>
        <p className="text-gray-500 text-sm"><span>September 26, 2025</span></p>
      </header>

  {/* Cover Image */}
  <img src="/midterm.svg" alt="Midterm Study" className="w-full rounded-md mb-8 object-cover" />

      {/* Blog Content */}
      <section>
        <p className="text-lg text-gray-700 mb-6">
          With 

        </p>

        <h2>Why Memorization Alone Falls Short</h2>
        <p className="mb-6">Write about why memorizing facts is not enough for deep understanding or long-term retention.</p>

        <h2>The Power of Connecting Concepts</h2>
        <p className="mb-6">Discuss how relating and synthesizing ideas leads to expertise and better exam performance.</p>

        <h2>Practical Strategies for Building Connections</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Use mind maps to visualize relationships</li>
          <li>Make analogies between topics</li>
          <li>Teach concepts to others</li>
        </ul>

        <h2>Real-World Examples: How Experts Think</h2>
        <p className="mb-6">Share examples of how experts in different fields connect ideas to solve problems.</p>

        <h2>Actionable Tips for Your Next Midterm</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Review your notes and look for patterns</li>
          <li>Ask yourself how concepts relate to each other</li>
          <li>Practice explaining connections out loud</li>
        </ul>
      </section>

      {/* Footer Section */}
      <footer className="mt-10 pt-6 border-t text-xs text-gray-400">
        <p>Share this post &middot; <a href="#" className="underline">Twitter</a> | <a href="#" className="underline">LinkedIn</a></p>
      </footer>
    </article>
  );
}
