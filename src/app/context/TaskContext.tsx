import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Subtask } from '../types/task';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  archiveTask: (id: string) => void;
  unarchiveTask: (id: string) => void;
  addSubtask: (taskId: string, subtaskTitle: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addTag: (taskId: string, tag: string) => void;
  removeTag: (taskId: string, tag: string) => void;
  exportTasks: () => string;
  importTasks: (data: string) => void;
  clearAllTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Sample demo tasks
const getDemoTasks = (): Task[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: crypto.randomUUID(),
      title: 'Complete project deadline',
      description: 'Finish the Q1 presentation and submit to the team for review.',
      date: today.toISOString(),
      priority: 'important-urgent',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Plan vacation',
      description: 'Research destinations and book flights for summer vacation.',
      date: today.toISOString(),
      priority: 'important-not-urgent',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Respond to emails',
      description: 'Reply to pending client emails and schedule follow-up meetings.',
      date: today.toISOString(),
      priority: 'not-important-urgent',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Learn new recipe',
      description: 'Try cooking something new this weekend.',
      date: tomorrow.toISOString(),
      priority: 'not-important-not-urgent',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Team meeting',
      description: 'Weekly sync with the product team.',
      date: tomorrow.toISOString(),
      priority: 'important-not-urgent',
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ];
};

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem('eisenhower-tasks');
    if (stored) {
      return JSON.parse(stored);
    }
    // Return demo tasks for first-time users
    return getDemoTasks();
  });

  useEffect(() => {
    localStorage.setItem('eisenhower-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };


  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const archiveTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, archived: true } : task))
    );
  };

  const unarchiveTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, archived: false } : task))
    );
  };

  const addSubtask = (taskId: string, subtaskTitle: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newSubtask: Subtask = {
            id: crypto.randomUUID(),
            title: subtaskTitle,
            completed: false,
          };
          return {
            ...task,
            subtasks: [...(task.subtasks || []), newSubtask],
          };
        }
        return task;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return task;
      })
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
          };
        }
        return task;
      })
    );
  };

  const addTag = (taskId: string, tag: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const currentTags = task.tags || [];
          if (!currentTags.includes(tag)) {
            return { ...task, tags: [...currentTags, tag] };
          }
        }
        return task;
      })
    );
  };

  const removeTag = (taskId: string, tag: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.tags) {
          return { ...task, tags: task.tags.filter((t) => t !== tag) };
        }
        return task;
      })
    );
  };

  const exportTasks = () => {
    return JSON.stringify(tasks, null, 2);
  };

  const importTasks = (data: string) => {
    try {
      const importedTasks = JSON.parse(data);
      if (Array.isArray(importedTasks)) {
        setTasks(importedTasks);
      }
    } catch (error) {
      console.error('Failed to import tasks:', error);
    }
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
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