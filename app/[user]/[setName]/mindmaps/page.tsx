"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Network,
  Plus,
  XCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Menu from "@/components/Menu";
import SecondaryNav from "@/components/FlashcardNav";

interface MindMap {
  ID: number;
  Title: string;
}

interface Flashcard {
  ID: number;
  Term: string;
  Solution: string;
  Concept: string;
}

interface FlashcardSet {
  ID: number;
  Title: string;
  IsPublic: boolean;
  Flashcards: Flashcard[];
}

export default function MindMapList({
  params
}: {
  params: Promise<{ user: string; setName: string }>
}) {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Deletion states
  const [mindMapToDelete, setMindMapToDelete] = useState<MindMap | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Creation states
  const [newMapTitle, setNewMapTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  const [resolvedParams, setResolvedParams] = useState<{ user: string; setName: string } | null>(null);

  // Resolve params from the promise
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch existing mind maps
  useEffect(() => {
    async function fetchMindMaps() {
      if (!resolvedParams) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/app/${resolvedParams.user}/${resolvedParams.setName}/mindmaps`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch mind maps');
        }

        const data = await response.json();
        setMindMaps(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load mind maps');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMindMaps();
  }, [resolvedParams]);

  const handleCreateMap = async () => {
    if (!resolvedParams) return;
    if (!newMapTitle.trim()) return;

    setTitleError(null);

    // 1) Check for duplicate mind map title
    const checkData = {
      title: newMapTitle.trim(),
      nickname: resolvedParams.user,
      setName: resolvedParams.setName,
    };

    try {
      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/app/mindmap/checkDup`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(checkData),
        }
      );

      const checkResData = await checkResponse.json();

      if (!checkResponse.ok) {
        if (checkResponse.status === 409) {
          setTitleError('A mind map with this title already exists');
          return;
        }
        throw new Error(checkResData.message || 'Failed to create mind map');
      }
    } catch (error) {
      console.error('Error:', error);
      setTitleError('Failed to create mind map (duplicate check).');
      return;
    }

    // 2) Fetch the flashcard set to get flashcards
    let setData: FlashcardSet;
    try {
      const setResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/app/users/${resolvedParams.user}/sets/${encodeURIComponent(
          resolvedParams.setName
        )}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!setResponse.ok) {
        if (setResponse.status === 403) {
          setTitleError('Cannot create a mind map for a private set you do not own.');
          return;
        } else {
          setTitleError('Failed to fetch the flashcard set');
          return;
        }
      }

      setData = await setResponse.json();
    } catch (err) {
      console.error('Error fetching flashcard set:', err);
      setTitleError('Failed to fetch the flashcard set');
      return;
    }

    // 3) Generate simple node layouts for each flashcard
    const flashcards = setData.Flashcards || [];
    const totalNodes = flashcards.length;
    const startX = window.innerWidth / 2 - 100; // Center horizontally
    const startY = window.innerHeight / 2 - (totalNodes * 150) / 2; // Center vertically based on the total number of nodes
    // E.g., place them in a vertical column
    // In real usage, you might let the user place them or randomize
    const nodeLayouts = flashcards.map((fc, i) => ({
      flashcardID: fc.ID,
      MindMapID: 0, // The backend can fill this
      xPosition: startX, // Same horizontal alignment for all nodes
      yPosition: startY + i * 150, // Vertical spacing
    }));

    // 4) Create the new mind map via API
    const createPayload = {
      title: newMapTitle.trim(),
      nickname: resolvedParams.user,
      setID: setData.ID,
      isPublic: setData.IsPublic, // reuse the set's visibility
      connections: [],
      nodeLayouts,
    };

    try {
      const createResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/app/mindmap/create`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createPayload),
        }
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create mind map');
      }

      // 5) If creation is successful, navigate to the new mind map
      router.push(
        `/${resolvedParams.user}/${resolvedParams.setName}/${encodeURIComponent(newMapTitle)}/mindmap`
      );
    } catch (error) {
      console.error('Error creating mind map:', error);
      setTitleError('Failed to create mind map');
    }
  };

  // Handle mind map deletion
  const handleDeleteMap = async (mindMap: MindMap) => {
    if (!resolvedParams) return;
    setDeleteError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/app/mindmap/delete`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: mindMap.ID.toString(),
            nickname: resolvedParams.user,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete mind map');
      }

      // Update the local state to remove the deleted mind map
      setMindMaps(mindMaps.filter(map => map.ID !== mindMap.ID));
      setShowDeleteDialog(false);
      setMindMapToDelete(null);
    } catch (error) {
      console.error('Error:', error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Unable to delete the mind map. Please try again later.'
      );
    }
  };

  // Loading state
  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
          <p className="mt-4 text-lg">Loading mind maps...</p>
        </div>
      </div>
    );
  }

  // Error state (fetching mind maps)
  if (error) {
    return (
      <div className="min-h-screen">
        <Menu />
        {resolvedParams && (
          <SecondaryNav user={resolvedParams.user} setName={resolvedParams.setName} />
        )}
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="w-96 p-6">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-center">Error</h2>
            <p className="text-gray-600 text-center">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  // Normal rendering
  return (
    <div className="min-h-screen">
      <Menu />
      {resolvedParams && (
        <SecondaryNav user={resolvedParams.user} setName={resolvedParams.setName} />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header row: title + create button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Mind Maps</h2>
            <Button
              onClick={() => {
                setShowModal(true);
                setTitleError(null);
                setNewMapTitle("");
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create Mind Map
            </Button>
          </div>

          {/* If no mind maps exist yet */}
          {mindMaps.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center bg-white border rounded-md">
              <div className="p-6 text-center">
                <Network className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Mind Maps Yet</h2>
                <p className="text-gray-600">
                  Create your first mind map to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {mindMaps.map((map) => (
                <Card
                  key={map.ID}
                  className="hover:shadow-lg transition-shadow"
                >
                  {resolvedParams && (
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <button
                          className="flex-1 text-left"
                          onClick={() =>
                            router.push(
                              `/${resolvedParams.user}/${resolvedParams.setName}/${encodeURIComponent(
                                map.Title
                              )}/mindmap`
                            )
                          }
                        >
                          <div className="flex items-center gap-3">
                            <Network className="h-5 w-5 text-blue-500" />
                            <h3 className="font-semibold text-gray-900">
                              {map.Title}
                            </h3>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setMindMapToDelete(map);
                            setDeleteError(null);
                            setShowDeleteDialog(true);
                          }}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          aria-label={`Delete mind map ${map.Title}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Create Mind Map Dialog */}
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Mind Map</DialogTitle>
                <DialogDescription>
                  Enter a title for your new mind map
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    value={newMapTitle}
                    onChange={(e) => setNewMapTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateMap()}
                    placeholder="Mind Map Title"
                    className={`w-full ${titleError ? 'border-red-500' : ''}`}
                    autoFocus
                  />
                  {titleError && (
                    <p className="text-sm text-red-500 mt-1">{titleError}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreateMap}>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={(open) => {
              setShowDeleteDialog(open);
              if (!open) {
                setDeleteError(null);
                setMindMapToDelete(null);
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {deleteError ? 'Error Deleting Mind Map' : 'Are you sure?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteError ? (
                    <div className="text-red-500">{deleteError}</div>
                  ) : (
                    `This will permanently delete the mind map "${mindMapToDelete?.Title}". This action cannot be undone.`
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setMindMapToDelete(null);
                    setDeleteError(null);
                  }}
                >
                  {deleteError ? 'Close' : 'Cancel'}
                </AlertDialogCancel>
                {!deleteError && (
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => {
                      if (mindMapToDelete) {
                        handleDeleteMap(mindMapToDelete);
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
