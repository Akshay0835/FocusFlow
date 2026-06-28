import React from 'react';
import type { Task, Filters } from '../types';
import TaskItem from './TaskItem';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
  isLoading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  filters,
  setFilters,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSortOrder = () => {
    setFilters((prev) => ({
      ...prev,
      order: prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div>
      {/* Search and Filters panel */}
      <div className="controls-wrapper glass">
        {/* Search */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleSearchChange}
            className="form-input"
          />
        </div>

        {/* Filter Status */}
        <div>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-select"
            title="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Filter Priority */}
        <div>
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="form-select"
            title="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Filter Category */}
        <div>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="form-select"
            title="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="urgent">Urgent</option>
            <option value="learning">Learning</option>
            <option value="health">Health</option>
            <option value="others">Others</option>
          </select>
        </div>
      </div>

      {/* Toolbar / Sorting */}
      <div className="toolbar">
        <div className="toolbar-info">
          {isLoading ? (
            'Syncing FocusFlow...'
          ) : (
            <>
              Showing <span>{tasks.length}</span> task{tasks.length !== 1 ? 's' : ''}
            </>
          )}
        </div>

        <div className="sort-controls">
          <ArrowUpDown size={14} style={{ color: 'var(--text-secondary)' }} />
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="sort-select"
            title="Sort field"
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
          </select>
          <button
            onClick={toggleSortOrder}
            className="sort-order-btn"
            title={`Sort ${filters.order === 'asc' ? 'ascending' : 'descending'}`}
          >
            {filters.order === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </button>
        </div>
      </div>

      {/* List content */}
      {isLoading ? (
        <div className="spinner" />
      ) : tasks.length > 0 ? (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state glass">
          <ClipboardList className="empty-icon" size={48} />
          <h3>No tasks found</h3>
          <p>Try refining your search queries or create a new task to get started.</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
