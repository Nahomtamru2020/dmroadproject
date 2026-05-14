import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType, exportToCSV } from '../lib/utils';

export function DailyReports({ onReportClick }: { onReportClick: (report: any, collection: string) => void }) {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'dailyReports'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'dailyReports');
    });
    return () => unsubscribe();
  }, []);

  const handleExport = () => {
    exportToCSV(reports, 'DailyReports', ['Date', 'Content'], ['date', 'content']);
  };

  return (
    <div className="bg-white p-6 shadow-sm border border-slate-200 flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase">Daily Reports</h2>
        <button onClick={handleExport} className="text-[10px] text-slate-500 hover:text-sky-600 underline">Export CSV</button>
      </div>
      <div className="space-y-2">
        {reports.map(report => (
          <div key={report.id} onClick={() => onReportClick(report, 'dailyReports')} className="p-3 bg-slate-50 border border-slate-100 rounded-sm cursor-pointer hover:bg-slate-100">
            <p className="text-[10px] font-bold text-slate-400">{report.date}</p>
            <p className="text-sm text-slate-800">{report.content}</p>
            {report.documentUrl && (
              <a href={report.documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                View Attachment
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
