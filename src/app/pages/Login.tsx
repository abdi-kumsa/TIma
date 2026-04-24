import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export default function Login() {
  const { signInWithMagicLink, signInWithPin, checkUserStatus } = useAuth();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'email' | 'check' | 'pin' | 'magic' | 'sent' | 'error'>('email');
  const [errorMsg, setErrorMsg] = useState('');

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStep('check');
    setErrorMsg('');

    try {
      const status = await checkUserStatus(email.trim());
      if (status.exists && status.hasPin) {
        setStep('pin');
      } else {
        setStep('magic');
      }
    } catch (err: any) {
      setStep('error');
      setErrorMsg(err.message || 'Something went wrong');
    }
  };

  const handleMagicLink = async () => {
    setStep('check');
    const { error } = await signInWithMagicLink(email.trim());
    if (error) {
      setStep('error');
      setErrorMsg(error);
    } else {
      setStep('sent');
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) return;

    setStep('check');
    const { error } = await signInWithPin(email.trim(), pin);
    if (error) {
      setStep('pin');
      setErrorMsg('Invalid PIN. Please try again.');
      setPin('');
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
          {step === 'sent' ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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
                onClick={() => setStep('email')}
                className="mt-6 text-indigo-300 text-sm hover:text-white transition-colors"
              >
                Use a different email
              </button>
            </motion.div>
          ) : step === 'pin' ? (
            <motion.form
              key="pin"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onSubmit={handlePinLogin}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8"
            >
              <h2 className="text-xl font-bold text-white mb-1">Enter your PIN</h2>
              <p className="text-indigo-300 text-sm mb-6">
                Enter your 6-digit secure PIN for <span className="text-white font-medium">{email}</span>
              </p>

              <div className="space-y-6">
                <div className="flex justify-between gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                        pin.length > i ? 'border-indigo-400 bg-indigo-400/20' : 'border-white/10 bg-white/5'
                      }`}
                    >
                      {pin[i] ? (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      ) : (
                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>

                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  autoFocus
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="sr-only"
                />

                {errorMsg && (
                  <p className="text-red-400 text-sm text-center">{errorMsg}</p>
                )}

                <div className="space-y-3">
                  <motion.button
                    type="submit"
                    disabled={pin.length !== 6 || step === 'check'}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {step === 'check' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                  </motion.button>
                  
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    className="w-full text-indigo-300 text-xs hover:text-white transition-colors"
                  >
                    Forgot PIN? Sign in with email instead
                  </button>
                </div>
              </div>
            </motion.form>
          ) : step === 'magic' ? (
            <motion.div
              key="magic"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Finish your setup</h2>
              <p className="text-indigo-200 text-sm leading-relaxed mb-6">
                To keep your account secure, we need to verify your email first. 
                After that, you'll be able to set your 6-digit PIN.
              </p>
              
              <motion.button
                onClick={handleMagicLink}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                Send Magic Link
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <button
                onClick={() => setStep('email')}
                className="mt-6 text-indigo-300 text-sm hover:text-white transition-colors"
              >
                Back
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="email"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onSubmit={handleContinue}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8"
            >
              <h2 className="text-xl font-bold text-white mb-1">Welcome</h2>
              <p className="text-indigo-300 text-sm mb-6">
                Enter your email to continue to your dashboard
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
                    disabled={step === 'check'}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-indigo-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all disabled:opacity-50"
                  />
                </div>

                {step === 'error' && (
                  <p className="text-red-400 text-sm px-1">{errorMsg}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={step === 'check' || !email.trim()}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {step === 'check' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>

              <p className="text-center text-indigo-400 text-xs mt-6">
                Secure 6-digit PIN login supported
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
