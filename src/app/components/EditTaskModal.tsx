import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, FileText, Type, Clock, Tag, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Task, Priority, PriorityConfig, RecurringType } from '../types/task';
import { useTasks } from '../context/TaskContext';
import { toast } from 'sonner';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
}

export function EditTaskModal({ task, onClose }: EditTaskModalProps) {
  const { updateTask, addSubtask, toggleSubtask, deleteSubtask, addTag, removeTag } = useTasks();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [date, setDate] = useState(new Date(task.date).toISOString().split('T')[0]);
  const [time, setTime] = useState(task.time || '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [recurring, setRecurring] = useState<RecurringType>(task.recurring || 'none');
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      date: new Date(date).toISOString(),
      time: time || undefined,
      priority,
      recurring,
    });

    toast.success('Task updated successfully!');
    onClose();
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(task.id, newTag.trim());
      setNewTag('');
    }
  };

  const priorities: Priority[] = [
    'important-urgent',
    'important-not-urgent',
    'not-important-urgent',
    'not-important-not-urgent',
  ];

  const recurringOptions: { value: RecurringType; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

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
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Edit Task</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-opacity">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Type className="w-4 h-4" />
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details or notes..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Recurring */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Recurring
              </label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as RecurringType)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              >
                {recurringOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                Priority Quadrant
              </label>
              <div className="grid grid-cols-2 gap-3">
                {priorities.map((p) => {
                  const config = PriorityConfig[p];
                  const isSelected = priority === p;

                  return (
                    <motion.button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${config.border} bg-gradient-to-br ${config.gradient} shadow-md`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="priority-indicator-edit"
                          className={`absolute top-2 right-2 w-2 h-2 ${config.iconColor} bg-current rounded-full`}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                      <div className={`text-sm font-bold ${isSelected ? config.textColor : 'text-gray-700'}`}>
                        {config.label}
                      </div>
                      <div className={`text-xs mt-1 ${isSelected ? config.textColor : 'text-gray-500'} opacity-70`}>
                        {config.subtitle}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Subtasks */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Subtasks
              </label>
              <div className="space-y-2 mb-3">
                {task.subtasks && task.subtasks.length > 0 ? (
                  task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSubtask(task.id, subtask.id)}
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'
                        }`}
                      >
                        {subtask.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteSubtask(task.id, subtask.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No subtasks yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {task.tags && task.tags.length > 0 ? (
                  task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(task.id, tag)}
                        className="hover:text-indigo-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No tags yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Save Changes
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
