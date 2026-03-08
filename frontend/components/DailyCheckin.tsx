'use client';

// Daily Check-in Component

import { useState } from 'react';
import { X } from 'lucide-react';

interface DailyCheckinProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (mood: number, emotions: string[]) => void;
}

const moodEmojis = [
  { value: 1, emoji: '😔', label: 'Very Low' },
  { value: 2, emoji: '😟', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
];

const commonEmotions = [
  'Anxious', 'Calm', 'Happy', 'Sad', 'Angry', 'Tired',
  'Excited', 'Grateful', 'Stressed', 'Hopeful', 'Lonely', 'Content',
];

export function DailyCheckin({ isOpen, onClose, onComplete }: DailyCheckinProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  const handleToggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleComplete = () => {
    if (selectedMood !== null) {
      onComplete(selectedMood, selectedEmotions);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedMood(null);
    setSelectedEmotions([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Daily Check-in</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Mood Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">How are you feeling today?</p>
          <div className="flex justify-between gap-2">
            {moodEmojis.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  selectedMood === mood.value
                    ? 'border-[var(--color-primary)] bg-orange-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs text-slate-600">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emotions Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">
            What emotions are you experiencing? (Select all that apply)
          </p>
          <div className="flex flex-wrap gap-2">
            {commonEmotions.map((emotion) => (
              <button
                key={emotion}
                onClick={() => handleToggleEmotion(emotion)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedEmotions.includes(emotion)
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleComplete}
          disabled={selectedMood === null}
          className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Check-in
        </button>
      </div>
    </div>
  );
}
