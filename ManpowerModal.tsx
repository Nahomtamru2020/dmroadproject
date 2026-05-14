import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ManpowerModalProps {
  onClose: () => void;
}

export function ManpowerModal({ onClose }: ManpowerModalProps) {
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [type, setType] = useState('Local');
  const [hireDate, setHireDate] = useState('');
  const [firedDate, setFiredDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'manpower'), {
        name,
        profession,
        type,
        hireDate,
        firedDate: firedDate || null,
        createdAt: serverTimestamp()
      });
      alert('Manpower added');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error adding manpower');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 uppercase">Add Manpower</h2>
        <input type="text" placeholder="Name" className="w-full p-2 border border-slate-300 rounded mb-4" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Profession" className="w-full p-2 border border-slate-300 rounded mb-4" value={profession} onChange={(e) => setProfession(e.target.value)} required />
        <select className="w-full p-2 border border-slate-300 rounded mb-4" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Local">Local</option>
          <option value="Chinese">Chinese</option>
        </select>
        <label className="block text-xs font-bold mb-1">Hire Date</label>
        <input type="date" className="w-full p-2 border border-slate-300 rounded mb-4" value={hireDate} onChange={(e) => setHireDate(e.target.value)} required />
        <label className="block text-xs font-bold mb-1">Fired/End Date (Optional)</label>
        <input type="date" className="w-full p-2 border border-slate-300 rounded mb-4" value={firedDate} onChange={(e) => setFiredDate(e.target.value)} />
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white py-2">Submit</button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2">Cancel</button>
        </div>
      </form>
    </div>
  );
}
