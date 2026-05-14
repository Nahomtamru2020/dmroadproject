import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface MachineryModalProps {
  onClose: () => void;
}

export function MachineryModal({ onClose }: MachineryModalProps) {
  const [plateNumber, setPlateNumber] = useState('');
  const [mType, setMType] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [demobilizationDate, setDemobilizationDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'machinery'), {
        plateNumber,
        type: mType,
        joiningDate,
        demobilizationDate: demobilizationDate || null,
        createdAt: serverTimestamp()
      });
      alert('Machinery added');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error adding machinery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 uppercase">Add Machinery</h2>
        <input type="text" placeholder="Plate Number" className="w-full p-2 border border-slate-300 rounded mb-4" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />
        <input type="text" placeholder="Type" className="w-full p-2 border border-slate-300 rounded mb-4" value={mType} onChange={(e) => setMType(e.target.value)} required />
        <label className="block text-xs font-bold mb-1">Joining Date</label>
        <input type="date" className="w-full p-2 border border-slate-300 rounded mb-4" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required />
        <label className="block text-xs font-bold mb-1">Demobilization Date (Optional)</label>
        <input type="date" className="w-full p-2 border border-slate-300 rounded mb-4" value={demobilizationDate} onChange={(e) => setDemobilizationDate(e.target.value)} />
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white py-2">Submit</button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2">Cancel</button>
        </div>
      </form>
    </div>
  );
}
