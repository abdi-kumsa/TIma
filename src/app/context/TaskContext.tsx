import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, Subtask, Priority, RecurringType } from '../types/task';
import { supabase } from '../../lib/supabase';
import { useAuth } from './AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  unarchiveTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, subtaskTitle: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addTag: (taskId: string, tag: string) => Promise<void>;
  removeTag: (taskId: string, tag: string) => Promise<void>;
  exportTasks: () => string;
  importTasks: (data: string) => Promise<void>;
  clearAllTasks: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// DB row ↔ Task converters
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    date: row.date,
    time: row.time ?? undefined,
    priority: row.priority as Priority,
    completed: row.completed,
    archived: row.archived,
    recurring: (row.recurring ?? 'none') as RecurringType,
    tags: row.tags ?? undefined,
    subtasks: row.subtasks ?? undefined,
    createdAt: row.created_at,
  };
}

function taskToDb(task: Omit<Task, 'id' | 'createdAt' | 'completed'>, userId: string) {
  return {
    user_id: userId,
    title: task.title,
    description: task.description ?? '',
    date: task.date,
    time: task.time ?? null,
    priority: task.priority,
    completed: false,
    archived: task.archived ?? false,
    recurring: task.recurring ?? 'none',
    tags: task.tags ?? null,
    subtasks: task.subtasks ?? null,
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------------------------
  // Fetch all tasks for current user
  // -------------------------------------------------------------------------
  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks((data ?? []).map(dbToTask));
    }
    setLoading(false);
  }, [user]);

  // -------------------------------------------------------------------------
  // Initial fetch + real-time subscription
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchTasks();

    // Real-time: any change to YOUR tasks on any device updates state here
    const channel = supabase
      .channel(`tasks-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => {
              // Avoid duplicates (optimistic update already added it)
              if (prev.find((t) => t.id === (payload.new as { id: string }).id)) return prev;
              return [...prev, dbToTask(payload.new)];
            });
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === (payload.new as { id: string }).id ? dbToTask(payload.new) : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== (payload.old as { id: string }).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTasks]);

  // -------------------------------------------------------------------------
  // Helpers: optimistic update + Supabase sync
  // -------------------------------------------------------------------------
  const optimisticUpdate = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  // -------------------------------------------------------------------------
  // CRUD operations
  // -------------------------------------------------------------------------
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    if (!user) return;

    const dbRow = taskToDb(task, user.id);
    const { data, error } = await supabase.from('tasks').insert(dbRow).select().single();

    if (error) {
      console.error('Error adding task:', error);
    } else if (data) {
      setTasks((prev) => [...prev, dbToTask(data)]);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    optimisticUpdate(id, updates); // instant UI feedback

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.time !== undefined) dbUpdates.time = updates.time;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.archived !== undefined) dbUpdates.archived = updates.archived;
    if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Error updating task:', error);
      fetchTasks(); // rollback on error
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id)); // optimistic

    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting task:', error);
      fetchTasks(); // rollback on error
    }
  };

  const toggleTaskComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    await updateTask(id, { completed: newCompleted });

    // Handle recurring tasks
    if (newCompleted && task.recurring && task.recurring !== 'none') {
      const currentDate = new Date(task.date);
      let nextDate = new Date(currentDate);

      switch (task.recurring) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
      }

      const nextDateStr = nextDate.toISOString().split('T')[0];

      // Only create if it doesn't already exist for that date (to avoid spamming)
      const existing = tasks.find((t) => t.title === task.title && t.date === nextDateStr);
      if (!existing) {
        // Create new task for the next occurrence
        const { id: _id, createdAt: _ca, completed: _c, ...taskBase } = task;
        await addTask({
          ...taskBase,
          date: nextDateStr,
        });
      }
    }
  };

  const archiveTask = async (id: string) => {
    await updateTask(id, { archived: true });
  };

  const unarchiveTask = async (id: string) => {
    await updateTask(id, { archived: false });
  };

  // -------------------------------------------------------------------------
  // Subtask operations
  // -------------------------------------------------------------------------
  const addSubtask = async (taskId: string, subtaskTitle: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: subtaskTitle,
      completed: false,
    };
    const updatedSubtasks = [...(task.subtasks ?? []), newSubtask];
    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.subtasks) return;

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.subtasks) return;

    const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);
    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  // -------------------------------------------------------------------------
  // Tag operations
  // -------------------------------------------------------------------------
  const addTag = async (taskId: string, tag: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentTags = task.tags ?? [];
    if (currentTags.includes(tag)) return;
    await updateTask(taskId, { tags: [...currentTags, tag] });
  };

  const removeTag = async (taskId: string, tag: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.tags) return;

    await updateTask(taskId, { tags: task.tags.filter((t) => t !== tag) });
  };

  // -------------------------------------------------------------------------
  // Export / Import / Clear
  // -------------------------------------------------------------------------
  const exportTasks = () => JSON.stringify(tasks, null, 2);

  const importTasks = async (data: string) => {
    if (!user) return;
    try {
      const importedTasks: Task[] = JSON.parse(data);
      if (!Array.isArray(importedTasks)) return;

      // Delete existing tasks first
      await supabase.from('tasks').delete().eq('user_id', user.id);

      // Insert imported tasks
      const rows = importedTasks.map((t) => ({
        user_id: user.id,
        title: t.title,
        description: t.description ?? '',
        date: t.date,
        time: t.time ?? null,
        priority: t.priority,
        completed: t.completed,
        archived: t.archived ?? false,
        recurring: t.recurring ?? 'none',
        tags: t.tags ?? null,
        subtasks: t.subtasks ?? null,
      }));

      const { data: inserted } = await supabase.from('tasks').insert(rows).select();
      if (inserted) setTasks(inserted.map(dbToTask));
    } catch (error) {
      console.error('Failed to import tasks:', error);
    }
  };

  const clearAllTasks = async () => {
    if (!user) return;
    setTasks([]);
    await supabase.from('tasks').delete().eq('user_id', user.id);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        archiveTask,
        unarchiveTask,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        addTag,
        removeTag,
        exportTasks,
        importTasks,
        clearAllTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
}