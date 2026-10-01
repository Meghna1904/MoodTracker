import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  alpha,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  PlayCircleOutline as InProgressIcon,
  Flag as FlagIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import TaskService, { RescheduleOption, RescheduleSuggestion, Task, TaskDifficulty, TaskPriority, TaskStatus } from '../../services/TaskService';
import AuthService from '../../services/AuthService';
import RescheduleSuggestionCard from './RescheduleSuggestionCard';
import {
  dismissSuggestionForToday,
  formatSuggestionOptionLabel,
  getSuggestionScheduledTime,
  isSuggestionDismissedToday,
} from './rescheduleSuggestionUtils';

interface TaskFormData {
  title: string;
  description: string;
  deadline: Date | null;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  status: TaskStatus;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  HIGH: '#e63946',
  MEDIUM: '#f4a261',
  LOW: '#2a9d8f',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  COMPLETED: '#2a9d8f',
  IN_PROGRESS: '#f4a261',
  PENDING: '#e63946',
  RESCHEDULED: '#6d6875',
};

const STATUS_ICONS: Record<TaskStatus, React.ElementType> = {
  COMPLETED: CheckCircleIcon,
  IN_PROGRESS: InProgressIcon,
  PENDING: PendingIcon,
  RESCHEDULED: FlagIcon,
};

const defaultForm = (): TaskFormData => ({
  title: '',
  description: '',
  deadline: null,
  priority: 'MEDIUM',
  difficulty: 'MEDIUM',
  status: 'PENDING',
});

const TaskManagement = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormData>(defaultForm());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, RescheduleSuggestion>>({});
  const [activeSuggestion, setActiveSuggestion] = useState<RescheduleSuggestion | null>(null);
  const [activeSuggestionTask, setActiveSuggestionTask] = useState<Task | null>(null);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customRescheduleDate, setCustomRescheduleDate] = useState<Date | null>(new Date());
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const userId = AuthService.getUserId() ?? '';

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [data, rescheduleSuggestions] = await Promise.all([
        TaskService.getUserTasks(userId),
        TaskService.getRescheduleSuggestions(userId),
      ]);
      setTasks(data);
      setSuggestions(
        rescheduleSuggestions
          .filter((suggestion) => suggestion.shouldSuggestReschedule && !isSuggestionDismissedToday(suggestion.taskId))
          .reduce<Record<string, RescheduleSuggestion>>((acc, suggestion) => {
            acc[suggestion.taskId] = suggestion;
            return acc;
          }, {})
      );
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openAdd = () => {
    setEditingTask(null);
    setForm(defaultForm());
    setOpenDialog(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      deadline: task.deadline ? new Date(task.deadline) : null,
      priority: task.priority,
      difficulty: task.difficulty ?? 'MEDIUM',
      status: task.status,
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: Task = {
        userId,
        title: form.title,
        description: form.description,
        priority: form.priority,
        difficulty: form.difficulty,
        status: form.status,
        deadline: form.deadline ? form.deadline.toISOString() : undefined,
        isReschedulable: true,
      };

      if (editingTask?.id) {
        await TaskService.updateTask(editingTask.id, payload);
        setSnackbar({ open: true, message: 'Task updated!', severity: 'success' });
      } else {
        await TaskService.createTask(payload);
        setSnackbar({ open: true, message: 'Task created!', severity: 'success' });
      }

      handleClose();
      await fetchTasks();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save task.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSuggestions((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setSnackbar({ open: true, message: 'Task deleted.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete task.', severity: 'error' });
    }
  };

  const handleStatusToggle = async (task: Task) => {
    if (!task.id) return;
    const next: TaskStatus = task.status === 'COMPLETED' ? 'PENDING'
      : task.status === 'PENDING' ? 'IN_PROGRESS'
      : 'COMPLETED';
    try {
      const updated = await TaskService.updateTaskStatus(task.id, next);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch {
      setSnackbar({ open: true, message: 'Failed to update status.', severity: 'error' });
    }
  };

  const formatDeadline = (ts?: string) => {
    if (!ts) return 'No deadline';
    return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const removeSuggestion = (taskId: string) => {
    setSuggestions((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setActiveSuggestion((current) => (current?.taskId === taskId ? null : current));
    setActiveSuggestionTask((current) => (current?.id === taskId ? null : current));
    setIsCustomDialogOpen(false);
  };

  const handleDismissSuggestion = async (taskId: string) => {
    try {
      await TaskService.dismissRescheduleSuggestion(taskId);
      removeSuggestion(taskId);
      setSnackbar({ open: true, message: 'We will leave this task as-is for now.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to dismiss suggestion.', severity: 'error' });
    }
  };

  const handleApplyReschedule = async (taskId: string, scheduledTime?: string) => {
    if (!scheduledTime) return;
    try {
      const updatedTask = await TaskService.applyReschedule(taskId, scheduledTime);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
      removeSuggestion(taskId);
      setSnackbar({ open: true, message: 'Task moved to a better slot.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to reschedule task.', severity: 'error' });
    }
  };

  const handleDismissSuggestionForToday = (taskId: string) => {
    dismissSuggestionForToday(taskId);
    removeSuggestion(taskId);
    setSnackbar({ open: true, message: 'We will keep this suggestion out of the way for today.', severity: 'success' });
  };

  const openSuggestionReview = (task: Task, suggestion: RescheduleSuggestion) => {
    setActiveSuggestion(suggestion);
    setActiveSuggestionTask(task);
    setIsCustomDialogOpen(false);
  };

  const openCustomReschedule = (suggestion: RescheduleSuggestion, task?: Task) => {
    setActiveSuggestion(suggestion);
    setActiveSuggestionTask(task ?? null);
    const preferredOption = suggestion.suggestedOptions[0];
    const preferredTime = getSuggestionScheduledTime(preferredOption);
    setCustomRescheduleDate(preferredTime ? new Date(preferredTime) : new Date());
    setIsCustomDialogOpen(true);
  };

  const handleCustomReschedule = async () => {
    if (!activeSuggestion || !customRescheduleDate) return;
    await handleApplyReschedule(activeSuggestion.taskId, customRescheduleDate.toISOString());
  };

  const handleAcceptSuggestion = async (taskId: string, option: RescheduleOption | null) => {
    await handleApplyReschedule(taskId, getSuggestionScheduledTime(option ?? undefined));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" color="primary.main">
          Task Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={48} />
        </Box>
      ) : tasks.length === 0 ? (
        <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="body1">
            No tasks yet. Click "Add Task" to create your first one!
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {tasks.map((task) => {
            const StatusIcon = STATUS_ICONS[task.status];
            return (
              <Grid item xs={12} key={task.id}>
                <Card
                  sx={{
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" fontWeight={600}>{task.title}</Typography>
                        {task.description && (
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Due: {formatDeadline(task.deadline)}
                        </Typography>

                        {suggestions[task.id ?? ''] && (
                          <Box
                            sx={{ mt: 2, alignItems: 'flex-start' }}
                          >
                            <Box
                              sx={{
                                p: 1.75,
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                                bgcolor: alpha(theme.palette.primary.light, 0.1),
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                                <AutoAwesomeIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.dark }}>
                                  Smart suggestion available
                                </Typography>
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {suggestions[task.id ?? ''].reason}
                              </Typography>
                              {suggestions[task.id ?? ''].suggestedOptions[0] && (
                                <Typography variant="caption" display="block" sx={{ mb: 1.5, color: theme.palette.primary.dark }}>
                                  Suggested slot: {formatSuggestionOptionLabel(suggestions[task.id ?? ''].suggestedOptions[0])}
                                </Typography>
                              )}
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => openSuggestionReview(task, suggestions[task.id ?? ''])}
                                >
                                  Review options
                                </Button>
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => handleDismissSuggestionForToday(task.id!)}
                                >
                                  Hide for today
                                </Button>
                              </Stack>
                            </Box>
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          <Chip
                            icon={<FlagIcon />}
                            label={task.priority}
                            size="small"
                            sx={{
                              bgcolor: PRIORITY_COLORS[task.priority] + '22',
                              color: PRIORITY_COLORS[task.priority],
                              fontWeight: 700,
                            }}
                          />
                          <Tooltip title="Click to advance status">
                            <Chip
                              icon={<StatusIcon />}
                              label={task.status.replace('_', ' ')}
                              size="small"
                              onClick={() => handleStatusToggle(task)}
                              sx={{
                                bgcolor: STATUS_COLORS[task.status] + '22',
                                color: STATUS_COLORS[task.status],
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            />
                          </Tooltip>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                          <IconButton onClick={() => openEdit(task)} sx={{ color: theme.palette.primary.main }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => task.id && handleDelete(task.id)}
                            sx={{ color: theme.palette.error.main }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Task Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={saving}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={saving}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Deadline"
                value={form.deadline}
                onChange={(date) => setForm({ ...form, deadline: date })}
                disabled={saving}
              />
            </LocalizationProvider>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={form.priority}
                label="Priority"
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                disabled={saving}
              >
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={form.difficulty}
                label="Difficulty"
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as TaskDifficulty })}
                disabled={saving}
              >
                <MenuItem value="HIGH">High effort</MenuItem>
                <MenuItem value="MEDIUM">Medium effort</MenuItem>
                <MenuItem value="LOW">Low effort</MenuItem>
                <MenuItem value="VERY_LOW">Very low effort</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                label="Status"
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                disabled={saving}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            sx={{ minWidth: 100 }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <RescheduleSuggestionCard
        suggestion={activeSuggestion}
        task={activeSuggestionTask}
        open={!!activeSuggestion && !isCustomDialogOpen}
        presentation="adaptive"
        onAccept={(option) => activeSuggestion && handleAcceptSuggestion(activeSuggestion.taskId, option)}
        onCustomize={() => activeSuggestion && openCustomReschedule(activeSuggestion, activeSuggestionTask ?? undefined)}
        onKeepAsIs={() => activeSuggestion && handleDismissSuggestion(activeSuggestion.taskId)}
        onDismissToday={() => activeSuggestion && handleDismissSuggestionForToday(activeSuggestion.taskId)}
        onClose={() => {
          setActiveSuggestion(null);
          setActiveSuggestionTask(null);
          setIsCustomDialogOpen(false);
        }}
      />

      <Dialog
        open={isCustomDialogOpen}
        onClose={() => {
          setIsCustomDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Customize reschedule</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pick a time that feels more manageable for this task.
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Choose a new time"
              value={customRescheduleDate}
              onChange={(date) => setCustomRescheduleDate(date)}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsCustomDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => activeSuggestion && handleDismissSuggestion(activeSuggestion.taskId)}
          >
            Keep as is
          </Button>
          <Button
            variant="contained"
            disabled={!customRescheduleDate}
            onClick={handleCustomReschedule}
          >
            Reschedule
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskManagement;
