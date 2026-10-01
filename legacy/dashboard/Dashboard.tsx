import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  useTheme,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MoodOutlined as MoodIcon,
  Add as AddIcon,
  RefreshOutlined as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import AuthService from '../../services/AuthService';
import MoodService, { Mood } from '../../services/MoodService';
import TaskService, { RescheduleOption, RescheduleSuggestion, Task } from '../../services/TaskService';
import RescheduleSuggestionCard from '../tasks/RescheduleSuggestionCard';
import {
  dismissSuggestionForToday,
  getSuggestionScheduledTime,
  isSuggestionDismissedToday,
} from '../tasks/rescheduleSuggestionUtils';

const MOOD_COLORS: Record<string, string> = {
  HAPPY: '#84a98c',
  OKISH: '#52796f',
  SAD: '#354f52',
  MOODY: '#2f3e46',
  CRAMPY: '#bc6c25',
  ENERGETIC: '#f4a261',
  TIRED: '#6d6875',
  FOCUSED: '#457b9d',
  NEUTRAL: '#adb5bd',
};

const MOOD_LABELS: Record<string, string> = {
  HAPPY: 'Happy', OKISH: 'OK-ish', SAD: 'Sad', MOODY: 'Moody',
  CRAMPY: 'Crampy', ENERGETIC: 'Energetic', TIRED: 'Tired', FOCUSED: 'Focused', NEUTRAL: 'Neutral',
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#e63946', MEDIUM: '#f4a261', LOW: '#2a9d8f',
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [latestMood, setLatestMood] = useState<Mood | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [suggestion, setSuggestion] = useState<RescheduleSuggestion | null>(null);
  const [suggestionTask, setSuggestionTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const userId = AuthService.getUserId();

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [mood, pendingTasks, rescheduleSuggestions] = await Promise.all([
        MoodService.getLatestMood(userId),
        TaskService.getPendingTasks(userId),
        TaskService.getRescheduleSuggestions(userId),
      ]);
      const topTasks = pendingTasks.slice(0, 5);
      const nextSuggestion = topTasks
        .map((task) => rescheduleSuggestions.find(
          (item) => item.taskId === task.id && item.shouldSuggestReschedule && !isSuggestionDismissedToday(item.taskId)
        ) ?? null)
        .find((item): item is RescheduleSuggestion => item !== null) ?? null;

      setLatestMood(mood);
      setTasks(topTasks);
      setSuggestion(nextSuggestion);
      setSuggestionTask(topTasks.find((task) => task.id === nextSuggestion?.taskId) ?? null);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTimeAgo = (ts?: string) => {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs / 24)} day(s) ago`;
  };

  const formatDeadline = (ts?: string) => {
    if (!ts) return 'No deadline';
    return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const clearSuggestion = () => {
    setSuggestion(null);
    setSuggestionTask(null);
  };

  const handleAcceptSuggestion = async (option: RescheduleOption | null) => {
    if (!suggestion) return;
    const scheduledTime = getSuggestionScheduledTime(option ?? undefined);
    if (!scheduledTime) {
      setSnackbar({ open: true, message: 'No suggested time was available for that option.', severity: 'error' });
      return;
    }

    try {
      const updatedTask = await TaskService.applyReschedule(suggestion.taskId, scheduledTime);
      setTasks((prev) => prev.map((task) => (task.id === suggestion.taskId ? updatedTask : task)));
      clearSuggestion();
      setSnackbar({ open: true, message: 'Task moved to a friendlier slot.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to reschedule this task.', severity: 'error' });
    }
  };

  const handleKeepAsIs = async () => {
    if (!suggestion) return;
    try {
      await TaskService.dismissRescheduleSuggestion(suggestion.taskId);
      clearSuggestion();
      setSnackbar({ open: true, message: 'We will leave this task as planned.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to dismiss this suggestion.', severity: 'error' });
    }
  };

  const handleDismissToday = () => {
    if (!suggestion) return;
    dismissSuggestionForToday(suggestion.taskId);
    clearSuggestion();
    setSnackbar({ open: true, message: 'This suggestion will stay hidden for the rest of today.', severity: 'success' });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" color="primary.main">
              Dashboard
            </Typography>
          </Box>
          <IconButton onClick={fetchData} title="Refresh">
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <CircularProgress size={48} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Current Mood Card */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Current Mood
                    </Typography>
                    {latestMood ? (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: MOOD_COLORS[latestMood.moodType] ?? theme.palette.primary.main,
                              width: 64,
                              height: 64,
                            }}
                          >
                            <MoodIcon sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h5">
                              {MOOD_LABELS[latestMood.moodType] ?? latestMood.moodType}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatTimeAgo(latestMood.timestamp)}
                            </Typography>
                            {latestMood.notes && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                "{latestMood.notes}"
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        No mood recorded yet today.
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/mood')}
                    >
                      {latestMood ? 'Update Mood' : 'Log Mood'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Pending Tasks Card */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Pending Tasks</Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/tasks')}
                      >
                        Add Task
                      </Button>
                    </Box>

                    {suggestion && (
                      <Box sx={{ mb: 2.5 }}>
                        <RescheduleSuggestionCard
                          suggestion={suggestion}
                          task={suggestionTask}
                          onAccept={handleAcceptSuggestion}
                          onCustomize={() => navigate('/tasks')}
                          onKeepAsIs={handleKeepAsIs}
                          onDismissToday={handleDismissToday}
                        />
                      </Box>
                    )}

                    {tasks.length === 0 ? (
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: 4,
                          color: 'text.secondary',
                          border: `1px dashed ${theme.palette.divider}`,
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1">No pending tasks 🎉</Typography>
                        <Typography variant="body2">You're all caught up!</Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2}>
                        {tasks.map((task) => (
                          <Grid item xs={12} key={task.id}>
                            <Card
                              variant="outlined"
                              sx={{
                                '&:hover': {
                                  bgcolor: theme.palette.action.hover,
                                  cursor: 'pointer',
                                },
                              }}
                              onClick={() => navigate('/tasks')}
                            >
                              <CardContent sx={{ py: '12px !important' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                      {task.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Due: {formatDeadline(task.deadline)}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={task.priority}
                                    size="small"
                                    sx={{
                                      bgcolor: (PRIORITY_COLORS[task.priority] ?? '#aaa') + '22',
                                      color: PRIORITY_COLORS[task.priority] ?? '#aaa',
                                      fontWeight: 700,
                                      fontSize: 11,
                                    }}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
