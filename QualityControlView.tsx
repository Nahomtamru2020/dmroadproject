import * as React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { CheckCircle, ClipboardCheck, FlaskConical, Plus, Search, FileCheck, XCircle, AlertTriangle, Download, Calendar, MapPin } from 'lucide-react';

export function QualityControlView() {
  const [activeTab, setActiveTab] = useState<'tests' | 'approvals'>('tests');
  const [tests, setTests] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const qTests = query(collection(db, 'qualityTests'), orderBy('date', 'desc'));
    const qApprovals = query(collection(db, 'inspectionApprovals'), orderBy('date', 'desc'));

    const unsubTests = onSnapshot(qTests, snap => setTests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubApprovals = onSnapshot(qApprovals, snap => setApprovals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => {
      unsubTests();
      unsubApprovals();
    };
  }, []);

  const filteredTests = tests.filter(t => t.type?.toLowerCase().includes(filter.toLowerCase()) || t.location?.toLowerCase().includes(filter.toLowerCase()));
  const filteredApprovals = approvals.filter(a => a.workType?.toLowerCase().includes(filter.toLowerCase()) || a.location?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="bg-white border-b-4 border-slate-900 p-6 lg:p-10 shadow-xl shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-sm flex items-center justify-center text-white shadow-[6px_6px_0px_#0f172a]">
              <ClipboardCheck size={32} />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter">Quality Control</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Material Testing & Inspection Registry</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full lg:w-auto bg-slate-900 text-white px-8 py-4 font-black uppercase text-xs tracking-widest border-b-4 border-emerald-500 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <Plus size={18} className="text-emerald-400" />
            New Quality Record
          </button>
        </div>

        <div className="max-w-7xl mx-auto mt-10 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex gap-2 w-full md:w-auto bg-slate-100 p-1 rounded-sm">
                <button 
                    onClick={() => setActiveTab('tests')}
                    className={`px-6 py-3 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'tests' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Material Tests
                </button>
                <button 
                    onClick={() => setActiveTab('approvals')}
                    className={`px-6 py-3 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Inspections
                </button>
            </div>
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="SEARCH BY TYPE OR LOCATION..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 outline-none font-bold text-[10px] uppercase tracking-wider"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            {activeTab === 'tests' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredTests.map(test => (
                        <TestCard key={test.id} test={test} />
                    ))}
                    {filteredTests.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase tracking-widest">No matching test results found</div>}
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredApprovals.map(approval => (
                        <ApprovalRow key={approval.id} approval={approval} />
                    ))}
                    {filteredApprovals.length === 0 && <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">No matching inspections found</div>}
                </div>
            )}
        </div>
      </div>

      {showModal && <QCModal type={activeTab} onClose={() => setShowModal(false)} />}
    </div>
  );
}

const TestCard: React.FC<{ test: any }> = ({ test }) => {
    const statusColor = test.result === 'Pass' ? 'text-emerald-600' : test.result === 'Fail' ? 'text-red-600' : 'text-amber-600';
    const statusBg = test.result === 'Pass' ? 'bg-emerald-50' : test.result === 'Fail' ? 'bg-red-50' : 'bg-amber-50';
    const statusIcon = test.result === 'Pass' ? <CheckCircle size={16} /> : test.result === 'Fail' ? <XCircle size={16} /> : <AlertTriangle size={16} />;

    return (
        <div className="bg-white border-4 border-slate-900 p-6 shadow-[10px_10px_0px_rgba(15,23,42,0.05)] relative overflow-hidden group">
            <div className={`absolute top-0 right-0 px-4 py-2 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 ${statusBg} ${statusColor} border-l-4 border-b-4 border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                {statusIcon}
                {test.result}
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center">
                    <FlaskConical size={20} />
                </div>
                <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">{test.type}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{test.date}</p>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-slate-400 mt-1" />
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">{test.location}</p>
                </div>
                <div className="bg-slate-50 p-4 border-l-4 border-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Test Parameters</p>
                    <div className="grid grid-cols-2 gap-2">
                        {test.parameters && Object.entries(test.parameters).map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{key}</span>
                                <span className="text-[10px] font-black text-slate-900">{val as any}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {test.labReportUrl && (
                <a 
                    href={test.labReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 p-3 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                >
                    <Download size={14} />
                    Lab Report Archive
                </a>
            )}
        </div>
    );
}

const ApprovalRow: React.FC<{ approval: any }> = ({ approval }) => {
    const isApproved = approval.status === 'Approved';
    const isRejected = approval.status === 'Rejected';

    return (
        <div className="bg-white border-2 border-slate-900 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:translate-x-2 transition-transform shadow-md">
            <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 flex items-center justify-center text-white ${isApproved ? 'bg-emerald-500' : isRejected ? 'bg-red-500' : 'bg-amber-500'}`}>
                    <FileCheck size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight">{approval.workType}</h3>
                    <div className="flex gap-4 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <MapPin size={10} /> {approval.location}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Calendar size={10} /> {approval.date}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:items-end gap-2 shrink-0">
                <span className={`px-4 py-1 font-black uppercase text-[10px] tracking-widest ${isApproved ? 'bg-emerald-50 text-emerald-600' : isRejected ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    {approval.status}
                </span>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inspector: <span className="text-slate-900">{approval.inspector}</span></p>
            </div>

            <div className="w-full md:w-64 border-l-0 md:border-l-2 border-slate-100 pl-0 md:pl-6">
                <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed">"{approval.remarks || 'No formal remarks provided.'}"</p>
            </div>
        </div>
    );
}

function QCModal({ type, onClose }: { type: 'tests' | 'approvals', onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({
        type: 'Asphalt',
        result: 'Pass',
        status: 'Approved',
        date: new Date().toISOString().split('T')[0],
        parameters: { 'Density': '98%', 'Strength': '35 MPa' }
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const col = type === 'tests' ? 'qualityTests' : 'inspectionApprovals';
      await addDoc(collection(db, col), {
        ...formData,
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error updating quality registry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
      <div className="bg-white w-full max-w-xl border-4 border-slate-900 shadow-[24px_24px_0px_rgba(5,150,105,0.1)] overflow-hidden">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Quality Control Console</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors uppercase font-black text-xs">Close</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {type === 'tests' ? (
                <>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Test Type</label>
                            <select 
                                required 
                                className="w-full border-2 border-slate-200 p-3 text-sm font-bold focus:border-slate-900 transition-all outline-none"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="Asphalt">Asphalt</option>
                                <option value="Concrete">Concrete</option>
                                <option value="Soil">Soil</option>
                                <option value="Aggregates">Aggregates</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Result</label>
                            <select 
                                required 
                                className="w-full border-2 border-slate-200 p-3 text-sm font-bold focus:border-slate-900 transition-all outline-none"
                                value={formData.result}
                                onChange={e => setFormData({...formData, result: e.target.value})}
                            >
                                <option value="Pass">Pass</option>
                                <option value="Fail">Fail</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Location / Stake</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full border-2 border-slate-200 p-3 text-sm font-bold uppercase focus:border-slate-900 transition-all outline-none" 
                            placeholder="E.G. KM 22+100 LEFT LANE"
                            onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Lab Report Link</label>
                        <input 
                            type="url" 
                            className="w-full border-2 border-slate-200 p-3 text-sm font-bold focus:border-slate-900 transition-all outline-none" 
                            placeholder="HTTPS://LAB-SERVER/REPORTS/..."
                            onChange={e => setFormData({...formData, labReportUrl: e.target.value})}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Work Inspected</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full border-2 border-slate-200 p-3 text-sm font-bold uppercase focus:border-slate-900 transition-all outline-none" 
                            placeholder="E.G. SUB-BASE COMPACTION"
                            onChange={e => setFormData({...formData, workType: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Status</label>
                            <select 
                                required 
                                className="w-full border-2 border-slate-200 p-3 text-sm font-bold focus:border-slate-900 transition-all outline-none"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Conditionally Approved">Conditionally Approved</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Inspection Date</label>
                            <input 
                                type="date" 
                                required 
                                className="w-full border-2 border-slate-200 p-3 text-sm font-bold focus:border-slate-900 transition-all outline-none"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Inspector Name</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full border-2 border-slate-200 p-3 text-sm font-bold uppercase focus:border-slate-900 transition-all outline-none" 
                            onChange={e => setFormData({...formData, inspector: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Remarks</label>
                        <textarea 
                            rows={3}
                            className="w-full border-2 border-slate-200 p-3 text-sm font-bold focus:border-slate-900 transition-all outline-none resize-none" 
                            onChange={e => setFormData({...formData, remarks: e.target.value})}
                        />
                    </div>
                </>
            )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting to Registry...' : 'Authorize Quality Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
