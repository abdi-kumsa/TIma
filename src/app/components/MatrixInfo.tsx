import { motion } from 'motion/react';
import { Info, X } from 'lucide-react';
import { useState } from 'react';
import { PriorityConfig } from '../types/task';

export function MatrixInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        <Info className="w-4 h-4" />
        <span>What's the Eisenhower Matrix?</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">The Eisenhower Matrix</h3>
                  <p className="text-indigo-100 text-sm">
                    A powerful time management framework
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                The Eisenhower Matrix helps you prioritize tasks by urgency and importance, 
                resulting in four quadrants:
              </p>

              <div className="space-y-3">
                {Object.entries(PriorityConfig).map(([key, config]) => (
                  <div
                    key={key}
                    className={`bg-gradient-to-br ${config.gradient} border ${config.border} rounded-xl p-4`}
                  >
                    <div className={`font-semibold ${config.textColor} mb-1`}>
                      {config.label}
                    </div>
                    <div className={`text-xs ${config.textColor} opacity-70 mb-2`}>
                      {config.subtitle}
                    </div>
                    <div className={`text-sm ${config.textColor} opacity-80`}>
                      {key === 'important-urgent' && 'Do these tasks immediately. They require your attention now.'}
                      {key === 'important-not-urgent' && 'Schedule these tasks. They contribute to long-term goals.'}
                      {key === 'not-important-urgent' && 'Delegate if possible. These are distractions with deadlines.'}
                      {key === 'not-important-not-urgent' && 'Eliminate or minimize. These tasks waste time.'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Named after President Dwight D. Eisenhower, who said: 
                  <br />
                  <em>"What is important is seldom urgent, and what is urgent is seldom important."</em>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
