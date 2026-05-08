import { useNavigate } from 'react-router-dom';
import { Calendar, Brain, Users, BookOpen, Clock, TrendingUp, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">SCHEDULIX</h1>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-full">
            <span className="text-indigo-300 text-sm font-medium">AI-Powered Timetable Scheduling</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            SCHEDULIX
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
              AI Timetable Scheduler
            </span>
          </h2>

          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Revolutionize your academic scheduling with intelligent AI algorithms.
            Create conflict-free timetables in seconds, not hours.
          </p>

          {/* Login Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/login/admin')}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105"
            >
              <Shield className="inline-block w-5 h-5 mr-2" />
              Admin Login
            </button>

            <button
              onClick={() => navigate('/login/faculty')}
              className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <Users className="inline-block w-5 h-5 mr-2" />
              Faculty Login
            </button>

            <button
              onClick={() => navigate('/login/student')}
              className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="inline-block w-5 h-5 mr-2" />
              Student Login
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Departments', value: '2', icon: BookOpen },
              { label: 'Faculty Members', value: '20', icon: Users },
              { label: 'Students', value: '200', icon: Users },
              { label: 'AI Accuracy', value: '100%', icon: TrendingUp },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <stat.icon className="w-8 h-8 text-indigo-400 mb-2 mx-auto" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">About Schedulix</h3>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              An intelligent timetable scheduling system designed specifically for universities.
              Leveraging advanced AI algorithms to create optimal, conflict-free schedules automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <Brain className="w-12 h-12 text-indigo-400 mb-4" />
              <h4 className="text-2xl font-bold text-white mb-3">AI-Powered Generation</h4>
              <p className="text-slate-300">
                Our intelligent algorithm automatically generates optimal timetables by considering faculty availability,
                classroom capacity, and academic constraints to ensure zero conflicts.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <Clock className="w-12 h-12 text-blue-400 mb-4" />
              <h4 className="text-2xl font-bold text-white mb-3">Real-Time Updates</h4>
              <p className="text-slate-300">
                Instant synchronization across all users. Faculty can cancel classes with prior notice,
                and changes reflect immediately in student and admin dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">Powerful Features</h3>
            <p className="text-slate-300 text-lg">Everything you need for efficient academic scheduling</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Role-Based Access',
                description: 'Secure authentication with separate portals for Admin, Faculty, and Students'
              },
              {
                icon: Calendar,
                title: 'Smart Scheduling',
                description: 'Automatic conflict resolution and optimal time slot allocation'
              },
              {
                icon: Users,
                title: 'Faculty Management',
                description: 'Complete faculty and subject assignment with workload tracking'
              },
              {
                icon: BookOpen,
                title: 'Student Management',
                description: 'Manage student records, sections, and department allocations'
              },
              {
                icon: Zap,
                title: 'Quick Export',
                description: 'Export timetables to PDF and Excel formats instantly'
              },
              {
                icon: TrendingUp,
                title: 'Analytics Dashboard',
                description: 'Comprehensive insights and utilization statistics'
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How AI Works Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">How AI Timetable Generation Works</h3>
            <p className="text-slate-300 text-lg">Intelligent scheduling in simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Select Section', desc: 'Choose department, semester, and section' },
              { step: '02', title: 'Assign Faculty', desc: 'Map subjects to available faculty members' },
              { step: '03', title: 'AI Processing', desc: 'Algorithm resolves conflicts and optimizes schedule' },
              { step: '04', title: 'Generate', desc: 'Get your perfect timetable instantly' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-white/30 mb-3">{item.step}</div>
                  <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-indigo-100 text-sm">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">SCHEDULIX</h1>
          </div>
          <p className="text-slate-400 mb-2">AI-Powered University Timetable Scheduler</p>
          <p className="text-slate-500 text-sm">© 2026 Schedulix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
