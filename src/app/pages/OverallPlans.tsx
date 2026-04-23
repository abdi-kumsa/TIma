import { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task, Priority, PriorityConfig } from '../types/task';
import { TaskCard } from '../components/TaskCard';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { NotificationPreview } from '../components/NotificationPreview';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Filter, ListTodo, Bell, Search, Archive, Eye, EyeOff } from 'lucide-react';
import { format, parseISO, compareAsc } from 'date-fns';

type FilterType = 'all' | Priority;

export default function OverallPlans() {
  const { tasks, toggleTaskComplete, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showNotification, setShowNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by archived status
    if (!showArchived) {
      result = result.filter((t) => !t.archived);
    }

    // Filter by completed status
    if (!showCompleted) {
      result = result.filter((t) => !t.completed);
    }

    // Filter by priority
    if (filter !== 'all') {
      result = result.filter((t) => t.priority === filter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort by date
    return result.sort((a, b) => {
      try {
        return compareAsc(parseISO(a.date), parseISO(b.date));
      } catch {
        return 0;
      }
    });
  }, [tasks, filter, searchQuery, showArchived, showCompleted]);

  // Group tasks by date
  const tasksByDate = filteredTasks.reduce((acc, task) => {
    const dateKey = format(parseISO(task.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleToggleComplete = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    toggleTaskComplete(taskId);
  };

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Tasks' },
    { value: 'important-urgent', label: 'Do First' },
    { value: 'important-not-urgent', label: 'Schedule' },
    { value: 'not-important-urgent', label: 'Delegate' },
    { value: 'not-important-not-urgent', label: 'Eliminate' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="flex items-center gap-2 mb-2">
            <ListTodo className="w-5 h-5" />
            <span className="text-indigo-200 text-sm font-medium">All Tasks</span>
          </div>
          <h1 className="text-3xl font-bold">Overall Plans</h1>
          <p className="text-indigo-100 mt-2">
            {tasks.length === 0
              ? 'No tasks yet. Create your first task!'
              : `${tasks.length} total tasks • ${tasks.filter(t => !t.completed).length} active`}
          </p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-md mx-auto px-4 -mt-4 mb-4 space-y-3">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Search Tasks</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or tags..."
            className="w-full px-4 py-2 rounded-xl border border-border bg-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          />
        </motion.div>

        {/* Toggle Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl shadow-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showCompleted
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {showCompleted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Completed
            </button>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showArchived
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              <Archive className="w-4 h-4" />
              Archived
            </button>
          </div>
        </motion.div>

        {/* Priority Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Filter by Priority</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const isSelected = filter === option.value;
              const config = option.value !== 'all' ? PriorityConfig[option.value as Priority] : null;

              return (
                <motion.button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? config
                        ? `bg-gradient-to-r ${config.gradient} ${config.textColor} border ${config.border}`
                        : 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {option.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Tasks List */}
      <div className="max-w-md mx-auto px-4 space-y-6">
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-xl p-12 text-center border border-border"
          >
            <Calendar className="w-16 h-16 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filter === 'all' ? 'No Tasks Yet' : 'No Tasks in This Category'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {filter === 'all'
                ? 'Start by creating your first task!'
                : 'Try selecting a different filter.'}
            </p>
          </motion.div>
        ) : (
          Object.entries(tasksByDate).map(([dateKey, dateTasks], index) => (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-3"
            >
              {/* Date Header */}
              <div className="flex items-center gap-2 px-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {format(parseISO(dateKey), 'EEEE, MMMM d, yyyy')}
                </h3>
                <span className="text-xs text-muted-foreground">
                  ({dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'})
                </span>
              </div>

              {/* Tasks for this date */}
              <div className="space-y-2">
                {dateTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onToggleComplete={(e) => handleToggleComplete(e, task.id)}
                  />
                ))}
              </div>
            </motion.div>
          ))
        )}
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
    </div>
  );
}