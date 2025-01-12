"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Network,
  Plus,
  XCircle,
  Loader2
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
import Menu from "@/components/Menu";
import SecondaryNav from "@/components/FlashcardNav";

interface MindMap {
  ID: number;
  Title: string;
}

export default function MindMapList({
  params
}: {
  params: Promise<{ user: string, setName: string }>
}) {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newMapTitle, setNewMapTitle] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{ user: string, setName: string } | null>(null);

  // Resolve params from the promise
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch mind maps
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

  const handleCreateMap = () => {
    if (!resolvedParams) return;
    if (newMapTitle.trim()) {
      router.push(`/${resolvedParams.user}/${resolvedParams.setName}/${encodeURIComponent(newMapTitle)}/mindmap`);
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen">
        <Menu />
        {resolvedParams && <SecondaryNav user={resolvedParams.user} setName={resolvedParams.setName} />}
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

  return (
    <div className="min-h-screen">
      <Menu />
      {resolvedParams && <SecondaryNav user={resolvedParams.user} setName={resolvedParams.setName} />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">

          {mindMaps.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
              <Network className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Mind Maps Yet</h2>
              <p className="text-gray-600 mb-4">Create your first mind map to get started</p>
              <Button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Create Mind Map
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {mindMaps.map((map) => (
                <Card 
                  key={map.ID}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <button
                      className="w-full text-left"
                      onClick={() => router.push(
                        `/${resolvedParams?.user}/${resolvedParams?.setName}/${encodeURIComponent(map.Title)}/mindmap`
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Network className="h-5 w-5 text-blue-500" />
                          <h3 className="font-semibold text-gray-900">{map.Title}</h3>
                        </div>
                      </div>
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Mind Map</DialogTitle>
                <DialogDescription>
                  Enter a title for your new mind map
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={newMapTitle}
                  onChange={(e) => setNewMapTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateMap()}
                  placeholder="Mind Map Title"
                  className="w-full"
                  autoFocus
                />
                <div className="flex justify-end">
                  <Button onClick={handleCreateMap}>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}