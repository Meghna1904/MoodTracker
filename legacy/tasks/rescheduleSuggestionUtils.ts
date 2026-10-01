import { RescheduleOption, RescheduleSuggestion, TaskDifficulty } from '../../services/TaskService';

const DISMISS_PREFIX = 'reschedule-suggestion-dismissed';

const isParsableDate = (value?: string): boolean => {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
};

export const getSuggestionScheduledTime = (option?: RescheduleOption): string | undefined => {
  if (!option) return undefined;
  if (option.scheduledTime) return option.scheduledTime;
  if (isParsableDate(option.value)) return option.value;
  return undefined;
};

export const formatSuggestionOptionLabel = (option: RescheduleOption): string => {
  if (option.label?.trim()) return option.label;

  const scheduledTime = getSuggestionScheduledTime(option);
  if (scheduledTime) {
    const date = new Date(scheduledTime);
    const formatted = date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return option.type === 'day' ? `Schedule on ${formatted}` : `Move to ${formatted}`;
  }

  return option.value;
};

export const formatSuggestionReason = (suggestion: RescheduleSuggestion): string => {
  const rawReason = suggestion.reason?.trim();
  const lowerReason = rawReason?.toLowerCase() ?? '';

  if (lowerReason.includes('low energy')) {
    return 'You seem a bit low on energy right now. Want to shift this to a kinder time?';
  }

  if (lowerReason.includes('mood')) {
    return 'This looks like a heavier task for how things feel right now. We can move it if that helps.';
  }

  if (lowerReason.includes('busy') || lowerReason.includes('workload')) {
    return 'Your schedule already looks pretty full. Want to give this task a little more breathing room?';
  }

  if (lowerReason.includes('cycle') || lowerReason.includes('cramp')) {
    return 'Your body may need a lighter rhythm today. We can adjust this task without losing momentum.';
  }

  if (lowerReason.includes('focus')) {
    return 'This task may land better in a more focused window. Want to move it to one of the suggested slots?';
  }

  if (rawReason) {
    const normalized = rawReason.charAt(0).toUpperCase() + rawReason.slice(1);
    return normalized.endsWith('.') ? normalized : `${normalized}.`;
  }

  return 'This task might feel easier in a different time slot. Want to adjust it?';
};

export const formatSuggestionInsight = (suggestion: RescheduleSuggestion): string => {
  if (suggestion.energyLevel === 'LOW') return 'Based on your recent energy pattern and workload.';
  if (suggestion.energyLevel === 'HIGH') return 'Based on your current capacity and the effort this task needs.';
  if (suggestion.mood === 'FOCUSED') return 'Based on your recent focus trend and upcoming schedule.';
  return 'Based on your recent mood, energy, and workload patterns.';
};

export const getSuggestionMoodIndicator = (
  suggestion: RescheduleSuggestion
): { emoji: string; label: string } => {
  if (suggestion.energyLevel === 'LOW' || suggestion.mood === 'TIRED') {
    return { emoji: '😴', label: 'Low energy' };
  }

  if (suggestion.energyLevel === 'HIGH' || suggestion.mood === 'ENERGETIC') {
    return { emoji: '⚡', label: 'High energy' };
  }

  if (suggestion.mood === 'SAD' || suggestion.mood === 'MOODY' || suggestion.mood === 'CRAMPY') {
    return { emoji: '🌧️', label: 'Gentle day' };
  }

  if (suggestion.mood === 'FOCUSED') {
    return { emoji: '🧠', label: 'Focused window' };
  }

  return { emoji: '🌿', label: 'Supportive nudge' };
};

export const formatDifficultyLabel = (difficulty?: TaskDifficulty): string => {
  switch (difficulty) {
    case 'HIGH':
      return 'High effort';
    case 'LOW':
      return 'Low effort';
    case 'VERY_LOW':
      return 'Very low effort';
    case 'MEDIUM':
    default:
      return 'Medium effort';
  }
};

export const formatDeadlineLabel = (deadline?: string): string => {
  if (!deadline) return 'No deadline';
  return new Date(deadline).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDismissKey = (taskId: string, dateKey: string) => `${DISMISS_PREFIX}:${taskId}:${dateKey}`;

export const dismissSuggestionForToday = (taskId: string): void => {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(getDismissKey(taskId, today), '1');
};

export const isSuggestionDismissedToday = (taskId: string): boolean => {
  const today = new Date().toISOString().slice(0, 10);
  return localStorage.getItem(getDismissKey(taskId, today)) === '1';
};
