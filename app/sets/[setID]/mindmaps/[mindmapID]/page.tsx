"use client"

import React, { useCallback, useEffect, useState, KeyboardEvent } from 'react';
import { MindMapRepository } from '@/repositories/mindMapRepository';
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
import { fetchAccessToken } from '@/services/authService';

const initialNodes: any = [];
const initialEdges: any = [];

interface MindMapNodeLayout {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  MindMapID: number;
  FlashcardID: number;
  XPosition: number;
  YPosition: number;
  Data: string;
}

interface MindMap {
  ID: number;
  Title: string;
  PublicID: string;
  SetID: string;
  UserID: number;
  IsPublic: boolean;
  Connections: any[];
  nodeLayouts?: MindMapNodeLayout[];
}


export default function Page() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [, setMapID] = useState(0);
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
  const params = useParams<{ user: string; setName: string; mindmapID: string; setID: string }>();

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
      if (params.setID) {
        try {
          const token = await fetchAccessToken();
          const repo = new MindMapRepository();
          const mapData: MindMap = await repo.getByID(params.setID, params.mindmapID, token);
          setMapID(mapData.ID);
         // console.log(mapData)
          const nodeLayouts = mapData.nodeLayouts || [];
         //console.log('NodeLayouts from backend:', nodeLayouts);
          const newNodes = nodeLayouts.map((nodeLayout: any) => ({
            id: nodeLayout.FlashcardID?.toString() ?? '',
            position: {
              x: nodeLayout.XPosition,
              y: nodeLayout.YPosition
            },
            data: { label: nodeLayout.Data ?? '' }
          }));
          setNodes(newNodes);
          const connections = mapData.Connections || mapData.Connections || [];
          const newEdges = connections.map((c: any) => ({
            id: `${c.SourceID ?? c.sourceID}-${c.TargetID ?? c.targetID}`,
            source: (c.SourceID ?? c.sourceID)?.toString() ?? '',
            target: (c.TargetID ?? c.targetID)?.toString() ?? '',
            label: c.Relationship ?? c.relationship ?? 'Related',
            type: 'step',
            style: { stroke: '#4a5568', strokeWidth: 2 }
          }));
          setEdges(newEdges);
        } catch (error) {
         // console.error('Error fetching mind map:', error);
         return error
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
      // Save connection to backend
      try {
        const token = await fetchAccessToken();
        const repo = new MindMapRepository();
        // Prepare connections array for backend
        const updatedConnections = [
          {
            SourceID: Number(connectionInfo.source),
            TargetID: Number(connectionInfo.target),
            Relationship: connectionInfo.relationshipLabel || 'Related',
          }
        ];
        const success = await repo.updateConnections(params.setID, params.mindmapID, updatedConnections, token);
        if (success) {
          setEdges((eds) => addEdge(newEdge, eds));
          setIsDialogOpen(false);
        } else {
          console.error('Failed to save connection to backend');
        }
      } catch (error) {
        //console.error('Error saving connection:', error);
        return error
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveRelationship();
    }
  };

  const handleSaveMap = useCallback(async () => {
    try {
      const token = await fetchAccessToken();
      const repo = new MindMapRepository();
      // Build array of node layouts for backend
      const nodeUpdates = nodes.map(node => ({
        FlashcardID: parseInt(node.id),
        XPosition: node.position.x,
        YPosition: node.position.y,
        Data: node.data.label
      }));
    //  console.log('Saving nodeUpdates to backend:', nodeUpdates);
      const success = await repo.updateLayouts(params.setID, params.mindmapID, nodeUpdates, token);
      if (success) {
        setHasChanges(false);
      } else {
        console.error('Failed to save node layouts to backend');
      }
    } catch (error) {
     // console.error('Error saving node layouts:', error);
     return error
    }
  }, [nodes, params.setID, params.mindmapID]);

  return (
    <>
      <Menu />
      {/*<SecondaryNav setID={params.setID}/>*/}
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
