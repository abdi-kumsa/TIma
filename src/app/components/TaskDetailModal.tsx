import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, AlertCircle, Trash2, CheckCircle2, Edit, Clock, Tag, Archive, ArchiveRestore } from 'lucide-react';
import { Task, Priority, PriorityConfig } from '../types/task';
import { format } from 'date-fns';
import { useTasks } from '../context/TaskContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { EditTaskModal } from './EditTaskModal';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const { deleteTask, toggleTaskComplete, archiveTask, unarchiveTask, updateTask } = useTasks();
  const [showEditModal, setShowEditModal] = useState(false);

  if (!task) return null;

  const config = PriorityConfig[task.priority];

  const handleDelete = () => {
    deleteTask(task.id);
    toast.success('Task deleted');
    onClose();
  };

  const handleToggleComplete = () => {
    const wasCompleted = task.completed;
    toggleTaskComplete(task.id);

    if (!wasCompleted) {
      toast.success('Task completed! 🎉');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      toast.info('Task marked as incomplete.');
    }
  };

  const handleArchive = () => {
    if (task.archived) {
      unarchiveTask(task.id);
      toast.success('Task unarchived');
    } else {
      archiveTask(task.id);
      toast.success('Task archived');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className={`bg-gradient-to-br ${config.gradient} border-b ${config.border} p-6 sticky top-0 z-10`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className={`text-xs font-semibold ${config.iconColor} uppercase tracking-wide mb-2`}>
                  {config.label}
                </div>
                <h2 className={`text-2xl font-bold ${config.textColor}`}>
                  {task.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`${config.textColor} opacity-60 hover:opacity-100 transition-opacity`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            {task.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{task.description}</p>
              </div>
            )}

            {/* Date and Time */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Date</div>
                <div className="font-medium text-gray-900">
                  {format(new Date(task.date), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              {task.time && (
                <>
                  <div className="w-px h-8 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div className="font-medium text-gray-900">{task.time}</div>
                  </div>
                </>
              )}
            </div>

            {/* Priority Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Priority</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['important-urgent', 'important-not-urgent', 'not-important-urgent', 'not-important-not-urgent'] as Priority[]).map((p) => {
                  const pConfig = PriorityConfig[p];
                  const isSelected = task.priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => updateTask(task.id, { priority: p })}
                      className={`flex flex-col p-3 rounded-xl border transition-all text-left ${
                        isSelected
                          ? `${pConfig.border} bg-gradient-to-br ${pConfig.gradient} shadow-sm ring-2 ring-primary/20`
                          : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`text-xs font-bold ${isSelected ? pConfig.textColor : 'text-gray-700'}`}>
                        {pConfig.label}
                      </div>
                      <div className={`text-[10px] ${isSelected ? pConfig.textColor : 'text-gray-500'} opacity-70 leading-tight mt-0.5`}>
                        {pConfig.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
                </h3>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      {subtask.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring */}
            {task.recurring && task.recurring !== 'none' && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="text-purple-600 text-sm font-medium">
                  🔄 Repeats {task.recurring}
                </div>
              </div>
            )}

            {/* Status */}
            <div className={`flex items-center gap-3 p-4 rounded-xl ${
              task.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}>
              <CheckCircle2 className={`w-5 h-5 ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className={`font-medium ${task.completed ? 'text-green-900' : 'text-gray-900'}`}>
                  {task.completed ? 'Completed' : 'In Progress'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full py-3 px-4 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Task
              </button>

              <button
                onClick={handleToggleComplete}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                  task.completed
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              </button>

              <button
                onClick={handleArchive}
                className="w-full py-3 px-4 rounded-xl font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
              >
                {task.archived ? (
                  <>
                    <ArchiveRestore className="w-4 h-4" />
                    Unarchive Task
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    Archive Task
                  </>
                )}
              </button>

              <button
                onClick={handleDelete}
                className="w-full py-3 px-4 rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Task
              </button>
            </div>
          </div>
        </motion.div>

        {/* Edit Modal */}
        {showEditModal && (
          <EditTaskModal task={task} onClose={() => setShowEditModal(false)} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}