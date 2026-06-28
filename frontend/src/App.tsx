import React, { useState, useEffect, useMemo } from 'react';
import type { Task, TaskFormState, Filters, TaskStats as ITaskStats } from './types';
import TaskStats from './components/TaskStats';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Notification from './components/Notification';
import type { Toast } from './components/Notification';
import { ClipboardList, Moon, Sun, Sparkles } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/tasks';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Theme state: default to dark for premium aesthetic
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  // Filters and Sorting
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'createdAt',
    order: 'desc'
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toast Helpers
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Tasks from API
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch all tasks and filter/sort client-side for instantaneous UX & stats precision
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        let errorMsg = 'Failed to fetch tasks';
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
          if (errData.error) {
            errorMsg += `: ${errData.error}`;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        throw new Error('API response did not return a list of tasks. Check that VITE_API_URL ends with "/api/tasks".');
      }
    } catch (error: any) {
      console.error(error);
      addToast('error', error.message || 'Unable to connect to the backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Compute Unfiltered Stats
  const stats = useMemo<ITaskStats>(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return { total, pending, inProgress, completed };
  }, [tasks]);

  // Client-Side Filter and Sort for Instant Response
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by search query
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category);
    }

    // Sort tasks
    result.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'dueDate') {
        // Handle tasks with no due date (push to the end)
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        // Default sort: createdAt
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return filters.order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, filters]);

  // Create or Update Task Action
  const handleCreateOrUpdateTask = async (taskData: TaskFormState): Promise<boolean> => {
    try {
      const isEditing = !!editingTask;
      const url = isEditing ? `${API_BASE_URL}/${editingTask._id}` : API_BASE_URL;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      const result = await response.json();

      if (!response.ok) {
        // Validation or server error
        const errMsg = result.message || 'Operation failed';
        const errors = result.errors ? Object.values(result.errors).join(', ') : '';
        throw new Error(errors ? `${errMsg}: ${errors}` : errMsg);
      }

      if (isEditing) {
        setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? result : t)));
        addToast('success', 'Task updated successfully!');
        setEditingTask(null);
      } else {
        setTasks((prev) => [result, ...prev]);
        addToast('success', 'Task created successfully!');
      }

      return true;
    } catch (error: any) {
      console.error(error);
      addToast('error', error.message || 'Failed to submit task data.');
      return false;
    }
  };

  // Delete Task Action
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete task');
      }

      setTasks((prev) => prev.filter((t) => t._id !== id));
      addToast('success', 'Task deleted successfully.');
      
      // If we deleted the task currently being edited, cancel edit mode
      if (editingTask?._id === id) {
        setEditingTask(null);
      }
    } catch (error: any) {
      console.error(error);
      addToast('error', error.message || 'Failed to delete task.');
    }
  };

  // Toggle Completed Status Checkbox
  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    // Save original state for potential rollback
    const originalTasks = [...tasks];
    
    // Optimistically update status in state instantly
    setTasks((prev) => 
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
    );
    
    try {
      const response = await fetch(`${API_BASE_URL}/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const updatedTask = await response.json();

      if (!response.ok) {
        throw new Error(updatedTask.message || 'Failed to update task status');
      }

      // Sync state with actual server payload
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updatedTask : t)));
      
      if (nextStatus === 'completed') {
        addToast('success', 'Task completed! Keep it up!');
      } else {
        addToast('info', 'Task set back to pending.');
      }
    } catch (error: any) {
      console.error(error);
      addToast('error', error.message || 'Failed to update status.');
      // Rollback to original state on failure
      setTasks(originalTasks);
    }
  };

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <ClipboardList size={24} />
          </div>
          <div className="brand-dot" />
          <h1>
            FocusFlow
            <span className="brand-badge">MERN</span>
          </h1>
        </div>

        <button
          onClick={toggleTheme}
          className="theme-toggle"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      {/* Progress Widget (Only show when there are tasks) */}
      {stats.total > 0 && (
        <div className="progress-widget glass">
          <div className="progress-widget-header">
            <div className="progress-widget-title">
              <Sparkles size={18} style={{ color: 'var(--primary)' }} /> Focus Flow Progress
            </div>
            <div className="progress-widget-percentage">
              {completionPercentage}% Done
            </div>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Dashboard Stats */}
      <TaskStats stats={stats} />

      {/* Grid Layout */}
      <main className="main-layout">
        {/* Sticky Task Form (Left Side) */}
        <section className="sticky-form">
          <TaskForm
            editingTask={editingTask}
            onSubmit={handleCreateOrUpdateTask}
            onCancelEdit={() => setEditingTask(null)}
          />
        </section>

        {/* Task List (Right Side) */}
        <section>
          <TaskList
            tasks={processedTasks}
            filters={filters}
            setFilters={setFilters}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            onToggleStatus={handleToggleStatus}
            isLoading={isLoading}
          />
        </section>
      </main>

      {/* Micro notifications toast layer */}
      <Notification toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default App;
