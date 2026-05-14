import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/utils';

export function MachineryView() {
  const [machinery, setMachinery] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'machinery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMachinery(data);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'machinery')
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="col-span-12">
      <h2 className="text-xs font-bold text-slate-500 uppercase mb-4">Machinery Details</h2>
      <div className="bg-white shadow-sm border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3">Plate Number</th>
              <th className="p-3">Type</th>
              <th className="p-3">Joining Date</th>
              <th className="p-3">Demobilization Date</th>
            </tr>
          </thead>
          <tbody>
            {machinery.map(item => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium">{item.plateNumber}</td>
                <td className="p-3">{item.type}</td>
                <td className="p-3">{item.joiningDate}</td>
                <td className="p-3">{item.demobilizationDate || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
