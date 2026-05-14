import * as React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, orderBy, updateDoc, doc } from 'firebase/firestore';
import { ProcurementRequest, PurchaseOrder, Vendor } from '../types';
import { 
  ShoppingBag, Truck, Users, Plus, Star, MapPin, 
  Phone, Mail, FileText, CheckCircle2, Clock, 
  AlertTriangle, ArrowUpRight, Search, Filter 
} from 'lucide-react';

type ProcurementTab = 'requests' | 'orders' | 'vendors';

export function ProcurementView() {
  const [activeTab, setActiveTab] = useState<ProcurementTab>('requests');
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubReqs = onSnapshot(query(collection(db, 'procurementRequests'), orderBy('createdAt', 'desc')), snap => setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubOrders = onSnapshot(query(collection(db, 'purchaseOrders'), orderBy('orderDate', 'desc')), snap => setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubVendors = onSnapshot(collection(db, 'vendors'), snap => setVendors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => {
      unsubReqs();
      unsubOrders();
      unsubVendors();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border-b-8 border-amber-500 p-8 lg:p-12 shadow-2xl shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-amber-500 rounded-none flex items-center justify-center text-slate-900 shadow-[10px_10px_0px_#fff]">
              <Truck size={44} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-2">Supply Chain</h2>
              <p className="text-amber-500 font-bold uppercase text-[10px] tracking-[0.4em]">Procurement Logistics & Vendor Control</p>
            </div>
          </div>
          
          <div className="flex w-full lg:w-auto gap-4">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH INVENTORY..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-700 p-4 pl-12 text-white font-black uppercase text-[10px] tracking-widest outline-none focus:border-amber-500 transition-all"
              />
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-amber-500 text-slate-900 px-8 py-4 font-black uppercase text-xs tracking-widest hover:bg-white hover:shadow-none transition-all flex items-center gap-3 shadow-[6px_6px_0px_#fff]"
            >
              <Plus size={18} />
              New Entry
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 flex flex-wrap gap-4">
          <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon={<ShoppingBag size={16} />} label="Active Requests" count={requests.length} />
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<FileText size={16} />} label="Purchase Orders" count={orders.length} />
          <TabButton active={activeTab === 'vendors'} onClick={() => setActiveTab('vendors')} icon={<Users size={16} />} label="Vendor Registry" count={vendors.length} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto no-scrollbar">
        <div className="max-w-7xl mx-auto pb-20">
          {activeTab === 'requests' && <RequestList requests={requests} searchQuery={searchQuery} />}
          {activeTab === 'orders' && <OrderList orders={orders} searchQuery={searchQuery} />}
          {activeTab === 'vendors' && <VendorGrid vendors={vendors} searchQuery={searchQuery} />}
        </div>
      </div>

      {showModal && <ProcurementModal type={activeTab} onClose={() => setShowModal(false)} vendors={vendors} />}
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count: number }) {
  return (
    <button 
      onClick={onClick}
      className={`group flex items-center gap-4 px-6 py-4 font-black uppercase text-[10px] tracking-widest border-2 transition-all ${active ? 'bg-white text-slate-900 border-white shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}
    >
      <span className={active ? 'text-amber-500' : 'group-hover:text-white'}>{icon}</span>
      {label}
      <span className={`px-2 py-0.5 rounded-full text-[8px] ${active ? 'bg-slate-900 text-white' : 'bg-slate-700 text-slate-400'}`}>
        {count}
      </span>
    </button>
  );
}

const RequestList: React.FC<{ requests: ProcurementRequest[], searchQuery: string }> = ({ requests, searchQuery }) => {
  const filtered = requests.filter(r => r.item?.toUpperCase().includes(searchQuery.toUpperCase()));

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await updateDoc(doc(db, 'procurementRequests', id), { status: nextStatus });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid gap-6">
      {filtered.map(req => (
        <div key={req.id} className="bg-white border-4 border-slate-900 p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[12px_12px_0px_#0f172a] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all group">
          <div className="flex items-center gap-8 flex-1">
            <div className={`w-16 h-16 flex items-center justify-center text-white border-4 border-slate-900 ${req.status === 'Received' ? 'bg-emerald-500' : req.status === 'Ordered' ? 'bg-slate-900' : 'bg-amber-500'}`}>
              {req.status === 'Received' ? <CheckCircle2 size={32} /> : <Clock size={32} />}
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{req.item}</h3>
                {req.urgency === 'Critical' && <span className="bg-red-600 text-white px-3 py-1 font-black text-[8px] uppercase tracking-widest animate-pulse">CRITICAL</span>}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quantity: {req.quantity} • Requested by {req.requestedBy}</p>
            </div>
          </div>

          <div className="flex flex-col lg:items-end gap-2 w-full lg:w-auto">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-2">Status Evolution</p>
             <div className="flex gap-2 w-full lg:w-48 h-3">
               {['Requested', 'Approved', 'Ordered', 'Received'].map((step, idx, arr) => {
                 const currentIdx = arr.indexOf(req.status);
                 return (
                   <div key={step} className={`flex-1 ${idx <= currentIdx ? 'bg-emerald-500' : 'bg-slate-100'}`} title={step} />
                 );
               })}
             </div>
             <div className="mt-4 flex gap-4">
                {req.status === 'Requested' && (
                  <button onClick={() => updateStatus(req.id, 'Approved')} className="bg-slate-900 text-white px-4 py-2 font-black text-[10px] uppercase hover:bg-emerald-600 transition-colors">Approve Request</button>
                )}
                {req.status === 'Approved' && (
                  <button onClick={() => updateStatus(req.id, 'Ordered')} className="bg-slate-900 text-white px-4 py-2 font-black text-[10px] uppercase hover:bg-blue-600 transition-colors">Mark as Ordered</button>
                )}
                {req.status === 'Ordered' && (
                  <button onClick={() => updateStatus(req.id, 'Received')} className="bg-emerald-500 text-white px-4 py-2 font-black text-[10px] uppercase hover:bg-emerald-600 transition-colors">Confirm Receipt</button>
                )}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const OrderList: React.FC<{ orders: PurchaseOrder[], searchQuery: string }> = ({ orders, searchQuery }) => {
  const filtered = orders.filter(o => o.poNumber?.toUpperCase().includes(searchQuery.toUpperCase()) || o.vendorName?.toUpperCase().includes(searchQuery.toUpperCase()));

  return (
    <div className="bg-white border-4 border-slate-900 overflow-hidden shadow-[16px_16px_0px_rgba(15,23,42,0.1)]">
      <table className="w-full text-left">
        <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border-b-4 border-amber-500">
          <tr>
            <th className="p-6">PO Number</th>
            <th className="p-6">Vendor</th>
            <th className="p-6">Issued Date</th>
            <th className="p-6">Amount</th>
            <th className="p-6">Status</th>
            <th className="p-6">Actions</th>
          </tr>
        </thead>
        <tbody className="text-slate-600 font-bold divide-y-2 divide-slate-100">
          {filtered.map(o => (
            <tr key={o.id} className="hover:bg-slate-50 transition-colors">
              <td className="p-6 font-black text-slate-900 uppercase">#{o.poNumber}</td>
              <td className="p-6 text-xs uppercase">{o.vendorName}</td>
              <td className="p-6 text-xs">{o.orderDate}</td>
              <td className="p-6 font-black text-slate-900">${o.totalAmount?.toLocaleString()}</td>
              <td className="p-6">
                <span className={`px-3 py-1 font-black text-[8px] uppercase tracking-widest ${o.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {o.status}
                </span>
              </td>
              <td className="p-6">
                <button className="text-slate-900 hover:text-amber-500 transition-colors">
                  <FileText size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const VendorGrid: React.FC<{ vendors: Vendor[], searchQuery: string }> = ({ vendors, searchQuery }) => {
  const filtered = vendors.filter(v => 
    v.name?.toUpperCase().includes(searchQuery.toUpperCase()) || 
    v.category?.toUpperCase().includes(searchQuery.toUpperCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filtered.map(v => (
        <div key={v.id} className="bg-white border-4 border-slate-900 p-8 shadow-2xl relative group overflow-hidden">
          <div className="absolute top-0 right-0 bg-slate-900 text-amber-500 p-2 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all">
            <Star size={16} fill="currentColor" />
          </div>
          
          <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 block">{v.category}</span>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">{v.name}</h3>
          
          <div className="space-y-3 pt-6 border-t-2 border-slate-50">
             <div className="flex items-center gap-3 text-slate-400">
                <Users size={14} />
                <span className="text-[10px] font-bold uppercase">{v.contactPerson}</span>
             </div>
             <div className="flex items-center gap-3 text-slate-400">
                <Phone size={14} />
                <span className="text-[10px] font-bold uppercase">{v.phone}</span>
             </div>
             <div className="flex items-center gap-3 text-slate-400">
                <Mail size={14} />
                <span className="text-[10px] font-bold uppercase truncate">{v.email}</span>
             </div>
          </div>

          <div className="mt-8">
             <button className="w-full bg-slate-900 text-white py-3 font-black uppercase text-[10px] tracking-widest hover:bg-amber-500 hover:text-slate-900 transition-all">View Active Contracts</button>
          </div>
        </div>
      ))}
    </div>
  );
};

function ProcurementModal({ type, onClose, vendors }: { type: ProcurementTab, onClose: () => void, vendors: Vendor[] }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    status: type === 'requests' ? 'Requested' : type === 'orders' ? 'Draft' : 'Active',
    urgency: 'Normal',
    orderDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const colMap = {
        requests: 'procurementRequests',
        orders: 'purchaseOrders',
        vendors: 'vendors'
      };
      await addDoc(collection(db, colMap[type]), {
        ...formData,
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Transmission Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 z-[500]">
      <div className="bg-white w-full max-w-xl border-8 border-slate-900 shadow-[24px_24px_0px_#f59e0b]">
        <div className="bg-slate-900 text-white p-8 flex justify-between items-center border-b-4 border-amber-500">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Supply Control Entry</h2>
          <button onClick={onClose} className="p-2 bg-amber-500 text-slate-900 hover:bg-white transition-all"><Plus className="rotate-45" size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {type === 'requests' && (
            <>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Material Identification</label>
                  <input type="text" required placeholder="E.G. BITUMEN GRADE 60/70" onChange={e => setFormData({...formData, item: e.target.value})} className="w-full border-4 border-slate-100 p-4 font-black uppercase text-xs outline-none focus:border-slate-900" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Quantity Metric</label>
                    <input type="number" required onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full border-4 border-slate-100 p-4 font-black text-xs outline-none focus:border-slate-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Priority Index</label>
                    <select onChange={e => setFormData({...formData, urgency: e.target.value})} className="w-full border-4 border-slate-100 p-4 font-black uppercase text-xs outline-none focus:border-slate-900">
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Originating Personnel</label>
                  <input type="text" required placeholder="E.G. SITE ENG. ABEL" onChange={e => setFormData({...formData, requestedBy: e.target.value})} className="w-full border-4 border-slate-100 p-4 font-black uppercase text-xs outline-none focus:border-slate-900" />
               </div>
            </>
          )}

          {type === 'orders' && (
            <>
               <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">PO Identifier</label>
                    <input type="text" required placeholder="PO-2024-001" onChange={e => setFormData({...formData, poNumber: e.target.value})} className="w-full border-4 border-slate-100 p-4 font-black uppercase text-xs focus:border-slate-900 outline-none" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Contractor Selection</label>
                    <select required onChange={e => {
                      const v = vendors.find(vend => vend.id === e.target.value);
                      setFormData({...formData, vendorId: e.target.value, vendorName: v?.name});
                    }} className="w-full border-4 border-slate-100 p-4 font-black uppercase text-xs focus:border-slate-900 outline-none">
                      <option value="">Select Vendor</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Total Valuation ($)</label>
                    <input type="number" required onChange={e => setFormData({...formData, totalAmount: Number(e.target.value)})} className="w-full border-4 border-slate-100 p-4 font-black text-xs outline-none focus:border-slate-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Expected Delivery</label>
                    <input type="date" required onChange={e => setFormData({...formData, expectedDeliveryDate: e.target.value})} className="w-full border-4 border-slate-100 p-4 font-black text-xs outline-none focus:border-slate-900" />
                  </div>
               </div>
            </>
          )}

          {type === 'vendors' && (
            <>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Vendor Legal Name</label>
                  <input type="text" required placeholder="E.G. TOTAL ENERGY SOLUTIONS" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-4 border-slate-100 p-4 font-black uppercase text-xs outline-none focus:border-slate-900" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Service Category</label>
                    <select onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border-4 border-slate-100 p-4 font-black uppercase text-xs outline-none focus:border-slate-900">
                      <option value="Aggregates">Aggregates</option>
                      <option value="Fuel">Fuel</option>
                      <option value="Machinery">Machinery</option>
                      <option value="Labor">Labor</option>
                      <option value="Chemicals">Chemicals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Contact Identity</label>
                    <input type="text" required onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full border-4 border-slate-100 p-4 font-black uppercase text-xs outline-none focus:border-slate-900" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Comm channel (Phone)</label>
                    <input type="text" required onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-4 border-slate-100 p-4 font-black text-xs outline-none focus:border-slate-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Comm channel (Email)</label>
                    <input type="email" required onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-4 border-slate-100 p-4 font-black text-xs outline-none focus:border-slate-900" />
                  </div>
               </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 font-black uppercase text-sm tracking-[0.3em] shadow-[12px_12px_0px_#f59e0b] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? 'Transmitting Data...' : 'Authorize Supply Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
