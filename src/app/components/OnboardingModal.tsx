import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
}

const onboardingSteps = [
  {
    title: 'Welcome to Eisenhower Matrix',
    description: 'Master your productivity by organizing tasks based on urgency and importance.',
    icon: '🎯',
  },
  {
    title: 'Do First (Red)',
    description: 'Important & Urgent tasks require immediate attention. Handle these crisis situations and deadlines first.',
    icon: '🔴',
    gradient: 'from-red-50 to-red-100',
  },
  {
    title: 'Schedule (Yellow)',
    description: 'Important but Not Urgent tasks are your long-term goals. Schedule time for personal growth and planning.',
    icon: '🟡',
    gradient: 'from-amber-50 to-amber-100',
  },
  {
    title: 'Delegate (Blue)',
    description: 'Urgent but Not Important tasks can be delegated. These are interruptions that prevent you from your goals.',
    icon: '🔵',
    gradient: 'from-blue-50 to-blue-100',
  },
  {
    title: 'Eliminate (Gray)',
    description: 'Not Urgent & Not Important tasks are time-wasters. Consider eliminating these distractions.',
    icon: '⚪',
    gradient: 'from-gray-50 to-gray-100',
  },
  {
    title: 'Features at Your Fingertips',
    description: 'Drag & drop to reprioritize, swipe for quick actions, add subtasks, tags, recurring tasks, and more!',
    icon: '✨',
  },
];

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboarding-completed', 'true');
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true');
    onClose();
  };

  const step = onboardingSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Getting Started</span>
            </div>
            <button onClick={handleSkip} className="text-white/80 hover:text-white transition-opacity">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${
                  step.gradient || 'from-indigo-100 to-purple-100'
                } flex items-center justify-center text-5xl`}
              >
                {step.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                {step.title}
              </h2>
              <p className="text-gray-600 text-center leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-indigo-600 w-6'
                    : index < currentStep
                    ? 'bg-indigo-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="px-6 pb-6 flex items-center justify-between gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
