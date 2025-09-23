// app/sets/[setID]/layout.tsx

import SecondaryNav from '@/components/FlashcardNav'; // Adjust the import path if needed

export default async function SetLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ setID: string }>;
}) {
  const { setID }= await params 
  return (
    <div>
      {/* The navigation is now part of the persistent layout */}
      <SecondaryNav setID={setID} />

      {/* The page content will be rendered here */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </main>
    </div>
  );
}