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
    <div className="flex flex-col flex-1 min-h-0">
      <SecondaryNav setID={setID} />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}