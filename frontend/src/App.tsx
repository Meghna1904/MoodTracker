import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// New Pages
import LandingHero from './pages/LandingHero';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import RoutinesPage from './pages/RoutinesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MoodCycleLog from './pages/MoodCycleLog';
import SettingsPage from './pages/SettingsPage';
import OnboardingFlow from './pages/OnboardingFlow';
import { CoachProvider } from './context/CoachContext';
import { ThemeProvider } from './context/ThemeContext';

// Shared Components
import Layout from './components/shared/Layout';

function App() {
  return (
    <ThemeProvider>
      <CoachProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingHero />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            
            {/* App Routes wrapped in Layout */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/routines" element={<RoutinesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/mood-cycle" element={<MoodCycleLog />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CoachProvider>
    </ThemeProvider>
  );
}

export default App;
