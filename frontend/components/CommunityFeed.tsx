'use client';

// Community Feed Component

import { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { ReactionBar } from './ReactionBar';
import type { Post } from '@/lib/api/types';

interface CommunityFeedProps {
  posts: Post[];
  loading?: boolean;
  onReact?: (postId: string, reactionType: 'support' | 'relate' | 'proud') => void;
  onRefresh?: () => void;
}

export function CommunityFeed({ posts, loading, onReact, onRefresh }: CommunityFeedProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse">
            <div className="h-20 bg-slate-100 rounded-xl mb-4"></div>
            <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Share2 className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No posts yet</h3>
        <p className="text-slate-500 text-sm">Be the first to share your story with the community!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-700 text-sm">
                {post.is_anonymous ? 'Anonymous' : post.author}
              </p>
              <p className="text-xs text-slate-400">{formatTime(post.created_at)}</p>
            </div>
          </div>

          {/* Content */}
          <p className="text-slate-700 text-sm leading-relaxed mb-4">{post.content}</p>

          {/* Reactions */}
          <ReactionBar
            reactions={post.reactions}
            postId={post.id}
            onReact={onReact}
          />
        </article>
      ))}
    </div>
  );
}
