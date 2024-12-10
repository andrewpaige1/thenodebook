"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BookOpen, Share2 } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">      
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Master Your Learning</h1>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Create Flashcards
              </CardTitle>
              <CardDescription>Craft detailed study materials with comprehensive explanations</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Design flashcards with primary definitions and extended insights to deepen your understanding.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Mind Map Connections
              </CardTitle>
              <CardDescription>Visualize relationships between concepts</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Connect terms and explain their interconnections to create a comprehensive knowledge network.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-6 h-6" />
                Collaborative Learning
              </CardTitle>
              <CardDescription>Share and validate your understanding</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Share mind maps with classmates and get feedback to refine your knowledge.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;