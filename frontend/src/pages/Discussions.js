import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Discussions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, user } = useContext(AuthContext);
  const [discussions, setDiscussions] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '', problem_id: searchParams.get('problem') || '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const problemId = searchParams.get('problem');
      const url = problemId ? `${API}/discussions?problem_id=${problemId}` : `${API}/discussions`;
      const response = await axios.get(url);
      setDiscussions(response.data);
    } catch (error) {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const createDiscussion = async () => {
    if (!newDiscussion.title || !newDiscussion.content) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await axios.post(
        `${API}/discussions`,
        newDiscussion,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Discussion created!');
      setShowCreate(false);
      setNewDiscussion({ title: '', content: '', problem_id: '' });
      fetchDiscussions();
    } catch (error) {
      toast.error('Failed to create discussion');
    }
  };

  const upvoteDiscussion = async (discussionId) => {
    try {
      await axios.post(
        `${API}/discussions/${discussionId}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDiscussions();
    } catch (error) {
      toast.error('Failed to upvote');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-zinc-400">Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light tracking-tight mb-4" data-testid="discussions-title">
              Community <span className="font-black">Discussions</span>
            </h1>
            <p className="text-zinc-400" data-testid="discussions-subtitle">
              {discussions.length} discussions
            </p>
          </div>
          <Button
            data-testid="create-discussion-btn"
            onClick={() => setShowCreate(!showCreate)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Create Discussion
          </Button>
        </div>

        {showCreate && (
          <Card className="glass p-6 border-white/10 mb-8" data-testid="create-discussion-form">
            <h3 className="text-xl font-semibold mb-4">New Discussion</h3>
            <div className="space-y-4">
              <Input
                data-testid="discussion-title-input"
                placeholder="Discussion title"
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                className="bg-zinc-950 border-zinc-800 focus:border-indigo-500"
              />
              <Input
                data-testid="discussion-problem-id-input"
                placeholder="Problem ID (optional)"
                value={newDiscussion.problem_id}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, problem_id: e.target.value })}
                className="bg-zinc-950 border-zinc-800 focus:border-indigo-500"
              />
              <Textarea
                data-testid="discussion-content-input"
                placeholder="Share your thoughts, questions, or solutions..."
                value={newDiscussion.content}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                rows={6}
                className="bg-zinc-950 border-zinc-800 focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <Button onClick={createDiscussion} data-testid="submit-discussion-btn" className="bg-indigo-600 hover:bg-indigo-700">
                  Post Discussion
                </Button>
                <Button onClick={() => setShowCreate(false)} variant="outline" className="bg-zinc-900 border-zinc-700">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4" data-testid="discussions-list">
          {discussions.map((discussion, idx) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="discussion-card glass p-6 border-white/10 cursor-pointer" data-testid={`discussion-${discussion.id}`}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      data-testid={`upvote-btn-${discussion.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        upvoteDiscussion(discussion.id);
                      }}
                      className="text-zinc-400 hover:text-indigo-400 transition-colors"
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-bold">{discussion.upvotes}</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{discussion.title}</h3>
                    <p className="text-zinc-400 mb-4 line-clamp-2">{discussion.content}</p>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span>by {discussion.username}</span>
                      <span>•</span>
                      <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {discussion.replies?.length || 0} replies
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {discussions.length === 0 && (
          <div className="text-center py-12" data-testid="no-discussions-message">
            <p className="text-zinc-400">No discussions yet. Be the first to start one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discussions;