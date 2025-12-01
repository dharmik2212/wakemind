import React, { useEffect, useState, useRef } from 'react';
import { Alarm, ChallengeType } from '../types';
import { generateTypingChallenge } from '../services/geminiService';
import { Loader2, BellOff, Timer } from 'lucide-react';

interface ActiveAlarmProps {
  alarm: Alarm;
  onDismiss: () => void;
  onSnooze: () => void;
}

const ActiveAlarm: React.FC<ActiveAlarmProps> = ({ alarm, onDismiss, onSnooze }) => {
  const [typingPhrase, setTypingPhrase] = useState<string>('');
  const [mathProblem, setMathProblem] = useState<{ q: string; a: number } | null>(null);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initChallenge = async () => {
      setLoading(true);
      if (alarm.challengeType === ChallengeType.AI_TYPING) {
        const phrase = await generateTypingChallenge();
        setTypingPhrase(phrase);
      } else {
        // Generate Math Problem
        const num1 = Math.floor(Math.random() * 50) + 10;
        const num2 = Math.floor(Math.random() * 40) + 5;
        const isAddition = Math.random() > 0.5;
        
        if (isAddition) {
          setMathProblem({ q: `${num1} + ${num2}`, a: num1 + num2 });
        } else {
          // Ensure positive result for simplicity
          const max = Math.max(num1, num2);
          const min = Math.min(num1, num2);
          setMathProblem({ q: `${max} - ${min}`, a: max - min });
        }
      }
      setLoading(false);
      
      // Focus input after loading
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    initChallenge();
  }, [alarm.challengeType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let isCorrect = false;

    if (alarm.challengeType === ChallengeType.AI_TYPING) {
      // Basic case-sensitive check
      if (userInput.trim() === typingPhrase) {
        isCorrect = true;
      }
    } else if (mathProblem) {
      if (parseInt(userInput) === mathProblem.a) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      onDismiss();
    } else {
      setError(true);
      setUserInput('');
      setTimeout(() => setError(false), 500); // Shake animation reset
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-red-900 bg-[length:400%_400%] animate-gradient-xy z-0" />
      
      {/* Pulsing Red Overlay */}
      <div className="absolute inset-0 bg-red-600/20 z-0 animate-alarm-pulse pointer-events-none mix-blend-overlay" />
      
      {/* Noise/Texture Overlay (Optional, simplified to radial vignette) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-0 pointer-events-none" />

      <div className="z-10 w-full max-w-lg text-center space-y-8 relative">
        <div className="space-y-2">
          <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-2xl animate-bounce-subtle">
            {alarm.time}
          </h1>
          <p className="text-3xl text-red-400 font-bold uppercase tracking-[0.2em] animate-pulse drop-shadow-lg">
            Wake Up!
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/10 relative overflow-hidden">
          {/* Shine effect on card */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-indigo-400 mb-4" size={48} />
              <p className="text-slate-300 font-medium">Preparing Challenge...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  {alarm.challengeType === ChallengeType.AI_TYPING 
                    ? "Type the exact phrase below" 
                    : "Solve this calculation"}
                </h3>
                <div className="bg-black/40 p-6 rounded-xl border border-white/10 relative group">
                  <p className="text-2xl md:text-3xl font-bold text-white font-mono select-none tracking-wide">
                    {alarm.challengeType === ChallengeType.AI_TYPING 
                      ? typingPhrase 
                      : mathProblem?.q}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  ref={inputRef}
                  type={alarm.challengeType === ChallengeType.MATH ? "number" : "text"}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={alarm.challengeType === ChallengeType.MATH ? "Enter result" : "Type exactly as shown..."}
                  className={`w-full bg-slate-800/80 border-2 rounded-xl px-4 py-5 text-xl text-center text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner ${
                    error 
                      ? "border-red-500 animate-shake bg-red-900/10" 
                      : "border-slate-600 focus:border-indigo-400 focus:bg-slate-800"
                  }`}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                >
                  <BellOff size={20} />
                  <span>Dismiss Alarm</span>
                </button>
              </form>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSnooze}
                  className="w-full text-slate-400 hover:text-white hover:bg-white/5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium border border-transparent hover:border-white/5"
                >
                  <Timer size={18} />
                  Snooze for 5 minutes
                </button>
              </div>
            </div>
          )}
        </div>
        
        {alarm.label && (
          <p className="text-white/80 text-xl font-medium tracking-wide drop-shadow-md">"{alarm.label}"</p>
        )}
      </div>

      <style>{`
        @keyframes gradient-xy {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-xy {
          animation: gradient-xy 8s ease infinite;
        }
        @keyframes alarm-pulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.5; }
        }
        .animate-alarm-pulse {
          animation: alarm-pulse 1s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(-3%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ActiveAlarm;