import { motion } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { format } from 'date-fns';

interface NotificationPreviewProps {
  onClose: () => void;
}

export function NotificationPreview({ onClose }: NotificationPreviewProps) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">Daily Reminder</div>
                <div className="text-indigo-200 text-sm">6:00 AM</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">
            Good morning! 🌅
          </h3>
          <p className="text-gray-600 text-sm">
            You have tasks scheduled for {format(new Date(), 'MMMM d')}. 
            Open the app to review your priorities.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
