'use client';

import { Header } from '@/components/Header';
import { Send, PlusCircle } from 'lucide-react';
import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPosts, createPost, reactToPost } from '@/lib/apiClient';
interface Post {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
  reactions: Array<{ reaction_type: string }>;
}

const REACTIONS = [
  { type: 'support', icon: '🫂', label: 'Sending Support' },
  { type: 'growth', icon: '🌱', label: 'Growth' },
  { type: 'relatable', icon: '🤝', label: 'Relatable' },
  { type: 'strength', icon: '🛡️', label: 'Strength' },
];

export default function CommunityWall() {
  const { user, nickname } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data || []);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const handleShare = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Use the email prefix as a default username snippet
      const username = nickname || 'Anonymous';
      await createPost(newPostContent.trim(), username);
      setNewPostContent('');
      await fetchPosts(); // Re-fetch to get real ID and timestamps
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (postId: string, type: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, reactions: [...p.reactions, { reaction_type: type }] };
      }
      return p;
    }));

    try {
      await reactToPost(postId, type);
    } catch (error) {
      // Revert if failed
      console.error("Reaction failed");
      fetchPosts();
    }
  };

  // Helper to count reactions
  const getReactionCount = (reactions: Array<{ reaction_type: string }>, type: string) =>
    reactions.filter(r => r.reaction_type === type).length;

  return (
    <main className="min-h-screen pb-24 bg-transparent">
      <Header />

      <section className="px-6 py-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('wall.title')}</h1>
        <p className="text-slate-500 mt-1">{t('wall.subtitle')}</p>
      </section>

      {/* Write Post Section */}
      <section className="px-6 mb-6">
        <form onSubmit={handleShare} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3">
          <textarea
            placeholder={t('wall.post_placeholder')}
            className="w-full bg-slate-50 border-none rounded-2xl resize-none p-4 text-sm focus:ring-1 focus:ring-primary outline-none"
            rows={3}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center">
            <button type="button" className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors">
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!newPostContent.trim() || isSubmitting}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? t('wall.sharing') : t('wall.share_now')} <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </section>

      {/* Feed Section */}
      <section className="px-6 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-slate-400">{t('wall.loading')}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-slate-400">{t('wall.empty')}</div>
        ) : (
          posts.map((post) => {
            const dateStr = new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return (
              <div key={post.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-200 to-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                      {post.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{post.username}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{dateStr}</p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-50 flex-wrap">
                  {REACTIONS.map((r) => {
                    const count = getReactionCount(post.reactions, r.type);
                    const isActive = count > 0;
                    return (
                      <button
                        key={r.type}
                        onClick={() => handleReaction(post.id, r.type)}
                        title={r.label}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isActive
                          ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                      >
                        <span className="text-sm">{r.icon}</span>
                        <span>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
