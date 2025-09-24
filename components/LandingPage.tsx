
// This server component uses a light, academic-focused design with alternating layouts.
// UPDATE: Replaced the testimonial section with an honest, benefit-driven alternative and added a "Trusted By" section.

import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { BrainCircuit, BookCheck, Gamepad2, TrendingUp, CheckCircle, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">

      {/* Header & Hero Section */}
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-slate-800">
                True Understanding is a Click Away.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-slate-600">
                Mindthred transforms your notes into a suite of powerful, interactive study tools, allowing you to focus on larger themes instead of individual flashcards.
              </p>
              <div className="mt-8 flex items-center gap-4">
                {/* eslint-disable-next-line */}
                <a href="/auth/login">
                  <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg">
                    Get Started
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white p-4 rounded-xl shadow-2xl border border-slate-200">
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <video
                  src="/mindthred-demo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

        <section className="bg-white py-12">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-base font-semibold text-slate-500 uppercase tracking-wider">
          Trusted by students at
            </h3>
            <div className="mt-8 flex justify-center items-center gap-12 sm:gap-20 grayscale opacity-80">
          <div className="flex flex-col items-center">
            <Image
              src="/fordham.png"
              alt="Fordham University"
              width={220}
              height={64}
              className="h-16 w-auto object-contain mb-2 filter grayscale brightness-95"
              style={{ maxWidth: 220 }}
              priority
            />
            <p className="text-lg font-medium text-slate-500">Fordham University</p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/tcnj.png"
              alt="The College of New Jersey"
              width={240}
              height={64}
              className="h-16 w-auto object-contain mb-2 filter grayscale brightness-95"
              style={{ maxWidth: 240 }}
              priority
            />
            <p className="text-lg font-medium text-slate-500">The College of New Jersey</p>
          </div>
            </div>
          </div>
        </section>
      
      {/* Features Section with Alternating Layout */}
      <main className="container mx-auto px-6 py-24 space-y-24">
        {/* Feature 1: Mind Maps */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-slate-100 p-8 rounded-lg">
             <div className="aspect-video bg-white rounded-md shadow-inner flex items-center justify-center">
                
      <video
        src="/mindmap.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover rounded-md" // Changed object-contain to object-cover
      />

              </div>
          </div>
          <div>
            <BrainCircuit className="w-12 h-12 text-indigo-600" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Visualize Every Connection</h2>
            <p className="mt-4 text-lg text-slate-600">Don&apos;t just memorize terms&mdash;understand them. Our mind maps automatically link concepts from your notes, revealing the bigger picture and making complex topics easy to grasp.</p>
          </div>
        </section>
        {/*Blocks game*/}
<section className="grid md:grid-cols-2 gap-12 items-center">
  <div className="order-last md:order-first">
    <Gamepad2 className="w-12 h-12 text-indigo-600" />
    <h2 className="mt-4 text-3xl font-bold tracking-tight">Make Studying Engaging</h2>
    <p className="mt-4 text-lg text-slate-600">
      With interactive games like <b>Blocks</b>, you can actively test your knowledge by matching terms to themes. It&apos;s a fun, effective way to reinforce concepts and prepare for exams.
    </p>
  </div>
  <div className="bg-slate-100 p-8 rounded-lg">
    <div className="aspect-video bg-white rounded-md shadow-inner flex items-center justify-center overflow-hidden">
      <video
        src="/blocks.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover rounded-md" // Changed object-contain to object-cover
      />
    </div>
  </div>
</section>

        {/* Feature 3: Smart Flashcards & Quizzes */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-slate-100 p-8 rounded-lg">
             <div className="aspect-video bg-white rounded-md shadow-inner flex items-center justify-center">
      <video
        src="/flashcards.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover rounded-md" // Changed object-contain to object-cover
      />              
      </div>
          </div>
          <div>
            <BookCheck className="w-12 h-12 text-indigo-600" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Learn in Context</h2>
            <p className="mt-4 text-lg text-slate-600">Our unique three-column flashcards let you focus on what matters. Connect every detail to its core concept and apply your knowledge with confidence.</p>
          </div>
        </section>
      </main>

      {/* REPLACED Testimonials with a "Why It Works" Section */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Built for How You Really Learn</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
            We focus on proven learning principles to help you study smarter, not just harder.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="p-8 bg-white rounded-lg shadow-lg text-left">
              <CheckCircle className="w-8 h-8 text-indigo-600" />
              <p className="mt-2 text-slate-700">
                AI-powered features help you get started instantly, but we believe that making your own flashcards is an essential part of the learning process.
              </p>
            </div>
            <div className="p-8 bg-white rounded-lg shadow-lg text-left">
              <TrendingUp className="w-8 h-8 text-indigo-600"/>
              <h3 className="mt-4 text-lg font-semibold">Conceptual Understanding</h3>
              <p className="mt-2 text-slate-700">Our tools are designed to help you connect the dots and understand the &quot;why&quot; behind the facts, not just the &quot;what.&quot;</p>
            </div>
            <div className="p-8 bg-white rounded-lg shadow-lg text-left">
              <Zap className="w-8 h-8 text-indigo-600"/>
              <h3 className="mt-4 text-lg font-semibold">Instant Feedback</h3>
              <p className="mt-2 text-slate-700">Know where you stand immediately. Interactive exercises provide real-time feedback to guide your learning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tighter">
            Ready to transform your study habits?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-slate-600">
            Start learning with more clarity and less stress.
          </p>
          <div className="mt-8">
            {/* eslint-disable-next-line */}
            <a href="/auth/login">
              <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg px-8 py-6 text-lg">
                Start today
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
