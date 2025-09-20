"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { BlocksRepository } from '@/repositories/blocksRepository';
import type { BlocksScore } from '@/types';
import type { FlashcardSet } from '@/types';
import { CheckCircle, Clock, Trophy, Target, MousePointerClick, Crosshair, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { fetchAccessToken } from '@/services/authService';

const animationStyles = `
  @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
  .shake-error { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; border-color: #ef4444 !important; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeInUp {
    opacity: 0;
    animation: fadeInUp 0.6s ease-out forwards;
  }
`;

interface Concept {
  id: string;
  name: string;
  required: number;
}

const Stopwatch = ({ time }: { time: number }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return (
    <div className="flex items-center gap-2 font-mono text-lg bg-gray-100 text-gray-800 px-3 py-1 rounded-md">
      <Clock className="w-5 h-5" />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
};

const AccuracyTracker = ({ correct, total }: { correct: number, total: number }) => {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  return (
    <div className="flex items-center gap-2 font-mono text-lg bg-gray-100 text-gray-800 px-3 py-1 rounded-md">
      <Crosshair className="w-5 h-5" />
      <span>{accuracy}%</span>
    </div>
  );
};

const InstructionsModal = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full m-4">
         <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">How to Play Blocks</h2>
        </div>
        <div className="mt-6 text-left space-y-4 text-gray-600">
          <div className="flex gap-4 items-start">
            <Target className="w-6 h-6 text-gray-800 mt-1 flex-shrink-0" />
            <div><h3 className="font-semibold text-gray-800">The Objective</h3><p>Match all terms to their correct concepts as quickly as possible to get the best time.</p></div>
          </div>
          <div className="flex gap-4 items-start">
            <MousePointerClick className="w-6 h-6 text-gray-800 mt-1 flex-shrink-0" />
            <div><h3 className="font-semibold text-gray-800">How to Play</h3><ul className="list-disc list-inside mt-1 space-y-1"><li>A concept is pre-selected for you to start.</li><li>Click on the terms from the canvas that belong to the active concept.</li><li>When you select the correct number of terms, they will be automatically validated.</li></ul></div>
          </div>
        </div>
        <div className="mt-8"><button onClick={onStart} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-lg">Start Game</button></div>
      </div>
    </div>
  );
};

export default function BlocksGame({ set }: { set: FlashcardSet }) {
  const blocksRepo = new BlocksRepository();
  const { Flashcards: flashcards } = set;

  const concepts: Concept[] = useMemo(() => {
    const conceptMap = new Map<string, number>();
    flashcards.forEach(card => conceptMap.set(card.Concept, (conceptMap.get(card.Concept) || 0) + 1));
    return Array.from(conceptMap.entries()).map(([name, count]) => ({ id: name, name, required: count }));
  }, [flashcards]);

  const [leaderboard, setLeaderboard] = useState<BlocksScore[]>([]);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [activeConceptId, setActiveConceptId] = useState<string | null>(concepts.length > 0 ? concepts[0].id : null);
  const [selectedCardIds, setSelectedCardIds] = useState<(string | number)[]>([]);
  const [matchedData, setMatchedData] = useState<Record<string, (string | number)[]>>({});
  const [errorCardIds, setErrorCardIds] = useState<(string | number)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setTimeElapsed(prevTime => prevTime + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (!activeConceptId) return;
    const activeConcept = concepts.find(c => c.id === activeConceptId);
    if (!activeConcept) return;

    if (selectedCardIds.length === activeConcept.required) {
      setTotalAttempts(prev => prev + 1);
      const isCorrect = selectedCardIds.every(cardId => {
        const card = flashcards.find(c => c.ID === cardId);
        return card && card.Concept === activeConceptId;
      });

      if (isCorrect) {
        setCorrectAttempts(prev => prev + 1);
        setMatchedData(prev => {
          const updated = { ...prev, [activeConceptId]: selectedCardIds };
          const remainingConcepts = concepts.filter(c => !Object.keys(updated).includes(c.id));
          setActiveConceptId(remainingConcepts.length > 0 ? remainingConcepts[0].id : null);
          setSelectedCardIds([]);
          return updated;
        });
      } else {
        setErrorCardIds(selectedCardIds);
        setTimeout(() => { setErrorCardIds([]); setSelectedCardIds([]); }, 700);
      }
    }
  }, [selectedCardIds, activeConceptId, concepts, flashcards]);

  const handleCardClick = (cardId: string | number) => {
    if (!activeConceptId) return;
    setSelectedCardIds(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
  };

  const handleConceptClick = (conceptId: string) => {
    if (matchedData[conceptId]) return;
    setActiveConceptId(conceptId);
    setSelectedCardIds([]);
    setErrorCardIds([]);
  };

  const handleStartGame = () => {
    setIsModalOpen(false);
    setIsTimerRunning(true);
  };

  const handlePlayAgain = () => {
    setTimeElapsed(0);
    setFinalTime(0);
    setCorrectAttempts(0);
    setTotalAttempts(0);
    setMatchedData({});
    setSelectedCardIds([]);
    setErrorCardIds([]);
    setActiveConceptId(concepts.length > 0 ? concepts[0].id : null);
    setIsTimerRunning(true);
  };

  const isGameComplete = concepts.length > 0 && Object.keys(matchedData).length === concepts.length;

  useEffect(() => {
    if (isGameComplete && isTimerRunning) {
      setIsTimerRunning(false);
      setFinalTime(timeElapsed);
      const submitScore = async () => {
        setIsSubmittingScore(true);
        try {
          const token = await fetchAccessToken();
          const scoreData = {
            CorrectAttempts: correctAttempts,
            TotalAttempts: totalAttempts,
            Time: timeElapsed,
          };
          await blocksRepo.createScore(set.PublicID, scoreData, token);
        } catch {
          alert("Failed to submit score")
        } finally {
          setIsSubmittingScore(false);
        }
        try {
          const token = await fetchAccessToken();
          const leaderboardData = await blocksRepo.getLeaderboard(set.PublicID, token);
          setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : leaderboardData ? [leaderboardData] : []);
        } catch {
          setLeaderboard([]);
        }
      };
      submitScore();
    }
  }, [isGameComplete, isTimerRunning, timeElapsed, correctAttempts, totalAttempts, set.PublicID, blocksRepo]);

  if (isGameComplete) {
    const finalAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100;
    const finalMinutes = Math.floor(finalTime / 60);
    const finalSeconds = finalTime % 60;

    return (
      <>
        <style>{animationStyles}</style>

        <div className="bg-slate-50 text-center p-8 sm:p-12 md:p-16 rounded-xl border border-slate-200 shadow-lg w-full max-w-4xl mx-auto">
          {/* --- Header Section --- */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex p-4 bg-slate-200/70 rounded-full">
                <Trophy className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="mt-4 text-4xl font-bold text-slate-800 sm:text-5xl">
              Set Complete
            </h2>
            <p className="mt-2 text-lg text-slate-500">
              Congratulations! Here is your performance summary.
            </p>
          </div>

          {/* --- Key Stats Section (REVISED) --- */}
          <div className="mt-12 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
             <div className="inline-flex items-center rounded-full bg-white shadow-md border border-slate-200">
                {/* Time Section */}
                <div className="py-3 px-8 text-center">
                    <p className="text-sm font-medium text-slate-500">Time</p>
                    <p className="text-3xl font-bold font-mono text-slate-800 mt-1">
                      {String(finalMinutes).padStart(2, '0')}:{String(finalSeconds).padStart(2, '0')}
                    </p>
                </div>

                {/* Divider */}
                <div className="self-stretch border-l border-slate-200"></div>

                {/* Accuracy Section */}
                <div className="py-3 px-8 text-center">
                    <p className="text-sm font-medium text-slate-500">Accuracy</p>
                    <p className="text-3xl font-bold font-mono text-slate-800 mt-1">
                      {finalAccuracy}%
                    </p>
                </div>
            </div>
          </div>

          {/* --- Leaderboard Section --- */}
          <div className="mt-12 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Leaderboard</h3>
            {isSubmittingScore ? (
              <p className="text-slate-500">Loading scores...</p>
            ) : leaderboard.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden max-w-xl mx-auto bg-white">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="py-3 px-4 text-xs font-semibold text-blue-600 uppercase tracking-wider">Player</th>
                      <th className="py-3 px-4 text-xs font-semibold text-blue-600 uppercase tracking-wider text-center">Time</th>
                      <th className="py-3 px-4 text-xs font-semibold text-blue-600 uppercase tracking-wider text-center">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {leaderboard.slice(0, 5).map((entry) => (
                      <tr key={entry.ID} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 font-medium text-slate-800">{entry.User?.Nickname || 'Unknown'}</td>
                        <td className="py-4 px-4 text-slate-600 text-center font-mono">{entry.TimeSeconds ?? '-'}s</td>
                        <td className="py-4 px-4 text-slate-600 text-center font-mono">{
                          typeof entry.CorrectAttempts === 'number' && typeof entry.TotalAttempts === 'number' && entry.TotalAttempts > 0
                            ? `${Math.round((entry.CorrectAttempts / entry.TotalAttempts) * 100)}%`
                            : '100%'
                        }</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 bg-slate-100 py-4 rounded-md">No leaderboard data available.</p>
            )}
          </div>

          {/* --- Play Again Button --- */}
          <div className="mt-12 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={handlePlayAgain}
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all text-lg shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <RefreshCw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{animationStyles}</style>
      {isModalOpen && <InstructionsModal onStart={handleStartGame} />}

      <div className={clsx("flex flex-col lg:flex-row gap-8", isModalOpen && "blur-sm pointer-events-none")}>
         <div className="flex-1 lg:flex-[3]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Canvas</h2>
            {isTimerRunning && (
              <div className="flex items-center gap-4">
                <AccuracyTracker correct={correctAttempts} total={totalAttempts} />
                <Stopwatch time={timeElapsed} />
              </div>
            )}
          </div>
          <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-4 min-h-[400px] lg:min-h-[60vh] flex flex-wrap content-start gap-3">
            {flashcards.filter(card => !Object.values(matchedData).flat().includes(card.ID)).map(card => (
              <div key={card.ID} onClick={() => handleCardClick(card.ID)}
                className={clsx('px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 border select-none', 'bg-white text-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5',
                  { 'ring-2 ring-gray-800 ring-offset-2 border-gray-800': selectedCardIds.includes(card.ID), 'border-gray-300': !selectedCardIds.includes(card.ID), 'shake-error': errorCardIds.includes(card.ID), }
                )}
              >
                {card.Term}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Concepts</h2>
           <div className="space-y-4">
            {concepts.map(concept => {
              const isMatched = !!matchedData[concept.id];
              const isActive = activeConceptId === concept.id;
              return (
                <div key={concept.id} onClick={() => handleConceptClick(concept.id)}
                  className={clsx('p-4 rounded-lg border-2 transition-all duration-200',
                    { 'border-dashed border-gray-300 bg-white hover:border-gray-800 hover:bg-gray-50 cursor-pointer': !isActive && !isMatched, 'border-solid border-gray-800 bg-gray-50 ring-2 ring-gray-800 ring-offset-2': isActive, 'border-solid border-green-600 bg-green-50': isMatched, }
                  )}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{concept.name}</h3>
                    <span className={clsx('text-sm font-medium px-2 py-0.5 rounded-full', { 'bg-gray-200 text-gray-700': !isMatched, 'bg-green-200 text-green-800': isMatched, })}>
                      {isMatched ? concept.required : (isActive ? selectedCardIds.length : 0)} / {concept.required}
                    </span>
                  </div>
                  {isMatched && (
                    <div className="mt-4 pt-3 border-t border-green-200 space-y-2">
                      {matchedData[concept.id]?.map(cardId => {
                        const card = flashcards.find(c => c.ID === cardId);
                        return (<div key={cardId} className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /><span>{card?.Term}</span></div>);
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}