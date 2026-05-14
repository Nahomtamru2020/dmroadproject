
import React, { useState } from 'react';
import { getPassword, setPassword } from '../services/settingsService';
import { Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const storedPassword = await getPassword();
        if (oldPassword !== storedPassword) {
            alert('Incorrect old password');
            return;
        }
        await setPassword(newPassword);
        alert('Password changed successfully');
        onClose();
    } catch(err) {
        console.error(err);
        alert('Error changing password');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4 uppercase">Change Password</h2>
        
        <div className="relative mb-2">
          <input 
            type={showOld ? "text" : "password"} 
            placeholder="Old Password"
            className="w-full p-2 pr-10 border border-slate-300 rounded" 
            value={oldPassword} 
            onChange={(e) => setOldPassword(e.target.value)} 
            required 
          />
          <button 
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="relative mb-4">
          <input 
            type={showNew ? "text" : "password"} 
            placeholder="New Password"
            className="w-full p-2 pr-10 border border-slate-300 rounded" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
          <button 
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white py-2 hover:bg-slate-800">{loading ? 'Saving...' : 'Submit'}</button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2 hover:bg-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
