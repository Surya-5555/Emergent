import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const MockInterview = () => {
  const { problemId } = useParams();
  const { token } = useContext(AuthContext);
  const [problem, setProblem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchProblem();
    initializeInterview();
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      const response = await axios.get(`${API}/problems/${problemId}`);
      setProblem(response.data);
    } catch (error) {
      toast.error('Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  const initializeInterview = () => {
    setMessages([
      {
        role: 'ai',
        content: "Hello! I'm your AI interviewer today. Let's discuss the problem and your approach. Take your time to think, and feel free to ask questions. When you're ready, please explain how you would approach this problem."
      }
    ]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      const response = await axios.post(
        `${API}/ai/assist`,
        {
          problem_id: problemId,
          request_type: 'mock_interview',
          context: inputMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage = { role: 'ai', content: response.data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-zinc-400">Loading interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight mb-4" data-testid="interview-title">
            Mock <span className="font-black">Interview</span>
          </h1>
          <p className="text-zinc-400" data-testid="interview-subtitle">
            Problem: {problem?.title}
          </p>
        </div>

        {/* Problem Overview */}
        <Card className="glass p-6 border-white/10 mb-8" data-testid="problem-overview">
          <h3 className="text-lg font-semibold mb-3">Problem Statement</h3>
          <p className="text-zinc-300">{problem?.description}</p>
        </Card>

        {/* Chat Interface */}
        <Card className="glass border-white/10 h-[500px] flex flex-col" data-testid="interview-chat">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${idx}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-md ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-900 text-zinc-300 border border-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-white/10 p-4 rounded-md">
                    <p className="text-zinc-400">AI is thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                data-testid="message-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                disabled={sending}
                className="flex-1 bg-zinc-950 border-zinc-800 focus:border-indigo-500"
              />
              <Button
                data-testid="send-message-btn"
                onClick={sendMessage}
                disabled={sending || !inputMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-zinc-500">
          <p>Tips: Explain your thought process, discuss time complexity, and ask clarifying questions</p>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;