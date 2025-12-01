import React from 'react';
import { Clock } from 'lucide-react';

interface DigitalClockProps {
  currentTime: Date;
}

const DigitalClock: React.FC<DigitalClockProps> = ({ currentTime }) => {
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  
  const dateString = currentTime.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex flex-col items-center justify-center py-10 bg-slate-800 rounded-3xl shadow-xl mb-8 border border-slate-700 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Clock size={120} />
      </div>
      <div className="text-7xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 font-mono z-10">
        {hours}:{minutes}
        <span className="text-3xl md:text-5xl text-slate-500 ml-2">{seconds}</span>
      </div>
      <div className="mt-4 text-slate-400 text-lg md:text-xl font-medium z-10">
        {dateString}
      </div>
    </div>
  );
};

export default DigitalClock;