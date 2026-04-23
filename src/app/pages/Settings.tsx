import { useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { useDarkMode } from '../context/DarkModeContext';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Download, Upload, Trash2, Moon, Sun, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { exportTasks, importTasks, clearAllTasks } = useTasks();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportTasks();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eisenhower-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Tasks exported successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        importTasks(data);
        toast.success('Tasks imported successfully!');
      } catch (error) {
        toast.error('Failed to import tasks. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
      clearAllTasks();
      toast.success('All tasks cleared');
    }
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    toast.info(`Dark mode ${!darkMode ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-indigo-600 text-white px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon className="w-5 h-5" />
            <span className="text-gray-200 text-sm font-medium">App Settings</span>
          </div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-100 mt-2">
            Manage your preferences and data
          </p>
        </motion.div>
      </div>

      {/* Settings Content */}
      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-xl p-6 border border-border"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <div className="font-medium text-foreground">Dark Mode</div>
                <div className="text-sm text-muted-foreground">Toggle dark theme</div>
              </div>
            </div>
            <button
              onClick={handleToggleDarkMode}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                darkMode ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-xl p-6 border border-border"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">Data Management</h2>
          <div className="space-y-3">
            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition-colors border border-indigo-500/10"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-indigo-400" />
                <div className="text-left">
                  <div className="font-medium text-foreground">Export Tasks</div>
                  <div className="text-sm text-muted-foreground">Download your tasks as JSON</div>
                </div>
              </div>
            </button>

            {/* Import */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-colors border border-green-500/10"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-green-500" />
                <div className="text-left">
                  <div className="font-medium text-foreground">Import Tasks</div>
                  <div className="text-sm text-muted-foreground">Upload tasks from JSON file</div>
                </div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            {/* Clear All */}
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/10"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <div className="font-medium text-foreground">Clear All Tasks</div>
                  <div className="text-sm text-muted-foreground">Delete all tasks permanently</div>
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-xl p-6 border border-border"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground opacity-50 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">About Eisenhower Matrix</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Eisenhower Matrix is a productivity tool that helps you organize tasks by urgency and importance.
                Prioritize what matters most and eliminate time-wasters.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-priority-ui-bg border border-priority-ui-border rounded-lg">
                  <span className={`font-semibold text-priority-ui-text`}>Do First:</span>
                  <span className="text-priority-ui"> Urgent & Important</span>
                </div>
                <div className="p-2 bg-priority-nui-bg border border-priority-nui-border rounded-lg">
                  <span className={`font-semibold text-priority-nui-text`}>Schedule:</span>
                  <span className="text-priority-nui"> Important</span>
                </div>
                <div className="p-2 bg-priority-uni-bg border border-priority-uni-border rounded-lg">
                  <span className={`font-semibold text-priority-uni-text`}>Delegate:</span>
                  <span className="text-priority-uni"> Urgent</span>
                </div>
                <div className="p-2 bg-priority-nuni-bg border border-priority-nuni-border rounded-lg">
                  <span className={`font-semibold text-priority-nuni-text`}>Eliminate:</span>
                  <span className="text-priority-nuni"> Low priority</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
