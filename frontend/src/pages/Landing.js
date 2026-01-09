import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Trophy, Brain, TrendingUp, Users, BookOpen, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1737505599162-d9932323a889)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-indigo-400 uppercase tracking-widest text-xs mb-6" data-testid="hero-tagline">AI-Powered Practice Platform</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6" data-testid="hero-title">
              Master DSA with <span className="font-black">AI Guidance</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10" data-testid="hero-description">
              Company-tagged problems, adaptive learning, AI mock interviews, and real-time feedback. 
              Level up from beginner to expert with personalized guidance.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                data-testid="get-started-btn"
                onClick={() => navigate('/auth')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-md transition-all hover:scale-105 active:scale-95"
              >
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
              <Button
                data-testid="explore-problems-btn"
                onClick={() => navigate('/problems')}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-6 text-lg rounded-md backdrop-blur-sm border-white/10"
              >
                Explore Problems
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-indigo-400 uppercase tracking-widest text-xs mb-4" data-testid="features-tagline">FEATURES</p>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-4" data-testid="features-title">
            Everything You Need to <span className="font-black">Excel</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 p-8 rounded-md transition-colors duration-300"
            data-testid="feature-company-problems"
          >
            <div className="w-12 h-12 bg-indigo-600/20 rounded-md flex items-center justify-center mb-6">
              <Code2 className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Company-Tagged Problems</h3>
            <p className="text-zinc-400">Practice problems from Google, Amazon, Microsoft, and 100+ top companies. Targeted preparation for your dream job.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 p-8 rounded-md transition-colors duration-300"
            data-testid="feature-ai-interview"
          >
            <div className="w-12 h-12 bg-indigo-600/20 rounded-md flex items-center justify-center mb-6">
              <Brain className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Mock Interviews</h3>
            <p className="text-zinc-400">1-on-1 AI interviews while solving problems. Get real-time feedback, hints, and mistake analysis without solution dumping.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 p-8 rounded-md transition-colors duration-300"
            data-testid="feature-adaptive-learning"
          >
            <div className="w-12 h-12 bg-indigo-600/20 rounded-md flex items-center justify-center mb-6">
              <Target className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Adaptive Learning</h3>
            <p className="text-zinc-400">Problems ordered based on your weak areas. Personalized sheets for Beginner, Intermediate, and Advanced levels.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 p-8 rounded-md transition-colors duration-300"
            data-testid="feature-rating-predictor"
          >
            <div className="w-12 h-12 bg-indigo-600/20 rounded-md flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Rating Predictor</h3>
            <p className="text-zinc-400">Track your progress with our rating system. See your predicted rating based on practice and mock contests.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 p-8 rounded-md transition-colors duration-300"
            data-testid="feature-mock-contests"
          >
            <div className="w-12 h-12 bg-indigo-600/20 rounded-md flex items-center justify-center mb-6">
              <Trophy className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Mock Contests</h3>
            <p className="text-zinc-400">Simulate real contest conditions. Timed challenges to test your skills and improve your speed under pressure.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 p-8 rounded-md transition-colors duration-300"
            data-testid="feature-discussions"
          >
            <div className="w-12 h-12 bg-indigo-600/20 rounded-md flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community Discussions</h3>
            <p className="text-zinc-400">Reddit-style discussions for each problem. Share approaches, learn from others, and upvote helpful solutions.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto text-center glass p-16 rounded-md">
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-6" data-testid="cta-title">
            Ready to <span className="font-black">Level Up</span>?
          </h2>
          <p className="text-lg text-zinc-400 mb-10" data-testid="cta-description">
            Join thousands of developers mastering DSA with AI-powered guidance.
          </p>
          <Button
            data-testid="cta-start-btn"
            onClick={() => navigate('/auth')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg rounded-md transition-all hover:scale-105 active:scale-95"
          >
            Start Practicing Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto text-center text-zinc-500">
          <p>© 2025 DSA Practice Platform. AI-Powered Learning.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;