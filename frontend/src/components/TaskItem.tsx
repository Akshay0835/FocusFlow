import React, { useState } from 'react';
import type { Task, TaskCategory } from '../types';
import { 
  Edit2, Trash2, Calendar, AlertCircle, 
  Briefcase, User, AlertTriangle, BookOpen, Heart, Tag,
  Flame, Clock
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

const categoryDetails: Record<TaskCategory, { label: string; icon: React.ReactNode; class: string }> = {
  work: { label: 'Work', icon: <Briefcase size={12} />, class: 'badge-work' },
  personal: { label: 'Personal', icon: <User size={12} />, class: 'badge-personal' },
  urgent: { label: 'Urgent', icon: <AlertTriangle size={12} />, class: 'badge-urgent' },
  learning: { label: 'Learning', icon: <BookOpen size={12} />, class: 'badge-learning' },
  health: { label: 'Health', icon: <Heart size={12} />, class: 'badge-health' },
  others: { label: 'Others', icon: <Tag size={12} />, class: 'badge-others' }
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const [particles, setParticles] = useState<{ id: number; tx: string; ty: string; color: string }[]>([]);

  // Format Date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Check if overdue
  const isOverdue = () => {
    if (!task.dueDate || task.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Get accent color based on priority
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'var(--danger)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--primary)';
    }
  };

  // Get glow shadow color based on priority
  const getPriorityGlow = () => {
    switch (task.priority) {
      case 'high':
        return 'var(--danger-glow)';
      case 'medium':
        return 'var(--warning-glow)';
      case 'low':
        return 'var(--success-glow)';
      default:
        return 'var(--primary-glow)';
    }
  };

  // Trigger completion click explosion particles
  const handleCheckboxChange = () => {
    // Play particle burst if toggled to completed
    if (task.status !== 'completed') {
      const colors = ['#f472b6', '#6366f1', '#34d399', '#fbbf24', '#f87171', '#06b6d4'];
      const newParticles = Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180;
        const velocity = 25 + Math.random() * 35;
        const tx = `${Math.cos(angle) * velocity}px`;
        const ty = `${Math.sin(angle) * velocity}px`;
        return {
          id: Math.random(),
          tx,
          ty,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      });
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 600);
    }
    onToggleStatus(task);
  };

  const category = task.category || 'work';
  const catInfo = categoryDetails[category];

  // Get priority icon
  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return <Flame size={12} />;
      case 'medium':
        return <AlertCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  return (
    <div
      className={`task-card glass ${task.status === 'completed' ? 'task-completed' : ''}`}
      style={
        {
          '--card-accent': getPriorityColor(),
          '--card-glow': getPriorityGlow()
        } as React.CSSProperties
      }
    >
      <div className="task-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
          <div className="status-checkbox-wrapper">
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={handleCheckboxChange}
              className="status-checkbox"
              title="Mark task completed"
            />
            {/* Render particles burst container */}
            {particles.length > 0 && (
              <div className="particle-container">
                {particles.map((p) => (
                  <div
                    key={p.id}
                    className="particle"
                    style={
                      {
                        backgroundColor: p.color,
                        '--tx': p.tx,
                        '--ty': p.ty
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            )}
          </div>
          <span className="task-card-title">{task.title}</span>
        </div>

        <div className="task-card-actions">
          <button
            onClick={() => onEdit(task)}
            className="action-btn edit"
            title="Edit Task"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="action-btn delete"
            title="Delete Task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {task.description && <p className="task-card-desc">{task.description}</p>}

      <div className="task-card-footer">
        <div className="task-meta-group">
          {/* Status Badge */}
          <span className={`badge badge-${task.status}`}>
            {task.status}
          </span>
          
          {/* Priority Badge */}
          <span className={`badge badge-${task.priority}`}>
            {getPriorityIcon()} <span style={{ marginLeft: '0.25rem' }}>{task.priority}</span>
          </span>

          {/* Category Pill Tag */}
          <span className={`badge badge-category ${catInfo.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            {catInfo.icon} {catInfo.label}
          </span>
        </div>

        {/* Due Date Indicator */}
        {task.dueDate && (
          <span className={`task-date ${isOverdue() ? 'overdue' : ''}`}>
            {isOverdue() ? (
              <>
                <AlertCircle size={14} />
                Overdue ({formatDate(task.dueDate)})
              </>
            ) : (
              <>
                <Calendar size={14} />
                Due {formatDate(task.dueDate)}
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
