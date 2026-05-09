import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Brain, Mail, Lock, ArrowLeft, Shield, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { role } = useParams<{ role: 'admin' | 'faculty' | 'student' }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleConfig = {
    admin: {
      title: 'Admin Portal',
      icon: Shield,
      color: 'from-indigo-600 to-blue-600',
      bgColor: 'bg-indigo-500',
    },
    faculty: {
      title: 'Faculty Portal',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-500',
    },
    student: {
      title: 'Student Portal',
      icon: BookOpen,
      color: 'from-violet-600 to-purple-600',
      bgColor: 'bg-violet-500',
    },
  };

  const config = roleConfig[role || 'student'];
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = await login(email, password);

    if (success) {
      const storedUser = JSON.parse(localStorage.getItem('schedulix_user') || 'null');
      const targetRole = storedUser?.role || role;
      const destination = targetRole === 'admin'
        ? '/admin/dashboard'
        : targetRole === 'faculty' || targetRole === 'hod'
          ? '/faculty/dashboard'
          : '/student/dashboard';

      navigate(destination);
    } else {
      setError('Invalid email or password');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-6">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <Icon className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{config.title}</h2>
            <p className="text-slate-300">Sign in to access your dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${config.color} text-white font-semibold py-3 rounded-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Brain className="w-4 h-4" />
              <span>Powered by Schedulix AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
