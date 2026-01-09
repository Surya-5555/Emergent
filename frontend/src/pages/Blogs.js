import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${API}/blogs`);
      setBlogs(response.data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-zinc-400">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-tight mb-4" data-testid="blogs-title">
            Learning <span className="font-black">Resources</span>
          </h1>
          <p className="text-zinc-400" data-testid="blogs-subtitle">
            Tutorials, guides, and insights on DSA and competitive programming
          </p>
        </div>

        <div className="space-y-6" data-testid="blogs-list">
          {blogs.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="glass p-8 border-white/10 hover:border-indigo-500/50 transition-colors cursor-pointer" data-testid={`blog-${blog.id}`}>
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-indigo-600/20 rounded-md flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-indigo-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 border">
                        {blog.category}
                      </Badge>
                      <span className="text-zinc-500 text-sm flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl font-semibold mb-3">{blog.title}</h2>
                    <p className="text-zinc-400 mb-4">{blog.content}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-zinc-700 text-zinc-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-sm text-zinc-500">
                      by {blog.author}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {blogs.length === 0 && (
          <div className="text-center py-12" data-testid="no-blogs-message">
            <p className="text-zinc-400">No blogs available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;