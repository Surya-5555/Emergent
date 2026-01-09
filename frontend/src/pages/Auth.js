import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Code2, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      login(response.data.token, response.data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/problems');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-8">
      <Button
        data-testid="back-home-btn"
        onClick={() => navigate('/')}
        variant="ghost"
        className="absolute top-8 left-8 text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass p-12 rounded-md" data-testid="auth-container">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-md flex items-center justify-center">
              <Code2 className="h-6 w-6 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-light tracking-tight text-center mb-2" data-testid="auth-title">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-zinc-400 text-center mb-8" data-testid="auth-subtitle">
            {isLogin ? 'Sign in to continue your journey' : 'Create your account to start practicing'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="username" className="text-zinc-300">Username</Label>
                <Input
                  id="username"
                  data-testid="username-input"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required={!isLogin}
                  className="bg-zinc-950 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mt-2"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-zinc-950 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input
                id="password"
                data-testid="password-input"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-zinc-950 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mt-2"
              />
            </div>

            <Button
              data-testid="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-md transition-all hover:scale-105 active:scale-95"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="toggle-auth-mode-btn"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;