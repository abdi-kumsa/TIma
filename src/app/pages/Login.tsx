import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export default function Login() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    const { error } = await signInWithMagicLink(email.trim());

    if (error) {
      setStatus('error');
      setErrorMsg(error);
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl shadow-indigo-500/30 mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-tight">TIma</h1>
          <p className="text-indigo-300 mt-2 text-sm">Your Eisenhower Matrix, everywhere</p>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          {status === 'sent' ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
              >
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email!</h2>
              <p className="text-indigo-200 text-sm leading-relaxed">
                We sent a magic link to{' '}
                <span className="text-white font-medium">{email}</span>.
                <br />Click it to sign in — no password needed.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 text-indigo-300 text-sm hover:text-white transition-colors"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={handleSubmit}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8"
            >
              <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-indigo-300 text-sm mb-6">
                Enter your email and we'll send you a magic link
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={status === 'loading'}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-indigo-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all disabled:opacity-50"
                  />
                </div>

                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm px-1"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Magic Link
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>

              <p className="text-center text-indigo-400 text-xs mt-6">
                No password required · Works on all your devices
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
