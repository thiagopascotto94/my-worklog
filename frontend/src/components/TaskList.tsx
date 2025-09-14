import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, TextField, Checkbox, IconButton, List, ListItem, ListItemText, Collapse, Paper, Tooltip } from '@mui/material';
import { Edit, Delete, Comment } from '@mui/icons-material';
import * as taskService from '../services/taskService';
import { Task } from '../services/taskService';
import TaskAutocomplete from './TaskAutocomplete';

interface TaskListProps {
  workSessionId: number;
}

const TaskList: React.FC<TaskListProps> = ({ workSessionId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newContinuedFromTask, setNewContinuedFromTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [openObservations, setOpenObservations] = useState<number | null>(null);
  const [editingInitialTask, setEditingInitialTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await taskService.getTasksForSession(workSessionId);
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  }, [workSessionId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (editingTask && editingTask.continuedFromTaskId) {
      taskService.getTaskById(editingTask.continuedFromTaskId)
        .then(res => setEditingInitialTask(res.data))
        .catch((err: any) => console.error('Failed to fetch initial continued task', err));
    } else {
      setEditingInitialTask(null);
    }
  }, [editingTask]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await taskService.createTask({
        workSessionId,
        title: newTaskTitle,
        continuedFromTaskId: newContinuedFromTask ? newContinuedFromTask.id : undefined,
      });
      setNewTaskTitle('');
      setNewContinuedFromTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleUpdateTask = async (task: Task) => {
    try {
      await taskService.updateTask(task.id, task);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    handleUpdateTask({ ...task, status: newStatus });
  };

  const handleToggleObservations = (taskId: number) => {
    setOpenObservations(openObservations === taskId ? null : taskId);
  };

  const renderTask = (task: Task) => (
    <Paper key={task.id} sx={{ mb: 1 }}>
      <ListItem
        secondaryAction={
          <>
            <Tooltip title="Observations">
              <IconButton edge="end" aria-label="observations" onClick={() => handleToggleObservations(task.id)} disabled={!task.observations}>
                <Comment color={task.observations ? "primary" : "disabled"}/>
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton edge="end" aria-label="edit" onClick={() => setEditingTask(task)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.id)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        }
      >
        <Checkbox
          edge="start"
          checked={task.status === 'completed'}
          tabIndex={-1}
          disableRipple
          onChange={() => toggleTaskStatus(task)}
        />
        <ListItemText
          primary={task.title}
          secondary={task.continuedFromTask ? `Continues: ${task.continuedFromTask.title} (from ${new Date(task.continuedFromTask.createdAt).toLocaleDateString()})` : ''}
          sx={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}
        />
      </ListItem>
      <Collapse in={openObservations === task.id} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="body2">{task.observations}</Typography>
        </Box>
      </Collapse>
    </Paper>
  );

  const renderEditForm = (task: Task) => (
    <Paper sx={{ p: 2, mb: 1 }}>
        <TextField
            label="Title"
            fullWidth
            value={task.title}
            onChange={(e) => setEditingTask({ ...task, title: e.target.value })}
            sx={{ mb: 1 }}
        />
        <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={task.description || ''}
            onChange={(e) => setEditingTask({ ...task, description: e.target.value })}
            sx={{ mb: 1 }}
        />
        <TextField
            label="Tags (comma-separated)"
            fullWidth
            value={task.tags || ''}
            onChange={(e) => setEditingTask({ ...task, tags: e.target.value })}
            sx={{ mb: 1 }}
        />
        <TextField
            label="Observations"
            fullWidth
            multiline
            rows={3}
            value={task.observations || ''}
            onChange={(e) => setEditingTask({ ...task, observations: e.target.value })}
            sx={{ mb: 1 }}
        />
        <TaskAutocomplete
          label="Continue from task"
          value={editingInitialTask}
          onChange={(newValue) => {
            setEditingTask({ ...task, continuedFromTaskId: newValue ? newValue.id : undefined });
            setEditingInitialTask(newValue);
          }}
          disabledIds={[task.id]}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
            <Button onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button variant="contained" onClick={() => handleUpdateTask(task)}>Save</Button>
        </Box>
    </Paper>
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Tasks</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <TextField
          label="New Task Title"
          variant="outlined"
          size="small"
          fullWidth
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
        />
        <TaskAutocomplete
          label="Continue from task"
          value={newContinuedFromTask}
          onChange={setNewContinuedFromTask}
        />
        <Button variant="contained" onClick={handleCreateTask}>Add</Button>
      </Box>
      <List>
        {tasks.map(task => (
            editingTask && editingTask.id === task.id ? renderEditForm(editingTask) : renderTask(task)
        ))}
      </List>
    </Box>
  );
};

export default TaskList;
