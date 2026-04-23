import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Clock, CheckCircle2, Circle, Trash2, Check } from 'lucide-react';
import { Task, PriorityConfig } from '../types/task';
import { format } from 'date-fns';
import { useSwipeable } from 'react-swipeable';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export function TaskCard({
  task,
  onClick,
  onToggleComplete,
  onDelete
}: TaskCardProps) {
  const config = PriorityConfig[task.priority];
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeDirection('left');
      setTimeout(() => setSwipeDirection(null), 2000);
    },
    onSwipedRight: () => {
      setSwipeDirection('right');
      setTimeout(() => setSwipeDirection(null), 2000);
    },
    trackMouse: false,
    trackTouch: true,
  });

  return (
    <div {...handlers} className="relative">
      {/* Swipe Indicators */}
      {swipeDirection === 'right' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-green-500 rounded-xl flex items-center justify-start px-4 z-0"
        >
          <Check className="w-6 h-6 text-white" />
        </motion.div>
      )}
      {swipeDirection === 'left' && onDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end px-4 z-0"
        >
          <Trash2 className="w-6 h-6 text-white" />
        </motion.div>
      )}

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`relative ${config.gradient} border ${config.border} rounded-xl p-3 cursor-pointer shadow-sm hover:shadow-md transition-all ${
          task.completed ? 'opacity-40' : ''
        } z-10`}
      >
      <div className="flex items-start gap-2">
        <button
          onClick={onToggleComplete}
          className="mt-0.5 flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className={`w-5 h-5 ${config.iconColor}`} />
          ) : (
            <Circle className={`w-5 h-5 ${config.iconColor}`} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium ${config.textColor} ${
              task.completed ? 'line-through' : ''
            } truncate`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`text-sm mt-1 ${config.textColor} opacity-70 line-clamp-2`}
            >
              {task.description}
            </p>
          )}
          <div className={`flex items-center gap-1 mt-2 text-xs ${config.textColor} opacity-60`}>
            <Clock className="w-3 h-3" />
            <span>{format(new Date(task.date), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
