import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/utils';

export function PersonnelView() {
  const [manpower, setManpower] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'manpower'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setManpower(data);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'manpower')
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="col-span-12">
      <h2 className="text-xs font-bold text-slate-500 uppercase mb-4">Manpower Details</h2>
      <div className="bg-white shadow-sm border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Profession</th>
              <th className="p-3">Type</th>
              <th className="p-3">Hire Date</th>
              <th className="p-3">Fired Date</th>
            </tr>
          </thead>
          <tbody>
            {manpower.map(person => (
              <tr key={person.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium">{person.name}</td>
                <td className="p-3">{person.profession}</td>
                <td className="p-3 capitalize">{person.type}</td>
                <td className="p-3">{person.hireDate}</td>
                <td className="p-3">{person.firedDate || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
