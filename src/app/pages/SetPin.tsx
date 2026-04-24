import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function SetPin() {
  const { updatePin, profile } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 6) {
      setStep('confirm');
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== confirmPin) {
      setError("PINs don't match. Try again.");
      setConfirmPin('');
      setStep('create');
      setPin('');
      return;
    }

    setLoading(true);
    const { error: err } = await updatePin(pin);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {step === 'create' ? 'Set your PIN' : 'Confirm your PIN'}
        </h2>
        <p className="text-indigo-300 text-sm text-center mb-8">
          {step === 'create' 
            ? 'Choose a 6-digit secure PIN for faster login next time.'
            : 'Enter the PIN again to confirm it.'}
        </p>

        <form onSubmit={step === 'create' ? handleCreate : handleConfirm} className="space-y-8">
          <div className="flex justify-between gap-2">
            {[...Array(6)].map((_, i) => {
              const value = step === 'create' ? pin : confirmPin;
              return (
                <div
                  key={i}
                  className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                    value.length > i ? 'border-indigo-400 bg-indigo-400/20' : 'border-white/10 bg-white/5'
                  }`}
                >
                  {value[i] ? (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  ) : (
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>

          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={step === 'create' ? pin : confirmPin}
            autoFocus
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              if (step === 'create') setPin(val);
              else setConfirmPin(val);
            }}
            className="sr-only"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={loading || (step === 'create' ? pin.length !== 6 : confirmPin.length !== 6)}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 'create' ? 'Continue' : 'Finalize Setup'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
