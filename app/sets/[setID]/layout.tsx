// app/sets/[setID]/layout.tsx

import SecondaryNav from '@/components/FlashcardNav'; // Adjust the import path if needed

export default async function SetLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ setID: string }>;
}) {
  const { setID } = await params;
  return (
    // This div becomes a flex container that stacks its children vertically.
    // It assumes a 64px primary header is above it.
    <div className="flex flex-col h-[calc(100vh-64px)]">
      
      {/* The navigation takes its natural height */}
      <SecondaryNav setID={setID} />

      {/* The main content area now grows to fill all remaining space. */}
      {/* We remove the padding and container classes from here. */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}