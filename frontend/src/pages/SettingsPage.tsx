import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl mb-6">Settings</h1>
      <div className="flex gap-8">
        <div className="w-64">
          <ul className="flex flex-col gap-4 font-sans barlow-medium text-muted">
            <li className="text-white hover-lift cursor-pointer">Profile</li>
            <li className="hover-lift cursor-pointer">Cycle Settings</li>
            <li className="hover-lift cursor-pointer">Notification Preferences</li>
            <li className="hover-lift cursor-pointer">Reschedule Rules</li>
            <li className="hover-lift cursor-pointer">Hard Day Mode</li>
            <li className="hover-lift cursor-pointer">Display</li>
            <li className="hover-lift cursor-pointer text-[var(--status-danger)]">Data & Privacy</li>
          </ul>
        </div>
        <div className="flex-1 card p-8">
          <h2 className="font-sans barlow-semibold text-xl mb-6">Profile</h2>
          {/* Form placeholder */}
          <div className="flex flex-col gap-4 max-w-md">
            <div>
              <label className="block text-sm text-muted mb-2">Name</label>
              <input type="text" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white focus:outline-none" defaultValue="Arwa" />
            </div>
            <button className="btn btn-pill bg-white text-black px-6 py-2 mt-4 self-start">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
