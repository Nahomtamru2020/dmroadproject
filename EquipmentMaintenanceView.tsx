import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Fuel, Settings, AlertTriangle, Package, Plus } from 'lucide-react';

export function EquipmentMaintenanceView() {
  const [activeTab, setActiveTab] = useState<'fuel' | 'maintenance' | 'spare'>('fuel');
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const qFuel = query(collection(db, 'fuelLogs'), orderBy('date', 'desc'));
    const qMaint = query(collection(db, 'maintenanceRecords'), orderBy('date', 'desc'));
    const qSpare = query(collection(db, 'spareParts'), orderBy('partName', 'asc'));

    const unsubFuel = onSnapshot(qFuel, snap => setFuelLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubMaint = onSnapshot(qMaint, snap => setMaintenanceRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubSpare = onSnapshot(qSpare, snap => setSpareParts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => {
      unsubFuel();
      unsubMaint();
      unsubSpare();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-x-hidden">
      <div className="bg-white border-b-4 border-slate-900 p-4 lg:p-8 shadow-xl shrink-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter">Equipment Logistics</h2>
            <button 
                onClick={() => setShowModal(true)}
                className="w-full lg:w-auto bg-amber-500 text-slate-900 px-6 py-3 font-black uppercase text-xs tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
                <Plus size={16} />
                New Entry
            </button>
        </div>

        <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-2 scrollbar-none">
            <TabButton active={activeTab === 'fuel'} onClick={() => setActiveTab('fuel')} icon={<Fuel size={14} />} label="Fuel" />
            <TabButton active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} icon={<AlertTriangle size={14} />} label="Repair" />
            <TabButton active={activeTab === 'spare'} onClick={() => setActiveTab('spare')} icon={<Package size={14} />} label="Spare" />
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {activeTab === 'fuel' && <FuelList logs={fuelLogs} />}
        {activeTab === 'maintenance' && <MaintenanceList records={maintenanceRecords} />}
        {activeTab === 'spare' && <SparePartsInventory parts={spareParts} />}
      </div>

      {showModal && <MaintenanceModal type={activeTab} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-3 lg:px-6 py-3 lg:py-3 font-black uppercase text-[9px] lg:text-[10px] tracking-widest border-2 transition-all shrink-0 ${active ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
        >
            {icon}
            {label}
        </button>
    );
}

function FuelList({ logs }: { logs: any[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {logs.map(log => (
                <div key={log.id} className="bg-white p-6 border-l-4 border-amber-500 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 text-slate-100 group-hover:text-amber-50 transition-colors">
                        <Fuel size={40} strokeWidth={3} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{log.date}</p>
                    <h3 className="text-xl font-black text-slate-900 uppercase leading-none mb-4">{log.plateNumber}</h3>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Volume</p>
                            <p className="text-lg font-black text-slate-900">{log.liters} L</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Total Cost</p>
                            <p className="text-lg font-black text-slate-900">{log.cost} ETB</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function MaintenanceList({ records }: { records: any[] }) {
    return (
        <div className="space-y-4">
            {records.map(rec => (
                <div key={rec.id} className={`bg-white p-4 lg:p-6 border-l-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${rec.type === 'Scheduled Service' ? 'border-emerald-500' : 'border-red-600'}`}>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                             <span className={`px-2 py-0.5 rounded-sm font-black uppercase text-[8px] lg:text-[9px] tracking-widest ${rec.type === 'Scheduled Service' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {rec.type}
                             </span>
                             <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase">{rec.date}</span>
                        </div>
                        <h3 className="text-base lg:text-lg font-black text-slate-900 uppercase tracking-tight truncate">{rec.plateNumber}</h3>
                        <p className="text-xs lg:text-sm text-slate-600 mt-1 leading-snug">{rec.description}</p>
                    </div>
                    <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto">
                        <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total ETB</p>
                        <p className="text-lg lg:text-xl font-black text-slate-900">{rec.cost?.toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function SparePartsInventory({ parts }: { parts: any[] }) {
    return (
        <div className="bg-white border-2 border-slate-900 shadow-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                        <th className="p-4 border-r border-slate-800">Part Description</th>
                        <th className="p-4 border-r border-slate-800">Current Qty</th>
                        <th className="p-4 border-r border-slate-800">Threshold</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {parts.map(part => (
                        <tr key={part.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-sm font-black text-slate-900 uppercase">{part.partName}</td>
                            <td className="p-4 text-sm font-bold text-slate-600">{part.quantity} {part.unit}</td>
                            <td className="p-4 text-sm font-bold text-slate-400">{part.minThreshold} {part.unit}</td>
                            <td className="p-4">
                                {part.quantity <= part.minThreshold ? (
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-sm font-black uppercase text-[9px] tracking-widest flex items-center gap-1 w-fit">
                                        <AlertTriangle size={10} /> Critical Low
                                    </span>
                                ) : (
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-sm font-black uppercase text-[9px] tracking-widest w-fit">
                                        Optimal
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function MaintenanceModal({ type, onClose }: { type: 'fuel' | 'maintenance' | 'spare', onClose: () => void }) {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const collectionName = type === 'fuel' ? 'fuelLogs' : type === 'maintenance' ? 'maintenanceRecords' : 'spareParts';
            await addDoc(collection(db, collectionName), {
                ...formData,
                timestamp: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            onClose();
        } catch (err) {
            console.error(err);
            alert('Error adding record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
            <div className="bg-white w-full max-w-lg border-4 border-slate-900 shadow-[20px_20px_0px_#f59e0b] overflow-hidden">
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Add {type} Record</h2>
                    <button onClick={onClose} className="text-amber-500 hover:text-white transition-colors uppercase font-black text-xs">Close</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {type === 'fuel' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Plate Number</label>
                                    <input type="text" required onChange={e => setFormData({...formData, plateNumber: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold uppercase" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Date</label>
                                    <input type="date" required onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Liters</label>
                                    <input type="number" step="0.01" required onChange={e => setFormData({...formData, liters: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Total Cost (ETB)</label>
                                    <input type="number" step="0.01" required onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                                </div>
                            </div>
                        </>
                    )}

                    {type === 'maintenance' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Plate Number</label>
                                    <input type="text" required onChange={e => setFormData({...formData, plateNumber: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold uppercase" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Date</label>
                                    <input type="date" required onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Service Type</label>
                                <select required onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold">
                                    <option value="">Select Option</option>
                                    <option value="Scheduled Service">Scheduled Service</option>
                                    <option value="Breakdown Repair">Breakdown Repair</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Description</label>
                                <textarea required onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold h-24" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Repair Cost (ETB)</label>
                                <input type="number" step="0.01" required onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                            </div>
                        </>
                    )}

                    {type === 'spare' && (
                        <>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Part Name</label>
                                <input type="text" required onChange={e => setFormData({...formData, partName: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold uppercase" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Quantity</label>
                                    <input type="number" required onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Unit (e.g. PCS, SET)</label>
                                    <input type="text" required onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold uppercase" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Minimum Threshold</label>
                                <input type="number" required onChange={e => setFormData({...formData, minThreshold: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-2 text-xs font-bold" />
                            </div>
                        </>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-4 font-black uppercase text-xs tracking-widest hover:bg-slate-800 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Submit Entry'}
                    </button>
                </form>
            </div>
        </div>
    );
}
