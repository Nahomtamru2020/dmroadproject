import { useState } from 'react';
import { ChangePasswordModal } from './ChangePasswordModal';

export function CCECCProfile({ onClose }: { onClose: () => void }) {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-sm shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-amber-500 pb-2">CCECC Company Profile</h2>
        <div className="space-y-4 text-slate-800">
          <p>China Civil Engineering Construction Corporation (CCECC) is a premier global infrastructure contractor...</p>
          <h3 className="font-bold uppercase text-slate-500 text-sm">Specialization</h3>
          <p>Large-scale transportation engineering, railway construction, infrastructure development.</p>
          <h3 className="font-bold uppercase text-slate-500 text-sm">Contact Information</h3>
          <p>Email: info@ccecc.com.cn</p>
          <div className="flex gap-4 mt-6">
            <button onClick={onClose} className="bg-slate-900 text-white px-6 py-2">Close</button>
            <button onClick={() => setShowChangePassword(true)} className="bg-amber-600 text-white px-6 py-2">Change Password</button>
            <button onClick={async () => {
              const newPassword = prompt("Enter new default password:");
              if (newPassword) {
                await import('../services/settingsService').then(s => s.setPassword(newPassword));
                alert("Default password updated");
              }
            }} className="bg-emerald-600 text-white px-6 py-2">Set Default Password</button>
          </div>
        </div>
      </div>
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}
