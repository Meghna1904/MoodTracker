import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  useTheme,
  IconButton,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SettingsService from '../../services/SettingsService';
import AuthService from '../../services/AuthService';

interface UserPreferences {
  notifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
  workStartTime: Date;
  workEndTime: Date;
  breakDuration: number;
  taskReminders: boolean;
  moodReminders: boolean;
  language: string;
  timeZone: string;
}

const Settings = () => {
  const theme = useTheme();
  const userId = AuthService.getUserId();
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: true,
    emailNotifications: true,
    darkMode: false,
    workStartTime: new Date(2023, 0, 1, 9, 0),
    workEndTime: new Date(2023, 0, 1, 17, 0),
    breakDuration: 30,
    taskReminders: true,
    moodReminders: true,
    language: 'en',
    timeZone: 'UTC',
  });

  // Fetch preferences on mount
  useEffect(() => {
    if (!userId) return;

    const fetchPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        const prefs = await SettingsService.getUserPreferences(userId);
        
        const workStart = prefs.workStartTime
          ? new Date(`2023-01-01T${prefs.workStartTime}`)
          : new Date(2023, 0, 1, 9, 0);
        const workEnd = prefs.workEndTime
          ? new Date(`2023-01-01T${prefs.workEndTime}`)
          : new Date(2023, 0, 1, 17, 0);
        
        setPreferences({
          notifications: prefs.notifications ?? true,
          emailNotifications: prefs.emailNotifications ?? true,
          darkMode: prefs.darkMode ?? false,
          workStartTime: workStart,
          workEndTime: workEnd,
          breakDuration: prefs.breakDuration ?? 30,
          taskReminders: prefs.taskReminders ?? true,
          moodReminders: prefs.moodReminders ?? true,
          language: prefs.language ?? 'en',
          timeZone: prefs.timeZone ?? 'UTC',
        });
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Failed to load settings. Using defaults.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    setError(null);
    try {
      const timeFormat = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      await SettingsService.updateUserPreferences(userId, {
        notifications: preferences.notifications,
        emailNotifications: preferences.emailNotifications,
        darkMode: preferences.darkMode,
        workStartTime: timeFormat(preferences.workStartTime),
        workEndTime: timeFormat(preferences.workEndTime),
        breakDuration: preferences.breakDuration,
        taskReminders: preferences.taskReminders,
        moodReminders: preferences.moodReminders,
        language: preferences.language,
        timeZone: preferences.timeZone,
      });

      setSnackbar({
        open: true,
        message: 'Settings saved successfully!',
        severity: 'success',
      });
      setEditMode(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to save settings';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const settingSections = [
    {
      title: 'Notifications',
      icon: NotificationsIcon,
      settings: [
        {
          label: 'Push Notifications',
          type: 'switch',
          value: preferences.notifications,
          onChange: (value: boolean) =>
            setPreferences({ ...preferences, notifications: value }),
        },
        {
          label: 'Email Notifications',
          type: 'switch',
          value: preferences.emailNotifications,
          onChange: (value: boolean) =>
            setPreferences({ ...preferences, emailNotifications: value }),
        },
        {
          label: 'Task Reminders',
          type: 'switch',
          value: preferences.taskReminders,
          onChange: (value: boolean) =>
            setPreferences({ ...preferences, taskReminders: value }),
        },
        {
          label: 'Mood Check-in Reminders',
          type: 'switch',
          value: preferences.moodReminders,
          onChange: (value: boolean) =>
            setPreferences({ ...preferences, moodReminders: value }),
        },
      ],
    },
    {
      title: 'Appearance',
      icon: PaletteIcon,
      settings: [
        {
          label: 'Dark Mode',
          type: 'switch',
          value: preferences.darkMode,
          onChange: (value: boolean) =>
            setPreferences({ ...preferences, darkMode: value }),
        },
        {
          label: 'Language',
          type: 'select',
          value: preferences.language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
          ],
          onChange: (value: string) =>
            setPreferences({ ...preferences, language: value }),
        },
      ],
    },
    {
      title: 'Work Schedule',
      icon: ScheduleIcon,
      settings: [
        {
          label: 'Work Start Time',
          type: 'time',
          value: preferences.workStartTime,
          onChange: (value: Date) =>
            setPreferences({ ...preferences, workStartTime: value }),
        },
        {
          label: 'Work End Time',
          type: 'time',
          value: preferences.workEndTime,
          onChange: (value: Date) =>
            setPreferences({ ...preferences, workEndTime: value }),
        },
        {
          label: 'Break Duration (minutes)',
          type: 'select',
          value: preferences.breakDuration,
          options: [
            { value: 15, label: '15 minutes' },
            { value: 30, label: '30 minutes' },
            { value: 45, label: '45 minutes' },
            { value: 60, label: '1 hour' },
          ],
          onChange: (value: number) =>
            setPreferences({ ...preferences, breakDuration: value }),
        },
        {
          label: 'Time Zone',
          type: 'select',
          value: preferences.timeZone,
          options: [
            { value: 'UTC', label: 'UTC' },
            { value: 'UTC+5:30', label: 'India (UTC+5:30)' },
            { value: 'UTC+0', label: 'London (UTC+0)' },
            { value: 'UTC-5', label: 'New York (UTC-5)' },
            { value: 'UTC-8', label: 'San Francisco (UTC-8)' },
          ],
          onChange: (value: string) =>
            setPreferences({ ...preferences, timeZone: value }),
        },
      ],
    },
  ];

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
          Settings
        </Typography>
        <Button
          variant="contained"
          disabled={saving}
          startIcon={editMode ? <SaveIcon /> : <EditIcon />}
          onClick={editMode ? handleSave : () => setEditMode(true)}
        >
          {saving ? 'Saving...' : editMode ? 'Save Changes' : 'Edit Settings'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {settingSections.map((section) => (
          <Grid item xs={12} key={section.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton sx={{ mr: 1, color: theme.palette.primary.main }}>
                    <section.icon />
                  </IconButton>
                  <Typography variant="h6">{section.title}</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {section.settings.map((setting) => (
                    <Grid item xs={12} sm={6} key={setting.label}>
                      {setting.type === 'switch' ? (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={setting.value}
                              onChange={(e) => setting.onChange(e.target.checked)}
                              disabled={!editMode}
                            />
                          }
                          label={setting.label}
                        />
                      ) : setting.type === 'select' ? (
                        <FormControl fullWidth disabled={!editMode}>
                          <InputLabel>{setting.label}</InputLabel>
                          <Select
                            value={setting.value}
                            label={setting.label}
                            onChange={(e) => setting.onChange(e.target.value)}
                          >
                            {setting.options.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : setting.type === 'time' ? (
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <TimePicker
                            label={setting.label}
                            value={setting.value}
                            onChange={(newValue) => setting.onChange(newValue)}
                            disabled={!editMode}
                          />
                        </LocalizationProvider>
                      ) : null}
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
