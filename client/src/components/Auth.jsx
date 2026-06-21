import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await axios.post(url, payload);
      const { token, user } = res.data;
      onLoginSuccess(token, user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full relative overflow-hidden bg-background text-foreground">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="glow-blob top-[-10%] right-[-10%] opacity-30" />
        <div className="glow-blob bottom-[-15%] left-[-5%] opacity-20 bg-emerald-soft/30 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-[32px] glass z-10 mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-celadon/20 flex items-center justify-center mb-4 border border-celadon/30">
            <Sparkles className="w-8 h-8 text-celadon animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-celadon bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {isLogin ? 'Sign in to access your database portal' : 'Get started by creating your user profile'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5 ml-1">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-celadon/50 focus:ring-1 focus:ring-celadon/50 outline-none transition-all text-sm text-white placeholder-white/20"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-celadon/50 focus:ring-1 focus:ring-celadon/50 outline-none transition-all text-sm text-white placeholder-white/20"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-celadon/50 focus:ring-1 focus:ring-celadon/50 outline-none transition-all text-sm text-white placeholder-white/20"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs py-1.5 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-celadon text-background hover:bg-celadon-dark disabled:opacity-50 transition-all font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-celadon/10 hover:shadow-celadon/25 cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-background" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <span className="text-white/40">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-celadon hover:underline font-semibold"
          >
            {isLogin ? 'Register Here' : 'Login Here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
