import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType, exportToCSV } from '../lib/utils';

export function FinancialReports() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'financialReports'), orderBy('month', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'financialReports');
    });
    return () => unsubscribe();
  }, []);

  const handleExport = () => {
    exportToCSV(reports, 'FinancialReports', ['Month', 'Amount Spent'], ['month', 'amountSpent']);
  };

  return (
    <div className="bg-white p-5 border-t-4 border-emerald-500 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase">Monthly Financial Report</h2>
        <button onClick={handleExport} className="text-[10px] text-slate-500 hover:text-emerald-600 underline">Export CSV</button>
      </div>
      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-xs">{report.month}</span>
            <span className="text-xs font-mono font-bold">${report.amountSpent?.toLocaleString()}</span>
            {report.detailsUrl && (
              <a href={report.detailsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 underline">View</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
