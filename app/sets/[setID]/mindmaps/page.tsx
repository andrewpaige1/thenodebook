"use client";

import React, { useState, useEffect } from 'react';
import { MindMapRepository } from '@/repositories/mindMapRepository';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';
import { useUser } from "@auth0/nextjs-auth0";
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
import { Switch } from "@/components/ui/switch";
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
import { fetchAccessToken } from '@/services/authService';
import { FlashcardRepository } from '@/repositories/flashcardRepository';

interface MindMap {
  ID: number;
  Title: string;
  PublicID: string
}

export default function MindMapList({
  params
}: {
  params: Promise<{ user: string; setName: string; setID: string }>
}) {
  const router = useRouter();
  const { isLoading: isUserLoading } = useUser();
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
  const [isPublic, setIsPublic] = useState(true);

  const [resolvedParams, setResolvedParams] = useState<{ user: string; setName: string; setID: string} | null>(null);

  // Resolve params from the promise
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch existing mind maps
  useEffect(() => {
    async function fetchMindMaps() {
      if (!resolvedParams) return;
      setIsLoading(true);
      try {
        const token = await fetchAccessToken();
        const repo = new MindMapRepository();
        // setID from resolvedParams is a string, convert to number
  const setID = resolvedParams.setID;
  const data = await repo.getAllForSet(setID, token);
        setMindMaps(data);
      } catch (error) {
        //console.error('Error:', error);
        setError('Failed to load mind maps');
        return error
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
    try {
      const token = await getAccessToken();
      const repo = new MindMapRepository();
      const setID = resolvedParams.setID;
      const flashcardRepo = new FlashcardRepository()
      // Assume you have access to the flashcards for this set
      // If not, you may need to fetch them before creating the mind map
     const flashcards = await flashcardRepo.getAll(setID, token); 

      // Spread cards vertically from the top with equal spacing
      const startX = 200;
      const startY = 100;
      const spacing = 120; // px between cards vertically
      const nodeLayouts = flashcards.map((card, i) => ({
        FlashcardID: card.ID,
        XPosition: startX,
        YPosition: startY + i * spacing,
        Data: card.Term
      }));
      const createPayload = {
        Title: newMapTitle.trim(),
        IsPublic: isPublic,
        Connections: [],
        NodeLayouts: [], // Don't send node layouts on create
      };
      const createdMap = await repo.create(setID, createPayload, token);
      // After creation, update node layouts for the new mind map
      await repo.updateLayouts(setID, createdMap.PublicID, nodeLayouts, token);
      router.push(`/sets/${setID}/mindmaps/${createdMap.PublicID}`);
    } catch {
     // console.error('Error creating mind map:', error);
      setTitleError('Failed to create mind map');
    }
  };

  // Handle mind map deletion
  const handleDeleteMap = async (mindMap: MindMap) => {
    if (!resolvedParams) return;
    setDeleteError(null);
    try {
      const token = await fetchAccessToken();
      const repo = new MindMapRepository();
  const setID = resolvedParams.setID;
  await repo.delete(setID, mindMap.PublicID, token);
      setMindMaps(mindMaps.filter(map => map.ID !== mindMap.ID));
      setShowDeleteDialog(false);
      setMindMapToDelete(null);
    } catch (error) {
     // console.error('Error:', error);
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
        {/*resolvedParams && (
          <SecondaryNav setID={resolvedParams.setID}/>
        )*/}
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
      {/*resolvedParams && (
        <SecondaryNav setID={resolvedParams.setID}/>
      )*/}

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
                              `/sets/${resolvedParams.setID}/mindmaps/${map.PublicID}`
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
                <div className="flex items-center gap-2">
                  <span className="text-sm">Public?</span>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    className="ml-2"
                  />
                  <span className="text-xs text-muted-foreground">{isPublic ? "Anyone can view this mind map" : "Only you can view this mind map"}</span>
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
