import * as React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { FileText, Search, Filter, Plus, Download, Tag, Calendar, User } from 'lucide-react';

const CATEGORIES = ["Drawings", "Contracts", "Environmental", "Site Instructions", "Other"];

export function DocumentCenterView() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'documents'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setDocuments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b-4 border-slate-900 p-6 lg:p-10 shadow-xl shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Document Center</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Controlled Project Documentation Arrive</p>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="w-full lg:w-auto bg-slate-900 text-white px-8 py-4 font-black uppercase text-xs tracking-widest border-b-4 border-amber-500 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <Plus size={18} className="text-amber-500" />
              Register New Document
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="SEARCH BY TITLE OR CONTENT..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 outline-none font-bold text-xs uppercase tracking-wider transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-4 font-black uppercase text-[10px] tracking-widest border-2 transition-all whitespace-nowrap ${!selectedCategory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
              >
                All Files
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-4 font-black uppercase text-[10px] tracking-widest border-2 transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-amber-500 text-slate-900 border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-300">
              <FileText size={80} strokeWidth={1} className="mb-6 opacity-20" />
              <p className="font-black uppercase tracking-widest text-sm">No documents found in this archive</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredDocs.map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showUploadModal && <UploadDocModal onClose={() => setShowUploadModal(false)} />}
    </div>
  );
}

const DocumentCard: React.FC<{ doc: any }> = ({ doc }) => {
  return (
    <div className="bg-white border-l-8 border-slate-900 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <FileText size={100} strokeWidth={3} className="text-slate-900" />
      </div>
      
      <div className="p-6 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-amber-500 text-slate-900 font-black uppercase text-[8px] tracking-widest shadow-sm">
            {doc.category || 'Other'}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">#{doc.id.slice(0, 6)}</span>
        </div>
        
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3 leading-tight group-hover:text-amber-600 transition-colors">
          {doc.title}
        </h3>
        
        <p className="text-slate-600 text-xs font-medium mb-6 line-clamp-3 leading-relaxed">
          {doc.description || 'No description provided for this documentation entry.'}
        </p>

        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">{doc.date}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <User size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">{doc.authorRole || 'System'}</span>
          </div>
        </div>
      </div>

      <a 
        href={doc.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-auto bg-slate-50 border-t border-slate-100 p-4 font-black uppercase text-[10px] tracking-widest text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-between"
      >
        <span>View Documentation</span>
        <Download size={14} />
      </a>
    </div>
  );
}

function UploadDocModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Drawings',
    description: '',
    date: new Date().toISOString().split('T')[0],
    url: '',
    authorRole: 'Site Engineer'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'documents'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error uploading document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
      <div className="bg-white w-full max-w-xl border-4 border-slate-900 shadow-[24px_24px_0px_rgba(15,23,42,0.1)] overflow-hidden">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Document Registry</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors uppercase font-black text-xs">Close</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Document Title</label>
              <input 
                type="text" 
                required 
                className="w-full border-2 border-slate-200 p-3 text-sm font-bold uppercase focus:border-slate-900 transition-all outline-none" 
                placeholder="E.G. BRIDGE CROSSING SECTION A-A"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Category</label>
              <select 
                required 
                className="w-full border-2 border-slate-200 p-3 text-sm font-bold focus:border-slate-900 transition-all outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Issue Date</label>
              <input 
                type="date" 
                required 
                className="w-full border-2 border-slate-200 p-3 text-sm font-bold focus:border-slate-900 transition-all outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Description</label>
              <textarea 
                required 
                rows={3}
                className="w-full border-2 border-slate-200 p-3 text-sm font-bold focus:border-slate-900 transition-all outline-none resize-none" 
                placeholder="ENTER DOCUMENT PURPOSE AND KEY DETAILS..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">External URL / Storage Path</label>
              <input 
                type="url" 
                required 
                className="w-full border-2 border-slate-200 p-3 text-sm font-bold focus:border-slate-900 transition-all outline-none" 
                placeholder="HTTPS://DRIVE.GOOGLE.COM/..."
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-500 text-slate-900 py-5 font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 border-2 border-slate-900"
          >
            {loading ? 'Processing Registry...' : 'Authorize and Archive'}
          </button>
        </form>
      </div>
    </div>
  );
}
