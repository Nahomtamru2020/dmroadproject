import * as React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, Landmark, ShoppingBag, ListChecks, Plus, TrendingUp, DollarSign, Clock, CheckCircle2, AlertCircle, FileText, ArrowUpRight } from 'lucide-react';

type FinancialTab = 'budget' | 'payments' | 'boq' | 'procurement';

export function FinancialSystemView() {
  const [activeTab, setActiveTab] = useState<FinancialTab>('budget');
  const [budgets, setBudgets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [procurements, setProcurements] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubBudgets = onSnapshot(collection(db, 'budgets'), snap => setBudgets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubPayments = onSnapshot(query(collection(db, 'contractorPayments'), orderBy('date', 'desc')), snap => setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubBoq = onSnapshot(collection(db, 'boqItems'), snap => setBoqItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubProcurements = onSnapshot(collection(db, 'procurementRequests'), snap => setProcurements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => {
      unsubBudgets();
      unsubPayments();
      unsubBoq();
      unsubProcurements();
    };
  }, []);

  const totalAllocated = budgets.reduce((acc, b) => acc + (b.allocated || 0), 0);
  const totalActual = budgets.reduce((acc, b) => acc + (b.actual || 0), 0);
  const chartData = budgets.map(b => ({
    name: b.name,
    allocated: b.allocated,
    actual: b.actual,
    variance: b.allocated - b.actual
  }));

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Header Section */}
      <div className="bg-white border-b-4 border-slate-900 p-6 lg:p-10 shadow-xl shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-slate-900 rounded-sm flex items-center justify-center text-amber-500 shadow-[8px_8px_0px_#f59e0b]">
              <Wallet size={36} />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter">Finance Hub</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Capital Expenditure & Resource Control</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full lg:w-auto bg-amber-500 text-slate-900 px-8 py-4 font-black uppercase text-xs tracking-widest border-2 border-slate-900 shadow-[8px_8px_0px_#0f172a] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3"
          >
            <Plus size={18} />
            Execute New Transaction
          </button>
        </div>

        <div className="max-w-7xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <TabNav active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon={<TrendingUp size={16} />} label="Budget Alignment" />
          <TabNav active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<Landmark size={16} />} label="Contractor Payouts" />
          <TabNav active={activeTab === 'boq'} onClick={() => setActiveTab('boq')} icon={<ListChecks size={16} />} label="BOQ Execution" />
          <TabNav active={activeTab === 'procurement'} onClick={() => setActiveTab('procurement')} icon={<ShoppingBag size={16} />} label="Procurement" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto no-scrollbar">
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
          {activeTab === 'budget' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white border-2 border-slate-900 p-8 shadow-xl">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex justify-between items-center">
                    Budget Utilization Analysis
                    <span className="text-[10px] bg-slate-100 px-3 py-1 text-slate-500">Real-time Data</span>
                 </h3>
                 <div className="h-[400px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="name" stroke="#0f172a" fontSize={10} fontWeight={900} tick={{ fill: '#64748b' }} />
                       <YAxis stroke="#0f172a" fontSize={10} fontWeight={900} />
                       <Tooltip 
                         cursor={{ fill: '#f8fafc' }}
                         contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#fff' }}
                         itemStyle={{ color: '#fbbf24', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                       />
                       <Bar dataKey="allocated" fill="#0f172a" name="Allocated" />
                       <Bar dataKey="actual" fill="#f59e0b" name="Actual Spent" />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>
              <div className="space-y-6">
                <SummaryCard label="Total Allocation" value={`$${totalAllocated.toLocaleString()}`} color="slate" icon={<DollarSign />} />
                <SummaryCard label="Actual Expenditure" value={`$${totalActual.toLocaleString()}`} color="amber" icon={<TrendingUp />} />
                <SummaryCard 
                   label="Financial Burn" 
                   value={`${totalAllocated > 0 ? ((totalActual / totalAllocated) * 100).toFixed(1) : 0}%`} 
                   color={totalActual > totalAllocated ? 'red' : 'emerald'} 
                   icon={<ArrowUpRight />} 
                />
              </div>
            </div>
          )}

          {activeTab === 'payments' && <ContractorPaymentsGrid payments={payments} />}
          {activeTab === 'boq' && <BOQTrackingTable items={boqItems} />}
          {activeTab === 'procurement' && <ProcurementWorkflow requests={procurements} />}
        </div>
      </div>

      {showModal && <FinancialModal type={activeTab} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function TabNav({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-4 font-black uppercase text-[10px] tracking-widest border-2 transition-all ${active ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
    >
      <span className={active ? 'text-amber-500' : ''}>{icon}</span>
      {label}
    </button>
  );
}

function SummaryCard({ label, value, color, icon }: { label: string, value: string, color: string, icon: React.ReactNode }) {
  const bg = color === 'slate' ? 'bg-slate-900 text-white' : color === 'amber' ? 'bg-amber-500 text-slate-900' : color === 'red' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white';
  return (
    <div className={`${bg} p-8 border-2 border-slate-900 shadow-xl relative overflow-hidden`}>
      <div className="absolute -right-4 -bottom-4 opacity-10">
         {React.cloneElement(icon as React.ReactElement, { size: 100 })}
      </div>
      <p className="font-black uppercase text-[10px] tracking-[0.2em] mb-2 opacity-80">{label}</p>
      <h4 className="text-3xl font-black">{value}</h4>
    </div>
  );
}

const ContractorPaymentsGrid: React.FC<{ payments: any[] }> = ({ payments }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {payments.map(p => (
        <div key={p.id} className="bg-white border-4 border-slate-900 p-8 shadow-2xl relative group">
          <div className={`absolute top-0 right-0 px-4 py-2 font-black uppercase text-[9px] tracking-widest border-l-4 border-b-4 border-slate-900 ${p.status === 'Paid' ? 'bg-emerald-500 text-white' : p.status === 'Disputed' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
            {p.status}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{p.date}</p>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 group-hover:text-amber-600 transition-colors">{p.contractorName}</h3>
          
          <div className="flex items-end justify-between border-t-2 border-slate-50 pt-6">
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Disbursement</p>
                <p className="text-2xl font-black text-slate-900">${p.amount?.toLocaleString()}</p>
             </div>
             {p.invoiceUrl && (
               <a href={p.invoiceUrl} target="_blank" rel="noopener" className="p-3 bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                  <FileText size={18} />
               </a>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};

const BOQTrackingTable: React.FC<{ items: any[] }> = ({ items }) => {
  return (
    <div className="bg-white border-4 border-slate-900 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-6">Item Code</th>
              <th className="p-6">Description</th>
              <th className="p-6">Progress</th>
              <th className="p-6">Actual Quantity</th>
              <th className="p-6">Unit Rate</th>
              <th className="p-6">Total Value</th>
            </tr>
          </thead>
          <tbody className="text-slate-600 font-bold divide-y divide-slate-100">
            {items.map(item => {
              const progress = Math.min(((item.executedQuantity || 0) / (item.plannedQuantity || 1)) * 100, 100);
              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-black text-slate-900 underline decoration-amber-500 decoration-2">{item.itemCode}</td>
                  <td className="p-6 text-xs">{item.description}</td>
                  <td className="p-6 w-48">
                    <div className="h-4 bg-slate-100 border border-slate-200 relative">
                       <div className="h-full bg-amber-500" style={{ width: `${progress}%` }} />
                       <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-slate-900">
                         {progress.toFixed(0)}%
                       </span>
                    </div>
                  </td>
                  <td className="p-6 text-xs">{item.executedQuantity} {item.unit}</td>
                  <td className="p-6 text-xs">${item.unitRate}</td>
                  <td className="p-6 font-black text-slate-900">${((item.executedQuantity || 0) * (item.unitRate || 0)).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProcurementWorkflow: React.FC<{ requests: any[] }> = ({ requests }) => {
  return (
    <div className="space-y-4">
      {requests.map(req => {
        const isUrgent = req.urgency === 'Critical' || req.urgency === 'Urgent';
        return (
          <div key={req.id} className={`bg-white border-2 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl ${isUrgent ? 'border-red-600' : 'border-slate-900'}`}>
            <div className="flex items-center gap-5 flex-1">
              <div className={`w-12 h-12 flex items-center justify-center text-white ${req.status === 'Received' ? 'bg-emerald-500' : req.status === 'Ordered' ? 'bg-slate-900' : 'bg-amber-500'}`}>
                {req.status === 'Received' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">{req.item}</h3>
                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${isUrgent ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                    {req.urgency}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Quantity: {req.quantity} • Requested by {req.requestedBy}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8 w-full md:w-auto">
               <div className="flex-1 md:w-48">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Workflow Status</p>
                  <div className="flex gap-1 h-2">
                    {['Requested', 'Approved', 'Ordered', 'Received'].map((step, idx, arr) => {
                      const currentIdx = arr.indexOf(req.status);
                      return (
                        <div key={step} className={`flex-1 ${idx <= currentIdx ? 'bg-emerald-500' : 'bg-slate-100'}`} title={step} />
                      );
                    })}
                  </div>
               </div>
               <div className="text-right shrink-0">
                  <span className="font-black text-slate-900 uppercase text-[10px] tracking-widest">{req.status}</span>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function FinancialModal({ type, onClose }: { type: FinancialTab, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    status: 'Pending',
    urgency: 'Normal',
    date: new Date().toISOString().split('T')[0],
    unit: 'm3'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const colMap = {
        budget: 'budgets',
        payments: 'contractorPayments',
        boq: 'boqItems',
        procurement: 'procurementRequests'
      };
      await addDoc(collection(db, colMap[type]), {
        ...formData,
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Transaction Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 z-[300]">
      <div className="bg-white w-full max-w-lg border-4 border-slate-900 shadow-[32px_32px_0px_rgba(15,23,42,0.1)] overflow-hidden">
        <div className="bg-slate-900 text-white p-8 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Finance Interface</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors"><Plus className="rotate-45" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {type === 'budget' && (
            <>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Category Name</label>
                  <input type="text" required onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900 uppercase" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Allocated ($)</label>
                    <input type="number" required onChange={e => setFormData({...formData, allocated: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Actual Spent ($)</label>
                    <input type="number" required onChange={e => setFormData({...formData, actual: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900" />
                  </div>
               </div>
            </>
          )}

          {type === 'payments' && (
            <>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Contractor Entity</label>
                  <input type="text" required onChange={e => setFormData({...formData, contractorName: e.target.value})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900 uppercase" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Payment Amount ($)</label>
                    <input type="number" required onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Payment Status</label>
                    <select onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900">
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Disputed">Disputed</option>
                    </select>
                  </div>
               </div>
            </>
          )}

          {type === 'boq' && (
             <>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Item Code</label>
                    <input type="text" required onChange={e => setFormData({...formData, itemCode: e.target.value})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900 uppercase" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Unit</label>
                    <input type="text" required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900 uppercase" />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Description</label>
                  <textarea required onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900 uppercase h-24 resize-none" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Executed Quantity</label>
                    <input type="number" step="0.01" required onChange={e => setFormData({...formData, executedQuantity: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Planned Quantity</label>
                    <input type="number" step="0.01" required onChange={e => setFormData({...formData, plannedQuantity: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900" />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Unit Rate ($)</label>
                  <input type="number" step="0.01" required onChange={e => setFormData({...formData, unitRate: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900" />
               </div>
             </>
          )}

          {type === 'procurement' && (
             <>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Item Description</label>
                  <input type="text" required onChange={e => setFormData({...formData, item: e.target.value})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900 uppercase" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Quantity</label>
                    <input type="number" required onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Urgency</label>
                    <select onChange={e => setFormData({...formData, urgency: e.target.value})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900">
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Requested By</label>
                  <input type="text" required onChange={e => setFormData({...formData, requestedBy: e.target.value})} className="w-full border-2 border-slate-200 p-4 font-bold outline-none focus:border-slate-900 uppercase" />
               </div>
             </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 font-black uppercase text-xs tracking-widest shadow-[12px_12px_0px_#f59e0b] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing Protocol...' : 'Authorize Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
