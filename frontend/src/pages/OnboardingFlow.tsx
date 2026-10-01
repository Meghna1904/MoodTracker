import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [focus, setFocus] = useState('A little of everything');
  const [struggle, setStruggle] = useState('Keeping a realistic pace');
  const navigate = useNavigate();
  const next = () => step < 4 ? setStep(step + 1) : navigate('/dashboard');

  return (
    <main className="onboarding-page">
      <section className="onboarding-shell">
        <div className="onboarding-progress"><span style={{ width: `${step * 25}%` }} /></div>
        {step === 1 && <div><p className="coach-label">A calmer start</p><h1>A planner built around you.</h1><p>FeelSync notices the person inside the calendar. You stay in control of every adjustment.</p><div className="onboarding-actions"><button className="coach-button coach-button-primary" onClick={next}>Let&apos;s set you up →</button></div></div>}
        {step === 2 && <div><p className="coach-label">01 / 03</p><h2>What should the system hold?</h2><div className="onboarding-options">{['Tasks', 'Routines', 'Mood', 'Cycle', 'A little of everything'].map((item) => <button key={item} className={`onboarding-option ${focus === item ? 'is-selected' : ''}`} onClick={() => setFocus(item)}>{item}</button>)}</div><div className="onboarding-actions"><button className="coach-button coach-button-primary" onClick={next}>Continue →</button></div></div>}
        {step === 3 && <div><p className="coach-label">02 / 03</p><h2>What usually gets in the way?</h2><div className="onboarding-options">{['Procrastination', 'Burnout', 'Forgetting', 'Keeping a realistic pace'].map((item) => <button key={item} className={`onboarding-option ${struggle === item ? 'is-selected' : ''}`} onClick={() => setStruggle(item)}>{item}</button>)}</div><p>There is no wrong answer. This simply helps the first suggestions feel less generic.</p><div className="onboarding-actions"><button className="coach-button coach-button-primary" onClick={next}>Continue →</button></div></div>}
        {step === 4 && <div><p className="coach-label">03 / 03</p><h2>One small anchor.</h2><p>Choose one routine you want the app to remember. You can change this later.</p><label className="onboarding-field">Routine name<input placeholder="Morning walk, deep work, sleep..." /></label><div className="onboarding-actions"><button className="coach-button coach-button-primary" onClick={next}>Enter your day →</button><button className="coach-button" onClick={() => navigate('/dashboard')}>Skip</button></div></div>}
      </section>
    </main>
  );
};

export default OnboardingFlow;
