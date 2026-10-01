import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogContent,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Bolt as BoltIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpOutlineIcon,
  PsychologyAlt as PsychologyAltIcon,
  Spa as SpaIcon,
} from '@mui/icons-material';
import { RescheduleOption, RescheduleSuggestion, Task } from '../../services/TaskService';
import {
  formatDeadlineLabel,
  formatDifficultyLabel,
  formatSuggestionInsight,
  formatSuggestionOptionLabel,
  formatSuggestionReason,
  getSuggestionMoodIndicator,
} from './rescheduleSuggestionUtils';

type PresentationMode = 'inline' | 'modal' | 'adaptive';

interface RescheduleSuggestionCardProps {
  suggestion: RescheduleSuggestion | null;
  task?: Pick<Task, 'title' | 'difficulty' | 'deadline'> | null;
  loading?: boolean;
  open?: boolean;
  presentation?: PresentationMode;
  onAccept: (option: RescheduleOption | null) => void;
  onCustomize: () => void;
  onKeepAsIs: () => void;
  onDismissToday: () => void;
  onClose?: () => void;
}

const iconForSuggestion = (suggestion: RescheduleSuggestion) => {
  if (suggestion.energyLevel === 'HIGH' || suggestion.mood === 'ENERGETIC') return BoltIcon;
  if (suggestion.mood === 'FOCUSED') return PsychologyAltIcon;
  return SpaIcon;
};

const SuggestionSkeleton = () => (
  <Card
    sx={{
      borderRadius: 4,
      border: '1px solid rgba(82, 121, 111, 0.14)',
      boxShadow: '0 20px 50px rgba(53, 79, 82, 0.08)',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="55%" />
          </Box>
        </Stack>
        <Skeleton variant="rounded" height={76} />
        <Skeleton variant="rounded" height={56} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Skeleton variant="rounded" height={42} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={42} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={42} sx={{ flex: 1 }} />
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

const RescheduleSuggestionCard = ({
  suggestion,
  task,
  loading = false,
  open = true,
  presentation = 'inline',
  onAccept,
  onCustomize,
  onKeepAsIs,
  onDismissToday,
  onClose,
}: RescheduleSuggestionCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedOption, setSelectedOption] = useState<RescheduleOption | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setSelectedOption(suggestion?.suggestedOptions[0] ?? null);
    setExpanded(false);
  }, [suggestion, open]);

  if (loading) {
    return <SuggestionSkeleton />;
  }

  if (!suggestion) {
    return null;
  }

  const SuggestionIcon = iconForSuggestion(suggestion);
  const moodIndicator = getSuggestionMoodIndicator(suggestion);
  const title = task?.title ?? suggestion.taskTitle ?? 'This task';
  const reason = formatSuggestionReason(suggestion);
  const insight = formatSuggestionInsight(suggestion);

  const content = (
    <Card
      elevation={presentation === 'inline' ? 0 : 8}
      sx={{
        borderRadius: presentation === 'inline' ? 4 : 5,
        overflow: 'hidden',
        border: '1px solid rgba(82, 121, 111, 0.16)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(236, 241, 238, 0.98) 100%)',
        boxShadow: presentation === 'inline'
          ? '0 22px 40px rgba(53, 79, 82, 0.08)'
          : '0 28px 70px rgba(53, 79, 82, 0.18)',
        animation: 'reschedule-card-enter 260ms ease-out',
        '@keyframes reschedule-card-enter': {
          from: {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(82, 121, 111, 0.12)',
                color: '#354f52',
                flexShrink: 0,
              }}
            >
              <SuggestionIcon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="overline" sx={{ color: '#52796f', letterSpacing: 1.2, fontWeight: 700 }}>
                  Smart Suggestion
                </Typography>
                <Chip
                  size="small"
                  label={`${moodIndicator.emoji} ${moodIndicator.label}`}
                  sx={{
                    bgcolor: 'rgba(132, 169, 140, 0.16)',
                    color: '#354f52',
                    fontWeight: 600,
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" sx={{ color: '#354f52', fontWeight: 700 }}>
                  A gentler plan for {title}
                </Typography>
                <Tooltip title={insight}>
                  <IconButton size="small" sx={{ color: '#52796f' }}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Stack>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'rgba(82, 121, 111, 0.08)',
              border: '1px solid rgba(82, 121, 111, 0.12)',
            }}
          >
            <Typography variant="body1" sx={{ color: '#354f52', fontWeight: 500 }}>
              {reason}
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              icon={<AutoAwesomeIcon />}
              label={title}
              sx={{ justifyContent: 'flex-start', bgcolor: 'rgba(53, 79, 82, 0.07)', color: '#354f52' }}
            />
            <Chip
              icon={<BoltIcon />}
              label={formatDifficultyLabel(task?.difficulty)}
              sx={{ bgcolor: 'rgba(132, 169, 140, 0.18)', color: '#354f52' }}
            />
            <Chip
              icon={<CalendarMonthIcon />}
              label={formatDeadlineLabel(task?.deadline)}
              sx={{ bgcolor: 'rgba(53, 79, 82, 0.07)', color: '#354f52' }}
            />
          </Stack>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#354f52', fontWeight: 700 }}>
              Suggested options
            </Typography>
            <Stack spacing={1}>
              {suggestion.suggestedOptions.map((option) => {
                const selected = selectedOption?.value === option.value;
                return (
                  <Button
                    key={`${option.type}-${option.value}`}
                    fullWidth
                    onClick={() => setSelectedOption(option)}
                    variant={selected ? 'contained' : 'outlined'}
                    sx={{
                      justifyContent: 'flex-start',
                      py: 1.2,
                      px: 1.5,
                      borderRadius: 3,
                      textAlign: 'left',
                      color: selected ? '#fff' : '#354f52',
                      borderColor: 'rgba(82, 121, 111, 0.2)',
                      bgcolor: selected ? '#52796f' : 'rgba(255,255,255,0.8)',
                      '&:hover': {
                        borderColor: '#52796f',
                        bgcolor: selected ? '#3f625b' : 'rgba(132, 169, 140, 0.12)',
                      },
                    }}
                  >
                    {formatSuggestionOptionLabel(option)}
                  </Button>
                );
              })}
              {suggestion.suggestedOptions.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No suggested slots came back, but you can still pick a custom time.
                </Typography>
              )}
            </Stack>
          </Box>

          <Box>
            <Button
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms ease',
                  }}
                />
              }
              onClick={() => setExpanded((current) => !current)}
              sx={{ px: 0, color: '#52796f' }}
            >
              {expanded ? 'Hide details' : 'Why this suggestion?'}
            </Button>
            <Collapse in={expanded}>
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.72)',
                  border: '1px dashed rgba(82, 121, 111, 0.18)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {insight}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Original signal: {suggestion.reason || 'A lighter schedule looked like a better fit.'}
                </Typography>
              </Box>
            </Collapse>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button
              variant="contained"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => onAccept(selectedOption)}
              sx={{
                flex: 1.2,
                py: 1.2,
                bgcolor: '#52796f',
                '&:hover': { bgcolor: '#3f625b' },
              }}
            >
              Accept Suggestion
            </Button>
            <Button
              variant="outlined"
              onClick={onCustomize}
              sx={{
                flex: 1,
                py: 1.2,
                borderColor: 'rgba(82, 121, 111, 0.32)',
                color: '#354f52',
              }}
            >
              Customize
            </Button>
            <Button
              variant="text"
              onClick={onKeepAsIs}
              sx={{ flex: 1, py: 1.2, color: '#354f52' }}
            >
              Keep as is
            </Button>
          </Stack>

          <Button
            variant="text"
            onClick={onDismissToday}
            sx={{
              alignSelf: 'flex-start',
              px: 0,
              color: '#52796f',
            }}
          >
            Don&apos;t show again today
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  if (presentation === 'inline') {
    return content;
  }

  if (presentation === 'adaptive' && isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            bgcolor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <Box sx={{ p: 1.25, pt: 1.5, bgcolor: 'transparent' }}>
          <Box
            sx={{
              width: 48,
              height: 5,
              borderRadius: 999,
              bgcolor: 'rgba(53,79,82,0.18)',
              mx: 'auto',
              mb: 1.25,
            }}
          />
          {content}
        </Box>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
      transitionDuration={250}
    >
      <DialogContent sx={{ p: 0 }}>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleSuggestionCard;
