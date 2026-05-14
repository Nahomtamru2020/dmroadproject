import React, { useState } from 'react';
import { getPassword } from '../services/settingsService';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function PasswordModal({ onConfirm, onCancel }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const storedPassword = await getPassword();
        console.log("Input (trimmed):", password.trim(), "Stored:", storedPassword);
        if (password.trim() === storedPassword) {
            console.log("Passwords match!");
          onConfirm();
        } else {
            console.log("Passwords DO NOT match!");
          alert('Incorrect password');
        }
    } catch(err) {
        console.error(err);
        alert('Error validating password');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4 uppercase">Enter Password</h2>
        <div className="relative mb-4">
          <input 
            type={showPassword ? "text" : "password"} 
            autoFocus
            className="w-full p-2 pr-10 border border-slate-300 rounded" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white py-2 hover:bg-slate-800">{loading ? 'Checking...' : 'Submit'}</button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 py-2 hover:bg-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
