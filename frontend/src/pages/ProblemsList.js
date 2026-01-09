import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const ProblemsList = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, searchQuery, difficultyFilter, companyFilter]);

  const fetchProblems = async () => {
    try {
      const response = await axios.get(`${API}/problems`);
      setProblems(response.data);
      setFilteredProblems(response.data);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = problems;

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((p) => p.difficulty === difficultyFilter);
    }

    if (companyFilter !== 'all') {
      filtered = filtered.filter((p) => p.companies.includes(companyFilter));
    }

    setFilteredProblems(filtered);
  };

  const getDifficultyBadge = (difficulty) => {
    const styles = {
      Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
      Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Hard: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return styles[difficulty] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-zinc-400">Loading problems...</p>
        </div>
      </div>
    );
  }

  const allCompanies = [...new Set(problems.flatMap((p) => p.companies))];

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-tight mb-4" data-testid="problems-title">
            Practice <span className="font-black">Problems</span>
          </h1>
          <p className="text-zinc-400" data-testid="problems-subtitle">
            {filteredProblems.length} problems available
          </p>
        </div>

        {/* Filters */}
        <div className="glass p-6 rounded-md mb-8" data-testid="filters-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-950 border-zinc-800 focus:border-indigo-500"
              />
            </div>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger data-testid="difficulty-filter" className="bg-zinc-950 border-zinc-800">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger data-testid="company-filter" className="bg-zinc-950 border-zinc-800">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {allCompanies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4" data-testid="problems-list">
          {filteredProblems.map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => navigate(`/problems/${problem.id}`)}
              className="problem-card bg-zinc-900/50 border border-white/10 p-6 rounded-md cursor-pointer"
              data-testid={`problem-card-${problem.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-2">{problem.title}</h3>
                  <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{problem.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getDifficultyBadge(problem.difficulty)} border`}>
                      {problem.difficulty}
                    </Badge>
                    {problem.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="outline" className="border-zinc-700 text-zinc-400">
                        {topic}
                      </Badge>
                    ))}
                    {problem.companies.slice(0, 2).map((company) => (
                      <Badge key={company} className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 border">
                        {company}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12" data-testid="no-problems-message">
            <p className="text-zinc-400">No problems found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemsList;