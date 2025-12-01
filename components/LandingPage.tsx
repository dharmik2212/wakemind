import React, { useState } from 'react';
import { Brain, Clock, Zap, Check } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate network delay for realistic feel
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 animate-bg-pan z-0" />
      
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }}></div>

      <div className="z-10 w-full max-w-md p-6 flex flex-col items-center text-center">
        
        {/* Logo Section */}
        <div className="mb-8 relative animate-float">
          <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full"></div>
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl relative z-10">
            <Brain size={64} className="text-indigo-400" />
            <div className="absolute -bottom-2 -right-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
              <Clock size={24} className="text-pink-400" />
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            WakeMind AI
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
            The intelligent alarm that wakes up your <span className="text-indigo-400 font-bold">brain</span>, not just your body.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center">
            <Zap size={24} className="text-yellow-400 mb-2" />
            <span className="text-sm text-slate-300 font-semibold">Smart Challenges</span>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center">
            <Brain size={24} className="text-pink-400 mb-2" />
            <span className="text-sm text-slate-300 font-semibold">AI Powered</span>
          </div>
        </div>

        {/* Login Button */}
        <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:bg-slate-50 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
          <p className="mt-4 text-xs text-slate-500">
            By continuing, you agree to wake up on time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;