'use client';

// Reaction Bar Component

import { useState } from 'react';
import { Heart, Star, Sparkles } from 'lucide-react';
import type { ReactionCounts } from '@/lib/api/types';

interface ReactionBarProps {
  reactions: ReactionCounts;
  postId: string;
  onReact?: (postId: string, reactionType: 'support' | 'relate' | 'proud') => void;
}

const reactionTypes = [
  { type: 'support' as const, label: 'Support', icon: Heart, color: 'text-rose-500' },
  { type: 'relate' as const, label: 'Relate', icon: Star, color: 'text-amber-500' },
  { type: 'proud' as const, label: 'Proud', icon: Sparkles, color: 'text-purple-500' },
];

export function ReactionBar({ reactions, postId, onReact }: ReactionBarProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleReact = async (type: 'support' | 'relate' | 'proud') => {
    if (isAnimating) return;

    setIsAnimating(true);
    setSelectedReaction(type);

    try {
      await onReact?.(postId, type);
    } catch (error) {
      console.error('Failed to react:', error);
    } finally {
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {reactionTypes.map(({ type, label, icon: Icon, color }) => {
        const count = reactions[type];
        const isSelected = selectedReaction === type;

        return (
          <button
            key={type}
            onClick={() => handleReact(type)}
            disabled={isAnimating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              isSelected
                ? 'border-current bg-opacity-10'
                : 'border-slate-200 hover:border-slate-300'
            } ${color} ${isSelected ? 'bg-current' : 'bg-transparent'}`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : ''}`} />
            <span className={`text-xs font-medium ${isSelected ? 'text-white' : ''}`}>
              {count > 0 ? count : label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
