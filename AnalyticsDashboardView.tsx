import * as React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, 
  Target, DollarSign, Calendar, Plus, ChevronRight, BarChart2 
} from 'lucide-react';

export function AnalyticsDashboardView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    const unsubTasks = onSnapshot(collection(db, 'projectTasks'), snap => setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubBudgets = onSnapshot(collection(db, 'budgets'), snap => setBudgets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubReports = onSnapshot(query(collection(db, 'dailyReports'), orderBy('date', 'desc'), limit(30)), snap => setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => {
      unsubTasks();
      unsubBudgets();
      unsubReports();
    };
  }, []);

  // Completion Stats
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length || 1;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  // Delayed Tasks
  const delayedTasks = tasks.filter(t => t.status === 'Delayed');
  
  // Cost Overruns
  const costAlerts = budgets.filter(b => b.actual > b.allocated);

  // Productivity Data (Report counts over last few dates)
  const reportDates: {[key: string]: number} = {};
  reports.forEach(r => {
    if (r.date) reportDates[r.date] = (reportDates[r.date] || 0) + 1;
  });
  const productivityData = Object.entries(reportDates)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Remaining', value: Math.max(0, tasks.length - completedTasks) }
  ];
  const COLORS = ['#10b981', '#e2e8f0'];

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 lg:p-12 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12 pointer-events-none">
          <BarChart2 size={300} />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-2">Operational Intelligence</h2>
            <p className="text-amber-500 font-bold uppercase text-[10px] tracking-[0.4em]">Real-time heavy construction analytics</p>
          </div>
          <button 
            onClick={() => setShowTaskModal(true)}
            className="group flex items-center gap-3 bg-amber-500 text-slate-900 px-6 py-3 font-black uppercase text-xs tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_#fff] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none transition-all"
          >
            <Plus size={18} />
            Assign High-Level Task
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto no-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
          
          {/* Top Row Stats */}
          <div className="col-span-12 lg:col-span-4 bg-white border-4 border-slate-900 p-8 shadow-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Target size={14} className="text-amber-500" />
              Project Completion
            </h3>
            <div className="flex items-center justify-between">
              <div className="h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{completionPercentage}%</p>
                <p className="text-[10px] font-black uppercase text-emerald-600">Archive Rate Validated</p>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 bg-white border-4 border-slate-900 p-8 shadow-xl overflow-hidden">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" />
              Daily Productivity velocity
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '0px', border: '2px solid #0f172a', textTransform: 'uppercase', fontSize: '9px', fontWeight: '900' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Delayed Tasks Identification */}
          <div className="col-span-12 lg:col-span-7 bg-white border-4 border-slate-900 p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} className="text-red-500" />
                Critical Delay Watch
              </h3>
              <span className="bg-red-600 text-white px-3 py-1 font-black text-[9px] uppercase tracking-widest">{delayedTasks.length} Alerts</span>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {delayedTasks.length === 0 ? (
                <div className="py-12 text-center text-slate-300">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="font-black uppercase text-[10px] tracking-widest italic">No delays identified in current workflow</p>
                </div>
              ) : (
                delayedTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 hover:border-red-500 transition-colors">
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-xs mb-1">{task.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Target: {task.endDate} • Assigned to {task.assignedTo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-black text-xs uppercase">Delayed</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{task.progress}% STALLED</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cost Alerts */}
          <div className="col-span-12 lg:col-span-5 bg-white border-4 border-slate-900 p-8 shadow-xl">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <DollarSign size={14} className="text-red-500" />
                Cost Overrun Risk
             </h3>

             <div className="space-y-6">
                {costAlerts.map(b => (
                  <div key={b.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-slate-900 uppercase text-[10px]">{b.name}</span>
                      <span className="text-red-600 font-black text-[10px] uppercase">+${(b.actual - b.allocated).toLocaleString()} Variance</span>
                    </div>
                    <div className="h-3 bg-red-100 border border-slate-200 overflow-hidden">
                      <div className="h-full bg-red-600" style={{ width: '100%' }} />
                    </div>
                  </div>
                ))}
                {costAlerts.length === 0 && (
                  <div className="py-12 border-2 border-dotted border-slate-200 flex flex-col items-center justify-center">
                    <CheckCircle className="text-emerald-500 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase italic">Expenditure within tolerances</p>
                  </div>
                )}
             </div>

             <div className="mt-12 pt-8 border-t-2 border-slate-100">
               <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-200">
                 <AlertTriangle size={20} className="text-amber-600" />
                 <p className="text-[10px] text-amber-700 font-bold uppercase leading-tight">System identifies potential procurement bottlenecks in the next 14 business days.</p>
               </div>
             </div>
          </div>

        </div>
      </div>

      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} />}
    </div>
  );
}

function TaskModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Todo',
    progress: 0,
    assignedTo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'projectTasks'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error assigning task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
      <div className="bg-white w-full max-w-lg border-4 border-slate-900 shadow-[20px_20px_0px_#000] overflow-hidden">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tighter">Site Task Authorization</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors uppercase font-black text-xs">EXIT</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Task Identification</label>
            <input type="text" required placeholder="E.G. SEGMENT 4 ASPHALT LAYING" onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-2 border-slate-200 p-3 text-xs font-bold uppercase outline-none focus:border-slate-900" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Target End Date</label>
              <input type="date" required onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border-2 border-slate-200 p-3 text-xs font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Current Status</label>
              <select onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border-2 border-slate-200 p-3 text-xs font-bold">
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Initial Velocity (%)</label>
            <input type="number" min="0" max="100" required onChange={e => setFormData({...formData, progress: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-3 text-xs font-bold" />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Site Responsible Personnel</label>
            <input type="text" required placeholder="E.G. ENG. NAHOM" onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="w-full border-2 border-slate-200 p-3 text-xs font-bold uppercase outline-none focus:border-slate-900" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_#f59e0b] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? 'Transmitting Data...' : 'Commit to Site Schedule'}
          </button>
        </form>
      </div>
    </div>
  );
}
