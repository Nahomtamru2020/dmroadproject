import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { handleFirestoreError, OperationType, exportToCSV } from '../lib/utils';

export function ForemanLogs({ onReportClick }: { onReportClick: (report: any, collection: string) => void }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'dailyReports'), where('author', '==', 'Foreman'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'dailyReports');
    });
    return () => unsubscribe();
  }, []);

  const handleExport = () => {
    exportToCSV(logs, 'ForemanLogs', ['Date', 'Content'], ['date', 'content']);
  };

  return (
    <div className="bg-white p-6 shadow-sm border border-slate-200 flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase">Foreman Logs</h2>
        <button onClick={handleExport} className="text-[10px] text-slate-500 hover:text-sky-600 underline">Export CSV</button>
      </div>
      <div className="space-y-2">
        {logs.map(log => (
          <div key={log.id} onClick={() => onReportClick(log, 'dailyReports')} className="p-3 bg-slate-50 border border-slate-100 rounded-sm cursor-pointer hover:bg-slate-100">
            <p className="text-[10px] font-bold text-sky-600">{log.date}</p>
            <p className="text-sm text-slate-800">{log.content}</p>
            {log.documentUrl && (
              <a href={log.documentUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 underline">
                View Attachment
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
