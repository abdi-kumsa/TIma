export type Priority =
  | 'important-urgent'
  | 'important-not-urgent'
  | 'not-important-urgent'
  | 'not-important-not-urgent';

export type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time?: string; // Optional time in HH:mm format
  priority: Priority;
  completed: boolean;
  createdAt: string;
  archived?: boolean;
  tags?: string[];
  subtasks?: Subtask[];
  recurring?: RecurringType;
  recurringEndDate?: string; // For recurring tasks
}

export const PriorityConfig = {
  'important-urgent': {
    label: 'Do First',
    subtitle: 'Important & Urgent',
    color: 'red',
    gradient: 'bg-priority-ui-bg',
    border: 'border-priority-ui-border',
    textColor: 'text-priority-ui-text',
    iconColor: 'text-priority-ui',
  },
  'important-not-urgent': {
    label: 'Schedule',
    subtitle: 'Important & Not Urgent',
    color: 'yellow',
    gradient: 'bg-priority-nui-bg',
    border: 'border-priority-nui-border',
    textColor: 'text-priority-nui-text',
    iconColor: 'text-priority-nui',
  },
  'not-important-urgent': {
    label: 'Delegate',
    subtitle: 'Urgent & Not Important',
    color: 'blue',
    gradient: 'bg-priority-uni-bg',
    border: 'border-priority-uni-border',
    textColor: 'text-priority-uni-text',
    iconColor: 'text-priority-uni',
  },
  'not-important-not-urgent': {
    label: 'Eliminate',
    subtitle: 'Not Urgent & Not Important',
    color: 'gray',
    gradient: 'bg-priority-nuni-bg',
    border: 'border-priority-nuni-border',
    textColor: 'text-priority-nuni-text',
    iconColor: 'text-priority-nuni',
  },
} as const;
