import React from 'react';
import type { TaskStats as ITaskStats } from '../types';
import { CheckSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TaskStatsProps {
  stats: ITaskStats;
}

const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  const statItems = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: <CheckSquare size={22} style={{ color: 'var(--primary)' }} />,
      bg: 'var(--primary-light)',
      borderColor: 'var(--primary)',
      glow: 'rgba(99, 102, 241, 0.15)'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <Clock size={22} style={{ color: 'var(--text-secondary)' }} />,
      bg: 'var(--border-color)',
      borderColor: 'var(--text-secondary)',
      glow: 'rgba(100, 116, 139, 0.1)'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: <AlertCircle size={22} style={{ color: 'var(--warning)' }} />,
      bg: 'var(--warning-light)',
      borderColor: 'var(--warning)',
      glow: 'rgba(245, 158, 11, 0.15)'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />,
      bg: 'var(--success-light)',
      borderColor: 'var(--success)',
      glow: 'rgba(16, 185, 129, 0.15)'
    }
  ];

  return (
    <div className="stats-grid">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="stat-card glass"
          style={
            {
              borderLeft: `4px solid ${item.borderColor}`,
              '--stat-glow-color': item.glow
            } as React.CSSProperties
          }
        >
          <div className="stat-icon" style={{ backgroundColor: item.bg }}>
            {item.icon}
          </div>
          <div className="stat-info">
            <h3>{item.title}</h3>
            <div className="stat-value">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskStats;
