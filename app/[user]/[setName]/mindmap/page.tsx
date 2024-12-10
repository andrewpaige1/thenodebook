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
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
import { useParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

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
import Menu from '@/components/Menu'  // Import the Menu component
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
  const [, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<{
    source: string | null,
    target: string | null,
    relationshipLabel: string
  }>({
    source: null,
    target: null,
    relationshipLabel: ''
  });
  const params = useParams<{ user: string; setName: string }>()

  // Data fetching
  useEffect(() => {
    async function fetchSet() {
      if (params.user) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/users/${params.user}/sets/${decodeURIComponent(params.setName)}`, {
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
          setFlashcardSet(data)
          const flashcards = data.Flashcards
          
          // Calculate starting x and y to center nodes
          const totalNodes = flashcards.length;
          const startX = window.innerWidth / 2 - 100; // Adjust based on node width
          const startY = window.innerHeight / 2 - (totalNodes * 150 / 2);

          for(let i = 0; i < flashcards.length; i++) {
            const node = { 
              id: uuidv4(), 
              position: { 
                x: startX, 
                y: startY + i * 150 
              }, 
              data: { label: flashcards[i].Term} 
            }
            setNodes(prevNodes => [...prevNodes, node])
          }
        } catch (error) {
          console.error('Error fetching flashcard set:', error);
        }
      }
    }

    if (params) {
      fetchSet();
    }
  }, [params, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Open dialog to get relationship details
      setConnectionInfo({
        source: params.source || null,
        target: params.target || null,
        relationshipLabel: ''
      });
      setIsDialogOpen(true);
    },
    []
  );

  const handleSaveRelationship = () => {
    if (connectionInfo.source && connectionInfo.target) {
      const newEdge: Edge = {
        id: `${connectionInfo.source}-${connectionInfo.target}`,
        source: connectionInfo.source,
        target: connectionInfo.target,
        label: connectionInfo.relationshipLabel || 'Related',
        type: 'step',
        style: { stroke: '#4a5568', strokeWidth: 2 }
      };

      setEdges((eds) => addEdge(newEdge, eds));
      setIsDialogOpen(false);
    }
  };

  // Handle Enter key press in the input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveRelationship();
    }
  };

  return (
    <>
      <Menu />
      <SecondaryNav user={params.user} setName={params.setName} />
        <div style={{ width: '100vw', height: 'calc(100vh - 64px)' }}>  {/* Adjust height to account for Menu */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          edgeTypes={{
            step: ({ sourceX, sourceY, targetX, targetY, label }) => {
              // Custom edge rendering to show label on top of the line
              return (
                <>
                  <path
                    d={`M ${sourceX} ${sourceY} L ${targetX} ${targetY}`}
                    fill="none"
                    stroke="#4a5568"
                    strokeWidth={2}
                  />
                  <text 
                    x={(sourceX + targetX) / 2} 
                    y={(sourceY + targetY) / 2} 
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fontWeight="bold"
                    fill="#2d3748"
                    style={{ 
                      backgroundColor: 'white', 
                      padding: '2px 5px', 
                      borderRadius: '3px' 
                    }}
                  >
                    {label}
                  </text>
                </>
              );
            }
          }}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Cross} gap={12} size={1} />
        </ReactFlow>
      </div>

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
                onChange={(e) => setConnectionInfo(prev => ({
                  ...prev, 
                  relationshipLabel: e.target.value
                }))}
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