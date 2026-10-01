import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4 bg-[var(--bg-primary)]">
      {step === 1 && (
        <div className="text-center">
          <h1 className="font-serif text-[4rem] text-white tracking-tighter mb-4">Finally. A planner built around you.</h1>
          <p className="font-sans barlow-medium text-muted text-xl mb-12">FeelSync adapts to your energy, your cycle, your real life.</p>
          <button className="btn btn-pill bg-white text-black px-8 py-3 hover-lift" onClick={handleNext}>Let's Set You Up</button>
        </div>
      )}

      {step === 2 && (
        <div className="text-center max-w-lg w-full">
          <h2 className="font-sans barlow-semibold text-2xl mb-8">What do you mainly want to track?</h2>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {['Tasks', 'Routines', 'Mood', 'Cycle', 'All'].map(t => (
              <span key={t} className="btn btn-pill bg-[#1A1A1A] border border-white/10 text-white px-6 py-2 cursor-pointer hover:bg-white/10">{t}</span>
            ))}
          </div>
          
          <h2 className="font-sans barlow-semibold text-2xl mb-8">What's your biggest struggle?</h2>
          <div className="flex flex-col gap-3 mb-12">
            {['Procrastination', 'Burnout', 'Forgetting', 'Staying consistent'].map(t => (
              <div key={t} className="card p-4 hover-lift text-center cursor-pointer">{t}</div>
            ))}
          </div>

          <button className="btn btn-pill bg-white text-black px-8 py-3 w-full hover-lift" onClick={handleNext}>Continue</button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center max-w-lg w-full">
          <h2 className="font-sans barlow-semibold text-2xl mb-8">Cycle Setup</h2>
          
          <div className="card p-6 mb-8 text-left">
            <label className="block text-sm text-muted mb-2">When did your last period start?</label>
            <input type="date" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white mb-6 focus:outline-none" />
            
            <label className="block text-sm text-muted mb-2">How long is your average cycle?</label>
            <div className="flex items-center gap-4">
              <span className="btn bg-[#1A1A1A] border border-white/10 px-4 py-2 rounded-lg">-</span>
              <span className="font-sans barlow-semibold text-xl">28</span>
              <span className="btn bg-[#1A1A1A] border border-white/10 px-4 py-2 rounded-lg">+</span>
            </div>
          </div>
          
          <p className="text-muted text-sm barlow-medium mb-8">We use this to adjust your planner around your natural rhythm — never against it.</p>
          <button className="btn btn-pill bg-white text-black px-8 py-3 w-full hover-lift" onClick={handleNext}>Continue</button>
        </div>
      )}

      {step === 4 && (
        <div className="text-center max-w-lg w-full">
          <h2 className="font-sans barlow-semibold text-2xl mb-8">First Routine</h2>
          <p className="text-muted mb-8">Add your first routine to get started</p>
          
          <div className="card p-6 mb-8 text-left">
            <input type="text" placeholder="Routine Name" className="w-full bg-transparent border-b border-white/10 p-2 text-white text-lg focus:outline-none focus:border-white transition-colors mb-6" />
            <div className="flex gap-2 mb-6">
              <span className="text-2xl cursor-pointer opacity-50 hover:opacity-100 transition-opacity">🏋️</span>
              <span className="text-2xl cursor-pointer opacity-100">💆</span>
              <span className="text-2xl cursor-pointer opacity-50 hover:opacity-100 transition-opacity">💼</span>
              <span className="text-2xl cursor-pointer opacity-50 hover:opacity-100 transition-opacity">📚</span>
              <span className="text-2xl cursor-pointer opacity-50 hover:opacity-100 transition-opacity">🌙</span>
            </div>
          </div>
          
          <button className="btn btn-pill bg-white text-black px-8 py-3 w-full hover-lift" onClick={handleNext}>Enter FeelSync</button>
          <button className="mt-4 text-muted hover:text-white transition-colors text-sm" onClick={() => navigate('/dashboard')}>Skip and start</button>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
