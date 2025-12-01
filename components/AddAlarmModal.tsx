import React, { useState, useRef } from 'react';
import { X, Calculator, Type, Volume2, Upload, Music } from 'lucide-react';
import { ChallengeType, DAYS_OF_WEEK, SoundType, SoundSettings } from '../types';

interface AddAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (time: string, label: string, challengeType: ChallengeType, days: number[], soundSettings: SoundSettings) => void;
}

const AddAlarmModal: React.FC<AddAlarmModalProps> = ({ isOpen, onClose, onSave }) => {
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('');
  const [challengeType, setChallengeType] = useState<ChallengeType>(ChallengeType.AI_TYPING);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  
  // Sound State
  const [soundType, setSoundType] = useState<SoundType>(SoundType.CLASSIC);
  const [customSoundData, setCustomSoundData] = useState<string | undefined>(undefined);
  const [customSoundName, setCustomSoundName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1500000) { // 1.5MB limit
        alert("File is too large. Please choose a file under 1.5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomSoundData(result);
        setCustomSoundName(file.name);
        setSoundType(SoundType.CUSTOM);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const soundSettings: SoundSettings = {
      type: soundType,
      customData: customSoundData,
      name: customSoundName
    };

    onSave(time, label, challengeType, selectedDays, soundSettings);
    onClose();
    
    // Reset defaults
    setTime('07:00');
    setLabel('');
    setChallengeType(ChallengeType.AI_TYPING);
    setSelectedDays([]);
    setSoundType(SoundType.CLASSIC);
    setCustomSoundData(undefined);
    setCustomSoundName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white">New Alarm</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Time Input */}
          <div className="flex justify-center">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-transparent text-6xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-2 text-center w-full"
            />
          </div>

          {/* Days Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Repeat</label>
            <div className="flex justify-between">
              {DAYS_OF_WEEK.map((day, index) => (
                <button
                  key={day}
                  onClick={() => toggleDay(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    selectedDays.includes(index)
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {day.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alarm Sound</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: SoundType.CLASSIC, label: 'Classic' },
                { type: SoundType.GENTLE, label: 'Gentle' },
                { type: SoundType.SIREN, label: 'Siren' },
                { type: SoundType.CUSTOM, label: 'Custom' },
              ].map((sound) => (
                <button
                  key={sound.type}
                  onClick={() => setSoundType(sound.type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    soundType === sound.type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {sound.type === SoundType.CUSTOM ? <Music size={14}/> : <Volume2 size={14} />}
                  {sound.label}
                </button>
              ))}
            </div>
            
            {soundType === SoundType.CUSTOM && (
              <div className="mt-2 animate-fade-in-up">
                <input
                  type="file"
                  accept="audio/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-600 hover:border-indigo-500 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl p-4 transition-all"
                >
                  <Upload size={20} />
                  <span className="text-sm truncate max-w-[200px]">
                    {customSoundName || "Upload Sound File (max 1.5MB)"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Challenge Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wake Up Challenge</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setChallengeType(ChallengeType.AI_TYPING)}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${
                  challengeType === ChallengeType.AI_TYPING
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-700 bg-slate-700/30 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Type size={24} />
                <span className="text-sm font-medium">AI Typing</span>
              </button>
              <button
                onClick={() => setChallengeType(ChallengeType.MATH)}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${
                  challengeType === ChallengeType.MATH
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-slate-700 bg-slate-700/30 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Calculator size={24} />
                <span className="text-sm font-medium">Math</span>
              </button>
            </div>
          </div>

          {/* Label Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Label</label>
            <input
              type="text"
              placeholder="Morning Workout"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="p-6 pt-0 mt-auto bg-slate-800">
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            Set Alarm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAlarmModal;