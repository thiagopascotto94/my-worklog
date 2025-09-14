import api from './api';

export interface Task {
  id: number;
  workSessionId: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  tags?: string;
  observations?: string;
  createdAt: string;
  updatedAt:string;
}

export const getTasksForSession = (workSessionId: number): Promise<{ data: Task[] }> => {
  return api.get(`/tasks/session/${workSessionId}`);
};

export const createTask = (taskData: Partial<Task>): Promise<{ data: Task }> => {
  return api.post('/tasks', taskData);
};

export const updateTask = (id: number, taskData: Partial<Task>): Promise<{ data: Task }> => {
  return api.put(`/tasks/${id}`, taskData);
};

export const deleteTask = (id: number): Promise<void> => {
  return api.delete(`/tasks/${id}`);
};
