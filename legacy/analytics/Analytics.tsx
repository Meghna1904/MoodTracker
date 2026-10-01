import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { TrendingUp as TrendingUpIcon, CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AnalyticsService, { MoodAnalytics, TaskAnalytics, Suggestion } from '../../services/AnalyticsService';
import AuthService from '../../services/AuthService';

const Analytics = () => {
  const userId = AuthService.getUserId();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().setDate(new Date().getDate() - 7)),
    new Date(),
  ]);

  const [moodAnalytics, setMoodAnalytics] = useState<MoodAnalytics | null>(null);
  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [openSuggestionDialog, setOpenSuggestionDialog] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!userId || !dateRange[0] || !dateRange[1]) return;

    setLoading(true);
    setError(null);
    try {
      const startDate = dateRange[0].toISOString();
      const endDate = dateRange[1].toISOString();

      const [mood, tasks, sugg] = await Promise.all([
        AnalyticsService.getMoodAnalytics(userId, startDate, endDate),
        AnalyticsService.getTaskAnalytics(userId, startDate, endDate),
        AnalyticsService.getSuggestions(userId),
      ]);

      setMoodAnalytics(mood);
      setTaskAnalytics(tasks);
      setSuggestions(sugg);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateRange, userId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDateRangeChange = (newRange: [Date | null, Date | null]) => {
    setDateRange(newRange);
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const completionRatePercent = taskAnalytics?.completionRate ?? 0;
  const moodStabilityPercent = ((moodAnalytics?.moodStability ?? 0) * 100).toFixed(1);
  const productivityCorrelation = (moodAnalytics?.productivityCorrelation ?? 0).toFixed(2);
  const statusDistribution = taskAnalytics?.taskDistribution?.byStatus ?? {};

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" color="primary.main">
          Analytics & Insights
        </Typography>
        <Button variant="contained" onClick={handleRefresh}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Date Range Picker */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Date Range
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={dateRange[0]}
                  onChange={(value) => handleDateRangeChange([value, dateRange[1]])}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={dateRange[1]}
                  onChange={(value) => handleDateRangeChange([dateRange[0], value])}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleRefresh}>
            Load Analytics
          </Button>
        </CardContent>
      </Card>

      {/* Mood Analytics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Mood Analytics</Typography>
              </Box>

              {moodAnalytics ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Dominant Mood
                    </Typography>
                    <Typography variant="h4">{moodAnalytics.dominantMood}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Mood Stability
                    </Typography>
                    <Chip label={`${moodStabilityPercent}%`} color="primary" />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Mood / Productivity Correlation
                    </Typography>
                    <Typography variant="body1">{productivityCorrelation}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Mood Distribution
                    </Typography>
                    {Object.entries(moodAnalytics.moodDistribution || {}).map(([mood, count]) => (
                      <Box key={mood} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{mood}</Typography>
                        <Typography variant="body2" color="primary">
                          {count} times
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography color="textSecondary">No mood data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Task Analytics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Task Analytics</Typography>
              </Box>

              {taskAnalytics ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Completion Rate
                    </Typography>
                    <Typography variant="h4">
                      {completionRatePercent.toFixed(1)}%
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Productivity Score
                    </Typography>
                    <Typography variant="h5" color="warning.main">{taskAnalytics.productivityScore.toFixed(1)}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Tasks by Status
                    </Typography>
                    {Object.entries(statusDistribution).map(([status, count]) => (
                      <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{status}</Typography>
                        <Typography variant="body2" color="primary">
                          {count} tasks
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Average Task Duration
                    </Typography>
                    <Typography variant="body2">{taskAnalytics.averageTaskDuration.toFixed(1)} minutes</Typography>
                  </Box>
                </Box>
              ) : (
                <Typography color="textSecondary">No task data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Suggestions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Personalized Suggestions</Typography>
              </Box>

              {suggestions.length > 0 ? (
                <Grid container spacing={2}>
                  {suggestions.map((suggestion) => (
                    <Grid item xs={12} sm={6} key={suggestion.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: suggestion.actionable ? 'pointer' : 'default',
                          '&:hover': suggestion.actionable ? { boxShadow: 2 } : {},
                        }}
                        onClick={() => {
                          if (suggestion.actionable) {
                            setSelectedSuggestion(suggestion);
                            setOpenSuggestionDialog(true);
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6">{suggestion.title}</Typography>
                            <Chip label={suggestion.priority.toUpperCase()} size="small" color={suggestion.priority === 'high' ? 'error' : suggestion.priority === 'medium' ? 'warning' : 'default'} />
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {suggestion.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="textSecondary">No suggestions at this time</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Suggestion Dialog */}
      <Dialog open={openSuggestionDialog} onClose={() => setOpenSuggestionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedSuggestion?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {selectedSuggestion?.description}
          </Typography>
          <Chip
            label={selectedSuggestion?.type.toUpperCase() || 'TIP'}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuggestionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Analytics;
