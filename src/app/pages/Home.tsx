import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task, PriorityConfig, Priority } from '../types/task';
import { TaskCard } from '../components/TaskCard';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { NotificationPreview } from '../components/NotificationPreview';
import { MatrixInfo } from '../components/MatrixInfo';
import { OnboardingModal } from '../components/OnboardingModal';
import { motion, AnimatePresence } from 'motion/react';
import { format, isToday, parseISO } from 'date-fns';
import { Calendar, Sparkles, Bell } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableTaskCard } from '../components/DraggableTaskCard';
import { DroppableQuadrant } from '../components/DroppableQuadrant';

export default function Home() {
  const { tasks, toggleTaskComplete, updateTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding-completed');
    if (!hasCompletedOnboarding) {
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, []);

  // Filter tasks for today (exclude archived unless showArchived is true)
  const todayTasks = tasks.filter((task) => {
    try {
      const isTodayTask = isToday(parseISO(task.date));
      const isNotArchived = showArchived || !task.archived;
      return isTodayTask && isNotArchived;
    } catch {
      return false;
    }
  });

  // Group tasks by priority
  const tasksByPriority = {
    'important-urgent': todayTasks.filter((t) => t.priority === 'important-urgent'),
    'important-not-urgent': todayTasks.filter((t) => t.priority === 'important-not-urgent'),
    'not-important-urgent': todayTasks.filter((t) => t.priority === 'not-important-urgent'),
    'not-important-not-urgent': todayTasks.filter((t) => t.priority === 'not-important-not-urgent'),
  };

  const handleToggleComplete = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    toggleTaskComplete(taskId);
  };

  const handleDrop = (taskId: string, newPriority: Priority) => {
    updateTask(taskId, { priority: newPriority });
  };

  const priorities: Priority[] = [
    'important-urgent',
    'important-not-urgent',
    'not-important-urgent',
    'not-important-not-urgent',
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-indigo-200 text-sm font-medium">
              {format(new Date(), 'EEEE, MMMM d')}
            </span>
          </div>
          <h1 className="text-3xl font-bold">Today's Focus</h1>
          <p className="text-indigo-100 mt-2">
            {todayTasks.length === 0
              ? 'No tasks for today. Enjoy your day!'
              : `${todayTasks.filter(t => !t.completed).length} tasks to complete`}
          </p>
        </motion.div>
      </div>

      {/* Eisenhower Matrix */}
      <div className="max-w-md mx-auto px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-xl p-4 border border-border"
        >
          {todayTasks.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Sparkles className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                All Clear!
              </h3>
              <p className="text-muted-foreground text-sm">
                You don't have any tasks scheduled for today.
                <br />
                Add a new task to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {priorities.map((priority) => {
                const priorityTasks = tasksByPriority[priority];

                return (
                  <DroppableQuadrant
                    key={priority}
                    priority={priority}
                    taskCount={priorityTasks.length}
                    onDrop={handleDrop}
                  >
                    {priorityTasks.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-xs">
                        No tasks
                      </div>
                    ) : (
                      priorityTasks.map((task) => (
                        <DraggableTaskCard
                          key={task.id}
                          task={task}
                          onClick={() => setSelectedTask(task)}
                          onToggleComplete={(e) => handleToggleComplete(e, task.id)}
                        />
                      ))
                    )}
                  </DroppableQuadrant>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Legend */}
        {todayTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 px-4 pb-4"
          >
            <p className="text-xs text-muted-foreground text-center">
              Tap a task to view details • Tap the circle to mark complete
            </p>
          </motion.div>
        )}

        {/* Daily Reminder Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 space-y-3"
        >
          <button
            onClick={() => setShowNotification(true)}
            className="w-full bg-secondary/50 border border-border rounded-2xl p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-2">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  Daily Reminder Preview
                </h4>
                <p className="text-xs text-muted-foreground opacity-80">
                  See how your daily 6:00 AM notification looks
                </p>
              </div>
            </div>
          </button>

          <div className="flex justify-center">
            <MatrixInfo />
          </div>
        </motion.div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {/* Notification Preview */}
      <AnimatePresence>
        {showNotification && (
          <NotificationPreview onClose={() => setShowNotification(false)} />
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
      </div>
    </DndProvider>
  );
}