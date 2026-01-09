import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Trophy, TrendingUp, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = () => {
    if (!analytics?.submission_heatmap) return [];
    
    const data = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = analytics.submission_heatmap[dateStr] || 0;
      data.push({ date: dateStr, count });
    }
    
    return data;
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-zinc-900';
    if (count === 1) return 'bg-indigo-900/40';
    if (count === 2) return 'bg-indigo-700/60';
    if (count === 3) return 'bg-indigo-600/80';
    return 'bg-indigo-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const heatmapData = generateHeatmapData();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-tight mb-4" data-testid="dashboard-title">
            Your <span className="font-black">Progress</span>
          </h1>
          <p className="text-zinc-400" data-testid="dashboard-subtitle">
            Track your coding journey and achievements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass p-6 border-white/10" data-testid="stat-solved">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="h-8 w-8 text-indigo-400" />
                <span className="text-3xl font-black">{analytics?.solved_count || 0}</span>
              </div>
              <p className="text-zinc-400 text-sm">Problems Solved</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass p-6 border-white/10" data-testid="stat-submissions">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-8 w-8 text-green-400" />
                <span className="text-3xl font-black">{analytics?.total_submissions || 0}</span>
              </div>
              <p className="text-zinc-400 text-sm">Total Submissions</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass p-6 border-white/10" data-testid="stat-rating">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-yellow-400" />
                <span className="text-3xl font-black">{analytics?.rating || 1200}</span>
              </div>
              <p className="text-zinc-400 text-sm">Current Rating</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass p-6 border-white/10" data-testid="stat-streak">
              <div className="flex items-center justify-between mb-4">
                <Award className="h-8 w-8 text-red-400" />
                <span className="text-3xl font-black">-</span>
              </div>
              <p className="text-zinc-400 text-sm">Day Streak</p>
            </Card>
          </motion.div>
        </div>

        {/* Difficulty Breakdown */}
        <Card className="glass p-8 border-white/10 mb-12" data-testid="difficulty-breakdown">
          <h2 className="text-2xl font-light tracking-tight mb-6">
            Difficulty <span className="font-black">Breakdown</span>
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400 font-medium">Easy</span>
                <span className="text-2xl font-black">{analytics?.difficulty_breakdown?.Easy || 0}</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${((analytics?.difficulty_breakdown?.Easy || 0) / (analytics?.solved_count || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-400 font-medium">Medium</span>
                <span className="text-2xl font-black">{analytics?.difficulty_breakdown?.Medium || 0}</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: `${((analytics?.difficulty_breakdown?.Medium || 0) / (analytics?.solved_count || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-400 font-medium">Hard</span>
                <span className="text-2xl font-black">{analytics?.difficulty_breakdown?.Hard || 0}</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${((analytics?.difficulty_breakdown?.Hard || 0) / (analytics?.solved_count || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Heatmap */}
        <Card className="glass p-8 border-white/10" data-testid="activity-heatmap">
          <h2 className="text-2xl font-light tracking-tight mb-6">
            Activity <span className="font-black">Heatmap</span>
          </h2>
          <div className="overflow-x-auto">
            <div className="inline-grid grid-cols-52 gap-1">
              {heatmapData.map((day, idx) => (
                <div
                  key={idx}
                  className={`heatmap-cell ${getHeatmapColor(day.count)}`}
                  title={`${day.date}: ${day.count} submissions`}
                  data-testid={`heatmap-cell-${idx}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-6 text-sm text-zinc-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="heatmap-cell bg-zinc-900" />
              <div className="heatmap-cell bg-indigo-900/40" />
              <div className="heatmap-cell bg-indigo-700/60" />
              <div className="heatmap-cell bg-indigo-600/80" />
              <div className="heatmap-cell bg-indigo-500" />
            </div>
            <span>More</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;