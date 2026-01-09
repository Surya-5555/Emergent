import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Code2, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer"
              data-testid="logo"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">DSA Master</span>
            </div>

            {user && (
              <div className="hidden md:flex items-center gap-1">
                <Button
                  data-testid="nav-problems"
                  onClick={() => navigate('/problems')}
                  variant="ghost"
                  className={`${isActive('/problems') ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-white'}`}
                >
                  Problems
                </Button>
                <Button
                  data-testid="nav-dashboard"
                  onClick={() => navigate('/dashboard')}
                  variant="ghost"
                  className={`${isActive('/dashboard') ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-white'}`}
                >
                  Dashboard
                </Button>
                <Button
                  data-testid="nav-discussions"
                  onClick={() => navigate('/discussions')}
                  variant="ghost"
                  className={`${isActive('/discussions') ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-white'}`}
                >
                  Discussions
                </Button>
                <Button
                  data-testid="nav-blogs"
                  onClick={() => navigate('/blogs')}
                  variant="ghost"
                  className={`${isActive('/blogs') ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-white'}`}
                >
                  Blogs
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  data-testid="nav-profile"
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  className="text-zinc-400 hover:text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  {user.username}
                </Button>
                <Button
                  data-testid="logout-btn"
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 border-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                data-testid="login-btn"
                onClick={() => navigate('/auth')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;