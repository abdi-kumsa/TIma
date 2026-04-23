import { useDrop } from 'react-dnd';
import { motion } from 'motion/react';
import { Priority, PriorityConfig } from '../types/task';

interface DroppableQuadrantProps {
  priority: Priority;
  taskCount: number;
  onDrop: (taskId: string, newPriority: Priority) => void;
  children: React.ReactNode;
}

export function DroppableQuadrant({ priority, taskCount, onDrop, children }: DroppableQuadrantProps) {
  const config = PriorityConfig[priority];

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string; currentPriority: Priority }) => {
      if (item.currentPriority !== priority) {
        onDrop(item.id, priority);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onDrop, priority]);

  return (
    <motion.div
      ref={drop}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`space-y-2 transition-all ${isOver ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}
    >
      {/* Quadrant Header */}
      <div className={`${config.gradient} border ${config.border} rounded-xl p-3 text-center`}>
        <h3 className={`text-sm font-bold ${config.textColor}`}>
          {config.label}
        </h3>
        <p className={`text-xs ${config.textColor} opacity-70 mt-0.5`}>
          {config.subtitle}
        </p>
        <div className={`text-xs ${config.iconColor} font-semibold mt-2`}>
          {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2 min-h-[100px]">
        {children}
      </div>
    </motion.div>
  );
}
