import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  SentimentVerySatisfied as HappyIcon,
  SentimentSatisfied as OkishIcon,
  SentimentDissatisfied as SadIcon,
  Mood as MoodyIcon,
  LocalHospital as CrampyIcon,
  Close as CloseIcon,
  BoltOutlined as EnergeticIcon,
  NightsStayOutlined as TiredIcon,
  Psychology as FocusedIcon,
  HorizontalRule as NeutralIcon,
} from '@mui/icons-material';
import MoodService, { Mood, MoodType } from '../../services/MoodService';
import AuthService from '../../services/AuthService';

interface MoodOption {
  type: MoodType;
  label: string;
  icon: React.ElementType;
  color: string;
}

const moodOptions: MoodOption[] = [
  { type: 'HAPPY',     label: 'Happy',    icon: HappyIcon,     color: '#84a98c' },
  { type: 'OKISH',     label: 'OK-ish',   icon: OkishIcon,     color: '#52796f' },
  { type: 'SAD',       label: 'Sad',      icon: SadIcon,       color: '#354f52' },
  { type: 'MOODY',     label: 'Moody',    icon: MoodyIcon,     color: '#2f3e46' },
  { type: 'CRAMPY',    label: 'Crampy',   icon: CrampyIcon,    color: '#bc6c25' },
  { type: 'ENERGETIC', label: 'Energetic',icon: EnergeticIcon, color: '#f4a261' },
  { type: 'TIRED',     label: 'Tired',    icon: TiredIcon,     color: '#6d6875' },
  { type: 'FOCUSED',   label: 'Focused',  icon: FocusedIcon,   color: '#457b9d' },
  { type: 'NEUTRAL',   label: 'Neutral',  icon: NeutralIcon,   color: '#adb5bd' },
];

const getMoodOption = (type: MoodType) =>
  moodOptions.find((m) => m.type === type);

const MoodTracking = () => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [notes, setNotes] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = AuthService.getUserId();

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setHistoryLoading(true);
    try {
      const moods = await MoodService.getUserMoods(userId);
      setMoodHistory(moods);
    } catch {
      setError('Could not load mood history.');
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!selectedMood || !userId) return;
    setLoading(true);
    setError(null);
    try {
      await MoodService.recordMood({
        userId,
        moodType: selectedMood.type,
        notes,
        timestamp: new Date().toISOString(),
      });
      setOpenDialog(false);
      setSelectedMood(null);
      setNotes('');
      setSuccessOpen(true);
      await fetchHistory();
    } catch {
      setError('Failed to save mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" color="primary.main" gutterBottom>
        How are you feeling?
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Mood Selection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} justifyContent="center">
            {moodOptions.map((mood) => {
              const Icon = mood.icon;
              return (
                <Grid item key={mood.type}>
                  <Button
                    onClick={() => handleMoodSelect(mood)}
                    sx={{
                      flexDirection: 'column',
                      p: 2,
                      borderRadius: 2,
                      minWidth: 80,
                      '&:hover': {
                        bgcolor: mood.color + '25',
                        transform: 'scale(1.05)',
                        transition: 'transform 0.15s ease',
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: 48, color: mood.color, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: mood.color, fontWeight: 600 }}>
                      {mood.label}
                    </Typography>
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Mood History */}
      <Typography variant="h5" color="primary.main" gutterBottom>
        Mood History
      </Typography>

      {historyLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : moodHistory.length === 0 ? (
        <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No mood entries yet. Start tracking above!</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {moodHistory.map((entry, index) => {
            const option = getMoodOption(entry.moodType);
            const Icon = option?.icon;
            return (
              <Grid item xs={12} key={entry.id ?? index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6">{option?.label ?? entry.moodType}</Typography>
                          <Chip
                            label={entry.moodType}
                            size="small"
                            sx={{
                              bgcolor: (option?.color ?? '#aaa') + '22',
                              color: option?.color ?? '#aaa',
                              fontWeight: 600,
                              fontSize: 11,
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatTimestamp(entry.timestamp)}
                        </Typography>
                        {entry.notes && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            "{entry.notes}"
                          </Typography>
                        )}
                      </Box>
                      {Icon && (
                        <Box
                          sx={{
                            bgcolor: (option?.color ?? '#aaa') + '20',
                            p: 1,
                            borderRadius: '50%',
                          }}
                        >
                          <Icon sx={{ fontSize: 32, color: option?.color }} />
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Mood Input Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedMood && (
                <selectedMood.icon sx={{ color: selectedMood.color, fontSize: 30 }} />
              )}
              <Typography variant="h6">
                Feeling {selectedMood?.label}
              </Typography>
            </Box>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Add a note (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ bgcolor: selectedMood?.color, minWidth: 100 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Mood saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MoodTracking;
