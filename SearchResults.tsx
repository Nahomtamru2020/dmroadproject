import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export function SearchResults({ query: searchQuery }: { query: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docSnapD = await getDocs(query(collection(db, 'documents')));
        const docSnapR = await getDocs(query(collection(db, 'dailyReports')));
        
        const allData = [
          ...docSnapD.docs.map(d => ({ id: d.id, ...d.data(), type: 'Document' })),
          ...docSnapR.docs.map(d => ({ id: d.id, ...d.data(), type: 'Report' }))
        ];
        
        const filtered = allData.filter((d: any) => 
          d.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.authorRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.author?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setResults(filtered);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  if (loading) return <div className="p-10 text-center text-slate-500">Searching...</div>;

  return (
    <div className="col-span-12 p-5 bg-white shadow-sm border border-slate-200">
      <h2 className="text-xs font-bold text-slate-500 uppercase mb-4">Search Results for "{searchQuery}"</h2>
      <div className="space-y-2">
        {results.length === 0 && <p className="text-sm text-slate-500">No results found.</p>}
        {results.map(item => (
          <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-sm">
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded uppercase tracking-wider">{item.type}</span>
            <p className="text-xs font-bold mt-1 text-sky-600">{item.date || 'No Date'}</p>
            <p className="text-sm text-slate-800">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
