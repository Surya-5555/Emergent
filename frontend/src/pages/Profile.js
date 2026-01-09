import React, { useContext } from 'react';
import { AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Trophy, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-tight mb-4" data-testid="profile-title">
            Your <span className="font-black">Profile</span>
          </h1>
        </div>

        <Card className="glass p-8 border-white/10 mb-8" data-testid="profile-info">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24 bg-indigo-600">
              <AvatarFallback className="text-2xl font-bold">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{user.username}</h2>
              <div className="space-y-2 text-zinc-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>Rating: {user.rating || 1200}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass p-6 border-white/10" data-testid="profile-stats-solved">
            <h3 className="text-lg font-semibold mb-4">Problems Solved</h3>
            <p className="text-4xl font-black text-indigo-400">{user.solved_problems?.length || 0}</p>
          </Card>

          <Card className="glass p-6 border-white/10" data-testid="profile-stats-rank">
            <h3 className="text-lg font-semibold mb-4">Global Rank</h3>
            <p className="text-4xl font-black text-green-400">-</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;