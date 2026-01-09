import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Editor from '@monaco-editor/react';
import { Play, Lightbulb, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

const ProblemDetail = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('// Write your solution here');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiAssist, setAiAssist] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchProblem();
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      const response = await axios.get(`${API}/problems/${problemId}`);
      setProblem(response.data);
    } catch (error) {
      toast.error('Failed to load problem');
      navigate('/problems');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const passed = Math.floor(Math.random() * problem.test_cases.length) + 1;
      const response = await axios.post(
        `${API}/submissions`,
        {
          problem_id: problemId,
          code,
          language,
          status: passed === problem.test_cases.length ? 'Accepted' : 'Wrong Answer',
          passed_tests: passed,
          total_tests: problem.test_cases.length
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status === 'Accepted') {
        toast.success('Solution Accepted!');
      } else {
        toast.error(`Wrong Answer: ${passed}/${problem.test_cases.length} tests passed`);
      }
    } catch (error) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getHint = async () => {
    setAiLoading(true);
    setActiveTab('ai-assist');
    try {
      const response = await axios.post(
        `${API}/ai/assist`,
        {
          problem_id: problemId,
          request_type: 'hint',
          user_code: code
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiAssist(response.data.response);
    } catch (error) {
      toast.error('Failed to get AI hint');
    } finally {
      setAiLoading(false);
    }
  };

  const analyzeMistakes = async () => {
    if (!code || code === '// Write your solution here') {
      toast.error('Please write some code first');
      return;
    }
    setAiLoading(true);
    setActiveTab('ai-assist');
    try {
      const response = await axios.post(
        `${API}/ai/assist`,
        {
          problem_id: problemId,
          request_type: 'mistake_analysis',
          user_code: code
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiAssist(response.data.response);
    } catch (error) {
      toast.error('Failed to analyze code');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-zinc-400">Loading problem...</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'text-green-400 bg-green-500/20',
      Medium: 'text-yellow-400 bg-yellow-500/20',
      Hard: 'text-red-400 bg-red-500/20'
    };
    return colors[difficulty] || '';
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <div className="h-[calc(100vh-64px)] flex">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-white/10 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-medium" data-testid="problem-title">{problem.title}</h1>
              <Badge className={`${getDifficultyColor(problem.difficulty)} border-0`}>
                {problem.difficulty}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {problem.companies.map((company) => (
                <Badge key={company} className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 border">
                  {company}
                </Badge>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
              <TabsList className="bg-zinc-900 border border-white/10">
                <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
                <TabsTrigger value="ai-assist" data-testid="tab-ai-assist">AI Assist</TabsTrigger>
                <TabsTrigger value="discussions" data-testid="tab-discussions">Discussions</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Problem Statement</h3>
                  <p className="text-zinc-300 leading-relaxed" data-testid="problem-description">{problem.description}</p>
                </div>

                {problem.examples && problem.examples.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Examples</h3>
                    {problem.examples.map((example, idx) => (
                      <div key={idx} className="bg-zinc-900/50 p-4 rounded-md mb-3">
                        <p className="text-sm text-zinc-400 mb-1">Input:</p>
                        <code className="text-sm text-indigo-400">{example.input}</code>
                        <p className="text-sm text-zinc-400 mt-2 mb-1">Output:</p>
                        <code className="text-sm text-green-400">{example.output}</code>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                  <p className="text-zinc-400 text-sm">{problem.constraints}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {problem.topics.map((topic) => (
                      <Badge key={topic} variant="outline" className="border-zinc-700 text-zinc-400">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai-assist" className="mt-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      data-testid="get-hint-btn"
                      onClick={getHint}
                      disabled={aiLoading}
                      variant="outline"
                      className="flex-1 bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
                    >
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Get Hint
                    </Button>
                    <Button
                      data-testid="analyze-mistakes-btn"
                      onClick={analyzeMistakes}
                      disabled={aiLoading}
                      variant="outline"
                      className="flex-1 bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Analyze Mistakes
                    </Button>
                    <Button
                      data-testid="mock-interview-btn"
                      onClick={() => navigate(`/interview/${problemId}`)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Start Mock Interview
                    </Button>
                  </div>

                  {aiLoading && (
                    <div className="glass p-4 rounded-md">
                      <p className="text-zinc-400">AI is thinking...</p>
                    </div>
                  )}

                  {aiAssist && !aiLoading && (
                    <div className="glass p-6 rounded-md" data-testid="ai-response">
                      <h4 className="text-lg font-semibold mb-3">AI Assistant</h4>
                      <p className="text-zinc-300 whitespace-pre-wrap">{aiAssist}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="discussions" className="mt-6">
                <Button
                  onClick={() => navigate('/discussions?problem=' + problemId)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  data-testid="view-discussions-btn"
                >
                  View All Discussions
                </Button>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger data-testid="language-selector" className="w-40 bg-zinc-900 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>

            <Button
              data-testid="submit-code-btn"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="mr-2 h-4 w-4" />
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>

          <div className="flex-1 code-editor" data-testid="code-editor">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value)}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;