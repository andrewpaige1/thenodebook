"use client"

import React, { useCallback, useEffect, useState, KeyboardEvent } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Connection,
  Edge,
  NodeChange,
} from '@xyflow/react';
import { useUser } from "@auth0/nextjs-auth0";
import { useRouter } from "next/navigation";
import '@xyflow/react/dist/style.css';
import { useParams } from 'next/navigation'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Menu from '@/components/Menu'
import SecondaryNav from '@/components/FlashcardNav';

const initialNodes: any = [];
const initialEdges: any = [];

interface Flashcard {
  ID: number;
  Term: string;
  Solution: string;
  Concept: string;
}

interface FlashcardSet {
  Title: string;
  Flashcards: Flashcard[];
}

export default function Page() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [mapID, setMapID] = useState(0);
  const [, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // NEW: Track if a node has moved
  const [connectionInfo, setConnectionInfo] = useState<{
    source: string | null,
    target: string | null,
    relationshipLabel: string
  }>({
    source: null,
    target: null,
    relationshipLabel: ''
  });
  const params = useParams<{ user: string; setName: string; mindMapName: string }>();

  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isUserLoading) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  // Data fetching
  useEffect(() => {
    async function fetchSet() {
      if (params.user) {
        try {
          // 1) Get mind map state
          const mapStateResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/app/${params.user}/mindmap/state/${decodeURIComponent(params.mindMapName)}`,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );

          if (!mapStateResponse.ok) {
            throw new Error('Failed to get state');
          }

          const mapData = await mapStateResponse.json();

          // 2) Get flashcard set
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/app/users/${params.user}/sets/${decodeURIComponent(params.setName)}`,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch flashcard set');
          }

          const data = await response.json();
          setFlashcardSet(data);
          setMapID(mapData.id);

          // 3) Create new nodes from server data
          const newNodes = mapData.nodeLayouts.map((nodeLayout: any) => ({
            id: nodeLayout.FlashcardID.toString(),
            position: {
              x: nodeLayout.XPosition,
              y: nodeLayout.YPosition
            },
            data: { label: nodeLayout.Data }
          }));
          setNodes(newNodes);

          // 4) Create new edges from server data
          const newEdges = mapData.connections.map((c: any) => ({
            id: `${c.SourceID}-${c.TargetID}`,
            source: c.SourceID.toString(),
            target: c.TargetID.toString(),
            label: c.Relationship || 'Related',
            type: 'step',
            style: { stroke: '#4a5568', strokeWidth: 2 }
          }));
          setEdges(newEdges);

        } catch (error) {
          console.error('Error fetching flashcard set:', error);
        }
      }
    }

    if (params) {
      fetchSet();
    }
  }, [params, setNodes, setEdges]);

  // Custom handler for node changes so we can detect position changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // first, call the default handler from useNodesState
      onNodesChange(changes);

      // if any node was moved, set hasChanges to true
      const moved = changes.some(change => change.type === 'position');
      if (moved) {
        setHasChanges(true);
      }
    },
    [onNodesChange]
  );

  // Called when a new edge/connection is drawn
  const onConnect = useCallback(
    (params: Connection) => {
      setConnectionInfo({
        source: params.source || null,
        target: params.target || null,
        relationshipLabel: ''
      });
      setIsDialogOpen(true);
    },
    []
  );

  // Save button for edges
  const handleSaveRelationship = async () => {
    if (connectionInfo.source && connectionInfo.target) {
      const newEdge: Edge = {
        id: `${connectionInfo.source}-${connectionInfo.target}`,
        source: connectionInfo.source,
        target: connectionInfo.target,
        label: connectionInfo.relationshipLabel || 'Related',
        type: 'step',
        style: { stroke: '#4a5568', strokeWidth: 2 }
      };

      const updateData = {
        mindMapID: mapID,
        nickname: params.user,
        source: Number(connectionInfo.source),
        target: Number(connectionInfo.target),
        relationshipLabel: connectionInfo.relationshipLabel
      };

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/mindmap/updateConnections`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      setEdges((eds) => addEdge(newEdge, eds));
      setIsDialogOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveRelationship();
    }
  };

  const handleSaveMap = useCallback(async () => {
    try {
      // Build array of nodes with all required information
      const nodeUpdates = nodes.map(node => ({
        flashcardID: parseInt(node.id),
        xPosition: node.position.x,
        yPosition: node.position.y,
        data: node.data.label // Include the node's label data
      }));
  
      const payload = {
        mindMapID: mapID,
        nickname: params.user,
        nodes: nodeUpdates
      };
  
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/app/mindmap/updateNodeLayout`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (!res.ok) {
        throw new Error('Error updating node layouts');
      }
  
      // If successful, reset the "hasChanges" state
      setHasChanges(false);
  
    } catch (error) {
      console.error('Error saving node layouts:', error);
    }
  }, [nodes, mapID, params.user]);

  return (
    <>
      <Menu />
      <SecondaryNav user={params.user} setName={params.setName} />
      {!user && (
        <div className="max-w-4xl mx-auto p-4">
          <h2>Please login or sign up to use this feature</h2>
        </div>
      )}
      {user && (
        <div style={{ width: '100vw', height: 'calc(100vh - 64px)', position: 'relative' }}>
          {/* The Save button in top-right corner of the mind map */}
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 4 }}>
            <Button onClick={handleSaveMap} disabled={!hasChanges}>
              Save
            </Button>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Cross} gap={12} size={1} />
          </ReactFlow>
        </div>
      )}

      {/* Dialog for describing relationships when a connection is drawn */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Explain the Relationship</DialogTitle>
            <DialogDescription>
              How are these flashcards related? Describe the connection between them.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="relationship" className="text-right">
                Connection
              </Label>
              <Input
                id="relationship"
                placeholder="e.g., 'Builds upon', 'Contrasts with'"
                className="col-span-3"
                value={connectionInfo.relationshipLabel}
                onChange={(e) =>
                  setConnectionInfo((prev) => ({
                    ...prev,
                    relationshipLabel: e.target.value,
                  }))
                }
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveRelationship}>
              Save Relationship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
