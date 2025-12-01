import React, { useState, useEffect } from 'react';
import { Plus, Timer, LogOut } from 'lucide-react';
import { Alarm, ChallengeType, SoundSettings, SoundType } from './types';
import DigitalClock from './components/DigitalClock';
import AlarmItem from './components/AlarmItem';
import AddAlarmModal from './components/AddAlarmModal';
import ActiveAlarm from './components/ActiveAlarm';
import LandingPage from './components/LandingPage';
import { playAlarmSound, stopAlarmSound } from './services/soundService';

const STORAGE_KEY = 'wakemind_alarms';
const AUTH_KEY = 'wakemind_auth';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // App State
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  
  // Snooze state
  const [snoozedAlarm, setSnoozedAlarm] = useState<Alarm | null>(null);
  const [snoozeTarget, setSnoozeTarget] = useState<Date | null>(null);

  // Check Auth on Mount
  useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsAuthChecking(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  // Load alarms from storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Alarm[] = JSON.parse(stored);
        // Migration for old alarms without soundSettings
        const migrated = parsed.map(a => ({
          ...a,
          soundSettings: a.soundSettings || { type: SoundType.CLASSIC }
        }));
        setAlarms(migrated);
      } catch (e) {
        console.error("Failed to parse alarms", e);
      }
    }
  }, []);

  // Save alarms to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  }, [alarms]);

  // Clock Tick & Alarm Check
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check Snooze
      if (snoozeTarget && snoozedAlarm) {
        if (now >= snoozeTarget) {
          triggerAlarm(snoozedAlarm);
          setSnoozeTarget(null);
          setSnoozedAlarm(null);
          return;
        }
      }

      // Check if any alarm matches current time
      if (activeAlarm) return; // Already ringing

      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentSeconds = now.getSeconds();
      const currentDay = now.getDay(); // 0 = Sun

      const timeString = `${currentHours}:${currentMinutes}`;

      alarms.forEach(alarm => {
        if (!alarm.enabled) return;

        // Check time match
        if (alarm.time === timeString && currentSeconds === 0) {
          // Check day match
          // If days array is empty, it's a one-time alarm (active every day until disabled)
          const isToday = alarm.days.length === 0 || alarm.days.includes(currentDay);
          
          if (isToday) {
            triggerAlarm(alarm);
          }
        }
      });

    }, 1000);

    return () => clearInterval(timer);
  }, [alarms, activeAlarm, snoozedAlarm, snoozeTarget]);

  const triggerAlarm = (alarm: Alarm) => {
    setActiveAlarm(alarm);
    playAlarmSound(alarm.soundSettings);
  };

  const handleDismiss = () => {
    if (activeAlarm) {
      stopAlarmSound();
      
      // If it was a one-time alarm (no days selected), disable it
      if (activeAlarm.days.length === 0) {
        setAlarms(prev => prev.map(a => 
          a.id === activeAlarm.id ? { ...a, enabled: false } : a
        ));
      }
      
      setActiveAlarm(null);
    }
  };

  const handleSnooze = () => {
    if (activeAlarm) {
      stopAlarmSound();
      setSnoozedAlarm(activeAlarm);
      // Set snooze for 5 minutes
      const now = new Date();
      setSnoozeTarget(new Date(now.getTime() + 5 * 60 * 1000));
      setActiveAlarm(null);
    }
  };

  const cancelSnooze = () => {
    setSnoozedAlarm(null);
    setSnoozeTarget(null);
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
    // If we delete an alarm that is currently snoozed, we should probably cancel the snooze
    if (snoozedAlarm && snoozedAlarm.id === id) {
      cancelSnooze();
    }
  };

  const addAlarm = (
    time: string, 
    label: string, 
    challengeType: ChallengeType, 
    days: number[],
    soundSettings: SoundSettings
  ) => {
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time,
      label,
      challengeType,
      enabled: true,
      days,
      soundSettings
    };
    setAlarms(prev => [...prev, newAlarm].sort((a, b) => a.time.localeCompare(b.time)));
  };

  // Render Logic
  if (isAuthChecking) return null; // Or a loading spinner

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center p-4 md:p-8 animate-fade-in-up">
      {activeAlarm && (
        <ActiveAlarm 
          alarm={activeAlarm} 
          onDismiss={handleDismiss} 
          onSnooze={handleSnooze}
        />
      )}

      <div className="w-full max-w-lg space-y-6">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              WakeMind AI
            </h1>
            <p className="text-slate-400 text-sm">Smart Wake Up</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Hidden helper to ensure AudioContext is initialized on user gesture */}
            <button onClick={() => playAlarmSound()} className="hidden">Init Audio</button>
            
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <DigitalClock currentTime={currentTime} />

        {/* Snooze Indicator */}
        {snoozedAlarm && snoozeTarget && (
          <div className="bg-indigo-900/40 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 shadow-lg shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-300 animate-pulse">
                <Timer size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">Snoozing</p>
                <p className="text-xs text-indigo-200">
                  Rings at {snoozeTarget.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button 
              onClick={cancelSnooze}
              className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-all border border-slate-700"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <h2 className="text-xl font-semibold text-slate-200">Your Alarms</h2>
        </div>

        <div className="space-y-4 pb-24">
          {alarms.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed animate-pulse">
              <p>No alarms set.</p>
              <p className="text-sm mt-2">Tap + to add one.</p>
            </div>
          ) : (
            alarms.map(alarm => (
              <AlarmItem
                key={alarm.id}
                alarm={alarm}
                onToggle={toggleAlarm}
                onDelete={deleteAlarm}
              />
            ))
          )}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 md:bottom-12 md:right-1/2 md:translate-x-1/2 w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform hover:scale-110 active:scale-95 z-40 animate-bounce-subtle"
        >
          <Plus size={32} />
        </button>

        <AddAlarmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addAlarm}
        />
      </div>
    </div>
  );
};

export default App;