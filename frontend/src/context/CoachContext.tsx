import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type MoodTag = 'Grounded' | 'Analytical' | 'Reactive' | 'Depleted';
type RoutineStatus = 'Pending' | 'Done' | 'Skipped' | 'Missed';
type FlashTone = 'info' | 'success' | 'warning';

export interface CoachTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  deadline: string;
  scheduledFor: string;
  movesUsed: number;
  moveLimit: number;
  completed: boolean;
  completedAt?: string;
}

export interface RoutineLogEntry {
  date: string;
  status: RoutineStatus;
  reason?: string;
}

export interface CoachRoutine {
  id: string;
  title: string;
  description: string;
  status: RoutineStatus;
  reason?: string;
  target: number;
  progress: number;
  history: RoutineLogEntry[];
}

export interface MoveHistoryEntry {
  id: string;
  taskId: string;
  title: string;
  from: string;
  to: string;
  timestamp: string;
  source: 'manual' | 'adjust-day';
}

interface CoachState {
  tasks: CoachTask[];
  routines: CoachRoutine[];
  moveHistory: MoveHistoryEntry[];
  energy: number;
  mood: MoodTag;
  cycleDay: number;
  flash: { tone: FlashTone; text: string } | null;
}

interface CoachContextValue extends CoachState {
  completionRate: number;
  honestyRate: number;
  streakDays: number;
  peakPerformance: string;
  phaseLabel: string;
  weeklyStats: { day: string; completion: number; adjustments: number }[];
  setEnergy: (energy: number) => void;
  setMood: (mood: MoodTag) => void;
  setCycleDay: (cycleDay: number) => void;
  moveTask: (taskId: string, nextTime: string, source?: 'manual' | 'adjust-day') => { ok: boolean; message: string };
  completeTask: (taskId: string) => void;
  updateRoutineStatus: (routineId: string, status: RoutineStatus, reason?: string) => void;
  adjustMyDay: () => { moved: number; message: string };
  clearFlash: () => void;
  exportData: () => void;
}

const STORAGE_KEY = 'realistic-coach-state-v2';
const TODAY = new Date();

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const setTime = (date: Date, hour: number, minute: number) => {
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
};

const iso = (date: Date) => date.toISOString();

const sameDay = (left: string, right: string) => new Date(left).toDateString() === new Date(right).toDateString();

const buildInitialState = (): CoachState => ({
  tasks: [
    {
      id: 'task-1',
      title: 'Finalize Architectural Review',
      description: 'Heavy cognitive load. Consider moving if energy stays low.',
      priority: 'Priority 01',
      scheduledFor: iso(setTime(TODAY, 10, 0)),
      deadline: iso(setTime(TODAY, 18, 0)),
      movesUsed: 2,
      moveLimit: 3,
      completed: false,
    },
    {
      id: 'task-2',
      title: 'Client Audit Follow-up',
      description: 'Deadline in 2 days. Keep this one close.',
      priority: 'Priority 02',
      scheduledFor: iso(setTime(addDays(TODAY, 1), 11, 0)),
      deadline: iso(setTime(addDays(TODAY, 2), 17, 30)),
      movesUsed: 1,
      moveLimit: 3,
      completed: false,
    },
    {
      id: 'task-3',
      title: 'Hardware Upgrade Specification',
      description: 'Select workstation components for the next studio buildout.',
      priority: 'Priority 03',
      scheduledFor: iso(setTime(addDays(TODAY, 2), 14, 0)),
      deadline: iso(setTime(addDays(TODAY, 4), 16, 0)),
      movesUsed: 0,
      moveLimit: 3,
      completed: false,
    },
  ],
  routines: [
    {
      id: 'routine-1',
      title: '4L Water Intake',
      description: 'Clear skin, clear mind, zero excuses.',
      status: 'Done',
      target: 5,
      progress: 5,
      history: [{ date: TODAY.toISOString().slice(0, 10), status: 'Done' }],
    },
    {
      id: 'routine-2',
      title: 'Deep Work (4hrs)',
      description: 'Phone in drawer. Focus is the new IQ.',
      status: 'Pending',
      target: 1,
      progress: 0,
      history: [],
    },
    {
      id: 'routine-3',
      title: 'Morning Mobility',
      description: 'Reason logged: early client meeting.',
      status: 'Skipped',
      reason: 'Early client meeting',
      target: 1,
      progress: 0,
      history: [{ date: TODAY.toISOString().slice(0, 10), status: 'Skipped', reason: 'Early client meeting' }],
    },
    {
      id: 'routine-4',
      title: 'Sleep Hygiene',
      description: 'No screens after 9:30 PM. Eight-hour target.',
      status: 'Pending',
      target: 1,
      progress: 0,
      history: [],
    },
  ],
  moveHistory: [
    {
      id: 'move-1',
      taskId: 'task-archived-1',
      title: 'Tax Filing Prep',
      from: iso(setTime(addDays(TODAY, -1), 10, 0)),
      to: iso(setTime(TODAY, 10, 0)),
      timestamp: iso(setTime(TODAY, 8, 30)),
      source: 'manual',
    },
    {
      id: 'move-2',
      taskId: 'task-archived-2',
      title: 'Gym Subscription Renewal',
      from: iso(setTime(TODAY, 8, 30)),
      to: iso(setTime(addDays(TODAY, 3), 8, 30)),
      timestamp: iso(setTime(TODAY, 9, 15)),
      source: 'manual',
    },
  ],
  energy: 3,
  mood: 'Analytical',
  cycleDay: 21,
  flash: null,
});

const CoachContext = createContext<CoachContextValue | null>(null);

const readState = (): CoachState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    return { ...buildInitialState(), ...JSON.parse(raw) as CoachState };
  } catch {
    return buildInitialState();
  }
};

const buildWeeklyStats = (state: CoachState) => {
  return Array.from({ length: 7 }).map((_, index) => {
    const day = addDays(TODAY, index - 6);
    const label = day.toLocaleDateString([], { weekday: 'short' });
    const dateKey = day.toISOString().slice(0, 10);
    const completionCount = state.tasks.filter((task) => task.completedAt?.startsWith(dateKey)).length
      + state.routines.filter((routine) => routine.history.some((entry) => entry.date === dateKey && entry.status === 'Done')).length;
    const adjustmentCount = state.moveHistory.filter((entry) => entry.timestamp.startsWith(dateKey)).length;

    return {
      day: label,
      completion: Math.min(100, completionCount * 22),
      adjustments: Math.min(100, adjustmentCount * 28),
    };
  });
};

const calculatePhaseLabel = (cycleDay: number) => {
  if (cycleDay <= 5) return 'Menstrual phase';
  if (cycleDay <= 13) return 'Follicular phase';
  if (cycleDay <= 16) return 'Ovulation window';
  return 'Luteal phase';
};

export const CoachProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CoachState>(() => readState());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setFlash = (tone: FlashTone, text: string) => {
    setState((current) => ({ ...current, flash: { tone, text } }));
  };

  const moveTask: CoachContextValue['moveTask'] = (taskId, nextTime, source = 'manual') => {
    const task = state.tasks.find((entry) => entry.id === taskId);
    if (!task) return { ok: false, message: 'Task not found.' };

    const proposed = new Date(nextTime);
    const deadline = new Date(task.deadline);

    if (task.completed) return { ok: false, message: 'Completed tasks cannot be moved.' };
    if (task.movesUsed >= task.moveLimit) return { ok: false, message: 'Move limit reached for this task.' };
    if (proposed > deadline) return { ok: false, message: 'New time cannot go beyond the deadline.' };

    const conflict = state.tasks.some((entry) =>
      entry.id !== taskId && !entry.completed && Math.abs(new Date(entry.scheduledFor).getTime() - proposed.getTime()) < 60 * 60 * 1000
    );

    if (conflict) return { ok: false, message: 'That slot conflicts with another scheduled task.' };

    setState((current) => ({
      ...current,
      tasks: current.tasks.map((entry) => entry.id === taskId ? {
        ...entry,
        scheduledFor: proposed.toISOString(),
        movesUsed: entry.movesUsed + 1,
      } : entry),
      moveHistory: [
        {
          id: `move-${Date.now()}`,
          taskId,
          title: task.title,
          from: task.scheduledFor,
          to: proposed.toISOString(),
          timestamp: new Date().toISOString(),
          source,
        },
        ...current.moveHistory,
      ].slice(0, 12),
      flash: {
        tone: 'success',
        text: `${task.title} moved to ${proposed.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`,
      },
    }));

    return { ok: true, message: 'Task moved successfully.' };
  };

  const completeTask = (taskId: string) => {
    const task = state.tasks.find((entry) => entry.id === taskId);
    if (!task) return;
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((entry) => entry.id === taskId ? {
        ...entry,
        completed: !entry.completed,
        completedAt: !entry.completed ? new Date().toISOString() : undefined,
      } : entry),
      flash: {
        tone: 'success',
        text: task.completed ? `${task.title} marked back as active.` : `${task.title} marked complete.`,
      },
    }));
  };

  const updateRoutineStatus = (routineId: string, status: RoutineStatus, reason?: string) => {
    const routine = state.routines.find((entry) => entry.id === routineId);
    if (!routine) return;

    const todayKey = TODAY.toISOString().slice(0, 10);
    setState((current) => ({
      ...current,
      routines: current.routines.map((entry) => {
        if (entry.id !== routineId) return entry;
        const history = entry.history.filter((log) => log.date !== todayKey);
        return {
          ...entry,
          status,
          reason: reason ?? entry.reason,
          progress: status === 'Done' ? entry.target : 0,
          history: [...history, { date: todayKey, status, reason }],
        };
      }),
      flash: {
        tone: status === 'Done' ? 'success' : 'info',
        text: `${routine.title} logged as ${status.toLowerCase()}.`,
      },
    }));
  };

  const findNextValidSlot = (task: CoachTask) => {
    for (let dayOffset = 1; dayOffset <= 5; dayOffset += 1) {
      const candidate = setTime(addDays(new Date(task.scheduledFor), dayOffset), 10 + dayOffset, 0);
      if (candidate > new Date(task.deadline)) continue;
      const conflict = state.tasks.some((entry) =>
        entry.id !== task.id && !entry.completed && Math.abs(new Date(entry.scheduledFor).getTime() - candidate.getTime()) < 60 * 60 * 1000
      );
      if (!conflict) return candidate.toISOString();
    }
    return null;
  };

  const adjustMyDay = () => {
    const isHardDay = state.energy <= 2 || state.mood === 'Reactive' || state.mood === 'Depleted';
    if (!isHardDay) {
      setFlash('info', 'You look steady enough to keep the current plan.');
      return { moved: 0, message: 'No adjustment needed.' };
    }

    const eligible = state.tasks.filter((task) =>
      !task.completed
      && sameDay(task.scheduledFor, TODAY.toISOString())
      && task.movesUsed < task.moveLimit
      && new Date(task.deadline) > new Date(task.scheduledFor)
    );

    const firstTask = eligible[0];
    if (!firstTask) {
      setFlash('warning', 'No valid task could be moved without breaking a deadline or move limit.');
      return { moved: 0, message: 'No eligible task found.' };
    }

    const nextSlot = findNextValidSlot(firstTask);
    if (!nextSlot) {
      setFlash('warning', 'All future slots before the deadline are already blocked.');
      return { moved: 0, message: 'No valid slot available.' };
    }

    moveTask(firstTask.id, nextSlot, 'adjust-day');
    return { moved: 1, message: 'Day adjusted.' };
  };

  const exportData = () => {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'realistic-coach-data.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setFlash('info', 'Raw data exported as JSON.');
  };

  const completionRate = useMemo(() => {
    const totalItems = state.tasks.length + state.routines.length;
    const completedItems = state.tasks.filter((task) => task.completed).length
      + state.routines.filter((routine) => routine.status === 'Done').length;
    return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  }, [state.tasks, state.routines]);

  const honestyRate = useMemo(() => {
    const routinePenalty = state.routines.filter((routine) => routine.status === 'Missed').length * 6;
    const moodPenalty = state.moveHistory.filter((entry) => entry.source === 'adjust-day').length * 4;
    return Math.max(0, 100 - routinePenalty - moodPenalty);
  }, [state.moveHistory, state.routines]);

  const streakDays = useMemo(() => {
    const doneCount = state.routines.filter((routine) => routine.status === 'Done').length;
    return 10 + doneCount;
  }, [state.routines]);

  const weeklyStats = useMemo(() => buildWeeklyStats(state), [state]);

  const value: CoachContextValue = {
    ...state,
    completionRate,
    honestyRate,
    streakDays,
    peakPerformance: state.energy >= 4 ? '06:15' : '05:45',
    phaseLabel: calculatePhaseLabel(state.cycleDay),
    weeklyStats,
    setEnergy: (energy) => setState((current) => ({ ...current, energy, flash: { tone: 'info', text: `Energy set to ${energy}/5.` } })),
    setMood: (mood) => setState((current) => ({ ...current, mood, flash: { tone: 'info', text: `Mood updated to ${mood.toLowerCase()}.` } })),
    setCycleDay: (cycleDay) => setState((current) => ({ ...current, cycleDay: Math.max(1, Math.min(28, cycleDay)) })),
    moveTask,
    completeTask,
    updateRoutineStatus,
    adjustMyDay,
    clearFlash: () => setState((current) => ({ ...current, flash: null })),
    exportData,
  };

  return (
    <CoachContext.Provider value={value}>
      {children}
    </CoachContext.Provider>
  );
};

export const useCoach = () => {
  const context = useContext(CoachContext);
  if (!context) {
    throw new Error('useCoach must be used inside CoachProvider');
  }
  return context;
};
