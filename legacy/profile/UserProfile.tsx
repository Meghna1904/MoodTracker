import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as yup from 'yup';
import ProfileService from '../../services/ProfileService';
import AuthService from '../../services/AuthService';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: string;
  bio: string;
  avatar: string;
  cycleTracking: boolean;
  cycleLength: number;
  periodLength: number;
  lastPeriodDate: Date | null;
}

const validationSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().optional(),
  bio: yup.string().optional(),
  cycleLength: yup.number().min(20).max(40),
  periodLength: yup.number().min(2).max(10),
});

const UserProfile = () => {
  const theme = useTheme();
  const userId = AuthService.getUserId();
  
  const [editMode, setEditMode] = useState(false);
  const [openCycleDialog, setOpenCycleDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    gender: 'other',
    bio: '',
    avatar: '',
    cycleTracking: false,
    cycleLength: 28,
    periodLength: 5,
    lastPeriodDate: null,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch user profile on mount
  useEffect(() => {
    if (!userId) return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profile = await ProfileService.getUserProfile(userId);
        
        setUserData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
          gender: profile.gender || 'other',
          bio: profile.bio || '',
          avatar: profile.avatarUrl || profile.avatar || '',
          cycleTracking: profile.cycleTracking || false,
          cycleLength: profile.cycleLength || 28,
          periodLength: profile.periodLength || 5,
          lastPeriodDate: profile.lastPeriodDate ? new Date(profile.lastPeriodDate) : null,
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const validateForm = async (): Promise<boolean> => {
    try {
      await validationSchema.validate(userData, { abortEarly: false });
      setFormErrors({});
      return true;
    } catch (err: any) {
      const errors: Record<string, string> = {};
      err.inner?.forEach((error: any) => {
        errors[error.path] = error.message;
      });
      setFormErrors(errors);
      return false;
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    
    const isValid = await validateForm();
    if (!isValid) return;

    setSaving(true);
    setError(null);
    try {
      await ProfileService.updateUserProfile(userId, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        bio: userData.bio,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth?.toISOString().split('T')[0],
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      });
      setEditMode(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to save profile';
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    setUploadingAvatar(true);
    setError(null);
    try {
      const result = await ProfileService.updateProfilePicture(userId, file);
      setUserData({ ...userData, avatar: result.avatarUrl || result.avatar || '' });
      setSnackbar({
        open: true,
        message: 'Profile picture updated successfully!',
        severity: 'success',
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to upload profile picture';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCycleSave = async () => {
    if (!userId || !userData.lastPeriodDate) return;

    setSaving(true);
    setError(null);
    try {
      await ProfileService.updateCycleTracking(userId, {
        cycleLength: userData.cycleLength,
        periodLength: userData.periodLength,
        lastPeriodDate: userData.lastPeriodDate.toISOString().split('T')[0],
      });

      setSnackbar({
        open: true,
        message: 'Cycle tracking settings saved!',
        severity: 'success',
      });
      setOpenCycleDialog(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to save cycle settings';
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

  const getInitials = () => {
    const first = userData.firstName?.[0] || 'U';
    const last = userData.lastName?.[0] || 'P';
    return `${first}${last}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" color="primary.main">
          Profile
        </Typography>
        <Button
          variant="contained"
          disabled={saving}
          startIcon={editMode ? <SaveIcon /> : <EditIcon />}
          onClick={editMode ? handleSave : () => setEditMode(true)}
        >
          {saving ? 'Saving...' : editMode ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  {uploadingAvatar && (
                    <CircularProgress
                      size={120}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                      }}
                    />
                  )}
                  <Avatar
                    src={userData.avatar}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '2.5rem',
                    }}
                  >
                    {!userData.avatar && getInitials()}
                  </Avatar>
                  {editMode && (
                    <IconButton
                      disabled={uploadingAvatar}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                      }}
                      component="label"
                    >
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleAvatarChange}
                      />
                      <PhotoCameraIcon />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="h5" gutterBottom>
                  {userData.firstName} {userData.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {userData.bio}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    icon={userData.gender === 'female' ? <FemaleIcon /> : <MaleIcon />}
                    label={userData.gender}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label="Cycle Tracking"
                    onClick={() => setOpenCycleDialog(true)}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={userData.firstName}
                    onChange={(e) =>
                      setUserData({ ...userData, firstName: e.target.value })
                    }
                    error={!!formErrors.firstName}
                    helperText={formErrors.firstName}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={userData.lastName}
                    onChange={(e) =>
                      setUserData({ ...userData, lastName: e.target.value })
                    }
                    error={!!formErrors.lastName}
                    helperText={formErrors.lastName}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={userData.phone}
                    onChange={(e) =>
                      setUserData({ ...userData, phone: e.target.value })
                    }
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Birth"
                      value={userData.dateOfBirth}
                      onChange={(newValue) =>
                        setUserData({ ...userData, dateOfBirth: newValue })
                      }
                      disabled={!editMode}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={userData.gender}
                      label="Gender"
                      onChange={(e) =>
                        setUserData({ ...userData, gender: e.target.value })
                      }
                    >
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Bio"
                    value={userData.bio}
                    onChange={(e) =>
                      setUserData({ ...userData, bio: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cycle Tracking Dialog */}
      <Dialog open={openCycleDialog} onClose={() => setOpenCycleDialog(false)}>
        <DialogTitle>Cycle Tracking Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Cycle Length (days)</InputLabel>
                <Select
                  value={userData.cycleLength}
                  label="Cycle Length (days)"
                  onChange={(e) =>
                    setUserData({ ...userData, cycleLength: e.target.value as number })
                  }
                >
                  {Array.from({ length: 10 }, (_, i) => i + 25).map((days) => (
                    <MenuItem key={days} value={days}>
                      {days} days
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Period Length (days)</InputLabel>
                <Select
                  value={userData.periodLength}
                  label="Period Length (days)"
                  onChange={(e) =>
                    setUserData({ ...userData, periodLength: e.target.value as number })
                  }
                >
                  {Array.from({ length: 7 }, (_, i) => i + 3).map((days) => (
                    <MenuItem key={days} value={days}>
                      {days} days
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Last Period Start Date"
                  value={userData.lastPeriodDate}
                  onChange={(newValue) =>
                    setUserData({ ...userData, lastPeriodDate: newValue })
                  }
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCycleDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={saving}
            onClick={handleCycleSave}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default UserProfile;
