import { useTasks } from '../context/TaskContext';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, CheckCircle2, Target, Calendar, Tag } from 'lucide-react';
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';
import { PriorityConfig } from '../types/task';

export default function Stats() {
  const { tasks } = useTasks();

  // Calculate statistics
  const totalTasks = tasks.filter((t) => !t.archived).length;
  const completedTasks = tasks.filter((t) => t.completed && !t.archived).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Today's stats
  const todayTasks = tasks.filter((t) => {
    try {
      return isToday(parseISO(t.date)) && !t.archived;
    } catch {
      return false;
    }
  });
  const todayCompleted = todayTasks.filter((t) => t.completed).length;

  // This week's stats
  const weekTasks = tasks.filter((t) => {
    try {
      return isThisWeek(parseISO(t.date)) && !t.archived;
    } catch {
      return false;
    }
  });
  const weekCompleted = weekTasks.filter((t) => t.completed).length;

  // This month's stats
  const monthTasks = tasks.filter((t) => {
    try {
      return isThisMonth(parseISO(t.date)) && !t.archived;
    } catch {
      return false;
    }
  });
  const monthCompleted = monthTasks.filter((t) => t.completed).length;

  // Priority distribution
  const priorityStats = {
    'important-urgent': tasks.filter((t) => t.priority === 'important-urgent' && !t.archived).length,
    'important-not-urgent': tasks.filter((t) => t.priority === 'important-not-urgent' && !t.archived).length,
    'not-important-urgent': tasks.filter((t) => t.priority === 'not-important-urgent' && !t.archived).length,
    'not-important-not-urgent': tasks.filter((t) => t.priority === 'not-important-not-urgent' && !t.archived).length,
  };

  // Tag statistics
  const allTags = tasks.flatMap((t) => t.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-purple-200 text-sm font-medium">Productivity</span>
          </div>
          <h1 className="text-3xl font-bold">Your Statistics</h1>
          <p className="text-purple-100 mt-2">
            Track your progress and insights
          </p>
        </motion.div>
      </div>

      {/* Stats Content */}
      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-xl p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-semibold text-foreground">Total Tasks</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{totalTasks}</div>
            <div className="text-xs text-muted-foreground mt-1">{activeTasks} active</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl shadow-xl p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-foreground">Completed</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{completedTasks}</div>
            <div className="text-xs text-green-500 mt-1">{completionRate}% completion</div>
          </motion.div>
        </div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-foreground">Completion Rate</h2>
          </div>
          <div className="relative w-full h-4 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
          <div className="text-center mt-2 text-sm text-muted-foreground">
            {completedTasks} of {totalTasks} tasks completed
          </div>
        </motion.div>

        {/* Time-based Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl shadow-xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-foreground">Time-based Progress</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Today</span>
                <span className="font-semibold text-foreground">
                  {todayCompleted}/{todayTasks.length}
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: `${todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-semibold text-foreground">
                  {weekCompleted}/{weekTasks.length}
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${weekTasks.length > 0 ? (weekCompleted / weekTasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-semibold text-foreground">
                  {monthCompleted}/{monthTasks.length}
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                  style={{ width: `${monthTasks.length > 0 ? (monthCompleted / monthTasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-xl p-6 border border-border"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">Priority Distribution</h2>
          <div className="space-y-3">
            {Object.entries(priorityStats).map(([priority, count]) => {
              const config = PriorityConfig[priority as keyof typeof PriorityConfig];
              const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;

              return (
                <div key={priority}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${config.textColor}`}>{config.label}</span>
                    <span className="font-semibold text-foreground">{count} tasks</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${config.gradient}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Tags */}
        {topTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl shadow-xl p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-foreground">Top Tags</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
                >
                  <span className="text-sm font-medium text-indigo-400">{tag}</span>
                  <span className="text-xs text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
