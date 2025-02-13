'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, Users } from 'lucide-react';

export default function LandingPage() {

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-700 text-white">
        <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center sm:py-24 lg:py-32">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Mindthred
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl">
            Boosting deeper learning with interactive mindmaps and a focus on 
            understanding, not memorization.
          </p>
          <div className="mt-8 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg">
                <Link href="/api/auth/login">Get Started</Link>
              </Button>
            {/* Updated "Learn More" button with custom classes */}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-slate-900 text-slate-900 hover:bg-slate-100"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section
        id="features"
        className="container mx-auto px-4 py-16 lg:py-24 text-slate-800"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Mindthred?
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto">
            We believe in fostering comprehension through dynamic and
            interactive techniques—perfect for learners of all backgrounds.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="flex flex-col items-center p-6 bg-slate-50 rounded-lg shadow hover:shadow-lg transition text-center">
            <Brain size={48} className="text-slate-700" />
            <h3 className="mt-4 text-xl font-semibold">Interactive Mindmaps</h3>
            <p className="mt-2 text-sm">
              Visualize concepts and their relationships for deeper comprehension.
              Our interactive mindmaps help you connect the dots in real-time.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center p-6 bg-slate-50 rounded-lg shadow hover:shadow-lg transition text-center">
            <BookOpen size={48} className="text-slate-700" />
            <h3 className="mt-4 text-xl font-semibold">Focus on Understanding</h3>
            <p className="mt-2 text-sm">
              We go beyond rote memorization. Our platform encourages deeper
              learning so you can truly master the material.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center p-6 bg-slate-50 rounded-lg shadow hover:shadow-lg transition text-center">
            <Users size={48} className="text-slate-700" />
            <h3 className="mt-4 text-xl font-semibold">Collaborative Learning</h3>
            <p className="mt-2 text-sm">
              Share mindmaps with peers, exchange ideas, and build a collective 
              understanding—because learning is better together.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="bg-slate-100 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Take Your Learning to the Next Level?
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto">
            Sign up for Mindthred today and start exploring a new way of learning—
            designed for true understanding and retention.
          </p>
          <div className="mt-8 flex justify-center">
              <Button asChild size="lg">
                <Link href="/api/auth/login">Sign Up Now</Link>
              </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-6">
        <div className="container mx-auto px-4 text-center">
        </div>
      </footer>
    </div>
  );
}
