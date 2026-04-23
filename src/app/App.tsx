import { RouterProvider } from 'react-router';
import { router } from './routes';
import { TaskProvider } from './context/TaskContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <DarkModeProvider>
      <TaskProvider>
        <div className="min-h-screen">
          <RouterProvider router={router} />
          <Toaster position="top-center" />
        </div>
      </TaskProvider>
    </DarkModeProvider>
  );
}