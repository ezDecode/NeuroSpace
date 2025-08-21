import { CogIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12 space-y-6">
        <div className="space-y-2">
          <CogIcon className="h-16 w-16 text-white/40 mx-auto" />
          <h2 className="text-2xl font-normal text-white">Settings</h2>
          <p className="text-white/60">Account settings and preferences will be available here</p>
        </div>
        
        <div className="max-w-md mx-auto space-y-3">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="text-white font-medium mb-1">Profile Settings</div>
            <div className="text-white/60 text-sm">Manage your account information</div>
          </div>
          
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="text-white font-medium mb-1">Preferences</div>
            <div className="text-white/60 text-sm">Customize your experience</div>
          </div>
          
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="text-white font-medium mb-1">Data & Privacy</div>
            <div className="text-white/60 text-sm">Control your data and privacy settings</div>
          </div>
        </div>
      </div>
    </div>
  );
}
