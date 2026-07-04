"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function QuizPage() {
  const { id: videoId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; score: number; total: number; explanation: string } | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        // In a real app we'd fetch the title from Firestore telemetry or YouTube API
        const urlParams = new URLSearchParams(window.location.search);
        const videoTitle = urlParams.get("title") || "Software Development Tutorial on freeCodeCamp";

        const res = await fetch("/api/assess/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            sessionId: "demo", 
            videoId, 
            videoTitle 
          })
        });
        
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to generate quiz");
        }
        
        setAssessmentId(data.assessmentId);
        setQuiz(data.quiz);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (videoId) {
      loadQuiz();
    }
  }, [videoId]);

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quiz.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    
    const formattedAnswers = Object.entries(answers).map(([id, answer]) => ({ id, answer }));
    
    try {
      const res = await fetch("/api/assess/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, answers: formattedAnswers })
      });
      
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      alert("Failed to submit quiz: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_16px_rgba(16,185,129,0.5)]" />
          <p>AI is generating your assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="text-red-500 border border-red-500/30 bg-red-500/10 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl text-center">
          {result.passed ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-[#10b981] flex items-center justify-center mb-6 shadow-[0_0_32px_rgba(16,185,129,0.4)]">
                <span className="text-2xl">✓</span>
              </div>
              <h1 className="text-2xl font-black mb-2 text-white tracking-tight uppercase">Credential Minted</h1>
              <p className="text-[#10b981] font-bold mb-4">Score: {result.score}/{result.total}</p>
              <p className="text-white/60 mb-6 text-sm">{result.explanation}</p>
              
              <div className="p-4 bg-black/40 rounded-lg border border-white/5 text-left mb-6">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Contract Status</p>
                <p className="text-xs text-white/80 font-mono break-all">Monarch SBT issued to connected wallet.</p>
              </div>
              
              <Button onClick={() => window.location.href = "/dashboard"} className="w-full bg-white text-black hover:bg-gray-200">
                View Dashboard
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500 flex items-center justify-center mb-6 shadow-[0_0_32px_rgba(239,68,68,0.4)]">
                <span className="text-2xl">✗</span>
              </div>
              <h1 className="text-2xl font-black mb-2 text-white tracking-tight uppercase">Assessment Failed</h1>
              <p className="text-red-500 font-bold mb-4">Score: {result.score}/{result.total}</p>
              <p className="text-white/60 mb-6 text-sm">{result.explanation}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Try Again
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">Assessment Active</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Video Comprehension</h1>
        </header>

        <div className="space-y-12">
          {quiz.map((q: any, i: number) => (
            <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-6">
                <span className="text-white/40 mr-4">0{i + 1}</span>
                {q.question}
              </h3>
              
              <div className="space-y-3">
                {q.options.map((opt: string, optIdx: number) => {
                  const isSelected = answers[q.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isSelected 
                          ? 'border-[#10b981] bg-[#10b981]/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                          : 'border-white/10 bg-black/40 text-white/70 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className={`inline-block w-6 text-xs font-bold ${isSelected ? 'text-[#10b981]' : 'text-white/30'}`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 sticky bottom-8 p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <div className="text-sm text-white/50">
            {Object.keys(answers).length} of {quiz.length} answered
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || Object.keys(answers).length !== quiz.length}
            className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest px-8"
          >
            {submitting ? 'Verifying...' : 'Submit Assessment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
