import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { handleFirestoreError, OperationType, exportToCSV } from '../lib/utils';

export function SiteEngineerReports({ onReportClick }: { onReportClick: (report: any, collection: string, editMode?: boolean) => void }) {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    // Assuming the collection is 'documents' and it has a field 'authorRole'
    const q = query(collection(db, 'documents'), where('authorRole', '==', 'Site Engineer'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'documents');
    });
    return () => unsubscribe();
  }, []);

  const handleExport = () => {
    exportToCSV(reports, 'SiteEngineerReports', ['Date', 'Content'], ['date', 'content']);
  };

  return (
    <div className="bg-white p-6 shadow-sm border border-slate-200 flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase">Site Engineer Reports</h2>
        <button onClick={handleExport} className="text-[10px] text-slate-500 hover:text-sky-600 underline">Export CSV</button>
      </div>
      <div className="space-y-2">
        {reports.map(report => (
          <div key={report.id} className="p-3 bg-slate-50 border border-slate-100 rounded-sm">
            <div onClick={() => onReportClick(report, 'documents')} className="cursor-pointer hover:bg-slate-100 p-2 -m-2">
              <p className="text-[10px] font-bold text-sky-600">{report.date || 'No Date'}</p>
              <p className="text-sm text-slate-800">{report.content}</p>
              {report.documentUrl && (
                <a href={report.documentUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 underline">
                  View Attachment
                </a>
              )}
            </div>
            
            <button
               onClick={() => onReportClick(report, 'documents', true)}
               className="mt-2 text-xs text-sky-600 font-bold hover:text-sky-800"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
