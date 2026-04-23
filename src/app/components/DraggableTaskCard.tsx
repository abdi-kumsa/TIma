import { useDrag } from 'react-dnd';
import { TaskCard } from './TaskCard';
import { Task } from '../types/task';

interface DraggableTaskCardProps {
  task: Task;
  onClick: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
  selectedIds?: string[];
  isSelectionMode?: boolean;
  onSelect?: (taskId: string) => void;
}

export function DraggableTaskCard({
  task,
  onClick,
  onToggleComplete
}: DraggableTaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: {
      id: task.id,
      currentPriority: task.priority
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [task]);

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.3 : 1,
        cursor: 'grab',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
      }}
      className="relative"
    >
      <TaskCard
        task={task}
        onClick={onClick}
        onToggleComplete={onToggleComplete}
      />
    </div>
  );
}
