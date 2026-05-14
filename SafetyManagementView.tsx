import * as React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { ShieldAlert, HardHat, Siren, Plus, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export function SafetyManagementView() {
  const [activeTab, setActiveTab] = useState<'incidents' | 'ppe' | 'alerts'>('incidents');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const qIncidents = query(collection(db, 'safetyIncidents'), orderBy('date', 'desc'));
    const qAudits = query(collection(db, 'ppeAudits'), orderBy('date', 'desc'));
    const qAlerts = query(collection(db, 'emergencyAlerts'), orderBy('timestamp', 'desc'), limit(10));

    const unsubIncidents = onSnapshot(qIncidents, snap => setIncidents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubAudits = onSnapshot(qAudits, snap => setAudits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubAlerts = onSnapshot(qAlerts, snap => setAlerts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => {
      unsubIncidents();
      unsubAudits();
      unsubAlerts();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-orange-50/30 font-sans">
      <div className="bg-white border-b-4 border-slate-900 p-4 lg:p-8 shadow-xl shrink-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-sm flex items-center justify-center text-white shadow-[4px_4px_0px_#000]">
                    <ShieldAlert size={28} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter">Safety Management System</h2>
            </div>
            <button 
                onClick={() => setShowModal(true)}
                className="w-full lg:w-auto bg-red-600 text-white px-6 py-3 font-black uppercase text-xs tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
                <Plus size={16} />
                New Safety Entry
            </button>
        </div>

        <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-2 scrollbar-none">
            <TabButton active={activeTab === 'incidents'} onClick={() => setActiveTab('incidents')} icon={<AlertCircle size={14} />} label="Incidents" />
            <TabButton active={activeTab === 'ppe'} onClick={() => setActiveTab('ppe')} icon={<HardHat size={14} />} label="PPE Audits" />
            <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={<Siren size={14} />} label="Emergency Alerts" />
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'alerts' && (
                <div className="bg-red-50 border-4 border-red-600 p-6 mb-8 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
                        <Siren size={200} className="text-red-600" />
                    </div>
                    <h3 className="text-red-700 font-black uppercase text-xs tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Siren size={14} /> Active Emergency Protocol
                    </h3>
                    <div className="space-y-4">
                        {alerts.map(alert => (
                            <div key={alert.id} className="bg-white p-4 border-2 border-red-600 shadow-md">
                                <p className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-1">
                                    {alert.timestamp?.toDate().toLocaleString() || 'Just now'}
                                </p>
                                <p className="text-slate-900 font-bold leading-tight">{alert.message}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Broadcasted by: {alert.sender}</p>
                            </div>
                        ))}
                        {alerts.length === 0 && <p className="text-red-400 font-bold text-xs uppercase italic">No active priority alerts in the last 24 hours.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'incidents' && <IncidentList incidents={incidents} />}
            {activeTab === 'ppe' && <PPEAuditGrid audits={audits} />}
        </div>
      </div>

      {showModal && <SafetyModal type={activeTab} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-3 lg:px-6 py-3 font-black uppercase text-[9px] lg:text-[10px] tracking-widest border-2 transition-all shrink-0 ${active ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
        >
            {icon}
            {label}
        </button>
    );
}

function IncidentList({ incidents }: { incidents: any[] }) {
    return (
        <div className="space-y-4">
            {incidents.map(inc => (
                <div key={inc.id} className={`bg-white border-4 p-6 shadow-xl relative overflow-hidden ${inc.severity === 'Critical' ? 'border-red-600' : inc.severity === 'High' ? 'border-orange-500' : 'border-slate-900'}`}>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-2 py-0.5 font-black uppercase text-[10px] tracking-widest ${inc.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                                    {inc.severity} Severity
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{inc.date}</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{inc.location}</h3>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{inc.description}</p>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reported by: <span className="text-slate-900">{inc.reportedBy}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function PPEAuditGrid({ audits }: { audits: any[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audits.map(audit => (
                <div key={audit.id} className="bg-white border-2 border-slate-900 p-6 shadow-xl relative">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                            <HardHat size={20} className="text-amber-500" />
                            <h3 className="font-black text-slate-900 uppercase tracking-tighter">{audit.segment}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-sm ${audit.complianceScore >= 90 ? 'border-emerald-500 text-emerald-600' : audit.complianceScore >= 70 ? 'border-amber-500 text-amber-600' : 'border-red-500 text-red-600'}`}>
                            {audit.complianceScore}%
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{audit.date}</p>
                    <p className="text-xs text-slate-600 font-medium italic">"{audit.notes}"</p>
                    <div className="mt-6 flex items-center gap-2">
                        {audit.complianceScore >= 90 ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                            {audit.complianceScore >= 90 ? 'Regulatory Compliant' : 'Needs Corrective Action'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function SafetyModal({ type, onClose }: { type: 'incidents' | 'ppe' | 'alerts', onClose: () => void }) {
    const [formData, setFormData] = useState<any>({ severity: 'Low', complianceScore: 85, sender: 'Safety Admin' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const col = type === 'incidents' ? 'safetyIncidents' : type === 'ppe' ? 'ppeAudits' : 'emergencyAlerts';
            await addDoc(collection(db, col), {
                ...formData,
                timestamp: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            onClose();
        } catch (err) {
            console.error(err);
            alert('Error logging safety record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
            <div className="bg-white w-full max-w-lg border-4 border-slate-900 shadow-[20px_20px_0px_#red-600] overflow-hidden">
                <div className="bg-red-600 text-white p-6 flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Safety Console entry</h2>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-2 transition-colors"><Plus className="rotate-45" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {type === 'incidents' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Date</label>
                                    <input type="date" required onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Severity</label>
                                    <select required onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Location / Segment</label>
                                <input type="text" required placeholder="e.g. KM 12+500" onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold uppercase" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Description</label>
                                <textarea required onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold h-24" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Reported By</label>
                                <input type="text" required onChange={e => setFormData({...formData, reportedBy: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                            </div>
                        </>
                    )}

                    {type === 'ppe' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Audit Date</label>
                                    <input type="date" required onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Compliance %</label>
                                    <input type="number" min="0" max="100" required value={formData.complianceScore} onChange={e => setFormData({...formData, complianceScore: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Site Section</label>
                                <input type="text" required onChange={e => setFormData({...formData, segment: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold uppercase" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Observations</label>
                                <textarea required onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold h-24" />
                            </div>
                        </>
                    )}

                    {type === 'alerts' && (
                        <>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Emergency Message</label>
                                <textarea required placeholder="CRITICAL: Evacuate Segment 4 due to rockfall risk..." onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border-4 border-red-600 p-4 text-sm font-black text-red-600 uppercase" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Broadcast Identity</label>
                                <input type="text" required value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                            </div>
                            <div className="p-4 bg-red-50 border-2 border-red-200 flex items-center gap-3">
                                <ShieldAlert size={24} className="text-red-600" />
                                <p className="text-[10px] text-red-600 font-bold uppercase leading-tight">This message will be broadcast to all site engineering terminals instantly.</p>
                            </div>
                        </>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-4 font-black uppercase text-xs tracking-widest disabled:opacity-50 transition-all ${type === 'alerts' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                        {loading ? 'Transmitting...' : type === 'alerts' ? 'Broadcast Emergency' : 'Log Safety Data'}
                    </button>
                </form>
            </div>
        </div>
    );
}
