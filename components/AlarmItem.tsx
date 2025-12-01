import React from 'react';
import { Alarm, ChallengeType, DAYS_OF_WEEK, SoundType } from '../types';
import { Trash2, Calculator, Type, Volume2, Music } from 'lucide-react';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onToggle, onDelete }) => {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 mb-4 flex items-center justify-between shadow-lg border border-slate-700 transition-all hover:border-slate-600">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <span className={`text-4xl font-bold ${alarm.enabled ? 'text-white' : 'text-slate-500'}`}>
            {alarm.time}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-700 rounded-full px-2 py-1">
              {alarm.challengeType === ChallengeType.MATH ? (
                <Calculator size={14} className="text-blue-400" />
              ) : (
                <Type size={14} className="text-purple-400" />
              )}
              <span className="text-xs font-medium text-slate-300">
                {alarm.challengeType === ChallengeType.MATH ? 'Math' : 'AI Typing'}
              </span>
            </div>
            
            {/* Sound Icon */}
            <div className="flex items-center gap-1 bg-slate-700 rounded-full px-2 py-1" title={alarm.soundSettings?.name || alarm.soundSettings?.type}>
              {alarm.soundSettings?.type === SoundType.CUSTOM ? (
                <Music size={14} className="text-green-400" />
              ) : (
                <Volume2 size={14} className="text-slate-400" />
              )}
            </div>
          </div>
        </div>
        
        <div className="text-slate-400 text-sm mt-1">{alarm.label || 'Alarm'}</div>
        
        <div className="flex gap-1 mt-2">
          {DAYS_OF_WEEK.map((day, index) => {
            const isActive = alarm.days.includes(index);
            return (
              <span
                key={day}
                className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600'
                }`}
              >
                {day.charAt(0)}
              </span>
            );
          })}
          {alarm.days.length === 0 && (
            <span className="text-xs text-slate-500 flex items-center">Once</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onToggle(alarm.id)}
          className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
            alarm.enabled ? 'bg-green-500' : 'bg-slate-600'
          }`}
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
              alarm.enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
        
        <button
          onClick={() => onDelete(alarm.id)}
          className="text-slate-500 hover:text-red-400 transition-colors p-2"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default AlarmItem;