import React, { useState, useEffect } from 'react';
import type { Task, TaskFormState } from '../types';
import { PlusCircle, Save, XCircle } from 'lucide-react';

interface TaskFormProps {
  editingTask: Task | null;
  onSubmit: (taskData: TaskFormState) => Promise<boolean>;
  onCancelEdit: () => void;
}

const initialFormState: TaskFormState = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  category: 'work',
  dueDate: ''
};

const TaskForm: React.FC<TaskFormProps> = ({ editingTask, onSubmit, onCancelEdit }) => {
  const [formData, setFormData] = useState<TaskFormState>(initialFormState);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [touched, setTouched] = useState<{ title?: boolean; description?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        status: editingTask.status,
        priority: editingTask.priority,
        category: editingTask.category || 'work',
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData(initialFormState);
      setErrors({});
      setTouched({});
    }
  }, [editingTask]);

  const validate = (name: string, value: string) => {
    let error = '';
    if (name === 'title') {
      if (!value.trim()) {
        error = 'Title is required';
      } else if (value.trim().length < 3) {
        error = 'Title must be at least 3 characters long';
      } else if (value.length > 100) {
        error = 'Title cannot exceed 100 characters';
      }
    } else if (name === 'description') {
      if (value.length > 500) {
        error = 'Description cannot exceed 500 characters';
      }
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // In-line validation
    if (touched[name as keyof typeof touched]) {
      const error = validate(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const titleError = validate('title', formData.title);
    const descError = validate('description', formData.description);
    
    if (titleError || descError) {
      setErrors({ title: titleError, description: descError });
      setTouched({ title: true, description: true });
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit(formData);
    setIsSubmitting(false);

    if (success && !editingTask) {
      setFormData(initialFormState);
      setTouched({});
      setErrors({});
    }
  };

  return (
    <div className="form-wrapper glass">
      <h2>
        {editingTask ? (
          <>
            <Save size={20} className="text-primary" /> Edit Task
          </>
        ) : (
          <>
            <PlusCircle size={20} className="text-primary" /> Create New Task
          </>
        )}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Design Landing Page"
            className="form-input"
            disabled={isSubmitting}
            maxLength={105}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {errors.title && touched.title ? (
              <span className="error-text">{errors.title}</span>
            ) : (
              <span />
            )}
            <span className="char-counter">{formData.title.length}/100</span>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Provide context or instructions for this task..."
            className="form-textarea"
            disabled={isSubmitting}
            maxLength={510}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {errors.description && touched.description ? (
              <span className="error-text">{errors.description}</span>
            ) : (
              <span />
            )}
            <span className="char-counter">{formData.description.length}/500</span>
          </div>
        </div>

        {/* Priority & Status Group */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Category & Due Date Group */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="urgent">Urgent</option>
              <option value="learning">Learning</option>
              <option value="health">Health</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          {editingTask && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              <XCircle size={16} /> Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="inline-spinner" />
            ) : editingTask ? (
              <>
                <Save size={16} /> Update
              </>
            ) : (
              <>
                <PlusCircle size={16} /> Create
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
