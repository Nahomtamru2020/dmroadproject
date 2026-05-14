import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Approximate coordinates for the Debre Markos - Digotsion - Mota road project
const PROJECT_CENTER = { lat: 10.33, lng: 37.73 };

export function MapGISView() {
  const [gpsLogs, setGpsLogs] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ type: 'log' | 'delivery', data: any } | null>(null);
  const [isAdding, setIsAdding] = useState<{ lat: number, lng: number } | null>(null);
  const [newType, setNewType] = useState<'log' | 'delivery'>('log');
  const [formData, setFormData] = useState({ segmentName: '', status: 'Planned', materialType: '', quantity: '' });

  useEffect(() => {
    const qLogs = query(collection(db, 'gpsLogs'));
    const qDeliveries = query(collection(db, 'materialDeliveries'));

    const unsubLogs = onSnapshot(qLogs, (snap) => {
      setGpsLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubDeliveries = onSnapshot(qDeliveries, (snap) => {
      setDeliveries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubLogs();
      unsubDeliveries();
    };
  }, []);

  const handleMapClick = (e: any) => {
    if (e.detail.latLng) {
      setIsAdding(e.detail.latLng);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdding) return;

    try {
      if (newType === 'log') {
        await addDoc(collection(db, 'gpsLogs'), {
          segmentName: formData.segmentName,
          lat: isAdding.lat,
          lng: isAdding.lng,
          status: formData.status,
          timestamp: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'materialDeliveries'), {
          materialType: formData.materialType,
          quantity: formData.quantity,
          lat: isAdding.lat,
          lng: isAdding.lng,
          timestamp: serverTimestamp()
        });
      }
      setIsAdding(null);
      setFormData({ segmentName: '', status: 'Planned', materialType: '', quantity: '' });
    } catch (err) {
      console.error(err);
      alert('Error saving data');
    }
  };

  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)] bg-slate-100 font-sans p-10">
        <div className="max-w-md w-full bg-white p-8 rounded-sm shadow-2xl border-4 border-slate-900">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">GIS Core Unavailable</h2>
          <div className="space-y-4 text-sm text-slate-600 leading-tight">
            <p>Google Maps Platform integration required for spatial tracking.</p>
            <div className="p-4 bg-slate-50 border-l-4 border-amber-500">
                <p className="font-bold text-slate-900 mb-1">Deployment Instructions:</p>
                <ol className="list-decimal ml-4 space-y-1 text-xs">
                    <li>Generate API Key in Google Cloud Console</li>
                    <li>Open <b>Settings</b> → <b>Secrets</b></li>
                    <li>Add <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
                </ol>
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-400">System will initialize automatically upon key detection.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-144px)] lg:h-[calc(100vh-160px)] relative overflow-hidden flex flex-col lg:flex-row bg-slate-50">
      <div className="flex-1 relative border-4 border-slate-900 m-2 lg:m-4 shadow-2xl overflow-hidden">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={PROJECT_CENTER}
            defaultZoom={11}
            mapId="ROAD_PROJECT_MAP"
            onClick={handleMapClick}
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {gpsLogs.map(log => (
              <AdvancedMarker
                key={log.id}
                position={{ lat: log.lat, lng: log.lng }}
                onClick={() => setSelectedItem({ type: 'log', data: log })}
              >
                <Pin 
                  background={log.status === 'Completed' ? '#10b981' : log.status === 'In Progress' ? '#f59e0b' : '#64748b'} 
                  glyphColor="#fff" 
                  borderColor="#000"
                />
              </AdvancedMarker>
            ))}

            {deliveries.map(dev => (
              <AdvancedMarker
                key={dev.id}
                position={{ lat: dev.lat, lng: dev.lng }}
                onClick={() => setSelectedItem({ type: 'delivery', data: dev })}
              >
                <Pin background="#3b82f6" glyphColor="#fff" scale={0.8} />
              </AdvancedMarker>
            ))}

            {selectedItem && (
              <InfoWindow
                position={{ lat: selectedItem.data.lat, lng: selectedItem.data.lng }}
                onCloseClick={() => setSelectedItem(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    {selectedItem.type === 'log' ? 'Road Segment' : 'Material Delivery'}
                  </p>
                  <h3 className="font-black text-slate-900 uppercase">
                    {selectedItem.type === 'log' ? selectedItem.data.segmentName : selectedItem.data.materialType}
                  </h3>
                  {selectedItem.type === 'log' ? (
                    <p className="text-xs mt-1">Status: <span className="font-bold">{selectedItem.data.status}</span></p>
                  ) : (
                    <p className="text-xs mt-1">Qty: <span className="font-bold">{selectedItem.data.quantity}</span></p>
                  )}
                  <p className="text-[9px] text-slate-400 mt-2 font-mono">
                    {selectedItem.data.lat.toFixed(4)}, {selectedItem.data.lng.toFixed(4)}
                  </p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {isAdding && (
          <div className="absolute top-4 left-4 z-10 w-80 bg-white p-6 shadow-2xl border-4 border-slate-900">
            <h3 className="text-sm font-black uppercase text-slate-900 mb-4 tracking-tighter">Log Spatial Data</h3>
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setNewType('log')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest border-2 ${newType === 'log' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-400'}`}
              >
                Segment
              </button>
              <button 
                onClick={() => setNewType('delivery')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest border-2 ${newType === 'delivery' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-400'}`}
              >
                Material
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {newType === 'log' ? (
                <>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Segment Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.segmentName}
                      onChange={e => setFormData({ ...formData, segmentName: e.target.value })}
                      className="w-full border-2 border-slate-900 p-2 text-xs font-bold"
                      placeholder="e.g. KM 45+200 - KM 46+000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Construction Status</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border-2 border-slate-900 p-2 text-xs font-bold"
                    >
                      <option>Planned</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Material Type</label>
                    <input 
                      type="text" 
                      required
                      value={formData.materialType}
                      onChange={e => setFormData({ ...formData, materialType: e.target.value })}
                      className="w-full border-2 border-slate-900 p-2 text-xs font-bold"
                      placeholder="e.g. Sub-base material"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Quantity</label>
                    <input 
                      type="text" 
                      required
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full border-2 border-slate-900 p-2 text-xs font-bold"
                      placeholder="e.g. 450 m3"
                    />
                  </div>
                </>
              )}
              <div className="pt-4 flex gap-2">
                <button type="submit" className="flex-1 bg-amber-500 text-slate-900 py-3 font-black uppercase text-[10px] tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_#000] active:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">Submit Log</button>
                <button type="button" onClick={() => setIsAdding(null)} className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-3 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#ccc] active:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 bg-white border-l-4 border-slate-900 p-6 flex flex-col shadow-2xl overflow-hidden shrink-0">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6 border-b-4 border-amber-500 inline-block w-fit">GIS Feed</h2>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="border-l-4 border-emerald-500 pl-4 py-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Progress</h3>
            <p className="text-sm font-bold text-slate-900">12 Segments Tracked</p>
            <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase">85% Verification Accuracy</p>
          </div>

          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-6">Recent Logs</h4>
             {gpsLogs.concat(deliveries).sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)).slice(0, 10).map((item, idx) => (
               <div key={idx} className="p-3 bg-slate-50 border border-slate-200 text-[11px] hover:border-slate-400 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`px-1.5 py-0.5 rounded-sm font-black uppercase text-[8px] tracking-tighter ${item.materialType ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.materialType ? 'Logistics' : 'Civil'}
                    </span>
                    <span className="text-[9px] font-mono opacity-50">
                      {item.lat.toFixed(3)}, {item.lng.toFixed(3)}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 leading-tight">
                    {item.segmentName || item.materialType}
                  </p>
                  <p className="opacity-60 mt-1">
                    {item.status || item.quantity}
                  </p>
               </div>
             ))}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t-2 border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-snug">Click anywhere on the map to log a new coordinate or delivery drop.</p>
        </div>
      </div>
    </div>
  );
}
