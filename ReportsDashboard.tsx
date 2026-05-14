import { useState } from 'react';
import { DailyReports } from './DailyReports';
import { ForemanLogs } from './ForemanLogs';
import { SiteEngineerReports } from './SiteEngineerReports';
import { OfficeEngineerReports } from './OfficeEngineerReports';

export function ReportsDashboard({ role, onReportClick }: { role: string; onReportClick: (report: any, collection: string, editMode?: boolean) => void }) {
  const [activeReport, setActiveReport] = useState('Daily');

  return (
    <div className="col-span-12 flex flex-col gap-4">
      <div className="flex gap-2 mb-2">
        {(role === 'All' || role === 'Foreman' || role === 'Site Engineer' || role === 'Office Engineer') && (
          <button onClick={() => setActiveReport('Daily')} className={`px-4 py-2 text-xs font-bold uppercase ${activeReport === 'Daily' ? 'bg-amber-500 text-white' : 'bg-white'}`}>Daily</button>
        )}
        {(role === 'All' || role === 'Foreman') && (
          <button onClick={() => setActiveReport('Foreman')} className={`px-4 py-2 text-xs font-bold uppercase ${activeReport === 'Foreman' ? 'bg-amber-500 text-white' : 'bg-white'}`}>Foreman</button>
        )}
        {(role === 'All' || role === 'Site Engineer') && (
          <button onClick={() => setActiveReport('Site')} className={`px-4 py-2 text-xs font-bold uppercase ${activeReport === 'Site' ? 'bg-amber-500 text-white' : 'bg-white'}`}>Site</button>
        )}
        {(role === 'All' || role === 'Office Engineer') && (
          <button onClick={() => setActiveReport('Office')} className={`px-4 py-2 text-xs font-bold uppercase ${activeReport === 'Office' ? 'bg-amber-500 text-white' : 'bg-white'}`}>Office</button>
        )}
      </div>
      
      {activeReport === 'Daily' && <DailyReports onReportClick={onReportClick} />}
      {activeReport === 'Foreman' && <ForemanLogs onReportClick={onReportClick} />}
      {activeReport === 'Site' && <SiteEngineerReports onReportClick={onReportClick} />}
      {activeReport === 'Office' && <OfficeEngineerReports onReportClick={onReportClick} />}
    </div>
  );
}
